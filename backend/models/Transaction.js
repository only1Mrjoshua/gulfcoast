// models/Transaction.js
import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
    index: true,
  },

  // ⬇️ Links loan payments back to the Loan they belong to
  loanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loan',
    default: null,
    index: true,
  },

  // ⬇️ Links goal contributions back to the Goal they belong to
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    default: null,
    index: true,
  },

  description: { type: String, required: true },
  amount:      { type: Number, required: true },  // signed: + in, - out
  type: {
    type: String,
    enum: ['credit', 'debit', 'transfer', 'payment', 'deposit', 'withdrawal', 'fee', 'interest', 'purchase'],
    required: true,
  },
  status: {
    type: String,
    enum: ['Completed', 'Pending', 'Scheduled', 'Failed', 'Cancelled'],
    default: 'Completed',
    index: true,
  },
  date: { type: Date, default: Date.now, index: true },

  category:        { type: String, default: '', index: true },
  merchant:        { type: String, default: '' },
  referenceNumber: { type: String, default: '' },
  location:        { type: String, default: '' },
  paymentMethod:   { type: String, default: '' },
}, { timestamps: true });

transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, accountId: 1, date: -1 });
transactionSchema.index({ userId: 1, goalId: 1, date: -1 });

// Synchronous hook — no next parameter
transactionSchema.pre('save', function () {
  if (!this.referenceNumber) {
    this.referenceNumber = 'TXN-' + String(this._id).slice(-8).toUpperCase();
  }
});

export default mongoose.model('Transaction', transactionSchema);