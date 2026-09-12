// scripts/inspectBalances.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from '../models/User.js';
import Account from '../models/Account.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  const user = await User.findOne({ username: 'emilydavis' });
  const accounts = await Account.find({ userId: user._id }).lean();

  let totalDeposits = 0;
  let availableDeposits = 0;

  console.log('\n── Account balances ──');
  accounts.forEach((a) => {
    const isCredit = (a.type || '').toLowerCase() === 'credit';
    console.log(
      `${a.type.padEnd(10)} ${a.subType || ''.padEnd(10)} •••• ${a.accountNumber?.slice(-4)}  ` +
      `total: ${String(a.totalBalance).padStart(12)}  ` +
      `avail: ${String(a.availableBalance).padStart(12)}  ` +
      `${isCredit ? '(excluded from tiles)' : ''}`
    );
    if (!isCredit) {
      totalDeposits += a.totalBalance || 0;
      availableDeposits += a.availableBalance || 0;
    }
  });

  console.log('\n── Should show on Home/Accounts tiles ──');
  console.log(`Total:     $${totalDeposits.toFixed(2)}`);
  console.log(`Available: $${availableDeposits.toFixed(2)}`);
  console.log(`Pending:   $${Math.max(0, totalDeposits - availableDeposits).toFixed(2)}`);

  process.exit();
};

run();