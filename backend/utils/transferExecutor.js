// utils/transferExecutor.js
import mongoose from 'mongoose';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import Transfer from '../models/Transfer.js';

export async function executeTransfer(transferId) {
  const session = await mongoose.startSession();
  let result;

  try {
    await session.withTransaction(async () => {
      const transfer = await Transfer.findById(transferId).session(session);
      if (!transfer) throw new Error('Transfer not found');

      if (transfer.status === 'Completed') {
        result = { alreadyDone: true, transfer };
        return;
      }

      const from = await Account.findById(transfer.fromAccountId).session(session);
      if (!from) throw new Error('Source account not found');

      if (from.availableBalance < transfer.totalDebit) {
        transfer.status = 'Failed';
        transfer.failedAt = new Date();
        transfer.adminNote = (transfer.adminNote || '') +
          ` | Auto-failed: insufficient funds ($${from.availableBalance.toFixed(2)} available)`;
        await transfer.save({ session });
        result = { failed: true, reason: 'insufficient_funds', transfer };
        return;
      }

      // ── 1. DEBIT source ─────────────────────────────────────
      from.totalBalance     -= transfer.totalDebit;
      from.availableBalance -= transfer.totalDebit;
      await from.save({ session });

      await Transaction.create([{
        userId: transfer.userId,
        accountId: from._id,
        description: buildDebitDescription(transfer),
        // ⬇️ NEGATIVE = money left this account
        amount: -Math.abs(transfer.totalDebit),
        type: 'debit',
        status: 'Completed',
        date: new Date(),
      }], { session });

      // ── 2. CREDIT destination (internal / recurring only) ───
      if (transfer.type === 'internal' || transfer.type === 'recurring') {
        if (!transfer.toAccountId) throw new Error('Destination account missing');

        const to = await Account.findById(transfer.toAccountId).session(session);
        if (!to) throw new Error('Destination account not found');

        to.totalBalance     += transfer.amount;
        to.availableBalance += transfer.amount;
        await to.save({ session });

        await Transaction.create([{
          userId: transfer.userId,
          accountId: to._id,
          description: buildCreditDescription(transfer),
          // ⬇️ POSITIVE = money entered this account
          amount: Math.abs(transfer.amount),
          type: 'credit',
          status: 'Completed',
          date: new Date(),
        }], { session });
      }

      transfer.status = 'Completed';
      transfer.completedAt = new Date();
      await transfer.save({ session });

      result = { success: true, transfer };
    });

    return result;
  } finally {
    await session.endSession();
  }
}

function buildDebitDescription(t) {
  if (t.type === 'internal' || t.type === 'recurring') {
    return `Transfer to ${t.toAccountName} •••• ${t.toLastFour}`;
  }
  if (t.type === 'wire') {
    return `Wire to ${t.recipient?.fullName || 'Recipient'}`;
  }
  return `ACH to ${t.recipient?.fullName || 'Recipient'}`;
}

function buildCreditDescription(t) {
  return `Transfer from ${t.fromAccountName} •••• ${t.fromLastFour}`;
}