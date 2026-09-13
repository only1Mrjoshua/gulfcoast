// models/Conversation.js
import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    lastMessageText: { type: String, default: '' },
    lastMessageAt:   { type: Date,   default: null, index: true },
    lastMessageFrom: { type: String, enum: ['user', 'admin', null], default: null },
    unreadByAdmin:   { type: Number, default: 0, min: 0 },
    unreadByUser:    { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
    },
  },
  { timestamps: true }
);

conversationSchema.index({ lastMessageAt: -1 });

export default mongoose.model('Conversation', conversationSchema);