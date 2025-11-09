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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton
} from "@mui/material";
import {
  School,
  Group,
  TrendingUp,
  Email,
  Phone,
  CalendarToday,
  Edit,
  EventAvailable,
  EventBusy
} from "@mui/icons-material";

function TeacherStudents({ user }) {
  const [students, setStudents] = useState([]);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [attendanceDialog, setAttendanceDialog] = useState(false);
  const [performanceScore, setPerformanceScore] = useState(0);
  const [classesAttended, setClassesAttended] = useState(0);
  const [totalClasses, setTotalClasses] = useState(60);

  // Sample students data
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/api/students/teacher", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setStudents)
      .catch(() => {
        console.log("Students fetch failed, using sample data");
        setStudents(sampleStudents);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getPerformanceColor = (score) => {
    if (score >= 90) return '#1dd1a1';
    if (score >= 80) return '#54a0ff';
    if (score >= 70) return '#feca57';
    return '#ff6b6b';
  };

  const getPerformanceLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Average';
    return 'Needs Improvement';
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return '#1dd1a1';
    if (percentage >= 80) return '#54a0ff';
    if (percentage >= 70) return '#feca57';
    return '#ff6b6b';
  };

  const getInitials = (name) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  const getAvatarColor = (name) => {
    const colors = [
      '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', 
      '#feca57', '#ff9ff3', '#54a0ff', '#1dd1a1'
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  const calculateAttendancePercentage = (attended, total) => {
    return Math.round((attended / total) * 100);
  };

  const handleOpenEditDialog = (student) => {
    setSelectedStudent(student);
    setPerformanceScore(student.performance);
    setEditDialog(true);
  };

  const handleOpenAttendanceDialog = (student) => {
    setSelectedStudent(student);
    setClassesAttended(student.classesAttended);
    setTotalClasses(student.totalClasses);
    setAttendanceDialog(true);
  };

  const handleUpdatePerformance = () => {
    if (selectedStudent) {
      const updatedStudents = students.map(student =>
        student.id === selectedStudent.id
          ? { ...student, performance: performanceScore }
          : student
      );
      setStudents(updatedStudents);
      setEditDialog(false);
    }
  };

  const handleUpdateAttendance = () => {
    if (selectedStudent) {
      const attendancePercentage = calculateAttendancePercentage(classesAttended, totalClasses);
      const updatedStudents = students.map(student =>
        student.id === selectedStudent.id
          ? { 
              ...student, 
              classesAttended: classesAttended,
              totalClasses: totalClasses,
              attendance: attendancePercentage
            }
          : student
      );
      setStudents(updatedStudents);
      setAttendanceDialog(false);
    }
  };

  const handleIncrementAttendance = () => {
    if (classesAttended < totalClasses) {
      setClassesAttended(prev => prev + 1);
    }
  };

  const handleDecrementAttendance = () => {
    if (classesAttended > 0) {
      setClassesAttended(prev => prev - 1);
    }
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
                <School sx={{ fontSize: 40, mr: 2 }} />
                My Students
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
                Students Assigned
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 3, mt: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Group sx={{ fontSize: 24 }} />
              <Box>
                <Typography variant="h6">{students.length}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Total Students
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp sx={{ fontSize: 24 }} />
              <Box>
                <Typography variant="h6">
                  {students.length > 0 ? Math.round(students.reduce((acc, s) => acc + s.performance, 0) / students.length) : 0}%
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Avg Performance
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
                  Avg Attendance
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

      {/* Class Info Card */}
      <Paper sx={{ 
        p: 3, 
        mb: 4, 
        borderRadius: 3,
        background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)',
        border: '1px solid rgba(0,0,0,0.05)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#333' }}>
              🎓 STUDENTS ASSIGNED TO YOU
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Class: TY CORE 4 • Department: Computer Science • Semester: 5 • Total Classes: 60
            </Typography>
          </Box>
          <Chip 
            label="Active Class" 
            color="success" 
            variant="filled"
            sx={{ fontWeight: 600, fontSize: '0.9rem' }}
          />
        </Box>
      </Paper>

      {/* Students Grid */}
      <Grid container spacing={3}>
        {students.map((student) => (
          <Grid item xs={12} sm={6} md={4} key={student.id}>
            <Card sx={{
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              border: '1px solid rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 48px rgba(0,0,0,0.15)'
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                {/* Student Avatar and Basic Info */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar
                    sx={{
                      width: 70,
                      height: 70,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                      border: '3px solid white',
                      bgcolor: getAvatarColor(student.name),
                      fontWeight: 'bold',
                      fontSize: '1.5rem'
                    }}
                  >
                    {getInitials(student.name)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                      {student.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {student.department}
                    </Typography>
                  </Box>
                </Box>

                {/* Contact Info */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Email sx={{ fontSize: 18, color: 'primary.main' }} />
                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                      {student.email}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Phone sx={{ fontSize: 18, color: 'secondary.main' }} />
                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                      {student.phone}
                    </Typography>
                  </Box>
                </Box>

                {/* Performance Metrics */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Academic Performance
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip 
                        label={getPerformanceLabel(student.performance)} 
                        size="small"
                        sx={{ 
                          bgcolor: alpha(getPerformanceColor(student.performance), 0.1),
                          color: getPerformanceColor(student.performance),
                          fontWeight: 600
                        }}
                      />
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenEditDialog(student)}
                        sx={{ color: 'primary.main' }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={student.performance}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      mb: 1,
                      bgcolor: alpha(getPerformanceColor(student.performance), 0.2),
                      '& .MuiLinearProgress-bar': {
                        background: `linear-gradient(90deg, ${getPerformanceColor(student.performance)}, ${alpha(getPerformanceColor(student.performance), 0.7)})`,
                        borderRadius: 4
                      }
                    }}
                  />
                  <Typography variant="body2" sx={{ textAlign: 'right', fontWeight: 600, color: getPerformanceColor(student.performance) }}>
                    {student.performance}%
                  </Typography>
                </Box>

                {/* Attendance Metrics */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Attendance
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Chip 
                        label={`${student.classesAttended}/${student.totalClasses}`} 
                        size="small"
                        variant="outlined"
                        color={student.attendance >= 85 ? 'success' : student.attendance >= 75 ? 'warning' : 'error'}
                      />
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenAttendanceDialog(student)}
                        sx={{ color: 'secondary.main' }}
                      >
                        <EventAvailable fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={student.attendance}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      mb: 1,
                      bgcolor: alpha(getAttendanceColor(student.attendance), 0.2),
                      '& .MuiLinearProgress-bar': {
                        background: `linear-gradient(90deg, ${getAttendanceColor(student.attendance)}, ${alpha(getAttendanceColor(student.attendance), 0.7)})`,
                        borderRadius: 4
                      }
                    }}
                  />
                  <Typography variant="body2" sx={{ textAlign: 'right', fontWeight: 600, color: getAttendanceColor(student.attendance) }}>
                    {student.attendance}%
                  </Typography>
                </Box>

                {/* Additional Info */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Since {new Date(student.joinDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Edit Performance Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontWeight: 600
        }}>
          <Edit sx={{ mr: 1, verticalAlign: 'middle' }} />
          Update Performance - {selectedStudent?.name}
        </DialogTitle>
        <DialogContent sx={{ mt: 2, p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Set academic performance score (0-100):
            </Typography>
            <TextField
              type="number"
              label="Performance Score"
              value={performanceScore}
              onChange={(e) => setPerformanceScore(parseInt(e.target.value) || 0)}
              fullWidth
              inputProps={{ min: 0, max: 100 }}
              variant="outlined"
            />
            <LinearProgress
              variant="determinate"
              value={performanceScore}
              sx={{
                height: 10,
                borderRadius: 5,
                bgcolor: alpha(getPerformanceColor(performanceScore), 0.2),
                '& .MuiLinearProgress-bar': {
                  background: `linear-gradient(90deg, ${getPerformanceColor(performanceScore)}, ${alpha(getPerformanceColor(performanceScore), 0.7)})`,
                  borderRadius: 5
                }
              }}
            />
            <Typography variant="body2" sx={{ textAlign: 'center', fontWeight: 600, color: getPerformanceColor(performanceScore) }}>
              Current Score: {performanceScore}% - {getPerformanceLabel(performanceScore)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setEditDialog(false)} sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdatePerformance}
            variant="contained"
            sx={{ 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
            Update Performance
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Attendance Dialog */}
      <Dialog open={attendanceDialog} onClose={() => setAttendanceDialog(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontWeight: 600
        }}>
          <EventAvailable sx={{ mr: 1, verticalAlign: 'middle' }} />
          Update Attendance - {selectedStudent?.name}
        </DialogTitle>
        <DialogContent sx={{ mt: 2, p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="body1">
              Update classes attended for this student:
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, my: 2 }}>
              <IconButton 
                onClick={handleDecrementAttendance}
                disabled={classesAttended <= 0}
                sx={{ 
                  bgcolor: 'error.main', 
                  color: 'white',
                  '&:hover': { bgcolor: 'error.dark' },
                  '&:disabled': { bgcolor: 'grey.300' }
                }}
              >
                <EventBusy />
              </IconButton>
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: getAttendanceColor(calculateAttendancePercentage(classesAttended, totalClasses)) }}>
                  {classesAttended}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  out of {totalClasses} classes
                </Typography>
              </Box>
              
              <IconButton 
                onClick={handleIncrementAttendance}
                disabled={classesAttended >= totalClasses}
                sx={{ 
                  bgcolor: 'success.main', 
                  color: 'white',
                  '&:hover': { bgcolor: 'success.dark' },
                  '&:disabled': { bgcolor: 'grey.300' }
                }}
              >
                <EventAvailable />
              </IconButton>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: getAttendanceColor(calculateAttendancePercentage(classesAttended, totalClasses)), fontWeight: 'bold' }}>
                Attendance: {calculateAttendancePercentage(classesAttended, totalClasses)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={calculateAttendancePercentage(classesAttended, totalClasses)}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  mt: 1,
                  bgcolor: alpha(getAttendanceColor(calculateAttendancePercentage(classesAttended, totalClasses)), 0.2),
                  '& .MuiLinearProgress-bar': {
                    background: `linear-gradient(90deg, ${getAttendanceColor(calculateAttendancePercentage(classesAttended, totalClasses))}, ${alpha(getAttendanceColor(calculateAttendancePercentage(classesAttended, totalClasses)), 0.7)})`,
                    borderRadius: 5
                  }
                }}
              />
            </Box>

            <TextField
              type="number"
              label="Total Classes (Semester)"
              value={totalClasses}
              onChange={(e) => setTotalClasses(parseInt(e.target.value) || 60)}
              fullWidth
              inputProps={{ min: 1 }}
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setAttendanceDialog(false)} sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateAttendance}
            variant="contained"
            sx={{ 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
            Update Attendance
          </Button>
        </DialogActions>
      </Dialog>

      {students.length === 0 && (
        <Paper sx={{ 
          p: 6, 
          textAlign: 'center', 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)'
        }}>
          <School sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            No Students Assigned
          </Typography>
          <Typography color="textSecondary" sx={{ fontSize: '1.1rem' }}>
            Students will appear here once they are assigned to your class.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

export default TeacherStudents;