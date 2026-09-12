// scripts/fixLoanBalanceDrift.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from '../models/User.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const money = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(n ?? 0);

const CONFIRM = process.argv.includes('--confirm');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connected');
  console.log(
    `⚙️  Mode: ${CONFIRM ? '⚠️  LIVE WRITE' : '🔍 DRY RUN (no changes)'}\n`
  );

  const username = process.argv[2] || 'emilydavis';
  const user = await User.findOne({ username })
    .select('_id firstName lastName')
    .lean();
  if (!user) {
    console.error(`❌ User "${username}" not found`);
    process.exit(1);
  }
  console.log(`🎯 User: ${user.firstName} ${user.lastName}\n`);

  // Find every loan-linked transaction (money that left the account)
  const loanTx = await Transaction.find({
    userId: user._id,
    status: 'Completed',
    loanId: { $ne: null },
  })
    .select('accountId amount description date')
    .lean();

  if (loanTx.length === 0) {
    console.log('✅ No loan-linked transactions. Nothing to do.');
    await mongoose.disconnect();
    process.exit();
  }

  // Group by account and sum the debits
  const byAccount = new Map();
  for (const t of loanTx) {
    const key = String(t.accountId);
    if (!byAccount.has(key)) byAccount.set(key, { total: 0, count: 0 });
    const entry = byAccount.get(key);
    entry.total += t.amount ?? 0;
    entry.count += 1;
  }

  console.log(`── Loan-linked transactions by account ──`);
  for (const [accId, { total, count }] of byAccount) {
    const acc = await Account.findById(accId).lean();
    const label = acc
      ? `${acc.subType ? acc.subType + ' ' : ''}${acc.type} •••• ${String(
          acc.accountNumber || ''
        ).slice(-4)}`
      : String(accId);
    console.log(
      `  ${label.padEnd(30)}  n=${String(count).padEnd(3)}  ` +
      `net=${money(total).padEnd(15)}  ` +
      `current balance=${money(acc?.totalBalance ?? 0)}`
    );
  }

  // Apply the corrections
  const corrections = [];
  for (const [accId, { total }] of byAccount) {
    if (Math.abs(total) < 0.01) continue;
    corrections.push({ accId, delta: total });
  }

  console.log('\n── Corrections to apply ──');
  if (corrections.length === 0) {
    console.log('  (none)');
  } else {
    for (const { accId, delta } of corrections) {
      const acc = await Account.findById(accId).lean();
      const label = acc
        ? `${acc.subType ? acc.subType + ' ' : ''}${acc.type} •••• ${String(
            acc.accountNumber || ''
          ).slice(-4)}`
        : String(accId);
      console.log(
        `  ${label.padEnd(30)}  ` +
        `totalBalance ${money(acc?.totalBalance ?? 0)} → ` +
        `${money((acc?.totalBalance ?? 0) + delta)}  ` +
        `(Δ ${money(delta)})`
      );
    }
  }

  if (!CONFIRM) {
    console.log(
      '\n👉 Re-run with --confirm to apply these corrections.'
    );
    await mongoose.disconnect();
    process.exit();
  }

  for (const { accId, delta } of corrections) {
    await Account.updateOne(
      { _id: accId },
      {
        $inc: {
          totalBalance: delta,
          availableBalance: delta,
        },
      }
    );
  }

  console.log(`\n✅ Applied ${corrections.length} correction(s).`);

  // Verify
  const accounts = await Account.find({ userId: user._id }).lean();
  const home = accounts
    .filter((a) => (a.type || '').toLowerCase() !== 'credit')
    .reduce((s, a) => s + (a.totalBalance || 0), 0);

  const nonCreditTx = await Transaction.find({
    userId: user._id,
    status: 'Completed',
    accountId: {
      $in: accounts
        .filter((a) => (a.type || '').toLowerCase() !== 'credit')
        .map((a) => a._id),
    },
  })
    .select('amount')
    .lean();

  const ledger = nonCreditTx.reduce((s, t) => s + (t.amount ?? 0), 0);

  console.log('\n── Post-fix reconciliation ──');
  console.log(`  Home balance     : ${money(home)}`);
  console.log(`  Ledger net       : ${money(ledger)}`);
  console.log(`  Difference       : ${money(home - ledger)}`);

  await mongoose.disconnect();
  process.exit();
};

run().catch((err) => {
  console.error('❌ Fix failed:', err);
  process.exit(1);
});