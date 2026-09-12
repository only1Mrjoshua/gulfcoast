// models/Notification.js
import mongoose from 'mongoose';

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
      enum: ['Account', 'Transaction', 'Promotions', 'Security'],
      required: true,
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

export default mongoose.model('Notification', notificationSchema);