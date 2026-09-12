// routes/adminGoalsRoutes.js
import express from 'express';
import {
  adminListGoals,
  adminGetUserGoals,
  adminUpdateUserGoals,
  adminUpdateGoal,
  adminAddGoalActivity,
  adminUpdateGoalActivity,
  adminDeleteGoalActivity,
} from '../controllers/adminGoalsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/',  protect, adminListGoals);
router.get('/:userId',  protect, adminGetUserGoals);
router.put('/:userId',  protect, adminUpdateUserGoals);
router.put('/:userId/goals/:goalId', protect, adminUpdateGoal);

router.post(
  '/:userId/goals/:goalId/activities',
  protect,
  adminAddGoalActivity
);
router.put(
  '/:userId/goals/:goalId/activities/:activityId',
  protect,
  adminUpdateGoalActivity
);
router.delete(
  '/:userId/goals/:goalId/activities/:activityId',
  protect,
  adminDeleteGoalActivity
);

export default router;