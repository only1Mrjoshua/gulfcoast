// scripts/clearEmilyDavisSessions.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from '../models/User.js';
import TrustedDevice from '../models/TrustedDevice.js';
import LoginAttempt from '../models/LoginAttempt.js';
import SignInActivity from '../models/SignInActivity.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const USERNAME = 'emilydavis';

// Fields we will clear if they exist on the User schema.
// Anything that looks like a live session/token gets wiped.
const SESSION_FIELDS = [
  'refreshToken',
  'refreshTokens',
  'sessionToken',
  'sessionTokens',
  'sessions',
  'currentSession',
  'activeSession',
  'accessToken',
  'lastLoginToken',
  'deviceToken',
  'pushToken',
];

// Numeric fields we bump to invalidate any JWT that embeds the value.
const VERSION_FIELDS = ['tokenVersion', 'jwtVersion', 'sessionVersion'];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connected\n');

  // ── Resolve Emily ────────────────────────────────────────
  const userDoc = await User.findOne({ username: USERNAME });
  if (!userDoc) {
    console.error(`❌ User "${USERNAME}" not found`);
    process.exit(1);
  }

  console.log(`🎯 User: ${userDoc.firstName} ${userDoc.lastName}`);
  console.log(`   ${userDoc.email} (${userDoc._id})\n`);

  // ── 1. Bump token-version fields (invalidates JWTs) ──────
  const bumped = [];
  for (const field of VERSION_FIELDS) {
    if (field in userDoc) {
      userDoc[field] = (userDoc[field] || 0) + 1;
      bumped.push(`${field} = ${userDoc[field]}`);
    }
  }

  // ── 2. Clear session / token fields ──────────────────────
  const cleared = [];
  for (const field of SESSION_FIELDS) {
    if (field in userDoc) {
      userDoc[field] = Array.isArray(userDoc[field]) ? [] : null;
      cleared.push(field);
    }
  }

  if (bumped.length || cleared.length) {
    await userDoc.save();
  }

  // ── 3. Remove trusted devices (forces re-verification) ───
  let devicesRemoved = 0;
  try {
    const r = await TrustedDevice.deleteMany({ userId: userDoc._id });
    devicesRemoved = r.deletedCount || 0;
  } catch (err) {
    console.warn('⚠️  TrustedDevice cleanup skipped:', err.message);
  }

  // ── 4. Remove pending login attempts ─────────────────────
  let attemptsRemoved = 0;
  try {
    const r = await LoginAttempt.deleteMany({ userId: userDoc._id });
    attemptsRemoved = r.deletedCount || 0;
  } catch (err) {
    console.warn('⚠️  LoginAttempt cleanup skipped:', err.message);
  }

  // ── 5. Remove sign-in activity records (optional) ────────
  //    Comment this out if you want to KEEP the sign-in history
  //    for auditing. Clearing it means the "recent activity"
  //    screen will be empty for Emily.
  let activityRemoved = 0;
  try {
    const r = await SignInActivity.deleteMany({ userId: userDoc._id });
    activityRemoved = r.deletedCount || 0;
  } catch (err) {
    console.warn('⚠️  SignInActivity cleanup skipped:', err.message);
  }

  // ── Report ───────────────────────────────────────────────
  console.log('── Results ──');
  if (bumped.length) {
    bumped.forEach((b) => console.log(`✅ Bumped        : ${b}`));
  } else {
    console.log('ℹ️  No token-version fields found on User.');
  }

  if (cleared.length) {
    console.log(`✅ Cleared       : ${cleared.join(', ')}`);
  } else {
    console.log('ℹ️  No session/token fields found on User.');
  }

  console.log(`✅ Trusted devices removed : ${devicesRemoved}`);
  console.log(`✅ Login attempts removed  : ${attemptsRemoved}`);
  console.log(`✅ Sign-in activity removed: ${activityRemoved}`);

  if (!bumped.length && !cleared.length && !devicesRemoved && !attemptsRemoved) {
    console.log(
      '\n⚠️  Nothing session-related was found on this user.'
    );
    console.log(
      '   Your app may be using fully stateless JWTs (no DB check on each request).'
    );
    console.log(
      '   In that case existing tokens cannot be revoked without changing auth code.'
    );
  } else {
    console.log('\n🎉 Done — Emily is logged out on her next request.');
  }

  await mongoose.disconnect();
  process.exit();
};

run().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});