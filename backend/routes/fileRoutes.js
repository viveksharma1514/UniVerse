const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Assignment = require('../models/Assignment');
const auth = require('../middleware/auth');

// Serve static files (for downloads and previews)
router.use('/files', express.static(path.join(__dirname, '../uploads')));

// Download file
router.get('/download/:fileType/:filename', auth, async (req, res) => {
  try {
    const { fileType, filename } = req.params;
    
    // Validate fileType to prevent directory traversal
    if (!['submissions', 'materials'].includes(fileType)) {
      return res.status(400).json({ error: 'Invalid file type' });
    }

    const filePath = path.join(__dirname, '../uploads/assignments', fileType, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Set appropriate headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Stream the file to the response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', (err) => {
      console.error('File stream error:', err);
      res.status(500).json({ error: 'Error downloading file' });
    });

  } catch (error) {
    console.error('Download route error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get file info for preview
router.get('/file-info/:fileType/:filename', auth, async (req, res) => {
  try {
    const { fileType, filename } = req.params;
    
    // Validate fileType
    if (!['submissions', 'materials'].includes(fileType)) {
      return res.status(400).json({ error: 'Invalid file type' });
    }

    const filePath = path.join(__dirname, '../uploads/assignments', fileType, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const stats = fs.statSync(filePath);
    const fileInfo = {
      filename: filename,
      path: filePath,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      mimetype: getMimeType(filename),
      downloadUrl: `/api/files/download/${fileType}/${filename}`
    };

    res.json(fileInfo);
  } catch (error) {
    console.error('File info error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Preview file (serve file for inline viewing)
router.get('/preview/:fileType/:filename', auth, async (req, res) => {
  try {
    const { fileType, filename } = req.params;
    
    if (!['submissions', 'materials'].includes(fileType)) {
      return res.status(400).json({ error: 'Invalid file type' });
    }

    const filePath = path.join(__dirname, '../uploads/assignments', fileType, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const mimeType = getMimeType(filename);
    
    // Set appropriate headers for preview
    res.setHeader('Content-Type', mimeType);
    
    // For some file types, we want inline display
    if (mimeType.startsWith('image/') || mimeType === 'application/pdf') {
      res.setHeader('Content-Disposition', 'inline');
    } else {
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    }

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', (err) => {
      console.error('File stream error:', err);
      res.status(500).json({ error: 'Error previewing file' });
    });

  } catch (error) {
    console.error('Preview route error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get file by assignment and submission (for teachers to download student submissions)
router.get('/submission/:assignmentId/:studentId', auth, async (req, res) => {
  try {
    const { assignmentId, studentId } = req.params;

    // Check if user is teacher and owns the assignment
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    if (req.user.role === 'teacher' && assignment.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Find the submission
    const submission = assignment.submissions.find(
      sub => sub.studentId.toString() === studentId
    );

    if (!submission || !submission.files || submission.files.length === 0) {
      return res.status(404).json({ error: 'No files found for this submission' });
    }

    // For now, return the first file info
    // In enhanced version, you could return all files or create a ZIP
    const file = submission.files[0];
    const filePath = path.join(__dirname, '..', file.path);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Submission file route error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper function to get MIME type
function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.json': 'application/json',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.html': 'text/html',
    '.py': 'text/x-python',
    '.java': 'text/x-java',
    '.cpp': 'text/x-c++',
    '.c': 'text/x-c',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.zip': 'application/zip',
    '.rar': 'application/x-rar-compressed'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

module.exports = router;