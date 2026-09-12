// routes/adminReportsRoutes.js
import express from 'express';
import {
  adminListReports,
  adminUpdateReportStatus,
} from '../controllers/adminReportsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, adminListReports);
router.put('/:id/status', protect, adminUpdateReportStatus);

export default router;