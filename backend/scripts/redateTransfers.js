// scripts/redateTransfers.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Map description snippet → desired date
const DATES = {
  'Transfer to Standard Savings':    '2026-09-03',
  'Transfer from Checking':          '2026-09-03',
  'Transfer to High Yield Savings':  '2026-09-05',
  'Transfer from Standard Savings':  '2026-09-05',
  'Transfer to Checking':            '2026-09-09',
  'Transfer from High Yield Savings':'2026-09-09',
};

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  const user = await User.findOne({ username: 'emilydavis' });
  if (!user) { console.error('❌ Emily not found'); process.exit(1); }

  for (const [snippet, dateStr] of Object.entries(DATES)) {
    const res = await Transaction.updateMany(
      {
        userId: user._id,
        description: { $regex: snippet, $options: 'i' },
      },
      { $set: { date: new Date(dateStr) } }
    );
    console.log(`✅ ${snippet.padEnd(35)} → ${dateStr} (${res.modifiedCount} rows)`);
  }

  process.exit();
};

run();