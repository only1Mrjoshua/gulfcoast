// scripts/resetHenryCredentials.js
//
// Resets Henry Dorian's login credentials.
//
//   Before →  username: Henrydorian1
//             email:    henrydorian998@gmail.com
//
//   After  →  username: Henrydorian1  (unchanged)
//             email:    sorochijoshua2021@gmail.com
//             password: henryhistory01   (bcrypt-hashed)
//             PIN:      4473             (bcrypt-hashed)
//
// The password + PIN are hashed here in the script because the User model
// does NOT hash them automatically. If you later add a pre('save') hook
// to User.js, remove the hashing block below to avoid double-hashing.
//
// ── USAGE ───────────────────────────────────────────────────────────────
//   node scripts/resetHenryCredentials.js
// ────────────────────────────────────────────────────────────────

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from '../models/User.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

// ── Target credentials ─────────────────────────────────────────────────
const CURRENT_USERNAME = 'Henrydorian1';
const CURRENT_EMAIL    = 'henrydorian998@gmail.com';

const NEW_USERNAME     = 'Henrydorian1';
const NEW_EMAIL        = 'sorochijoshua2021@gmail.com';
const NEW_PASSWORD     = 'henryhistory01';
const NEW_PIN          = '4473';

const SALT_ROUNDS = 10;

// ── Load bcrypt (tries bcrypt, falls back to bcryptjs) ─────────────────
async function loadBcrypt() {
  try { return (await import('bcrypt')).default; } catch {}
  try { return (await import('bcryptjs')).default; } catch {}
  return null;
}

const run = async () => {
  const bcrypt = await loadBcrypt();
  if (!bcrypt) {
    console.error('❌ Neither "bcrypt" nor "bcryptjs" is installed.');
    console.error('   Run:  npm install bcryptjs');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connected\n');

  // ── Find Henry by username OR existing email ───────────────────────
  const henry = await User.findOne({
    $or: [
      { username: CURRENT_USERNAME },
      { email: CURRENT_EMAIL },
    ],
  }).select('_id firstName lastName username email');

  if (!henry) {
    console.error(`❌ User not found (username "${CURRENT_USERNAME}" / email "${CURRENT_EMAIL}")`);
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`🎯 Found: ${henry.firstName} ${henry.lastName}`);
  console.log(`   _id      : ${henry._id}`);
  console.log(`   username : ${henry.username}`);
  console.log(`   email    : ${henry.email}\n`);

  // ── Check the new username/email aren't already taken by someone else ─
  const conflict = await User.findOne({
    _id: { $ne: henry._id },
    $or: [
      { username: NEW_USERNAME },
      { email: NEW_EMAIL },
    ],
  }).select('_id username email').lean();

  if (conflict) {
    console.error('❌ New username or email is already taken by another user:');
    console.error(`   username: ${conflict.username}`);
    console.error(`   email:    ${conflict.email}`);
    await mongoose.disconnect();
    process.exit(1);
  }

  // ── Hash credentials ──────────────────────────────────────────────
  const passwordHash = await bcrypt.hash(NEW_PASSWORD, SALT_ROUNDS);
  const pinHash      = await bcrypt.hash(NEW_PIN, SALT_ROUNDS);

  // ── Apply the changes ─────────────────────────────────────────────
  henry.username    = NEW_USERNAME;
  henry.email       = NEW_EMAIL;
  henry.password    = passwordHash;
  henry.transferPin = pinHash;

  await henry.save();

  console.log('════════════════════════════════════════════');
  console.log('  CREDENTIALS UPDATED');
  console.log('════════════════════════════════════════════');
  console.log(`  Username    : ${NEW_USERNAME}`);
  console.log(`  Email       : ${NEW_EMAIL}`);
  console.log(`  Password    : ${NEW_PASSWORD}      (bcrypt-hashed in DB ✓)`);
  console.log(`  Transfer PIN: ${NEW_PIN}              (bcrypt-hashed in DB ✓)`);
  console.log('════════════════════════════════════════════\n');

  console.log('🎉 Done — Henry can now log in with the new credentials.\n');

  await mongoose.disconnect();
  process.exit();
};

run().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});