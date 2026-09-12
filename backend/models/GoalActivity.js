// models/GoalActivity.js
import mongoose from 'mongoose';

const goalActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal',
      required: true,
      index: true,
    },
    transactionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
      },
    ],
    date:        { type: Date,   required: true, index: true },
    description: { type: String, required: true },
    amount:      { type: Number, required: true },
    balance:     { type: Number, required: true },
    kind: {
      type: String,
      enum: ['starting', 'manual', 'auto', 'withdrawal', 'admin'],
      default: 'manual',
    },
  },
  { timestamps: true }
);

goalActivitySchema.index({ goalId: 1, date: -1 });

export default mongoose.model('GoalActivity', goalActivitySchema);