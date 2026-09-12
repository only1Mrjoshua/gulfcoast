// scripts/diagnoseTransactions.js
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

  // Find mirror pairs: same date + same absolute amount, opposite signs
  const mirrors = new Map();
  txs.forEach((tx) => {
    const key = `${new Date(tx.date).toISOString().slice(0, 10)}|${Math.abs(tx.amount)}`;
    if (!mirrors.has(key)) mirrors.set(key, []);
    mirrors.get(key).push(tx);
  });

  console.log(
    'DATE'.padEnd(12) +
    'ACCOUNT'.padEnd(24) +
    'TYPE'.padEnd(10) +
    'AMOUNT'.padEnd(13) +
    'MIRROR?'.padEnd(10) +
    'DESCRIPTION'
  );
  console.log('─'.repeat(120));

  txs.forEach((tx) => {
    const date = new Date(tx.date).toISOString().slice(0, 10);
    const acct = (accMap[tx.accountId.toString()] || '?').slice(0, 22);
    const amount = (tx.amount >= 0 ? '+' : '') + tx.amount.toFixed(2);

    const key = `${new Date(tx.date).toISOString().slice(0, 10)}|${Math.abs(tx.amount)}`;
    const group = mirrors.get(key) || [];
    const hasMirror = group.length > 1;

    console.log(
      date.padEnd(12) +
      acct.padEnd(24) +
      (tx.type || '').padEnd(10) +
      amount.padEnd(13) +
      (hasMirror ? '✅ yes' : '❌ no').padEnd(10) +
      tx.description
    );
  });

  console.log('\n' + '─'.repeat(120));
  console.log('Legend:');
  console.log('  ✅ yes = another transaction with same date + same |amount| (likely a mirror pair)');
  console.log('  ❌ no  = orphan row (no counterpart)');

  process.exit();
};

run();