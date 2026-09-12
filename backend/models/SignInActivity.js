// models/SignInActivity.js
import mongoose from 'mongoose';

const signInActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date:      { type: Date, default: Date.now, index: true },
    location:  { type: String, default: 'Unknown' },
    device:    { type: String, default: 'Unknown' },
    ipAddress: { type: String, default: '' },
  },
  { timestamps: true }
);

signInActivitySchema.index({ userId: 1, date: -1 });

export default mongoose.model('SignInActivity', signInActivitySchema);