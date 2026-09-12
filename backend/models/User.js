// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },

  creditScore: {
    score: { type: Number, default: 0 },
    rating: { type: String, default: 'N/A' },
    change: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
  },

  // ⬇️ All 5 alert types from the Accounts page
  alertPreferences: {
    lowBalance:              { type: Boolean, default: true },
    largeTransaction:        { type: Boolean, default: true },
    deposit:                 { type: Boolean, default: true },
    paymentReminder:         { type: Boolean, default: true },
    monthlyStatement:        { type: Boolean, default: true },
  },
}, { timestamps: true });

export default mongoose.model('User', userSchema);