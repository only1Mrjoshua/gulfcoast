// controllers/authController.js
import User from '../models/User.js';
import LoginAttempt from '../models/LoginAttempt.js';
import TrustedDevice from '../models/TrustedDevice.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import ErrorResponse from '../utils/errorResponse.js';
import { sendOTPEmail } from '../utils/mailer.js';
import {
  generateOTP,
  hashOTP,
  verifyOTP,
  maskEmail,
  describeDevice,
  getClientIP,
} from '../utils/otp.js';

const DEFAULT_RESTRICTED_REASON =
  'Your account has been restricted. Please visit your physical branch to rectify.';

// ─────────────────────────────────────────────────────────────
//  Send the standard token response
// ─────────────────────────────────────────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      role: user.role,
      hasBankPin: !!user.bankPin,
      restricted: !!user.restricted,
      restrictedReason: user.restrictedReason || '',
    },
  });
};

// ─────────────────────────────────────────────────────────────
//  Helper: reject a restricted user consistently
// ─────────────────────────────────────────────────────────────
const rejectRestricted = (res, user) => {
  return res.status(403).json({
    success: false,
    restricted: true,
    error:
      user.restrictedReason ||
      DEFAULT_RESTRICTED_REASON,
    restrictedReason:
      user.restrictedReason ||
      DEFAULT_RESTRICTED_REASON,
  });
};

// ─────────────────────────────────────────────────────────────
//  POST /api/auth/register
// ─────────────────────────────────────────────────────────────
export const register = async (req, res, next) => {
  try {
    const { firstName, lastName, username, email, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return next(new ErrorResponse('User already exists', 400));

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
//  POST /api/auth/login
//
//  Restricted users are rejected here with HTTP 403 and
//  { restricted: true } so the frontend can show the toast.
// ─────────────────────────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const { username, password, deviceId = '' } = req.body;

    if (!username || !password) {
      return next(
        new ErrorResponse('Please provide username and password', 400)
      );
    }

    const user = await User.findOne({
      $or: [{ username }, { email: username }],
    }).select('+password +bankPin');

    if (!user) return next(new ErrorResponse('Invalid credentials', 401));

    if (user.status === 'Suspended') {
      return next(
        new ErrorResponse(
          'Your account has been suspended. Please contact support.',
          403
        )
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return next(new ErrorResponse('Invalid credentials', 401));

    // ── Restricted account — block login entirely ──────────
    if (user.restricted) {
      return rejectRestricted(res, user);
    }

    // ── Trust check ────────────────────────────────────────
    const ipAddress = getClientIP(req);
    const userAgent = req.headers['user-agent'] || '';

    const trusted = deviceId
      ? await TrustedDevice.findOne({
          userId: user._id,
          deviceId,
          ipAddress,
        }).lean()
      : null;

    if (trusted) {
      await TrustedDevice.updateOne(
        { _id: trusted._id },
        { $set: { lastUsed: new Date(), userAgent } }
      );

      return sendTokenResponse(user, 200, res);
    }

    // ── New device or new IP → OTP required ────────────────
    const otp = generateOTP();
    const otpHash = await hashOTP(otp);

    await LoginAttempt.deleteMany({ userId: user._id });

    const attempt = await LoginAttempt.create({
      userId: user._id,
      otpHash,
      deviceId,
      ipAddress,
      userAgent,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendOTPEmail({
      to: user.email,
      name: user.firstName,
      otp,
      device: describeDevice(userAgent),
      ip: ipAddress,
    });

    return res.status(200).json({
      success: false,
      requiresOTP: true,
      attemptId: attempt._id,
      maskedEmail: maskEmail(user.email),
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
//  POST /api/auth/verify-otp
//
//  Also blocks restricted users — a user could otherwise pass
//  the credentials check, get an OTP, then complete login.
// ─────────────────────────────────────────────────────────────
export const verifyLoginOTP = async (req, res, next) => {
  try {
    const { attemptId, otp } = req.body;

    if (!attemptId || !otp) {
      return next(new ErrorResponse('Verification code is required', 400));
    }

    const attempt = await LoginAttempt.findById(attemptId);
    if (!attempt) {
      return next(
        new ErrorResponse(
          'This verification code has expired. Please sign in again.',
          400
        )
      );
    }

    if (new Date() > attempt.expiresAt) {
      await LoginAttempt.deleteOne({ _id: attempt._id });
      return next(
        new ErrorResponse(
          'This verification code has expired. Please sign in again.',
          400
        )
      );
    }

    if (attempt.attempts >= 5) {
      await LoginAttempt.deleteOne({ _id: attempt._id });
      return next(
        new ErrorResponse(
          'Too many failed attempts. Please sign in again.',
          429
        )
      );
    }

    const ok = await verifyOTP(String(otp).trim(), attempt.otpHash);
    if (!ok) {
      attempt.attempts += 1;
      await attempt.save();
      return next(
        new ErrorResponse(
          `Incorrect code. ${Math.max(5 - attempt.attempts, 0)} attempt(s) remaining.`,
          400
        )
      );
    }

    const user = await User.findById(attempt.userId).select('+bankPin');
    if (!user) {
      await LoginAttempt.deleteOne({ _id: attempt._id });
      return next(new ErrorResponse('User not found', 404));
    }

    // ── Restricted account — block at the OTP step too ─────
    if (user.restricted) {
      await LoginAttempt.deleteOne({ _id: attempt._id });
      return rejectRestricted(res, user);
    }

    await TrustedDevice.findOneAndUpdate(
      {
        userId: user._id,
        deviceId: attempt.deviceId,
        ipAddress: attempt.ipAddress,
      },
      {
        $set: {
          userId: user._id,
          deviceId: attempt.deviceId,
          ipAddress: attempt.ipAddress,
          userAgent: attempt.userAgent,
          name: describeDevice(attempt.userAgent),
          current: true,
          lastUsed: new Date(),
        },
      },
      { upsert: true, returnDocument: 'after' }
    );

    await LoginAttempt.deleteOne({ _id: attempt._id });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};