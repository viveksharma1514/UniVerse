import React, { useState } from "react";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  InputAdornment,
  CircularProgress,
  IconButton,
  Alert,
  Link,
} from "@mui/material";
import {
  EmailRounded,
  LockRounded,
  Visibility,
  VisibilityOff,
  SchoolRounded,
} from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      onLogin(response.data.user);
    } catch (error) {
      setError(error.response?.data?.message || "Login failed");
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
            padding: 8,
            borderRadius: 5,
            backdropFilter: "blur(25px)",
            background: "rgba(255, 255, 255, 0.10)", // more transparent
            border: "1px solid rgba(255,255,255,0.25)",
            boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
            maxWidth: "950px", // wider card
            margin: "auto",
          }}
        >
          {/* Logo and Title */}
          <Box sx={{ textAlign: "center", mb: 5 }}>
            <SchoolRounded
              sx={{
                fontSize: 65,
                color: "white",
                mb: 2,
                background: "rgba(255,255,255,0.1)",
                borderRadius: "50%",
                padding: 2,
              }}
            />
            <Typography
              variant="h3"
              sx={{
                color: "white",
                fontWeight: "bold",
                textShadow: "0 3px 12px rgba(0,0,0,0.5)",
              }}
            >
              UniVerse
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: "rgba(255,255,255,0.85)",
                mt: 0.5,
                fontWeight: 400,
              }}
            >
              MIT-ADT University, Pune
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "rgba(255,255,255,0.8)",
                mt: 2,
                fontWeight: 400,
              }}
            >
              Sign in to continue
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 4,
                borderRadius: 2,
                background: "rgba(211, 47, 47, 0.9)",
                color: "white",
              }}
            >
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit}>
            {/* Email Field */}
            <TextField
              fullWidth
              required
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputLabelProps={{
                style: { color: "rgba(255,255,255,0.85)" },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailRounded sx={{ color: "#aab6ff" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 4,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  background: "rgba(255,255,255,0.18)",
                  color: "white",
                  "& fieldset": {
                    borderColor: "rgba(255,255,255,0.3)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255,255,255,0.5)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#aab6ff",
                    boxShadow: "0 0 12px rgba(170,182,255,0.6)",
                  },
                },
                "& .MuiInputBase-input": {
                  color: "white",
                },
              }}
            />

            {/* Password Field */}
            <TextField
              fullWidth
              required
              type={showPassword ? "text" : "password"}
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputLabelProps={{
                style: { color: "rgba(255,255,255,0.85)" },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockRounded sx={{ color: "#aab6ff" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <VisibilityOff sx={{ color: "#aab6ff" }} />
                      ) : (
                        <Visibility sx={{ color: "#aab6ff" }} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 5,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  background: "rgba(255,255,255,0.18)",
                  color: "white",
                  "& fieldset": {
                    borderColor: "rgba(255,255,255,0.3)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255,255,255,0.5)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#aab6ff",
                    boxShadow: "0 0 12px rgba(170,182,255,0.6)",
                  },
                },
                "& .MuiInputBase-input": {
                  color: "white",
                },
              }}
            />

            {/* Submit Button */}
            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.8,
                borderRadius: 3,
                fontSize: "1.1rem",
                textTransform: "none",
                fontWeight: "bold",
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
                  Signing in...
                </Box>
              ) : (
                "Sign In"
              )}
            </Button>

            {/* Links */}
            <Box
              sx={{
                mt: 3,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Link
                component="button"
                onClick={() => navigate("/register")}
                sx={{
                  color: "rgba(255,255,255,0.85)",
                  fontWeight: "bold",
                  textDecoration: "none",
                  "&:hover": { color: "white", textDecoration: "underline" },
                }}
              >
                Create account
              </Link>

              <Link
                href="#"
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  "&:hover": { color: "white", textDecoration: "underline" },
                }}
              >
                Forgot password?
              </Link>
            </Box>
          </Box>

          {/* Footer */}
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

export default Login;
