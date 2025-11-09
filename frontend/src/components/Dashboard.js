import React, { useState } from "react";
import { Box, Toolbar, AppBar, Button, Paper, Fade } from "@mui/material";
import Navigation from "./Navigation";
import DashboardHome from "./DashboardHome";
import MeetingOnlineSection from "./MeetingOnlineSection";
import Timetable from "./Timetable";
import Assignments from "./Assignments";
import TeacherDirectory from "./TeacherDirectory";
import ChatDashboard from "./ChatDashboard";
import Events from "./Events";
import NotificationBell from "./NotificationBell";
import BusRoute from "./BusRoute";
import TeacherSchedule from "./TeacherSchedule";
import TeacherStudents from "./TeacherStudents";
import StudentAttendance from "./StudentAttendance";
import { API_URL } from "../config"; // ✅ Added for future-safe API calls

function Dashboard({ user }) {
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const renderContent = () => {
    console.log("Active Tab:", activeTab);
    console.log("User Role:", user.role);

    switch (activeTab) {
      case "dashboard":
        return <DashboardHome user={user} />;
      case "meetings":
        return <MeetingOnlineSection user={user} />;
      case "schedule":
        return user.role === "teacher" ? (
          <TeacherSchedule user={user} />
        ) : (
          <Timetable user={user} />
        );
      case "students":
        return user.role === "teacher" ? (
          <TeacherStudents user={user} />
        ) : (
          <StudentAttendance user={user} />
        );
      case "timetable":
        return <Timetable user={user} />;
      case "assignments":
        return <Assignments user={user} />;
      case "teachers":
        return <TeacherDirectory user={user} />;
      case "chat":
        return (
          <ChatDashboard user={user} onBack={() => setActiveTab("dashboard")} />
        );
      case "events":
        return <Events user={user} />;
      case "attendance":
        return user.role === "teacher" ? (
          <TeacherStudents user={user} />
        ) : (
          <StudentAttendance user={user} />
        );
      case "bus":
        return <BusRoute user={user} />;
      default:
        return <DashboardHome user={user} />;
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #371e57ff 0%, #73697bff 100%)",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 15% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 85% 30%, rgba(255, 119, 198, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 50% 80%, rgba(120, 220, 255, 0.2) 0%, transparent 50%)
          `,
          zIndex: 0,
        },
      }}
    >
      {/* Sidebar Navigation */}
      <Navigation user={user} activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Area */}
      <Box component="main" sx={{ flexGrow: 1, position: "relative", zIndex: 2 }}>
        {/* App Bar */}
        <AppBar
          position="fixed"
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(20px)",
            color: "white",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            borderBottom: "1px solid rgba(255,255,255,0.2)",
            backgroundImage:
              "linear-gradient(135deg, rgba(108, 99, 255, 0.2), rgba(138, 121, 255, 0.1))",
          }}
        >
          <Toolbar sx={{ minHeight: "80px !important", py: 1 }}>
            <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center", gap: 2 }} />
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <NotificationBell />
              <Button
                variant="outlined"
                onClick={handleLogout}
                sx={{
                  color: "white",
                  borderColor: "rgba(255,255,255,0.4)",
                  borderWidth: 2,
                  borderRadius: 3,
                  px: 3,
                  py: 1.2,
                  fontWeight: "600",
                  letterSpacing: 0.5,
                  background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(10px)",
                  textTransform: "none",
                  fontSize: "0.9rem",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.2)",
                    borderColor: "rgba(255,255,255,0.7)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 25px rgba(255,255,255,0.2)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Sign Out
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Toolbar sx={{ minHeight: "80px !important" }} />
        <Fade in timeout={700}>
          <Box
            sx={{
              p: { xs: 2, md: 4 },
              transition: "all 0.4s ease",
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 4,
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(20px)",
                boxShadow: `
                  0 25px 50px rgba(0,0,0,0.15),
                  0 0 0 1px rgba(255,255,255,0.3),
                  inset 0 1px 0 rgba(255,255,255,0.6)
                `,
                minHeight: "70vh",
                transition:
                  "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                border: "1px solid rgba(255,255,255,0.5)",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "6px",
                  background:
                    "linear-gradient(90deg, #b8eefeff, #8A79FF, #FF6B9D, #6C63FF)",
                  backgroundSize: "300% 100%",
                  animation: "shimmer 3s ease infinite",
                },
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: `
                    0 35px 60px rgba(0,0,0,0.2),
                    0 0 0 1px rgba(255,255,255,0.4),
                    inset 0 1px 0 rgba(255,255,255,0.8)
                  `,
                },
                "@keyframes shimmer": {
                  "0%": { backgroundPosition: "0% 0%" },
                  "50%": { backgroundPosition: "100% 0%" },
                  "100%": { backgroundPosition: "0% 0%" },
                },
              }}
            >
              {renderContent()}
            </Paper>
          </Box>
        </Fade>
      </Box>

      {/* Floating Decorative Elements */}
      <Box
        sx={{
          position: "fixed",
          top: "10%",
          right: "5%",
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "linear-gradient(45deg, #d6cfcfff, #8A79FF)",
          opacity: 0.1,
          filter: "blur(20px)",
          zIndex: 1,
          animation: "float 6s ease-in-out infinite",
          "@keyframes float": {
            "0%, 100%": { transform: "translateY(0px) scale(1)" },
            "50%": { transform: "translateY(-20px) scale(1.05)" },
          },
        }}
      />
      <Box
        sx={{
          position: "fixed",
          bottom: "15%",
          left: "8%",
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "linear-gradient(45deg, #FF6B9D, #FFA36B)",
          opacity: 0.08,
          filter: "blur(15px)",
          zIndex: 1,
          animation: "float 4s ease-in-out infinite 1s",
        }}
      />
    </Box>
  );
}

export default Dashboard;
