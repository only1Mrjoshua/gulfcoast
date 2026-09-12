// scripts/debugGoalLoanReconciliation.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from '../models/User.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import Goal from '../models/Goal.js';
import Loan from '../models/Loan.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const money = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(n ?? 0);

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connected\n');

  const username = process.argv[2] || 'emilydavis';
  const user = await User.findOne({ username })
    .select('_id firstName lastName')
    .lean();

  if (!user) {
    console.error(`❌ User "${username}" not found`);
    process.exit(1);
  }

  console.log(`🎯 User: ${user.firstName} ${user.lastName} (${username})\n`);

  // ─────────────────────────────────────────────────────────
  // 1. ACCOUNTS + HOME BALANCE
  // ─────────────────────────────────────────────────────────
  const accounts = await Account.find({ userId: user._id }).lean();

  console.log('── Accounts ──');
  accounts.forEach((a) => {
    const typeLabel = a.subType ? `${a.type} ${a.subType}` : a.type;
    console.log(
      `  ${String(a._id).slice(-8)}  ${typeLabel.padEnd(20)}  ` +
      `total=${money(a.totalBalance).padEnd(15)}  ` +
      `avail=${money(a.availableBalance).padEnd(15)}  ` +
      `${a.status || ''}`
    );
  });

  const realAccounts = accounts.filter(
    (a) => (a.type || '').toLowerCase() !== 'credit'
  );

  const homeBalance = realAccounts.reduce(
    (sum, a) => sum + (a.totalBalance || 0),
    0
  );

  console.log(`\n  Home balance (non-credit total): ${money(homeBalance)}`);

  // ─────────────────────────────────────────────────────────
  // 2. LEDGER — full net across Completed transactions
  // ─────────────────────────────────────────────────────────
    const allCompleted = await Transaction.find({
    userId: user._id,
    status: 'Completed',
    })
    .select(
        '_id accountId goalId loanId amount type description date category'
    )
    .sort({ date: 1 })
    .lean();

    // Same rule home uses: exclude credit accounts from the ledger comparison
    const creditAccountIds = new Set(
    accounts
        .filter((a) => (a.type || '').toLowerCase() === 'credit')
        .map((a) => String(a._id))
    );

    const nonCreditCompleted = allCompleted.filter(
    (t) => !creditAccountIds.has(String(t.accountId))
    );

    const ledgerNet = nonCreditCompleted.reduce(
    (s, t) => s + (t.amount ?? 0),
    0
    );

  console.log(`\n  Ledger net (all Completed)     : ${money(ledgerNet)}`);
  console.log(
    `  Difference (Home − Ledger)     : ${money(homeBalance - ledgerNet)}`
  );

  // ─────────────────────────────────────────────────────────
  // 3. LEDGER BY TYPE  — shows which category contributes what
  // ─────────────────────────────────────────────────────────
  const byType = new Map();
  for (const t of allCompleted) {
    const key = t.type || 'unknown';
    if (!byType.has(key)) byType.set(key, { sum: 0, count: 0 });
    const entry = byType.get(key);
    entry.sum += t.amount ?? 0;
    entry.count += 1;
  }

  console.log('\n── Ledger by type ──');
  const sortedTypes = [...byType.entries()].sort((a, b) => b[1].sum - a[1].sum);
  for (const [type, { sum, count }] of sortedTypes) {
    console.log(
      `  ${String(type).padEnd(12)}  n=${String(count).padEnd(4)}  net=${money(sum)}`
    );
  }

  // ─────────────────────────────────────────────────────────
  // 4. GOAL ACTIVITY — did all legs post, and do they net to 0?
  // ─────────────────────────────────────────────────────────
  const goalTx = allCompleted.filter((t) => t.goalId);

  console.log(`\n── Goal-linked transactions ── (${goalTx.length})`);
  if (goalTx.length > 0) {
    const goalNet = goalTx.reduce((s, t) => s + t.amount, 0);
    const goalByGoal = new Map();
    for (const t of goalTx) {
      const key = String(t.goalId);
      if (!goalByGoal.has(key))
        goalByGoal.set(key, { sum: 0, count: 0, legs: {} });
      const entry = goalByGoal.get(key);
      entry.sum += t.amount;
      entry.count += 1;
      const sign = t.amount >= 0 ? '+' : '-';
      entry.legs[sign] = (entry.legs[sign] || 0) + Math.abs(t.amount);
    }

    for (const [goalId, { sum, count, legs }] of goalByGoal) {
      const goal = await Goal.findById(goalId).select('name').lean();
      const name = goal?.name || '(goal deleted)';
      console.log(
        `  ${name.padEnd(28)}  n=${String(count).padEnd(3)}  ` +
        `debits=${money(legs['-'] || 0).padEnd(15)}  ` +
        `credits=${money(legs['+'] || 0).padEnd(15)}  ` +
        `net=${money(sum)}`
      );
    }
    console.log(`\n  Total goal net across ledger : ${money(goalNet)}`);
    console.log(
      `  → Should be $0.00 if every contribution posted both legs.`
    );
  }

  // ─────────────────────────────────────────────────────────
  // 5. LOAN PAYMENTS — do they have matching account movement?
  // ─────────────────────────────────────────────────────────
  const loanTx = allCompleted.filter((t) => t.loanId);

  console.log(`\n── Loan-linked transactions ── (${loanTx.length})`);
  if (loanTx.length > 0) {
    const loanNet = loanTx.reduce((s, t) => s + t.amount, 0);

    const loanByLoan = new Map();
    for (const t of loanTx) {
      const key = String(t.loanId);
      if (!loanByLoan.has(key)) loanByLoan.set(key, { sum: 0, count: 0 });
      const entry = loanByLoan.get(key);
      entry.sum += t.amount;
      entry.count += 1;
    }

    for (const [loanId, { sum, count }] of loanByLoan) {
      const loan = await Loan.findById(loanId).select('name').lean();
      const name = loan?.name || '(loan deleted)';
      console.log(
        `  ${name.padEnd(28)}  n=${String(count).padEnd(3)}  net=${money(sum)}`
      );
    }

    console.log(`\n  Total loan net across ledger : ${money(loanNet)}`);
    console.log(
      `  ⚠️  Every loan payment debits an account on the ledger.`
    );
    console.log(
      `     If the corresponding account balance was never reduced,`
    );
    console.log(
      `     Home will exceed Ledger by exactly ${money(Math.abs(loanNet))}.`
    );
  }

  // ─────────────────────────────────────────────────────────
  // 6. PER-ACCOUNT RECONCILIATION
  //    Compare each account's current totalBalance against
  //    the sum of its ledger transactions (not counting an
  //    implicit opening — we surface the gap so you see it).
  // ─────────────────────────────────────────────────────────
  console.log('\n── Per-account reconciliation ──');
  console.log(
    '  (ledger = sum of that account\'s Completed tx amounts; ' +
    'gap = balance − ledger)'
  );

  for (const acc of accounts) {
    const accTxs = allCompleted.filter(
      (t) => String(t.accountId) === String(acc._id)
    );
    const accLedger = accTxs.reduce((s, t) => s + t.amount, 0);
    const balance = acc.totalBalance ?? 0;
    const gap = balance - accLedger;
    const typeLabel = acc.subType ? `${acc.type} ${acc.subType}` : acc.type;

    console.log(
      `  ${String(acc._id).slice(-8)}  ${typeLabel.padEnd(20)}  ` +
      `bal=${money(balance).padEnd(15)}  ` +
      `ledger=${money(accLedger).padEnd(15)}  ` +
      `gap=${money(gap).padEnd(15)}  ` +
      `n=${accTxs.length}`
    );
  }

  // ─────────────────────────────────────────────────────────
  // 7. DETAIL: list every loan-linked tx so you can inspect
  // ─────────────────────────────────────────────────────────
  if (loanTx.length > 0) {
    console.log('\n── Loan-linked detail ──');
    loanTx.forEach((t) => {
      const d = t.date ? new Date(t.date).toISOString().slice(0, 10) : '—';
      const acc = accounts.find(
        (a) => String(a._id) === String(t.accountId)
      );
      const accLabel = acc
        ? `${acc.type}${acc.subType ? ' ' + acc.subType : ''} ••${String(
            acc.accountNumber || ''
          ).slice(-4)}`
        : String(t.accountId).slice(-6);
      console.log(
        `  ${d}  ${money(t.amount).padStart(14)}  ` +
        `${accLabel.padEnd(28)}  ${t.description}`
      );
    });
  }

  // ─────────────────────────────────────────────────────────
  // 8. DETAIL: list every goal-linked tx
  // ─────────────────────────────────────────────────────────
  if (goalTx.length > 0) {
    console.log('\n── Goal-linked detail ──');
    goalTx.forEach((t) => {
      const d = t.date ? new Date(t.date).toISOString().slice(0, 10) : '—';
      const acc = accounts.find(
        (a) => String(a._id) === String(t.accountId)
      );
      const accLabel = acc
        ? `${acc.type}${acc.subType ? ' ' + acc.subType : ''} ••${String(
            acc.accountNumber || ''
          ).slice(-4)}`
        : String(t.accountId).slice(-6);
      console.log(
        `  ${d}  ${money(t.amount).padStart(14)}  ` +
        `${accLabel.padEnd(28)}  ${t.description}`
      );
    });
  }

  // ─────────────────────────────────────────────────────────
  // 9. SUMMARY + verdict
  // ─────────────────────────────────────────────────────────
  const diff = homeBalance - ledgerNet;

  console.log('\n── Summary ──');
  console.log(`  Home balance           : ${money(homeBalance)}`);
  console.log(`  Ledger net             : ${money(ledgerNet)}`);
  console.log(`  Difference (Home − Led): ${money(diff)}`);

  if (Math.abs(diff) < 0.01) {
    console.log('\n  ✅ Reconciled — no drift.');
  } else if (Math.abs(diff - Math.abs(loanTx.reduce((s, t) => s + t.amount, 0))) < 0.01) {
    console.log(
      '\n  ⚠️  Drift matches the loan-transaction net exactly.'
    );
    console.log(
      '     The loan seed created ledger entries without debiting accounts.'
    );
    console.log(
      '     Fix: either (a) reduce each account\'s totalBalance by the ' +
      'loan amount, or (b) remove those loan transaction rows.'
    );
  } else if (diff > 0) {
    console.log(
      '\n  ⚠️  Home exceeds ledger — money on accounts with no matching tx.'
    );
    console.log(
      '     Likely causes: opening balances never recorded, or a code path'
    );
    console.log(
      '     that bumped Account.totalBalance without creating a Transaction.'
    );
  } else {
    console.log(
      '\n  ⚠️  Ledger exceeds home — transactions exist that were never'
    );
    console.log(
      '     applied to account balances (loan payments are the usual culprit).'
    );
  }

  console.log('\n🎉 Diagnostic complete');
  await mongoose.disconnect();
  process.exit();
};

run().catch((err) => {
  console.error('❌ Script failed:', err);
  process.exit(1);
});