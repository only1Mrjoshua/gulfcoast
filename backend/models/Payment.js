// models/Payment.js
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  payeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payee',
    required: true,
  },
  payeeName: { type: String, required: true },

  fromAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
  },
  fromAccountName: { type: String, required: true },
  fromLastFour:    { type: String, default: '' },

  amount: { type: Number, required: true, min: 0.01 },
  date:   { type: Date, required: true },

  frequency: {
    type: String,
    enum: ['One time', 'Weekly', 'Every 2 weeks', 'Monthly', 'Quarterly', 'Yearly'],
    default: 'One time',
  },
  isRecurring: { type: Boolean, default: false },
  endDate:     { type: Date, default: null },
  memo:        { type: String, default: '' },

  status: {
    type: String,
    enum: ['Scheduled', 'Pending', 'Completed', 'Failed', 'Cancelled'],
    default: 'Scheduled',
    index: true,
  },

  confirmationNumber: { type: String, default: '' },
  completedAt:        { type: Date, default: null },
  failedAt:           { type: Date, default: null },
  adminNote:          { type: String, default: '' },
}, { timestamps: true });

paymentSchema.index({ userId: 1, date: -1 });
paymentSchema.index({ userId: 1, status: 1, date: 1 });

export default mongoose.model('Payment', paymentSchema);