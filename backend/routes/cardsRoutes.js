// routes/cardsRoutes.js
import express from 'express';
import {
  getCards,
  revealCard,
  updateCardControl,
  updateCardAlerts,
} from '../controllers/cardsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Order matters — `/alerts` and `/:id/reveal` before `/:id`
router.get('/', protect, getCards);
router.put('/alerts', protect, updateCardAlerts);
router.get('/:id/reveal', protect, revealCard);
router.put('/:id/controls', protect, updateCardControl);

export default router;