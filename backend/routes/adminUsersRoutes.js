// routes/adminUsersRoutes.js
import express from 'express';
import {
  adminListUsers,
  adminUpdateUser,
  adminDeleteUser,
} from '../controllers/adminUsersController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, adminListUsers);
router.put('/:id', protect, adminUpdateUser);
router.delete('/:id', protect, adminDeleteUser);

export default router;