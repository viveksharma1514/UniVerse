// routes/chatRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Chat = require("../models/Chat");
const Message = require("../models/Message");

/* ============================================================
   💬 GET ALL CHATS for the authenticated user
============================================================ */
router.get("/", auth, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user.id,
      isActive: true,
    })
      .populate("participants", "name email role avatar")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, chats });
  } catch (err) {
    console.error("❌ Error fetching chats:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching chats",
    });
  }
});

/* ============================================================
   🧑‍🤝‍🧑 CREATE NEW CHAT (Student–Teacher or Group)
============================================================ */
router.post("/", auth, async (req, res) => {
  try {
    const { participants = [], isGroupChat = false, groupName } = req.body;

    const allParticipants = Array.from(
      new Set([...participants, req.user.id])
    );

    const chat = new Chat({
      participants: allParticipants,
      isGroupChat,
      chatType: isGroupChat ? "group" : "student-teacher",
      initiatedBy: req.user.id,
      groupName: isGroupChat ? groupName : undefined,
    });

    await chat.save();

    const populatedChat = await Chat.findById(chat._id).populate(
      "participants",
      "name email role avatar"
    );

    res.status(201).json({ success: true, chat: populatedChat });
  } catch (err) {
    console.error("❌ Error creating chat:", err);
    res.status(500).json({
      success: false,
      message: "Server error while creating chat",
    });
  }
});

/* ============================================================
   📩 GET MESSAGES for a chat (with pagination)
============================================================ */
router.get("/:chatId/messages", auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.user.id,
      isActive: true,
    });

    if (!chat) {
      return res
        .status(404)
        .json({ success: false, message: "Chat not found or access denied" });
    }

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name email role avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      messages: messages.reverse(),
      page,
      limit,
    });
  } catch (err) {
    console.error("❌ Error fetching messages:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching messages",
    });
  }
});

/* ============================================================
   ✉️ SEND A NEW MESSAGE (also emits to sockets)
============================================================ */
router.post("/:chatId/messages", auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, messageType = "text", fileUrl = null } = req.body;

    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.user.id,
      isActive: true,
    });

    if (!chat)
      return res
        .status(404)
        .json({ success: false, message: "Chat not found or access denied" });

    const message = new Message({
      sender: req.user.id,
      chat: chatId,
      content,
      messageType,
      fileUrl,
    });

    await message.save();

    chat.lastMessage = message._id;
    await chat.save();

    const populatedMessage = await Message.findById(message._id).populate(
      "sender",
      "name role avatar"
    );

    // Emit live message to participants via Socket.IO
    const io = req.app.get("io");
    if (io) {
      for (const participantId of chat.participants.map(String)) {
        if (participantId !== String(req.user.id)) {
          io.to(participantId).emit("receive-message", {
            ...populatedMessage.toObject(),
            chat: chatId,
          });
        }
      }
    }

    res.status(201).json({ success: true, message: populatedMessage });
  } catch (err) {
    console.error("❌ Error sending message:", err);
    res.status(500).json({
      success: false,
      message: "Server error while sending message",
    });
  }
});

module.exports = router;
