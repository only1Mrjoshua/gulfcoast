// scripts/fixDaveAccount.js
//
// Updates Dave Brennaman Becker's account details.
//
// Fields touched:
//   firstName, lastName, email, phone, dateOfBirth
//   address.street, address.city, address.state, address.zip
//   mailingAddress  (single-line version of the full address)
//
// NOTE: the User schema has no `middleName` or `country` field, so
// "Brennaman" is preserved on `mailingAddress` and the country is
// folded into that same line ("…, United States"). If you want a
// dedicated middleName/country field, tell me and I'll add them to
// the schema and re-run.
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
//  CONFIG — the details you want Dave to end up with
// ═════════════════════════════════════════════════════════════════════════

const IDENTIFIER = {
  // Provide any one of these — the script will find Dave by whichever matches.
  username: 'dbbecker01',
  email:    'Davebrennamanbecker@gmail.com',
};

const UPDATES = {
  firstName:   'Dave',
  lastName:    'Becker',
  email:       'Davebrennamanbecker@gmail.com',
  phone:       '+18182780024',            // normalized E.164
  dateOfBirth: '2001-02-11',              // ISO (YYYY-MM-DD) — safe & sortable

  address: {
    street: '304 Main St',
    city:   'Crossett',
    state:  'AR',
    zip:    '71635',
  },

  // Single-line mailing address (keeps the middle name + country visible)
  mailingAddress: '304 Main St, Crossett, AR 71635, United States',
};

// ═════════════════════════════════════════════════════════════════════════

const money = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 2,
  }).format(n ?? 0);

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connected\n');

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

  // ── Snapshot the before-state ──────────────────────────────────────
  const before = {
    firstName:   user.firstName,
    lastName:    user.lastName,
    email:       user.email,
    phone:       user.phone,
    dateOfBirth: user.dateOfBirth,
    address:     { ...(user.address ?? {}) },
    mailingAddress: user.mailingAddress,
  };

  console.log('════════════════════════════════════════════');
  console.log(`  Found: ${before.firstName} ${before.lastName}  (${user._id})`);
  console.log('════════════════════════════════════════════\n');

  // ── Apply the updates ──────────────────────────────────────────────
  // Email is unique — check first so we fail with a clear message
  // if someone else already owns it.
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

  // Shallow-merge the address so any fields we don't touch are kept
  user.set({
    firstName:   UPDATES.firstName,
    lastName:    UPDATES.lastName,
    email:       UPDATES.email,
    phone:       UPDATES.phone,
    dateOfBirth: UPDATES.dateOfBirth,
    mailingAddress: UPDATES.mailingAddress,
    address: {
      ...(user.address?.toObject?.() ?? user.address ?? {}),
      ...UPDATES.address,
    },
  });

  await user.save();

  // ── Print the diff ─────────────────────────────────────────────────
  const rows = [
    ['First Name',    before.firstName,   user.firstName],
    ['Last Name',     before.lastName,    user.lastName],
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
  console.log(`  Name    : ${user.firstName} ${user.lastName}`);
  console.log(`  Email   : ${user.email}`);
  console.log(`  Phone   : ${user.phone}`);
  console.log(`  DOB     : ${user.dateOfBirth}`);
  console.log(`  Address : ${user.address?.street}, ${user.address?.city}, ${user.address?.state} ${user.address?.zip}`);
  console.log('════════════════════════════════════════════\n');

  console.log('🎉 Done.\n');

  await mongoose.disconnect();
  process.exit();
};

run().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});