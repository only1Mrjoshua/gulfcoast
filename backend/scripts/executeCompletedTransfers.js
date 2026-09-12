// scripts/executeCompletedTransfers.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

import Transfer from '../models/Transfer.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

// A transfer is "unexecuted" if it's Completed but has no completedAt OR
// has no matching Transaction yet. We use a marker: any transfer Completed
// via the admin controller has a `completedAt` date AND matching transactions.
// Transfers marked Completed manually in Compass will have completedAt=null.

const executeTransfer = async (transfer) => {
  // ── 1. Load source account ────────────────────────────────
  const from = await Account.findById(transfer.fromAccountId);
  if (!from) throw new Error('Source account not found');

  // ── 2. Insufficient funds check ───────────────────────────
  if (from.availableBalance < transfer.totalDebit) {
    console.log(`   ⚠️  Insufficient funds — skipping`);
    await Transfer.findByIdAndUpdate(transfer._id, {
      status: 'Failed',
      failedAt: new Date(),
      adminNote: 'Auto-failed: insufficient funds',
    });
    return;
  }

  // ── 3. DEBIT source ──────────────────────────────────────
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

  // ── 4. CREDIT destination (internal / recurring only) ────
  if (transfer.type === 'internal' || transfer.type === 'recurring') {
    const to = await Account.findById(transfer.toAccountId);
    if (!to) throw new Error('Destination account not found');

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

  // ── 5. Mark as properly executed ─────────────────────────
  await Transfer.findByIdAndUpdate(transfer._id, {
    completedAt: new Date(),
  });
};

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connected\n');

  // Find transfers that are Completed but never executed
  const targets = await Transfer.find({
    status: 'Completed',
    completedAt: null,           // ← marker for "not executed yet"
  });

  if (targets.length === 0) {
    console.log('✨ No unexecuted transfers found');
    process.exit();
  }

  console.log(`Found ${targets.length} unexecuted transfer(s)\n`);

  for (const t of targets) {
    console.log(`▶ ${t.type.toUpperCase()} ${t.transactionNumber} — $${t.amount}`);
    try {
      await executeTransfer(t);
      console.log(`   ✅ Executed\n`);
    } catch (err) {
      console.log(`   ❌ ${err.message}\n`);
    }
  }

  console.log('🎉 Done');
  process.exit();
};

run();