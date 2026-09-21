// scripts/seedDavePaymentProfile.js
//
// Creates or refreshes Dave Brennaman Becker's PaymentProfile document.
//
// What it does:
//   1. Finds Dave by username (dbbecker01) or email.
//   2. Finds his Checking account for reference.
//   3. Wipes any existing PaymentProfile for him.
//   4. Creates a fresh profile with:
//        • 6 automatic payments (Apple TV+, Apple Music, Apple TV,
//          Amazon Prime, Netflix, Apple Card Recharge $1,500)
//        • A small set of upcoming (one-off) payments
//        • Aggregate figures: dueSoonAmount, scheduledAmount, paidThisMonth
//
// ── USAGE ───────────────────────────────────────────────────────────────
//   node scripts/seedDavePaymentProfile.js
// ────────────────────────────────────────────────────────────────────────

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from '../models/User.js';
import Account from '../models/Account.js';
import PaymentProfile from '../models/PaymentProfile.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

// ═════════════════════════════════════════════════════════════════════════
//  CONFIG
// ═════════════════════════════════════════════════════════════════════════

const USERNAME = 'dbbecker01';
const EMAIL    = 'Davebrennamanbecker@gmail.com';

const TODAY = new Date();

// ── Automatic payments ──────────────────────────────────────────────────
// `anchorDay` = the calendar day the payment runs each month.
// `nextDate` is computed as the next occurrence on-or-after today.
const AUTOMATICS = [
  { name: 'Apple TV+',            frequency: 'Monthly', balance:    9.99, anchorDay: 2  },
  { name: 'Apple Music',          frequency: 'Monthly', balance:   10.99, anchorDay: 3  },
  { name: 'Apple TV',             frequency: 'Monthly', balance:    9.99, anchorDay: 4  },
  { name: 'Amazon Prime',         frequency: 'Monthly', balance:   14.99, anchorDay: 5  },
  { name: 'Netflix',              frequency: 'Monthly', balance:   22.99, anchorDay: 6  },
  { name: 'Apple Card Recharge',  frequency: 'Monthly', balance: 1500.00, anchorDay: 12 },
];

// ── Upcoming (one-off) payments ─────────────────────────────────────────
// dueDaysFromNow = how many days from today the payment is due.
const UPCOMING = [
  { name: 'Amazon Prime Renewal',     dueDaysFromNow:  3, balance:   14.99, autopay: true  },
  { name: 'Netflix',                  dueDaysFromNow:  5, balance:   22.99, autopay: true  },
  { name: 'Apple Card Recharge',      dueDaysFromNow:  9, balance: 1500.00, autopay: true  },
  { name: 'Apple TV+',                dueDaysFromNow: 12, balance:    9.99, autopay: true  },
  { name: 'Apple Music',              dueDaysFromNow: 14, balance:   10.99, autopay: true  },
  { name: 'Apple TV',                 dueDaysFromNow: 16, balance:    9.99, autopay: true  },
];

// ═════════════════════════════════════════════════════════════════════════
//  Helpers
// ═════════════════════════════════════════════════════════════════════════

const money = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 2,
  }).format(n ?? 0);

const round2 = (n) => Math.round(n * 100) / 100;

/** Next date that lands on `day` (1–28) on or after `from`. */
function nextOnDay(from, day) {
  const d = new Date(from);
  d.setHours(7, 0, 0, 0);           // payments run early morning
  if (d.getDate() > day) {
    d.setMonth(d.getMonth() + 1);
  }
  d.setDate(day);
  return d;
}

/** Add N days to today, at 07:00 local time. */
function inDays(n) {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + n);
  d.setHours(7, 0, 0, 0);
  return d;
}

