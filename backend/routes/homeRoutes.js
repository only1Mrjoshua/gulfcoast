import express from 'express';
import { getHomeData } from '../controllers/homeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/dashboard', protect, getHomeData);

export default router;