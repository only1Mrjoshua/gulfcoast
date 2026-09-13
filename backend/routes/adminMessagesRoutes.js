// routes/adminMessagesRoutes.js
import express from 'express';
import {
  adminListConversations,
  adminGetUnreadCount,
  adminGetConversation,
  adminSendMessage,
} from '../controllers/adminMessagesController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/unread',    protect, adminGetUnreadCount);
router.get('/',          protect, adminListConversations);
router.get('/:userId',   protect, adminGetConversation);
router.post('/:userId',  protect, adminSendMessage);

export default router;