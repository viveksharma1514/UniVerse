const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');
const User = require('../models/User');

const AttendanceSchema = new mongoose.Schema({
  meetingId: { type: mongoose.Schema.Types.ObjectId, ref: 'MeetingOnline' },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  joinedAt: { type: Date, default: Date.now },
});

const AttendanceOnline = mongoose.model('AttendanceOnline', AttendanceSchema);

/* ============================================================
   ✅ MARK ATTENDANCE — when student joins a meeting
============================================================ */
router.post('/:meetingId/join', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student')
      return res.status(403).json({ message: 'Only students can join meetings' });

    const { meetingId } = req.params;

    // Prevent duplicate attendance
    const existing = await AttendanceOnline.findOne({
      meetingId,
      studentId: req.user.id,
    });
    if (existing)
      return res.status(200).json({ message: 'Already marked present' });

    // Record attendance
    const attendance = new AttendanceOnline({
      meetingId,
      studentId: req.user.id,
    });
    await attendance.save();

    // Notify teacher
    const meeting = await mongoose.model('MeetingOnline').findById(meetingId).populate('teacherId');
    if (meeting && meeting.teacherId) {
      const notification = new Notification({
        recipient: meeting.teacherId._id,
        sender: req.user.id,
        type: 'attendance_join',
        title: 'Student Joined Meeting',
        message: `${req.user.name} joined your meeting: "${meeting.title}"`,
        relatedEntity: { entityType: 'meeting', entityId: meeting._id },
      });

      await notification.save();

      // Emit real-time update
      const io = req.app.get('io');
      io.to(meeting.teacherId._id.toString()).emit('new-notification', notification);
    }

    res.json({ message: 'Attendance marked successfully', attendance });
  } catch (err) {
    console.error('Attendance mark error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ============================================================
   ✅ GET ATTENDANCE RECORD — for a meeting (Teacher view)
============================================================ */
router.get('/:meetingId', auth, async (req, res) => {
  try {
    const meeting = await mongoose.model('MeetingOnline').findById(req.params.meetingId);

    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
    if (meeting.teacherId.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });

    const attendanceList = await AttendanceOnline.find({ meetingId: req.params.meetingId })
      .populate('studentId', 'name email enrollmentId');

    res.json(attendanceList);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching attendance', error: err.message });
  }
});

module.exports = router;
