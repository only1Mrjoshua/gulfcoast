// scripts/backfillOpeningBalances.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

// ───────────────────────────────────────────────────────────────
// Flags
//   (no flag)         → dry run: prints what WOULD happen, writes nothing
//   --confirm         → actually creates the opening-balance transactions
//   --user=<username> → scope to a single user (recommended for testing)
// ───────────────────────────────────────────────────────────────
const CONFIRM = process.argv.includes('--confirm');
const userArg = process.argv.find((a) => a.startsWith('--user='));
const USERNAME = userArg ? userArg.split('=')[1] : null;

const money = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(n ?? 0);

const run = async () => {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connected');
  console.log(
    `⚙️  Mode: ${CONFIRM ? '⚠️  LIVE WRITE' : '🔍 DRY RUN (no changes)'}`
  );
  if (USERNAME) console.log(`🎯 Scoped to username: ${USERNAME}`);
  console.log('');

  // ── Resolve target accounts ─────────────────────────────────
  let accountFilter = {};

  if (USERNAME) {
    const User = (await import('../models/User.js')).default;
    const user = await User.findOne({ username: USERNAME })
      .select('_id firstName lastName username')
      .lean();
    if (!user) {
      console.error(`❌ User "${USERNAME}" not found`);
      process.exit(1);
    }
    console.log(`🎯 User: ${user.firstName} ${user.lastName}\n`);
    accountFilter.userId = user._id;
  }

  const accounts = await Account.find(accountFilter).lean();
  console.log(`── Scanning ${accounts.length} account(s) ──\n`);

  let reconciled = 0;
  let needsBackfill = 0;
  let created = 0;
  let totalBackfilled = 0;

  for (const acc of accounts) {
    // ── Ledger sum for this account (Completed only) ──────────
    const agg = await Transaction.aggregate([
      { $match: { accountId: acc._id, status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const ledgerSum = agg[0]?.total ?? 0;
    const balance = Number(acc.totalBalance ?? 0);
    const gap = balance - ledgerSum;

    const shortId = String(acc._id).slice(-8);
    const typeLabel = acc.subType
      ? `${acc.type} ${acc.subType}`
      : acc.type || '?';

    // ── Already reconciled? ───────────────────────────────────
    if (Math.abs(gap) < 0.01) {
      console.log(
        `  ✓ ${shortId}  ${typeLabel.padEnd(22)}  ` +
        `bal=${money(balance).padEnd(15)}  ` +
        `ledger=${money(ledgerSum).padEnd(15)}  reconciled`
      );
      reconciled += 1;
      continue;
    }

    // ── Needs an opening transaction ──────────────────────────
    needsBackfill += 1;

    console.log(
      `  + ${shortId}  ${typeLabel.padEnd(22)}  ` +
      `bal=${money(balance).padEnd(15)}  ` +
      `ledger=${money(ledgerSum).padEnd(15)}  ` +
      `gap=${money(gap)}`
    );

    if (!CONFIRM) continue;

    // Create the opening transaction that closes the gap.
    await Transaction.create({
      userId: acc.userId,
      accountId: acc._id,
      description: 'Opening Deposit',
      amount: gap,                       // preserve sign
      type: gap >= 0 ? 'deposit' : 'debit',
      status: 'Completed',
      date: acc.createdAt || new Date(),
    });

    created += 1;
    totalBackfilled += gap;
  }

  // ── Summary ─────────────────────────────────────────────────
  console.log('\n── Summary ──');
  console.log(`  Accounts scanned        : ${accounts.length}`);
  console.log(`  Already reconciled      : ${reconciled}`);
  console.log(`  Needing backfill        : ${needsBackfill}`);

  if (!CONFIRM) {
    console.log(`  Transactions created    : 0  (dry run)`);
    console.log(`  Total to backfill       : (see gaps above)`);
    console.log(
      '\n👉 Re-run with --confirm to apply. ' +
      'Strongly recommend --user=<username> first.'
    );
  } else {
    console.log(`  Transactions created    : ${created}`);
    console.log(`  Total amount backfilled : ${money(totalBackfilled)}`);
    console.log('\n✅ Backfill complete.');
  }

  await mongoose.disconnect();
  process.exit();
};

run().catch((err) => {
  console.error('❌ Backfill failed:', err);
  process.exit(1);
});