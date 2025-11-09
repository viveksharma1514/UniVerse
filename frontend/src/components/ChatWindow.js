import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Paper,
  CircularProgress,
} from "@mui/material";
import { Send } from "@mui/icons-material";
import { useSocket } from "../context/SocketContext";
import axios from "axios";

const ChatWindow = ({ chat, user }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const { socket } = useSocket();

  const fetchMessages = useCallback(async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/chats/${chat._id}/messages`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setMessages(res.data || []);
    } catch (err) {
      console.error("❌ Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  }, [chat._id]);

  useEffect(() => {
    if (!chat || !socket) return;
    socket.emit("join-chat", chat._id);
    fetchMessages();

    const handleReceiveMessage = (msg) => {
      if (String(msg.chat) === String(chat._id)) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("receive-message", handleReceiveMessage);
    return () => {
      socket.emit("leave-chat", chat._id);
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [chat, socket, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !socket) return;
    const messageData = {
      chat: chat._id,
      sender: { _id: user._id, name: user.name },
      content: newMessage.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, messageData]);
    setNewMessage("");
    socket.emit("send-message", messageData);

    try {
      await axios.post(
        `http://localhost:5000/api/chats/${chat._id}/messages`,
        { content: messageData.content },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
    } catch (err) {
      console.error("❌ Error saving message:", err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const otherParticipant =
    chat.participants?.find((p) => p._id !== user._id) ||
    chat.teacher ||
    chat.student;

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background:
          "linear-gradient(180deg, #ffffff 0%, #f9fafb 50%, #f3f4f6 100%)",
      }}
    >
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 0,
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(0,0,0,0.05)",
          display: "flex",
          alignItems: "center",
          gap: 2,
          boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
        }}
      >
        <Avatar
          src={otherParticipant?.avatar}
          sx={{
            width: 46,
            height: 46,
            bgcolor: "#6366f1",
            color: "white",
            fontWeight: 600,
          }}
        >
          {otherParticipant?.name?.charAt(0)}
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b" }}>
            {otherParticipant?.name}
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            {otherParticipant?.role?.toUpperCase()}
          </Typography>
        </Box>
      </Paper>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          p: 2,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          background:
            "linear-gradient(180deg, #f9fafb 0%, #f1f5f9 50%, #e2e8f0 100%)",
        }}
      >
        {loading ? (
          <Box display="flex" alignItems="center" justifyContent="center" height="100%">
            <CircularProgress sx={{ color: "#6366f1" }} />
          </Box>
        ) : messages.length === 0 ? (
          <Box
            textAlign="center"
            color="#6b7280"
            mt={4}
            fontStyle="italic"
          >
            No messages yet. Start chatting with{" "}
            {otherParticipant?.name?.split(" ")[0]} 👋
          </Box>
        ) : (
          messages.map((msg, index) => {
            const isUser = msg.sender?._id === user._id;
            return (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  justifyContent: isUser ? "flex-end" : "flex-start",
                  animation: "fadeIn 0.25s ease",
                }}
              >
                <Box
                  sx={{
                    maxWidth: "70%",
                    p: 1.5,
                    borderRadius: isUser
                      ? "18px 18px 4px 18px"
                      : "18px 18px 18px 4px",
                    background: isUser
                      ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                      : "#e5e7eb",
                    color: isUser ? "white" : "#1e293b",
                    boxShadow: isUser
                      ? "0 4px 12px rgba(99,102,241,0.3)"
                      : "0 4px 12px rgba(0,0,0,0.05)",
                    wordBreak: "break-word",
                  }}
                >
                  <Typography variant="body1" sx={{ fontSize: "0.95rem" }}>
                    {msg.content}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      textAlign: "right",
                      mt: 0.5,
                      fontSize: "0.7rem",
                      color: isUser ? "rgba(255,255,255,0.8)" : "#64748b",
                    }}
                  >
                    {new Date(msg.createdAt || msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Typography>
                </Box>
              </Box>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Paper
        elevation={3}
        sx={{
          p: 2,
          borderRadius: 0,
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(10px)",
          borderTop: "1px solid rgba(0,0,0,0.05)",
          display: "flex",
          alignItems: "center",
          gap: 1,
          boxShadow: "0 -2px 10px rgba(0,0,0,0.05)",
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          size="small"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              background: "#f9fafb",
              "& fieldset": { borderColor: "rgba(0,0,0,0.1)" },
              "&:hover fieldset": { borderColor: "#6366f1" },
              "&.Mui-focused fieldset": { borderColor: "#6366f1" },
            },
          }}
        />
        <Button
          variant="contained"
          onClick={sendMessage}
          disabled={!newMessage.trim()}
          sx={{
            borderRadius: "12px",
            px: 3,
            py: 1,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
            "&:hover": {
              background: "linear-gradient(135deg, #5a50ff, #7b68ee)",
              boxShadow: "0 6px 20px rgba(99,102,241,0.5)",
            },
          }}
        >
          <Send />
        </Button>
      </Paper>
    </Box>
  );
};

export default ChatWindow;
