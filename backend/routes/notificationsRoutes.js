// routes/notificationsRoutes.js
import express from 'express';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
} from '../controllers/notificationsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Static routes MUST come before /:id routes
router.get('/',            protect, getNotifications);
router.put('/read-all',    protect, markAllNotificationsRead);
router.get('/preferences', protect, getNotificationPreferences);
router.put('/preferences', protect, updateNotificationPreferences);

router.put('/:id/read',    protect, markNotificationRead);
router.delete('/:id',      protect, deleteNotification);

export default router;