// models/TrustedDevice.js
import mongoose from 'mongoose';

const trustedDeviceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    deviceId: {
      type: String,
      default: '',
      index: true,
    },
    name:      { type: String, required: true },
    current:   { type: Boolean, default: false },
    lastUsed:  { type: Date, default: Date.now },
    userAgent: { type: String, default: '' },
    ipAddress: { type: String, default: '' },
  },
  { timestamps: true }
);

// Fast lookups for the trust check on login
trustedDeviceSchema.index({ userId: 1, deviceId: 1, ipAddress: 1 });
trustedDeviceSchema.index({ userId: 1, lastUsed: -1 });

export default mongoose.model('TrustedDevice', trustedDeviceSchema);