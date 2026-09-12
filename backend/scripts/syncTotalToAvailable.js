// scripts/syncTotalToAvailable.js
//
// One-time migration: sets totalBalance = availableBalance for every
// deposit account (Checking + Savings). Credit cards are left alone —
// they keep their negative balance representing what the user owes.
//
// Run this once after removing the pending balance from the UI.

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import Account from '../models/Account.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connected\n');

  const accounts = await Account.find({});
  console.log(`Found ${accounts.length} accounts in the database\n`);

  let updated = 0;
  let unchanged = 0;
  let skippedCredit = 0;

  console.log('── Processing ──');

  for (const acc of accounts) {
    const type = (acc.type || '').toLowerCase();
    const last4 = acc.accountNumber ? acc.accountNumber.slice(-4) : '••••';

    // Credit cards keep their negative balance
    if (type === 'credit') {
      skippedCredit++;
      console.log(
        `⏭️  ${acc.type.padEnd(10)} •••• ${last4}  ` +
        `(credit card — left untouched, balance: ${acc.totalBalance})`
      );
      continue;
    }

    // Deposit accounts: force totalBalance = availableBalance
    const oldTotal = acc.totalBalance;
    const newTotal = acc.availableBalance;

    if (oldTotal !== newTotal) {
      acc.totalBalance = newTotal;
      acc.pendingBalance = 0;
      await acc.save();
      updated++;
      console.log(
        `✏️  ${acc.type.padEnd(10)} •••• ${last4}  ` +
        `total: ${oldTotal} → ${newTotal}`
      );
    } else {
      unchanged++;
      console.log(
        `✓  ${acc.type.padEnd(10)} •••• ${last4}  ` +
        `already correct (${newTotal})`
      );
    }
  }

  console.log('\n── Summary ──');
  console.log(`  Updated       : ${updated}`);
  console.log(`  Unchanged     : ${unchanged}`);
  console.log(`  Credit skipped: ${skippedCredit}`);

  console.log('\n🎉 Migration complete');
  process.exit();
};

run();