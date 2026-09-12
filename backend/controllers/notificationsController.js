// controllers/notificationsController.js
import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

const CATEGORY_KEYS = {
  Account:     'account',
  Transaction: 'transaction',
  Promotions:  'promotions',
  Security:    'security',
};

const formatNotification = (n) => {
  const d = new Date(n.date);
  const iso = Number.isNaN(d.getTime())
    ? ''
    : d.toISOString().split('T')[0];
  return {
    id: n._id,
    category: n.category,
    title: n.title,
    message: n.message,
    preview:
      n.message.length > 120 ? n.message.slice(0, 120) + '…' : n.message,
    date: iso,
    priority: n.priority || 'Normal',
    read: !!n.read,
  };
};

const defaultPrefs = () => ({
  account: true,
  transaction: true,
  promotions: true,
  security: true,
});

const normalizePrefs = (prefs = {}) => ({
  account:     prefs.account !== false,
  transaction: prefs.transaction !== false,
  promotions:  prefs.promotions !== false,
  security:    prefs.security !== false,
});

// ================================================================
// GET /api/notifications
// ================================================================
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId)
      .select('notificationPreferences')
      .lean();
    const prefs = normalizePrefs(user?.notificationPreferences || defaultPrefs());

    const allowed = [];
    for (const [category, key] of Object.entries(CATEGORY_KEYS)) {
      if (prefs[key]) allowed.push(category);
    }

    const notifications = await Notification.find({
      userId,
      category: { $in: allowed },
    })
      .sort({ date: -1 })
      .lean();

    res.json({
      notifications: notifications.map(formatNotification),
      preferences: prefs,
    });
  } catch (err) {
    console.error('❌ getNotifications:', err);
    res.status(500).json({ error: 'Failed to load notifications' });
  }
};

// ================================================================
// PUT /api/notifications/:id/read
// ================================================================
export const markNotificationRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }

    const n = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { $set: { read: true } },
      { new: true, lean: true }
    );
    if (!n) return res.status(404).json({ error: 'Notification not found' });

    res.json({ notification: formatNotification(n) });
  } catch (err) {
    console.error('❌ markNotificationRead:', err);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
};

// ================================================================
// PUT /api/notifications/read-all
// ================================================================
export const markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await Notification.updateMany(
      { userId, read: false },
      { $set: { read: true } }
    );
    res.json({
      message: 'All notifications marked as read',
      count: result.modifiedCount || 0,
    });
  } catch (err) {
    console.error('❌ markAllNotificationsRead:', err);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
};

// ================================================================
// DELETE /api/notifications/:id
// ================================================================
export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }

    const n = await Notification.findOneAndDelete({ _id: id, userId });
    if (!n) return res.status(404).json({ error: 'Notification not found' });

    res.json({ message: 'Notification deleted' });
  } catch (err) {
    console.error('❌ deleteNotification:', err);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

// ================================================================
// GET /api/notifications/preferences
// ================================================================
export const getNotificationPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('notificationPreferences')
      .lean();
    res.json({
      preferences: normalizePrefs(user?.notificationPreferences),
    });
  } catch (err) {
    console.error('❌ getNotificationPreferences:', err);
    res.status(500).json({ error: 'Failed to load preferences' });
  }
};

// ================================================================
// PUT /api/notifications/preferences
// Body: { account?, transaction?, promotions?, security? }
// ================================================================
export const updateNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const body = req.body || {};
    const update = {};

    for (const key of ['account', 'transaction', 'promotions', 'security']) {
      if (body[key] !== undefined) {
        update[`notificationPreferences.${key}`] = !!body[key];
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: update },
      { new: true, lean: true }
    ).select('notificationPreferences');

    res.json({
      preferences: normalizePrefs(user?.notificationPreferences),
    });
  } catch (err) {
    console.error('❌ updateNotificationPreferences:', err);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
};