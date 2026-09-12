// scripts/fixTransferDocs.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

import User from '../models/User.js';
import Account from '../models/Account.js';
import Transfer from '../models/Transfer.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB');

    const user = await User.findOne({ username: 'emilydavis' });
    if (!user) { console.error('❌ Emily not found'); process.exit(1); }

    const checking = await Account.findOne({ userId: user._id, type: 'Checking' });
    const savings  = await Account.findOne({
      userId: user._id,
      type: 'Savings',
      subType: 'Standard',
    });
    if (!checking || !savings) {
      console.error('❌ Accounts not found');
      process.exit(1);
    }

    // ── Show what's currently there ─────────────────────────
    console.log('\n─── Current Transfer docs for Emily ───');
    const existing = await Transfer.find({ userId: user._id }).lean();
    existing.forEach((t) => {
      console.log(
        `  ${t.type.padEnd(10)} | $${String(t.amount).padEnd(6)} | ` +
        `to="${t.toAccountName}" | recipient="${t.recipient?.fullName || ''}" | ${t.status}`
      );
    });

    // ── Wipe and recreate cleanly ──────────────────────────
    console.log('\n─── Replacing Transfer docs ───');
    await Transfer.deleteMany({ userId: user._id });
    console.log('  🧹 Removed old transfer docs');

    // 1. Internal — Checking → Standard Savings, $500, Completed
    await Transfer.create({
      userId: user._id,
      transactionNumber: 'TRX-482193',
      type: 'internal',
      fromAccountId: checking._id,
      fromAccountName: 'Checking',
      fromLastFour: checking.accountNumber.slice(-4),
      toAccountId: savings._id,
      toAccountName: 'Standard Savings',
      toLastFour: savings.accountNumber.slice(-4),
      amount: 500.00,
      wireFee: 0,
      totalDebit: 500.00,
      transferDate: new Date('2026-09-08'),
      frequency: 'One time',
      expectedArrival: 'Immediately',
      memo: 'Transfer to savings',
      senderName: 'Emily Davis',
      status: 'Completed',
      completedAt: new Date('2026-09-08'),
    });
    console.log('  ✅ Internal: Checking → Standard Savings ($500)');

    // 2. External — Checking → Chase Bank, $1,200, Completed
    await Transfer.create({
      userId: user._id,
      transactionNumber: 'TRX-927104',
      type: 'external',
      fromAccountId: checking._id,
      fromAccountName: 'Checking',
      fromLastFour: checking.accountNumber.slice(-4),
      toAccountId: null,
      toAccountName: '',                  // ⬅️ external transfers have no internal "to"
      toLastFour: '',
      recipient: {
        fullName: 'John Anderson',
        bankName: 'Chase Bank',           // ⬅️ this is what renders on the right side
        routingNumber: '021000021',
        accountNumber: '1234567890',
        accountType: 'checking',
        bankAddress: '',
      },
      amount: 1200.00,
      wireFee: 0,
      totalDebit: 1200.00,
      transferDate: new Date('2026-09-08'),
      frequency: 'One time',
      expectedArrival: '1–3 business days',
      memo: '',
      senderName: 'Emily Davis',
      status: 'Completed',
      completedAt: new Date('2026-09-08'),
    });
    console.log('  ✅ External: Checking → Chase Bank ($1,200)');

    console.log('\n🎉 Transfer docs replaced');
    process.exit();
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
};

run();