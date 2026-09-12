// routes/adminTransfersRoutes.js
import express from 'express';
import {
  adminListTransfers,
  adminUpdateTransferStatus,
} from '../controllers/adminTransfersController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, adminListTransfers);
router.put('/:id/status', protect, adminUpdateTransferStatus);

export default router;