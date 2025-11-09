const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Meeting = require('../models/MeetingOnline'); // ✅ Use shared model (no duplicate schema)

/* ============================================================
   ✅ CREATE MEETING — Teacher only
============================================================ */
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher')
      return res.status(403).json({ message: 'Only teachers can create meetings' });

    const { title, description, subject, date, link } = req.body;

    const meeting = new Meeting({
      title,
      description,
      subject,
      date: new Date(date),
      link,
      teacherId: req.user.id
    });
    await meeting.save();
    await meeting.populate('teacherId', 'name email');

    // ✅ Notify all students about the new meeting
    const students = await User.find({ role: 'student' });
    const notifications = students.map(student => ({
      recipient: student._id,
      sender: req.user.id,
      type: 'meeting_scheduled', // ✅ updated type
      title: 'New Meeting Scheduled',
      message: `${req.user.name} scheduled "${title}" on ${new Date(date).toLocaleString()}`,
      relatedEntity: { entityType: 'meeting', entityId: meeting._id }
    }));

    await Notification.insertMany(notifications);

    // ✅ Emit notification in real time
    const io = req.app.get('io');
    students.forEach(s =>
      io.to(s._id.toString()).emit('new-notification', {
        ...notifications[0],
        _id: new mongoose.Types.ObjectId()
      })
    );

    res.status(201).json(meeting);
  } catch (err) {
    console.error('Create meeting error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ============================================================
   🗑️ DELETE MEETING — Teacher only
============================================================ */
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher')
      return res.status(403).json({ message: 'Only teachers can delete meetings' });

    const meeting = await Meeting.findOneAndDelete({
      _id: req.params.id,
      teacherId: req.user.id
    });

    if (!meeting)
      return res.status(404).json({ message: 'Meeting not found or not yours' });

    res.json({ message: 'Meeting deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting meeting', error: err.message });
  }
});

/* ============================================================
   ✅ GET MEETINGS — for Students (all upcoming)
============================================================ */
router.get('/student', auth, async (req, res) => {
  try {
    const meetings = await Meeting.find({ date: { $gte: new Date() } })
      .populate('teacherId', 'name email subject')
      .sort({ date: 1 });

    res.json(meetings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching meetings', error: err.message });
  }
});

/* ============================================================
   ✅ GET MEETINGS — for Teachers (their own)
============================================================ */
router.get('/teacher', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher')
      return res.status(403).json({ message: 'Access denied' });

    const meetings = await Meeting.find({ teacherId: req.user.id }).sort({ date: -1 });
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching meetings', error: err.message });
  }
});

module.exports = router;