// ═════════════════════════════════════════════════════════════════════════
//  Main
// ═════════════════════════════════════════════════════════════════════════

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connected\n');

  // ── 1. Find the user ───────────────────────────────────────────────
  const user = await User.findOne({
    $or: [{ username: USERNAME }, { email: EMAIL }],
  }).select('_id firstName lastName username email').lean();

  if (!user) {
    console.error(`❌ User not found — create Dave first (username: ${USERNAME})`);
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`🎯 User: ${user.firstName} ${user.lastName}  (${user._id})`);
  console.log(`   ${user.email}\n`);

  // ── 2. Confirm the checking account exists (just for reference) ────
  const checking = await Account.findOne({
    userId: user._id,
    type: 'Checking',
  }).select('_id nickname accountNumber totalBalance').lean();

  if (!checking) {
    console.warn('⚠️  No Checking account found — the profile will still be created.');
  } else {
    console.log(`💳 Checking •••• ${String(checking.accountNumber).slice(-4)} — ${money(checking.totalBalance)}\n`);
  }

  // ── 3. Wipe any existing profile ───────────────────────────────────
  const del = await PaymentProfile.deleteMany({ userId: user._id });
  if (del.deletedCount) {
    console.log(`🧹 Removed ${del.deletedCount} existing PaymentProfile document(s)\n`);
  }

  // ── 4. Build the automatic payments array ─────────────────────────
  const automaticPayments = AUTOMATICS.map((a) => ({
    name: a.name,
    frequency: a.frequency,
    balance: a.balance,
    nextDate: nextOnDay(TODAY, a.anchorDay),
    autopay: true,
  }));

  // ── 5. Build the upcoming payments array ──────────────────────────
  const upcomingPayments = UPCOMING.map((u) => ({
    name: u.name,
    dueDate: inDays(u.dueDaysFromNow),
    balance: u.balance,
    autopay: u.autopay,
  }));

  // ── 6. Compute the aggregate figures ──────────────────────────────
  const DUE_SOON_DAYS = 7;

  const dueSoonAmount = round2(
    upcomingPayments
      .filter((p) => {
        const diff = (p.dueDate - TODAY) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= DUE_SOON_DAYS;
      })
      .reduce((s, p) => s + p.balance, 0),
  );

  const scheduledAmount = round2(
    upcomingPayments.reduce((s, p) => s + p.balance, 0),
  );

  // "Paid this month" — what the six autopays have already cost him
  // since the 1st of this month.
  const paidThisMonth = round2(
    automaticPayments
      .filter((a) => a.nextDate.getMonth() !== TODAY.getMonth()) // already ran
      .reduce((s, a) => s + a.balance, 0)
      // if none have run yet, fall back to the fixed monthly total
      || AUTOMATICS.reduce((s, a) => s + a.balance, 0),
  );

  // ── 7. Create the profile ─────────────────────────────────────────
  const profile = await PaymentProfile.create({
    userId: user._id,
    dueSoonAmount,
    dueWithinDays: DUE_SOON_DAYS,
    scheduledAmount,
    paidThisMonth,
    upcomingPayments,
    automaticPayments,
  });

  // ── 8. Summary ────────────────────────────────────────────────────
  console.log('════════════════════════════════════════════');
  console.log('  PAYMENT PROFILE');
  console.log('════════════════════════════════════════════');
  console.log(`  Due soon (next ${DUE_SOON_DAYS} days)  ${money(dueSoonAmount)}`);
  console.log(`  Scheduled (all upcoming)     ${money(scheduledAmount)}`);
  console.log(`  Paid this month              ${money(paidThisMonth)}`);
  console.log('════════════════════════════════════════════\n');

  console.log('  Automatic payments:');
  for (const a of automaticPayments) {
    console.log(
      `   • ${a.name.padEnd(22)} ${money(a.balance).padStart(10)}   next ${a.nextDate.toDateString()}`,
    );
  }

  console.log('\n  Upcoming payments:');
  for (const u of upcomingPayments) {
    console.log(
      `   • ${u.name.padEnd(22)} ${money(u.balance).padStart(10)}   due ${u.dueDate.toDateString()}${u.autopay ? '  (autopay)' : ''}`,
    );
  }

  console.log(`\n🎉 Done — PaymentProfile ${profile._id} created.\n`);

  await mongoose.disconnect();
  process.exit();
};

run().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});