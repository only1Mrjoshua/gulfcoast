// scripts/backfillCardTransactions.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import Card from '../models/Card.js';
import Transaction from '../models/Transaction.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connected\n');

  const cards = await Card.find({});
  let created = 0;
  let skipped = 0;

  for (const card of cards) {
    if (!card.linkedAccountId) {
      console.log(`⏭️  Skipping ${card.cardName} — no linked account`);
      continue;
    }

    for (const activity of card.activity) {
      if (activity.transactionId) {
        skipped++;
        continue;
      }

      const isNegative = (activity.amount || 0) < 0;
      const parts = [activity.company, activity.description].filter(Boolean);
      const description = parts.length > 0 ? parts.join(' - ') : 'Card Activity';
      const last4 = card.fullNumber ? card.fullNumber.slice(-4) : '••••';

      const tx = await Transaction.create({
        userId: card.userId,
        accountId: card.linkedAccountId,
        description,
        amount: activity.amount,
        type: isNegative ? 'purchase' : 'credit',
        status: 'Completed',
        date: activity.date || new Date(),
        category: activity.description || 'Card Activity',
        merchant: activity.company || '',
        paymentMethod: `${card.type} Card •••• ${last4}`,
      });

      activity.transactionId = tx._id;
      created++;
    }

    await card.save();
  }

  console.log(`\n🎉 Created ${created} transactions, skipped ${skipped} (already linked)`);
  process.exit();
};

run();