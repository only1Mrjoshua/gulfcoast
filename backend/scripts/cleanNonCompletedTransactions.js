// scripts/cleanNonCompletedTransactions.js
// Deletes every Transaction with status != 'Completed'.
// Those belong in their dedicated collections (Payment / Transfer / Deposit).
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

  const emily = await User.findOne({ username: 'emilydavis' })
    .select('_id firstName lastName')
    .lean();
  if (!emily) { console.error('❌ Emily not found'); process.exit(1); }

  // ── Before ─────────────────────────────────────────
  const beforeTotal = await Transaction.countDocuments({ userId: emily._id });
  const beforeCompleted = await Transaction.countDocuments({
    userId: emily._id,
    status: 'Completed',
  });
  const beforeNon = beforeTotal - beforeCompleted;

  console.log('── Before ──');
  console.log(`  Total         : ${beforeTotal}`);
  console.log(`  Completed     : ${beforeCompleted}`);
  console.log(`  Non-completed : ${beforeNon}`);

  if (beforeNon === 0) {
    console.log('\n✨ Nothing to clean');
    process.exit();
  }

  // ── Show what will be deleted ──────────────────────
  const stale = await Transaction.find({
    userId: emily._id,
    status: { $ne: 'Completed' },
  })
    .select('description date status type amount')
    .sort({ date: 1 })
    .lean();

  console.log('\n── Rows to delete ──');
  stale.forEach((tx) => {
    const d = new Date(tx.date).toISOString().slice(0, 10);
    console.log(
      `  ${d}  ${(tx.status || '').padEnd(12)}  ` +
      `${(tx.type || '').padEnd(10)}  ` +
      `$${String(tx.amount).padEnd(10)}  ${tx.description}`
    );
  });

  // ── Delete ─────────────────────────────────────────
  const result = await Transaction.deleteMany({
    userId: emily._id,
    status: { $ne: 'Completed' },
  });

  console.log(`\n🧹 Deleted ${result.deletedCount} non-completed transactions`);

  // ── After ──────────────────────────────────────────
  const afterTotal = await Transaction.countDocuments({ userId: emily._id });
  const afterCompleted = await Transaction.countDocuments({
    userId: emily._id,
    status: 'Completed',
  });

  console.log('\n── After ──');
  console.log(`  Total         : ${afterTotal}`);
  console.log(`  Completed     : ${afterCompleted}`);
  console.log(`  Non-completed : ${afterTotal - afterCompleted}`);

  console.log('\n🎉 Cleanup complete');
  process.exit();
};

run();