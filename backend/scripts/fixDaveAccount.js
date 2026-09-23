// scripts/fixDaveAccount.js
//
// Updates Dave Brennaman Becker's account details.
//
// IMPORTANT: requires `middleName` to exist on models/User.js.
// See the schema patch in the README / previous message.
//
// ── USAGE ───────────────────────────────────────────────────────────────
//   node scripts/fixDaveAccount.js
// ────────────────────────────────────────────────────────────────────────

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from '../models/User.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

// ═════════════════════════════════════════════════════════════════════════
//  CONFIG
// ═════════════════════════════════════════════════════════════════════════

const IDENTIFIER = {
  username: 'dbbecker01',
  email:    'Davebrennamanbecker@gmail.com',
};

const UPDATES = {
  firstName:  'Dave',
  middleName: 'Brennaman',
  lastName:   'Becker',
  email:      'Davebrennamanbecker@gmail.com',
  phone:      '+18182780024',
  dateOfBirth: '2001-11-02',

  address: {
    street: '304 Main St',
    city:   'Crossett',
    state:  'AR',
    zip:    '71635',
  },

  mailingAddress: '304 Main St, Crossett, AR 71635, United States',
};

// ═════════════════════════════════════════════════════════════════════════

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connected\n');

  // ── Sanity check: does the schema know about middleName? ───────────
  if (!User.schema.path('middleName')) {
    console.error('❌ models/User.js has no `middleName` field.');
    console.error('   Add it to the schema first (see the patch), then re-run.');
    await mongoose.disconnect();
    process.exit(1);
  }

  // ── Find Dave ──────────────────────────────────────────────────────
  const filter = {
    $or: [
      { username: IDENTIFIER.username },
      { email:    IDENTIFIER.email    },
    ].filter((x) => Object.values(x)[0]),
  };

  const user = await User.findOne(filter);

  if (!user) {
    console.error(`❌ User not found — looked for username="${IDENTIFIER.username}" or email="${IDENTIFIER.email}"`);
    await mongoose.disconnect();
    process.exit(1);
  }

  // ── Snapshot before ────────────────────────────────────────────────
  const before = {
    firstName:  user.firstName,
    middleName: user.middleName,
    lastName:   user.lastName,
    email:      user.email,
    phone:      user.phone,
    dateOfBirth: user.dateOfBirth,
    address:    { ...(user.address ?? {}) },
    mailingAddress: user.mailingAddress,
    fullName:   user.fullName,
  };

  console.log('════════════════════════════════════════════');
  console.log(`  Found: ${before.fullName}  (${user._id})`);
  console.log('════════════════════════════════════════════\n');

  // ── Email uniqueness check ─────────────────────────────────────────
  if (UPDATES.email && UPDATES.email !== before.email) {
    const clash = await User.findOne({
      email: UPDATES.email,
      _id:   { $ne: user._id },
    }).select('_id firstName lastName username email').lean();

    if (clash) {
      console.error('❌ Cannot set email — already used by another user:');
      console.error(`   ${clash.firstName} ${clash.lastName} (${clash.username}) — ${clash.email}`);
      await mongoose.disconnect();
      process.exit(1);
    }
  }

  // ── Apply updates ──────────────────────────────────────────────────
  user.set({
    firstName:  UPDATES.firstName,
    middleName: UPDATES.middleName,
    lastName:   UPDATES.lastName,
    email:      UPDATES.email,
    phone:      UPDATES.phone,
    dateOfBirth: UPDATES.dateOfBirth,
    mailingAddress: UPDATES.mailingAddress,
    address: {
      ...(user.address?.toObject?.() ?? user.address ?? {}),
      ...UPDATES.address,
    },
  });

  await user.save();

  // ── Diff table ─────────────────────────────────────────────────────
  const rows = [
    ['First Name',    before.firstName,   user.firstName],
    ['Middle Name',   before.middleName,  user.middleName],
    ['Last Name',     before.lastName,    user.lastName],
    ['Full Name',     before.fullName,    user.fullName],
    ['Email',         before.email,       user.email],
    ['Phone',         before.phone,       user.phone],
    ['Date of Birth', before.dateOfBirth, user.dateOfBirth],
    ['Street',        before.address?.street, user.address?.street],
    ['City',          before.address?.city,   user.address?.city],
    ['State',         before.address?.state,  user.address?.state],
    ['Zip',           before.address?.zip,    user.address?.zip],
    ['Mailing',       before.mailingAddress,  user.mailingAddress],
  ];

  const width = 22;
  console.log('── Field changes ──────────────────────────────────────────');
  for (const [label, from, to] of rows) {
    const changed = String(from ?? '') !== String(to ?? '');
    const marker  = changed ? '✏️ ' : '   ';
    console.log(
      `${marker}${label.padEnd(width)}  ${String(to ?? '—')}` +
      (changed ? `   (was: ${from || '—'})` : ''),
    );
  }

  console.log('\n════════════════════════════════════════════');
  console.log('  SAVED');
  console.log('════════════════════════════════════════════');
  console.log(`  Full Name : ${user.fullName}`);
  console.log(`  Email     : ${user.email}`);
  console.log(`  Phone     : ${user.phone}`);
  console.log(`  DOB       : ${user.dateOfBirth}`);
  console.log(`  Address   : ${user.address?.street}, ${user.address?.city}, ${user.address?.state} ${user.address?.zip}`);
  console.log('════════════════════════════════════════════\n');

  console.log('🎉 Done.\n');

  await mongoose.disconnect();
  process.exit();
};

run().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});