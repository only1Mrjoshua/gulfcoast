// routes/adminDepositsRoutes.js
import express from 'express';
import {
  adminListDeposits,
  adminGetDeposit,
  adminAcceptDeposit,
  adminRejectDeposit,
} from '../controllers/adminDepositsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, adminListDeposits);
router.get('/:id', protect, adminGetDeposit);
router.put('/:id/accept', protect, adminAcceptDeposit);
router.put('/:id/reject', protect, adminRejectDeposit);

export default router;