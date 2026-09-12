// routes/statementsRoutes.js
import express from 'express';
import {
  getMyStatements,
  getStatementAccounts,
  getMyStatement,
  downloadMyStatement,
} from '../controllers/statementsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Order matters — `/accounts` must be registered BEFORE `/:id`
router.get('/', protect, getMyStatements);
router.get('/accounts', protect, getStatementAccounts);
router.get('/:id/download', protect, downloadMyStatement);
router.get('/:id', protect, getMyStatement);

export default router;