// scripts/resetHenryBalances.js
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
//  Configuration — target balances per account.
//  The two amounts below sum to exactly $1,921,752.00.
// ─────────────────────────────────────────────────────────
const USERNAME = 'mrhenrydorian';

const ACCOUNT_TARGETS = [
  {
    type: 'Checking',
    subType: null,
    newBalance: 1438672.91, // $1,438,672.91
  },
  {
    type: 'Savings',
    subType: 'High Yield',
    newBalance: 483079.09, // $483,079.09
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

  // ── Clear ALL transactions for Henry ─────────────────────
  const removedTx = await Transaction.deleteMany({ userId: henry._id });
  console.log(
    `🧹 Cleared ${removedTx.deletedCount} transaction(s) from the ledger\n`
  );

  // ── Set new balances on each account ─────────────────────
  let grandTotal = 0;
  let updatedCount = 0;

  for (const target of ACCOUNT_TARGETS) {
    const query = {
      userId: henry._id,
      type: target.type,
    };
    if (target.subType === null) {
      query.$or = [
        { subType: null },
        { subType: { $exists: false } },
        { subType: '' },
      ];
    } else {
      query.subType = target.subType;
    }

    const account = await Account.findOne(query);
    if (!account) {
      console.error(
        `❌ Account not found: ${target.type}${
          target.subType ? ' ' + target.subType : ''
        }`
      );
      continue;
    }

    const label = target.subType
      ? `${target.subType} ${target.type}`
      : target.type;
    const oldBalance = account.totalBalance ?? 0;

    account.totalBalance = target.newBalance;
    account.availableBalance = target.newBalance;
    await account.save();

    grandTotal += target.newBalance;
    updatedCount += 1;

    console.log(`✅ ${label}`);
    console.log(`   Old balance : ${money(oldBalance)}`);
    console.log(`   New balance : ${money(target.newBalance)}`);
    console.log('');
  }

  // ── Summary ──────────────────────────────────────────────
  console.log('── Summary ──');
  console.log(`   Accounts updated   : ${updatedCount}`);
  console.log(`   Total balance      : ${money(grandTotal)}`);
  console.log(`   Transactions kept  : 0`);

  console.log('\n🎉 Done — reload /home or /accounts.');
  console.log('   Note: with no transactions in the ledger, the');
  console.log('   Transactions page will show an empty list while');
  console.log('   Home/Accounts continue to reflect the balances.');

  await mongoose.disconnect();
  process.exit();
};

run().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});