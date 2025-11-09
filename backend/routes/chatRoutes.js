// routes/chatRoutes.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const auth = require('../middleware/auth');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');

// GET /api/chats  -> list chats for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user.id, isActive: true })
      .populate('participants', 'name email role avatar')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (err) {
    console.error('Error fetching chats:', err);
    res.status(500).json({ message: 'Server error fetching chats' });
  }
});

// POST /api/chats -> create chat (your logic may vary)
router.post('/', auth, async (req, res) => {
  try {
    const { participants = [], isGroupChat = false, groupName } = req.body;
    const allParticipants = Array.from(new Set([...participants, req.user.id]));
    const chat = new Chat({
      participants: allParticipants,
      isGroupChat,
      chatType: isGroupChat ? 'group' : 'student-teacher',
      initiatedBy: req.user.id,
      groupName: isGroupChat ? groupName : undefined
    });
    await chat.save();
    const populated = await Chat.findById(chat._id).populate('participants', 'name email role avatar');
    res.status(201).json(populated);
  } catch (err) {
    console.error('Error creating chat:', err);
    res.status(500).json({ message: 'Server error creating chat' });
  }
});

// GET messages for a chat (with pagination)
router.get('/:chatId/messages', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const chat = await Chat.findOne({ _id: req.params.chatId, participants: req.user.id, isActive: true });
    if (!chat) return res.status(404).json({ message: 'Chat not found or access denied' });

    const messages = await Message.find({ chat: req.params.chatId })
      .populate('sender', 'name email role avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // return messages in chronological order
    res.json(messages.reverse());
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
});

// POST message via REST (also persists)
router.post('/:chatId/messages', auth, async (req, res) => {
  try {
    const { content, messageType = 'text', fileUrl = null } = req.body;

    const chat = await Chat.findOne({ _id: req.params.chatId, participants: req.user.id, isActive: true });
    if (!chat) return res.status(404).json({ message: 'Chat not found or access denied' });

    const msg = new Message({
      sender: req.user.id,
      chat: req.params.chatId,
      content,
      messageType,
      fileUrl
    });
    await msg.save();

    chat.lastMessage = msg._id;
    await chat.save();

    const populated = await Message.findById(msg._id).populate('sender', 'name role avatar');

    // Also emit via socket to participants' personal rooms for real-time delivery
    const io = req.app.get('io');
    for (const p of chat.participants.map(x => String(x))) {
      if (String(req.user.id) === String(p)) continue;
      if (io) io.to(p).emit('receive-message', { ...populated.toObject(), chat: chat._id });
    }

    res.status(201).json(populated);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ message: 'Server error sending message' });
  }
});

module.exports = router;
