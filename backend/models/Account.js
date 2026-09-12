// models/Account.js
import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ['Checking', 'Savings', 'Credit', 'External'],
      required: true,
      index: true,
    },

    // e.g. "Standard", "High Yield", "Money Market", "Rewards", "Checking", "Savings"
    subType: {
      type: String,
      default: null,
    },

    accountNumber: { type: String, required: true },

    // ── Only used when type === 'External' (linked accounts at other banks)
    institution:   { type: String, default: '' },
    routingNumber: { type: String, default: '' },

    // ── Balances
    totalBalance:     { type: Number, default: 0 },
    availableBalance: { type: Number, default: 0 },
    pendingBalance:   { type: Number, default: 0 },

    interestRate: { type: Number, default: null },

    status: {
      type: String,
      enum: ['Active', 'Suspended', 'Closed'],
      default: 'Active',
      index: true,
    },

    // Identifies the user's main checking account
    isPrimary: { type: Boolean, default: false },
  },
  { timestamps: true }
);

accountSchema.index({ userId: 1, type: 1 });
accountSchema.index({ userId: 1, isPrimary: -1, createdAt: 1 });

export default mongoose.model('Account', accountSchema);