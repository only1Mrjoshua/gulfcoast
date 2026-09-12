// controllers/adminNotificationsController.js
import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

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
    date: iso,
    priority: n.priority || 'Normal',
    read: !!n.read,
  };
};

// ================================================================
// GET /api/admin/notifications
// Lists every non-admin user with count + last notification.
// ================================================================
export const adminListNotifications = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('firstName lastName email')
      .sort({ firstName: 1, lastName: 1 })
      .lean();

    const userIds = users.map((u) => u._id);

    const [counts, latest] = await Promise.all([
      Notification.aggregate([
        { $match: { userId: { $in: userIds } } },
        { $group: { _id: '$userId', count: { $sum: 1 } } },
      ]),
      Notification.aggregate([
        { $match: { userId: { $in: userIds } } },
        { $sort: { date: -1 } },
        {
          $group: {
            _id: '$userId',
            title: { $first: '$title' },
            date:  { $first: '$date' },
          },
        },
      ]),
    ]);

    const countMap = new Map(counts.map((c) => [String(c._id), c.count]));
    const latestMap = new Map(latest.map((l) => [String(l._id), l]));

    const list = users.map((u) => {
      const id = String(u._id);
      const n = latestMap.get(id);
      return {
        id,
        user:
          `${u.firstName || ''} ${u.lastName || ''}`.trim() || '—',
        userEmail: u.email || '',
        totalNotifications: countMap.get(id) || 0,
        lastNotification: n
          ? {
              title: n.title,
              date: new Date(n.date).toISOString().split('T')[0],
            }
          : null,
      };
    });

    res.json({ users: list });
  } catch (err) {
    console.error('❌ adminListNotifications:', err);
    res.status(500).json({ error: 'Failed to load notifications' });
  }
};

// ================================================================
// GET /api/admin/notifications/:userId
// ================================================================
export const adminGetUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    const user = await User.findById(userId)
      .select('firstName lastName email notificationPreferences')
      .lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const notifications = await Notification.find({ userId })
      .sort({ date: -1 })
      .lean();

    const prefs = user.notificationPreferences || {};

    res.json({
      user: {
        id: String(user._id),
        user:
          `${user.firstName || ''} ${user.lastName || ''}`.trim() || '—',
        userEmail: user.email || '',
        notificationPreferences: {
          account:     prefs.account !== false,
          transaction: prefs.transaction !== false,
          promotions:  prefs.promotions !== false,
          security:    prefs.security !== false,
        },
        notifications: notifications.map(formatNotification),
      },
    });
  } catch (err) {
    console.error('❌ adminGetUserNotifications:', err);
    res.status(500).json({ error: 'Failed to load user notifications' });
  }
};

// ================================================================
// POST /api/admin/notifications/:userId
// Body: { category, title, message, date?, priority? }
// ================================================================
export const adminSendNotification = async (req, res) => {
  try {
    const { userId } = req.params;
    const { category, title, message, date, priority } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    const validCategories = [
      'Account',
      'Transaction',
      'Promotions',
      'Security',
    ];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const user = await User.findById(userId).select('_id').lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const notification = await Notification.create({
      userId,
      category,
      title: title.trim(),
      message: message.trim(),
      date: date ? new Date(date) : new Date(),
      priority: ['Normal', 'Important'].includes(priority)
        ? priority
        : 'Normal',
      read: false,
      sentBy: req.user._id,
    });

    res.status(201).json({
      message: 'Notification sent',
      notification: formatNotification(notification.toObject()),
    });
  } catch (err) {
    console.error('❌ adminSendNotification:', err);
    res.status(500).json({ error: 'Failed to send notification' });
  }
};

// ================================================================
// DELETE /api/admin/notifications/:id
// ================================================================
export const adminDeleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }
    const n = await Notification.findByIdAndDelete(id);
    if (!n) return res.status(404).json({ error: 'Notification not found' });
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    console.error('❌ adminDeleteNotification:', err);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};