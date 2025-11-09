// src/context/SocketContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { Snackbar, Alert } from '@mui/material';
import { API_URL } from '../config'; // ✅ import central API URL

const SocketContext = createContext();
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children, user }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineTeachers, setOnlineTeachers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    if (!user?._id) return; // wait until user data is available

    // ✅ Automatically connect to the right backend (local or Render)
    const newSocket = io(API_URL, {
      transports: ['websocket'],
      withCredentials: true,
      reconnectionAttempts: 5,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('✅ Connected to server via socket.io');

      newSocket.emit('join', { userId: user._id, role: user.role || 'student' });
      console.log(`📡 Joined socket as ${user.role} (${user._id})`);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('❌ Socket disconnected');
    });

    newSocket.on('teachers-updated', (ids) => {
      setOnlineTeachers(ids || []);
      console.log('🟢 Online teachers updated:', ids);
    });

    newSocket.on('receive-message', (msg) => {
      console.log('📩 Message received (global):', msg?.content || msg);
    });

    newSocket.on('new-notification', (data) => {
      console.log('🔔 New notification received:', data);
      setNotifications((prev) => [data, ...prev]);

      // Close existing toast before showing a new one
      setToast({
        open: true,
        message: data?.title
          ? `${data.title}: ${data.message}`
          : data?.message || 'You have a new update!',
        severity: 'info',
      });
    });

    return () => {
      // ✅ Proper cleanup to avoid memory leaks
      newSocket.off('teachers-updated');
      newSocket.off('receive-message');
      newSocket.off('new-notification');
      newSocket.close();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, onlineTeachers, notifications }}>
      {children}

      {/* Global Toast Notification */}
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
    </SocketContext.Provider>
  );
};
