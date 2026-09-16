// scripts/adjustCheckingBalance.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from '../models/User.js';
import Account from '../models/Account.js';

dotenv.config();

// Same Windows / local-dev DNS fix as server.js
if (!process.env.VERCEL) {
  try {
    dns.setDefaultResultOrder('ipv4first');
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch {
    // ignore
  }
}

// ── Config ─────────────────────────────────────────────────
const TARGET_USERNAME  = 'Henrydorian1';
const TARGET_TOTAL     = 1921752.00; // desired total across all accounts

// Set to true to preview changes without saving.
const DRY_RUN          = false;
// ───────────────────────────────────────────────────────────

async function adjust() {
  if (!process.env.MONGO_URL) {
    throw new Error('MONGO_URL is not set in your .env file');
  }

  await mongoose.connect(process.env.MONGO_URL, {
    serverSelectionTimeoutMS: 15000,
  });
  console.log('✅ Connected to MongoDB');

  // Find the user — try username first, then email as a fallback.
  const user =
    (await User.findOne({ username: TARGET_USERNAME })) ||
    (await User.findOne({ email: TARGET_USERNAME }));

  if (!user) {
    console.error(`❌ No user found matching "${TARGET_USERNAME}"`);
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(
    `👤 Found user: ${user.firstName || ''} ${user.lastName || ''}`.trim() +
      ` (${user.email || user.username || user._id})`
  );

  // Pull every active account for the user.
  const accounts = await Account.find({ userId: user._id, status: 'Active' });

  if (accounts.length === 0) {
    console.error('❌ No active accounts found for this user.');
    await mongoose.disconnect();
    process.exit(1);
  }

  // Identify the checking account.
  const checking = accounts.find(
    (a) => a.type === 'Checking' || a.subType === 'Checking'
  );

  if (!checking) {
    console.error('❌ No Checking account found for this user.');
    await mongoose.disconnect();
    process.exit(1);
  }

  // Sum every account EXCEPT the checking one.
  const others = accounts.filter(
    (a) => String(a._id) !== String(checking._id)
  );

  const othersTotal = others.reduce(
    (sum, a) => sum + (a.availableBalance ?? 0),
    0
  );

  const newChecking = TARGET_TOTAL - othersTotal;

  console.log('\n📊 Current state');
  console.log('─────────────────────────────────────────────');
  for (const a of accounts) {
    const label = a.subType ? `${a.subType} ${a.type}` : a.type;
    console.log(
      `  ${label.padEnd(22)} •••• ${String(a.accountNumber || '').slice(-4)}  ` +
        `$${(a.availableBalance ?? 0).toFixed(2)}`
    );
  }
  console.log('─────────────────────────────────────────────');
  console.log(`  Non-checking total       $${othersTotal.toFixed(2)}`);
  console.log(`  Desired grand total      $${TARGET_TOTAL.toFixed(2)}`);
  console.log(`  → New Checking balance   $${newChecking.toFixed(2)}`);

  if (newChecking < 0) {
    console.error(
      '\n❌ Aborting: non-checking accounts already exceed the target total.'
    );
    await mongoose.disconnect();
    process.exit(1);
  }

  if (DRY_RUN) {
    console.log('\n🧪 DRY RUN — no changes saved.');
    await mongoose.disconnect();
    process.exit(0);
  }

  // Apply the new balance to BOTH availableBalance and totalBalance
  // so the dashboard total reflects the target exactly.
  checking.availableBalance = newChecking;
  checking.totalBalance     = newChecking;
  await checking.save();

  const label = checking.subType
    ? `${checking.subType} ${checking.type}`
    : checking.type;

  console.log('\n💾 Saved');
  console.log(
    `  ↳ ${label} •••• ${String(checking.accountNumber || '').slice(-4)} ` +
      `→ available $${checking.availableBalance.toFixed(2)} / ` +
      `total $${checking.totalBalance.toFixed(2)}`
  );

  console.log(
    `\n✅ Grand total across all accounts is now $${TARGET_TOTAL.toFixed(2)}`
  );
  console.log('   No transactions or ledger entries were created.');

  await mongoose.disconnect();
  process.exit(0);
}

adjust().catch((err) => {
  console.error('❌ Adjustment failed:', err.message);
  process.exit(1);
});