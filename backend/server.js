// server.js (RENDER-READY VERSION - FIXED CORS)
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
require("dotenv").config();

// --- ROUTE IMPORTS ---
const authRoutes = require("./routes/auth");
const meetingRoutes = require("./routes/meetings");
const meetingOnlineRoutes = require("./routes/meetingonline");
const assignmentRoutes = require("./routes/assignments");
const fileRoutes = require("./routes/fileRoutes");
const chatRoutes = require("./routes/chatRoutes");
const notificationRoutes = require("./routes/notifications");
const attendanceRoutes = require("./routes/attendance");
const scheduleRoutes = require("./routes/schedule");

// ✅ NEW IMPORTS for Admin & Events
const adminAuthRoutes = require("./routes/adminAuth");
const eventRoutes = require("./routes/events");

// --- MIDDLEWARE & MODELS ---
const auth = require("./middleware/auth");
const User = require("./models/User");
const Chat = require("./models/Chat");
const Message = require("./models/Message");
const { startSmartScheduler } = require("./utils/smartScheduler");

// --- APP INIT ---
const app = express();

// ✅ FIXED: Allow both deployed frontend & localhost (CORS)
app.use(
  cors({
    origin: [
      "https://universe-frontend-w2ul.onrender.com", // your deployed frontend
      "http://localhost:3000",                      // local dev
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- API ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/meetingonline", meetingOnlineRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/schedule", scheduleRoutes);

// ✅ NEW ROUTES for Admin + Events
app.use("/api/admin", adminAuthRoutes);
app.use("/api/events", eventRoutes);

// ✅ FIXED: Add Teachers Route
app.get("/api/teachers", auth, async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" }).select(
      "name email avatar subject cabinNumber contactNumber qualifications isOnline lastSeen"
    );
    res.json(teachers);
  } catch (error) {
    console.error("❌ Error fetching teachers:", error);
    res
      .status(500)
      .json({ message: "Error fetching teachers", error: error.message });
  }
});

// --- HEALTH & TEST ROUTES ---
app.get("/api/test", (req, res) =>
  res.json({
    message: "🚀 UniVerse Server is running!",
    timestamp: new Date().toISOString(),
  })
);

app.get("/api/health", (req, res) =>
  res.json({
    status: "OK",
    service: "UniVerse Backend",
    database:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    uploads: path.join(__dirname, "uploads"),
  })
);

// ✅ Render Root Health Check
app.get("/", (req, res) => {
  res.send("✅ Universe Backend Running Successfully");
});

// --- DB CONNECTION ---
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.log("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

// --- HTTP + SOCKET.IO ---
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: [
      "https://universe-frontend-w2ul.onrender.com",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});
app.set("io", io);

// --- SOCKET LOGIC ---
const onlineTeachers = new Set();

io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  socket.on("join", (user) => {
    try {
      const { userId, role } = user || {};
      if (!userId) return;

      socket.join(userId);
      console.log(`👤 ${userId} (${role || "unknown"}) joined personal room`);

      if (role === "teacher") {
        onlineTeachers.add(userId);
        io.emit("teachers-updated", Array.from(onlineTeachers));
        console.log(`✅ Teacher online: ${userId}`);
      }
    } catch (err) {
      console.error("❌ Error in join handler:", err);
    }
  });

  socket.on("join-chat", (chatId) => {
    if (!chatId) return;
    socket.join(chatId);
    console.log(`💬 Joined chat room: ${chatId}`);
  });

  socket.on("leave-chat", (chatId) => {
    if (!chatId) return;
    socket.leave(chatId);
    console.log(`👋 Left chat room: ${chatId}`);
  });

  socket.on("send-message", async (messageData) => {
    try {
      if (!messageData || !messageData.chat) return;
      const { chat: chatId, sender, content, messageType = "text", createdAt } =
        messageData;

      console.log(`📨 Message from ${sender?.name} in chat ${chatId}`);

      const chat = await Chat.findById(chatId).select("participants");
      if (!chat) return console.warn("⚠️ Chat not found:", chatId);

      const msgDoc = new Message({
        sender: sender?._id || sender,
        chat: chatId,
        content,
        messageType,
        createdAt: createdAt ? new Date(createdAt) : new Date(),
      });
      await msgDoc.save();

      chat.lastMessage = msgDoc._id;
      await chat.save();

      const populatedMessage = await Message.findById(msgDoc._id).populate(
        "sender",
        "name role avatar"
      );

      for (const participantId of chat.participants.map(String)) {
        if (String(sender?._id || sender) === participantId) continue;
        io.to(participantId).emit("receive-message", {
          ...populatedMessage.toObject(),
          chat: chatId,
        });
      }
    } catch (err) {
      console.error("❌ Error handling send-message:", err);
    }
  });

  socket.on("disconnect", () => {
    for (const room of socket.rooms) {
      if (room !== socket.id && onlineTeachers.has(room))
        onlineTeachers.delete(room);
    }
    io.emit("teachers-updated", Array.from(onlineTeachers));
    console.log("🔌 User disconnected:", socket.id);
  });
});

// --- START SERVER ---
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log("\n=================================");
    console.log("🚀 UniVerse Server Started!");
    console.log(`📍 Port: ${PORT}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log("=================================\n");

    try {
      startSmartScheduler(app);
      console.log("🕒 Smart Scheduler initialized successfully!");
    } catch (err) {
      console.error(
        "❌ Failed to start Smart Scheduler:",
        err?.message || err
      );
    }
  });
};

process.on("unhandledRejection", (err) => {
  console.log("❌ Unhandled Rejection:", err);
});

startServer();
