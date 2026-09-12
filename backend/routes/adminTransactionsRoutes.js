// routes/adminTransactionsRoutes.js
import express from 'express';
import { adminListTransactions } from '../controllers/adminTransactionsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, adminListTransactions);

export default router;