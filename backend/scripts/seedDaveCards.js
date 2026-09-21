// scripts/seedDaveCards.js
//
// Creates / refreshes Dave Brennaman Becker's debit and credit cards.
//
//   • Debit  — linked to his Checking account, mirrors its balance
//   • Credit — $500,000 credit limit, never used (balance $0)
//
// Safe to re-run: wipes any existing cards for this user first.
//
// ── USAGE ───────────────────────────────────────────────────────────────
//   node scripts/seedDaveCards.js
// ────────────────────────────────────────────────────────────────────────

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from '../models/User.js';
import Account from '../models/Account.js';
import Card from '../models/Card.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

// ═════════════════════════════════════════════════════════════════════════
//  CONFIG
// ═════════════════════════════════════════════════════════════════════════

const USERNAME = 'dbbecker01';
const EMAIL    = 'Davebrennamanbecker@gmail.com';

const DEBIT_CARD_LAST4  = '4412';
const CREDIT_CARD_LAST4 = '8801';
const CREDIT_LIMIT      = 500_000;

// How far into the future the cards expire
const DEBIT_EXPIRY_YEARS  = 4;
const CREDIT_EXPIRY_YEARS = 5;

// ═════════════════════════════════════════════════════════════════════════
//  Helpers
// ═════════════════════════════════════════════════════════════════════════

const money = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 2,
  }).format(n ?? 0);

// "2029" + "09" → "09/29"
const formatExp = (month, year) => `${month}/${String(year).slice(-2)}`;

// ═════════════════════════════════════════════════════════════════════════
//  Main
// ═════════════════════════════════════════════════════════════════════════

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connected\n');

  // ── 1. Find Dave ───────────────────────────────────────────────────
  const user = await User.findOne({
    $or: [{ username: USERNAME }, { email: EMAIL }],
  }).select('_id firstName lastName fullName username email').lean();

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
  }).select('_id nickname accountNumber totalBalance').lean();

  if (!checking) {
    console.error('❌ No Checking account found for this user');
    await mongoose.disconnect();
    process.exit(1);
  }

  const checkingLast4 = String(checking.accountNumber).slice(-4);
  const checkingLabel = `${checking.nickname || 'Everyday Checking'} •••• ${checkingLast4}`;

  console.log(`💳 Checking •••• ${checkingLast4} — ${money(checking.totalBalance)}`);
  console.log(`   label: ${checkingLabel}\n`);

  // ── 3. Wipe existing cards ─────────────────────────────────────────
  const del = await Card.deleteMany({ userId: user._id });
  if (del.deletedCount) {
    console.log(`🧹 Removed ${del.deletedCount} existing card(s)\n`);
  }

  // ── 4. Compute expiry dates ────────────────────────────────────────
  const now = new Date();
  const currentMonth = now.getMonth() + 1;

  const debitExpiryMonth  = String(currentMonth).padStart(2, '0');
  const debitExpiryYear   = String(now.getFullYear() + DEBIT_EXPIRY_YEARS);

  const creditExpiryMonth = String(((currentMonth + 2) % 12) + 1).padStart(2, '0');
  const creditExpiryYear  = String(now.getFullYear() + CREDIT_EXPIRY_YEARS);

  // ── 5. Full card numbers (16 digits, formatted) ────────────────────
  const DEBIT_FULL  = `441288011234${DEBIT_CARD_LAST4}`;
  const CREDIT_FULL = `441288019876${CREDIT_CARD_LAST4}`;

  const cardholderName = String(
    user.fullName || `${user.firstName} ${user.lastName}` || 'Dave B. Becker',
  ).toUpperCase();

  // ── 6. Create the two cards ────────────────────────────────────────
  const [debit, credit] = await Card.create([
    {
      userId: user._id,
      cardName: 'Dave B. Becker',
      cardholderName,

      type: 'Debit',                 // exactly 'Debit' — capital D
      fullNumber: DEBIT_FULL,
      cvv: '412',
      expiryMonth: debitExpiryMonth,
      expiryYear:  debitExpiryYear,

      linkedAccountId:    checking._id,
      linkedAccountType:  'Checking',
      linkedAccountLabel: checkingLabel,

      // Debit card balance mirrors the checking account
      balance:         checking.totalBalance || 0,
      availableCredit: 0,
      creditLimit:     0,
      minimumPayment:  0,
      paymentDueDate:  null,
      nextStatementDate: null,

      status: 'Active',
      controls: {
        locked: false,
        contactless: true,
        onlinePurchases: true,
        internationalPurchases: true,
        atmWithdrawals: true,
        notifications: true,
      },
      activity: [],
    },
    {
      userId: user._id,
      cardName: 'Dave B. Becker',
      cardholderName,

      type: 'Credit',                // exactly 'Credit' — capital C
      fullNumber: CREDIT_FULL,
      cvv: '889',
      expiryMonth: creditExpiryMonth,
      expiryYear:  creditExpiryYear,

      linkedAccountId:    null,
      linkedAccountType:  null,
      linkedAccountLabel: '',

      // Credit card — never used
      balance:         0,                 // nothing owed
      availableCredit: CREDIT_LIMIT,      // full $500k available
      creditLimit:     CREDIT_LIMIT,
      minimumPayment:  0,
      paymentDueDate:  null,
      nextStatementDate: null,

      status: 'Active',
      controls: {
        locked: false,
        contactless: true,
        onlinePurchases: true,
        internationalPurchases: true,
        atmWithdrawals: false,            // credit cards don't do ATM
        notifications: true,
      },
      activity: [],
    },
  ]);

  // ── 7. Summary ─────────────────────────────────────────────────────
  console.log('════════════════════════════════════════════');
  console.log('  CARDS CREATED');
  console.log('════════════════════════════════════════════');
  console.log(`  Debit  •••• ${DEBIT_CARD_LAST4}    ${debit.cardName}`);
  console.log(`     type     : ${debit.type}`);
  console.log(`     expires  : ${formatExp(debitExpiryMonth, debitExpiryYear)}`);
  console.log(`     linked   : ${checkingLabel}`);
  console.log(`     balance  : ${money(debit.balance)}`);
  console.log('');
  console.log(`  Credit •••• ${CREDIT_CARD_LAST4}    ${credit.cardName}`);
  console.log(`     type     : ${credit.type}`);
  console.log(`     expires  : ${formatExp(creditExpiryMonth, creditExpiryYear)}`);
  console.log(`     limit    : ${money(CREDIT_LIMIT)}`);
  console.log(`     balance  : ${money(credit.balance)}`);
  console.log(`     available: ${money(credit.availableCredit)}`);
  console.log('════════════════════════════════════════════\n');

  console.log(`🎉 Created 2 cards for ${user.firstName} ${user.lastName}.\n`);

  await mongoose.disconnect();
  process.exit();
};

run().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});