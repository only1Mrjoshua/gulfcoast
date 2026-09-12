// routes/adminAccountsRoutes.js
import express from 'express';
import {
  adminListAccounts,
  adminListAccountUsers,
  adminCreateAccount,
  adminUpdateAccount,
  adminGetAccount,
} from '../controllers/adminAccountsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Order matters — `/users` must come before `/:id`
router.get('/', protect, adminListAccounts);
router.get('/users', protect, adminListAccountUsers);
router.post('/', protect, adminCreateAccount);
router.get('/:id', protect, adminGetAccount);
router.put('/:id', protect, adminUpdateAccount);

export default router;