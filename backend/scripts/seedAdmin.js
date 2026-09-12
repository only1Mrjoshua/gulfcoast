import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import Goal from '../models/Goal.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    await User.deleteMany({});
    await Account.deleteMany({});
    await Transaction.deleteMany({});
    await Goal.deleteMany({});

    const hashedPassword = await bcrypt.hash('demo123', 10);
    const user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      username: 'demo',
      email: 'demo@example.com',
      password: hashedPassword,
      creditScore: { score: 785, rating: 'Excellent', lastUpdated: new Date() }
    });

    const checking = await Account.create({
      userId: user._id, type: 'checking', accountNumber: '1234567890',
      balance: 5000, availableBalance: 4800, pendingBalance: 200
    });

    await Account.create({
      userId: user._id, type: 'savings', accountNumber: '0987654321',
      balance: 15000, availableBalance: 15000, pendingBalance: 0
    });

    const credit = await Account.create({
      userId: user._id, type: 'credit', accountNumber: '1122334455',
      balance: -500, availableBalance: 2500, pendingBalance: 0
    });

    await Transaction.create([
      { userId: user._id, accountId: checking._id, description: 'Grocery Store', amount: 150, type: 'debit', date: new Date() },
      { userId: user._id, accountId: checking._id, description: 'Salary Deposit', amount: 3000, type: 'credit', date: new Date(Date.now() - 86400000) },
      { userId: user._id, accountId: credit._id, description: 'Netflix Subscription', amount: 15, type: 'debit', date: new Date(Date.now() + 86400000), status: 'pending' }
    ]);

    await Goal.create({
      userId: user._id, name: 'Vacation Fund', targetAmount: 5000, currentAmount: 1500, deadline: new Date('2026-12-31')
    });

    console.log('✅ Database Seeded! User ID:', user._id);
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();