import React, { useState, useEffect, useMemo } from 'react';
import {
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  TextField,
  InputAdornment,
  Avatar,
  alpha,
  IconButton,
  Fade,
  Slide,
  Skeleton,
  Button
} from '@mui/material';
import {
  Search,
  Email,
  Phone,
  LocationOn,
  School,
  Bookmark,
  BookmarkBorder,
  Chat as ChatIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';

function TeacherDirectory({ user }) {
  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());
  const { socket, onlineTeachers } = useSocket(); // ✅ Get socket and online teacher list

  // ✅ Memoized mock teacher data to prevent ESLint warnings
  const mockTeachers = useMemo(() => [
    {
      _id: '1',
      name: 'Prof. Dr. Anant Kaulage',
      email: 'anantkaulage@university.edu',
      subject: 'Advance Database',
      cabinNumber: 'S-602',
      contactNumber: '7709935130',
      qualifications: 'PhD in Computer Science',
      experience: '15+ years',
      rating: 4.8
    },
    {
      _id: '2',
      name: 'Prof. Swati Sharma',
      email: 'swati@university.edu',
      subject: 'AIML',
      cabinNumber: 'S-205',
      contactNumber: '9876543210',
      qualifications: 'M.Tech in Artificial Intelligence',
      experience: '10+ years',
      rating: 4.6
    },
    {
      _id: '3',
      name: 'Prof. Ravi Kumar',
      email: 'ravi@university.edu',
      subject: 'PBL',
      cabinNumber: 'S-502',
      contactNumber: '7999498783',
      qualifications: 'PhD in Physics',
      experience: '12+ years',
      rating: 4.9
    },
    {
      _id: '4',
      name: 'Prof. Srikant Patel',
      email: 'srikant@university.edu',
      subject: 'IDSL',
      cabinNumber: 'S-421',
      contactNumber: '9887766554',
      qualifications: 'PhD in Data Science',
      experience: '8+ years',
      rating: 4.7
    },
    {
      _id: '5',
      name: 'Prof. Meera Desai',
      email: 'meera@university.edu',
      subject: 'Mathematics',
      cabinNumber: 'S-315',
      contactNumber: '7654321890',
      qualifications: 'PhD in Applied Mathematics',
      experience: '14+ years',
      rating: 4.5
    },
    {
      _id: '6',
      name: 'Prof. Rajesh Verma',
      email: 'rajesh@university.edu',
      subject: 'Computer Networks',
      cabinNumber: 'S-418',
      contactNumber: '9900112233',
      qualifications: 'M.Tech in Network Security',
      experience: '9+ years',
      rating: 4.4
    }
  ], []);

  // ✅ Simulate API fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      setTeachers(mockTeachers);
      setLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [mockTeachers]);

  // ✅ Start chat with teacher
  const handleMessageTeacher = async (teacherId) => {
    try {
      const res = await axios.post(
        'http://localhost:5000/api/chats/student-teacher',
        { teacherId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      const chat = res.data;
      console.log('Chat opened/created:', chat);

      if (socket && chat && chat._id) {
        socket.emit('join-chat', chat._id);
        alert(`Chat started with ${chat.teacher.name}`);
      }
    } catch (error) {
      console.error('Error starting chat:', error.response?.data || error.message);
      alert('Failed to start chat.');
    }
  };

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFavorite = (teacherId) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      newFavorites.has(teacherId)
        ? newFavorites.delete(teacherId)
        : newFavorites.add(teacherId);
      return newFavorites;
    });
  };

  const getSubjectColor = (subject) => {
    const colors = {
      'Advance Database': '#6c3f82ff',
      AIML: '#4ecdc4',
      PBL: '#45b7d1',
      IDSL: '#96ceb4',
      Mathematics: '#598ec0ff',
      'Computer Networks': '#ff9ff3'
    };
    return colors[subject] || '#7ae75cff';
  };

  const getAvatarColor = (name) => {
    const colors = [
      '#412540ff', '#4ecdc4', '#45b7d1', '#96ceb4',
      '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  if (loading) {
    return (
      <Box sx={{ maxWidth: 1200, margin: '0 auto', px: { xs: 2, md: 3 } }}>
        <Skeleton variant="rectangular" width="100%" height={180} sx={{ borderRadius: 3, mb: 4 }} />
        <Skeleton variant="rectangular" width="100%" height={60} sx={{ borderRadius: 3, mb: 4 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Skeleton variant="rectangular" width="100%" height={280} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', px: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 3,
          p: 4,
          mb: 4,
          color: 'white'
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
          👨‍🏫 Teacher Directory
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
          Connect with our experienced faculty members — meet in person or chat online!
        </Typography>
      </Box>

      {/* Search */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by teacher name or subject..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: 'primary.main' }} />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Teachers Grid */}
      <Grid container spacing={3}>
        {filteredTeachers.map((teacher, index) => {
          const isOnline = onlineTeachers.includes(teacher._id);

          return (
            <Grid item xs={12} sm={6} md={4} key={teacher._id}>
              <Slide in={true} direction="up" timeout={index * 200}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 16px 48px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Box
                      sx={{
                        background: `linear-gradient(135deg, ${getSubjectColor(
                          teacher.subject
                        )} 0%, ${alpha(getSubjectColor(teacher.subject), 0.8)} 100%)`,
                        color: 'white',
                        p: 3,
                        borderTopLeftRadius: 12,
                        borderTopRightRadius: 12,
                        position: 'relative'
                      }}
                    >
                      <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 1 }}>
                        <Chip
                          label={isOnline ? 'Online' : 'Offline'}
                          size="small"
                          sx={{
                            backgroundColor: isOnline ? '#2ecc71' : '#95a5a6',
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                        <IconButton
                          size="small"
                          sx={{ color: 'white', background: 'rgba(255,255,255,0.2)' }}
                          onClick={() => toggleFavorite(teacher._id)}
                        >
                          {favorites.has(teacher._id) ? <Bookmark /> : <BookmarkBorder />}
                        </IconButton>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            width: 70,
                            height: 70,
                            border: '3px solid white',
                            bgcolor: getAvatarColor(teacher.name),
                            fontWeight: 'bold',
                            fontSize: '1.5rem'
                          }}
                        >
                          {teacher.name.split(' ').map((n) => n[0]).join('')}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {teacher.name}
                          </Typography>
                          <Chip
                            label={teacher.subject}
                            size="small"
                            sx={{
                              background: 'rgba(255,255,255,0.2)',
                              color: 'white',
                              fontWeight: 600
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>

                    <Box sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Email sx={{ fontSize: 20, color: 'primary.main' }} />
                        <Typography variant="body2">{teacher.email}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Phone sx={{ fontSize: 20, color: 'primary.main' }} />
                        <Typography variant="body2">{teacher.contactNumber}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <LocationOn sx={{ fontSize: 20, color: 'primary.main' }} />
                        <Typography variant="body2">Cabin {teacher.cabinNumber}</Typography>
                      </Box>

                      <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>
                        Qualifications:
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {teacher.qualifications}
                      </Typography>
                      <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>
                        Experience:
                      </Typography>
                      <Typography variant="body2">{teacher.experience}</Typography>

                      <Button
                        fullWidth
                        variant="contained"
                        sx={{
                          mt: 2,
                          borderRadius: 2,
                          backgroundColor: isOnline ? 'primary.main' : 'grey.500',
                        }}
                        disabled={!isOnline}
                        onClick={() => handleMessageTeacher(teacher._id)}
                        startIcon={<ChatIcon />}
                      >
                        {isOnline ? 'Message Teacher' : 'Offline'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Slide>
            </Grid>
          );
        })}
      </Grid>

      {/* No Results */}
      {filteredTeachers.length === 0 && (
        <Fade in={true}>
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
            <School sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              No Teachers Found
            </Typography>
            <Typography color="textSecondary" sx={{ mb: 3 }}>
              Try adjusting your search or filters.
            </Typography>
            <Button variant="outlined" onClick={() => setSearchTerm('')}>
              Clear Search
            </Button>
          </Paper>
        </Fade>
      )}
    </Box>
  );
}

export default TeacherDirectory;
