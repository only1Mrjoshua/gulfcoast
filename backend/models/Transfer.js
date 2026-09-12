// models/Transfer.js
import mongoose from 'mongoose';

const transferSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  transactionNumber: { type: String, required: true, unique: true },

  type: {
    type: String,
    enum: ['internal', 'external', 'wire', 'recurring'],
    required: true,
  },

  // ── Source account (always required) ─────────────────────────
  fromAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
  },
  fromAccountName: String,     // denormalized: "Checking"
  fromLastFour: String,

  // ── Destination (internal / recurring only) ──────────────────
  toAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    default: null,
  },
  toAccountName: String,
  toLastFour: String,

  // ── External recipient (external / wire only) ────────────────
  recipient: {
    fullName: String,
    bankName: String,
    routingNumber: String,
    accountNumber: String,
    accountType: { type: String, enum: ['checking', 'savings', null], default: null },
    bankAddress: String,
  },

  // ── Amount & scheduling ─────────────────────────────────────
  amount: { type: Number, required: true, min: 0.01 },
  wireFee: { type: Number, default: 0 },        // 25 for wire, 0 otherwise
  totalDebit: { type: Number, required: true }, // amount + wireFee

  transferDate: { type: Date, required: true },
  frequency: {
    type: String,
    enum: ['One time', 'Weekly', 'Every 2 weeks', 'Monthly'],
    default: 'One time',
  },
  expectedArrival: String,     // "Same business day", "1–3 business days", etc.
  memo: { type: String, default: '' },

  verificationMethod: { type: String, default: 'instant' },

  // ── Status ──────────────────────────────────────────────────
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Cancelled'],
    default: 'Pending',
    index: true,
  },
  adminNote: { type: String, default: '' },
  completedAt: { type: Date, default: null },
  failedAt: { type: Date, default: null },

  // ── Denormalized sender name (for receipt) ──────────────────
  senderName: String,
}, { timestamps: true });

transferSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Transfer', transferSchema);