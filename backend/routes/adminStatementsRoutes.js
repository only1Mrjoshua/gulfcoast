// routes/adminStatementsRoutes.js
import express from 'express';
import {
  adminListStatements,
  adminListUsers,
  adminGetUserAccounts,
  adminGenerateStatement,
  adminGetStatement,
  adminDownloadStatement,
  adminRevokeStatement,
} from '../controllers/adminStatementsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, adminListStatements);
router.get('/users', protect, adminListUsers);
router.get('/users/:userId/accounts', protect, adminGetUserAccounts);

router.post('/', protect, adminGenerateStatement);
router.get('/:id/download', protect, adminDownloadStatement);
router.get('/:id', protect, adminGetStatement);
router.delete('/:id', protect, adminRevokeStatement);

export default router;