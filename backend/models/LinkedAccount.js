// models/LinkedAccount.js
import mongoose from 'mongoose';

const linkedAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    institution: { type: String, required: true },
    account:     { type: String, required: true },
    status: {
      type: String,
      enum: ['Active', 'Pending', 'Verified', 'Inactive'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

linkedAccountSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('LinkedAccount', linkedAccountSchema);