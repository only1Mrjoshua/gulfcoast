// scripts/debugEmilyTransactions.js
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
  if (!emily) {
    console.error('❌ Emily not found');
    process.exit(1);
  }

  const now = new Date();
  console.log(`🎯 Emily: ${emily.firstName} ${emily.lastName}`);
  console.log(`📅 Now:   ${now.toISOString()}\n`);

  // ============================================================
  // 1. Count check
  // ============================================================
  const total   = await Transaction.countDocuments({ userId: emily._id });
  const past    = await Transaction.countDocuments({ userId: emily._id, date: { $lte: now } });
  const future  = await Transaction.countDocuments({ userId: emily._id, date: { $gt: now } });

  console.log('── Counts ──');
  console.log(`  Total Emily owns       : ${total}`);
  console.log(`  Past/today (shown)     : ${past}`);
  console.log(`  Future (hidden)        : ${future}`);

  // Also break down by status to catch any non-future oddities
  const statuses = await Transaction.aggregate([
    { $match: { userId: emily._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  console.log('\n── By status ──');
  statuses.forEach((s) => console.log(`  ${(s._id || 'null').padEnd(12)} ${s.count}`));

  // And by type
  const types = await Transaction.aggregate([
    { $match: { userId: emily._id } },
    { $group: { _id: '$type', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  console.log('\n── By type ──');
  types.forEach((t) => console.log(`  ${(t._id || 'null').padEnd(12)} ${t.count}`));

  // ============================================================
  // 2. What's actually being hidden
  // ============================================================
  const hidden = await Transaction.find({
    userId: emily._id,
    date: { $gt: now },
  })
    .select('description date status type amount')
    .sort({ date: 1 })
    .lean();

  console.log('\n── ❌ Hidden from Transactions page (future-dated) ──');
  if (hidden.length === 0) {
    console.log('  (none — every transaction has a past date)');
  } else {
    hidden.forEach((tx) => {
      const d = new Date(tx.date).toISOString().slice(0, 10);
      console.log(
        `  ${d}  ${(tx.status || '').padEnd(10)}  ` +
        `${(tx.type || '').padEnd(10)}  $${String(tx.amount).padEnd(8)}  ${tx.description}`
      );
    });
  }

  // ============================================================
  // 3. What's being shown
  // ============================================================
  const shown = await Transaction.find({
    userId: emily._id,
    date: { $lte: now },
  })
    .select('description date status type amount')
    .sort({ date: -1 })
    .lean();

  console.log('\n── ✅ Shown on Transactions page (past/today) ──');
  shown.forEach((tx, i) => {
    const d = new Date(tx.date).toISOString().slice(0, 10);
    console.log(
      `  ${String(i + 1).padStart(2)}. ${d}  ` +
      `${(tx.status || '').padEnd(10)}  ` +
      `${(tx.type || '').padEnd(10)}  ` +
      `$${String(tx.amount).padEnd(10)}  ${tx.description}`
    );
  });

  // ============================================================
  // 4. Sanity check — any null dates?
  // ============================================================
  const nullDates = await Transaction.countDocuments({
    userId: emily._id,
    date: null,
  });
  if (nullDates > 0) {
    console.log(`\n⚠️  ${nullDates} transaction(s) have a null date — they'd be excluded from every query.`);
  }

  // ============================================================
  // 5. Sanity check — any malformed dates?
  // ============================================================
  const oddDates = await Transaction.find({
    userId: emily._id,
    $or: [
      { date: { $type: 'string' } },
      { date: { $type: 'int' } },
    ],
  })
    .select('description date')
    .lean();

  if (oddDates.length > 0) {
    console.log(`\n⚠️  ${oddDates.length} transaction(s) have a malformed date value:`);
    oddDates.forEach((tx) => {
      console.log(`  ${tx.description} → ${tx.date} (${typeof tx.date})`);
    });
  }

  console.log('\n🎉 Diagnostic complete');
  process.exit();
};

run();