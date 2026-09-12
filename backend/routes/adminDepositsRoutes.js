// routes/adminDepositsRoutes.js
import express from 'express';
import {
  adminListDeposits,
  adminGetDeposit,
  adminUpdateDepositStatus,
} from '../controllers/adminDepositsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, adminListDeposits);
router.get('/:id', protect, adminGetDeposit);
router.put('/:id/status', protect, adminUpdateDepositStatus);

export default router;