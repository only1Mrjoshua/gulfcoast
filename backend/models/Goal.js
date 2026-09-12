// models/Goal.js
import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name:     { type: String, required: true },
    category: { type: String, default: 'General Savings' },

    currentAmount: { type: Number, default: 0, min: 0 },
    targetAmount:  { type: Number, required: true, min: 0.01 },
    targetDate:    { type: Date,   required: true },

    // Source = where money comes FROM (Checking)
    // Linked = where money goes TO      (Savings)
    sourceAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    linkedAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    sourceAccountLabel: { type: String, default: '' },
    linkedAccountLabel: { type: String, default: '' },

    // Auto-save
    contributionAmount: { type: Number, default: 0, min: 0 },
    contributionFrequency: {
      type: String,
      enum: ['Daily', 'Weekly', 'Biweekly', 'Monthly'],
      default: 'Monthly',
    },
    // Day-of-week (0-6) for Weekly/Biweekly
    // Day-of-month (1-31) for Monthly
    // null for Daily
    contributionDay: { type: Number, default: null },

    nextContributionDate: { type: Date, default: null, index: true },
    lastContributionDate: { type: Date, default: null },

    status: {
      type: String,
      enum: ['On Track', 'Off Track', 'Paused', 'Completed'],
      default: 'On Track',
      index: true,
    },
  },
  { timestamps: true }
);

goalSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Goal', goalSchema);