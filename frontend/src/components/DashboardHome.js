// src/components/DashboardHome.js
import React, { useState, useEffect, useCallback } from "react";
import {
  Typography,
  Paper,
  Box,
  Chip,
  Grid,
  Card,
  CardContent,
  Container,
  LinearProgress,
  Collapse,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import { useSocket } from "../context/SocketContext";

function DashboardHome({ user }) {
  const [assignments, setAssignments] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [notes, setNotes] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [highlightId, setHighlightId] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "info" });

  const { socket } = useSocket();
  const token = localStorage.getItem("token");

  // ✅ Fetch dashboard data with error handling
  const fetchData = useCallback(async () => {
    try {
      const requests = [
        // Fetch assignments
        fetch("http://localhost:5000/api/assignments/student", {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ ok: false })), // Handle failed requests
        
        // Fetch meetings
        fetch("http://localhost:5000/api/meetings/student", {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ ok: false })),
        
        // Fetch notes (with error handling)
        fetch("http://localhost:5000/api/notes", {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ ok: false })),
        
        // Fetch announcements (with error handling)
        fetch("http://localhost:5000/api/announcements", {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ ok: false }))
      ];

      const [aRes, mRes, nRes, anRes] = await Promise.all(requests);

      // Handle responses with error checking
      if (aRes.ok) setAssignments(await aRes.json());
      if (mRes.ok) setMeetings(await mRes.json());
      
      // For notes and announcements, set empty arrays if API fails
      if (nRes.ok) {
        setNotes(await nRes.json());
      } else {
        setNotes([]); // Set empty array if API fails
      }
      
      if (anRes.ok) {
        setAnnouncements(await anRes.json());
      } else {
        setAnnouncements([]); // Set empty array if API fails
      }
    } catch (error) {
      console.error("Dashboard data fetch error:", error);
      // Set default empty arrays for failed APIs
      setNotes([]);
      setAnnouncements([]);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData, user]);

  // ✅ Real-time notifications from socket
  useEffect(() => {
    if (!socket) return;

    const onNewNotification = (notif) => {
      console.log("Socket: new-notification", notif);

      if (notif?.type === "meeting_scheduled" || notif?.type === "meeting_reminder") {
        fetchData();
        setSnack({ open: true, message: `New meeting scheduled: ${notif.title}`, severity: "info" });
        setHighlightId("meetings");
      } else if (notif?.type === "class_scheduled") {
        setAnnouncements((prev) => [
          { title: notif.title, message: notif.message, createdAt: notif.createdAt || new Date() },
          ...prev,
        ]);
        setSnack({ open: true, message: notif.title || "New class scheduled", severity: "info" });
        setHighlightId("announcements");
      } else if (notif?.type === "new_assignment") {
        fetchData();
        setSnack({ open: true, message: `New assignment: ${notif.title}`, severity: "info" });
        setHighlightId("assignments");
      } else {
        setAnnouncements((prev) => [
          { title: notif.title, message: notif.message, createdAt: notif.createdAt || new Date() },
          ...prev,
        ]);
        setSnack({ open: true, message: notif.title || "New update", severity: "info" });
        setHighlightId("announcements");
      }

      setTimeout(() => setHighlightId(null), 3000);
    };

    const onClassScheduled = (payload) => {
      console.log("Socket: class-scheduled", payload);
      if (payload) {
        if (payload.meeting) setMeetings((prev) => [payload.meeting, ...prev]);
        if (payload.announcement) setAnnouncements((prev) => [payload.announcement, ...prev]);
      }
      setSnack({ open: true, message: "New class scheduled", severity: "info" });
      setHighlightId("announcements");
      setTimeout(() => setHighlightId(null), 3000);
    };

    socket.on("new-notification", onNewNotification);
    socket.on("meeting-scheduled", onNewNotification);
    socket.on("class-scheduled", onClassScheduled);

    return () => {
      socket.off("new-notification", onNewNotification);
      socket.off("meeting-scheduled", onNewNotification);
      socket.off("class-scheduled", onClassScheduled);
    };
  }, [socket, fetchData]);

  // ✅ Dynamic stats with fallback values
  const stats =
    user?.role === "teacher"
      ? [
          {
            title: "Assignments to Grade",
            value: `${assignments?.reduce(
              (count, a) => count + (a.submissions?.filter((sub) => sub.marks == null).length || 0),
              0
            )}`,
            icon: <AssignmentIcon fontSize="large" />,
            gradient: "linear-gradient(135deg, #FF9F43 0%, #FF6B6B 100%)",
            key: "assignments",
          },
          {
            title: "Students Assigned",
            value: `${assignments?.reduce((total, a) => total + (a.submissions?.length || 0), 0)}`,
            icon: <PeopleIcon fontSize="large" />,
            gradient: "linear-gradient(135deg, #10AC84 0%, #1DD1A1 100%)",
            key: "students",
          },
          {
            title: "Upcoming Meetings",
            value: `${meetings?.length || 0}`,
            icon: <ScheduleIcon fontSize="large" />,
            gradient: "linear-gradient(135deg, #5F27CD 0%, #54A0FF 100%)",
            key: "meetings",
          },
          {
            title: "Announcements Shared",
            value: `${announcements?.length || 0}`,
            icon: <NotificationsIcon fontSize="large" />,
            gradient: "linear-gradient(135deg, #EE5253 0%, #F368E0 100%)",
            key: "announcements",
          },
        ]
      : [
          {
            title: "Pending Assignments",
            value: `${assignments?.filter((a) => a.submissionStatus !== "submitted").length || 0}`,
            icon: <AssignmentIcon fontSize="large" />,
            gradient: "linear-gradient(135deg, #FF9F43 0%, #FF6B6B 100%)",
            key: "assignments",
          },
          {
            title: "Upcoming Meetings",
            value: `${meetings?.length || 0}`,
            icon: <PeopleIcon fontSize="large" />,
            gradient: "linear-gradient(135deg, #10AC84 0%, #1DD1A1 100%)",
            key: "meetings",
          },
          {
            title: "Shared Study Notes",
            value: `${notes?.length || 0}`,
            icon: <NotificationsIcon fontSize="large" />,
            gradient: "linear-gradient(135deg, #5F27CD 0%, #54A0FF 100%)",
            key: "notes",
          },
          {
            title: "Teacher Updates",
            value: `${announcements?.length || 0}`,
            icon: <ScheduleIcon fontSize="large" />,
            gradient: "linear-gradient(135deg, #EE5253 0%, #F368E0 100%)",
            key: "announcements",
          },
        ];

  return (
    <Box
      sx={{
        backgroundImage: 'url("/dashboard-bg.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        p: 3,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at 20% 40%, rgba(255,255,255,0.06), transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.06), transparent 40%)",
          zIndex: 0,
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
        {/* Welcome Section */}
        <Paper
          sx={{
            p: 4,
            mb: 4,
            background: "rgba(255,255,255,0.08)",
            borderRadius: 4,
            backdropFilter: "blur(20px)",
            boxShadow: "0 0 30px rgba(255,255,255,0.12)",
            color: "white",
          }}
        >
          <Typography
            variant="h3"
            gutterBottom
            sx={{
              fontWeight: 700,
              background: "linear-gradient(90deg, #1c1351ff, #67243aff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Welcome back, {user.name}!
          </Typography>
          <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.8)" }}>
            Here's a quick look at your academic world today.
          </Typography>
        </Paper>

        {/* User Info */}
        <Paper
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 4,
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(15px)",
            color: "white",
            boxShadow: "0 4px 30px rgba(0,0,0,0.2)",
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            User Information
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <Typography>
              <strong>Role:</strong> <Chip label={user.role} color="primary" />
            </Typography>
            <Typography>
              <strong>Email:</strong> {user.email}
            </Typography>
            {user.enrollmentId && (
              <Typography>
                <strong>Enrollment ID:</strong> {user.enrollmentId}
              </Typography>
            )}
            {user.department && (
              <Typography>
                <strong>Department:</strong> {user.department}
              </Typography>
            )}
            {user.subject && (
              <Typography>
                <strong>Subject:</strong> {user.subject}
              </Typography>
            )}
          </Box>
        </Paper>

        {/* Stats */}
        <Grid container spacing={3}>
          {stats.map((stat) => {
            const isHighlighted = highlightId === stat.key;
            return (
              <Grid item xs={12} sm={6} md={3} key={stat.key}>
                <Collapse in timeout={400}>
                  <Card
                    sx={{
                      borderRadius: 4,
                      background: "rgba(255,255,255,0.10)",
                      backdropFilter: "blur(12px)",
                      transition: "all 0.35s ease",
                      overflow: "hidden",
                      color: "white",
                      position: "relative",
                      transform: isHighlighted ? "scale(1.02)" : "none",
                      boxShadow: isHighlighted
                        ? "0 18px 60px rgba(0,0,0,0.3)"
                        : "0 8px 30px rgba(0,0,0,0.18)",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        filter: "drop-shadow(0 18px 60px rgba(0,0,0,0.25))",
                      },
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "6px",
                        background: stat.gradient,
                      },
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                            {stat.title}
                          </Typography>
                          <Typography
                            variant="h4"
                            sx={{
                              fontWeight: 700,
                              background: stat.gradient,
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                            }}
                          >
                            {stat.value}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: "50%",
                            background: "linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
                          }}
                        >
                          {stat.icon}
                        </Box>
                      </Box>

                      <LinearProgress
                        variant="determinate"
                        value={Math.min(Number(stat.value) * 10, 100)}
                        sx={{
                          mt: 2,
                          height: 6,
                          borderRadius: 3,
                          background: "rgba(255,255,255,0.06)",
                          "& .MuiLinearProgress-bar": {
                            background: stat.gradient,
                          },
                        }}
                      />
                    </CardContent>
                  </Card>
                </Collapse>
              </Grid>
            );
          })}
        </Grid>
      </Container>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack({ ...snack, open: false })}
          severity={snack.severity}
          sx={{ width: "100%" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default DashboardHome;