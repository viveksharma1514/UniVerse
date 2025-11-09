import React, { useState } from "react";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { SchoolRounded } from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

function Register({ onLogin }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    enrollmentId: "",
    department: "",
    subject: "",
    cabinNumber: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, formData);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      onLogin(response.data.user);
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `
          linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)),
          url('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1950&q=80')
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        overflow: "hidden",
        padding: 2,
      }}
    >
      <Container component="main" maxWidth="md">
        <Paper
          elevation={10}
          sx={{
            padding: 6,
            borderRadius: 5,
            backdropFilter: "blur(20px)",
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255,255,255,0.25)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
            maxWidth: "850px",
            margin: "auto",
          }}
        >
          <Box sx={{ textAlign: "center", mb: 5 }}>
            <SchoolRounded
              sx={{
                fontSize: 65,
                color: "white",
                mb: 1,
                background: "rgba(255,255,255,0.1)",
                borderRadius: "50%",
                padding: 2,
              }}
            />
            <Typography
              variant="h4"
              sx={{
                color: "white",
                fontWeight: "bold",
                textShadow: "0 3px 12px rgba(0,0,0,0.5)",
              }}
            >
              UniVerse
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "rgba(255,255,255,0.85)",
                mt: 0.5,
                fontWeight: 400,
              }}
            >
              MIT-ADT University, Pune
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "rgba(255,255,255,0.7)",
                mt: 1,
              }}
            >
              Create your account below
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                background: "rgba(211, 47, 47, 0.9)",
                color: "white",
              }}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="name"
              label="Full Name"
              value={formData.name}
              onChange={handleChange}
              InputLabelProps={{
                style: { color: "rgba(255,255,255,0.85)" },
              }}
              sx={textFieldStyle}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="email"
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleChange}
              InputLabelProps={{
                style: { color: "rgba(255,255,255,0.85)" },
              }}
              sx={textFieldStyle}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              InputLabelProps={{
                style: { color: "rgba(255,255,255,0.85)" },
              }}
              sx={textFieldStyle}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              select
              name="role"
              label="Role"
              value={formData.role}
              onChange={handleChange}
              InputLabelProps={{
                style: { color: "rgba(255,255,255,0.85)" },
              }}
              sx={textFieldStyle}
            >
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="teacher">Teacher</MenuItem>
            </TextField>

            {formData.role === "student" && (
              <>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="enrollmentId"
                  label="Enrollment ID"
                  value={formData.enrollmentId}
                  onChange={handleChange}
                  InputLabelProps={{
                    style: { color: "rgba(255,255,255,0.85)" },
                  }}
                  sx={textFieldStyle}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="department"
                  label="Department"
                  value={formData.department}
                  onChange={handleChange}
                  InputLabelProps={{
                    style: { color: "rgba(255,255,255,0.85)" },
                  }}
                  sx={textFieldStyle}
                />
              </>
            )}

            {formData.role === "teacher" && (
              <>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="subject"
                  label="Subject"
                  value={formData.subject}
                  onChange={handleChange}
                  InputLabelProps={{
                    style: { color: "rgba(255,255,255,0.85)" },
                  }}
                  sx={textFieldStyle}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  name="cabinNumber"
                  label="Cabin Number"
                  value={formData.cabinNumber}
                  onChange={handleChange}
                  InputLabelProps={{
                    style: { color: "rgba(255,255,255,0.85)" },
                  }}
                  sx={textFieldStyle}
                />
              </>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.8,
                borderRadius: 3,
                fontSize: "1.1rem",
                textTransform: "none",
                fontWeight: "bold",
                mt: 3,
                background: "linear-gradient(45deg, #6C63FF, #8A79FF)",
                boxShadow: "0 6px 25px rgba(108,99,255,0.45)",
                "&:hover": {
                  background: "linear-gradient(45deg, #7A72FF, #988AFF)",
                },
              }}
            >
              {loading ? (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <CircularProgress size={22} sx={{ color: "white", mr: 1 }} />
                  Creating Account...
                </Box>
              ) : (
                "Sign Up"
              )}
            </Button>

            <Button
              fullWidth
              variant="text"
              onClick={() => navigate("/login")}
              sx={{
                mt: 2,
                color: "rgba(255,255,255,0.85)",
                "&:hover": { color: "white", textDecoration: "underline" },
              }}
            >
              Already have an account? Sign In
            </Button>
          </Box>

          <Typography
            variant="caption"
            sx={{
              display: "block",
              textAlign: "center",
              mt: 6,
              color: "rgba(255,255,255,0.6)",
            }}
          >
            © 2025 UniVerse. All rights reserved.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}

const textFieldStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 3,
    background: "rgba(255,255,255,0.15)",
    color: "white",
    "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.5)" },
    "&.Mui-focused fieldset": {
      borderColor: "#aab6ff",
      boxShadow: "0 0 12px rgba(170,182,255,0.6)",
    },
  },
  "& .MuiInputBase-input": { color: "white" },
};

export default Register;
