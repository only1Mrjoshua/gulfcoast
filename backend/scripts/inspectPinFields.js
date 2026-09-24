// scripts/inspectPinFields.js
//
// Shows every PIN-related field on a user document so we can see which
// one actually holds the hashed PIN.
//
// ── USAGE ───────────────────────────────────────────────────────────────
//   node scripts/inspectPinFields.js
//   node scripts/inspectPinFields.js dbbecker01
//   node scripts/inspectPinFields.js henrydorian1
// ────────────────────────────────────────────────────────────────

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from '../models/User.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const USERNAME = process.argv[2] || 'dbbecker01';

const looksHashed = (v) =>
  typeof v === 'string' && /^\$2[aby]\$/.test(v);

const show = (label, value) => {
  const type = typeof value;
  let preview;
  if (value === undefined)      preview = '(undefined)';
  else if (value === null)      preview = '(null)';
  else if (value === '')        preview = '(empty string)';
  else if (looksHashed(value))  preview = `bcrypt hash ✓  ${value.slice(0, 20)}…`;
  else                          preview = JSON.stringify(value);
  console.log(`  ${label.padEnd(20)} ${String(type).padEnd(10)} ${preview}`);
};

const run = async () => {
  if (!process.env.MONGO_URL) {
    console.error('❌ MONGO_URL is not set. Make sure .env exists and contains MONGO_URL.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connected\n');

  // The schema fields we care about
  const PIN_FIELDS = [
    'bankPin',
    'transferPin',
    'pin',
    'hasBankPin',
    'hasTransferPin',
    'hasPin',
  ];

  // .select('+field') is required for fields that are select:false
  const selectStr = ['+bankPin', '+transferPin', '+pin'].join(' ');

  const user = await User.findOne({ username: USERNAME })
    .select(selectStr)
    .lean();

  if (!user) {
    console.error(`❌ No user with username "${USERNAME}"`);
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`🎯 ${user.firstName ?? ''} ${user.lastName ?? ''}  (${user._id})`);
  console.log(`   username: ${user.username}`);
  console.log(`   email   : ${user.email}\n`);

  console.log('════════════════════════════════════════════');
  console.log('  PIN-RELATED FIELDS ON THIS USER');
  console.log('════════════════════════════════════════════');
  for (const field of PIN_FIELDS) {
    show(field, user[field]);
  }
  console.log('');

  // Check schema definition to see which fields exist at all
  console.log('════════════════════════════════════════════');
  console.log('  PIN-RELATED PATHS IN THE SCHEMA');
  console.log('════════════════════════════════════════════');
  const paths = Object.keys(User.schema.paths).filter((p) =>
    /pin/i.test(p)
  );
  if (paths.length === 0) {
    console.log('  (no paths matching /pin/i)');
  } else {
    for (const p of paths) {
      const sp = User.schema.paths[p];
      console.log(`  ${p.padEnd(24)} type=${sp.instance}  select=${sp.options?.select ?? true}`);
    }
  }
  console.log('');

  // Verdict
  console.log('════════════════════════════════════════════');
  console.log('  VERDICT');
  console.log('════════════════════════════════════════════');
  if (user.transferPin && looksHashed(user.transferPin)) {
    console.log('  ✓ transferPin holds a bcrypt hash — this IS the field your controller should read.');
    console.log('    Fix: use `user.transferPin` instead of `user.bankPin` in transfersController.js');
  } else if (user.bankPin && looksHashed(user.bankPin)) {
    console.log('  ✓ bankPin holds a bcrypt hash — the controller is correct as-is.');
  } else {
    console.log('  ⚠️  No bcrypt-hashed PIN found on either field.');
    console.log('     Run scripts/resetHenryCredentials.js (or the Dave equivalent)');
    console.log('     to set a PIN, then re-run this script.');
  }
  console.log('');

  console.log('🎉 Done.\n');

  await mongoose.disconnect();
  process.exit();
};

run().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});