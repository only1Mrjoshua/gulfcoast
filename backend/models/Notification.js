// models/Notification.js
import mongoose from 'mongoose';

const NOTIFICATION_CATEGORIES = [
  'Account',
  'Transaction',
  'Promotions',
  'Security',
  'Card',
  'Loan',
  'Deposit',
  'Transfer',
  'Payment',
];

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: NOTIFICATION_CATEGORIES,
      required: true,
      index: true,
    },
    // Only used for Card and Loan categories
    subCategory: {
      type: String,
      default: null,
      index: true,
    },
    title:   { type: String, required: true },
    message: { type: String, required: true },
    date:    { type: Date, default: Date.now, index: true },
    priority: {
      type: String,
      enum: ['Normal', 'Important'],
      default: 'Normal',
    },
    read: { type: Boolean, default: false, index: true },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, date: -1 });
notificationSchema.index({ userId: 1, category: 1, date: -1 });

notificationSchema.statics.CATEGORIES = NOTIFICATION_CATEGORIES;

export default mongoose.model('Notification', notificationSchema);