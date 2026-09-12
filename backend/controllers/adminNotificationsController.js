// controllers/adminNotificationsController.js
import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import {
  notifyUser,
  CARD_SUBCATEGORIES,
  LOAN_SUBCATEGORIES,
} from '../utils/notifyUser.js';

const formatNotification = (n) => {
  const d = new Date(n.date);
  const iso = Number.isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
  return {
    id: n._id,
    category: n.category,
    subCategory: n.subCategory || null,
    title: n.title,
    message: n.message,
    date: iso,
    priority: n.priority || 'Normal',
    read: !!n.read,
  };
};

// ================================================================
// GET /api/admin/notifications
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
// GET /api/admin/notifications/meta
// Frontend uses this to render the correct subcategory picker.
// ================================================================
export const adminNotificationMeta = async (req, res) => {
  res.json({
    categories: [
      'Account',
      'Transaction',
      'Promotions',
      'Security',
      'Card',
      'Loan',
    ],
    subcategories: {
      Card: Object.entries(CARD_SUBCATEGORIES).map(([key, label]) => ({
        key,
        label,
      })),
      Loan: Object.entries(LOAN_SUBCATEGORIES).map(([key, label]) => ({
        key,
        label,
      })),
    },
  });
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
      .select(
        'firstName lastName email notificationPreferences cardAlertPreferences loanAlertPreferences'
      )
      .lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const notifications = await Notification.find({ userId })
      .sort({ date: -1 })
      .lean();

    res.json({
      user: {
        id: String(user._id),
        user:
          `${user.firstName || ''} ${user.lastName || ''}`.trim() || '—',
        userEmail: user.email || '',
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
// Body: { category, subCategory?, title, message, date?, priority? }
// ================================================================
export const adminSendNotification = async (req, res) => {
  try {
    const { userId } = req.params;
    const { category, subCategory, title, message, date, priority } =
      req.body || {};

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    const validCategories = [
      'Account',
      'Transaction',
      'Promotions',
      'Security',
      'Card',
      'Loan',
    ];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    // Validate subCategory for Card / Loan
    if (category === 'Card') {
      if (!subCategory || !(subCategory in CARD_SUBCATEGORIES)) {
        return res
          .status(400)
          .json({ error: 'A valid card subcategory is required' });
      }
    } else if (category === 'Loan') {
      if (!subCategory || !(subCategory in LOAN_SUBCATEGORIES)) {
        return res
          .status(400)
          .json({ error: 'A valid loan subcategory is required' });
      }
    } else if (subCategory) {
      return res
        .status(400)
        .json({ error: 'Subcategory is only allowed for Card and Loan' });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const user = await User.findById(userId).select('_id').lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Always create — the read endpoint filters by preference
    const notification = await notifyUser({
      userId,
      category,
      subCategory: subCategory || null,
      title: title.trim(),
      message: message.trim(),
      date,
      priority,
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