import React from "react";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Box,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Chat as ChatIcon,
  School as SchoolIcon,
  Groups as GroupsIcon,
  Event as EventIcon,
  DirectionsBus as DirectionsBusIcon,
} from "@mui/icons-material";

const drawerWidth = 240;

function Navigation({ user, activeTab, setActiveTab }) {
  const studentMenuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, id: "dashboard" },
    { text: "Timetable", icon: <ScheduleIcon />, id: "timetable" },
    { text: "Assignments", icon: <AssignmentIcon />, id: "assignments" },
    { text: "Meetings", icon: <PeopleIcon />, id: "meetings" },
    { text: "Teacher Directory", icon: <SchoolIcon />, id: "teachers" },
    { text: "Chat", icon: <ChatIcon />, id: "chat" },
    { text: "Events", icon: <EventIcon />, id: "events" }, // ✅ new Events section
    { text: "Bus Route", icon: <DirectionsBusIcon />, id: "bus" }, // ✅ new Bus Route
  ];

  const teacherMenuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, id: "dashboard" },
    { text: "Schedule", icon: <ScheduleIcon />, id: "schedule" },
    { text: "Assignments", icon: <AssignmentIcon />, id: "assignments" },
    { text: "Meetings", icon: <PeopleIcon />, id: "meetings" },
    { text: "Students", icon: <PeopleIcon />, id: "students" },
    { text: "Chat", icon: <ChatIcon />, id: "chat" },
    { text: "Attendance", icon: <GroupsIcon />, id: "attendance" },
  ];

  const menuItems = user?.role === "student" ? studentMenuItems : teacherMenuItems;

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          background: "linear-gradient(180deg, #000000ff 0%, #8A79FF 100%)",
          color: "white",
          borderRight: "none",
          boxShadow: "4px 0 20px rgba(0,0,0,0.1)",
        },
      }}
      variant="permanent"
      anchor="left"
    >
      {/* Brand / Logo */}
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          py: 2,
          borderBottom: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <Typography
          variant="h6"
          component="div"
          sx={{
            fontWeight: "700",
            letterSpacing: 0.5,
          }}
        >
          🌌 UniVerse
        </Typography>
      </Toolbar>

      {/* Menu Section */}
      <Box sx={{ flexGrow: 1, mt: 2 }}>
        <List>
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <ListItemButton
                key={item.id}
                selected={isActive}
                onClick={() => setActiveTab(item.id)}
                sx={{
                  mx: 2,
                  mb: 1,
                  borderRadius: 2,
                  transition: "0.3s ease",
                  backgroundColor: isActive
                    ? "linear-gradient(90deg, rgba(138,121,255,0.4), rgba(255,107,157,0.3))"
                    : "transparent",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.25)",
                    transform: "scale(1.02)",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: "white",
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: "0.95rem",
                    fontWeight: isActive ? 600 : 400,
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.2)" }} />

      {/* Footer / Role Display */}
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography
          variant="body2"
          sx={{ opacity: 0.8, fontSize: "0.85rem", letterSpacing: 0.4 }}
        >
          {user?.role
            ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
            : "User"}
        </Typography>
      </Box>
    </Drawer>
  );
}

export default Navigation;
