// scripts/debugNonCompleted.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Transfer from '../models/Transfer.js';
import Deposit from '../models/Deposit.js';
import Payment from '../models/Payment.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connected\n');

  const emily = await User.findOne({ username: 'emilydavis' })
    .select('_id firstName lastName')
    .lean();
  if (!emily) { console.error('❌ Emily not found'); process.exit(1); }

  // All non-completed transactions
  const nonCompleted = await Transaction.find({
    userId: emily._id,
    status: { $ne: 'Completed' },
  })
    .select('description date status type amount')
    .sort({ date: -1 })
    .lean();

  console.log(`── Non-Completed transactions in \`Transaction\` collection ──`);
  console.log(`  Count: ${nonCompleted.length}\n`);

  if (nonCompleted.length === 0) {
    console.log('  (none — nothing to clean)\n');
  } else {
    console.log(
      '  ' +
      'DATE'.padEnd(12) +
      'STATUS'.padEnd(12) +
      'TYPE'.padEnd(10) +
      'AMOUNT'.padEnd(12) +
      'MATCH?'.padEnd(10) +
      'DESCRIPTION'
    );
    console.log('  ' + '─'.repeat(90));

    for (const tx of nonCompleted) {
      const d = new Date(tx.date).toISOString().slice(0, 10);

      // Try to find a matching real record in the proper collection
      let match = null;

      if (tx.type === 'transfer') {
        match = await Transfer.findOne({
          userId: emily._id,
          amount: Math.abs(tx.amount),
        }).lean();
      } else if (tx.type === 'deposit') {
        match = await Deposit.findOne({
          userId: emily._id,
          amount: Math.abs(tx.amount),
        }).lean();
      } else if (tx.type === 'payment') {
        match = await Payment.findOne({
          userId: emily._id,
          amount: Math.abs(tx.amount),
        }).lean();
      }

      console.log(
        '  ' +
        d.padEnd(12) +
        (tx.status || '').padEnd(12) +
        (tx.type || '').padEnd(10) +
        `$${String(tx.amount).padEnd(11)}` +
        (match ? '✅ yes' : '❌ ghost').padEnd(10) +
        tx.description
      );
    }
  }

  // Also show what real records exist in each collection
  console.log('\n── Real records in dedicated collections ──');
  const transfers = await Transfer.countDocuments({ userId: emily._id });
  const deposits  = await Deposit.countDocuments({ userId: emily._id });
  const payments  = await Payment.countDocuments({ userId: emily._id });
  console.log(`  transfers collection   : ${transfers}`);
  console.log(`  deposits  collection   : ${deposits}`);
  console.log(`  payments  collection   : ${payments}`);

  process.exit();
};

run();