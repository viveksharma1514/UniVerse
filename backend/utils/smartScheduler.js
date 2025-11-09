// utils/smartScheduler.js
const cron = require('node-cron');
const mongoose = require('mongoose');

const Notification = require('../models/Notification');
const User = require('../models/User');
const Meeting = require('../models/MeetingOnline');
const Assignment = require('../models/Assignment');

/**
 * Utility: create + emit notification safely (avoid duplicates)
 */
async function createAndEmitNotification(io, opts) {
  try {
    const { recipient, sender, type, title, message, relatedEntity } = opts;

    // Avoid duplicates within 24h
    const exists = await Notification.findOne({
      recipient,
      type,
      'relatedEntity.entityType': relatedEntity?.entityType,
      'relatedEntity.entityId': relatedEntity?.entityId,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    if (exists) return null;

    const notif = new Notification({
      recipient,
      sender,
      type,
      title,
      message,
      relatedEntity,
    });

    await notif.save();
    await notif.populate('sender', 'name role');

    // Emit via socket
    if (io) io.to(recipient.toString()).emit('new-notification', notif);

    return notif;
  } catch (err) {
    console.error('❌ createAndEmitNotification error:', err.message);
  }
}

/**
 * 🧠 Smart Scheduler — Automated Reminders
 * Runs periodically to send smart alerts to users
 */
function startSmartScheduler(app) {
  const io = app.get('io');

  console.log('🕒 Smart Scheduler initialized (runs every 15 minutes)...');

  // Run every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    try {
      const now = new Date();
      console.log('⏰ Smart Scheduler running checks at', now.toLocaleTimeString());

      /** ==============================
       🔔 Meeting Reminders (30 mins before)
      =============================== */
      const meetings = await Meeting.find({
        date: { $gte: new Date(now.getTime() + 5 * 60 * 1000), $lte: new Date(now.getTime() + 35 * 60 * 1000) },
      }).populate('teacherId', 'name');

      if (meetings.length > 0) {
        const students = await User.find({ role: 'student' }).select('_id name');
        for (const meeting of meetings) {
          for (const s of students) {
            await createAndEmitNotification(io, {
              recipient: s._id,
              sender: meeting.teacherId?._id,
              type: 'meeting_reminder',
              title: `Meeting Reminder: ${meeting.title}`,
              message: `Your meeting "${meeting.title}" starts soon at ${new Date(meeting.date).toLocaleTimeString()}.`,
              relatedEntity: { entityType: 'meeting', entityId: meeting._id },
            });
          }
        }
      }

      /** ==============================
       📘 Assignment Due Tomorrow
      =============================== */
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(tomorrow.getDate() + 1);

      const assignments = await Assignment.find({
        dueDate: { $gte: tomorrow, $lt: dayAfterTomorrow },
      }).populate('teacherId', 'name');

      if (assignments.length > 0) {
        const students = await User.find({ role: 'student' }).select('_id name');
        for (const asg of assignments) {
          for (const s of students) {
            await createAndEmitNotification(io, {
              recipient: s._id,
              sender: asg.teacherId?._id,
              type: 'assignment_reminder',
              title: `Assignment Due: ${asg.title}`,
              message: `Your assignment "${asg.title}" is due tomorrow.`,
              relatedEntity: { entityType: 'assignment', entityId: asg._id },
            });
          }
        }
      }

      /** ==============================
       ⚠️ Low Attendance Alert (optional)
      =============================== */
      const students = await User.find({ role: 'student', attendancePercentage: { $lt: 75 } }).select('name');
      for (const s of students) {
        await createAndEmitNotification(io, {
          recipient: s._id,
          sender: null,
          type: 'attendance_alert',
          title: `Low Attendance Warning`,
          message: `Your attendance dropped below 75%. Please attend upcoming classes.`,
          relatedEntity: { entityType: 'attendance', entityId: s._id },
        });
      }

      console.log('✅ Smart reminders sent successfully.');
    } catch (err) {
      console.error('❌ Smart Scheduler error:', err.message);
    }
  });
}

module.exports = { startSmartScheduler };
