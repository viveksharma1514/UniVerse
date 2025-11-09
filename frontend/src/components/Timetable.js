// src/components/Timetable.js
import React from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Chip,
  Avatar,
  useTheme,
  Tooltip,
} from "@mui/material";
import ScheduleIcon from "@mui/icons-material/Schedule";

/**
 * Modern Timetable (Full-page 6-day grid)
 * - Monday -> Saturday
 * - Replace `schedule` entries with your real timetable data
 */

const subjectColors = {
  AIML: { bg: "linear-gradient(135deg,#FFE58A, #FFDD55)", text: "#2b2b2b" },
  ADL: { bg: "linear-gradient(135deg,#D6B3FF,#B98BFF)", text: "#2b0836" },
  SCIL: { bg: "linear-gradient(135deg,#B9F6CA,#74E08C)", text: "#063b15" },
  PBL: { bg: "linear-gradient(135deg,#C8F7FF,#7ED0FF)", text: "#01384a" },
  IDSL: { bg: "linear-gradient(135deg,#FFB3C6,#FF7FA3)", text: "#3a0920" },
  LIBRARY: { bg: "linear-gradient(135deg,#ECECEC,#DCDCDC)", text: "#222" },
  DEFAULT: { bg: "linear-gradient(135deg,#ffffff,#f7f7f7)", text: "#222" },
};

const sampleSchedule = {
  Monday: [
    { time: "08:45 - 09:40", subj: "PE-I HCI", teacher: "Prof. Amit", room: "AU", tag: "Online" },
    { time: "09:40 - 10:35", subj: "PBL-III", teacher: "Prof. Rahil", room: "S-111" },
    { time: "10:50 - 11:45", subj: "AIML", teacher: "Prof. Swati", room: "SPO" },
    { time: "11:45 - 12:40", subj: "SCIL (APT)", teacher: "Prof. Anant", room: "APT" },
    { time: "13:40 - 14:35", subj: "IDSL", teacher: "Prof. Srikant", room: "SND" },
    { time: "14:35 - 15:30", subj: "Mentor Meeting", teacher: "Mentor", room: "-", tag: "Meeting" },
  ],
  Tuesday: [
    { time: "08:45 - 09:40", subj: "PBL-III", teacher: "Prof. Rahil", room: "S-111" },
    { time: "09:40 - 10:35", subj: "SCIL (PS)", teacher: "Prof. Swati", room: "S115" },
    { time: "10:50 - 11:45", subj: "AIML Lab", teacher: "Prof. Swati", room: "L-101", tag: "Lab" },
    { time: "13:40 - 14:35", subj: "ADL", teacher: "Prof. Anant", room: "ANK" },
  ],
  Wednesday: [
    { time: "08:45 - 09:40", subj: "SCIL (PS)", teacher: "Prof. Swati", room: "S115" },
    { time: "10:50 - 11:45", subj: "AIML", teacher: "Prof. Swati", room: "SPO" },
    { time: "13:40 - 14:35", subj: "PBL Review", teacher: "Prof. Rahil", room: "S111" },
  ],
  Thursday: [
    { time: "08:45 - 09:40", subj: "ADL", teacher: "Prof. Anant", room: "S516" },
    { time: "10:50 - 11:45", subj: "AIML Lab", teacher: "Prof. Swati", room: "L-101", tag: "Lab" },
    { time: "13:40 - 14:35", subj: "Doubt Solving", teacher: "TA", room: "S-419", tag: "Session" },
  ],
  Friday: [
    { time: "08:45 - 09:40", subj: "Library", teacher: "Lib Staff", room: "Library" },
    { time: "10:50 - 11:45", subj: "PBL - Mentoring", teacher: "Prof. Rahil", room: "S111" },
    { time: "13:40 - 14:35", subj: "Expert Session", teacher: "Guest", room: "AUD" },
  ],
  Saturday: [
    { time: "09:00 - 10:30", subj: "PBL - III Review", teacher: "Prof. Rahil", room: "Online", tag: "Online" },
    { time: "11:00 - 12:00", subj: "PAL", teacher: "Lab Incharge", room: "Lab" },
  ],
};

function Timetable() {
  const theme = useTheme();

  const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const getStyleForSubj = (s) => {
    if (!s) return subjectColors.DEFAULT;
    const key = Object.keys(subjectColors).find((k) => s.toUpperCase().includes(k));
    return subjectColors[key] || subjectColors.DEFAULT;
  };

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
            <ScheduleIcon />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Class Timetable (TY4 — CORE-4)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Academic Year: 2025-26 · Semester V · Monday → Saturday
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2}>
          {dayOrder.map((day) => (
            <Grid item xs={12} sm={6} md={4} key={day}>
              <Paper
                elevation={6}
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  p: 2,
                  minHeight: 240,
                  display: "flex",
                  flexDirection: "column",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.72), rgba(255,255,255,0.6))",
                  backdropFilter: "blur(8px)",
                }}
              >
                <Box sx={{ mb: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {day}
                  </Typography>
                  <Chip label={`${sampleSchedule[day]?.length || 0} items`} size="small" />
                </Box>

                <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
                  {sampleSchedule[day] && sampleSchedule[day].length > 0 ? (
                    sampleSchedule[day].map((slot, idx) => {
                      const style = getStyleForSubj(slot.subj);
                      return (
                        <Tooltip key={idx} title={`${slot.teacher} • ${slot.room}`} arrow>
                          <Paper
                            elevation={2}
                            sx={{
                              p: 1.2,
                              borderRadius: 2,
                              display: "flex",
                              gap: 1,
                              alignItems: "center",
                              justifyContent: "space-between",
                              background: style.bg,
                              color: style.text,
                              transition: "transform .15s ease, box-shadow .15s ease",
                              "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 30px rgba(0,0,0,0.12)" },
                            }}
                          >
                            <Box sx={{ display: "flex", gap: 1, alignItems: "center", flex: 1 }}>
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                  {slot.subj}
                                </Typography>
                                <Typography variant="caption" sx={{ display: "block", opacity: 0.85 }}>
                                  {slot.teacher} • {slot.room}
                                </Typography>
                              </Box>
                            </Box>

                            <Box sx={{ textAlign: "right", ml: 1 }}>
                              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                {slot.time}
                              </Typography>
                              {slot.tag && (
                                <Chip
                                  size="small"
                                  label={slot.tag}
                                  sx={{
                                    mt: 0.5,
                                    bgcolor: "rgba(255,255,255,0.35)",
                                    color: "#111",
                                    fontWeight: 700,
                                  }}
                                />
                              )}
                            </Box>
                          </Paper>
                        </Tooltip>
                      );
                    })
                  ) : (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                      <Typography variant="body2" color="text.secondary">
                        No scheduled classes
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Legend */}
        <Box sx={{ mt: 3, display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
          <Typography variant="subtitle2" sx={{ mr: 1, fontWeight: 700 }}>
            Legend:
          </Typography>
          {Object.entries(subjectColors).map(([k, v]) => (
            k === "DEFAULT" ? null : (
              <Chip
                key={k}
                label={k}
                size="small"
                sx={{
                  background: v.bg,
                  color: v.text,
                  borderRadius: 1,
                  fontWeight: 700,
                }}
              />
            )
          ))}
        </Box>
      </Container>
    </Box>
  );
}

export default Timetable;
