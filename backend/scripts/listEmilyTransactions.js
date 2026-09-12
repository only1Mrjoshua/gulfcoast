// scripts/listEmilyTransactions.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

import User from '../models/User.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connected\n');

  const user = await User.findOne({ username: 'emilydavis' });
  if (!user) { console.error('❌ Emily not found'); process.exit(1); }

  const accounts = await Account.find({ userId: user._id }).lean();
  const accMap = {};
  accounts.forEach((a) => {
    accMap[a._id.toString()] = a.subType ? `${a.subType} ${a.type}` : a.type;
  });

  const txs = await Transaction.find({ userId: user._id })
    .sort({ date: -1, createdAt: -1 })
    .lean();

  console.log(`Total transactions: ${txs.length}\n`);
  console.log(
    'DATE'.padEnd(12) +
    'ACCOUNT'.padEnd(22) +
    'TYPE'.padEnd(10) +
    'AMOUNT'.padEnd(12) +
    'STATUS'.padEnd(12) +
    'DESCRIPTION'
  );
  console.log('─'.repeat(110));

  txs.forEach((tx) => {
    const date = new Date(tx.date).toISOString().slice(0, 10);
    const acct = (accMap[tx.accountId.toString()] || '?').slice(0, 20);
    const amount = (tx.amount >= 0 ? '+' : '') + tx.amount.toFixed(2);
    console.log(
      date.padEnd(12) +
      acct.padEnd(22) +
      (tx.type || '').padEnd(10) +
      amount.padEnd(12) +
      (tx.status || '').padEnd(12) +
      tx.description
    );
  });

  process.exit();
};

run();