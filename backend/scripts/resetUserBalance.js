// scripts/resetUserBalance.js
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
const TARGET_USERNAME = 'Henrydorian1';
const NEW_BALANCE     = 1921752.00;

// Set to true to update EVERY active account for the user.
// Set to false to update ONLY their primary Checking account.
const UPDATE_ALL_ACCOUNTS = false;
// ───────────────────────────────────────────────────────────

async function reset() {
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

  // Build the account filter.
  const filter = { userId: user._id };
  if (!UPDATE_ALL_ACCOUNTS) {
    filter.status = 'Active';
    filter.type = 'Checking';
  }

  const accounts = await Account.find(filter);

  if (accounts.length === 0) {
    console.error('❌ No matching accounts to update.');
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`\n💾 Updating ${accounts.length} account(s) to $${NEW_BALANCE.toFixed(2)}\n`);

  for (const acc of accounts) {
    const beforeAvailable = acc.availableBalance ?? 0;
    const beforeTotal     = acc.totalBalance ?? 0;

    acc.availableBalance = NEW_BALANCE;
    acc.totalBalance     = NEW_BALANCE;
    await acc.save();

    const label = acc.subType
      ? `${acc.subType} ${acc.type}`
      : acc.type;

    console.log(
      `  ↳ ${label} •••• ${(acc.accountNumber || '').slice(-4)}  ` +
        `(was avail $${beforeAvailable.toFixed(2)} / total $${beforeTotal.toFixed(2)})  ` +
        `→ now $${NEW_BALANCE.toFixed(2)}`
    );
  }

  console.log('\n✅ Balance reset complete — no transactions were created.');
  await mongoose.disconnect();
  process.exit(0);
}

reset().catch((err) => {
  console.error('❌ Reset failed:', err.message);
  process.exit(1);
});