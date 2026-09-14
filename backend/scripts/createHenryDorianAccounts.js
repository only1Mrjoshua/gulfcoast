// scripts/createHenryDorianAccounts.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from '../models/User.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

// ─────────────────────────────────────────────────────────
//  Configuration — edit these to change the balances
// ─────────────────────────────────────────────────────────
const USERNAME = 'mrhenrydorian';

const ACCOUNTS = [
  {
    type: 'Checking',
    subType: null,
    accountNumber: '3018447901',
    startingBalance: 2500000, // $2,500,000
    interestRate: null,
    isPrimary: true,
  },
  {
    type: 'Savings',
    subType: 'High Yield',
    accountNumber: '8842097710',
    startingBalance: 1000000, // $1,000,000
    interestRate: 4.25,
    isPrimary: false,
  },
];

const money = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(n ?? 0);

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connected\n');

  // ── Resolve Henry ────────────────────────────────────────
  const henry = await User.findOne({ username: USERNAME })
    .select('_id firstName lastName email')
    .lean();

  if (!henry) {
    console.error(`❌ User "${USERNAME}" not found`);
    process.exit(1);
  }

  console.log(`🎯 User: ${henry.firstName} ${henry.lastName}`);
  console.log(`   ${henry.email} (${henry._id})\n`);

  // ── Clean up any existing data for a fresh run ───────────
  const existingAccounts = await Account.find({ userId: henry._id })
    .select('_id')
    .lean();

  if (existingAccounts.length > 0) {
    const ids = existingAccounts.map((a) => a._id);
    await Transaction.deleteMany({ accountId: { $in: ids } });
    await Account.deleteMany({ _id: { $in: ids } });
    console.log(
      `🧹 Removed ${existingAccounts.length} existing account(s) and their transactions\n`
    );
  }

  // ── Create accounts + opening balance transactions ───────
  const created = [];
  let grandTotal = 0;

  for (const spec of ACCOUNTS) {
    const label = spec.subType ? `${spec.subType} ${spec.type}` : spec.type;

    const account = await Account.create({
      userId: henry._id,
      type: spec.type,
      subType: spec.subType,
      accountNumber: spec.accountNumber,
      totalBalance: spec.startingBalance,
      availableBalance: spec.startingBalance,
      pendingBalance: 0,
      interestRate: spec.interestRate,
      status: 'Active',
      isPrimary: spec.isPrimary,
    });

    // Ledger entry that mirrors the opening balance, so home + transactions
    // reconcile from day one.
    await Transaction.create({
      userId: henry._id,
      accountId: account._id,
      description: 'Opening Deposit',
      amount: spec.startingBalance,
      type: 'deposit',
      status: 'Completed',
      date: new Date(),
    });

    created.push({ account, label });
    grandTotal += spec.startingBalance;

    console.log('✅ Created account');
    console.log(`   Type           : ${label}`);
    console.log(`   Account #      : •••• ${spec.accountNumber.slice(-4)}`);
    console.log(`   Balance        : ${money(spec.startingBalance)}`);
    console.log(`   Interest Rate  : ${spec.interestRate != null ? spec.interestRate + '%' : '—'}`);
    console.log(`   Primary        : ${spec.isPrimary ? 'Yes' : 'No'}`);
    console.log(`   Account ID     : ${account._id}`);
    console.log('');
  }

  // ── Summary ──────────────────────────────────────────────
  console.log('── Summary ──');
  console.log(`   Accounts created : ${created.length}`);
  console.log(`   Total balance    : ${money(grandTotal)}`);

  console.log('\n🎉 Done — log in as Henry to see the accounts.');
  await mongoose.disconnect();
  process.exit();
};

run().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});