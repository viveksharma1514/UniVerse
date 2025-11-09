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
  MenuItem,
  Chip,
  Tab,
  Tabs,
  Avatar,
  alpha
} from '@mui/material';
import { 
  Add, 
  Schedule, 
  Check, 
  Close, 
  Pending, 
  Groups,
  CalendarToday,
  AccessTime,
  School,
  History
} from '@mui/icons-material';

function MeetingScheduler({ user }) {
  const [meetings, setMeetings] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // New meeting form state
  const [newMeeting, setNewMeeting] = useState({
    teacherId: '',
    date: '',
    time: '',
    purpose: ''
  });

  // Mock teachers data (replace with API call later)
  const mockTeachers = [
    { _id: '1', name: 'Prof. Dr. Anant kaulage', subject: 'Advance Database' },
    { _id: '2', name: 'Prof. Swati', subject: 'AIML' },
    { _id: '3', name: 'Prof. Ravi', subject: 'PBL' },
    { _id: '4', name: 'Prof. Srikant', subject: 'IDSL' }
  ];

  // Mock meetings data - including past meetings for history tab
  const mockMeetings = [
    {
      _id: '1',
      teacherId: { name: 'Prof. Dr. Anant kaulage', subject: 'Advance Database' },
      date: '2025-11-09',
      time: '10:00 AM',
      purpose: 'Project discussion',
      status: 'approved'
    },
    {
      _id: '2', 
      teacherId: { name: 'Prof. Swati', subject: 'AIML' },
      date: '2025-11-10',
      time: '2:00 PM',
      purpose: 'Assignment help',
      status: 'pending'
    },
    // Past meeting for history tab
    {
      _id: '3',
      teacherId: { name: 'Prof. Ravi', subject: 'PBL' },
      date: '2025-10-10',
      time: '11:00 AM',
      purpose: 'Project brainstorming session',
      status: 'completed',
      aim: 'To discuss the initial project requirements and scope for the PBL project',
      output: 'Finalized project timeline, assigned team roles, and defined project milestones. Agreed on weekly progress reviews.'
    }
  ];

  useEffect(() => {
    // Simulate API calls
    setTimeout(() => {
      setTeachers(mockTeachers);
      setMeetings(mockMeetings);
      setLoading(false);
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // We disable the warning because mock data is static

  const handleCreateMeeting = async () => {
    try {
      // Here you would make the actual API call
      console.log('Creating meeting:', newMeeting);
      
      // Simulate success
      const createdMeeting = {
        _id: Date.now().toString(),
        teacherId: teachers.find(t => t._id === newMeeting.teacherId),
        date: newMeeting.date,
        time: newMeeting.time,
        purpose: newMeeting.purpose,
        status: 'pending'
      };

      setMeetings(prev => [createdMeeting, ...prev]);
      setOpenDialog(false);
      setNewMeeting({ teacherId: '', date: '', time: '', purpose: '' });
      
    } catch (error) {
      console.error('Error creating meeting:', error);
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { color: 'warning', icon: <Pending />, gradient: 'linear-gradient(135deg, #ffd700, #ffb347)' },
      approved: { color: 'success', icon: <Check />, gradient: 'linear-gradient(135deg, #4CAF50, #45a049)' },
      rejected: { color: 'error', icon: <Close />, gradient: 'linear-gradient(135deg, #f44336, #d32f2f)' },
      completed: { color: 'primary', icon: <Check />, gradient: 'linear-gradient(135deg, #2196F3, #1976D2)' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Chip
        icon={config.icon}
        label={status.charAt(0).toUpperCase() + status.slice(1)}
        sx={{
          background: config.gradient,
          color: 'white',
          fontWeight: 'bold',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}
        size="small"
      />
    );
  };

  const getTeacherAvatar = (teacherName) => {
    return teacherName.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getSubjectColor = (subject) => {
    const colors = {
      'Advance Database': '#ff6b6b',
      'AIML': '#4ecdc4',
      'PBL': '#45b7d1',
      'IDSL': '#96ceb4'
    };
    return colors[subject] || '#7ae75cff';
  };

  // Filter meetings based on active tab
  const getFilteredMeetings = () => {
    const today = new Date().toISOString().split('T')[0];
    
    if (activeTab === 0) {
      // Upcoming Meetings - show pending and approved meetings with future dates
      return meetings.filter(meeting => 
        (meeting.status === 'pending' || meeting.status === 'approved') && 
        meeting.date >= today
      );
    } else {
      // Meeting History - show completed meetings and past approved meetings
      return meetings.filter(meeting => 
        meeting.status === 'completed' || 
        (meeting.status === 'approved' && meeting.date < today)
      );
    }
  };

  const filteredMeetings = getFilteredMeetings();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px" flexDirection="column">
        <Groups sx={{ fontSize: 64, color: '#6c5ce7', mb: 2, opacity: 0.7 }} />
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>
          Loading your meetings...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', px: { xs: 2, md: 3 } }}>
      {/* Enhanced Header Section */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                {user.role === 'student' ? 'Schedule Meetings' : 'Meeting Requests'}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                {user.role === 'student' 
                  ? 'Connect with teachers and schedule your learning sessions' 
                  : 'Manage student meeting requests and consultations'
                }
              </Typography>
            </Box>
            
            {user.role === 'student' && (
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
                New Meeting
              </Button>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 3, mt: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Groups sx={{ fontSize: 24 }} />
              <Box>
                <Typography variant="h6">{filteredMeetings.length}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {activeTab === 0 ? 'Upcoming' : 'Past'} Meetings
                </Typography>
              </Box>
            </Box>
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

      {/* Enhanced Tabs */}
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
          <Tab icon={<CalendarToday sx={{ mr: 1 }} />} label="Upcoming Meetings" />
          <Tab icon={<History sx={{ mr: 1 }} />} label="Meeting History" />
        </Tabs>
      </Paper>

      {/* Enhanced Meetings Grid */}
      <Grid container spacing={3}>
        {filteredMeetings.map((meeting) => (
          <Grid item xs={12} key={meeting._id}>
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
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Avatar sx={{ 
                      bgcolor: getSubjectColor(meeting.teacherId.subject),
                      fontWeight: 'bold',
                      width: 56,
                      height: 56
                    }}>
                      {getTeacherAvatar(meeting.teacherId.name)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Meeting with {meeting.teacherId.name}
                      </Typography>
                      <Typography color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <School sx={{ fontSize: 16 }} />
                        {meeting.teacherId.subject}
                      </Typography>
                    </Box>
                  </Box>
                  {getStatusChip(meeting.status)}
                </Box>

                {/* Meeting Details */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: 3, 
                  mb: 2,
                  flexWrap: 'wrap'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday sx={{ fontSize: 18, color: 'primary.main' }} />
                    <Typography variant="body2">
                      <strong>Date:</strong> {new Date(meeting.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTime sx={{ fontSize: 18, color: 'primary.main' }} />
                    <Typography variant="body2">
                      <strong>Time:</strong> {meeting.time}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2">
                    <strong>Purpose:</strong> {meeting.purpose}
                  </Typography>
                </Box>

                {/* Show aim and output only for completed meetings in history tab */}
                {activeTab === 1 && meeting.aim && meeting.output && (
                  <Box sx={{ 
                    mt: 2, 
                    p: 2, 
                    backgroundColor: alpha('#667eea', 0.05),
                    border: `1px solid ${alpha('#667eea', 0.2)}`,
                    borderRadius: 2
                  }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      📋 Meeting Summary
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                          🎯 Aim:
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                          {meeting.aim}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                          ✅ Output:
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                          {meeting.output}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}
                
                {user.role === 'teacher' && meeting.status === 'pending' && (
                  <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
                    <Button 
                      size="small" 
                      variant="contained" 
                      color="success"
                      sx={{ borderRadius: 2 }}
                    >
                      Approve
                    </Button>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      color="error"
                      sx={{ borderRadius: 2 }}
                    >
                      Reject
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredMeetings.length === 0 && (
        <Paper sx={{ 
          p: 6, 
          textAlign: 'center', 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)'
        }}>
          <Schedule sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            No meetings {activeTab === 0 ? 'scheduled' : 'in history'}
          </Typography>
          <Typography color="textSecondary" sx={{ fontSize: '1.1rem' }}>
            {user.role === 'student' 
              ? activeTab === 0 
                ? 'Schedule your first meeting with a teacher to get started.'
                : 'No past meetings found in your history.'
              : activeTab === 0
                ? 'No meeting requests from students yet.'
                : 'No meeting history available.'
            }
          </Typography>
        </Paper>
      )}

      {/* Enhanced Create Meeting Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontWeight: 600
        }}>
          Schedule New Meeting
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              select
              label="Select Teacher"
              value={newMeeting.teacherId}
              onChange={(e) => setNewMeeting({ ...newMeeting, teacherId: e.target.value })}
              fullWidth
              variant="outlined"
            >
              {teachers.map((teacher) => (
                <MenuItem key={teacher._id} value={teacher._id}>
                  {teacher.name} - {teacher.subject}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              type="date"
              label="Meeting Date"
              value={newMeeting.date}
              onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
              variant="outlined"
            />
            
            <TextField
              type="time"
              label="Meeting Time"
              value={newMeeting.time}
              onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
              variant="outlined"
            />
            
            <TextField
              label="Purpose of Meeting"
              multiline
              rows={3}
              value={newMeeting.purpose}
              onChange={(e) => setNewMeeting({ ...newMeeting, purpose: e.target.value })}
              fullWidth
              placeholder="Briefly describe what you'd like to discuss..."
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateMeeting}
            variant="contained"
            disabled={!newMeeting.teacherId || !newMeeting.date || !newMeeting.time || !newMeeting.purpose}
            sx={{ 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
            Schedule Meeting
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MeetingScheduler;