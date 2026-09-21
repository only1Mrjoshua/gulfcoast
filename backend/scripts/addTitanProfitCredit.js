// scripts/addTitanProfitCredit.js
//
// Adds a single credit to Dave's checking account:
//   • $328,431.00 — "Titan Blockchain Capital Profit Credit"
//   • Dated yesterday
//
// Then bumps:
//   • Checking account totalBalance / availableBalance (+ $328,431)
//   • Debit card balance                            (+ $328,431)
//   • Recalculates balanceAfter on every later transaction
//
// Final combined balance becomes: $2,072,210 + $328,431 = $2,400,641
//
// ── USAGE ───────────────────────────────────────────────────────────────
//   node scripts/addTitanProfitCredit.js
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

const CREDIT_AMOUNT  = 328_431;
const DESCRIPTION    = 'Titan Blockchain Capital Profit Credit';
const CATEGORY       = 'Investment';
const METHOD         = 'Wire';
const MERCHANT       = 'Titan Blockchain Capital';

const money = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(n ?? 0);

const round2 = (n) => Math.round(n * 100) / 100;

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connected\n');

  // ── Find Dave ──────────────────────────────────────────────────────
  const dave = await User.findOne({
    $or: [{ username: USERNAME }, { email: EMAIL }],
  })
    .select('_id firstName lastName')
    .lean();

  if (!dave) {
    console.error(`❌ User "${USERNAME}" not found`);
    process.exit(1);
  }
  console.log(`🎯 ${dave.firstName} ${dave.lastName}\n`);

  // ── Find his checking account ──────────────────────────────────────
  const checking = await Account.findOne({
    userId: dave._id,
    type: 'Checking',
  });

  if (!checking) {
    console.error('❌ No Checking account found for Dave');
    process.exit(1);
  }

  console.log(`💳 Checking •••• ${String(checking.accountNumber).slice(-4)}`);
  console.log(`   Before: ${money(checking.totalBalance)}\n`);

  // ── Determine the insert date (yesterday, 15:00) ───────────────────
  const insertDate = new Date();
  insertDate.setDate(insertDate.getDate() - 1);
  insertDate.setHours(15, 0, 0, 0);
  console.log(`📅 Inserting at ${insertDate.toDateString()} 15:00\n`);

  // ── Create the credit transaction ──────────────────────────────────
  const tx = await Transaction.create({
    userId:      dave._id,
    accountId:   checking._id,
    description: DESCRIPTION,
    amount:      CREDIT_AMOUNT,
    type:        'deposit',
    status:      'Completed',
    date:        insertDate,
    direction:   'credit',
    category:    CATEGORY,
    method:      METHOD,
    merchant:    MERCHANT,
    reference:   'TBC-PRO-EXTRA-' + insertDate.toISOString().slice(0, 10),
  });

  console.log(`📝 Transaction created: ${tx._id}`);
  console.log(`   ${DESCRIPTION}  +${money(CREDIT_AMOUNT)}\n`);

  // ── Update checking balance ────────────────────────────────────────
  const newCheckingBalance = round2(checking.totalBalance + CREDIT_AMOUNT);
  checking.totalBalance     = newCheckingBalance;
  checking.availableBalance = newCheckingBalance;
  checking.pendingBalance   = 0;
  await checking.save();

  console.log(`💳 Checking updated → ${money(newCheckingBalance)}\n`);

  // ── Update debit card balance ──────────────────────────────────────
  const debitRes = await Card.updateMany(
    { userId: dave._id, type: 'Debit' },
    { $set: { balance: newCheckingBalance } },
  );
  console.log(`🪪 Debit card balance synced (${debitRes.modifiedCount} card)\n`);

  // ── Recalculate balanceAfter for all subsequent checking transactions ──
  //
  // We grab every checking transaction ordered by date, then walk through
  // them and rewrite balanceAfter. This keeps the walking balance correct
  // even if the inserted credit lands before older transactions.
  //
  const txs = await Transaction.find({
    userId: dave._id,
    accountId: checking._id,
  })
    .sort({ date: 1, _id: 1 })
    .lean();

  // Find Dave's opening balance (the very first transaction's balanceAfter
  // minus its own amount) so we don't have to guess.
  const openingTx = txs[0];
  const openingBalance = openingTx
    ? round2((openingTx.balanceAfter ?? openingTx.amount) - openingTx.amount)
    : 0;

  let running = openingBalance;
  const bulkOps = [];

  for (const t of txs) {
    const signedAmount = t.direction === 'credit' ? t.amount : -t.amount;
    running = round2(running + signedAmount);
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
    const res = await Transaction.bulkWrite(bulkOps);
    console.log(`♻️  Recalculated balanceAfter on ${res.modifiedCount} transaction(s)\n`);
  } else {
    console.log('♻️  balanceAfter already correct on all transactions\n');
  }

  // ── Summary ────────────────────────────────────────────────────────
  const savings = await Account.findOne({
    userId: dave._id,
    type: 'Savings',
  }).lean();

  const savingsBalance = savings?.totalBalance ?? 0;
  const combinedTotal  = round2(newCheckingBalance + savingsBalance);

  console.log('════════════════════════════════════════════');
  console.log('  SUMMARY');
  console.log('════════════════════════════════════════════');
  console.log(`  Checking                ${money(newCheckingBalance).padStart(15)}`);
  console.log(`  Savings                 ${money(savingsBalance).padStart(15)}`);
  console.log('  ─────────────────────────────────────────────');
  console.log(`  COMBINED TOTAL          ${money(combinedTotal).padStart(15)}`);
  console.log('════════════════════════════════════════════\n');

  console.log(`🎉 Done — added ${money(CREDIT_AMOUNT)} credit.\n`);

  await mongoose.disconnect();
  process.exit();
};

run().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});