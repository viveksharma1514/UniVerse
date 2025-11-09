// controllers/notificationController.js
const Notification = require('../models/Notification');
const User = require('../models/User');

/* ============================================================
   🔔 CREATE NOTIFICATIONS (e.g., when a teacher schedules a class)
============================================================ */
exports.createNotification = async (req, res) => {
  try {
    const { recipientIds, type, title, message, relatedEntity } = req.body;

    if (!recipientIds || recipientIds.length === 0)
      return res.status(400).json({ message: 'Recipients are required' });

    // 1️⃣ Save notifications to MongoDB
    const notifications = await Notification.insertMany(
      recipientIds.map((recipient) => ({
        recipient,
        sender: req.user.id,
        type,
        title,
        message,
        relatedEntity,
      }))
    );

    // 2️⃣ Emit live Socket.io event to each recipient
    const io = req.app.get('io');
    recipientIds.forEach((id) => {
      io.to(id.toString()).emit('new-notification', {
        type,
        title,
        message,
        sender: { id: req.user.id, name: req.user.name, role: req.user.role },
        createdAt: new Date(),
      });
    });

    res.status(201).json({ success: true, notifications });
  } catch (err) {
    console.error('❌ Error creating notification:', err);
    res.status(500).json({ message: 'Server error while creating notification' });
  }
};

/* ============================================================
   📬 GET USER'S NOTIFICATIONS
============================================================ */
exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate('sender', 'name role')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (err) {
    console.error('❌ Error fetching notifications:', err);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

/* ============================================================
   ✅ MARK A NOTIFICATION AS READ
============================================================ */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!notification)
      return res.status(404).json({ message: 'Notification not found' });

    // 🔁 Emit to user's socket for live sync
    const io = req.app.get('io');
    io.to(notification.recipient.toString()).emit('notification-updated', notification);

    res.json(notification);
  } catch (err) {
    console.error('❌ Error marking notification as read:', err);
    res.status(500).json({ message: 'Failed to update notification' });
  }
};
