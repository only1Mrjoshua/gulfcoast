// routes/transfersRoutes.js
import express from 'express';
import {
  getTransfers,
  getTransferAccounts,
  createTransfer,
  downloadReceipt,
} from '../controllers/transfersController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getTransfers);
router.get('/accounts', protect, getTransferAccounts);
router.post('/', protect, createTransfer);
router.get('/:id/receipt', protect, downloadReceipt);

export default router;