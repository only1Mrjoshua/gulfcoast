// scripts/fixDaveRecentTransactions.js
//
// Enforces exactly these transactions on the 20th and 21st:
//
//   20th   Titan Blockchain Capital Profit Credit   +$328,431.00
//   21st   Accenture Weekly Payroll Direct Deposit    +$3,088.00
//   21st   Conrad Bahrain Hotel                       -$4,303.00
//
// Everything else dated the 20th or 21st (except the three above) is
// deleted. The 19th transactions (CVS, STC, Flight) are left untouched.
//
// Recalculates the checking balance + every transaction's balanceAfter.
//
// ── USAGE ───────────────────────────────────────────────────────────────
//   node scripts/fixDaveRecentTransactions.js
// ────────────────────────────────────────────────────────────────

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from '../models/User.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import Card from '../models/Card.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const USERNAME = 'dbbecker01';
const EMAIL    = 'Davebrennamanbecker@gmail.com';

const money  = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 2,
  }).format(n ?? 0);
const round2 = (n) => Math.round(n * 100) / 100;

// Build a Date for `day` of the current month at `hour:minute`
const dayAt = (day, hour, minute = 0) => {
  const d = new Date();
  d.setDate(day);
  d.setHours(hour, minute, 0, 0);
  return d;
};
const dayStart = (day) => dayAt(day, 0, 0);
const dayEnd   = (day) => { const d = dayAt(day, 23, 59); d.setSeconds(59, 999); return d; };

