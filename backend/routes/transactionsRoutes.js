// routes/transactionsRoutes.js
import express from 'express';
import {
  getMonthsOverview,
  getFilterOptions,
  getTransactions,
  downloadTransactionsPdf,
  reportTransaction,
} from '../controllers/transactionsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/months',         protect, getMonthsOverview);
router.get('/filter-options', protect, getFilterOptions);
router.get('/download',       protect, downloadTransactionsPdf);
router.get('/',               protect, getTransactions);
router.post('/:id/report',    protect, reportTransaction);

export default router;