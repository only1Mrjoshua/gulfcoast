// routes/loansRoutes.js
import express from 'express';
import {
  getLoansOverview,
  getApplicationProfile,
  submitLoanApplication,
  updateLoanAlerts,
  getLoanPayments,
} from '../controllers/loansController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/overview',            protect, getLoansOverview);
router.get('/application-profile', protect, getApplicationProfile);
router.post('/apply',              protect, submitLoanApplication);
router.put('/alerts',              protect, updateLoanAlerts);

// Must come after the specific routes above so `/overview` and
// `/application-profile` are not captured by the `:id` parameter.
router.get('/:id/payments',        protect, getLoanPayments);

export default router;