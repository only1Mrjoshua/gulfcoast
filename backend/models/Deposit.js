// models/Deposit.js
import mongoose from 'mongoose';

const depositSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
  },
  accountName:     { type: String, required: true },
  accountLastFour: { type: String, default: '' },

  amount: { type: Number, required: true, min: 0.01 },

  method: {
    type: String,
    enum: ['Mobile Check Deposit', 'Direct Deposit', 'ATM Deposit', 'Wire Deposit'],
    default: 'Mobile Check Deposit',
  },

  // ⬇️ Cloudinary URLs + public_ids for cleanup
  frontImage:         { type: String, default: '' },
  frontImagePublicId: { type: String, default: '' },
  backImage:          { type: String, default: '' },
  backImagePublicId:  { type: String, default: '' },

  status: {
    type: String,
    enum: ['Processing', 'Accepted', 'Rejected'],
    default: 'Processing',
    index: true,
  },

  confirmationNumber: { type: String, default: '' },

  adminNote:   { type: String, default: '' },
  processedAt: { type: Date,   default: null },

  submittedAt: { type: Date, default: Date.now, index: true },
}, { timestamps: true });

depositSchema.index({ userId: 1, submittedAt: -1 });
depositSchema.index({ userId: 1, status: 1 });

export default mongoose.model('Deposit', depositSchema);