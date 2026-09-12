// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  username:  { type: String, required: true, unique: true },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },

  creditScore: {
    score:       { type: Number, default: 0 },
    rating:      { type: String, default: 'N/A' },
    change:      { type: Number, default: 0 },
    lastUpdated: { type: Date,   default: Date.now },
  },

  // Account alert preferences (existing)
  alertPreferences: {
    lowBalance:       { type: Boolean, default: true },
    largeTransaction: { type: Boolean, default: true },
    deposit:          { type: Boolean, default: true },
    paymentReminder:  { type: Boolean, default: true },
    monthlyStatement: { type: Boolean, default: true },
  },

  // ⬇️ NEW: Card alert preferences
  cardAlertPreferences: {
    largePurchase:           { type: Boolean, default: true },
    cardTransaction:         { type: Boolean, default: true },
    internationalTransaction:{ type: Boolean, default: true },
    onlinePurchase:          { type: Boolean, default: true },
    atmWithdrawal:           { type: Boolean, default: true },
    paymentDue:              { type: Boolean, default: true },
    cardExpiration:          { type: Boolean, default: true },
  },
}, { timestamps: true });

export default mongoose.model('User', userSchema);