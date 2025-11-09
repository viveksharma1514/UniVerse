const express = require('express');
const Attendance = require('../models/Attendance');
const auth = require('../middleware/auth');
const router = express.Router();

// Generate mock student data for a class
const generateMockStudents = (className) => {
  const students = [];
  
  // Your specified names for TY CORE 4
  const specialNames = {
    47: 'Reeva Rawat',
    48: 'Ronit Roy', 
    50: 'Vivek Sharma',
    56: 'Soham Andhyl'
  };

  // Common Indian names for remaining students
  const indianFirstNames = [
    'Aarav', 'Aditi', 'Akshay', 'Ananya', 'Arjun', 'Bhavya', 'Chetan', 'Divya',
    'Gaurav', 'Ishita', 'Karan', 'Kriti', 'Manish', 'Neha', 'Pranav', 'Priya',
    'Rahul', 'Riya', 'Rohan', 'Sanya', 'Siddharth', 'Tanvi', 'Utkarsh', 'Varsha',
    'Yash', 'Zara', 'Abhishek', 'Anjali', 'Deepak', 'Kavya', 'Mohit', 'Nisha',
    'Raj', 'Simran', 'Vikram', 'Anika', 'Dhruv', 'Ishaan', 'Maya', 'Nikhil',
    'Pooja', 'Ravi', 'Shreya', 'Varun', 'Alisha', 'Harsh', 'Jatin', 'Meera',
    'Rishabh', 'Sneha', 'Vivek', 'Anjali', 'Kunal', 'Madhuri', 'Rajat', 'Swati'
  ];

  const indianLastNames = [
    'Sharma', 'Verma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Malhotra', 'Reddy',
    'Choudhary', 'Jain', 'Mehta', 'Shah', 'Agarwal', 'Das', 'Bose', 'Nair',
    'Menon', 'Pillai', 'Rao', 'Yadav', 'Thakur', 'Pandey', 'Mishra', 'Tiwari'
  ];

  for (let rollNo = 1; rollNo <= 60; rollNo++) {
    let studentName;
    
    if (className === 'TY CORE 4' && specialNames[rollNo]) {
      studentName = specialNames[rollNo];
    } else {
      const firstName = indianFirstNames[Math.floor(Math.random() * indianFirstNames.length)];
      const lastName = indianLastNames[Math.floor(Math.random() * indianLastNames.length)];
      studentName = `${firstName} ${lastName}`;
    }

    students.push({
      studentName: studentName,
      rollNo: rollNo,
      class: className,
      attendance: []
    });
  }

  return students;
};

// Get attendance sheet for a class
router.get('/:className', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can access attendance' });
    }

    const { className } = req.params;
    const validClasses = ['TY CORE 3', 'TY CORE 4', 'TY CORE 5'];
    
    if (!validClasses.includes(className)) {
      return res.status(400).json({ message: 'Invalid class name' });
    }

    // Find or create attendance sheet for this class and teacher
    let attendanceSheet = await Attendance.findOne({
      teacherId: req.user.id,
      className: className
    });

    if (!attendanceSheet) {
      // Create new attendance sheet with mock students
      attendanceSheet = new Attendance({
        teacherId: req.user.id,
        className: className,
        students: generateMockStudents(className)
      });
      await attendanceSheet.save();
    }

    res.json(attendanceSheet);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark attendance for a class
router.post('/:className/mark', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can mark attendance' });
    }

    const { className } = req.params;
    const { date, attendanceData } = req.body;

    // Validate required fields
    if (!date || !attendanceData || !Array.isArray(attendanceData)) {
      return res.status(400).json({ message: 'Date and attendanceData are required' });
    }

    let attendanceSheet = await Attendance.findOne({
      teacherId: req.user.id,
      className: className
    });

    if (!attendanceSheet) {
      return res.status(404).json({ message: 'Attendance sheet not found' });
    }

    // Update attendance for each student
    attendanceData.forEach(({ rollNo, status }) => {
      const student = attendanceSheet.students.find(s => s.rollNo === rollNo);
      if (student) {
        // Remove existing record for this date
        student.attendance = student.attendance.filter(
          record => record.date.toDateString() !== new Date(date).toDateString()
        );
        
        // Add new record
        student.attendance.push({
          date: new Date(date),
          status: status
        });
      }
    });

    await attendanceSheet.save();
    res.json({ message: 'Attendance marked successfully', attendanceSheet });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get attendance statistics
router.get('/:className/stats', auth, async (req, res) => {
  try {
    const { className } = req.params;
    
    const attendanceSheet = await Attendance.findOne({
      teacherId: req.user.id,
      className: className
    });

    if (!attendanceSheet) {
      return res.status(404).json({ message: 'Attendance sheet not found' });
    }

    const stats = attendanceSheet.students.map(student => {
      const totalDays = student.attendance.length;
      const presentDays = student.attendance.filter(a => a.status === 'present').length;
      const percentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

      return {
        rollNo: student.rollNo,
        studentName: student.studentName,
        totalDays,
        presentDays,
        percentage: percentage.toFixed(2)
      };
    });

    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;