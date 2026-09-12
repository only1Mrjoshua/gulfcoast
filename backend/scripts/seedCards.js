// scripts/seedCards.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

import User from '../models/User.js';
import Account from '../models/Account.js';
import Card from '../models/Card.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connected\n');

  const user = await User.findOne({ username: 'emilydavis' });
  if (!user) { console.error('❌ Emily not found'); process.exit(1); }

  const checking = await Account.findOne({ userId: user._id, type: 'Checking' });
  const savings  = await Account.findOne({ userId: user._id, type: 'Savings', subType: 'Standard' });

  if (!checking) { console.error('❌ Checking not found'); process.exit(1); }

  // Clean up existing
  await Card.deleteMany({ userId: user._id });
  console.log('🧹 Cleared existing cards\n');

  const today = new Date();
  const daysAgo = (n) => { const d = new Date(today); d.setDate(d.getDate() - n); return d; };

  const accountLabel = (acc) => {
    if (!acc) return '';
    const base = acc.subType ? `${acc.subType} ${acc.type}` : acc.type;
    return `${base} •••• ${acc.accountNumber.slice(-4)}`;
  };

  const cards = await Card.create([
    // Debit card linked to Checking
    {
      userId: user._id,
      cardName: 'Emily Platinum Debit',
      type: 'Debit',
      fullNumber: '4532890123454821',
      cvv: '482',
      expiryMonth: '12',
      expiryYear: '2027',
      cardholderName: 'Emily Davis',
      linkedAccountId: checking._id,
      linkedAccountType: 'Checking',
      linkedAccountLabel: accountLabel(checking),
      status: 'Active',
      controls: {
        locked: false,
        contactless: true,
        onlinePurchases: true,
        internationalPurchases: true,
        atmWithdrawals: true,
        notifications: true,
      },
      activity: [
        { company: 'Amazon',    description: 'Shopping',  amount: -84.21, date: daysAgo(3) },
        { company: 'Shell',     description: 'Gas',       amount: -52.40, date: daysAgo(5) },
        { company: 'Starbucks', description: 'Food',      amount: -8.50,  date: daysAgo(7) },
      ],
    },

    // Credit card
    {
      userId: user._id,
      cardName: 'Emily Rewards Credit',
      type: 'Credit',
      fullNumber: '5512987612342208',
      cvv: '904',
      expiryMonth: '05',
      expiryYear: '2028',
      cardholderName: 'Emily Davis',
      linkedAccountId: checking._id,
      linkedAccountType: 'Checking',
      linkedAccountLabel: accountLabel(checking),
      status: 'Active',
      balance: -1240.50,
      availableCredit: 9500,
      creditLimit: 10740.50,
      minimumPayment: 35,
      paymentDueDate: new Date(today.getFullYear(), today.getMonth() + 1, 15),
      nextStatementDate: new Date(today.getFullYear(), today.getMonth() + 1, 1),
      controls: {
        locked: false,
        contactless: true,
        onlinePurchases: true,
        internationalPurchases: false,
        atmWithdrawals: false,
        notifications: true,
      },
      activity: [
        { company: 'Target',   description: 'Shopping',  amount: -132.75, date: daysAgo(2) },
        { company: 'Uber Eats', description: 'Food',     amount: -32.50,  date: daysAgo(4) },
        { company: 'Netflix',  description: 'Streaming', amount: -15.99,  date: daysAgo(9) },
      ],
    },

    // Debit card linked to Savings, temporarily locked
    {
      userId: user._id,
      cardName: 'Emily Savings Debit',
      type: 'Debit',
      fullNumber: '4021123498769134',
      cvv: '331',
      expiryMonth: '09',
      expiryYear: '2026',
      cardholderName: 'Emily Davis',
      linkedAccountId: savings?._id || null,
      linkedAccountType: savings?.type || 'Savings',
      linkedAccountLabel: accountLabel(savings),
      status: 'Temporary Locked',
      controls: {
        locked: true,
        contactless: false,
        onlinePurchases: false,
        internationalPurchases: false,
        atmWithdrawals: true,
        notifications: false,
      },
      activity: [],
    },
  ]);

  console.log(`✅ Created ${cards.length} cards for Emily:`);
  cards.forEach((c) => {
    console.log(`   • ${c.cardName} (${c.type}) — •••• ${c.fullNumber.slice(-4)} — ${c.status}`);
  });

  console.log('\n🎉 Seed complete');
  process.exit();
};

run();