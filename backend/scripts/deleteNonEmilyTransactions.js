// scripts/deleteNonEmilyTransactions.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connected\n');

  // 1. Find Emily
  const emily = await User.findOne({ username: 'emilydavis' }).select('_id firstName lastName').lean();
  if (!emily) {
    console.error('❌ Emily not found');
    process.exit(1);
  }
  console.log(`🎯 Target user: ${emily.firstName} ${emily.lastName} (${emily._id})\n`);

  // 2. Count before
  const beforeTotal = await Transaction.countDocuments({});
  const beforeEmily = await Transaction.countDocuments({ userId: emily._id });
  const beforeOther = beforeTotal - beforeEmily;

  console.log('── Before ──');
  console.log(`  Total in DB           : ${beforeTotal}`);
  console.log(`  Emily's               : ${beforeEmily}`);
  console.log(`  Not Emily's           : ${beforeOther}\n`);

  if (beforeOther === 0) {
    console.log('✨ Nothing to delete — DB already contains only Emily\'s transactions');
    process.exit();
  }

  // 3. Show a sample of what will be deleted
  const sample = await Transaction.find({ userId: { $ne: emily._id } })
    .select('userId description date amount type')
    .limit(5)
    .lean();

  console.log('── Sample of what will be deleted ──');
  sample.forEach((tx) => {
    const d = new Date(tx.date).toISOString().slice(0, 10);
    console.log(`  ${d}  [user ${String(tx.userId).slice(-8)}]  ${tx.description}  ($${tx.amount})`);
  });
  if (beforeOther > 5) console.log(`  ... +${beforeOther - 5} more\n`);
  else console.log('');

  // 4. Delete
  const result = await Transaction.deleteMany({ userId: { $ne: emily._id } });
  console.log(`🧹 Deleted ${result.deletedCount} transactions not belonging to Emily\n`);

  // 5. Verify
  const afterTotal = await Transaction.countDocuments({});
  const afterEmily = await Transaction.countDocuments({ userId: emily._id });

  console.log('── After ──');
  console.log(`  Total in DB           : ${afterTotal}`);
  console.log(`  Emily's               : ${afterEmily}`);
  console.log(`  Not Emily's           : ${afterTotal - afterEmily}`);

  process.exit();
};

run();