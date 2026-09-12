// routes/settingsRoutes.js
import express from 'express';
import {
  getSettings,
  updateProfile,
  updatePreferences,
  updateTwoStep,
  updatePassword,
  createLinkedAccount,
  removeLinkedAccount,
  signOutAllDevices,
} from '../controllers/settingsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/',                       protect, getSettings);
router.put('/profile',                protect, updateProfile);
router.put('/preferences',            protect, updatePreferences);
router.put('/two-step',               protect, updateTwoStep);
router.put('/password',               protect, updatePassword);
router.post('/linked-accounts',       protect, createLinkedAccount);   // ← new
router.delete('/linked-accounts/:id', protect, removeLinkedAccount);
router.post('/sign-out-all',          protect, signOutAllDevices);

export default router;