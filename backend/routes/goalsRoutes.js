// routes/goalsRoutes.js
import express from 'express';
import {
  getGoalsOverview,
  createGoal,
  updateGoal,
  deleteGoal,
  addMoneyToGoal,
  updateAutoSave,
  getGoalActivities,
} from '../controllers/goalsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/overview',         protect, getGoalsOverview);
router.post('/',                protect, createGoal);
router.put('/:id',              protect, updateGoal);
router.delete('/:id',           protect, deleteGoal);
router.post('/:id/contribute',  protect, addMoneyToGoal);
router.put('/:id/autosave',     protect, updateAutoSave);
router.get('/:id/activities',   protect, getGoalActivities);

export default router;