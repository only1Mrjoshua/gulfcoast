// routes/adminCardsRoutes.js
import express from 'express';
import {
  adminListCards,
  adminListCardUsers,
  adminGetUserAccounts,
  adminCreateCard,
  adminUpdateCard,
  adminDeleteCard,
} from '../controllers/adminCardsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, adminListCards);
router.get('/users', protect, adminListCardUsers);
router.get('/users/:userId/accounts', protect, adminGetUserAccounts);

router.post('/', protect, adminCreateCard);
router.put('/:id', protect, adminUpdateCard);
router.delete('/:id', protect, adminDeleteCard);

export default router;