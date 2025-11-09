import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  LinearProgress,
  Chip,
  Paper,
  alpha,
  TextField,
  InputAdornment
} from "@mui/material";
import {
  Search,
  EventAvailable,
  CalendarToday,
  Person
} from "@mui/icons-material";
import { API_URL } from "../config";

function StudentAttendance({ user }) {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);

  useEffect(() => {
    const sampleStudents = [
      {
        id: 1,
        name: "REEVA RAWAT",
        email: "reevarawat@adt23socb0845",
        phone: "+91 9049960469",
        department: "Computer Science",
        performance: 85,
        classesAttended: 52,
        totalClasses: 60,
        attendance: 87,
        joinDate: "2025-08-15"
      },
      {
        id: 2,
        name: "VIVEK SHARMA",
        email: "viveksharma@adt23socb1330",
        phone: "+91 8769193133",
        department: "Computer Science",
        performance: 78,
        classesAttended: 48,
        totalClasses: 60,
        attendance: 80,
        joinDate: "2025-08-15"
      },
      {
        id: 3,
        name: "SOHAM ANDHYAL",
        email: "sohamandhyal@adt23socb1140",
        phone: "+91 7058721750",
        department: "Computer Science",
        performance: 92,
        classesAttended: 58,
        totalClasses: 60,
        attendance: 97,
        joinDate: "2025-08-15"
      },
      {
        id: 4,
        name: "RONIT ROY",
        email: "ronitroy@adt23socb1330",
        phone: "+91 9552698899",
        department: "Computer Science",
        performance: 75,
        classesAttended: 45,
        totalClasses: 60,
        attendance: 75,
        joinDate: "2025-08-15"
      }
    ];

    const token = localStorage.getItem("token");
    fetch(`${API_URL}/api/students/attendance`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setStudents)
      .catch(() => {
        console.log("Students attendance fetch failed, using sample data");
        setStudents(sampleStudents);
      });
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredStudents([]);
    } else {
      const filtered = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return '#1dd1a1';
    if (percentage >= 80) return '#54a0ff';
    if (percentage >= 70) return '#feca57';
    return '#ff6b6b';
  };

  const getAttendanceLabel = (percentage) => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 80) return 'Good';
    if (percentage >= 70) return 'Average';
    return 'Needs Improvement';
  };

  const getInitials = (name) => name.split(' ').map(word => word[0]).join('').toUpperCase();

  const getAvatarColor = (name) => {
    const colors = [
      '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4',
      '#feca57', '#ff9ff3', '#54a0ff', '#1dd1a1'
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', px: { xs: 2, md: 3 } }}>
      {/* Header Section */}
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
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center' }}>
                <EventAvailable sx={{ fontSize: 40, mr: 2 }} />
                Attendance Portal
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                CLASS TY CORE 4 • Computer Science • Total Classes: 60
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {students.length}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Class Students
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 3, mt: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person sx={{ fontSize: 24 }} />
              <Box>
                <Typography variant="h6">{students.length}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Total Students
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EventAvailable sx={{ fontSize: 24 }} />
              <Box>
                <Typography variant="h6">
                  {students.length > 0 ? Math.round(students.reduce((acc, s) => acc + s.attendance, 0) / students.length) : 0}%
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Class Avg Attendance
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
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

      {/* Search Section */}
      <Paper sx={{
        p: 4,
        mb: 4,
        borderRadius: 3,
        background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)',
        border: '1px solid rgba(0,0,0,0.05)',
        textAlign: 'center'
      }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#333', mb: 2 }}>
          🔍 Find Your Attendance
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
          Search for your name to view your attendance percentage and details
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by your name (e.g., REEVA RAWAT)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            maxWidth: 500,
            mx: 'auto',
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              background: 'white',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              '&:hover': { boxShadow: '0 6px 25px rgba(0,0,0,0.15)' }
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: 'primary.main' }} />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Search Results */}
      {searchTerm && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: '#333' }}>
            Search Results for "{searchTerm}"
          </Typography>
          {filteredStudents.length > 0 ? (
            <Grid container spacing={3}>
              {filteredStudents.map((student) => (
                <Grid item xs={12} md={6} key={student.id}>
                  {/* Card content unchanged */}
                  {/* ... */}
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)'
            }}>
              <Search sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                No Student Found
              </Typography>
              <Typography color="textSecondary" sx={{ fontSize: '1.1rem', mb: 2 }}>
                No student found with the name "{searchTerm}"
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Try searching with your full name as it appears in the records
              </Typography>
            </Paper>
          )}
        </Box>
      )}

      {!searchTerm && (
        <Paper sx={{
          p: 6,
          textAlign: 'center',
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)'
        }}>
          <EventAvailable sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#333' }}>
            Welcome to Attendance Portal
          </Typography>
          <Typography color="textSecondary" sx={{ fontSize: '1.1rem', mb: 3 }}>
            Search for your name above to view your attendance details and percentage.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Chip label="Total Classes: 60" variant="outlined" />
            <Chip label="Minimum Required: 75%" variant="outlined" color="warning" />
            <Chip label="Class: TY CORE 4" variant="outlined" color="primary" />
          </Box>
        </Paper>
      )}
    </Box>
  );
}

export default StudentAttendance;
