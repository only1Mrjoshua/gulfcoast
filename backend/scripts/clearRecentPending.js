// scripts/clearRecentPending.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from '../models/User.js';
import Transfer from '../models/Transfer.js';
import Transaction from '../models/Transaction.js';

dotenv.config();

// Same Windows / local-dev DNS fix as server.js
if (!process.env.VERCEL) {
  try {
    dns.setDefaultResultOrder('ipv4first');
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch {
    // ignore
  }
}

// ── Config ─────────────────────────────────────────────────
const TARGET_USERNAME = 'Henrydorian1';
const COUNT           = 2;      // how many of the most recent to delete
const DRY_RUN         = false;  // true = preview only, no deletes
// ───────────────────────────────────────────────────────────

async function clearRecent() {
  if (!process.env.MONGO_URL) {
    throw new Error('MONGO_URL is not set in your .env file');
  }

  await mongoose.connect(process.env.MONGO_URL, {
    serverSelectionTimeoutMS: 15000,
  });
  console.log('✅ Connected to MongoDB');

  // Find the user — username first, then email fallback.
  const user =
    (await User.findOne({ username: TARGET_USERNAME })) ||
    (await User.findOne({ email: TARGET_USERNAME }));

  if (!user) {
    console.error(`❌ No user found matching "${TARGET_USERNAME}"`);
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(
    `👤 Found user: ${user.firstName || ''} ${user.lastName || ''}`.trim() +
      ` (${user.email || user.username || user._id})`
  );

  // ── Grab the N most recent PENDING transfers ───────────────
  const pendingTransfers = await Transfer.find({
    userId: user._id,
    status: 'Pending',
  })
    .sort({ createdAt: -1 })
    .limit(COUNT);

  // ── Grab the N most recent PENDING transactions ────────────
  // (Transaction model may use status "Pending", "pending" or a
  //  different field name. We try the common variants.)
  const pendingTransactions = await Transaction.find({
    userId: user._id,
    status: { $in: ['Pending', 'pending', 'PENDING'] },
  })
    .sort({ createdAt: -1 })
    .limit(COUNT);

  console.log('\n📋 Will remove:');
  console.log('─────────────────────────────────────────────');

  if (pendingTransfers.length === 0) {
    console.log('  (no pending transfers found)');
  } else {
    pendingTransfers.forEach((t) => {
      console.log(
        `  TRANSFER  ${t.transactionNumber}  $${Number(
          t.amount || 0
        ).toFixed(2)}  ${t.type}  ${t.createdAt?.toISOString?.() || ''}`
      );
    });
  }

  if (pendingTransactions.length === 0) {
    console.log('  (no pending transactions found)');
  } else {
    pendingTransactions.forEach((t) => {
      const amount = t.amount ?? t.value ?? 0;
      const label  = t.description || t.memo || t.type || 'transaction';
      console.log(
        `  TXN       ${t._id}  $${Number(amount).toFixed(2)}  ${label}  ${
          t.createdAt?.toISOString?.() || ''
        }`
      );
    });
  }

  console.log('─────────────────────────────────────────────');
  console.log(
    `  Total to delete: ${pendingTransfers.length} transfer(s) + ` +
      `${pendingTransactions.length} transaction(s)`
  );

  if (DRY_RUN) {
    console.log('\n🧪 DRY RUN — nothing was deleted.');
    await mongoose.disconnect();
    process.exit(0);
  }

  // ── Delete ────────────────────────────────────────────────
  const transferIds = pendingTransfers.map((t) => t._id);
  const txnIds      = pendingTransactions.map((t) => t._id);

  let deletedTransfers = 0;
  let deletedTxns      = 0;

  if (transferIds.length > 0) {
    const res = await Transfer.deleteMany({ _id: { $in: transferIds } });
    deletedTransfers = res.deletedCount || 0;
  }

  if (txnIds.length > 0) {
    const res = await Transaction.deleteMany({ _id: { $in: txnIds } });
    deletedTxns = res.deletedCount || 0;
  }

  console.log('\n🗑️  Deleted:');
  console.log(`  ↳ ${deletedTransfers} transfer(s)`);
  console.log(`  ↳ ${deletedTxns} transaction(s)`);

  console.log('\n✅ Done. Pending items cleared.');
  await mongoose.disconnect();
  process.exit(0);
}

clearRecent().catch((err) => {
  console.error('❌ Script failed:', err.message);
  process.exit(1);
});