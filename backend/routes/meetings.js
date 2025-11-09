const express = require('express');
const Meeting = require('../models/Meeting');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Create a meeting request
router.post('/', auth, async (req, res) => {
  try {
    const { teacherId, date, time, purpose } = req.body;

    // Check if teacher exists
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const meeting = new Meeting({
      studentId: req.user.id,
      teacherId,
      date,
      time,
      purpose,
      status: 'pending'
    });

    await meeting.save();

    // Populate student and teacher details for response
    await meeting.populate('studentId', 'name email');
    await meeting.populate('teacherId', 'name email subject');

    res.status(201).json(meeting);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get meetings for student
router.get('/student', auth, async (req, res) => {
  try {
    const meetings = await Meeting.find({ studentId: req.user.id })
      .populate('teacherId', 'name email subject cabinNumber')
      .sort({ createdAt: -1 });

    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get meetings for teacher
router.get('/teacher', auth, async (req, res) => {
  try {
    const meetings = await Meeting.find({ teacherId: req.user.id })
      .populate('studentId', 'name email enrollmentId department')
      .sort({ createdAt: -1 });

    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update meeting status (approve/reject)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Check if user is the teacher for this meeting
    if (meeting.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    meeting.status = status;
    await meeting.save();

    await meeting.populate('studentId', 'name email');
    await meeting.populate('teacherId', 'name email subject');

    res.json(meeting);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;