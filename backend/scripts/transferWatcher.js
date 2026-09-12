// scripts/transferWatcher.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

import Transfer from '../models/Transfer.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const executeTransfer = async (transfer) => {
  const from = await Account.findById(transfer.fromAccountId);
  if (!from) throw new Error('Source not found');

  if (from.availableBalance < transfer.totalDebit) {
    await Transfer.findByIdAndUpdate(transfer._id, {
      status: 'Failed',
      failedAt: new Date(),
      adminNote: 'Auto-failed: insufficient funds',
    });
    return 'failed';
  }

  from.totalBalance     -= transfer.totalDebit;
  from.availableBalance -= transfer.totalDebit;
  await from.save();

  const debitDesc =
    transfer.type === 'internal' || transfer.type === 'recurring'
      ? `Transfer to ${transfer.toAccountName} •••• ${transfer.toLastFour}`
      : transfer.type === 'wire'
      ? `Wire to ${transfer.recipient?.fullName || 'Recipient'}`
      : `ACH to ${transfer.recipient?.fullName || 'Recipient'}`;

  await Transaction.create({
    userId: transfer.userId,
    accountId: from._id,
    description: debitDesc,
    amount: -Math.abs(transfer.totalDebit),
    type: 'debit',
    status: 'Completed',
    date: transfer.transferDate || new Date(),
  });

  if (transfer.type === 'internal' || transfer.type === 'recurring') {
    const to = await Account.findById(transfer.toAccountId);
    if (!to) throw new Error('Destination not found');

    to.totalBalance     += transfer.amount;
    to.availableBalance += transfer.amount;
    await to.save();

    await Transaction.create({
      userId: transfer.userId,
      accountId: to._id,
      description: `Transfer from ${transfer.fromAccountName} •••• ${transfer.fromLastFour}`,
      amount: Math.abs(transfer.amount),
      type: 'credit',
      status: 'Completed',
      date: transfer.transferDate || new Date(),
    });
  }

  await Transfer.findByIdAndUpdate(transfer._id, {
    completedAt: new Date(),
  });
  return 'success';
};

const start = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Watching transfers...\n');

  const stream = Transfer.watch(
    [{ $match: { 'updateDescription.updatedFields.status': 'Completed' } }],
    { fullDocument: 'updateLookup' }
  );

  stream.on('change', async (change) => {
    const t = change.fullDocument;
    if (t.completedAt) return; // already executed

    console.log(`🔔 ${t.transactionNumber} → Completed`);
    try {
      const result = await executeTransfer(t);
      console.log(`   ${result === 'success' ? '✅ Money moved' : '⚠️  Failed'}\n`);
    } catch (err) {
      console.error(`   ❌ ${err.message}\n`);
    }
  });
};

start();