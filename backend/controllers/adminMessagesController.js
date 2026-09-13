// controllers/adminMessagesController.js
import mongoose from 'mongoose';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

const formatConversation = (conv, user) => ({
  id: String(conv._id),
  userId: String(conv.userId),
  user: user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || '—'
    : '—',
  userEmail: user?.email || '',
  lastMessageText: conv.lastMessageText || '',
  lastMessageAt: conv.lastMessageAt,
  lastMessageFrom: conv.lastMessageFrom,
  unreadByAdmin: conv.unreadByAdmin || 0,
  unreadByUser: conv.unreadByUser || 0,
});

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
// GET /api/admin/messages
// ================================================================
export const adminListConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find()
      .sort({ lastMessageAt: -1, createdAt: -1 })
      .lean();

    const userIds = conversations.map((c) => c.userId);
    const users = await User.find({ _id: { $in: userIds } })
      .select('firstName lastName email')
      .lean();
    const userMap = new Map(users.map((u) => [String(u._id), u]));

    const list = conversations.map((c) =>
      formatConversation(c, userMap.get(String(c.userId)))
    );

    const totalUnread = list.reduce((s, c) => s + c.unreadByAdmin, 0);

    res.json({ conversations: list, totalUnread });
  } catch (err) {
    console.error('❌ adminListConversations:', err);
    res.status(500).json({ error: 'Failed to load conversations' });
  }
};

// ================================================================
// GET /api/admin/messages/unread
// ================================================================
export const adminGetUnreadCount = async (req, res) => {
  try {
    const agg = await Conversation.aggregate([
      { $group: { _id: null, total: { $sum: '$unreadByAdmin' } } },
    ]);
    res.json({ count: agg[0]?.total || 0 });
  } catch (err) {
    console.error('❌ adminGetUnreadCount:', err);
    res.status(500).json({ error: 'Failed' });
  }
};

// ================================================================
// GET /api/admin/messages/:userId
//   ?since=<messageId>  → polling mode (only new messages)
// No `since` → full thread. Either way, marks admin-read.
// ================================================================
export const adminGetConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const { since } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    const [user, conv] = await Promise.all([
      User.findById(userId).select('firstName lastName email').lean(),
      Conversation.findOne({ userId }).lean(),
    ]);

    if (!user) return res.status(404).json({ error: 'User not found' });

    const userPayload = {
      id: String(user._id),
      user: `${user.firstName || ''} ${user.lastName || ''}`.trim() || '—',
      userEmail: user.email || '',
    };

    if (!conv) {
      return res.json({
        user: userPayload,
        messages: [],
        statusUpdates: [],
      });
    }

    // Mark all user-sent messages as read (admin is viewing now)
    const unread = await Message.find({
      conversationId: conv._id,
      senderRole: 'user',
      status: { $ne: 'read' },
    }).select('_id');

    if (unread.length > 0) {
      await Message.updateMany(
        { _id: { $in: unread.map((m) => m._id) } },
        { $set: { status: 'read' } }
      );
    }
    if (conv.unreadByAdmin > 0) {
      conv.unreadByAdmin = 0;
      await Conversation.updateOne(
        { _id: conv._id },
        { $set: { unreadByAdmin: 0 } }
      );
    }

    // ── Polling mode ──
    if (since && mongoose.Types.ObjectId.isValid(since)) {
      const newMessages = await Message.find({
        conversationId: conv._id,
        _id: { $gt: new mongoose.Types.ObjectId(since) },
      })
        .sort({ _id: 1 })
        .lean();

      // Status updates for the admin's own sent messages
      const own = await Message.find({
        conversationId: conv._id,
        senderRole: 'admin',
      })
        .sort({ _id: -1 })
        .limit(100)
        .select('_id status')
        .lean();

      return res.json({
        user: userPayload,
        messages: newMessages.map(formatMessage),
        statusUpdates: own.map((m) => ({
          id: String(m._id),
          status: m.status,
        })),
        markedRead: unread.length,
      });
    }

    // ── Full thread ──
    const messages = await Message.find({ conversationId: conv._id })
      .sort({ _id: 1 })
      .lean();

    res.json({
      user: userPayload,
      messages: messages.map(formatMessage),
      statusUpdates: [],
      markedRead: unread.length,
    });
  } catch (err) {
    console.error('❌ adminGetConversation:', err);
    res.status(500).json({ error: 'Failed to load conversation' });
  }
};

// ================================================================
// POST /api/admin/messages/:userId
// ================================================================
export const adminSendMessage = async (req, res) => {
  try {
    const { userId } = req.params;
    const { text } = req.body || {};
    const clean = String(text || '').trim();

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }
    if (!clean) {
      return res.status(400).json({ error: 'Message text is required' });
    }
    if (clean.length > 4000) {
      return res.status(400).json({ error: 'Message is too long' });
    }

    const user = await User.findById(userId).select('_id').lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const conv = await ensureConversation(userId);

    const message = await Message.create({
      conversationId: conv._id,
      userId,
      senderRole: 'admin',
      senderId: req.user._id,
      text: clean,
      status: 'sent',
    });

    conv.lastMessageText = clean;
    conv.lastMessageAt = new Date();
    conv.lastMessageFrom = 'admin';
    conv.unreadByUser = (conv.unreadByUser || 0) + 1;
    await conv.save();

    res.status(201).json({ message: formatMessage(message.toObject()) });
  } catch (err) {
    console.error('❌ adminSendMessage:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
};