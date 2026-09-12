// controllers/homeController.js
import User from '../models/User.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import Goal from '../models/Goal.js';
import Payment from '../models/Payment.js';
import Autopay from '../models/Autopay.js';
import { getUSGreetingAndDate } from '../utils/dateUtils.js';
import ErrorResponse from '../utils/errorResponse.js';

// ---------- Helpers ----------
const normalizeType = (type) => (type || '').toLowerCase();

const POSITIVE_TX_TYPES = ['credit', 'deposit'];
const isPositiveTransaction = (tx) =>
  POSITIVE_TX_TYPES.includes(normalizeType(tx.type));

const signedAmount = (tx) =>
  isPositiveTransaction(tx) ? Math.abs(tx.amount) : -Math.abs(tx.amount);

// @desc    Get all home dashboard data for the logged-in user
// @route   GET /api/home/dashboard
// @access  Private
export const getHomeData = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. User
    const user = await User.findById(userId).select('-password');
    if (!user) return next(new ErrorResponse('User not found', 404));

    // 2. Greeting + Date
    const { greeting, dateString } = getUSGreetingAndDate();

    // 3. Accounts + balance
    const accounts = await Account.find({ userId });

    // Only Checking + Savings are considered accounts.
    // Credit cards are not accounts — they're cards linked to an account.
    const realAccounts = accounts.filter(
      (a) => normalizeType(a.type) !== 'credit'
    );

    const accountBalance = realAccounts.reduce(
      (sum, acc) => sum + (acc.totalBalance || 0),
      0
    );

    const formattedAccounts = realAccounts.map((acc) => {
      const rawNumber = String(acc.accountNumber || '');
      const lastFour = rawNumber.slice(-4);

      return {
        id: acc._id,
        type: normalizeType(acc.type),
        accountNumber: `****${lastFour}`,
        balance: acc.totalBalance ?? 0,
      };
    });

    // 4. Recent Transactions — past/today only, completed only
    const recentTransactionsRaw = await Transaction.find({
      userId,
      status: 'Completed',
      date: { $lte: new Date() },
    })
      .sort({ date: -1 })
      .limit(5);

    const recentTransactions = recentTransactionsRaw.map((tx) => ({
      _id: tx._id,
      description: tx.description,
      category: tx.category || normalizeType(tx.type),
      type: isPositiveTransaction(tx) ? 'credit' : 'debit',
      amount: signedAmount(tx),
      status: normalizeType(tx.status),
      date: tx.date,
    }));

    // 5. Upcoming Payments
    const now = new Date();

    const [upcomingRaw, autopayRaw] = await Promise.all([
      Payment.find({
        userId,
        status: { $in: ['Scheduled', 'Pending'] },
        date: { $gte: now },
      })
        .sort({ date: 1 })
        .limit(5)
        .lean(),

      Autopay.find({ userId, enabled: true }).lean(),
    ]);

    const autopayPayeeIds = new Set(autopayRaw.map((a) => String(a.payeeId)));

    const upcomingPayments = upcomingRaw.map((p) => ({
      _id: p._id,
      description: p.payeeName,
      payee: p.payeeName,
      amount: p.amount,
      status: normalizeType(p.status),
      date: p.date,
      autopay: autopayPayeeIds.has(String(p.payeeId)),
    }));

    // 6. Goals
    const goals = await Goal.find({ userId });

    // 7. Response
    res.status(200).json({
      success: true,
      data: {
        greeting: `${greeting}, ${user.firstName}`,
        date: dateString,
        balance: accountBalance,
        accounts: formattedAccounts,
        recentTransactions,
        upcomingPayments,
        creditScore: user.creditScore,
        goals,
      },
    });
  } catch (error) {
    next(error);
  }
};