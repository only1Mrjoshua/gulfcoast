// scripts/createHenryDorianCards.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from '../models/User.js';
import Account from '../models/Account.js';
import Card from '../models/Card.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

// ─────────────────────────────────────────────────────────
//  Configuration
// ─────────────────────────────────────────────────────────
const USERNAME = 'mrhenrydorian';

const money = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(n ?? 0);

// Random 16-digit card number
const randomCardNumber = () => {
  let n = '';
  for (let i = 0; i < 16; i++) n += Math.floor(Math.random() * 10);
  return n;
};

// Random 3-digit CVV
const randomCvv = () => String(Math.floor(100 + Math.random() * 900));

// Expiry 4 years from now
const futureExpiry = () => {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear() + 4,
  };
};

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

  // ── Resolve Henry's Checking account (for the debit card) ─
  const checking = await Account.findOne({
    userId: henry._id,
    type: 'Checking',
  }).lean();

  if (!checking) {
    console.error('❌ No Checking account found for Henry');
    console.error('   Run createHenryDorianAccounts.js first.');
    process.exit(1);
  }

  console.log(
    `💳 Checking account: •••• ${String(checking.accountNumber || '').slice(-4)}\n`
  );

  // ── Clean up any existing cards for a fresh run ──────────
  const removed = await Card.deleteMany({ userId: henry._id });
  if (removed.deletedCount > 0) {
    console.log(`🧹 Removed ${removed.deletedCount} existing card(s)\n`);
  }

  // ── Create the DEBIT card ────────────────────────────────
  const debitExpiry = futureExpiry();
  const debitNumber = randomCardNumber();

  const debitCard = await Card.create({
    userId: henry._id,
    accountId: checking._id,

    // Required fields per the model
    fullNumber: debitNumber,
    type: 'Debit',
    cardName: 'Everyday Debit',

    // Optional / conventional fields
    lastFour: debitNumber.slice(-4),
    cvv: randomCvv(),
    cardholderName: `${henry.firstName} ${henry.lastName}`.toUpperCase(),
    brand: 'Visa',
    expiryMonth: debitExpiry.month,
    expiryYear: debitExpiry.year,
    status: 'Active',
    isDefault: true,

    // Credit-specific fields left at zero
    creditLimit: 0,
    currentBalance: 0,
    availableCredit: 0,
  });

  console.log('✅ Debit card created');
  console.log(`   Card #         : •••• ${debitNumber.slice(-4)}`);
  console.log(`   Type           : Debit`);
  console.log(`   Brand          : Visa`);
  console.log(
    `   Expires        : ${String(debitExpiry.month).padStart(2, '0')}/${debitExpiry.year}`
  );
  console.log(
    `   Linked account : Checking •••• ${String(checking.accountNumber || '').slice(-4)}`
  );
  console.log(`   Status         : Active`);
  console.log(`   Default        : Yes`);
  console.log(`   Card ID        : ${debitCard._id}`);
  console.log('');

  // ── Create the CREDIT card ───────────────────────────────
  const CREDIT_LIMIT = 500000;
  const CREDIT_BALANCE = 500000; // the balance, not the limit
  const creditExpiry = futureExpiry();
  const creditNumber = randomCardNumber();

  const creditCard = await Card.create({
    userId: henry._id,
    accountId: null,

    // Required fields per the model
    fullNumber: creditNumber,
    type: 'Credit',
    cardName: 'Platinum Rewards',

    // Optional / conventional fields
    lastFour: creditNumber.slice(-4),
    cvv: randomCvv(),
    cardholderName: `${henry.firstName} ${henry.lastName}`.toUpperCase(),
    brand: 'Mastercard',
    expiryMonth: creditExpiry.month,
    expiryYear: creditExpiry.year,
    status: 'Active',
    isDefault: false,

    // Credit-specific fields
    creditLimit: CREDIT_LIMIT,
    currentBalance: CREDIT_BALANCE,
    availableCredit: Math.max(0, CREDIT_LIMIT - CREDIT_BALANCE),
  });

  console.log('✅ Credit card created');
  console.log(`   Card #         : •••• ${creditNumber.slice(-4)}`);
  console.log(`   Type           : Credit`);
  console.log(`   Brand          : Mastercard`);
  console.log(
    `   Expires        : ${String(creditExpiry.month).padStart(2, '0')}/${creditExpiry.year}`
  );
  console.log(`   Credit limit   : ${money(CREDIT_LIMIT)}`);
  console.log(`   Current balance: ${money(CREDIT_BALANCE)}`);
  console.log(`   Available      : ${money(CREDIT_LIMIT - CREDIT_BALANCE)}`);
  console.log(`   Status         : Active`);
  console.log(`   Card ID        : ${creditCard._id}`);
  console.log('');

  // ── Summary ──────────────────────────────────────────────
  console.log('── Summary ──');
  console.log(`   Cards created  : 2`);
  console.log(`   Debit          : •••• ${debitNumber.slice(-4)}  (linked to Checking)`);
  console.log(
    `   Credit         : •••• ${creditNumber.slice(-4)}  (balance ${money(CREDIT_BALANCE)})`
  );

  console.log('\n🎉 Done — log in as Henry and open /cards.');
  await mongoose.disconnect();
  process.exit();
};

run().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});