// models/Payee.js
import mongoose from 'mongoose';

const payeeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name:     { type: String, required: true },
  nickname: { type: String, default: '' },
  category: {
    type: String,
    enum: ['Utilities', 'Credit Card', 'Loan', 'Insurance', 'Subscription', 'Rent', 'Other'],
    default: 'Other',
  },
  accountNumber: { type: String, default: '' },
  address:       { type: String, default: '' },
  phone:         { type: String, default: '' },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
}, { timestamps: true });

payeeSchema.index({ userId: 1, name: 1 });

export default mongoose.model('Payee', payeeSchema);