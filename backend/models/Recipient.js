// models/Recipient.js
import mongoose from 'mongoose';

const recipientSchema = new mongoose.Schema(
  {
    accountNumber: { type: String, required: true, unique: true, index: true },
    fullName:      { type: String, required: true },
    bankName:      { type: String, required: true },
    routingNumber: { type: String, required: true },
    accountType:   { type: String, enum: ['checking', 'savings'], default: 'checking' },
    bankAddress:   { type: String, default: '' },
    active:        { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Recipient', recipientSchema);