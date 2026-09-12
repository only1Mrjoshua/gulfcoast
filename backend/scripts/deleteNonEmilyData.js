// scripts/deleteNonEmilyData.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Account from '../models/Account.js';
import Transfer from '../models/Transfer.js';
import Deposit from '../models/Deposit.js';
import Payment from '../models/Payment.js';
import Autopay from '../models/Autopay.js';
import Payee from '../models/Payee.js';
import Report from '../models/Report.js';
import Card from '../models/Card.js';
import Notification from '../models/Notification.js';
import Goal from '../models/Goal.js';
import Loan from '../models/Loan.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Every model here stores docs keyed by `userId`
const MODELS = [
  { name: 'Transaction',  model: Transaction },
  { name: 'Account',      model: Account },
  { name: 'Transfer',     model: Transfer },
  { name: 'Deposit',      model: Deposit },
  { name: 'Payment',      model: Payment },
  { name: 'Autopay',      model: Autopay },
  { name: 'Payee',        model: Payee },
  { name: 'Report',       model: Report },
  { name: 'Card',         model: Card },
  { name: 'Notification', model: Notification },
  { name: 'Goal',         model: Goal },
  { name: 'Loan',         model: Loan },
];

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
  console.log(`🎯 Keeping only data for: ${emily.firstName} ${emily.lastName} (${emily._id})\n`);

  console.log('── Collection scan ──');
  console.log(
    '  ' +
    'COLLECTION'.padEnd(18) +
    'BEFORE'.padEnd(10) +
    'EMILY'.padEnd(10) +
    'DELETE'
  );
  console.log('  ' + '─'.repeat(48));

  const results = [];

  for (const { name, model } of MODELS) {
    try {
      const before = await model.countDocuments({});
      const emilyCount = await model.countDocuments({ userId: emily._id });
      const willDelete = before - emilyCount;

      console.log(
        '  ' +
        name.padEnd(18) +
        String(before).padEnd(10) +
        String(emilyCount).padEnd(10) +
        (willDelete > 0 ? willDelete : '—')
      );

      results.push({ name, model, before, emilyCount, willDelete });
    } catch (err) {
      console.log(`  ${name.padEnd(18)} (skipped — ${err.message})`);
    }
  }

  console.log('\nDeleting non-Emily data from each collection...\n');

  let totalDeleted = 0;
  for (const r of results) {
    if (r.willDelete <= 0) continue;
    const res = await r.model.deleteMany({ userId: { $ne: emily._id } });
    console.log(`  🧹 ${r.name.padEnd(18)} deleted ${res.deletedCount}`);
    totalDeleted += res.deletedCount;
  }

  // Also delete users other than Emily? Uncomment if you want that.
  // const userRes = await User.deleteMany({ _id: { $ne: emily._id } });
  // console.log(`  🧹 User                deleted ${userRes.deletedCount}`);

  console.log(`\n🎉 Done — ${totalDeleted} total documents removed across all collections`);

  // Final verification
  console.log('\n── After ──');
  for (const { name, model } of MODELS) {
    const emilyCount = await model.countDocuments({ userId: emily._id });
    const otherCount = await model.countDocuments({ userId: { $ne: emily._id } });
    console.log(
      `  ${name.padEnd(18)} emily: ${String(emilyCount).padEnd(5)}  other: ${otherCount}`
    );
  }

  process.exit();
};

run();