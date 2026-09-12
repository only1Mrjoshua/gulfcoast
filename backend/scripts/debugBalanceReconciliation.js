// scripts/debugBalanceReconciliation.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from '../models/User.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const money = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n ?? 0);

const POSITIVE_TYPES = ['credit', 'deposit'];

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

  // ============================================================
  // 1. ACCOUNTS
  // ============================================================
  const accounts = await Account.find({ userId: user._id }).lean();

  console.log('── Accounts ──');
  if (accounts.length === 0) {
    console.log('  (no accounts)');
  } else {
    accounts.forEach((a) => {
      console.log(
        `  ${String(a._id).slice(-8)}  ` +
        `${(a.type || '?').padEnd(10)}  ` +
        `${(a.subType || '—').padEnd(12)}  ` +
        `total=${money(a.totalBalance).padEnd(15)}  ` +
        `avail=${money(a.availableBalance).padEnd(15)}  ` +
        `${a.status || ''}`
      );
    });
  }

  // Home formula (matches homeController.js)
  const realAccounts = accounts.filter(
    (a) => (a.type || '').toLowerCase() !== 'credit'
  );
  const homeBalance = realAccounts.reduce(
    (sum, a) => sum + (a.totalBalance || 0),
    0
  );

  const homeIncludingCredit = accounts.reduce(
    (s, a) => s + (a.totalBalance || 0),
    0
  );

  const homeExclClosed = realAccounts
    .filter((a) => (a.status || '').toLowerCase() !== 'closed')
    .reduce((s, a) => s + (a.totalBalance || 0), 0);

  console.log('\n── Home balance variants ──');
  console.log(`  Non-credit (what home shows)   : ${money(homeBalance)}`);
  console.log(`  Including credit               : ${money(homeIncludingCredit)}`);
  console.log(`  Non-credit & non-closed        : ${money(homeExclClosed)}`);

  // ============================================================
  // 2. ALL TRANSACTIONS
  // ============================================================
  const allTxs = await Transaction.find({ userId: user._id })
    .select('_id accountId description date status type amount category')
    .sort({ date: -1 })
    .lean();

  const statusCounts = allTxs.reduce((m, tx) => {
    const k = tx.status || 'null';
    m[k] = (m[k] || 0) + 1;
    return m;
  }, {});

  console.log('\n── Transaction counts by status ──');
  Object.entries(statusCounts).forEach(([k, v]) =>
    console.log(`  ${k.padEnd(12)} ${v}`)
  );

  const completed = allTxs.filter((t) => t.status === 'Completed');

  // Home convention: type-based sign (credit/deposit → +, else −)
  const homeSigned = (tx) =>
    POSITIVE_TYPES.includes((tx.type || '').toLowerCase())
      ? Math.abs(tx.amount ?? 0)
      : -Math.abs(tx.amount ?? 0);

  // Transactions-page convention: raw sign of stored amount
  const pageSigned = (tx) => tx.amount ?? 0;

  const ledgerNet_home = completed.reduce((s, t) => s + homeSigned(t), 0);
  const ledgerNet_page = completed.reduce((s, t) => s + pageSigned(t), 0);

  // in/out split as getTransactions does it
  let totalIn = 0,
    totalOut = 0;
  completed.forEach((t) => {
    const a = t.amount ?? 0;
    if (a >= 0) totalIn += a;
    else totalOut += Math.abs(a);
  });
  const ledgerNet_page2 = totalIn - totalOut;

  console.log('\n── Ledger totals (all Completed txs, all time) ──');
  console.log(`  Home-convention net (type sign) : ${money(ledgerNet_home)}`);
  console.log(`  Page-convention net (raw sign)  : ${money(ledgerNet_page)}`);
  console.log(`  Page-convention net (in − out)  : ${money(ledgerNet_page2)}`);
  console.log(`  totalIn                         : ${money(totalIn)}`);
  console.log(`  totalOut                        : ${money(totalOut)}`);

  // ============================================================
  // 3. RECONCILE — Home balance vs ledger
  // ============================================================
  const diff = homeBalance - ledgerNet_page;

  console.log('\n── Reconciliation (Home vs Ledger) ──');
  console.log(`  Home balance                    : ${money(homeBalance)}`);
  console.log(`  Ledger net (raw sign, Completed): ${money(ledgerNet_page)}`);
  console.log(`  Difference (Home − Ledger)      : ${money(diff)}`);
  console.log(
    `    → ${
      diff > 0
        ? 'balance exceeds ledger — money on accounts with no matching transaction (opening balance, duplicate credit, or code path that skips Transaction.create)'
        : diff < 0
        ? 'ledger exceeds balance — transactions exist but were never applied to account balances'
        : 'reconciled'
    }`
  );

  // ============================================================
  // 4. PER-ACCOUNT RECONCILIATION
  // ============================================================
  console.log('\n── Per-account reconciliation ──');
  for (const acc of accounts) {
    const accTxs = completed.filter(
      (t) => String(t.accountId) === String(acc._id)
    );
    const accLedger = accTxs.reduce((s, t) => s + (t.amount ?? 0), 0);
    const accBalance = acc.totalBalance ?? 0;
    const accDiff = accBalance - accLedger;

    console.log(
      `  ${String(acc._id).slice(-8)}  ${(acc.type || '?').padEnd(10)}  ` +
      `bal=${money(accBalance).padEnd(15)}  ` +
      `ledger=${money(accLedger).padEnd(15)}  ` +
      `diff=${money(accDiff).padEnd(15)}  ` +
      `txCount=${accTxs.length}`
    );
  }

  // ============================================================
  // 5. LARGEST COMPLETED TRANSACTIONS
  // ============================================================
  console.log('\n── Largest Completed transactions ──');
  [...completed]
    .sort((a, b) => Math.abs(b.amount || 0) - Math.abs(a.amount || 0))
    .slice(0, 15)
    .forEach((tx) => {
      const d = tx.date ? new Date(tx.date).toISOString().slice(0, 10) : '—';
      console.log(
        `  ${d}  ${(tx.type || '?').padEnd(10)}  ` +
        `${money(tx.amount).padStart(15)}  ` +
        `${(tx.description || '').slice(0, 55)}`
      );
    });

  // ============================================================
  // 6. NON-COMPLETED TRANSACTIONS
  // ============================================================
  const nonCompleted = allTxs.filter((t) => t.status !== 'Completed');
  if (nonCompleted.length > 0) {
    console.log(`\n── Non-Completed transactions (${nonCompleted.length}) ──`);
    nonCompleted.slice(0, 25).forEach((tx) => {
      const d = tx.date ? new Date(tx.date).toISOString().slice(0, 10) : '—';
      console.log(
        `  ${d}  ${(tx.status || '?').padEnd(12)}  ` +
        `${(tx.type || '?').padEnd(10)}  ` +
        `${money(tx.amount).padStart(14)}  ` +
        `${(tx.description || '').slice(0, 50)}`
      );
    });
    if (nonCompleted.length > 25) {
      console.log(`  ... and ${nonCompleted.length - 25} more`);
    }
  }

  // ============================================================
  // 7. SIGN ANOMALIES
  // ============================================================
  const anomalies = allTxs.filter((tx) => {
    const t = (tx.type || '').toLowerCase();
    const amt = tx.amount ?? 0;
    const isCreditType = POSITIVE_TYPES.includes(t);
    if (isCreditType && amt < 0) return true;
    if (!isCreditType && amt > 0) return true;
    return false;
  });

  console.log(`\n── Sign anomalies (type vs amount sign) ── (${anomalies.length})`);
  if (anomalies.length === 0) {
    console.log('  (none)');
  } else {
    anomalies.slice(0, 20).forEach((tx) => {
      const d = tx.date ? new Date(tx.date).toISOString().slice(0, 10) : '—';
      console.log(
        `  ${d}  ${(tx.type || '?').padEnd(10)}  ` +
        `${money(tx.amount).padStart(14)}  ` +
        `${(tx.description || '').slice(0, 50)}`
      );
    });
    if (anomalies.length > 20) {
      console.log(`  ... and ${anomalies.length - 20} more`);
    }
  }

  // ============================================================
  // 8. FUTURE-DATED COMPLETED TRANSACTIONS
  // ============================================================
  const now = new Date();
  const future = completed.filter((t) => t.date && new Date(t.date) > now);
  if (future.length > 0) {
    console.log(`\n── Future-dated Completed txs (${future.length}) ──`);
    future.slice(0, 10).forEach((tx) => {
      const d = new Date(tx.date).toISOString().slice(0, 10);
      console.log(
        `  ${d}  ${money(tx.amount).padStart(14)}  ` +
        `${(tx.description || '').slice(0, 50)}`
      );
    });
  }

  // ============================================================
  // 9. NULL / MALFORMED DATES
  // ============================================================
  const nullDates = allTxs.filter((t) => t.date == null).length;
  if (nullDates > 0) {
    console.log(`\n⚠️  ${nullDates} transaction(s) have a null date.`);
  }

  // ============================================================
  // 10. SUMMARY
  // ============================================================
  console.log('\n── Summary ──');
  console.log(`  Home shows            : ${money(homeBalance)}`);
  console.log(`  Ledger net (Completed): ${money(ledgerNet_page)}`);
  console.log(`  Unexplained gap       : ${money(diff)}`);
  console.log(`  Non-completed txs     : ${nonCompleted.length}`);
  console.log(`  Sign anomalies        : ${anomalies.length}`);
  console.log(`  Future-dated txs      : ${future.length}`);
  console.log(`  Null-dated txs        : ${nullDates}`);

  console.log('\n🎉 Diagnostic complete');
  await mongoose.disconnect();
  process.exit();
};

run().catch((err) => {
  console.error('❌ Script failed:', err);
  process.exit(1);
});