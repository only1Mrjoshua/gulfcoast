// scripts/fixDaveCreditCard.js
//
// Updates Dave Brennaman Becker's credit card:
//   • creditLimit     → $100,000
//   • balance         → $100,000
//   • availableCredit → $100,000
//   • minimumPayment  → $2,000 (2% of balance)
//   • cardName        → "Dave B. Becker"
//   • cardholderName  → "DAVE B. BECKER"
//
// Also syncs the debit card holder name for consistency.
//
// ── USAGE ───────────────────────────────────────────────────────────────
//   node scripts/fixDaveCreditCard.js
// ────────────────────────────────────────────────────────────────

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from '../models/User.js';
import Card from '../models/Card.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const USERNAME = 'dbbecker01';
const EMAIL    = 'Davebrennamanbecker@gmail.com';

const CREDIT_LIMIT      = 100_000;
const CREDIT_BALANCE    = 100_000;
const CREDIT_AVAILABLE  = 100_000;
const CARD_NAME         = 'Dave B. Becker';
const CARDHOLDER_NAME   = 'DAVE B. BECKER';

const money = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(n ?? 0);

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connected\n');

  // ── Find Dave ──────────────────────────────────────────────────────
  const dave = await User.findOne({
    $or: [{ username: USERNAME }, { email: EMAIL }],
  })
    .select('_id firstName lastName fullName')
    .lean();

  if (!dave) {
    console.error(`❌ User "${USERNAME}" not found`);
    process.exit(1);
  }
  console.log(`🎯 ${dave.firstName} ${dave.lastName}\n`);

  // ── Update every card Dave owns ────────────────────────────────────
  const cards = await Card.find({ userId: dave._id });

  if (cards.length === 0) {
    console.error('❌ No cards found for Dave');
    process.exit(1);
  }

  for (const card of cards) {
    // Shared fields — applies to both debit and credit
    card.cardName = CARD_NAME;
    card.cardholderName = CARDHOLDER_NAME;

    // Credit-only fields — all three set to $100,000
    if (card.type === 'Credit') {
      card.creditLimit      = CREDIT_LIMIT;
      card.balance          = CREDIT_BALANCE;
      card.availableCredit  = CREDIT_AVAILABLE;
      card.minimumPayment   = Math.round(CREDIT_BALANCE * 0.02 * 100) / 100; // 2%
    }

    await card.save();

    console.log(`💳 ${card.type} •••• ${card.fullNumber?.slice(-4) ?? '----'}`);
    console.log(`   cardName        : ${card.cardName}`);
    console.log(`   cardholderName  : ${card.cardholderName}`);
    if (card.type === 'Credit') {
      console.log(`   credit limit    : ${money(card.creditLimit)}`);
      console.log(`   balance         : ${money(card.balance)}`);
      console.log(`   available credit: ${money(card.availableCredit)}`);
      console.log(`   minimum payment : ${money(card.minimumPayment)}`);
    }
    console.log('');
  }

  console.log(`🎉 Updated ${cards.length} card(s).`);
  await mongoose.disconnect();
  process.exit();
};

run().catch((err) => {
  console.error('❌ Failed:', err);
  process.exit(1);
});