// scripts/seedPayments.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

import User from '../models/User.js';
import Account from '../models/Account.js';
import Payee from '../models/Payee.js';
import Payment from '../models/Payment.js';
import Autopay from '../models/Autopay.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connected\n');

  const user = await User.findOne({ username: 'emilydavis' });
  if (!user) { console.error('❌ Emily not found'); process.exit(1); }

  const checking = await Account.findOne({ userId: user._id, type: 'Checking' });
  if (!checking) { console.error('❌ Checking not found'); process.exit(1); }

  await Payee.deleteMany({ userId: user._id });
  await Payment.deleteMany({ userId: user._id });
  await Autopay.deleteMany({ userId: user._id });
  console.log('🧹 Cleared old payments data\n');

  const payees = await Payee.create([
    { userId: user._id, name: 'Electric Company',  category: 'Utilities',    accountNumber: '4821' },
    { userId: user._id, name: 'Water & Sewer',     category: 'Utilities',    accountNumber: '9134' },
    { userId: user._id, name: 'Visa Credit Card',  category: 'Credit Card',  accountNumber: '2208' },
    { userId: user._id, name: 'Auto Loan',         category: 'Loan',         accountNumber: '7710' },
    { userId: user._id, name: 'Netflix',           category: 'Subscription' },
    { userId: user._id, name: 'Spotify',           category: 'Subscription' },
  ]);
  const p = Object.fromEntries(payees.map((x) => [x.name, x]));
  console.log(`✅ Created ${payees.length} payees`);

  const accountMeta = {
    fromAccountId: checking._id,
    fromAccountName: 'Checking',
    fromLastFour: checking.accountNumber.slice(-4),
  };

  const today = new Date();
  const inDays = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return d; };
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const dayOfMonth = (n) => { const d = new Date(monthStart); d.setDate(d.getDate() + n); return d; };

  // Upcoming
  await Payment.create([
    { userId: user._id, payeeId: p['Electric Company']._id, payeeName: 'Electric Company', ...accountMeta, amount: 124.50, date: inDays(3),  status: 'Scheduled' },
    { userId: user._id, payeeId: p['Water & Sewer']._id,    payeeName: 'Water & Sewer',    ...accountMeta, amount: 85.20,  date: inDays(6),  status: 'Scheduled' },
    { userId: user._id, payeeId: p['Visa Credit Card']._id, payeeName: 'Visa Credit Card', ...accountMeta, amount: 420.00, date: inDays(12), status: 'Scheduled' },
    { userId: user._id, payeeId: p['Auto Loan']._id,        payeeName: 'Auto Loan',        ...accountMeta, amount: 540.00, date: inDays(18), status: 'Scheduled' },
  ]);
  console.log('✅ Created 4 upcoming payments');

  // History this month
  await Payment.create([
    { userId: user._id, payeeId: p['Netflix']._id,           payeeName: 'Netflix',           ...accountMeta, amount: 15.99,  date: dayOfMonth(2), status: 'Completed', completedAt: dayOfMonth(2), confirmationNumber: 'PAY-100001' },
    { userId: user._id, payeeId: p['Spotify']._id,           payeeName: 'Spotify',           ...accountMeta, amount: 9.99,   date: dayOfMonth(5), status: 'Completed', completedAt: dayOfMonth(5), confirmationNumber: 'PAY-100002' },
    { userId: user._id, payeeId: p['Electric Company']._id,  payeeName: 'Electric Company',  ...accountMeta, amount: 118.20, date: dayOfMonth(8), status: 'Completed', completedAt: dayOfMonth(8), confirmationNumber: 'PAY-100003' },
  ]);
  console.log('✅ Created 3 completed payments');

  // Autopay
  await Autopay.create([
    { userId: user._id, payeeId: p['Netflix']._id,   payeeName: 'Netflix',   ...accountMeta, nextAmount: 15.99,  frequency: 'Monthly', nextDate: inDays(28), enabled: true  },
    { userId: user._id, payeeId: p['Spotify']._id,   payeeName: 'Spotify',   ...accountMeta, nextAmount: 9.99,   frequency: 'Monthly', nextDate: inDays(25), enabled: true  },
    { userId: user._id, payeeId: p['Auto Loan']._id, payeeName: 'Auto Loan', ...accountMeta, nextAmount: 540.00, frequency: 'Monthly', nextDate: inDays(18), enabled: false },
  ]);
  console.log('✅ Created 3 autopay configs');

  console.log('\n🎉 Payments seed complete');
  process.exit();
};

run();