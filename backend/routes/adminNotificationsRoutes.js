// routes/adminNotificationsRoutes.js
import express from 'express';
import {
  adminListNotifications,
  adminGetUserNotifications,
  adminSendNotification,
  adminDeleteNotification,
} from '../controllers/adminNotificationsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/',           protect, adminListNotifications);
router.get('/:userId',    protect, adminGetUserNotifications);
router.post('/:userId',   protect, adminSendNotification);
router.delete('/:id',     protect, adminDeleteNotification);

export default router;