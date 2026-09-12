// scripts/fixTransfersAndSigns.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from '../models/User.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import Transfer from '../models/Transfer.js';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const POSITIVE_TYPES = ['credit', 'deposit'];

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected');

    const user = await User.findOne({ username: 'emilydavis' });
    if (!user) {
      console.error('❌ Emily not found');
      process.exit(1);
    }

    const checking = await Account.findOne({ userId: user._id, type: 'Checking' });
    const savings  = await Account.findOne({
      userId: user._id,
      type: 'Savings',
      subType: 'Standard',
    });
    if (!checking || !savings) {
      console.error('❌ Accounts not found');
      process.exit(1);
    }

    // ── 1. Sign all transactions correctly ─────────────────
    const txs = await Transaction.find({ userId: user._id });
    for (const tx of txs) {
      const isIn = POSITIVE_TYPES.includes((tx.type || '').toLowerCase());
      const correct = isIn ? Math.abs(tx.amount) : -Math.abs(tx.amount);
      if (tx.amount !== correct) {
        tx.amount = correct;
        await tx.save();
        console.log(`✏️  Signed: ${tx.description} → ${correct}`);
      }
    }

    // ── 2. Create Transfer docs for the two seeded transfer transactions ──
    const seeded = await Transaction.find({
      userId: user._id,
      type: 'transfer',
      description: { $in: ['Transfer to Savings', 'Transfer to External Bank'] },
    });

    for (const tx of seeded) {
      const exists = await Transfer.findOne({
        userId: user._id,
        amount: Math.abs(tx.amount),
        transferDate: tx.date,
      });
      if (exists) {
        console.log(`⏭️  Transfer doc already exists for: ${tx.description}`);
        continue;
      }

      const isExternal = tx.description.includes('External');
      const trxNumber = 'TRX-' + Math.floor(100000 + Math.random() * 900000);

      await Transfer.create({
        userId: user._id,
        transactionNumber: trxNumber,
        type: isExternal ? 'external' : 'internal',

        fromAccountId: checking._id,
        fromAccountName: 'Checking',
        fromLastFour: checking.accountNumber.slice(-4),

        toAccountId: isExternal ? null : savings._id,
        toAccountName: isExternal ? '' : 'Standard Savings',
        toLastFour: isExternal ? '' : savings.accountNumber.slice(-4),

        recipient: isExternal
          ? {
              fullName: 'External Recipient',
              bankName: 'External Bank',
              routingNumber: '000000000',
              accountNumber: '0000000000',
              accountType: 'checking',
            }
          : undefined,

        amount: Math.abs(tx.amount),
        wireFee: 0,
        totalDebit: Math.abs(tx.amount),

        transferDate: tx.date,
        expectedArrival: isExternal ? '1–3 business days' : 'Immediately',
        memo: '',
        senderName: `${user.firstName} ${user.lastName}`,
        status: 'Completed',
        completedAt: tx.date,
      });

      console.log(`✅ Created Transfer doc: ${tx.description} ($${Math.abs(tx.amount)})`);
    }

    console.log('\n🎉 Migration complete');
    process.exit();
  } catch (err) {
    console.error('❌ Migration error:', err);
    process.exit(1);
  }
};

run();