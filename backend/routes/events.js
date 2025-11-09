const express = require("express");
const Event = require("../models/Event");
const adminAuth = require("../middleware/adminAuth");
const router = express.Router();

// GET all events (Public)
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().populate("createdBy", "name email");
    res.json(events);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ADD new event (Admin only)
router.post("/", adminAuth, async (req, res) => {
  try {
    const event = new Event({ ...req.body, createdBy: req.admin._id });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// DELETE event (Admin only)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ msg: "Event not found" });
    res.json({ msg: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
