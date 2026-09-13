// routes/messagesRoutes.js
import express from 'express';
import {
  getMyConversation,
  sendMyMessage,
  markMyConversationRead,
  getMyUnreadCount,
} from '../controllers/messagesController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/unread',  protect, getMyUnreadCount);
router.put('/read',    protect, markMyConversationRead);
router.get('/',        protect, getMyConversation);
router.post('/',       protect, sendMyMessage);

export default router;