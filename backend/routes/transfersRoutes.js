// routes/transfersRoutes.js
import express from 'express';
import {
  getTransfers,
  getTransferAccounts,
  lookupRecipient,
  createTransfer,
  downloadReceipt,
} from '../controllers/transfersController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getTransfers);
router.get('/accounts', protect, getTransferAccounts);
router.get('/lookup-recipient/:accountNumber', protect, lookupRecipient);
router.post('/', protect, createTransfer);
router.get('/:id/receipt', protect, downloadReceipt);

export default router;