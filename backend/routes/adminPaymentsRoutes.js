// routes/adminPaymentsRoutes.js
import express from 'express';
import {
  adminListPayments,
  adminUpdatePaymentProfile,
} from '../controllers/adminPaymentsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, adminListPayments);
router.put('/:userId', protect, adminUpdatePaymentProfile);

export default router;