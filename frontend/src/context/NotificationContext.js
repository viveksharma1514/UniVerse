// src/context/NotificationContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useSocket } from './SocketContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { socket } = useSocket();

  /* ================================================================
     ✅ Fetch all notifications
  ================================================================= */
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        updateUnreadCount(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ================================================================
     ✅ Fetch unread count only
  ================================================================= */
  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/notifications/unread-count', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, []);

  /* ================================================================
     ✅ Update unread count from a list
  ================================================================= */
  const updateUnreadCount = (list) => {
    const unread = list.filter((n) => !n.isRead).length;
    setUnreadCount(unread);
  };

  /* ================================================================
     ✅ Mark a single notification as read
  ================================================================= */
  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  /* ================================================================
     ✅ Mark all notifications as read
  ================================================================= */
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/notifications/mark-all-read', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  /* ================================================================
     ✅ Delete a notification
  ================================================================= */
  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n._id !== id));
        await fetchUnreadCount();
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  /* ================================================================
     ✅ Add notification (used for real-time updates)
  ================================================================= */
  const addNotification = useCallback((notif) => {
    setNotifications((prev) => [notif, ...prev]);
    setUnreadCount((prev) => prev + 1);
  }, []);

  /* ================================================================
     ✅ SOCKET LISTENERS
  ================================================================= */
  useEffect(() => {
    if (!socket) return;

    // 🆕 New real-time notification
    socket.on('new-notification', (notif) => {
      console.log('🔔 Real-time notification received:', notif.title);
      addNotification(notif);
    });

    // 🟢 Notification updated (read, etc.)
    socket.on('notification-updated', (updatedNotif) => {
      setNotifications((prev) =>
        prev.map((n) => (n._id === updatedNotif._id ? updatedNotif : n))
      );
      // update count correctly
      updateUnreadCount(
        notifications.map((n) =>
          n._id === updatedNotif._id ? updatedNotif : n
        )
      );
    });

    // ✅ All notifications marked as read
    socket.on('all-notifications-read', () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      console.log('✅ All notifications marked as read (socket)');
    });

    // 🗑️ Notification deleted
    socket.on('notification-deleted', (id) => {
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      console.log(`🗑️ Notification ${id} deleted`);
    });

    return () => {
      socket.off('new-notification');
      socket.off('notification-updated');
      socket.off('all-notifications-read');
      socket.off('notification-deleted');
    };
  }, [socket, addNotification, notifications]);

  /* ================================================================
     ✅ Load on mount
  ================================================================= */
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshUnreadCount: fetchUnreadCount,
    addNotification, // 🔥 added for use by NotificationBell
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
