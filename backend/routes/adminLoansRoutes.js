// routes/adminLoansRoutes.js
import express from 'express';
import {
  adminListLoans,
  adminGetUserLoans,
  adminUpdateUserLoan,
  adminUpdateLoan,
  adminUpdateUserAlerts,
  adminUpdateApplicationStatus,
} from '../controllers/adminLoansController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, adminListLoans);

// Applications route must come before the /:userId routes so the literal
// `applications` segment isn't captured by `:userId`.
router.put('/applications/:id', protect, adminUpdateApplicationStatus);

router.get('/:userId', protect, adminGetUserLoans);
router.put('/:userId', protect, adminUpdateUserLoan);
router.put('/:userId/alerts', protect, adminUpdateUserAlerts);
router.put('/:userId/loans/:loanId', protect, adminUpdateLoan);

export default router;