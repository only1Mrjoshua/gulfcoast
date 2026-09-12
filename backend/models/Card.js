// models/Card.js
import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  company: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
}, { _id: false });

const cardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  cardName: { type: String, required: true },
  type: {
    type: String,
    enum: ['Debit', 'Credit'],
    required: true,
  },
  fullNumber: { type: String, required: true },
  expiryMonth: { type: String, required: true },
  expiryYear: { type: String, required: true },
  linkedAccount: {
    type: String,
    enum: ['Checking', 'Savings'],
    required: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Temporary Locked', 'Locked'],
    default: 'Active',
  },
  activity: [activitySchema],
}, { timestamps: true });

const Card = mongoose.model('Card', cardSchema);
export default Card;