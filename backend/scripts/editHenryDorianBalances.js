// scripts/editHenryDorianBalances.js
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
//  Configuration — the target balance for each account.
//  The sum below is exactly $3,521,752.00.
// ─────────────────────────────────────────────────────────
const USERNAME = 'mrhenrydorian';

const ACCOUNT_TARGETS = [
  {
    // Match by type + subType
    type: 'Checking',
    subType: null,
    newBalance: 2521398.42, // $2,521,398.42
  },
  {
    type: 'Savings',
    subType: 'High Yield',
    newBalance: 1000353.58, // $1,000,353.58
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

  let grandTotal = 0;
  let updatedCount = 0;

  for (const target of ACCOUNT_TARGETS) {
    // Find the account by type + subType (exact match)
    const query = {
      userId: henry._id,
      type: target.type,
    };
    if (target.subType === null) {
      query.$or = [{ subType: null }, { subType: { $exists: false } }, { subType: '' }];
    } else {
      query.subType = target.subType;
    }

    const account = await Account.findOne(query);
    if (!account) {
      console.error(
        `❌ Account not found: ${target.type}${target.subType ? ' ' + target.subType : ''}`
      );
      continue;
    }

    const label = target.subType ? `${target.subType} ${target.type}` : target.type;
    const oldBalance = account.totalBalance ?? 0;
    const delta = target.newBalance - oldBalance;

    // ── Update account balances ────────────────────────────
    account.totalBalance = target.newBalance;
    account.availableBalance = target.newBalance;
    await account.save();

    // ── Replace the opening deposit transaction so the ledger
    //    still reconciles with the account balance ───────────
    const openingQuery = {
      userId: henry._id,
      accountId: account._id,
      description: 'Opening Deposit',
      type: 'deposit',
    };

    const removed = await Transaction.deleteMany(openingQuery);

    await Transaction.create({
      userId: henry._id,
      accountId: account._id,
      description: 'Opening Deposit',
      amount: target.newBalance,
      type: 'deposit',
      status: 'Completed',
      date: account.createdAt || new Date(),
    });

    grandTotal += target.newBalance;
    updatedCount += 1;

    console.log(`✅ Updated: ${label}`);
    console.log(`   Old balance    : ${money(oldBalance)}`);
    console.log(`   New balance    : ${money(target.newBalance)}`);
    console.log(`   Change         : ${delta >= 0 ? '+' : ''}${money(delta)}`);
    console.log(
      `   Opening tx     : ${removed.deletedCount} old record(s) removed, 1 new record created`
    );
    console.log('');
  }

  // ── Summary ──────────────────────────────────────────────
  console.log('── Summary ──');
  console.log(`   Accounts updated  : ${updatedCount}`);
  console.log(`   Total balance     : ${money(grandTotal)}`);

  console.log('\n🎉 Done — reload /home or /accounts to verify.');
  await mongoose.disconnect();
  process.exit();
};

run().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});