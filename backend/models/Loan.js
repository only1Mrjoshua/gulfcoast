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
  name: { type: String, required: true }, // e.g. "Auto Loan — Honda Civic"
  accountNumber: { type: String, required: true },
  originalAmount: { type: Number, required: true },
  currentBalance: { type: Number, required: true },     // remaining principal
  interestRate: { type: Number, required: true },       // e.g. 5.49 (%)
  monthlyPayment: { type: Number, required: true },
  nextPaymentDate: { type: Date },
  termMonths: { type: Number },                         // total term
  monthsRemaining: { type: Number },
  status: {
    type: String,
    enum: ['Active', 'Paid Off', 'Defaulted', 'Pending'],
    default: 'Active',
  },
}, { timestamps: true });

export default mongoose.model('Loan', loanSchema);