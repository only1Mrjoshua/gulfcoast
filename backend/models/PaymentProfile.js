// models/PaymentProfile.js
import mongoose from 'mongoose';

const upcomingPaymentSchema = new mongoose.Schema({
  name:     { type: String, default: '' },
  dueDate:  { type: Date,   default: null },
  balance:  { type: Number, default: 0 },
  autopay:  { type: Boolean, default: false },
});

const automaticPaymentSchema = new mongoose.Schema({
  name:    { type: String, default: '' },
  frequency: {
    type: String,
    enum: ['Daily', 'Weekly', 'Monthly', 'Yearly'],
    default: 'Monthly',
  },
  balance:  { type: Number, default: 0 },
  nextDate: { type: Date,   default: null },
  autopay:  { type: Boolean, default: false },
});

const paymentProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  dueSoonAmount:   { type: Number, default: 0 },
  dueWithinDays:   { type: Number, default: 7 },
  scheduledAmount: { type: Number, default: 0 },
  paidThisMonth:   { type: Number, default: 0 },
  upcomingPayments:  [upcomingPaymentSchema],
  automaticPayments: [automaticPaymentSchema],
}, { timestamps: true });

export default mongoose.model('PaymentProfile', paymentProfileSchema);