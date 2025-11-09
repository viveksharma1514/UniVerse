import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar,
  Chip,
  IconButton,
} from '@mui/material';
import {
  VideoCall,
  AddCircle,
  People,
  AccessTime,
  Description,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const MeetingOnlineSection = ({ user }) => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [openAttendance, setOpenAttendance] = useState(false);
  const [attendanceList, setAttendanceList] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    subject: '',
    date: '',
  });
  const [activeMeeting, setActiveMeeting] = useState(null);

  // ✅ Fetch Meetings
  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint =
        user.role === 'teacher'
          ? 'http://localhost:5000/api/meetingonline/teacher'
          : 'http://localhost:5000/api/meetingonline/student';

      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setMeetings(data);
    } catch (err) {
      console.error('Fetch meetings error:', err);
    } finally {
      setLoading(false);
    }
  }, [user.role]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  // ✅ Create Meeting
  const handleCreateMeeting = async () => {
    if (!form.title || !form.date) {
      alert('Please enter a title and select a valid date & time.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const jitsiRoom = `${user.name.replace(/\s+/g, '_')}_${Date.now()}`;
      const link = `https://meet.jit.si/${jitsiRoom}`;

      const res = await fetch('http://localhost:5000/api/meetingonline', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          date: new Date(form.date).toISOString(), // ✅ ensure correct date format
          link,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error('❌ Create meeting failed:', text);
        alert(`Error: ${res.status}`);
        return;
      }

      setOpenCreate(false);
      setForm({ title: '', description: '', subject: '', date: '' });
      fetchMeetings();
    } catch (err) {
      console.error('Create meeting error:', err);
    }
  };

  // ✅ Delete Meeting (Teacher Only)
  const handleDeleteMeeting = async (meetingId) => {
    if (!window.confirm('Are you sure you want to delete this meeting?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/meetingonline/${meetingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        alert('Failed to delete meeting.');
        return;
      }

      fetchMeetings(); // refresh
    } catch (err) {
      console.error('Delete meeting error:', err);
    }
  };

  // ✅ Join Meeting
  const handleJoinMeeting = async (meetingId, link) => {
    if (user.role === 'student') {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/attendanceonline/${meetingId}/join`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    setActiveMeeting(link);
  };

  // ✅ View Attendance
  const handleViewAttendance = async (meetingId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/attendanceonline/${meetingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setAttendanceList(data);
        setOpenAttendance(true);
      }
    } catch (err) {
      console.error('Fetch attendance error:', err);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontWeight: 700,
          background: 'linear-gradient(90deg, #4f46e5, #6d28d9)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 3,
        }}
      >
        🗓️ Online Meetings
      </Typography>

      {user.role === 'teacher' && (
        <Button
          variant="contained"
          startIcon={<AddCircle />}
          sx={{
            mb: 3,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            px: 3,
            py: 1.3,
            fontWeight: 600,
            '&:hover': {
              background: 'linear-gradient(135deg, #5850ec, #7c3aed)',
            },
          }}
          onClick={() => setOpenCreate(true)}
        >
          Create New Meeting
        </Button>
      )}

      {loading ? (
        <CircularProgress />
      ) : meetings.length === 0 ? (
        <Typography color="text.secondary">No upcoming meetings found.</Typography>
      ) : (
        <Grid container spacing={3}>
          {meetings.map((m) => (
            <Grid item xs={12} md={6} key={m._id}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 4,
                  background: 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 35px rgba(0,0,0,0.15)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      sx={{
                        bgcolor: '#6d28d9',
                        mr: 2,
                        width: 50,
                        height: 50,
                        fontSize: '1.2rem',
                        fontWeight: 700,
                      }}
                    >
                      {m.title?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {m.title}
                      </Typography>
                      <Chip
                        label={m.subject || 'General'}
                        color="primary"
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </Box>

                  {/* Delete Button for Teacher */}
                  {user.role === 'teacher' && (
                    <IconButton color="error" onClick={() => handleDeleteMeeting(m._id)}>
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <AccessTime fontSize="small" />{' '}
                  {new Date(m.date).toLocaleString([], {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Typography>

                {m.description && (
                  <Typography
                    variant="body2"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: '#4b5563',
                      mb: 2,
                      gap: 1,
                    }}
                  >
                    <Description fontSize="small" />
                    {m.description}
                  </Typography>
                )}

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<VideoCall />}
                    onClick={() => handleJoinMeeting(m._id, m.link)}
                    sx={{
                      borderRadius: 3,
                      flex: 1,
                      background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #4338ca, #6d28d9)',
                      },
                    }}
                  >
                    {user.role === 'teacher' ? 'Start Meeting' : 'Join Meeting'}
                  </Button>

                  {user.role === 'teacher' && (
                    <Button
                      variant="outlined"
                      startIcon={<People />}
                      onClick={() => handleViewAttendance(m._id)}
                      sx={{
                        borderRadius: 3,
                        borderColor: '#6d28d9',
                        color: '#6d28d9',
                        '&:hover': {
                          borderColor: '#4f46e5',
                          background: 'rgba(99,102,241,0.1)',
                        },
                      }}
                    >
                      View Attendance
                    </Button>
                  )}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Meeting Dialog */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>Schedule New Meeting</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <TextField
            label="Description"
            multiline
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <TextField label="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          <TextField
            label="Date & Time"
            type="datetime-local"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button
            onClick={handleCreateMeeting}
            variant="contained"
            sx={{
              borderRadius: 3,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              '&:hover': { background: 'linear-gradient(135deg, #5850ec, #7c3aed)' },
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Attendance Dialog */}
      <Dialog open={openAttendance} onClose={() => setOpenAttendance(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>👥 Meeting Attendance</DialogTitle>
        <DialogContent dividers>
          {attendanceList.length === 0 ? (
            <Typography color="text.secondary">No students have joined yet.</Typography>
          ) : (
            <List>
              {attendanceList.map((a, i) => (
                <React.Fragment key={i}>
                  <ListItem>
                    <Avatar sx={{ bgcolor: '#6366f1', mr: 2 }}>
                      {a.studentId?.name?.charAt(0).toUpperCase()}
                    </Avatar>
                    <ListItemText
                      primary={a.studentId?.name}
                      secondary={
                        a.joinedAt
                          ? `Joined: ${new Date(a.joinedAt).toLocaleString()}`
                          : 'No timestamp'
                      }
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAttendance(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Jitsi Meeting Embed */}
      {activeMeeting && (
        <Box
          sx={{
            mt: 4,
            height: '80vh',
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          }}
        >
          <iframe
            src={activeMeeting}
            title="Jitsi Meeting"
            allow="camera; microphone; fullscreen; display-capture"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            }}
          ></iframe>
        </Box>
      )}
    </Box>
  );
};

export default MeetingOnlineSection;
