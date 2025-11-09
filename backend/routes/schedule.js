// routes/schedule.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Schedule = require("../models/Schedule");
const User = require("../models/User");
const { createNotification } = require("../controllers/notificationController");

/* ============================================================
   ✅ Add a new class (Teacher only)
============================================================ */
router.post("/teacher", auth, async (req, res) => {
  try {
    const { subject, time, day, room } = req.body;

    if (!subject || !time || !day)
      return res.status(400).json({ message: "Subject, day, and time are required" });

    // Save new class schedule in DB
    const newClass = await Schedule.create({
      teacher: req.user.id,
      subject,
      time,
      day,
      room,
    });

    // 🔍 Find all students (can be filtered by dept later)
    const students = await User.find({ role: "student" }).select("_id");
    const recipientIds = students.map((s) => s._id);

    // 🔔 Create notifications for all students
    const notificationReq = {
      body: {
        recipientIds,
        type: "meeting_scheduled",
        title: "New Class Scheduled",
        message: `${req.user.name} scheduled a ${subject} class on ${day} at ${time}${room ? ` in Room ${room}` : ""}.`,
        relatedEntity: { entityType: "schedule", entityId: newClass._id },
      },
      user: req.user,
      app: req.app,
    };

    await createNotification(notificationReq, res);

    res.status(201).json({
      message: "Class added and notifications sent!",
      schedule: newClass,
    });
  } catch (error) {
    console.error("❌ Error adding class:", error);
    res.status(500).json({ message: "Server error adding class" });
  }
});

/* ============================================================
   ✅ Get all classes by teacher
============================================================ */
router.get("/teacher", auth, async (req, res) => {
  try {
    const classes = await Schedule.find({ teacher: req.user.id }).sort({ day: 1 });
    res.json(classes);
  } catch (error) {
    console.error("❌ Error fetching classes:", error);
    res.status(500).json({ message: "Error fetching schedule" });
  }
});

module.exports = router;
