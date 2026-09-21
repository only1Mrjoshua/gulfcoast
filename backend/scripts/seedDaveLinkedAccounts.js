// scripts/seedDaveLinkedAccount.js
//
// Creates ONE Wells Fargo linked account for Dave Brennaman Becker.
//
// The settings controller (/api/settings) reads linked accounts from
// Account documents with `type: 'External'` — that's what shows on the
// Profile page. This script creates that Account doc.
//
// It ALSO writes a matching LinkedAccount document (with the required
// `account` field) so anything that reads from that collection stays
// in sync.
//
// ── USAGE ───────────────────────────────────────────────────────────────
//   node scripts/seedDaveLinkedAccount.js
// ────────────────────────────────────────────────────────────────────────

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from '../models/User.js';
import Account from '../models/Account.js';
import LinkedAccount from '../models/LinkedAccount.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

// ═════════════════════════════════════════════════════════════════════════
//  CONFIG — the one Wells Fargo account you want linked
// ═════════════════════════════════════════════════════════════════════════

const USERNAME = 'dbbecker01';
const EMAIL    = 'Davebrennamanbecker@gmail.com';

const WELLS_FARGO = {
  institution:   'Wells Fargo',
  accountType:   'Checking',
  accountNumber: '6610294755',   // 10 digits
  routingNumber: '121000248',    // 9 digits (Wells Fargo)
};

// ═════════════════════════════════════════════════════════════════════════

const maskAccount = (n) => `•••• ${String(n).slice(-4)}`;

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connected\n');

  // ── 1. Find Dave ───────────────────────────────────────────────────
  const user = await User.findOne({
    $or: [{ username: USERNAME }, { email: EMAIL }],
  })
    .select('_id firstName middleName lastName fullName username email')
    .lean();

  if (!user) {
    console.error(`❌ User not found — looked for username="${USERNAME}"`);
    await mongoose.disconnect();
    process.exit(1);
  }

  const displayName =
    user.fullName ||
    [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' ');

  console.log(`🎯 User: ${displayName}  (${user._id})`);
  console.log(`   ${user.email}\n`);

  // ── 2. Clear any existing linked accounts for a clean run ──────────
  const accDel = await Account.deleteMany({
    userId: user._id,
    type: 'External',
  });
  if (accDel.deletedCount) {
    console.log(`🧹 Removed ${accDel.deletedCount} existing External Account(s)`);
  }

  // LinkedAccount model may or may not exist in your project — handle both.
  let linkedDelCount = 0;
  try {
    const linkedDel = await LinkedAccount.deleteMany({ userId: user._id });
    linkedDelCount = linkedDel.deletedCount || 0;
    if (linkedDelCount) {
      console.log(`🧹 Removed ${linkedDelCount} existing LinkedAccount(s)`);
    }
  } catch (err) {
    console.log(`ℹ️  LinkedAccount collection not touched: ${err.message}`);
  }
  console.log('');

  const last4 = WELLS_FARGO.accountNumber.slice(-4);

  // ── 3. Create the External Account (what /api/settings reads) ──────
  const externalAccount = await Account.create({
    userId: user._id,
    type: 'External',
    subType: WELLS_FARGO.accountType,        // 'Checking'
    accountNumber: WELLS_FARGO.accountNumber,
    routingNumber: WELLS_FARGO.routingNumber,
    institution: WELLS_FARGO.institution,
    totalBalance: 0,
    availableBalance: 0,
    pendingBalance: 0,
    status: 'Active',
    isPrimary: false,
  });

  console.log('✅ Created External Account (shows on Profile)');
  console.log(`   ${WELLS_FARGO.institution} ${WELLS_FARGO.accountType}  ${maskAccount(WELLS_FARGO.accountNumber)}`);
  console.log(`   Account _id: ${externalAccount._id}\n`);

  // ── 4. Mirror it into LinkedAccount (in case anything reads that) ──
  try {
    // Fill every plausible field name so we survive schema variations.
    // The `account` field is the one your schema requires.
    await LinkedAccount.create({
      userId: user._id,

      // The required field:
      account: `${WELLS_FARGO.accountType} •••• ${last4}`,

      // Display
      nickname:    WELLS_FARGO.institution,
      displayName: WELLS_FARGO.institution,
      label:       WELLS_FARGO.institution,
      name:        WELLS_FARGO.institution,

      // Holder
      accountHolderName: displayName,
      holderName:        displayName,
      recipientName:     displayName,

      // Bank
      bankName:    WELLS_FARGO.institution,
      institution: WELLS_FARGO.institution,
      bank:        WELLS_FARGO.institution,

      // Identifiers
      routingNumber:      WELLS_FARGO.routingNumber,
      accountNumber:      WELLS_FARGO.accountNumber,
      accountNumberLast4: last4,
      last4,

      // Type
      accountType: WELLS_FARGO.accountType,
      type:        WELLS_FARGO.accountType,

      // State
      isPrimary:  false,
      primary:    false,
      verified:   true,
      isVerified: true,
      status:     'Verified',

      // Meta
      note:  'Wells Fargo primary checking',
      memo:  'Wells Fargo primary checking',
      notes: 'Wells Fargo primary checking',
    });

    console.log('✅ Created matching LinkedAccount document');
    console.log(`   ${WELLS_FARGO.institution} ${WELLS_FARGO.accountType}  ${maskAccount(WELLS_FARGO.accountNumber)}\n`);
  } catch (err) {
    console.log('⚠️  LinkedAccount create failed (safe to ignore if /api/settings is your only reader):');
    console.log(`   ${err.message}\n`);
  }

  // ── 5. Summary ─────────────────────────────────────────────────────
  console.log('════════════════════════════════════════════');
  console.log('  LINKED ACCOUNT');
  console.log('════════════════════════════════════════════');
  console.log(`  ${WELLS_FARGO.institution}`);
  console.log(`  ${displayName}`);
  console.log(`  ${WELLS_FARGO.accountType.toUpperCase()}  ${maskAccount(WELLS_FARGO.accountNumber)}`);
  console.log(`  Routing: ${WELLS_FARGO.routingNumber}`);
  console.log(`  Status: ✓ Verified`);
  console.log('════════════════════════════════════════════\n');

  console.log('🎉 Done. Reload Profile to see it under Linked Accounts.\n');

  await mongoose.disconnect();
  process.exit();
};

run().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});