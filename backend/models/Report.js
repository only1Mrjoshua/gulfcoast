// models/Report.js
import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    required: true,
    index: true,
  },

  // Denormalized for admin list display
  transactionDescription: { type: String, default: '' },
  transactionAmount:      { type: Number, default: 0 },

  referenceNumber: { type: String, required: true, unique: true },
  reason:          { type: String, required: true, maxlength: 2000 },

  status: {
    type: String,
    enum: ['Open', 'In Review', 'Resolved', 'Closed'],
    default: 'Open',
    index: true,
  },

  adminNote:   { type: String, default: '' },
  submittedAt: { type: Date, default: Date.now, index: true },
  resolvedAt:  { type: Date, default: null },
}, { timestamps: true });

reportSchema.index({ userId: 1, submittedAt: -1 });
reportSchema.index({ status: 1, submittedAt: -1 });

export default mongoose.model('Report', reportSchema);