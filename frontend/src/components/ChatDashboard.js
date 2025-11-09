import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Paper,
  Chip,
  Avatar,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack,
  Add,
  Forum,
  Group,
  Person,
  ChatRounded,
} from "@mui/icons-material";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import NewChatModal from "./NewChatModal";
import { useSocket } from "../context/SocketContext";
import { motion } from "framer-motion";

const ChatDashboard = ({ user, onBack }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const { socket } = useSocket();

  useEffect(() => {
    fetchChats();
    if (socket && user) {
      socket.emit("join", { userId: user._id, role: user.role });
    }
  }, [socket, user]);

  const fetchChats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/chats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setChats(data);
      }
    } catch (err) {
      console.error("Error fetching chats:", err);
    }
  };

  const handleNewChat = (created, newChat) => {
    setModalOpen(false);
    if (created && newChat) {
      setChats((prev) => [newChat, ...prev]);
      setSelectedChat(newChat);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f9fafc 0%, #eef1f8 50%, #e8ebf4 100%)",
        color: "#1e293b",
        overflow: "hidden",
      }}
    >
      {/* NAVBAR */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: "rgba(255, 255, 255, 0.75)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(0,0,0,0.05)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          color: "#1e293b",
        }}
      >
        <Toolbar>
          <IconButton onClick={onBack} sx={{ color: "#475569", mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Forum sx={{ fontSize: 30, color: "#6366f1", mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            UniVerse Messages
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Chip
              icon={<Group sx={{ color: "#6366f1 !important" }} />}
              label={`${chats.length} Chats`}
              sx={{
                background: "rgba(99,102,241,0.1)",
                color: "#1e293b",
                fontWeight: 500,
              }}
            />
            <Chip
              icon={<Person sx={{ color: "#6366f1 !important" }} />}
              label={user.role}
              sx={{
                background: "rgba(99,102,241,0.1)",
                color: "#1e293b",
                textTransform: "capitalize",
              }}
            />
            <Tooltip title="Start a new chat">
              <IconButton
                onClick={() => setModalOpen(true)}
                sx={{
                  background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
                  color: "white",
                  boxShadow: "0 0 10px rgba(99,102,241,0.4)",
                  "&:hover": {
                    transform: "scale(1.07)",
                    boxShadow: "0 0 16px rgba(99,102,241,0.6)",
                  },
                }}
              >
                <Add />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* BODY */}
      <Grid container sx={{ height: "calc(100vh - 80px)" }}>
        {/* LEFT: Chat List */}
        <Grid item xs={12} md={4}>
          <Paper
            component={motion.div}
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            sx={{
              height: "100%",
              borderRadius: 0,
              background: "rgba(255, 255, 255, 0.75)",
              backdropFilter: "blur(16px)",
              color: "#1e293b",
              borderRight: "1px solid rgba(0,0,0,0.05)",
              boxShadow: "0 8px 30px rgba(0,0,0,0.05)",
            }}
          >
            <Box sx={{ p: 2, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
              <Typography variant="h6" fontWeight={600}>
                Conversations
              </Typography>
              <Typography variant="body2" sx={{ color: "#6b7280" }}>
                {chats.length > 0
                  ? `${chats.length} Active Chats`
                  : "No conversations yet"}
              </Typography>
            </Box>
            <ChatList
              chats={chats}
              selectedChat={selectedChat}
              onSelectChat={setSelectedChat}
              user={user}
            />
          </Paper>
        </Grid>

        {/* RIGHT: Chat Window */}
        <Grid item xs={12} md={8}>
          <Paper
            component={motion.div}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            sx={{
              height: "100%",
              background:
                "linear-gradient(180deg, #ffffff 0%, #f3f4f6 50%, #e5e7eb 100%)",
              backdropFilter: "blur(20px)",
              borderRadius: 0,
              position: "relative",
              color: "#1e293b",
              boxShadow: "0 8px 30px rgba(0,0,0,0.05)",
            }}
          >
            {selectedChat ? (
              <ChatWindow chat={selectedChat} user={user} />
            ) : (
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                height="100%"
                sx={{ textAlign: "center", color: "#475569" }}
              >
                <Avatar
                  sx={{
                    width: 110,
                    height: 110,
                    background:
                      "linear-gradient(45deg, #6366f1, #8b5cf6, #a78bfa)",
                    boxShadow: "0 10px 25px rgba(99,102,241,0.25)",
                    mb: 3,
                  }}
                >
                  <ChatRounded sx={{ fontSize: 52 }} />
                </Avatar>
                <Typography variant="h4" fontWeight={700}>
                  Welcome to UniVerse Chat
                </Typography>
                <Typography variant="body1" sx={{ mt: 1, mb: 3, maxWidth: 400 }}>
                  Select a conversation or start a new chat to begin messaging.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setModalOpen(true)}
                  sx={{
                    px: 4,
                    py: 1.3,
                    fontSize: "1rem",
                    borderRadius: 3,
                    background: "linear-gradient(45deg, #6366f1, #8b5cf6)",
                    boxShadow: "0 6px 20px rgba(99,102,241,0.3)",
                    "&:hover": {
                      boxShadow: "0 10px 25px rgba(99,102,241,0.5)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  Start New Chat
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* NEW CHAT MODAL */}
      <NewChatModal open={modalOpen} onClose={handleNewChat} user={user} />
    </Box>
  );
};

export default ChatDashboard;
