// scripts/cleanStaleFutureTransactions.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
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

  const now = new Date();

  // ── 1. Current state ─────────────────────────────
  console.log('── Before ──');

  const txTotal   = await Transaction.countDocuments({ userId: emily._id });
  const txFuture  = await Transaction.countDocuments({ userId: emily._id, date: { $gt: now } });
  const payTotal  = await Payment.countDocuments({ userId: emily._id });
  const payFuture = await Payment.countDocuments({
    userId: emily._id,
    status: { $in: ['Scheduled', 'Pending'] },
    date: { $gte: now },
  });

  console.log(`  Transaction collection  → total: ${txTotal}   future: ${txFuture}`);
  console.log(`  Payment collection      → total: ${payTotal}   upcoming: ${payFuture}`);

  // ── 2. List what we're about to delete ───────────
  const staleTxs = await Transaction.find({
    userId: emily._id,
    date: { $gt: now },
  })
    .select('description date status type amount')
    .sort({ date: 1 })
    .lean();

  if (staleTxs.length === 0) {
    console.log('\n✨ No future-dated transactions found — nothing to clean');
    process.exit();
  }

  console.log('\n── Stale future-dated transactions to delete ──');
  staleTxs.forEach((tx) => {
    const d = new Date(tx.date).toISOString().slice(0, 10);
    console.log(
      `  ${d}  ${(tx.status || '').padEnd(10)}  ` +
      `${(tx.type || '').padEnd(10)}  $${String(tx.amount).padEnd(8)}  ${tx.description}`
    );
  });

  // ── 3. Delete them ────────────────────────────────
  const result = await Transaction.deleteMany({
    userId: emily._id,
    date: { $gt: now },
  });

  console.log(`\n🧹 Deleted ${result.deletedCount} future-dated transactions`);

  // ── 4. After state ────────────────────────────────
  const txTotalAfter   = await Transaction.countDocuments({ userId: emily._id });
  const txPastAfter    = await Transaction.countDocuments({ userId: emily._id, date: { $lte: now } });

  console.log('\n── After ──');
  console.log(`  Transaction collection  → total: ${txTotalAfter}   past: ${txPastAfter}`);
  console.log(`  Payment collection      → total: ${payTotal}   upcoming: ${payFuture}`);

  console.log('\n🎉 Cleanup complete');
  process.exit();
};

run();