// controllers/notificationsController.js
import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import {
  shouldShowNotification,
  buildFullPreferences,
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
    preview:
      n.message.length > 120 ? n.message.slice(0, 120) + '…' : n.message,
    date: iso,
    priority: n.priority || 'Normal',
    read: !!n.read,
  };
};

// ================================================================
// GET /api/notifications
// ================================================================
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId)
      .select(
        'notificationPreferences cardAlertPreferences loanAlertPreferences'
      )
      .lean();

    const notifications = await Notification.find({ userId })
      .sort({ date: -1 })
      .lean();

    const visible = notifications.filter((n) => shouldShowNotification(n, user));

    res.json({
      notifications: visible.map(formatNotification),
      preferences: buildFullPreferences(user),
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
      .select(
        'notificationPreferences cardAlertPreferences loanAlertPreferences'
      )
      .lean();
    res.json({ preferences: buildFullPreferences(user) });
  } catch (err) {
    console.error('❌ getNotificationPreferences:', err);
    res.status(500).json({ error: 'Failed to load preferences' });
  }
};

// ================================================================
// PUT /api/notifications/preferences
// Body: { account?, transaction?, promotions?, security?,
//         deposit?, transfer?, payment?,
//         card?: { ...7 keys... }, loan?: { ...4 keys... } }
// ================================================================
export const updateNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const body = req.body || {};
    const update = {};

    // Simple booleans
    for (const key of [
      'account',
      'transaction',
      'promotions',
      'security',
      'deposit',
      'transfer',
      'payment',
    ]) {
      if (body[key] !== undefined) {
        update[`notificationPreferences.${key}`] = !!body[key];
      }
    }

    // Card sub-alerts → cardAlertPreferences
    if (body.card && typeof body.card === 'object') {
      for (const key of Object.keys(CARD_SUBCATEGORIES)) {
        if (body.card[key] !== undefined) {
          update[`cardAlertPreferences.${key}`] = !!body.card[key];
        }
      }
    }

    // Loan sub-alerts → loanAlertPreferences
    if (body.loan && typeof body.loan === 'object') {
      for (const key of Object.keys(LOAN_SUBCATEGORIES)) {
        if (body.loan[key] !== undefined) {
          update[`loanAlertPreferences.${key}`] = !!body.loan[key];
        }
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: update },
      { new: true, lean: true }
    ).select(
      'notificationPreferences cardAlertPreferences loanAlertPreferences'
    );

    res.json({ preferences: buildFullPreferences(user) });
  } catch (err) {
    console.error('❌ updateNotificationPreferences:', err);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
};