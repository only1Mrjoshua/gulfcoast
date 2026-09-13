// controllers/messagesController.js
import mongoose from 'mongoose';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

const formatMessage = (m) => ({
  id: String(m._id),
  senderRole: m.senderRole,
  text: m.text,
  status: m.status,
  createdAt: m.createdAt,
});

const ensureConversation = async (userId) => {
  let conv = await Conversation.findOne({ userId });
  if (!conv) conv = await Conversation.create({ userId });
  return conv;
};

// ================================================================
// GET /api/messages
//   ?since=<messageId>  → returns only messages newer than that id
// ================================================================
export const getMyConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { since } = req.query;

    const conv = await Conversation.findOne({ userId }).lean();
    if (!conv) {
      return res.json({
        messages: [],
        statusUpdates: [],
        unreadByUser: 0,
      });
    }

    // ── Polling mode ──
    if (since && mongoose.Types.ObjectId.isValid(since)) {
      const newMessages = await Message.find({
        conversationId: conv._id,
        _id: { $gt: new mongoose.Types.ObjectId(since) },
      })
        .sort({ _id: 1 })
        .lean();

      // Send back current statuses for the user's own recent messages
      // so their ticks update when the admin reads them.
      const own = await Message.find({
        conversationId: conv._id,
        senderRole: 'user',
      })
        .sort({ _id: -1 })
        .limit(100)
        .select('_id status')
        .lean();

      return res.json({
        messages: newMessages.map(formatMessage),
        statusUpdates: own.map((m) => ({
          id: String(m._id),
          status: m.status,
        })),
        unreadByUser: conv.unreadByUser || 0,
      });
    }

    // ── First-load mode: full history ──
    const messages = await Message.find({ conversationId: conv._id })
      .sort({ _id: 1 })
      .lean();

    res.json({
      messages: messages.map(formatMessage),
      statusUpdates: [],
      unreadByUser: conv.unreadByUser || 0,
    });
  } catch (err) {
    console.error('❌ getMyConversation:', err);
    res.status(500).json({ error: 'Failed to load messages' });
  }
};

// ================================================================
// POST /api/messages
// ================================================================
export const sendMyMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { text } = req.body || {};
    const clean = String(text || '').trim();

    if (!clean) {
      return res.status(400).json({ error: 'Message text is required' });
    }
    if (clean.length > 4000) {
      return res.status(400).json({ error: 'Message is too long' });
    }

    const conv = await ensureConversation(userId);

    const message = await Message.create({
      conversationId: conv._id,
      userId,
      senderRole: 'user',
      senderId: userId,
      text: clean,
      status: 'sent',
    });

    conv.lastMessageText = clean;
    conv.lastMessageAt = new Date();
    conv.lastMessageFrom = 'user';
    conv.unreadByAdmin = (conv.unreadByAdmin || 0) + 1;
    await conv.save();

    res.status(201).json({ message: formatMessage(message.toObject()) });
  } catch (err) {
    console.error('❌ sendMyMessage:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// ================================================================
// PUT /api/messages/read
// Marks all admin-sent messages as read for this user.
// ================================================================
export const markMyConversationRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const conv = await Conversation.findOne({ userId });
    if (!conv) return res.json({ ok: true });

    const unread = await Message.find({
      conversationId: conv._id,
      senderRole: 'admin',
      status: { $ne: 'read' },
    }).select('_id');

    if (unread.length > 0) {
      await Message.updateMany(
        { _id: { $in: unread.map((m) => m._id) } },
        { $set: { status: 'read' } }
      );
    }

    if (conv.unreadByUser > 0) {
      conv.unreadByUser = 0;
      await conv.save();
    }

    res.json({ ok: true, marked: unread.length });
  } catch (err) {
    console.error('❌ markMyConversationRead:', err);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
};

// ================================================================
// GET /api/messages/unread
// Lightweight endpoint for the sidebar badge.
// ================================================================
export const getMyUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const conv = await Conversation.findOne({ userId })
      .select('unreadByUser')
      .lean();
    res.json({ count: conv?.unreadByUser || 0 });
  } catch (err) {
    console.error('❌ getMyUnreadCount:', err);
    res.status(500).json({ error: 'Failed' });
  }
};