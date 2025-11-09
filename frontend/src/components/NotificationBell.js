// src/components/NotificationBell.js
import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Popover,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Chip,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Assignment as AssignmentIcon,
  Message as MessageIcon,
  Schedule as ScheduleIcon,
  Grade as GradeIcon,
} from '@mui/icons-material';
import { useNotifications } from '../context/NotificationContext';
import { useSocket } from '../context/SocketContext';

const NotificationBell = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
  } = useNotifications();

  const { socket } = useSocket();
  const open = Boolean(anchorEl);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // 🔔 Listen for live notifications via socket
  useEffect(() => {
    if (!socket) return;

    socket.on('new-notification', (data) => {
      console.log('📩 Real-time notification:', data);

      // Add to context state
      addNotification(data);

      // Optional toast pop-up
      setToast({
        open: true,
        message: data.message || 'You have a new update!',
        severity: 'info',
      });
    });

    return () => {
      socket.off('new-notification');
    };
  }, [socket, addNotification]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_assignment':
        return <AssignmentIcon color="primary" />;
      case 'assignment_graded':
        return <GradeIcon color="success" />;
      case 'new_message':
        return <MessageIcon color="info" />;
      case 'meeting_scheduled':
      case 'meeting_reminder':
        return <ScheduleIcon color="warning" />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'new_assignment':
        return 'primary';
      case 'assignment_graded':
        return 'success';
      case 'new_message':
        return 'info';
      case 'meeting_scheduled':
      case 'meeting_reminder':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { width: 400, maxHeight: 500 },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="div">
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Button size="small" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            )}
          </Box>

          <Divider />

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="textSecondary">No notifications yet</Typography>
            </Box>
          ) : (
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {notifications.map((notification) => (
                <ListItem
                  key={notification._id || Math.random()}
                  sx={{
                    backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                    borderLeft: notification.isRead ? 'none' : '3px solid',
                    borderLeftColor: getNotificationColor(notification.type),
                    mb: 1,
                    borderRadius: 1,
                  }}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => deleteNotification(notification._id)}
                    >
                      ×
                    </IconButton>
                  }
                >
                  <ListItemIcon>{getNotificationIcon(notification.type)}</ListItemIcon>
                  <ListItemText
                    primary={
                      <Box>
                        <Typography variant="subtitle2" component="span">
                          {notification.title}
                        </Typography>
                        <Chip
                          label={formatTime(notification.createdAt || new Date())}
                          size="small"
                          sx={{ ml: 1, height: 20 }}
                        />
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" color="textSecondary">
                        {notification.message}
                        {notification.sender && (
                          <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                            From: {notification.sender.name}
                          </Typography>
                        )}
                      </Typography>
                    }
                    onClick={() => !notification.isRead && markAsRead(notification._id)}
                    sx={{ cursor: notification.isRead ? 'default' : 'pointer' }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Popover>

      {/* 🔔 Snackbar for new live updates */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default NotificationBell;
