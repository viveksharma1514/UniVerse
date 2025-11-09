// src/components/Assignments.js
import React, { useState } from "react";
import { Box, Tabs, Tab, Paper, Fade } from "@mui/material";
import AssignmentSystem from "./AssignmentSystem";
import StudyNotesPortal from "./StudyNotesPortal";

function Assignments({ user }) {
  const [tab, setTab] = useState(0);

  const handleChange = (event, newValue) => setTab(newValue);

  return (
    <Fade in timeout={700}>
      <Box sx={{ width: "100%", p: { xs: 1, md: 3 } }}>
        <Paper
          sx={{
            mb: 3,
            borderRadius: 3,
            background: "linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)",
            boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
          }}
        >
          <Tabs
            value={tab}
            onChange={handleChange}
            variant="fullWidth"
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "1rem",
                minHeight: 60,
              },
              "& .Mui-selected": {
                color: "#6C63FF !important",
              },
              "& .MuiTabs-indicator": {
                background: "linear-gradient(90deg, #6C63FF, #8A79FF)",
                height: 4,
                borderRadius: 2,
              },
            }}
          >
            <Tab label="📘 Assignments" />
            <Tab label="📚 Study Notes" />
          </Tabs>
        </Paper>

        <Box>
          {tab === 0 && <AssignmentSystem user={user} />}
          {tab === 1 && <StudyNotesPortal user={user} />}
        </Box>
      </Box>
    </Fade>
  );
}

export default Assignments;
