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

// API base URL
const API_BASE = 'http://localhost:5000/api';

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

  // Fetch assignments from backend
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

      if (!response.ok) {
        throw new Error('Failed to fetch assignments');
      }

      const data = await response.json();
      setAssignments(data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      // Fallback to localStorage if API fails
      const savedAssignments = localStorage.getItem('universe-assignments');
      if (savedAssignments) {
        setAssignments(JSON.parse(savedAssignments));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.role]);

  // Set default subject when dialog opens
  useEffect(() => {
    if (openDialog && user.role === 'teacher' && user.subject) {
      setNewAssignment(prev => ({
        ...prev,
        subject: user.subject
      }));
    }
  }, [openDialog, user.subject, user.role]);

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
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to create assignment');
      }

      const createdAssignment = await response.json();
      
      // Update local state
      setAssignments(prev => [createdAssignment, ...prev]);
      setOpenDialog(false);
      setNewAssignment({ title: '', description: '', subject: '', dueDate: '', maxMarks: '' });
      
      setSubmitMessage('Assignment created successfully! Students can now see it.');
      setTimeout(() => setSubmitMessage(''), 5000);
      
    } catch (error) {
      console.error('Error creating assignment:', error);
      alert('Failed to create assignment. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleOpenSubmitDialog = (assignment) => {
    setSelectedAssignment(assignment);
    setSubmissionFiles([]);
    setSubmissionNotes('');
    setSubmitDialog(true);
  };

  const handleOpenReviewDialog = (assignment, submission = null) => {
    setSelectedAssignment(assignment);
    
    if (submission) {
      // For grading specific submission
      setSelectedSubmission(submission);
      setTeacherFeedback(submission?.feedback || '');
      setAssignedMarks(submission?.marks || 0);
    } else {
      // For reviewing all submissions - open the review dialog
      setReviewDialog(true);
    }
  };

  const handleSubmitAssignment = async () => {
    if (submissionFiles.length === 0) {
      alert('Please upload at least one file for your submission.');
      return;
    }

    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      
      console.log('🔍 === FRONTEND SUBMIT DEBUG START ===');
      console.log('Assignment ID:', selectedAssignment._id);
      console.log('User:', user.name, `(${user.role})`);
      console.log('Token exists:', !!token);
      console.log('Files to upload:', submissionFiles.length);
      
      submissionFiles.forEach((file, index) => {
        console.log(`   File ${index + 1}:`, file.name, file.type, `${file.size} bytes`);
      });

      const formData = new FormData();
      submissionFiles.forEach(file => {
        formData.append('files', file);
      });
      formData.append('notes', submissionNotes);

      console.log('Sending request to:', `${API_BASE}/assignments/${selectedAssignment._id}/submit`);
      
      const response = await fetch(`${API_BASE}/assignments/${selectedAssignment._id}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      console.log('Response Status:', response.status);
      console.log('Response OK:', response.ok);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
          console.log('❌ Server error response:', errorData);
        } catch (e) {
          const errorText = await response.text();
          errorMessage = errorText || `HTTP ${response.status}`;
          console.log('❌ Server error text:', errorText);
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ SUCCESS! Server response:', result);
      console.log('📝 === FRONTEND SUBMIT DEBUG END ===');
      
      // Refresh assignments
      await fetchAssignments();
      
      setSubmitDialog(false);
      setSubmitMessage('Assignment submitted successfully! Teacher will review your work.');
      setTimeout(() => setSubmitMessage(''), 5000);
      
    } catch (error) {
      console.error('💥 === FRONTEND SUBMIT ERROR ===');
      console.error('Complete error:', error);
      console.error('💥 === FRONTEND SUBMIT ERROR END ===');
      alert(`Failed to submit assignment: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleGradeSubmission = async () => {
    try {
      console.log('🔍 === GRADING DEBUG ===');
      console.log('Selected Submission:', selectedSubmission);
      console.log('Marks:', assignedMarks);
      console.log('Feedback:', teacherFeedback);
      
      // ✅ Get student ID correctly - check different possible locations
      let studentId;
      
      if (selectedSubmission.studentId && selectedSubmission.studentId._id) {
        // If studentId is an object with _id
        studentId = selectedSubmission.studentId._id;
      } else if (selectedSubmission.studentId) {
        // If studentId is directly the ID
        studentId = selectedSubmission.studentId;
      } else if (selectedSubmission.student && selectedSubmission.student._id) {
        // If student object has _id
        studentId = selectedSubmission.student._id;
      } else {
        console.error('❌ Cannot find student ID in submission:', selectedSubmission);
        throw new Error('Student ID not found in submission data');
      }
      
      console.log('🔍 Student ID:', studentId);
      console.log('🔍 Assignment ID:', selectedAssignment._id);
      
      const response = await fetch(`${API_BASE}/assignments/${selectedAssignment._id}/grade/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          marks: assignedMarks,
          feedback: teacherFeedback
        })
      });

      if (!response.ok) {
        throw new Error('Failed to grade submission');
      }

      const result = await response.json();
      console.log('✅ Grade submitted successfully:', result);
      
      alert('Grade submitted successfully!');
      setSelectedSubmission(null);
      fetchAssignments(); // Refresh assignments to show updated grade
      
    } catch (error) {
      console.error('Error grading submission:', error);
      alert('Error grading submission: ' + error.message);
    }
  };

  const handleFilesChange = (files) => {
    setSubmissionFiles(files);
  };

  const handleDownloadFile = async (file, fileType = 'submissions') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE}/files/download/${fileType}/${file.filename}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.originalName || file.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  const handlePreviewFile = (file, fileType = 'submissions') => {
    const token = localStorage.getItem('token');
    const previewUrl = `${API_BASE}/files/preview/${fileType}/${file.filename}?token=${token}`;
    window.open(previewUrl, '_blank');
  };

  const getFileIcon = (mimetype, filename) => {
    if (mimetype === 'application/pdf') return <PictureAsPdf color="error" />;
    if (mimetype.startsWith('image/')) return <Image color="primary" />;
    if (mimetype.startsWith('text/') || mimetype.includes('code')) return <Code color="info" />;
    return <Description color="action" />;
  };

  const getStatusChip = (assignment) => {
    if (user.role === 'teacher') {
      const submissionCount = assignment.submissions?.length || 0;
      const gradedCount = assignment.submissions?.filter(sub => sub.marks !== null && sub.marks !== undefined).length || 0;
      
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Chip
            label={`${submissionCount} submissions`}
            color={submissionCount > 0 ? 'primary' : 'default'}
            size="small"
            variant="outlined"
          />
          {submissionCount > 0 && (
            <Chip
              label={`${gradedCount} graded`}
              color={gradedCount === submissionCount ? 'success' : 'warning'}
              size="small"
              variant="outlined"
            />
          )}
        </Box>
      );
    }

    // For students, show their submission status
    const status = assignment.submissionStatus || 'pending';
    const statusConfig = {
      pending: { color: 'warning', label: 'Pending', icon: <Pending /> },
      submitted: { color: 'success', label: 'Submitted', icon: <CheckCircle /> }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size="small"
        variant="outlined"
      />
    );
  };

  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getSubjectColor = (subject) => {
    const colors = {
      'Mathematics': '#ff6b6b',
      'Science': '#4ecdc4',
      'English': '#45b7d1',
      'History': '#96ceb4',
      'Computer': '#feca57',
      'Physics': '#ff9ff3',
      'Chemistry': '#54a0ff',
      'Biology': '#1dd1a1'
    };
    return colors[subject] || '#7ae75cff';
  };

  // Filter assignments based on active tab
  const getFilteredAssignments = () => {
    if (user.role === 'teacher') {
      return assignments.filter(assignment => 
        assignment.teacherId?._id === user.id || assignment.teacherId === user.id
      );
    }

    // For students
    if (activeTab === 1) { // Completed tab
      return assignments.filter(assignment => 
        assignment.submissionStatus === 'submitted' || assignment.studentSubmission
      );
    } else { // My Assignments tab
      return assignments.filter(assignment => 
        !assignment.submissionStatus || assignment.submissionStatus === 'pending'
      );
    }
  };

  const filteredAssignments = getFilteredAssignments();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px" flexDirection="column">
        <CircularProgress size={60} thickness={4} sx={{ color: '#6c5ce7', mb: 2 }} />
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>
          Loading your assignments...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', px: { xs: 2, md: 3 } }}>
      {/* Header Section */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #bf5effff 0%, #3d2754ff 100%)',
        borderRadius: 3,
        p: 4,
        mb: 4,
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                Assignments
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                {user.role === 'student' 
                  ? 'Track and submit your academic work' 
                  : 'Manage and review student submissions'
                }
              </Typography>
            </Box>
            
            {user.role === 'teacher' && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setOpenDialog(true)}
                sx={{
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.3)',
                  }
                }}
              >
                Create Assignment
              </Button>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 3, mt: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Assignment sx={{ fontSize: 24 }} />
              <Box>
                <Typography variant="h6">{filteredAssignments.length}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Total Assignments
                </Typography>
              </Box>
            </Box>
            
            {user.role === 'student' && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle sx={{ fontSize: 24 }} />
                <Box>
                  <Typography variant="h6">
                    {assignments.filter(a => a.submissionStatus === 'submitted').length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Completed
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
        
        {/* Background decoration */}
        <Box sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          zIndex: 1
        }} />
      </Box>

      {submitMessage && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            background: 'linear-gradient(135deg, #d4edda, #c3e6cb)'
          }}
        >
          {submitMessage}
        </Alert>
      )}

      {/* Tabs Section */}
      <Paper sx={{ 
        width: '100%', 
        mb: 4, 
        borderRadius: 3,
        background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)'
      }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            '& .MuiTab-root': {
              fontWeight: 600,
              fontSize: '1rem',
              textTransform: 'none',
              minHeight: 60
            }
          }}
        >
          <Tab label={user.role === 'student' ? '📚 My Assignments' : '📋 All Assignments'} />
          <Tab label="✅ Completed" />
        </Tabs>
      </Paper>

      {/* Assignments Grid */}
      <Grid container spacing={3}>
        {filteredAssignments.map((assignment) => {
          const daysRemaining = getDaysRemaining(assignment.dueDate);
          const isOverdue = daysRemaining < 0;
          const studentSubmission = assignment.studentSubmission || 
            (assignment.submissions && assignment.submissions.find(sub => 
              sub.studentId === user.id || sub.studentId._id === user.id
            ));
          
          const canSubmit = user.role === 'student' && 
                           !studentSubmission && 
                           !isOverdue;

          return (
            <Grid item xs={12} key={assignment._id}>
              <Card sx={{
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                border: '1px solid rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 48px rgba(0,0,0,0.15)'
                }
              }}>
                <CardHeader
                  avatar={
                    <Avatar sx={{ 
                      bgcolor: getSubjectColor(assignment.subject),
                      fontWeight: 'bold'
                    }}>
                      {assignment.subject?.charAt(0) || 'A'}
                    </Avatar>
                  }
                  action={
                    <IconButton>
                      <MoreVert />
                    </IconButton>
                  }
                  title={
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {assignment.title}
                    </Typography>
                  }
                  subheader={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <School sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {assignment.subject} • {assignment.teacherId?.name || assignment.teacherName || 'Unknown Teacher'}
                      </Typography>
                    </Box>
                  }
                />
                
                <CardContent>
                  <Typography variant="body2" sx={{ 
                    color: 'text.secondary', 
                    mb: 2,
                    lineHeight: 1.6
                  }}>
                    {assignment.description}
                  </Typography>

                  {/* Assignment Details */}
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 3, 
                    mb: 2,
                    flexWrap: 'wrap'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarToday sx={{ fontSize: 18, color: 'primary.main' }} />
                      <Typography variant="body2">
                        <strong>Due:</strong> {new Date(assignment.dueDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Star sx={{ fontSize: 18, color: 'warning.main' }} />
                      <Typography variant="body2">
                        <strong>Marks:</strong> {assignment.maxMarks}
                      </Typography>
                    </Box>

                    {studentSubmission?.marks !== undefined && studentSubmission?.marks !== null && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TrendingUp sx={{ fontSize: 18, color: 'success.main' }} />
                        <Typography variant="body2">
                          <strong>Your Score:</strong> {studentSubmission.marks}/{assignment.maxMarks}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Status and Actions Row */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 2
                  }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      {!isOverdue ? (
                        <Chip
                          icon={<AccessTime />}
                          label={`${daysRemaining} days left`}
                          color={daysRemaining <= 2 ? 'error' : daysRemaining <= 5 ? 'warning' : 'success'}
                          variant="filled"
                          sx={{ fontWeight: 600 }}
                        />
                      ) : (
                        <Chip
                          label="Overdue"
                          color="error"
                          variant="filled"
                          sx={{ fontWeight: 600 }}
                        />
                      )}
                      {getStatusChip(assignment)}
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {user.role === 'teacher' && assignment.submissions?.length > 0 && (
                        <Button
                          variant="contained"
                          startIcon={<Visibility />}
                          onClick={() => handleOpenReviewDialog(assignment)}
                          sx={{ borderRadius: 2 }}
                        >
                          Review ({assignment.submissions.length})
                        </Button>
                      )}
                      
                      {canSubmit && (
                        <Button
                          variant="contained"
                          startIcon={<Upload />}
                          onClick={() => handleOpenSubmitDialog(assignment)}
                          sx={{ 
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          }}
                        >
                          Submit Assignment
                        </Button>
                      )}
                    </Box>
                  </Box>

                  {/* Progress bar for teachers */}
                  {user.role === 'teacher' && (
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" color="textSecondary">
                          Submission Progress
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {assignment.submissions?.length || 0} / 30 students
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={((assignment.submissions?.length || 0) / 30) * 100}
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          bgcolor: alpha('#667eea', 0.2),
                          '& .MuiLinearProgress-bar': {
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          }
                        }}
                      />
                    </Box>
                  )}

                  {/* Student Submission Details */}
                  {user.role === 'student' && studentSubmission && (
                    <Paper sx={{ 
                      mt: 2, 
                      p: 2, 
                      bgcolor: 'success.light',
                      background: 'linear-gradient(135deg, #f8fff9 0%, #f0fff4 100%)',
                      border: '1px solid',
                      borderColor: 'success.light',
                      borderRadius: 2
                    }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                        📄 Your Submission
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Submitted on: {new Date(studentSubmission.submittedAt).toLocaleDateString()}
                      </Typography>
                      
                      {studentSubmission.files?.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                            Files:
                          </Typography>
                          {studentSubmission.files.map((file, index) => (
                            <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                              <Button
                                startIcon={getFileIcon(file.mimetype, file.filename)}
                                size="small"
                                onClick={() => handlePreviewFile(file)}
                                sx={{ mr: 1 }}
                              >
                                {file.originalName || file.filename}
                              </Button>
                              <Button
                                startIcon={<Download />}
                                size="small"
                                onClick={() => handleDownloadFile(file)}
                                variant="outlined"
                                sx={{ borderRadius: 2 }}
                              >
                                Download
                              </Button>
                            </Box>
                          ))}
                        </Box>
                      )}
                      
                      {studentSubmission.marks !== null && studentSubmission.marks !== undefined && (
                        <Box sx={{ mt: 1, p: 1, bgcolor: 'white', borderRadius: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            🎯 Grade: {studentSubmission.marks}/{assignment.maxMarks}
                          </Typography>
                          {studentSubmission.feedback && (
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              💬 Feedback: {studentSubmission.feedback}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Paper>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {filteredAssignments.length === 0 && (
        <Paper sx={{ 
          p: 6, 
          textAlign: 'center', 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)'
        }}>
          <Assignment sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            No assignments found
          </Typography>
          <Typography color="textSecondary" sx={{ fontSize: '1.1rem' }}>
            {user.role === 'student' 
              ? activeTab === 0 
                ? 'No pending assignments. Check the Completed tab for submitted work.'
                : 'No completed assignments yet. Keep up the good work!'
              : 'No assignments created yet. Create your first assignment to get started!'
            }
          </Typography>
        </Paper>
      )}

      {/* Create Assignment Dialog */}
      {user.role === 'teacher' && (
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontWeight: 600
          }}>
            Create New Assignment
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Assignment Title"
                value={newAssignment.title}
                onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                fullWidth
                required
                variant="outlined"
              />
              
              <TextField
                label="Subject"
                value={newAssignment.subject}
                onChange={(e) => setNewAssignment({ ...newAssignment, subject: e.target.value })}
                fullWidth
                required
                variant="outlined"
              />
              
              <TextField
                type="date"
                label="Due Date"
                value={newAssignment.dueDate}
                onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
                variant="outlined"
              />
              
              <TextField
                type="number"
                label="Maximum Marks"
                value={newAssignment.maxMarks}
                onChange={(e) => setNewAssignment({ ...newAssignment, maxMarks: e.target.value })}
                fullWidth
                required
                inputProps={{ min: 1 }}
                variant="outlined"
              />
              
              <TextField
                label="Description"
                multiline
                rows={4}
                value={newAssignment.description}
                onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                fullWidth
                placeholder="Provide detailed instructions for the assignment..."
                required
                variant="outlined"
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenDialog(false)} sx={{ borderRadius: 2 }}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateAssignment}
              variant="contained"
              disabled={
                uploading ||
                !newAssignment.title?.trim() || 
                !newAssignment.subject || 
                !newAssignment.dueDate || 
                !newAssignment.maxMarks || 
                !newAssignment.description?.trim()
              }
              startIcon={uploading ? <CircularProgress size={20} /> : <Add />}
              sx={{ borderRadius: 2 }}
            >
              {uploading ? 'Creating...' : 'Create Assignment'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Submit Assignment Dialog */}
      {user.role === 'student' && (
        <Dialog open={submitDialog} onClose={() => setSubmitDialog(false)} maxWidth="md" fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontWeight: 600
          }}>
            Submit Assignment: {selectedAssignment?.title}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                📝 <strong>Instructions:</strong> {selectedAssignment?.description}
              </Typography>
              
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  📁 Upload Your Work
                </Typography>
                <FileUpload onFilesChange={handleFilesChange} />
              </Box>

              <TextField
                label="Additional Notes (Optional)"
                multiline
                rows={3}
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
                fullWidth
                placeholder="Add any comments or notes for the teacher..."
                variant="outlined"
              />

              {submissionFiles.length === 0 && (
                <Alert severity="warning" sx={{ borderRadius: 2 }}>
                  Please upload at least one file for your submission.
                </Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setSubmitDialog(false)} sx={{ borderRadius: 2 }}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitAssignment}
              variant="contained"
              disabled={submissionFiles.length === 0 || uploading}
              startIcon={uploading ? <CircularProgress size={20} /> : <Upload />}
              sx={{ 
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            >
              {uploading ? 'Submitting...' : 'Submit Assignment'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Review Submissions Dialog */}
      {user.role === 'teacher' && (
        <Dialog open={reviewDialog} onClose={() => setReviewDialog(false)} maxWidth="md" fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontWeight: 600
          }}>
            Review Submissions: {selectedAssignment?.title}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {selectedAssignment?.submissions?.map((submission, index) => (
                <Paper key={submission._id || index} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {submission.studentName || submission.studentId?.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Submitted: {new Date(submission.submittedAt).toLocaleString()}
                      </Typography>
                      {submission.marks !== null && submission.marks !== undefined && (
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                          Grade: {submission.marks}/{selectedAssignment.maxMarks}
                        </Typography>
                      )}
                    </Box>
                    
                    <Button
                      variant="contained"
                      onClick={() => {
                        setReviewDialog(false);
                        handleOpenReviewDialog(selectedAssignment, submission);
                      }}
                      size="small"
                    >
                      {submission.marks !== null && submission.marks !== undefined ? 'Update Grade' : 'Grade'}
                    </Button>
                  </Box>
                </Paper>
              ))}
              
              {(!selectedAssignment?.submissions || selectedAssignment.submissions.length === 0) && (
                <Typography variant="body1" sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                  No submissions yet for this assignment.
                </Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setReviewDialog(false)} sx={{ borderRadius: 2 }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Grade Submission Dialog (UPDATED) */}
      {user.role === 'teacher' && selectedSubmission && (
        <Dialog
          open={!!selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontWeight: 600,
            }}
          >
            Grade Submission: {selectedSubmission.studentName || selectedSubmission.studentId?.name}
          </DialogTitle>

          <DialogContent sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Student Info */}
              <Box>
                <Typography variant="body2" gutterBottom>
                  <strong>Student:</strong> {selectedSubmission.studentName || selectedSubmission.studentId?.name}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Submitted:</strong> {new Date(selectedSubmission.submittedAt).toLocaleString()}
                </Typography>
              </Box>

              {/* ✅ FILES SECTION */}
              {selectedSubmission.files?.length > 0 ? (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Submitted Files:
                  </Typography>
                  {selectedSubmission.files.map((file, index) => (
                    <Paper
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1.5,
                        mb: 1,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #f9f9ff, #f0f0ff)',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getFileIcon(file.mimetype, file.filename)}
                        <Typography variant="body2">{file.originalName || file.filename}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handlePreviewFile(file)}
                          startIcon={<Visibility />}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleDownloadFile(file)}
                          startIcon={<Download />}
                        >
                          Download
                        </Button>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No files uploaded for this submission.
                </Typography>
              )}

              {/* Assignment Info */}
              <Box>
                <Typography variant="body2" gutterBottom>
                  <strong>Assignment:</strong> {selectedAssignment?.title}
                </Typography>
                <Typography variant="body2">
                  <strong>Max Marks:</strong> {selectedAssignment?.maxMarks}
                </Typography>
              </Box>

              {/* Grade and Feedback */}
              <Box>
                <Typography variant="body2" gutterBottom>
                  Assign Marks (0 - {selectedAssignment?.maxMarks}):
                </Typography>
                <TextField
                  type="number"
                  value={assignedMarks}
                  onChange={(e) => setAssignedMarks(parseInt(e.target.value) || 0)}
                  fullWidth
                  inputProps={{
                    min: 0,
                    max: selectedAssignment?.maxMarks,
                  }}
                  variant="outlined"
                />
              </Box>

              <TextField
                label="Feedback for Student"
                multiline
                rows={4}
                value={teacherFeedback}
                onChange={(e) => setTeacherFeedback(e.target.value)}
                fullWidth
                placeholder="Provide constructive feedback..."
                variant="outlined"
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setSelectedSubmission(null)} sx={{ borderRadius: 2 }}>
              Cancel
            </Button>
            <Button
              onClick={handleGradeSubmission}
              variant="contained"
              sx={{
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              Save Grade & Feedback
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}

export default AssignmentSystem;