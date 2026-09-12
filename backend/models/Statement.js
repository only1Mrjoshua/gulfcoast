// models/Statement.js
import mongoose from 'mongoose';

const snapshotTxSchema = new mongoose.Schema({
  date:            { type: Date },
  description:     { type: String, default: '' },
  category:        { type: String, default: '' },
  merchant:        { type: String, default: '' },
  amount:          { type: Number, default: 0 },
  balance:         { type: Number, default: 0 },
  type:            { type: String, default: '' },
  referenceNumber: { type: String, default: '' },
}, { _id: false });

const statementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  // Which period
  month:      { type: String, required: true },   // "2026-09"
  monthLabel: { type: String, required: true },   // "September 2026"

  // Optional account scope — null = all accounts
  accountId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Account', default: null },
  accountLabel: { type: String, default: 'All Accounts' },

  // Who generated it
  generatedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  generatedByName: { type: String, default: 'Admin' },
  generatedAt:     { type: Date, default: Date.now },

  // Frozen summary — computed once at generation
  summary: {
    totalIn:  { type: Number, default: 0 },
    totalOut: { type: Number, default: 0 },
    net:      { type: Number, default: 0 },
    count:    { type: Number, default: 0 },
  },

  // Frozen transactions — { _id: false } so they don't get their own ids
  transactions: [snapshotTxSchema],

  status: {
    type: String,
    enum: ['Available', 'Revoked'],
    default: 'Available',
    index: true,
  },
}, { timestamps: true });

// One statement per user+month+account. Regenerating overwrites.
statementSchema.index(
  { userId: 1, month: 1, accountId: 1 },
  { unique: true }
);

statementSchema.index({ userId: 1, status: 1, generatedAt: -1 });
statementSchema.index({ status: 1, generatedAt: -1 });

export default mongoose.model('Statement', statementSchema);