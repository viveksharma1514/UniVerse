const mongoose = require('mongoose');

// ✅ Define message schema
const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ✅ Define main chat schema
const ChatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],

    chatType: {
      type: String,
      enum: ['student-teacher', 'group'],
      default: 'student-teacher',
    },

    // Link student and teacher directly
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Store all messages
    messages: [MessageSchema],

    // Last message reference (optional)
    lastMessage: {
      type: MessageSchema,
    },

    // Active flag for archiving/deleting chats
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true } // adds createdAt + updatedAt automatically
);

// ✅ Create model
module.exports = mongoose.model('Chat', ChatSchema);
