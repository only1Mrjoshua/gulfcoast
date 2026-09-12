// models/UserLoan.js
import mongoose from 'mongoose';

const userLoanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    totalLoanBalance: { type: Number, default: 0, min: 0 },
    nextPayment:      { type: Number, default: 0, min: 0 },
    dueDate:          { type: Date,   default: null },
    activeLoans:      { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('UserLoan', userLoanSchema);