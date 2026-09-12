// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  username:  { type: String, required: true, unique: true },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
    index: true,
  },

  status: {
    type: String,
    enum: ['Active', 'Suspended'],
    default: 'Active',
    index: true,
  },

  creditScore: {
    score:       { type: Number, default: 0 },
    rating:      { type: String, default: 'N/A' },
    change:      { type: Number, default: 0 },
    lastUpdated: { type: Date,   default: Date.now },
  },

  alertPreferences: {
    lowBalance:       { type: Boolean, default: true },
    largeTransaction: { type: Boolean, default: true },
    deposit:          { type: Boolean, default: true },
    paymentReminder:  { type: Boolean, default: true },
    monthlyStatement: { type: Boolean, default: true },
  },

  cardAlertPreferences: {
    largePurchase:            { type: Boolean, default: true },
    cardTransaction:          { type: Boolean, default: true },
    internationalTransaction: { type: Boolean, default: true },
    onlinePurchase:           { type: Boolean, default: true },
    atmWithdrawal:            { type: Boolean, default: true },
    paymentDue:               { type: Boolean, default: true },
    cardExpiration:           { type: Boolean, default: true },
  },

  // ⬇️ NEW — Loan alert preferences shown on the Loans page
  loanAlertPreferences: {
    paymentReminder:    { type: Boolean, default: true },
    dueDateAlert:       { type: Boolean, default: true },
    interestRateChange: { type: Boolean, default: true },
    payoffNotification: { type: Boolean, default: true },
  },

  // ⬇️ NEW — Optional profile fields used to prefill the loan application.
  //           All default to empty so existing records are unaffected.
  dateOfBirth:    { type: String, default: '' },
  ssn:            { type: String, default: '' },
  phone:          { type: String, default: '' },
  address: {
    street: { type: String, default: '' },
    city:   { type: String, default: '' },
    state:  { type: String, default: '' },
    zip:    { type: String, default: '' },
  },
  housingStatus:  { type: String, default: 'Rent' },
  monthlyHousing: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('User', userSchema);