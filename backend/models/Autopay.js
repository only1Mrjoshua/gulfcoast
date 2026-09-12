// models/Autopay.js
import mongoose from 'mongoose';

const autopaySchema = new mongoose.Schema({
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

  nextAmount: { type: Number, required: true },
  frequency:  {
    type: String,
    enum: ['Weekly', 'Every 2 weeks', 'Monthly', 'Quarterly', 'Yearly'],
    default: 'Monthly',
  },
  nextDate: { type: Date, required: true },
  endDate:  { type: Date, default: null },

  enabled: { type: Boolean, default: true },
}, { timestamps: true });

autopaySchema.index({ userId: 1, enabled: 1 });

export default mongoose.model('Autopay', autopaySchema);