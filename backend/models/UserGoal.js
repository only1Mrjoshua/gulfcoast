// models/UserGoal.js
import mongoose from 'mongoose';

const userGoalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    totalSavedBalance:   { type: Number, default: 0, min: 0 },
    activeGoals:         { type: Number, default: 0, min: 0 },
    onTrack:             { type: Number, default: 0, min: 0 },
    upcomingTargetDate:  { type: Date,   default: null },
  },
  { timestamps: true }
);

export default mongoose.model('UserGoal', userGoalSchema);