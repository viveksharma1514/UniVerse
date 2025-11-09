// models/MeetingOnline.js
const mongoose = require('mongoose');

const MeetingOnlineSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  subject: String,
  date: { type: Date, required: true },
  link: { type: String, required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('MeetingOnline', MeetingOnlineSchema);
