// scripts/cleanGhostTransactions.js
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

  const nonCompleted = await Transaction.find({
    userId: emily._id,
    status: { $ne: 'Completed' },
  }).lean();

  console.log(`Found ${nonCompleted.length} non-completed transactions\n`);

  let deleted = 0;
  let kept = 0;

  for (const tx of nonCompleted) {
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

    if (match) {
      console.log(`  ⏭️  KEEP  — ${tx.description} (backed by real record)`);
      kept++;
    } else {
      const res = await Transaction.deleteOne({ _id: tx._id });
      if (res.deletedCount > 0) {
        console.log(`  🧹 DELETE — ${tx.description} (ghost row)`);
        deleted++;
      }
    }
  }

  // After
  const remaining = await Transaction.countDocuments({ userId: emily._id });
  const remainingCompleted = await Transaction.countDocuments({
    userId: emily._id,
    status: 'Completed',
  });
  const remainingOther = remaining - remainingCompleted;

  console.log('\n── After ──');
  console.log(`  Total in transactions     : ${remaining}`);
  console.log(`  Completed                 : ${remainingCompleted}`);
  console.log(`  Still non-completed       : ${remainingOther}`);
  console.log(`\n🎉 Removed ${deleted} ghost rows, kept ${kept} real pending records`);

  process.exit();
};

run();