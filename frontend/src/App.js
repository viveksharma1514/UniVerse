import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation
} from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Attendance from './components/Attendance';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';

// 🎨 MUI Theme Configuration
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

// 🔐 Wrapper to handle Login/Register page switching
function AuthPage({ onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  const switchToRegister = () => navigate('/register');
  const switchToLogin = () => navigate('/login');

  return isLoginPage
    ? <Login onLogin={onLogin} switchToRegister={switchToRegister} />
    : <Register onLogin={onLogin} switchToLogin={switchToLogin} />;
}

// ✅ Safe localStorage user parser
function getStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('⚠️ Failed to parse stored user:', err);
    return null;
  }
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Load user from localStorage safely (persistent login)
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = getStoredUser();

    if (token && storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  // ✅ On login success
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // ✅ Logout user
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // ⏳ Loading screen
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography variant="h6" color="primary">
          Loading UniVerse...
        </Typography>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* ✅ Wrap entire app inside SocketProvider + NotificationProvider */}
      <SocketProvider user={user && user._id ? user : getStoredUser()}>
        <NotificationProvider>
          <Router>
            {/* 🔷 Top Navbar */}
            <AppBar position="static" color="primary" elevation={1}>
              <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography
                  variant="h6"
                  component="div"
                  sx={{ fontWeight: 600, letterSpacing: 0.5 }}
                >
                  🌌 UniVerse Platform
                </Typography>

                {user ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      Welcome, {user.name}
                    </Typography>
                    <Button
                      color="inherit"
                      variant="outlined"
                      onClick={handleLogout}
                      sx={{ textTransform: 'none', borderColor: '#fff', color: '#fff' }}
                    >
                      Logout
                    </Button>
                  </Box>
                ) : (
                  <Typography variant="body2" color="inherit">
                    Please log in
                  </Typography>
                )}
              </Toolbar>
            </AppBar>

            {/* 🔗 Routes */}
            <Routes>
              {/* 🔑 Auth Pages */}
              <Route
                path="/login"
                element={
                  user
                    ? <Navigate to="/dashboard" />
                    : <AuthPage onLogin={handleLogin} />
                }
              />
              <Route
                path="/register"
                element={
                  user
                    ? <Navigate to="/dashboard" />
                    : <AuthPage onLogin={handleLogin} />
                }
              />

              {/* 📊 Dashboard */}
              <Route
                path="/dashboard"
                element={
                  user
                    ? <Dashboard user={user} />
                    : <Navigate to="/login" />
                }
              />

              {/* 🕒 Attendance */}
              <Route
                path="/attendance"
                element={
                  user
                    ? <Attendance user={user} />
                    : <Navigate to="/login" />
                }
              />

              {/* 🌐 Default Redirect */}
              <Route
                path="/"
                element={<Navigate to={user ? '/dashboard' : '/login'} />}
              />
            </Routes>
          </Router>
        </NotificationProvider>
      </SocketProvider>
    </ThemeProvider>
  );
}

export default App;
