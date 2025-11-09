import React from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  Card,
  CardContent,
  Avatar,
  Divider,
} from "@mui/material";
import {

  School,
  EmojiEvents,
  Code,
  SportsSoccer,
  MusicNote,

} from "@mui/icons-material";

const Events = ({ user }) => {
  const upcomingEvents = [
    {
      title: "Hackathon 2025 Registration Open!",
      date: "Nov 15, 2025",
      description:
        "Join the annual inter-college hackathon hosted by the Coding Club. Exciting prizes and internship opportunities await!",
      icon: <Code />,
      color: "#6366f1",
    },
    {
      title: "Annual Cultural Fest",
      date: "Dec 10, 2025",
      description:
        "Get ready for two days of music, dance, art and fun at the college cultural fest — ‘Vibrance 2025’.",
      icon: <MusicNote />,
      color: "#f43f5e",
    },
    {
      title: "Sports Meet 2025",
      date: "Jan 5, 2026",
      description:
        "The Sports Club invites you to participate in inter-department games including football, badminton, and cricket.",
      icon: <SportsSoccer />,
      color: "#22c55e",
    },
  ];

  const clubs = [
    {
      name: "Coding Club",
      desc: "Workshops, projects & hackathons for all programming enthusiasts.",
      color: "#6366f1",
      icon: <Code />,
    },
    {
      name: "Cultural Club",
      desc: "Dance, drama, music, and creativity at its best!",
      color: "#ec4899",
      icon: <MusicNote />,
    },
    {
      name: "Sports Club",
      desc: "Encouraging students to stay active and participate in college leagues.",
      color: "#22c55e",
      icon: <SportsSoccer />,
    },
    {
      name: "Research & Innovation Cell",
      desc: "Get mentorship and support for academic research & startup ideas.",
      color: "#0ea5e9",
      icon: <School />,
    },
  ];

  return (
    <Box
      sx={{
        background:
          "linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #e0e7ff 100%)",
        minHeight: "80vh",
        borderRadius: 3,
        p: { xs: 2, md: 4 },
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          mb: 3,
          color: "#1e293b",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <EmojiEvents sx={{ color: "#6366f1" }} />
        College Events & Clubs
      </Typography>

      {/* Upcoming Events Section */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          background: "rgba(255,255,255,0.8)",
          borderRadius: 3,
          backdropFilter: "blur(10px)",
          boxShadow: "0 4px 20px rgba(99,102,241,0.1)",
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          📅 Upcoming Events
        </Typography>

        <Grid container spacing={3}>
          {upcomingEvents.map((event, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  p: 2,
                  borderRadius: 3,
                  background: "rgba(255,255,255,0.9)",
                  boxShadow: `0 6px 16px ${event.color}22`,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: `0 10px 20px ${event.color}44`,
                  },
                }}
              >
                <CardContent>
                  <Avatar
                    sx={{
                      bgcolor: event.color,
                      width: 46,
                      height: 46,
                      mb: 1,
                    }}
                  >
                    {event.icon}
                  </Avatar>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "#1e293b" }}
                  >
                    {event.title}
                  </Typography>
                  <Chip
                    label={event.date}
                    size="small"
                    sx={{
                      mt: 1,
                      background: `${event.color}15`,
                      color: event.color,
                      fontWeight: 500,
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 1.5,
                      color: "#475569",
                      lineHeight: 1.6,
                    }}
                  >
                    {event.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Club Section */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          background: "rgba(255,255,255,0.8)",
          borderRadius: 3,
          backdropFilter: "blur(10px)",
          boxShadow: "0 4px 20px rgba(99,102,241,0.1)",
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          🎓 College Clubs & Societies
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={3}>
          {clubs.map((club, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  p: 2,
                  borderRadius: 3,
                  background: "rgba(255,255,255,0.9)",
                  boxShadow: `0 5px 15px ${club.color}22`,
                  transition: "0.3s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: `0 10px 25px ${club.color}55`,
                  },
                }}
              >
                <CardContent sx={{ textAlign: "center" }}>
                  <Avatar
                    sx={{
                      bgcolor: club.color,
                      mx: "auto",
                      mb: 1,
                    }}
                  >
                    {club.icon}
                  </Avatar>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: club.color,
                      mb: 1,
                    }}
                  >
                    {club.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#475569", lineHeight: 1.5 }}
                  >
                    {club.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default Events;
