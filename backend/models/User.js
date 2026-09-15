// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  username:  { type: String, required: true, unique: true },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true },

  // Hashed 4-digit bank PIN, required for authorizing transfers.
  // select: false keeps it out of every query unless explicitly requested.
  bankPin: { type: String, default: '', select: false },

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

  loanAlertPreferences: {
    paymentReminder:    { type: Boolean, default: true },
    dueDateAlert:       { type: Boolean, default: true },
    interestRateChange: { type: Boolean, default: true },
    payoffNotification: { type: Boolean, default: true },
  },

  notificationPreferences: {
    account:     { type: Boolean, default: true },
    transaction: { type: Boolean, default: true },
    promotions:  { type: Boolean, default: true },
    security:    { type: Boolean, default: true },

    deposit:     { type: Boolean, default: true },
    transfer:    { type: Boolean, default: true },
    payment:     { type: Boolean, default: true },
  },

  mailingAddress: { type: String, default: '' },

  twoStepVerification: { type: Boolean, default: false },

  accountPreferences: {
    defaultAccount:         { type: String, default: '' },
    defaultTransferAccount: { type: String, default: '' },
    defaultPaymentAccount:  { type: String, default: '' },
  },

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