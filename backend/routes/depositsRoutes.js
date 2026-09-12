// routes/depositsRoutes.js
import express from 'express';
import {
  getDepositsOverview,
  createDeposit,
  getDepositById,
} from '../controllers/depositsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadCheckImages } from '../config/cloudinary.js';

const router = express.Router();

router.get('/overview', protect, getDepositsOverview);

// uploadCheckImages parses multipart/form-data and uploads to Cloudinary
router.post('/', protect, uploadCheckImages, createDeposit);

router.get('/:id', protect, getDepositById);

export default router;