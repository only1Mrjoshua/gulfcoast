// scripts/processAcceptedDeposits.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

import Deposit from '../models/Deposit.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Marker: we consider a deposit "processed" if it has a matching Transaction
// with description mentioning its accountLastFour AND amount, created around
// the same time as processedAt. Simpler alternative: check if a Transaction
// exists with type 'deposit' and matching amount+accountId+date.
const hasMatchingTransaction = async (deposit) => {
  const approx = new Date(deposit.processedAt || deposit.submittedAt);
  const from = new Date(approx.getTime() - 60 * 1000);   // ±1 min
  const to   = new Date(approx.getTime() + 60 * 1000);

  const tx = await Transaction.findOne({
    userId: deposit.userId,
    accountId: deposit.accountId,
    type: 'deposit',
    amount: Math.abs(deposit.amount),
    date: { $gte: from, $lte: to },
  }).lean();

  return !!tx;
};

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connected\n');

  // Look at every Accepted deposit
  const deposits = await Deposit.find({ status: 'Accepted' });
  console.log(`Found ${deposits.length} accepted deposit(s) to verify\n`);

  let processed = 0;
  let skipped = 0;

  for (const deposit of deposits) {
    const already = await hasMatchingTransaction(deposit);
    if (already) {
      console.log(`⏭️  ${deposit.confirmationNumber} — already processed`);
      skipped++;
      continue;
    }

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const account = await Account.findById(deposit.accountId).session(session);
        if (!account) throw new Error('Account not found');

        account.totalBalance     += deposit.amount;
        account.availableBalance += deposit.amount;
        await account.save({ session });

        await Transaction.create(
          [
            {
              userId: deposit.userId,
              accountId: account._id,
              description: `Check Deposit •••• ${deposit.accountLastFour}`,
              amount: Math.abs(deposit.amount),
              type: 'deposit',
              status: 'Completed',
              date: deposit.processedAt || new Date(),
            },
          ],
          { session }
        );

        // Ensure processedAt is set
        if (!deposit.processedAt) {
          deposit.processedAt = new Date();
          await deposit.save({ session });
        }
      });

      console.log(`✅ Processed ${deposit.confirmationNumber} — $${deposit.amount.toFixed(2)} credited`);
      processed++;
    } catch (err) {
      console.error(`❌ Failed for ${deposit.confirmationNumber}:`, err.message);
    } finally {
      await session.endSession();
    }
  }

  console.log(`\n🎉 Done — processed ${processed}, skipped ${skipped}`);
  process.exit();
};

run();