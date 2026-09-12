// scripts/seedEmilyLoan.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from '../models/User.js';
import Account from '../models/Account.js';
import Loan from '../models/Loan.js';
import LoanPayment from '../models/LoanPayment.js';
import Transaction from '../models/Transaction.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const money = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    n ?? 0
  );

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connected\n');

  // ── Resolve Emily ───────────────────────────────────────
  const emily = await User.findOne({ username: 'emilydavis' })
    .select('_id firstName lastName')
    .lean();
  if (!emily) {
    console.error('❌ User "emilydavis" not found');
    process.exit(1);
  }
  console.log(`🎯 User: ${emily.firstName} ${emily.lastName} (${emily._id})\n`);

  // ── Resolve her Checking account (used as payment method) ─
  const checking = await Account.findOne({ userId: emily._id, type: 'Checking' })
    .select('_id accountNumber')
    .lean();
  const checkingLast4 = checking?.accountNumber
    ? String(checking.accountNumber).slice(-4)
    : '';
  const paymentMethod = checking
    ? `Checking •••• ${checkingLast4}`
    : 'Checking';
  console.log(`💳 Payment method: ${paymentMethod}\n`);

  // ── Clean up existing data for a fresh run ──────────────
  const existingLoans = await Loan.find({ userId: emily._id }).select('_id').lean();
  const existingIds = existingLoans.map((l) => l._id);

  if (existingIds.length > 0) {
    await LoanPayment.deleteMany({ loanId: { $in: existingIds } });
    await Transaction.deleteMany({ loanId: { $in: existingIds } });
    await Loan.deleteMany({ _id: { $in: existingIds } });
    console.log(
      `🧹 Removed ${existingIds.length} prior loan(s) + payments + transactions\n`
    );
  }

  // ── Create the loan ─────────────────────────────────────
  const originalAmount = 32000;
  const interestRate = 5.49;
  const termMonths = 60;
  const monthlyPayment = 612.34;

  // Payment schedule: Dec 2025 → Sep 2026, day 5 of each month.
  // Next payment: Oct 5, 2026. Maturity: nextPayment + (termMonths - 1) months.
  const paymentDates = [
    '2025-12-05',
    '2026-01-05',
    '2026-02-05',
    '2026-03-05',
    '2026-04-05',
    '2026-05-05',
    '2026-06-05',
    '2026-07-05',
    '2026-08-05',
    '2026-09-05',
  ].map((s) => new Date(s + 'T10:00:00Z'));

  const nextPaymentDate = new Date('2026-10-05T10:00:00Z');
  const maturityDate = new Date(nextPaymentDate);
  maturityDate.setMonth(maturityDate.getMonth() + (termMonths - paymentDates.length - 1));

  const loan = await Loan.create({
    userId: emily._id,
    type: 'Auto',
    name: 'Auto Loan — Honda Civic',
    accountNumber: 'LN4821007710',
    originalAmount,
    currentBalance: originalAmount, // corrected below as we amortize
    interestRate,
    monthlyPayment,
    nextPaymentDate,
    maturityDate,
    termMonths,
    monthsRemaining: termMonths - paymentDates.length,
    status: 'Active',
    paymentMethod,
  });

  // ── Amortization schedule — walk through each payment ───
  let balance = originalAmount;
  const ratePerMonth = interestRate / 100 / 12;

  for (const payDate of paymentDates) {
    const interest = Math.round(balance * ratePerMonth * 100) / 100;
    let principal = Math.round((monthlyPayment - interest) * 100) / 100;
    if (principal > balance) principal = balance;
    balance = Math.round((balance - principal) * 100) / 100;

    // 1. Transaction (so it appears on the Transactions page)
    const tx = await Transaction.create({
      userId: emily._id,
      accountId: checking?._id || null,
      loanId: loan._id,
      description: `Loan Payment — ${loan.name}`,
      amount: -monthlyPayment,
      type: 'payment',
      status: 'Completed',
      date: payDate,
    });

    // 2. LoanPayment (drives the Loans page payment history)
    await LoanPayment.create({
      userId: emily._id,
      loanId: loan._id,
      transactionId: tx._id,
      date: payDate,
      amount: monthlyPayment,
      principal,
      interest,
      status: 'Completed',
    });

    console.log(
      `   ${payDate.toISOString().slice(0, 10)}   ` +
      `int=${money(interest)}   prin=${money(principal)}   ` +
      `bal=${money(balance)}`
    );
  }

  // Persist the final balance after 10 payments
  loan.currentBalance = balance;
  await loan.save();

  console.log('\n✅ Loan seeded');
  console.log(`   ID           : ${loan._id}`);
  console.log(`   Name         : ${loan.name}`);
  console.log(`   Loan #       : •••• ${loan.accountNumber.slice(-4)}`);
  console.log(`   Original     : ${money(loan.originalAmount)}`);
  console.log(`   Balance      : ${money(loan.currentBalance)}`);
  console.log(`   Rate         : ${loan.interestRate}%`);
  console.log(`   Monthly      : ${money(loan.monthlyPayment)}`);
  console.log(`   Next payment : ${loan.nextPaymentDate.toISOString().slice(0, 10)}`);
  console.log(`   Maturity     : ${loan.maturityDate.toISOString().slice(0, 10)}`);
  console.log(`   Method       : ${loan.paymentMethod}`);
  console.log(`   Term         : ${loan.termMonths} months (${loan.monthsRemaining} left)`);
  console.log(`   Payments     : ${paymentDates.length} created + matching Transactions`);

  console.log('\n🎉 Done');
  await mongoose.disconnect();
  process.exit();
};

run().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});