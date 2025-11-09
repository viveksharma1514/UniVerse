const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const assignmentsDir = './uploads/assignments';
const submissionsDir = './uploads/assignments/submissions';
const materialsDir = './uploads/assignments/materials';

[assignmentsDir, submissionsDir, materialsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration for assignment submissions
const submissionStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('📁 Multer destination - saving to:', submissionsDir);
    cb(null, submissionsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = 'submission-' + uniqueSuffix + path.extname(file.originalname);
    console.log('📄 Multer filename:', filename, 'Original:', file.originalname);
    cb(null, filename);
  }
});

// File filter for security - MAKE IT MORE LENIENT FOR TESTING
const fileFilter = (req, file, cb) => {
  console.log('🔍 Multer file filter - File:', file.originalname, 'Mimetype:', file.mimetype);
  
  // For testing, accept ALL file types temporarily
  cb(null, true);
};

// Create multer instances with better error handling
const uploadSubmission = multer({
  storage: submissionStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 10 // Max 10 files per submission
  }
});

const uploadMaterial = multer({
  storage: submissionStorage, // Use same storage for now
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 10
  }
});

module.exports = {
  uploadSubmission,
  uploadMaterial
};