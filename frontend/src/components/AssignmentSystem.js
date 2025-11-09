import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Tab,
  Tabs,
  LinearProgress,
  Alert,
  CircularProgress,
  Avatar,
  CardHeader,
  IconButton,
  alpha
} from '@mui/material';
import { 
  Add, 
  Assignment, 
  CheckCircle, 
  Pending, 
  Upload,
  Download,
  Visibility,
  Description,
  Image,
  Code,
  PictureAsPdf,
  Star,
  CalendarToday,
  School,
  MoreVert,
  AccessTime,
  TrendingUp
} from '@mui/icons-material';
import FileUpload from './FileUpload';
import { API_URL } from '../config'; // ✅ centralized API import

// ✅ use centralized API base
const API_BASE = `${API_URL}/api`;

function AssignmentSystem({ user }) {
  const [assignments, setAssignments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [submitDialog, setSubmitDialog] = useState(false);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submissionFiles, setSubmissionFiles] = useState([]);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [teacherFeedback, setTeacherFeedback] = useState('');
  const [assignedMarks, setAssignedMarks] = useState(0);
  const [uploading, setUploading] = useState(false);

  // New assignment form state (for teachers)
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    subject: '',
    dueDate: '',
    maxMarks: ''
  });

  // ✅ Fetch assignments from backend
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      let endpoint = '';
      if (user.role === 'student') {
        endpoint = '/assignments/student';
      } else {
        endpoint = '/assignments/teacher';
      }

      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch assignments');

      const data = await response.json();
      setAssignments(data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      const savedAssignments = localStorage.getItem('universe-assignments');
      if (savedAssignments) setAssignments(JSON.parse(savedAssignments));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [user.role]);

  // Pre-fill subject when teacher creates assignment
  useEffect(() => {
    if (openDialog && user.role === 'teacher' && user.subject) {
      setNewAssignment(prev => ({ ...prev, subject: user.subject }));
    }
  }, [openDialog, user.subject, user.role]);

  // ✅ Create new assignment
  const handleCreateAssignment = async () => {
    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', newAssignment.title);
      formData.append('description', newAssignment.description);
      formData.append('subject', newAssignment.subject);
      formData.append('dueDate', newAssignment.dueDate);
      formData.append('maxMarks', newAssignment.maxMarks);

      const response = await fetch(`${API_BASE}/assignments`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to create assignment');

      const createdAssignment = await response.json();
      setAssignments(prev => [createdAssignment, ...prev]);
      setOpenDialog(false);
      setNewAssignment({ title: '', description: '', subject: '', dueDate: '', maxMarks: '' });
      setSubmitMessage('Assignment created successfully!');
      setTimeout(() => setSubmitMessage(''), 5000);
    } catch (error) {
      console.error('Error creating assignment:', error);
      alert('Failed to create assignment. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // ✅ Handle student submission
  const handleSubmitAssignment = async () => {
    if (submissionFiles.length === 0) {
      alert('Please upload at least one file for your submission.');
      return;
    }

    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      submissionFiles.forEach(file => formData.append('files', file));
      formData.append('notes', submissionNotes);

      const response = await fetch(`${API_BASE}/assignments/${selectedAssignment._id}/submit`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to submit assignment');
      await fetchAssignments();
      setSubmitDialog(false);
      setSubmitMessage('Assignment submitted successfully!');
      setTimeout(() => setSubmitMessage(''), 5000);
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert(`Failed to submit assignment: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // ✅ Grade submission (teacher)
  const handleGradeSubmission = async () => {
    try {
      const studentId =
        selectedSubmission.studentId?._id ||
        selectedSubmission.studentId ||
        selectedSubmission.student?._id;
      if (!studentId) throw new Error('Student ID not found');

      const response = await fetch(`${API_BASE}/assignments/${selectedAssignment._id}/grade/${studentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          marks: assignedMarks,
          feedback: teacherFeedback
        })
      });

      if (!response.ok) throw new Error('Failed to grade submission');

      alert('Grade submitted successfully!');
      setSelectedSubmission(null);
      fetchAssignments();
    } catch (error) {
      console.error('Error grading submission:', error);
      alert('Error grading submission: ' + error.message);
    }
  };

  // ✅ Download file
  const handleDownloadFile = async (file, fileType = 'submissions') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/files/download/${fileType}/${file.filename}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to download file');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.originalName || file.filename;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  // ✅ Preview file
  const handlePreviewFile = (file, fileType = 'submissions') => {
    const token = localStorage.getItem('token');
    const previewUrl = `${API_BASE}/files/preview/${fileType}/${file.filename}?token=${token}`;
    window.open(previewUrl, '_blank');
  };

  // rest of your UI rendering code unchanged...
}

export default AssignmentSystem;
