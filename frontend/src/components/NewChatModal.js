import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  TextField,
  Chip,
  Button,
  Paper,
  Divider,
  CircularProgress
} from '@mui/material';
import { Close, Search, School, LocationOn, Phone } from '@mui/icons-material';
import { API_URL } from '../config'; // ✅ centralized API base

const NewChatModal = ({ open, onClose, user }) => {
  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  /* ================================================================
     ✅ Fetch teachers when modal opens (for students only)
  ================================================================= */
  useEffect(() => {
    if (open && user?.role === 'student') {
      fetchTeachers();
    }
  }, [open, user]);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/teachers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const teachersData = await response.json();
        setTeachers(teachersData);
      } else {
        console.error(`❌ Failed to fetch teachers: ${response.status}`);
      }
    } catch (error) {
      console.error('💥 Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  /* ================================================================
     ✅ Start a new chat with selected teacher
  ================================================================= */
  const handleStartChat = async (teacher) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/chats/student-teacher`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ teacherId: teacher._id }),
      });

      if (response.ok) {
        const newChat = await response.json();
        onClose(true, newChat);
      } else {
        console.error(`❌ Failed to start chat: ${response.status}`);
        onClose(false, null);
      }
    } catch (error) {
      console.error('💥 Error starting chat:', error);
      onClose(false, null);
    }
  };

  /* ================================================================
     🧩 Filter teachers by name, subject, or department
  ================================================================= */
  const filteredTeachers = teachers.filter(teacher =>
    teacher.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ================================================================
     🧩 UI Layout
  ================================================================= */
  return (
    <Modal open={open} onClose={() => onClose(false, null)}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        borderRadius: 3,
        boxShadow: 24,
        p: 0,
        maxHeight: '80vh',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <Paper sx={{ 
          p: 2, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: 'white',
          borderRadius: '12px 12px 0 0'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Start New Chat
            </Typography>
            <Button 
              onClick={() => onClose(false, null)} 
              sx={{ color: 'white', minWidth: 'auto' }}
            >
              <Close />
            </Button>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
            Select a teacher to start conversation
          </Typography>
        </Paper>

        {/* Search */}
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search teachers by name, subject or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
            }}
          />
        </Box>

        <Divider />

        {/* Teachers List */}
        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <CircularProgress size={24} sx={{ mb: 1 }} />
              <Typography color="textSecondary">Loading teachers...</Typography>
            </Box>
          ) : filteredTeachers.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <School sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography color="textSecondary">
                {teachers.length === 0 ? 'No teachers available' : 'No teachers found'}
              </Typography>
            </Box>
          ) : (
            <List>
              {filteredTeachers.map((teacher) => (
                <ListItem
                  key={teacher._id}
                  button
                  onClick={() => handleStartChat(teacher)}
                  sx={{ 
                    borderBottom: '1px solid #f0f0f0',
                    '&:hover': {
                      backgroundColor: 'rgba(102, 126, 234, 0.04)'
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar 
                      src={teacher.avatar} 
                      sx={{ 
                        bgcolor: 'primary.main',
                        width: 44,
                        height: 44
                      }}
                    >
                      {teacher.name?.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {teacher.name}
                        </Typography>
                        <Chip
                          label={teacher.isOnline ? 'Online' : 'Offline'}
                          size="small"
                          color={teacher.isOnline ? 'success' : 'default'}
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        {teacher.subject && (
                          <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                            {teacher.subject}
                          </Typography>
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                          {teacher.cabinNumber && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <LocationOn sx={{ fontSize: 14 }} />
                              <Typography variant="caption" color="textSecondary">
                                Cabin {teacher.cabinNumber}
                              </Typography>
                            </Box>
                          )}
                          {teacher.contactNumber && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Phone sx={{ fontSize: 14 }} />
                              <Typography variant="caption" color="textSecondary">
                                {teacher.contactNumber}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                        {teacher.qualifications && (
                          <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                            {teacher.qualifications}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default NewChatModal;
