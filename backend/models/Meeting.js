const mongoose = require('mongoose');

const MeetingSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  teacherId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  purpose: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'rescheduled', 'completed'],
    default: 'pending'
  },
  notes: { type: String, default: '' },
  meetingLink: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Meeting', MeetingSchema);