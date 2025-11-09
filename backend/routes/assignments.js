const express = require('express');
const mongoose = require('mongoose');
const Assignment = require('../models/Assignment');
const Notification = require('../models/Notification');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { uploadSubmission, uploadMaterial } = require('../config/multerConfig');

const router = express.Router();

/* ================================================================
   🔔 Helper: Send notification + emit real-time event
================================================================ */
const sendNotification = async (req, { recipientId, senderId, type, title, message, relatedEntity, priority = 'medium' }) => {
  try {
    const notification = new Notification({
      recipient: recipientId,
      sender: senderId,
      type,
      title,
      message,
      relatedEntity,
      priority,
      isRead: false,
      createdAt: new Date(),
    });

    await notification.save();

    const io = req.app.get('io');
    io.to(recipientId.toString()).emit('new-notification', notification);

    console.log(`📡 Notification sent to ${recipientId}: ${title}`);
  } catch (error) {
    console.error('Notification error:', error.message);
  }
};

/* ================================================================
   ✅ CREATE ASSIGNMENT (Teacher only)
================================================================ */
router.post('/', auth, uploadMaterial.array('materials', 10), async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can create assignments' });
    }

    const { title, description, subject, dueDate, maxMarks } = req.body;

    const materials = req.files
      ? req.files.map(file => ({
          filename: file.filename,
          originalName: file.originalname,
          path: file.path,
          size: file.size,
          mimetype: file.mimetype,
        }))
      : [];

    const assignment = new Assignment({
      title,
      description,
      teacherId: req.user.id,
      teacherName: req.user.name,
      subject,
      dueDate,
      maxMarks: parseInt(maxMarks),
      materials,
    });

    await assignment.save();
    await assignment.populate('teacherId', 'name email');

    // 🔔 Notify all students
    const students = await User.find({ role: 'student' }).select('_id name');

    if (students.length === 0) {
      console.log('⚠️ No students found to notify');
    } else {
      for (const student of students) {
        await sendNotification(req, {
          recipientId: student._id,
          senderId: req.user.id,
          type: 'new_assignment',
          title: 'New Assignment Posted',
          message: `${req.user.name} posted a new assignment: ${assignment.title}. Due: ${new Date(
            assignment.dueDate
          ).toLocaleDateString()}`,
          relatedEntity: { entityType: 'assignment', entityId: assignment._id },
          priority: 'high',
        });
      }
    }

    res.status(201).json(assignment);
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/* ================================================================
   ✅ GET ASSIGNMENTS — Student
================================================================ */
router.get('/student', auth, async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate('teacherId', 'name email subject')
      .sort({ createdAt: -1 });

    const assignmentsWithStatus = assignments.map(assignment => {
      const submission = assignment.submissions.find(
        sub => sub.studentId && sub.studentId.toString() === req.user.id
      );

      const studentSubmission = submission
        ? {
            submittedAt: submission.submittedAt,
            marks: submission.marks,
            feedback: submission.feedback,
            files: submission.files,
            notes: submission.notes,
          }
        : null;

      return {
        ...assignment.toObject(),
        submissionStatus: submission ? 'submitted' : 'pending',
        studentSubmission,
      };
    });

    res.json(assignmentsWithStatus);
  } catch (error) {
    console.error('Get student assignments error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/* ================================================================
   ✅ GET ASSIGNMENTS — Teacher
================================================================ */
router.get('/teacher', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const assignments = await Assignment.find({ teacherId: req.user.id })
      .populate('submissions.studentId', 'name email enrollmentId')
      .sort({ createdAt: -1 });

    res.json(assignments);
  } catch (error) {
    console.error('Get teacher assignments error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/* ================================================================
   ✅ SUBMIT ASSIGNMENT (Student only)
================================================================ */
router.post(
  '/:id/submit',
  auth,
  (req, res, next) => {
    uploadSubmission.array('files', 10)(req, res, err => {
      if (err) return res.status(400).json({ message: `File upload failed: ${err.message}` });
      next();
    });
  },
  async (req, res) => {
    try {
      if (req.user.role !== 'student') {
        return res.status(403).json({ message: 'Only students can submit assignments' });
      }

      const assignment = await Assignment.findById(req.params.id);
      if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

      if (!req.files || req.files.length === 0)
        return res.status(400).json({ message: 'No files uploaded' });

      const files = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
      }));

      assignment.submissions = assignment.submissions.filter(
        sub => sub.studentId.toString() !== req.user.id
      );

      const newSubmission = {
        studentId: req.user.id,
        studentName: req.user.name,
        files,
        notes: req.body.notes || '',
        submittedAt: new Date(),
      };

      assignment.submissions.push(newSubmission);
      await assignment.save();

      // 🔔 Notify teacher
      await sendNotification(req, {
        recipientId: assignment.teacherId,
        senderId: req.user.id,
        type: 'submission_received',
        title: 'Assignment Submitted',
        message: `${req.user.name} submitted assignment: ${assignment.title}`,
        relatedEntity: { entityType: 'assignment', entityId: assignment._id },
      });

      res.json({
        message: 'Assignment submitted successfully',
        submission: newSubmission,
      });
    } catch (error) {
      console.error('Assignment submission error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

/* ================================================================
   ✅ GRADE ASSIGNMENT (Teacher only)
================================================================ */
router.put('/:assignmentId/grade/:studentId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { assignmentId, studentId } = req.params;
    const { marks, feedback } = req.body;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    if (assignment.teacherId.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });

    const submission = assignment.submissions.find(
      sub => sub.studentId.toString() === studentId
    );
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    submission.marks = parseInt(marks);
    submission.feedback = feedback;
    submission.gradedAt = new Date();

    await assignment.save();

    // 🔔 Notify student
    await sendNotification(req, {
      recipientId: submission.studentId,
      senderId: req.user.id,
      type: 'assignment_graded',
      title: 'Assignment Graded',
      message: `${req.user.name} graded your assignment: ${assignment.title}. Marks: ${marks}`,
      relatedEntity: { entityType: 'assignment', entityId: assignment._id },
    });

    res.json({
      message: 'Submission graded successfully',
      submission,
    });
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/* ================================================================
   ✅ GET SINGLE ASSIGNMENT (with submissions)
================================================================ */
router.get('/:id', auth, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('teacherId', 'name email subject')
      .populate('submissions.studentId', 'name email enrollmentId');

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json(assignment);
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
