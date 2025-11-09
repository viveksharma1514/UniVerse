import React from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Divider,
} from "@mui/material";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const routes = [
  {
    id: "A",
    name: "Blue Line (A)",
    times: "07:00 • 09:00 • 12:00 • 15:00",
    info: "MIT-ADT ⇄ Swargate ⇄ Deccan",
    color: "#5B8DEF",
  },
  {
    id: "B",
    name: "Green Line (B)",
    times: "07:30 • 10:00 • 13:00 • 16:30",
    info: "MIT-ADT ⇄ Wakad ⇄ Baner",
    color: "#4CAF50",
  },
  {
    id: "C",
    name: "Red Line (C)",
    times: "08:00 • 11:00 • 14:00",
    info: "MIT-ADT ⇄ Magarpatta ⇄ Kharadi",
    color: "#E53935",
  },
];

const BusRoute = () => {
  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        background:
          "linear-gradient(145deg, rgba(255,255,255,0.9), rgba(240,240,255,0.8))",
        borderRadius: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: "700",
              background: "linear-gradient(90deg, #5B8DEF, #A879FF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            <DirectionsBusIcon
              sx={{ fontSize: "2rem", verticalAlign: "middle", mr: 1 }}
            />
            Campus Bus Routes
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              color: "rgba(0,0,0,0.6)",
              mt: 1,
              letterSpacing: 0.3,
            }}
          >
            Navigate your way to campus with ease — explore routes and schedules below.
          </Typography>
        </Box>

        {/* Image Section */}
        <Box
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            mb: 4,
            boxShadow: "0 15px 45px rgba(0,0,0,0.15)",
          }}
        >
          <img
            src="/static/busroute.jpg"
            alt="Bus Route Map"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
            }}
          />
        </Box>

        <Grid container spacing={3}>
          {/* Route Cards */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              {routes.map((r) => (
                <Grid item xs={12} sm={6} key={r.id}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      background: "rgba(255,255,255,0.8)",
                      backdropFilter: "blur(10px)",
                      boxShadow:
                        "0 4px 20px rgba(93, 91, 166, 0.15), inset 0 1px 0 rgba(255,255,255,0.4)",
                      transition: "0.3s ease",
                      "&:hover": {
                        transform: "translateY(-6px)",
                        boxShadow:
                          "0 12px 30px rgba(93, 91, 166, 0.25), inset 0 1px 0 rgba(255,255,255,0.5)",
                      },
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 1,
                        }}
                      >
                        <Box
                          sx={{
                            width: 46,
                            height: 46,
                            borderRadius: "12px",
                            background: r.color,
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <DirectionsBusIcon />
                        </Box>
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              color: "#222",
                            }}
                          >
                            {r.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "rgba(0,0,0,0.6)" }}
                          >
                            {r.info}
                          </Typography>
                        </Box>
                      </Box>

                      <Divider sx={{ my: 1.5 }} />

                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 1,
                          mb: 2,
                        }}
                      >
                        <Chip
                          label={r.times}
                          size="small"
                          sx={{
                            background: "rgba(0,0,0,0.05)",
                            fontWeight: 500,
                          }}
                        />
                        <Chip
                          label={`Route ${r.id}`}
                          size="small"
                          sx={{
                            background: r.color,
                            color: "#fff",
                            fontWeight: 600,
                          }}
                        />
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<LocationOnIcon />}
                        >
                          View Stops
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          sx={{
                            background: `linear-gradient(90deg, ${r.color}, rgba(0,0,0,0.05))`,
                            color: "#fff",
                            "&:hover": {
                              background: r.color,
                            },
                          }}
                        >
                          Timetable
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Info Panel */}
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                p: 3,
                borderRadius: 3,
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(15px)",
                boxShadow: "0 6px 25px rgba(0,0,0,0.1)",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                🚌 Transport Office Info
              </Typography>

              <Typography variant="body2" sx={{ mb: 2, color: "#444" }}>
                • Arrive <strong>10 minutes early</strong> at your pickup point.  
                <br />• Routes may change during holidays or festivals.
              </Typography>

              <Typography variant="body2" sx={{ mb: 2, color: "#444" }}>
                • For route issues or changes, contact:  
                <strong> transport@mituniversity.edu</strong>  
                <br />📞 <strong>+91 7700995130</strong>
              </Typography>

              
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default BusRoute;
