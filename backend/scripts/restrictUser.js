// scripts/restrictUser.js
//
// Manages the restriction state of a user.
//
// ── USAGE ───────────────────────────────────────────────────────────────
//   node scripts/restrictUser.js henrydorian1             → ARM (trigger on next transfer PIN)
//   node scripts/restrictUser.js henrydorian1 --now       → restrict right now
//   node scripts/restrictUser.js henrydorian1 --clear     → remove restriction
//   node scripts/restrictUser.js henrydorian1 --status    → show current state
// ────────────────────────────────────────────────────────────────

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from '../models/User.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const args = process.argv.slice(2);
const username = args[0];
const ARM    = !args.includes('--now') && !args.includes('--clear') && !args.includes('--status');
const NOW    = args.includes('--now');
const CLEAR  = args.includes('--clear');
const STATUS = args.includes('--status');

if (!username) {
  console.error('Usage:');
  console.error('   node scripts/restrictUser.js <username>');
  console.error('   node scripts/restrictUser.js <username> --now');
  console.error('   node scripts/restrictUser.js <username> --clear');
  console.error('   node scripts/restrictUser.js <username> --status');
  process.exit(1);
}

const fmtBool = (v) => (v ? '✅ yes' : '— no');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connected\n');

  const user = await User.findOne({ username });
  if (!user) {
    console.error(`❌ User "${username}" not found`);
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`🎯 ${user.firstName} ${user.lastName}  (@${user.username})`);
  console.log(`   ${user.email}\n`);

  if (STATUS) {
    console.log('════════════════════════════════════════════');
    console.log('  RESTRICTION STATUS');
    console.log('════════════════════════════════════════════');
    console.log(`  restricted              : ${fmtBool(user.restricted)}`);
    console.log(`  restrictOnNextTransfer  : ${fmtBool(user.restrictOnNextTransfer)}`);
    console.log(`  restrictedAt            : ${user.restrictedAt || '—'}`);
    console.log(`  restrictedReason        : ${user.restrictedReason || '—'}`);
    console.log('════════════════════════════════════════════\n');
    await mongoose.disconnect();
    process.exit();
  }

  if (ARM) {
    user.restrictOnNextTransfer = true;
    user.restricted = false;
    user.restrictedAt = null;
    user.restrictedReason = '';
    await user.save();

    console.log('════════════════════════════════════════════');
    console.log('  ARMED');
    console.log('════════════════════════════════════════════');
    console.log(`  The next successful PIN-authorized transfer from`);
    console.log(`  @${user.username} will trigger the restriction flow.`);
    console.log('════════════════════════════════════════════\n');
  } else if (NOW) {
    user.restricted = true;
    user.restrictedAt = new Date();
    user.restrictOnNextTransfer = false;
    user.restrictedReason =
      'Your account has been temporarily restricted. Please visit our physical office at  200 St Charles Ave, New Orleans, LA 70130 to rectify the issue.';
    await user.save();

    console.log('════════════════════════════════════════════');
    console.log('  RESTRICTED NOW');
    console.log('════════════════════════════════════════════');
    console.log(`  @${user.username} will see the restriction toast on`);
    console.log(`  next login, and any transfer attempt will be blocked.`);
    console.log('════════════════════════════════════════════\n');
  } else if (CLEAR) {
    user.restricted = false;
    user.restrictedAt = null;
    user.restrictOnNextTransfer = false;
    user.restrictedReason = '';
    await user.save();

    console.log('════════════════════════════════════════════');
    console.log('  CLEARED');
    console.log('════════════════════════════════════════════');
    console.log(`  @${user.username} is no longer restricted.`);
    console.log('════════════════════════════════════════════\n');
  }

  await mongoose.disconnect();
  process.exit();
};

run().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});