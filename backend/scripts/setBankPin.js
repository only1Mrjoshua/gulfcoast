// scripts/setBankPin.js
//
// Sets the bankPin on one or more users, correctly hashed.
//
// ── USAGE ───────────────────────────────────────────────────────────────
//   node scripts/setBankPin.js dbbecker01 1949
//   node scripts/setBankPin.js henrydorian1 4473
//   node scripts/setBankPin.js --all 1234     (resets every user's bankPin)
// ────────────────────────────────────────────────────────────────

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from '../models/User.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

async function loadBcrypt() {
  try { return (await import('bcrypt')).default; } catch {}
  try { return (await import('bcryptjs')).default; } catch {}
  return null;
}

const args = process.argv.slice(2);
const allMode = args[0] === '--all';
const username = allMode ? null : args[0];
const plainPin = allMode ? args[1] : args[1];

const run = async () => {
  if (!plainPin || !/^\d{4}$/.test(plainPin)) {
    console.error('❌ Usage:');
    console.error('   node scripts/setBankPin.js <username> <4-digit-pin>');
    console.error('   node scripts/setBankPin.js --all <4-digit-pin>');
    process.exit(1);
  }

  const bcrypt = await loadBcrypt();
  if (!bcrypt) {
    console.error('❌ Neither "bcrypt" nor "bcryptjs" is installed.');
    console.error('   Run:  npm install bcryptjs');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connected\n');

  const pinHash = await bcrypt.hash(plainPin, 10);
  console.log(`🔐 Hashed PIN ready\n`);

  // ── Find targets ───────────────────────────────────────────────────
  const filter = allMode ? {} : { username };
  const users = await User.find(filter).select('_id firstName lastName username email bankPin');

  if (users.length === 0) {
    console.error(`❌ No user${allMode ? 's' : ` with username "${username}"`} found`);
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`🎯 Updating ${users.length} user(s)\n`);

  for (const u of users) {
    const before = u.bankPin
      ? (/^\$2[aby]\$/.test(u.bankPin) ? 'bcrypt-hashed ✓' : 'plain text ⚠️')
      : '(empty)';

    u.bankPin = pinHash;
    await u.save();

    console.log(`  ✓ ${u.firstName ?? ''} ${u.lastName ?? ''}  (${u.username})`);
    console.log(`      before: ${before}`);
    console.log(`      after : bcrypt-hashed ✓\n`);
  }

  // ── Verify the write actually landed ──────────────────────────────
  console.log('════════════════════════════════════════════');
  console.log('  VERIFY');
  console.log('════════════════════════════════════════════');
  for (const u of users) {
    const fresh = await User.findById(u._id).select('+bankPin').lean();
    const isHash = fresh.bankPin && /^\$2[aby]\$/.test(fresh.bankPin);
    console.log(`  ${u.username}: ${isHash ? 'bcrypt-hashed ✓' : '⚠️ NOT SAVED'}`);
  }
  console.log('');

  console.log(`🎉 Done — PIN is now ${plainPin} for ${users.length} user(s).\n`);

  await mongoose.disconnect();
  process.exit();
};

run().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});