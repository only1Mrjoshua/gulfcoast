// models/Notification.js
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
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
  },
  type: { type: String, required: true }, // e.g. "Large Transaction Alert"
  date: { type: Date, required: true },
  priority: {
    type: String,
    enum: ['Normal', 'Important'],
    default: 'Normal',
  },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;