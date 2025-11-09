const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  status: { type: String, enum: ['present', 'absent', 'leave'], required: true }
});

const studentAttendanceSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: false // Changed to false for mock data
  },
  studentName: { type: String, required: true },
  rollNo: { type: Number, required: true },
  class: { type: String, required: true },
  attendance: [attendanceRecordSchema]
});

const AttendanceSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  className: { type: String, required: true },
  students: [studentAttendanceSchema]
}, { timestamps: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);