// ── The three transactions that MUST exist on 20th / 21st ─────────────
const REQUIRED = [
  {
    date: dayAt(20, 14, 0),
    description: 'Titan Blockchain Capital Profit Credit',
    amount: +328_431,
    category: 'Investment',
    merchant: 'Titan Blockchain Capital',
    method: 'Wire',
  },
  {
    date: dayAt(21, 9, 0),
    description: 'Accenture Weekly Payroll Direct Deposit',
    amount: +3_088,
    category: 'Income',
    merchant: 'Accenture',
    method: 'ACH',
  },
  {
    date: dayAt(21, 14, 30),
    description: 'Conrad Bahrain Hotel',
    amount: -4_303,
    category: 'Travel',
    merchant: 'Conrad Bahrain',
    method: 'Card',
  },
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connected\n');

  // ── Find Dave ──────────────────────────────────────────────────────
  const dave = await User.findOne({
    $or: [{ username: USERNAME }, { email: EMAIL }],
  }).select('_id firstName lastName').lean();

  if (!dave) {
    console.error(`❌ User "${USERNAME}" not found`);
    process.exit(1);
  }
  console.log(`🎯 ${dave.firstName} ${dave.lastName}\n`);

  // ── Find checking account ──────────────────────────────────────────
  const checking = await Account.findOne({
    userId: dave._id,
    type: 'Checking',
  });
  if (!checking) {
    console.error('❌ No Checking account found');
    process.exit(1);
  }
  console.log(`💳 Checking •••• ${String(checking.accountNumber).slice(-4)}\n`);

  // ═════════════════════════════════════════════════════════════════════
  //  STEP 1 — delete EVERY transaction on the 20th and 21st
  //           (we'll re-insert the three required ones right after)
  // ═════════════════════════════════════════════════════════════════════
  const delRes = await Transaction.deleteMany({
    userId: dave._id,
    accountId: checking._id,
    $or: [
      { date: { $gte: dayStart(20), $lte: dayEnd(20) } },
      { date: { $gte: dayStart(21), $lte: dayEnd(21) } },
    ],
  });
  console.log(`🗑  Deleted ${delRes.deletedCount} transaction(s) from the 20th & 21st\n`);

  // ═════════════════════════════════════════════════════════════════════
  //  STEP 2 — insert the three required transactions
  // ═════════════════════════════════════════════════════════════════════
  const docs = REQUIRED.map((it) => ({
    userId: dave._id,
    accountId: checking._id,
    description: it.description,
    amount: it.amount,                                  // signed in DB
    type: it.amount >= 0 ? 'deposit' : 'withdrawal',
    status: 'Completed',
    date: it.date,
    direction: it.amount >= 0 ? 'credit' : 'debit',
    category: it.category,
    merchant: it.merchant,
    method: it.method,
  }));

  await Transaction.insertMany(docs, { ordered: false });
  console.log(`📝 Inserted ${docs.length} transaction(s):\n`);
  for (const it of REQUIRED) {
    const sign = it.amount >= 0 ? '+' : '-';
    const hh = String(it.date.getHours()).padStart(2, '0');
    const mm = String(it.date.getMinutes()).padStart(2, '0');
    console.log(
      `   ${it.date.toDateString().slice(4)} ${hh}:${mm}  ` +
      `${sign}${money(Math.abs(it.amount))}  ${it.description}`,
    );
  }
  console.log('');

  // ═════════════════════════════════════════════════════════════════════
  //  STEP 3 — recalc checking balance + walking balanceAfter
  // ═════════════════════════════════════════════════════════════════════
  const allTx = await Transaction.find({
    userId: dave._id,
    accountId: checking._id,
  }).sort({ date: 1, _id: 1 }).lean();

  let running = 0;
  const bulkOps = [];

  for (const t of allTx) {
    const abs = Math.abs(t.amount ?? 0);
    running = round2(running + (t.direction === 'credit' ? abs : -abs));
    if (t.balanceAfter !== running) {
      bulkOps.push({
        updateOne: {
          filter: { _id: t._id },
          update: { $set: { balanceAfter: running } },
        },
      });
    }
  }

  if (bulkOps.length) {
    await Transaction.bulkWrite(bulkOps);
    console.log(`♻️  Recalculated balanceAfter on ${bulkOps.length} transaction(s)`);
  }

  const newCheckingBalance = round2(running);

  checking.totalBalance     = newCheckingBalance;
  checking.availableBalance = newCheckingBalance;
  checking.pendingBalance   = 0;
  await checking.save();

  const cardRes = await Card.updateMany(
    { userId: dave._id, type: 'Debit' },
    { $set: { balance: newCheckingBalance } },
  );
  console.log(`💳 Checking updated → ${money(newCheckingBalance)}`);
  console.log(`🪪 Debit card synced (${cardRes.modifiedCount} card)\n`);

  // ═════════════════════════════════════════════════════════════════════
  //  SUMMARY
  // ═════════════════════════════════════════════════════════════════════
  const savings = await Account.findOne({ userId: dave._id, type: 'Savings' }).lean();
  const savingsBalance = savings?.totalBalance ?? 0;
  const combinedTotal  = round2(newCheckingBalance + savingsBalance);

  const newest = await Transaction.find({
    userId: dave._id,
    accountId: checking._id,
  })
    .sort({ date: -1, _id: -1 })
    .limit(6)
    .select('date description amount direction')
    .lean();

  console.log('════════════════════════════════════════════');
  console.log('  MOST RECENT TRANSACTIONS (newest → oldest)');
  console.log('════════════════════════════════════════════');
  for (const t of newest) {
    const sign = t.direction === 'credit' ? '+' : '-';
    const dt = new Date(t.date);
    const stamp =
      `${dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ` +
      `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
    console.log(
      `  ${stamp.padEnd(18)}  ${sign}${money(Math.abs(t.amount)).padStart(14)}  ${t.description}`,
    );
  }
  console.log('════════════════════════════════════════════\n');

  console.log('  Final balances:');
  console.log(`   Checking   ${money(newCheckingBalance)}`);
  console.log(`   Savings    ${money(savingsBalance)}`);
  console.log('  ─────────────────────────────────────');
  console.log(`   COMBINED   ${money(combinedTotal)}`);
  console.log('');

  console.log('🎉 Done.\n');

  await mongoose.disconnect();
  process.exit();
};

run().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});