// scripts/seedUser.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import dns from 'dns';

// Import your models
import User from '../models/User.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import Card from '../models/Card.js';
import Notification from '../models/Notification.js';
// NOTE: We are intentionally NOT importing Goal or Loan models since Emily has none.

dotenv.config();

// ✅ Fix DNS SRV resolution issues on Windows/VPN setups
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const seedEmily = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ Connected to MongoDB');

    // =========================================================
    // 1. CLEAN UP PREVIOUS EMILY DATA
    // =========================================================
    const userEmail = 'emily.davis@example.com';
    const userUsername = 'emilydavis';

    const existingUser = await User.findOne({
      $or: [{ email: userEmail }, { username: userUsername }],
    });

    if (existingUser) {
      await Account.deleteMany({ userId: existingUser._id });
      await Transaction.deleteMany({ userId: existingUser._id });
      await Card.deleteMany({ userId: existingUser._id });
      await Notification.deleteMany({ userId: existingUser._id });
      // We don't delete Goals or Loans because Emily doesn't have any!
      await User.deleteOne({ _id: existingUser._id });
      console.log('🧹 Removed existing Emily and related data');
    }

    // =========================================================
    // 2. CREATE THE USER
    // =========================================================
    const userPassword = await bcrypt.hash('password123', 10);

    const user = await User.create({
      firstName: 'Emily',
      lastName: 'Davis',
      username: userUsername,
      email: userEmail,
      password: userPassword,
      role: 'user',
      creditScore: {
        score: 742,
        rating: 'Excellent',
        change: 12,                            // ⬅️ NEW: points gained this month
        lastUpdated: new Date('2026-09-08'),   // ⬅️ FIXED: was new Date()
      },
    });

    console.log('✅ User created:', user._id);

    // =========================================================
    // 3. CREATE ACCOUNTS (No Loans/Goals)
    // =========================================================
    // Checking
    const checking = await Account.create({
      userId: user._id,
      type: 'Checking',
      accountNumber: '4821',
      totalBalance: 12840.52,
      availableBalance: 12000.00,
      pendingBalance: 840.52,
      status: 'Active',
      interestRate: null
    });

    // Standard Savings
    const savings = await Account.create({
      userId: user._id,
      type: 'Savings',
      subType: 'Standard',
      accountNumber: '9134',
      totalBalance: 11839.90,
      availableBalance: 11839.90,
      pendingBalance: 0,
      status: 'Active',
      interestRate: 1.5
    });

    // High Yield Savings
    const highYield = await Account.create({
      userId: user._id,
      type: 'Savings',
      subType: 'High Yield',
      accountNumber: '7710',
      totalBalance: 25000.00,
      availableBalance: 25000.00,
      pendingBalance: 0,
      status: 'Active',
      interestRate: 4.8
    });

    // Credit Card
    const credit = await Account.create({
      userId: user._id,
      type: 'Credit',
      accountNumber: '2208',
      totalBalance: -1240.50,
      availableBalance: 9500.00,
      pendingBalance: 0,
      status: 'Active',
      interestRate: null
    });

    console.log('✅ Accounts created');

    // =========================================================
    // 4. CREATE CARDS & ACTIVITY
    // =========================================================
    await Card.create([
      {
        userId: user._id,
        cardName: 'Emily Platinum Debit',
        type: 'Debit',
        fullNumber: '4532890123454821',
        expiryMonth: '12',
        expiryYear: '2027',
        linkedAccount: 'Checking',
        status: 'Active',
        activity: [
          { company: 'Amazon', description: 'Shopping', amount: -500.00, date: new Date('2026-09-04') },
          { company: 'Shell', description: 'Gas', amount: -52.40, date: new Date('2026-09-06') },
        ]
      },
      {
        userId: user._id,
        cardName: 'Emily Rewards Credit',
        type: 'Credit',
        fullNumber: '5512987612342208',
        expiryMonth: '05',
        expiryYear: '2028',
        linkedAccount: 'Checking',
        status: 'Active',
        activity: [
          { company: 'Target', description: 'Shopping', amount: -132.75, date: new Date('2026-09-04') },
        ]
      }
    ]);

    console.log('✅ Cards created');

    // =========================================================
    // 5. CREATE TRANSACTIONS (Transfers, Payments, Deposits, Purchases)
    // =========================================================
    await Transaction.create([
      // Transfers
      {
        userId: user._id,
        accountId: checking._id,
        description: 'Transfer to Savings',
        amount: 500.00,
        type: 'transfer',
        status: 'Completed',
        date: new Date('2026-09-08')
      },
      {
        userId: user._id,
        accountId: checking._id,
        description: 'Transfer to External Bank',
        amount: 1200.00,
        type: 'transfer',
        status: 'Pending',
        date: new Date('2026-09-08')
      },
      // Payments
      {
        userId: user._id,
        accountId: checking._id,
        description: 'Electric Company Payment',
        amount: 124.50,
        type: 'payment',
        status: 'Scheduled',
        date: new Date('2026-09-12')
      },
      {
        userId: user._id,
        accountId: checking._id,
        description: 'Water & Sewer Payment',
        amount: 85.20,
        type: 'payment',
        status: 'Scheduled',
        date: new Date('2026-09-20')
      },
      // Deposits
      {
        userId: user._id,
        accountId: checking._id,
        description: 'Mobile Check Deposit',
        amount: 1500.00,
        type: 'deposit',
        status: 'Pending',
        date: new Date('2026-09-08')
      },
      {
        userId: user._id,
        accountId: checking._id,
        description: 'Direct Deposit - Payroll',
        amount: 250.00,
        type: 'deposit',
        status: 'Completed',
        date: new Date('2026-09-07')
      },
      // Recent Purchases
      {
        userId: user._id,
        accountId: credit._id,
        description: 'Amazon Purchase',
        amount: 84.21,
        type: 'debit',
        status: 'Completed',
        date: new Date('2026-09-08')
      },
      {
        userId: user._id,
        accountId: checking._id,
        description: 'Shell Gas Station',
        amount: 52.40,
        type: 'debit',
        status: 'Completed',
        date: new Date('2026-09-06')
      }
    ]);

    console.log('✅ Transactions created');

    // =========================================================
    // 6. CREATE NOTIFICATIONS
    // =========================================================
    await Notification.create([
      {
        userId: user._id,
        category: 'Account',
        type: 'New Device Signed In',
        date: new Date('2026-09-08'),
        priority: 'Important',
        message: 'A new device signed into your account from Chrome on Windows in New York, NY.'
      },
      {
        userId: user._id,
        category: 'Transaction',
        type: 'Large Transaction Alert',
        date: new Date('2026-09-06'),
        priority: 'Important',
        message: 'A transaction of $500.00 was made at Amazon using your Rewards Credit card.'
      },
      {
        userId: user._id,
        category: 'Promotions',
        type: 'New Feature',
        date: new Date('2026-09-01'),
        priority: 'Normal',
        message: 'Check out our new savings goals feature in the app!'
      }
    ]);

    console.log('✅ Notifications created');

    console.log('\n🎉 Emily Davis seeding complete!');
    console.log('   → username: emilydavis');
    console.log('   → password: password123');
    console.log('   → User ID :', user._id.toString());
    
    process.exit();
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedEmily();