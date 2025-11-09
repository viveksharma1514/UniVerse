const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

/* ================================================================
   ✅ GET all notifications for the logged-in user
================================================================ */
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate('sender', 'name role')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error.message);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

/* ================================================================
   ✅ GET unread notification count
================================================================ */
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false,
    });
    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error.message);
    res.status(500).json({ message: 'Error fetching unread count' });
  }
});

/* ================================================================
   ✅ MARK single notification as read — emit socket update
================================================================ */
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Emit live update to this user (for real-time UI sync)
    const io = req.app.get('io');
    io.to(req.user.id.toString()).emit('notification-updated', notification);

    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error.message);
    res.status(500).json({ message: 'Error marking notification as read' });
  }
});

/* ================================================================
   ✅ MARK all notifications as read — emit socket update
================================================================ */
router.patch('/mark-all-read', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true }
    );

    // Emit global update to user's socket
    const io = req.app.get('io');
    io.to(req.user.id.toString()).emit('all-notifications-read');

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error.message);
    res.status(500).json({ message: 'Error marking all as read' });
  }
});

/* ================================================================
   ✅ DELETE notification — emit socket update
================================================================ */
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user.id,
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Emit event to remove it from UI instantly
    const io = req.app.get('io');
    io.to(req.user.id.toString()).emit('notification-deleted', notification._id);

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error.message);
    res.status(500).json({ message: 'Error deleting notification' });
  }
});
/* ================================================================
   ✅ CREATE notifications when a teacher schedules a class
================================================================ */
router.post('/schedule-class', auth, async (req, res) => {
  try {
    // Teacher info from auth
    const teacher = req.user;

    // Data from frontend request
    const { date, time, subject, department } = req.body;

    // 🧠 Find all students in that department
    const User = require('../models/User');
    const students = await User.find({ role: 'student', department });

    if (students.length === 0) {
      return res.status(404).json({ message: 'No students found for this department' });
    }

    // 📨 Create notifications for each student
    const notifications = students.map(student => ({
      recipient: student._id,
      sender: teacher._id,
      type: 'meeting_scheduled',
      title: '📅 New Class Scheduled',
      message: `${teacher.name} scheduled a ${subject} class on ${date} at ${time}.`,
      relatedEntity: {
        entityType: 'meeting',
        entityId: null, // you can pass schedule ID if you have one
      },
      priority: 'medium',
    }));

    const created = await Notification.insertMany(notifications);

    // ✅ Emit to students’ sockets for live notification updates
    const io = req.app.get('io');
    students.forEach(student => {
      io.to(student._id.toString()).emit('new-notification', {
        title: '📅 New Class Scheduled',
        message: `${teacher.name} scheduled a ${subject} class on ${date} at ${time}.`,
        type: 'meeting_scheduled',
      });
    });

    res.status(201).json({ success: true, count: created.length });
  } catch (error) {
    console.error('Error creating schedule notifications:', error.message);
    res.status(500).json({ message: 'Error creating schedule notifications' });
  }
});


module.exports = router;
