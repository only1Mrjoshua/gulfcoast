// models/Account.js
import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['Checking', 'Savings', 'Credit'],
    required: true,
  },
  subType: {
    type: String,
    default: null,   // e.g. "Standard", "High Yield", "Money Market", "Rewards"
  },
  accountNumber: { type: String, required: true },
  totalBalance: { type: Number, default: 0 },
  availableBalance: { type: Number, default: 0 },
  pendingBalance: { type: Number, default: 0 },
  interestRate: { type: Number, default: null },
  status: {
    type: String,
    enum: ['Active', 'Suspended', 'Closed'],
    default: 'Active',
  },

  // ⬇️ NEW: used to identify the user's main checking account
  isPrimary: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Account', accountSchema);