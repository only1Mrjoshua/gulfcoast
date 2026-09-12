// routes/paymentsRoutes.js
import express from 'express';
import {
  getPaymentsOverview,
  createPayment,
  payScheduledPayment,
  updateAutopay,
  cancelScheduledPayment,
} from '../controllers/paymentsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/overview', protect, getPaymentsOverview);
router.post('/', protect, createPayment);
router.post('/:id/pay', protect, payScheduledPayment);
router.put('/autopay/:id', protect, updateAutopay);
router.delete('/:id', protect, cancelScheduledPayment);

export default router;