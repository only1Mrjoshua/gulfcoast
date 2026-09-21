// scripts/seedDaveAutopays.js
//
// Creates / refreshes Dave Brennaman Becker's automatic-payment records
// in the Autopay collection, plus a Payee document for each merchant.
//
// ── USAGE ───────────────────────────────────────────────────────────────
//   node scripts/seedDaveAutopays.js
// ────────────────────────────────────────────────────────────────────────

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from '../models/User.js';
import Account from '../models/Account.js';
import Payee from '../models/Payee.js';
import Autopay from '../models/Autopay.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

// ═════════════════════════════════════════════════════════════════════════
//  CONFIG
// ═════════════════════════════════════════════════════════════════════════

const USERNAME = 'dbbecker01';
const EMAIL    = 'Davebrennamanbecker@gmail.com';

// `day` = the calendar day of the month each autopay runs.
const AUTOPAYS = [
  { name: 'Apple TV+',            amount:    9.99, day:  2 },
  { name: 'Apple Music',          amount:   10.99, day:  3 },
  { name: 'Apple TV',             amount:    9.99, day:  4 },
  { name: 'Amazon Prime',         amount:   14.99, day:  5 },
  { name: 'Netflix',              amount:   22.99, day:  6 },
  { name: 'Apple Card Recharge',  amount: 1500.00, day: 12 },
];

// ═════════════════════════════════════════════════════════════════════════
//  Helpers
// ═════════════════════════════════════════════════════════════════════════

const money = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 2,
  }).format(n ?? 0);

/** Next occurrence of `day` (1–28) on or after `from`. */
const nextOnDay = (from, day) => {
  const d = new Date(from);
  d.setHours(7, 0, 0, 0);
  if (d.getDate() > day) d.setMonth(d.getMonth() + 1);
  d.setDate(day);
  return d;
};

// ═════════════════════════════════════════════════════════════════════════
//  Main
// ═════════════════════════════════════════════════════════════════════════

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connected\n');

  // ── 1. Find Dave ───────────────────────────────────────────────────
  const user = await User.findOne({
    $or: [{ username: USERNAME }, { email: EMAIL }],
  }).select('_id firstName lastName username email').lean();

  if (!user) {
    console.error(`❌ User "${USERNAME}" not found`);
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`🎯 User: ${user.firstName} ${user.lastName}  (${user._id})`);
  console.log(`   ${user.email}\n`);

  // ── 2. Find his Checking account ───────────────────────────────────
  const checking = await Account.findOne({
    userId: user._id,
    type: 'Checking',
  }).select('_id nickname accountNumber').lean();

  if (!checking) {
    console.error('❌ No Checking account found for this user');
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`💳 Checking •••• ${String(checking.accountNumber).slice(-4)}`);
  console.log(`   nickname: ${checking.nickname ?? '—'}\n`);

  // ── 3. Wipe existing autopays for a clean run ─────────────────────
  const del = await Autopay.deleteMany({ userId: user._id });
  if (del.deletedCount) {
    console.log(`🧹 Removed ${del.deletedCount} existing Autopay document(s)\n`);
  }

  // ── 4. Create Payee + Autopay for each subscription ───────────────
  const today = new Date();
  const created = [];

  for (const sub of AUTOPAYS) {
    // Ensure the Payee exists (reuse by name, create otherwise)
    let payee = await Payee.findOne({ userId: user._id, name: sub.name }).lean();
    if (!payee) {
      try {
        payee = (await Payee.create({
          userId: user._id,
          name: sub.name,
          nickname: sub.name,
          type: 'Merchant',
          isActive: true,
        })).toObject();
      } catch {
        // Fallback for stricter schemas
        payee = (await Payee.create({
          userId: user._id,
          name: sub.name,
          type: 'Merchant',
        })).toObject();
      }
      console.log(`👤 Created payee: ${sub.name}`);
    }

    const nextDate = nextOnDay(today, sub.day);

    // Every plausible field the Autopay schema might use is provided.
    // Mongoose strict mode drops any that aren't in the schema.
    const doc = await Autopay.create({
      userId:         user._id,
      payeeId:        payee._id,
      payeeName:      sub.name,
      name:           sub.name,
      payee:          sub.name,

      fromAccountId:   checking._id,
      fromAccountName: checking.nickname || 'Everyday Checking',
      fromLastFour:    String(checking.accountNumber).slice(-4),
      accountId:       checking._id,

      amount:         sub.amount,
      nextAmount:     sub.amount,
      balance:        sub.amount,

      frequency:      'Monthly',
      nextDate,
      nextPaymentDate: nextDate,

      enabled:        true,
      isActive:       true,
      autopay:        true,
      isRecurring:    true,
      status:         'Active',
    });

    created.push({ doc, payee });
  }

  // ── 5. Summary ────────────────────────────────────────────────────
  console.log('\n════════════════════════════════════════════');
  console.log('  AUTOMATIC PAYMENTS CREATED');
  console.log('════════════════════════════════════════════');
  for (const { doc } of created) {
    console.log(
      `  ${String(doc.payeeName ?? doc.name).padEnd(22)} ` +
      `${money(doc.amount ?? doc.nextAmount).padStart(10)}  ` +
      `next ${doc.nextDate.toDateString()}`,
    );
  }
  console.log('════════════════════════════════════════════\n');

  console.log(`🎉 Created ${created.length} Autopay document(s) for ${user.firstName} ${user.lastName}.\n`);

  await mongoose.disconnect();
  process.exit();
};

run().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});