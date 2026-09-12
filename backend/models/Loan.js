// models/Loan.js
import mongoose from 'mongoose';

const loanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['Auto', 'Home', 'Personal', 'Student', 'Business', 'Other'],
    required: true,
  },
  name: { type: String, required: true },
  accountNumber: { type: String, required: true },
  originalAmount: { type: Number, required: true },
  currentBalance: { type: Number, required: true },
  interestRate: { type: Number, required: true },
  monthlyPayment: { type: Number, required: true },
  nextPaymentDate: { type: Date },
  termMonths: { type: Number },
  monthsRemaining: { type: Number },
  status: {
    type: String,
    enum: ['Active', 'Paid Off', 'Defaulted', 'Pending'],
    default: 'Active',
  },

  // ⬇️ NEW
  maturityDate:  { type: Date, default: null },
  paymentMethod: { type: String, default: '' }, // e.g. "Checking •••• 4821"
}, { timestamps: true });

export default mongoose.model('Loan', loanSchema);