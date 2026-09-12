// routes/accountsRoutes.js
import express from 'express';
import {
  getAccountsOverview,
  updateAlertPreferences,
} from '../controllers/accountsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.get('/overview', protect, getAccountsOverview);
router.put('/alerts', protect, updateAlertPreferences);

export default router;