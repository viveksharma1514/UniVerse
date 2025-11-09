import React, { useState, useEffect } from "react";
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Badge,
  Divider,
  Chip,
  Tooltip,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import { useSocket } from "../context/SocketContext";

const ChatList = ({ chats, selectedChat, onSelectChat, user }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredChats, setFilteredChats] = useState([]);
  const { socket } = useSocket();

  const currentUser = user || {};
  const userRole = currentUser.role || "student";

  /* ================================================================
     ✅ Filter chats by search
  ================================================================= */
  useEffect(() => {
    if (!chats) return;
    setFilteredChats(
      chats.filter(
        (chat) =>
          chat.participants?.some((p) =>
            p.name?.toLowerCase().includes(searchTerm.toLowerCase())
          ) ||
          (chat.groupName &&
            chat.groupName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          chat.teacher?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          chat.student?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [chats, searchTerm]);

  /* ================================================================
     ✅ Listen to socket updates
  ================================================================= */
  useEffect(() => {
    if (socket) {
      const handleNewMessage = (data) => {
        console.log("📩 New message received in ChatList:", data);
      };
      socket.on("newMessage", handleNewMessage);
      return () => socket.off("newMessage", handleNewMessage);
    }
  }, [socket]);

  /* ================================================================
     🕒 Helpers
  ================================================================= */
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getChatName = (chat) => {
    if (chat.isGroupChat) return chat.groupName || "Group Chat";

    if (chat.chatType === "student-teacher") {
      const student = chat.participants?.find((p) => p.role === "student");
      const teacher = chat.participants?.find((p) => p.role === "teacher");
      if (teacher && student) {
        const isStudent = userRole === "student";
        const other = isStudent ? teacher : student;
        return `${other.name} (${other.role})`;
      }
    }

    const other = chat.participants?.find((p) => p._id !== currentUser._id);
    return other?.name || "Unknown User";
  };

  const getChatSubtitle = (chat) => {
    const last =
      chat.lastMessage || chat.messages?.[chat.messages.length - 1];
    if (!last) return "No messages yet";
    return last.content.length > 30
      ? `${last.content.substring(0, 30)}...`
      : last.content;
  };

  const getLastMessageTime = (chat) => {
    const last =
      chat.lastMessage || chat.messages?.[chat.messages.length - 1];
    return last ? formatTime(last.timestamp || last.createdAt) : "";
  };

  const getRoleBadge = (chat) => {
    switch (chat.chatType) {
      case "student-teacher":
        return (
          <Chip
            label="Student–Teacher"
            size="small"
            sx={{
              height: 20,
              background: "rgba(99,102,241,0.1)",
              color: "#4338ca",
              fontWeight: 500,
            }}
          />
        );
      case "teacher-teacher":
        return (
          <Chip
            label="Teacher"
            size="small"
            sx={{
              height: 20,
              background: "rgba(168,85,247,0.1)",
              color: "#7e22ce",
              fontWeight: 500,
            }}
          />
        );
      case "group":
        return (
          <Chip
            label="Group"
            size="small"
            sx={{
              height: 20,
              background: "rgba(14,165,233,0.1)",
              color: "#0369a1",
              fontWeight: 500,
            }}
          />
        );
      default:
        return (
          <Chip
            label="Direct"
            size="small"
            variant="outlined"
            sx={{
              height: 20,
              color: "#475569",
              fontWeight: 500,
              borderColor: "rgba(0,0,0,0.1)",
            }}
          />
        );
    }
  };

  /* ================================================================
     🧩 Render UI
  ================================================================= */
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "rgba(255,255,255,0.8)",
        backdropFilter: "blur(10px)",
      }}
    >
      {/* Search Bar */}
      <Box sx={{ p: 2, pb: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: "#9ca3af" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              background: "#f9fafb",
              "&:hover fieldset": { borderColor: "#6366f1" },
              "&.Mui-focused fieldset": { borderColor: "#6366f1" },
            },
          }}
        />
      </Box>

      <Divider />

      {/* Chat List */}
      <List sx={{ flexGrow: 1, overflow: "auto", py: 0 }}>
        {filteredChats.map((chat) => {
          const chatName = getChatName(chat);
          const lastMessage = getChatSubtitle(chat);
          const time = getLastMessageTime(chat);

          return (
            <ListItem
              key={chat._id}
              button
              selected={selectedChat?._id === chat._id}
              onClick={() => onSelectChat(chat)}
              sx={{
                borderBottom: "1px solid rgba(0,0,0,0.04)",
                transition: "all 0.2s ease",
                "&:hover": {
                  background: "rgba(99,102,241,0.05)",
                },
                "&.Mui-selected": {
                  background: "rgba(99,102,241,0.1)",
                },
              }}
            >
              <ListItemAvatar>
                <Tooltip title={chatName}>
                  <Badge
                    overlap="circular"
                    variant="dot"
                    color="success"
                    invisible={
                      !chat.participants?.some(
                        (p) => p._id !== currentUser._id && p.isOnline
                      )
                    }
                  >
                    <Avatar
                      sx={{
                        bgcolor:
                          chat.chatType === "student-teacher"
                            ? "#6366f1"
                            : "#10b981",
                        width: 44,
                        height: 44,
                        fontWeight: 600,
                      }}
                    >
                      {chatName.charAt(0).toUpperCase()}
                    </Avatar>
                  </Badge>
                </Tooltip>
              </ListItemAvatar>

              <ListItemText
                primary={
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      noWrap
                      sx={{ fontWeight: 600, flexGrow: 1, color: "#1e293b" }}
                    >
                      {chatName}
                    </Typography>
                    {getRoleBadge(chat)}
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 0.5 }}>
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{ fontSize: "0.85rem", color: "#64748b" }}
                    >
                      {lastMessage}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mt: 0.4,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ fontSize: "0.7rem", color: "#94a3b8" }}
                      >
                        {chat.chatType === "student-teacher"
                          ? "Student–Teacher Chat"
                          : "Direct Message"}
                      </Typography>
                      {time && (
                        <Typography
                          variant="caption"
                          sx={{ fontSize: "0.7rem", color: "#94a3b8" }}
                        >
                          {time}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                }
              />
            </ListItem>
          );
        })}

        {filteredChats.length === 0 && (
          <Box
            sx={{
              textAlign: "center",
              mt: 4,
              p: 2,
              color: "#6b7280",
            }}
          >
            <Typography>
              {chats.length === 0
                ? "No conversations yet"
                : "No matches found"}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {userRole === "student"
                ? "Start a chat with your teachers"
                : "Chat with students or other teachers"}
            </Typography>
          </Box>
        )}
      </List>
    </Box>
  );
};

export default ChatList;
