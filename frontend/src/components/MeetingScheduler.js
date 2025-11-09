import React, { useState, useEffect } from "react";
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
  alpha,
} from "@mui/material";
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
  History,
} from "@mui/icons-material";
import axios from "axios";
import { API_URL } from "../config"; // ✅ Use central config

function MeetingScheduler({ user }) {
  const [meetings, setMeetings] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);

  const [newMeeting, setNewMeeting] = useState({
    teacherId: "",
    date: "",
    time: "",
    purpose: "",
  });

  /* ==========================================================
     ✅ Fetch Teachers & Meetings from Backend
  ========================================================== */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");

      try {
        const [teachersRes, meetingsRes] = await Promise.all([
          axios.get(`${API_URL}/api/teachers`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/api/meetings`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setTeachers(teachersRes.data || []);
        setMeetings(meetingsRes.data || []);
      } catch (error) {
        console.error("Error fetching meeting data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ==========================================================
     ✅ Create New Meeting (POST)
  ========================================================== */
  const handleCreateMeeting = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/api/meetings`,
        newMeeting,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMeetings((prev) => [response.data, ...prev]);
      setOpenDialog(false);
      setNewMeeting({ teacherId: "", date: "", time: "", purpose: "" });
    } catch (error) {
      console.error("Error creating meeting:", error);
    }
  };

  /* ==========================================================
     ✅ Meeting Status Helpers
  ========================================================== */
  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { color: "warning", icon: <Pending />, gradient: "linear-gradient(135deg, #ffd700, #ffb347)" },
      approved: { color: "success", icon: <Check />, gradient: "linear-gradient(135deg, #4CAF50, #45a049)" },
      rejected: { color: "error", icon: <Close />, gradient: "linear-gradient(135deg, #f44336, #d32f2f)" },
      completed: { color: "primary", icon: <Check />, gradient: "linear-gradient(135deg, #2196F3, #1976D2)" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Chip
        icon={config.icon}
        label={status.charAt(0).toUpperCase() + status.slice(1)}
        sx={{
          background: config.gradient,
          color: "white",
          fontWeight: "bold",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        }}
        size="small"
      />
    );
  };

  const getTeacherAvatar = (teacherName) =>
    teacherName.split(" ").map((n) => n[0]).join("").toUpperCase();

  const getSubjectColor = (subject) => {
    const colors = {
      "Advance Database": "#ff6b6b",
      AIML: "#4ecdc4",
      PBL: "#45b7d1",
      IDSL: "#96ceb4",
    };
    return colors[subject] || "#7ae75cff";
  };

  /* ==========================================================
     ✅ Filter Meetings for Tabs
  ========================================================== */
  const getFilteredMeetings = () => {
    const today = new Date().toISOString().split("T")[0];

    if (activeTab === 0) {
      return meetings.filter(
        (m) =>
          (m.status === "pending" || m.status === "approved") &&
          m.date >= today
      );
    } else {
      return meetings.filter(
        (m) =>
          m.status === "completed" ||
          (m.status === "approved" && m.date < today)
      );
    }
  };

  const filteredMeetings = getFilteredMeetings();

  /* ==========================================================
     🧭 Render
  ========================================================== */
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
        flexDirection="column"
      >
        <Groups sx={{ fontSize: 64, color: "#6c5ce7", mb: 2, opacity: 0.7 }} />
        <Typography variant="h6" sx={{ color: "text.secondary" }}>
          Loading your meetings...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, margin: "0 auto", px: { xs: 2, md: 3 } }}>
      {/* Header Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: 3,
          p: 4,
          mb: 4,
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box sx={{ position: "relative", zIndex: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <Box>
              <Typography variant="h3" sx={{ fontWeight: "bold", mb: 1 }}>
                {user.role === "student"
                  ? "Schedule Meetings"
                  : "Meeting Requests"}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                {user.role === "student"
                  ? "Connect with teachers and schedule your learning sessions"
                  : "Manage student meeting requests and consultations"}
              </Typography>
            </Box>

            {user.role === "student" && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setOpenDialog(true)}
                sx={{
                  background: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "white",
                  "&:hover": {
                    background: "rgba(255,255,255,0.3)",
                  },
                }}
              >
                New Meeting
              </Button>
            )}
          </Box>

          <Box sx={{ display: "flex", gap: 3, mt: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Groups sx={{ fontSize: 24 }} />
              <Box>
                <Typography variant="h6">{filteredMeetings.length}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {activeTab === 0 ? "Upcoming" : "Past"} Meetings
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper
        sx={{
          width: "100%",
          mb: 4,
          borderRadius: 3,
          background: "linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          sx={{
            "& .MuiTab-root": {
              fontWeight: 600,
              fontSize: "1rem",
              textTransform: "none",
              minHeight: 60,
            },
          }}
        >
          <Tab
            icon={<CalendarToday sx={{ mr: 1 }} />}
            label="Upcoming Meetings"
          />
          <Tab icon={<History sx={{ mr: 1 }} />} label="Meeting History" />
        </Tabs>
      </Paper>

      {/* Meetings Grid */}
      <Grid container spacing={3}>
        {filteredMeetings.map((m) => (
          <Grid item xs={12} key={m._id}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                border: "1px solid rgba(0,0,0,0.05)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 48px rgba(0,0,0,0.15)",
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 2,
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: getSubjectColor(m.teacherId?.subject),
                        fontWeight: "bold",
                        width: 56,
                        height: 56,
                      }}
                    >
                      {getTeacherAvatar(m.teacherId?.name || "T")}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, mb: 0.5 }}
                      >
                        Meeting with {m.teacherId?.name}
                      </Typography>
                      <Typography
                        color="textSecondary"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <School sx={{ fontSize: 16 }} />
                        {m.teacherId?.subject}
                      </Typography>
                    </Box>
                  </Box>
                  {getStatusChip(m.status)}
                </Box>

                <Box sx={{ display: "flex", gap: 3, mb: 2, flexWrap: "wrap" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CalendarToday
                      sx={{ fontSize: 18, color: "primary.main" }}
                    />
                    <Typography variant="body2">
                      <strong>Date:</strong>{" "}
                      {new Date(m.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AccessTime
                      sx={{ fontSize: 18, color: "primary.main" }}
                    />
                    <Typography variant="body2">
                      <strong>Time:</strong> {m.time}
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    <strong>Purpose:</strong> {m.purpose}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog for new meeting */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            fontWeight: 600,
          }}
        >
          Schedule New Meeting
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              select
              label="Select Teacher"
              value={newMeeting.teacherId}
              onChange={(e) =>
                setNewMeeting({ ...newMeeting, teacherId: e.target.value })
              }
              fullWidth
              variant="outlined"
            >
              {teachers.map((t) => (
                <MenuItem key={t._id} value={t._id}>
                  {t.name} - {t.subject}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="date"
              label="Meeting Date"
              value={newMeeting.date}
              onChange={(e) =>
                setNewMeeting({ ...newMeeting, date: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              fullWidth
              variant="outlined"
            />
            <TextField
              type="time"
              label="Meeting Time"
              value={newMeeting.time}
              onChange={(e) =>
                setNewMeeting({ ...newMeeting, time: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Purpose of Meeting"
              multiline
              rows={3}
              value={newMeeting.purpose}
              onChange={(e) =>
                setNewMeeting({ ...newMeeting, purpose: e.target.value })
              }
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
            disabled={
              !newMeeting.teacherId ||
              !newMeeting.date ||
              !newMeeting.time ||
              !newMeeting.purpose
            }
            sx={{
              borderRadius: 2,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
