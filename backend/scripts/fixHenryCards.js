// scripts/fixHenryCards.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from '../models/User.js';
import Account from '../models/Account.js';
import Card from '../models/Card.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const USERNAME = 'mrhenrydorian';

const money = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(n ?? 0);

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connected\n');

  const henry = await User.findOne({ username: USERNAME })
    .select('_id firstName lastName')
    .lean();
  if (!henry) {
    console.error(`❌ User "${USERNAME}" not found`);
    process.exit(1);
  }
  console.log(`🎯 ${henry.firstName} ${henry.lastName}\n`);

  // ── 1. Link the Debit card to Henry's Checking account ──
  const checking = await Account.findOne({
    userId: henry._id,
    type: 'Checking',
  }).lean();

  if (!checking) {
    console.error('❌ No Checking account found for Henry');
    process.exit(1);
  }

  const last4 = String(checking.accountNumber || '').slice(-4);
  const linkedLabel = checking.subType
    ? `${checking.subType} ${checking.type} •••• ${last4}`
    : `${checking.type} •••• ${last4}`;

  const debit = await Card.findOne({
    userId: henry._id,
    type: 'Debit',
  });

  if (debit) {
    debit.linkedAccountId = checking._id;
    debit.linkedAccountType = checking.type;
    debit.linkedAccountLabel = linkedLabel;
    await debit.save();
    console.log('✅ Debit card linked to Checking');
    console.log(`   Linked: ${linkedLabel}\n`);
  }

  // ── 2. Set the Credit card's balance ─────────────────────
  const CREDIT_BALANCE = 500000;

  const credit = await Card.findOne({
    userId: henry._id,
    type: 'Credit',
  });

  if (credit) {
    credit.balance = CREDIT_BALANCE;
    credit.availableCredit = Math.max(
      0,
      (credit.creditLimit || 0) - CREDIT_BALANCE
    );
    credit.minimumPayment = Math.round(CREDIT_BALANCE * 0.02 * 100) / 100; // 2%
    await credit.save();
    console.log('✅ Credit card balance updated');
    console.log(`   Credit limit   : ${money(credit.creditLimit)}`);
    console.log(`   Balance        : ${money(credit.balance)}`);
    console.log(`   Available      : ${money(credit.availableCredit)}`);
    console.log(`   Min payment    : ${money(credit.minimumPayment)}\n`);
  }

  console.log('🎉 Done');
  await mongoose.disconnect();
  process.exit();
};

run().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});