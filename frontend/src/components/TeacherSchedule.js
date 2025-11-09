// src/components/TeacherSchedule.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Divider,
  Fade,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SchoolIcon from "@mui/icons-material/School";
import RoomIcon from "@mui/icons-material/Room";

function TeacherSchedule({ user }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [classes, setClasses] = useState([]);
  const [open, setOpen] = useState(false);
  const [newClass, setNewClass] = useState({
    subject: "",
    time: "",
    day: "",
    room: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/api/schedule/teacher", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setClasses)
      .catch(() => console.log("Schedule fetch failed"));
  }, []);

  const handleAddClass = async () => {
    const { subject, time, day, room } = newClass;
    if (!subject || !time || !day) {
      return setSnackbar({
        open: true,
        message: "Please fill all required fields (Subject, Day, Time).",
        severity: "warning",
      });
    }

    const token = localStorage.getItem("token");

    try {
      const newClassData = { subject, time, day, room };
      setClasses([...classes, newClassData]);
      setNewClass({ subject: "", time: "", day: "", room: "" });
      setOpen(false);

      await fetch("http://localhost:5000/api/notifications/schedule-class", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject,
          time,
          date: day,
          department: user.department,
        }),
      });

      setSnackbar({
        open: true,
        message: "Class added and students notified successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error scheduling class:", error);
      setSnackbar({
        open: true,
        message: "Failed to schedule class or send notifications.",
        severity: "error",
      });
    }
  };

  const accentGradient = isDark
    ? "linear-gradient(90deg, #7B61FF, #22D3EE)"
    : "linear-gradient(90deg, #6C63FF, #00B4D8)";

  const cardBackground = isDark
    ? "linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.04))"
    : "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(245,245,245,0.9))";

  const textColor = isDark ? "#FFFFFF" : "#111827";

  return (
    <Fade in timeout={700}>
      <Box
        sx={{
          minHeight: "80vh",
          p: 3,
          color: textColor,
          background: isDark
            ? "radial-gradient(circle at 10% 20%, rgba(90, 71, 255, 0.15) 0%, transparent 40%), radial-gradient(circle at 90% 70%, rgba(0, 204, 255, 0.15) 0%, transparent 40%)"
            : "radial-gradient(circle at 10% 20%, rgba(108,99,255,0.05) 0%, transparent 40%), radial-gradient(circle at 90% 70%, rgba(0,180,216,0.05) 0%, transparent 40%)",
          transition: "all 0.3s ease",
        }}
      >
        {/* Header Section */}
        <Paper
          sx={{
            p: 4,
            mb: 5,
            background: isDark
              ? "rgba(255,255,255,0.08)"
              : "rgba(255,255,255,0.7)",
            borderRadius: 4,
            backdropFilter: "blur(20px)",
            boxShadow: isDark
              ? "0 8px 32px rgba(0,0,0,0.25)"
              : "0 8px 32px rgba(0,0,0,0.1)",
          }}
        >
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              background: accentGradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            <CalendarMonthIcon sx={{ mr: 1 }} /> Manage Your Class Schedule
          </Typography>

          <Typography
            sx={{
              color: isDark
                ? "rgba(255,255,255,0.8)"
                : "rgba(0,0,0,0.7)",
              mb: 3,
            }}
          >
            Create, view, and manage your upcoming classes. Students will
            automatically receive updates in real time.
          </Typography>

          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => setOpen(true)}
            sx={{
              background: accentGradient,
              fontWeight: 600,
              color: "#fff",
              borderRadius: 3,
              px: 3,
              py: 1.2,
              boxShadow: isDark
                ? "0 8px 20px rgba(0,0,0,0.25)"
                : "0 8px 20px rgba(0,0,0,0.1)",
              textTransform: "none",
              transition: "0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 12px 25px rgba(0,0,0,0.2)",
              },
            }}
          >
            Add New Class
          </Button>
        </Paper>

        {/* Classes List */}
        <Grid container spacing={3}>
          {classes.length > 0 ? (
            classes.map((cls, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Card
                  sx={{
                    background: cardBackground,
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 4,
                    backdropFilter: "blur(16px)",
                    boxShadow: isDark
                      ? "0 4px 20px rgba(0,0,0,0.3)"
                      : "0 4px 20px rgba(0,0,0,0.1)",
                    color: textColor,
                    p: 1,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: isDark
                        ? "0 12px 25px rgba(255,255,255,0.15)"
                        : "0 12px 25px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        fontWeight: 700,
                        mb: 1,
                      }}
                    >
                      <SchoolIcon
                        sx={{ mr: 1, color: isDark ? "#A78BFA" : "#6C63FF" }}
                      />
                      {cls.subject}
                    </Typography>
                    <Divider sx={{ opacity: 0.2, mb: 1 }} />
                    <Typography
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        opacity: 0.9,
                        mb: 0.5,
                      }}
                    >
                      <CalendarMonthIcon
                        sx={{ mr: 1, color: isDark ? "#38BDF8" : "#00B4D8" }}
                      />
                      {cls.day}
                    </Typography>
                    <Typography
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        opacity: 0.9,
                        mb: 0.5,
                      }}
                    >
                      <AccessTimeIcon
                        sx={{ mr: 1, color: isDark ? "#4ADE80" : "#2DD4BF" }}
                      />
                      {cls.time}
                    </Typography>
                    <Typography
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        opacity: 0.8,
                      }}
                    >
                      <RoomIcon
                        sx={{ mr: 1, color: isDark ? "#A5B4FC" : "#6C63FF" }}
                      />
                      Room: {cls.room || "N/A"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography
              sx={{
                ml: 2,
                color: isDark
                  ? "rgba(255,255,255,0.6)"
                  : "rgba(0,0,0,0.6)",
                fontSize: "1.1rem",
              }}
            >
              No classes scheduled yet.
            </Typography>
          )}
        </Grid>

        {/* Add Class Dialog */}
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: 3,
              p: 1,
              background: isDark
                ? "rgba(30,30,30,0.95)"
                : "rgba(255,255,255,0.98)",
              backdropFilter: "blur(12px)",
            },
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: 700,
              background: accentGradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Add New Class
          </DialogTitle>
          <DialogContent>
            {["Subject", "Day / Date", "Time", "Room"].map((label, i) => (
              <TextField
                key={i}
                label={label}
                fullWidth
                margin="dense"
                value={
                  label === "Subject"
                    ? newClass.subject
                    : label === "Day / Date"
                    ? newClass.day
                    : label === "Time"
                    ? newClass.time
                    : newClass.room
                }
                onChange={(e) =>
                  setNewClass({
                    ...newClass,
                    [label === "Subject"
                      ? "subject"
                      : label === "Day / Date"
                      ? "day"
                      : label === "Time"
                      ? "time"
                      : "room"]: e.target.value,
                  })
                }
              />
            ))}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={handleAddClass}
              variant="contained"
              sx={{
                background: accentGradient,
                fontWeight: 600,
              }}
            >
              Add
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
}

export default TeacherSchedule;
