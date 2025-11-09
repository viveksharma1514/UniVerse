const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true },
    day: { type: String, required: true },
    time: { type: String, required: true },
    room: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Schedule", scheduleSchema);
