// scripts/countTransactions.js
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

  const now = new Date();

  // ── Total across ALL users ────────────────────────
  const grandTotal = await Transaction.countDocuments({});
  const grandPast  = await Transaction.countDocuments({ date: { $lte: now } });
  const grandFuture = await Transaction.countDocuments({ date: { $gt: now } });

  console.log('── Database-wide ──');
  console.log(`  Total transactions     : ${grandTotal}`);
  console.log(`  Past/today (${now.toISOString().slice(0,10)}) : ${grandPast}`);
  console.log(`  Future-dated           : ${grandFuture}`);
  console.log('');

  // ── Per user ──────────────────────────────────────
  const users = await User.find({}).select('username firstName lastName role').lean();

  console.log('── Per user ──');
  for (const u of users) {
    const total  = await Transaction.countDocuments({ userId: u._id });
    const past   = await Transaction.countDocuments({ userId: u._id, date: { $lte: now } });
    const future = await Transaction.countDocuments({ userId: u._id, date: { $gt: now } });

    console.log(
      `  ${u.username.padEnd(15)} (${u.role.padEnd(5)})  →  ` +
      `total: ${String(total).padEnd(4)}  past: ${String(past).padEnd(4)}  future: ${future}`
    );
  }
  console.log('');

  // ── Emily's per-month breakdown ──────────────────
  const emily = await User.findOne({ username: 'emilydavis' });
  if (emily) {
    const txs = await Transaction.find({ userId: emily._id })
      .select('date')
      .lean();

    const byMonth = {};
    txs.forEach((tx) => {
      const d = new Date(tx.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      byMonth[key] = (byMonth[key] || 0) + 1;
    });

    console.log('── Emily — transactions per month ──');
    Object.keys(byMonth).sort().forEach((k) => {
      const isFuture = k > `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      console.log(`  ${k}  →  ${byMonth[k]}${isFuture ? '  (future)' : ''}`);
    });
    console.log('');

    // Future-dated individual transactions
    const futures = await Transaction.find({
      userId: emily._id,
      date: { $gt: now },
    }).select('description date status type amount').sort({ date: 1 }).lean();

    if (futures.length > 0) {
      console.log('── Emily — future-dated (excluded from Transactions page) ──');
      futures.forEach((tx) => {
        console.log(
          `  ${new Date(tx.date).toISOString().slice(0,10)}  ` +
          `${tx.status.padEnd(10)}  ${tx.description}  ($${tx.amount})`
        );
      });
    } else {
      console.log('── Emily — no future-dated transactions ──');
    }
  }

  process.exit();
};

run();