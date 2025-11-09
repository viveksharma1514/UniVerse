import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Card,
  CardContent,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Avatar
} from '@mui/material';
import {
  People,
  CalendarToday,
  CheckCircle,
  Cancel,
  BeachAccess,
  BarChart,
  Save,
  Class,
  School
} from '@mui/icons-material';
import { format } from 'date-fns';

const API_BASE = 'http://localhost:5000/api';

function Attendance({ user }) {
  const [classes] = useState(['TY CORE 3', 'TY CORE 4', 'TY CORE 5']);
  const [selectedClass, setSelectedClass] = useState('TY CORE 4');
  const [attendanceData, setAttendanceData] = useState(null);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [statsDialog, setStatsDialog] = useState(false);
  const [attendanceStats, setAttendanceStats] = useState([]);

  // Fetch attendance data function
  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/attendance/${selectedClass}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch attendance data');
      const data = await response.json();
      setAttendanceData(data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setMessage('Error loading attendance data');
    } finally {
      setLoading(false);
    }
  };

  // Debugging effect
  useEffect(() => {
    console.log('🔍 Attendance Debug:');
    console.log('User role:', user?.role);
    console.log('Selected class:', selectedClass);
    console.log('Should fetch data:', user?.role === 'teacher');
  }, [user, selectedClass]);

  // Fetch attendance data when class changes
  useEffect(() => {
    if (user.role === 'teacher') {
      fetchAttendanceData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, user.role]);

  const handleStatusChange = (rollNo, status) => {
    if (!attendanceData) return;

    const updatedStudents = attendanceData.students.map(student => {
      if (student.rollNo === rollNo) {
        const todayAttendance = student.attendance.find(
          att => format(new Date(att.date), 'yyyy-MM-dd') === attendanceDate
        );

        if (todayAttendance) {
          student.attendance = student.attendance.map(att =>
            format(new Date(att.date), 'yyyy-MM-dd') === attendanceDate
              ? { ...att, status }
              : att
          );
        } else {
          student.attendance.push({
            date: new Date(attendanceDate),
            status: status
          });
        }
      }
      return student;
    });

    setAttendanceData({
      ...attendanceData,
      students: updatedStudents
    });
  };

  const getTodayStatus = (student) => {
    const todayRecord = student.attendance.find(
      att => format(new Date(att.date), 'yyyy-MM-dd') === attendanceDate
    );
    return todayRecord ? todayRecord.status : null;
  };

  const saveAttendance = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');

      // Filter out students without rollNo and ensure status is valid
      const attendanceDataToSave = attendanceData.students
        .filter(student => student.rollNo) // Only students with rollNo
        .map(student => ({
          rollNo: student.rollNo,
          status: getTodayStatus(student) || 'absent'
        }));

      // Validate we have data to save
      if (attendanceDataToSave.length === 0) {
        setMessage('No attendance data to save');
        return;
      }

      const response = await fetch(`${API_BASE}/attendance/${selectedClass}/mark`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: attendanceDate,
          attendanceData: attendanceDataToSave
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save attendance');
      }
      
      setMessage('Attendance saved successfully!');
      setTimeout(() => setMessage(''), 3000);
      
      // Refresh data after saving
      fetchAttendanceData();
    } catch (error) {
      console.error('Error saving attendance:', error);
      setMessage('Error saving attendance: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const getAttendanceStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/attendance/${selectedClass}/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch stats');
      const stats = await response.json();
      setAttendanceStats(stats);
      setStatsDialog(true);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setMessage('Error loading statistics');
    }
  };

  const getStatusChip = (status) => {
    const config = {
      present: { color: 'success', icon: <CheckCircle />, label: 'Present' },
      absent: { color: 'error', icon: <Cancel />, label: 'Absent' },
      leave: { color: 'warning', icon: <BeachAccess />, label: 'Leave' }
    };
    const configItem = config[status] || config.absent;

    return (
      <Chip
        icon={configItem.icon}
        label={configItem.label}
        color={configItem.color}
        size="small"
        variant="filled"
      />
    );
  };

  if (user.role !== 'teacher') {
    return (
      <Box textAlign="center" py={8}>
        <School sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Access Restricted
        </Typography>
        <Typography color="textSecondary">
          Attendance management is available only for teachers.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          <People sx={{ verticalAlign: 'middle', mr: 2 }} />
          Attendance Management
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button variant="outlined" startIcon={<BarChart />} onClick={getAttendanceStats}>
            View Statistics
          </Button>
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={20} /> : <Save />}
            onClick={saveAttendance}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Attendance'}
          </Button>
        </Box>
      </Box>

      {message && (
        <Alert severity={message.includes('Error') ? 'error' : 'success'} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      {/* Class Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Select Class</InputLabel>
                <Select
                  value={selectedClass}
                  label="Select Class"
                  onChange={(e) => setSelectedClass(e.target.value)}
                  startAdornment={<Class sx={{ mr: 1, color: 'text.secondary' }} />}
                >
                  {classes.map(className => (
                    <MenuItem key={className} value={className}>
                      {className}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="date"
                label="Attendance Date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip icon={<CheckCircle />} label="Present" color="success" variant="outlined" />
                <Chip icon={<Cancel />} label="Absent" color="error" variant="outlined" />
                <Chip icon={<BeachAccess />} label="Leave" color="warning" variant="outlined" />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Attendance Sheet */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: '70vh' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}>
                  Roll No.
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}>
                  Student Name
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}>
                  Today's Status
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white' }}>
                  Mark Attendance
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Loading attendance data...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                attendanceData?.students?.map((student) => {
                  const todayStatus = getTodayStatus(student);
                  return (
                    <TableRow
                      key={student.rollNo}
                      sx={{
                        '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                        '&:hover': { bgcolor: 'action.selected' }
                      }}
                    >
                      <TableCell>
                        <Typography variant="h6" color="primary">
                          {student.rollNo}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                            {student.studentName.split(' ').map(n => n[0]).join('')}
                          </Avatar>
                          <Typography variant="body1">
                            {student.studentName}
                            {[47, 48, 50, 56].includes(student.rollNo) && (
                              <Chip
                                label="Your Class"
                                size="small"
                                color="secondary"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {todayStatus ? getStatusChip(todayStatus) : (
                          <Chip label="Not Marked" variant="outlined" />
                        )}
                      </TableCell>
                      <TableCell>
                        <RadioGroup
                          row
                          value={todayStatus || ''}
                          onChange={(e) =>
                            handleStatusChange(student.rollNo, e.target.value)
                          }
                        >
                          <FormControlLabel
                            value="present"
                            control={<Radio color="success" />}
                            label="Present"
                          />
                          <FormControlLabel
                            value="absent"
                            control={<Radio color="error" />}
                            label="Absent"
                          />
                          <FormControlLabel
                            value="leave"
                            control={<Radio color="warning" />}
                            label="Leave"
                          />
                        </RadioGroup>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Statistics Dialog */}
      <Dialog open={statsDialog} onClose={() => setStatsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <BarChart sx={{ verticalAlign: 'middle', mr: 1 }} />
          Attendance Statistics - {selectedClass}
        </DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Roll No.</TableCell>
                  <TableCell>Student Name</TableCell>
                  <TableCell align="center">Present</TableCell>
                  <TableCell align="center">Total</TableCell>
                  <TableCell align="center">Percentage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendanceStats.map((stat) => (
                  <TableRow key={stat.rollNo}>
                    <TableCell>{stat.rollNo}</TableCell>
                    <TableCell>{stat.studentName}</TableCell>
                    <TableCell align="center">{stat.presentDays}</TableCell>
                    <TableCell align="center">{stat.totalDays}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${stat.percentage}%`}
                        color={
                          parseFloat(stat.percentage) >= 75
                            ? 'success'
                            : parseFloat(stat.percentage) >= 50
                            ? 'warning'
                            : 'error'
                        }
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Attendance;