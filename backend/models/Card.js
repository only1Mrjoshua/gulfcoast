// models/Card.js
import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  company:     { type: String, default: '' },
  description: { type: String, default: '' },
  amount:      { type: Number, default: 0 },
  date:        { type: Date,   default: Date.now },
  // ⬇️ NEW — links this activity to a Transaction document
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    default: null,
  },
}, { _id: true });

const cardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  cardName: { type: String, required: true },
  type: {
    type: String,
    enum: ['Debit', 'Credit'],
    required: true,
  },

  fullNumber:   { type: String, required: true },
  cvv:          { type: String, default: '' },
  expiryMonth:  { type: String, required: true },
  expiryYear:   { type: String, required: true },
  cardholderName: { type: String, default: '' },

  linkedAccountId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Account', default: null },
  linkedAccountType:  { type: String, enum: ['Checking', 'Savings', null], default: null },
  linkedAccountLabel: { type: String, default: '' },

  balance:         { type: Number, default: 0 },
  availableCredit: { type: Number, default: 0 },
  creditLimit:     { type: Number, default: 0 },
  minimumPayment:  { type: Number, default: 0 },
  paymentDueDate:  { type: Date, default: null },
  nextStatementDate: { type: Date, default: null },

  status: {
    type: String,
    enum: ['Active', 'Temporary Locked', 'Locked', 'Expired'],
    default: 'Active',
    index: true,
  },

  controls: {
    locked:                 { type: Boolean, default: false },
    contactless:            { type: Boolean, default: true },
    onlinePurchases:        { type: Boolean, default: true },
    internationalPurchases: { type: Boolean, default: true },
    atmWithdrawals:         { type: Boolean, default: true },
    notifications:          { type: Boolean, default: true },
  },

  activity: [activitySchema],
}, { timestamps: true });

cardSchema.index({ userId: 1, status: 1 });
cardSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Card', cardSchema);