// models/LoanPayment.js
import mongoose from 'mongoose';

const loanPaymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    loanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Loan',
      required: true,
      index: true,
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      default: null,
    },
    date:      { type: Date,   required: true, index: true },
    amount:    { type: Number, required: true },
    principal: { type: Number, required: true },
    interest:  { type: Number, required: true },
    status: {
      type: String,
      enum: ['Completed', 'Pending', 'Failed'],
      default: 'Completed',
    },
  },
  { timestamps: true }
);

loanPaymentSchema.index({ loanId: 1, date: -1 });

export default mongoose.model('LoanPayment', loanPaymentSchema);