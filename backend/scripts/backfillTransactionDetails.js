// scripts/backfillTransactionDetails.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Keyword → rich metadata
const MERCHANT_MAP = {
  'amazon':       { merchant: 'Amazon.com, Inc.',   location: 'Seattle, WA',   paymentMethod: 'Rewards Credit •••• 2208', category: 'Shopping' },
  'shell':        { merchant: 'Shell Oil Company',  location: 'Gulfport, MS',  paymentMethod: 'Platinum Debit •••• 4821', category: 'Gas' },
  'electric':     { merchant: 'Gulf Power Company', location: 'Pensacola, FL', paymentMethod: 'Checking •••• 4821', category: 'Utilities' },
  'water':        { merchant: 'Water & Sewer Dept', location: 'Mobile, AL',    paymentMethod: 'Checking •••• 4821', category: 'Utilities' },
  'payroll':      { merchant: 'Acme Corp',          location: 'Mobile, AL',    paymentMethod: 'Direct Deposit',   category: 'Income' },
  'mobile check': { merchant: 'Check Deposit',      location: '',              paymentMethod: 'Mobile Deposit',   category: 'Deposit' },
  'transfer':     { category: 'Transfer' },
  'netflix':      { merchant: 'Netflix, Inc.',      location: '',              paymentMethod: 'Rewards Credit •••• 2208', category: 'Entertainment' },
  'spotify':      { merchant: 'Spotify AB',         location: '',              paymentMethod: 'Rewards Credit •••• 2208', category: 'Entertainment' },
};

// Fallback category based on `type`
const SMART_CATEGORY = {
  purchase:   'Purchase',
  debit:      'Purchase',
  deposit:    'Deposit',
  credit:     'Deposit',
  transfer:   'Transfer',
  payment:    'Payment',
  withdrawal: 'Withdrawal',
  fee:        'Fee',
  interest:   'Interest',
};

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connected\n');

  const user = await User.findOne({ username: 'emilydavis' });
  if (!user) { console.error('❌ Emily not found'); process.exit(1); }

  const txs = await Transaction.find({ userId: user._id });
  let enriched = 0;
  let categorized = 0;

  for (const tx of txs) {
    let changed = false;
    const desc = (tx.description || '').toLowerCase();

    // 1. Keyword enrichment — merchant, location, paymentMethod, category
    for (const [keyword, meta] of Object.entries(MERCHANT_MAP)) {
      if (!desc.includes(keyword)) continue;

      if (meta.merchant && !tx.merchant)         { tx.merchant = meta.merchant; changed = true; }
      if (meta.location && !tx.location)         { tx.location = meta.location; changed = true; }
      if (meta.paymentMethod && !tx.paymentMethod){ tx.paymentMethod = meta.paymentMethod; changed = true; }
      if (meta.category && !tx.category)         { tx.category = meta.category; changed = true; }
      break;
    }

    // 2. Category fallback based on type
    if (!tx.category || !tx.category.trim()) {
      tx.category = SMART_CATEGORY[(tx.type || '').toLowerCase()] || 'Other';
      changed = true;
      categorized++;
    }

    // 3. Reference number fallback
    if (!tx.referenceNumber) {
      tx.referenceNumber = 'TXN-' + String(tx._id).slice(-8).toUpperCase();
      changed = true;
    }

    if (changed) {
      await tx.save();
      enriched++;
    }
  }

  console.log(`✅ Enriched ${enriched} transactions`);
  console.log(`   → ${categorized} received a fallback category`);
  console.log('\n🎉 Backfill complete');
  process.exit();
};

run();