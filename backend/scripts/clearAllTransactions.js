// scripts/clearAllTransactions.js
//
// Wipes the Transaction collection.
//
// ── USAGE ───────────────────────────────────────────────────────────────
//   node scripts/clearAllTransactions.js            → clears ALL transactions
//   node scripts/clearAllTransactions.js --user dbbecker01
//                                                   → clears only that user's
//   node scripts/clearAllTransactions.js --reset    → also zeroes account balances
//   node scripts/clearAllTransactions.js --all --reset
//                                                   → full wipe + balance reset
// ────────────────────────────────────────────────────────────────────────

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from '../models/User.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

// ── Parse flags ─────────────────────────────────────────────────────────
const args     = process.argv.slice(2);
const userArg  = args.indexOf('--user');
const USERNAME = userArg !== -1 ? args[userArg + 1] : null;
const RESET    = args.includes('--reset');

const money = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 2,
  }).format(n ?? 0);

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connected\n');

  // ── Build the filter ────────────────────────────────────────────────
  let filter = {};

  if (USERNAME) {
    const user = await User.findOne({ username: USERNAME })
      .select('_id firstName lastName username email')
      .lean();

    if (!user) {
      console.error(`❌ User "${USERNAME}" not found`);
      await mongoose.disconnect();
      process.exit(1);
    }

    filter = { userId: user._id };
    console.log(`🎯 Scoped to: ${user.firstName} ${user.lastName} (${user.username})`);
    console.log(`   ${user.email} — ${user._id}\n`);
  } else {
    console.log('🌐 Scope: ALL transactions in the database\n');
  }

  // ── Count before delete ─────────────────────────────────────────────
  const before = await Transaction.countDocuments(filter);
  console.log(`📊 Found ${before} transaction(s) to delete`);

  if (before === 0) {
    console.log('\n✨ Nothing to do — collection is already empty.\n');
    await mongoose.disconnect();
    process.exit();
  }

  // ── Delete ──────────────────────────────────────────────────────────
  const result = await Transaction.deleteMany(filter);
  console.log(`🗑  Deleted ${result.deletedCount} transaction(s)\n`);

  // ── Optionally reset account balances ───────────────────────────────
  if (RESET) {
    const accFilter = USERNAME ? { userId: filter.userId } : {};
    const accounts = await Account.find(accFilter)
      .select('_id type subType accountNumber totalBalance')
      .lean();

    if (accounts.length === 0) {
      console.log('ℹ️  No accounts to reset.\n');
    } else {
      const upd = await Account.updateMany(accFilter, {
        $set: {
          totalBalance: 0,
          availableBalance: 0,
          pendingBalance: 0,
        },
      });

      console.log(`💳 Reset balances on ${upd.modifiedCount} account(s):`);
      for (const a of accounts) {
        const label = a.subType ? `${a.subType} ${a.type}` : a.type;
        console.log(
          `   • ${label.padEnd(20)} •••• ${String(a.accountNumber).slice(-4)}   was ${money(a.totalBalance)} → $0.00`
        );
      }
      console.log('');
    }
  }

  // ── Confirm remaining ───────────────────────────────────────────────
  const after = await Transaction.countDocuments(filter);
  console.log('── Summary ──');
  console.log(`   Deleted         : ${result.deletedCount}`);
  console.log(`   Remaining       : ${after}`);
  console.log(`   Balances reset  : ${RESET ? 'Yes' : 'No (use --reset to zero them)'}`);

  console.log('\n🎉 Done.\n');

  await mongoose.disconnect();
  process.exit();
};

run().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});