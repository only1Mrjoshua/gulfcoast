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
const getAccountBalance = (acc) => acc.balance ?? acc.totalBalance ?? 0;
const getAvailableBalance = (acc) => acc.availableBalance ?? 0;
const getPendingBalance = (acc) => acc.pendingBalance ?? 0;

const normalizeType = (type) => (type || '').toLowerCase();

const POSITIVE_TX_TYPES = ['credit', 'deposit'];
const isPositiveTransaction = (tx) =>
  POSITIVE_TX_TYPES.includes(normalizeType(tx.type));

const signedAmount = (tx) =>
  isPositiveTransaction(tx) ? Math.abs(tx.amount) : -Math.abs(tx.amount);

const isTransferFrom = (desc) => /^Transfer from /i.test(desc || '');
const isTransferTo = (desc) => /^Transfer to /i.test(desc || '');

// Merge mirror pairs of internal transfers into single "Source → Destination" rows.
const pairInternalTransfers = (txs) => {
  const used = new Set();
  const result = [];

  const groups = new Map();
  txs.forEach((tx) => {
    const key = `${new Date(tx.date).toISOString().slice(0, 10)}|${Math.abs(tx.amount).toFixed(2)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(tx);
  });

  for (const tx of txs) {
    const id = tx._id.toString();
    if (used.has(id)) continue;

    const key = `${new Date(tx.date).toISOString().slice(0, 10)}|${Math.abs(tx.amount).toFixed(2)}`;
    const group = groups.get(key) || [];

    const mirror = group.find((t) => {
      const tid = t._id.toString();
      if (tid === id || used.has(tid)) return false;
      if (Math.sign(t.amount) === Math.sign(tx.amount)) return false;
      const bothAreTransfers =
        (isTransferFrom(t.description) || isTransferTo(t.description)) &&
        (isTransferFrom(tx.description) || isTransferTo(tx.description));
      return bothAreTransfers;
    });

    if (mirror) {
      const outgoing = tx.amount < 0 ? tx : mirror;
      const incoming = tx.amount > 0 ? tx : mirror;

      const sourceMatch = (incoming.description || '').match(/^Transfer from (.+)$/i);
      const destMatch = (outgoing.description || '').match(/^Transfer to (.+)$/i);
      const from = sourceMatch ? sourceMatch[1].trim() : 'Account';
      const to = destMatch ? destMatch[1].trim() : 'Account';

      result.push({
        _id: outgoing._id,
        description: `${from} → ${to}`,
        category: 'transfer',
        type: 'debit',
        amount: -Math.abs(outgoing.amount),
        status: outgoing.status,
        date: outgoing.date,
      });

      used.add(id);
      used.add(mirror._id.toString());
    } else {
      result.push(tx);
      used.add(id);
    }
  }

  result.sort((a, b) => new Date(b.date) - new Date(a.date));
  return result;
};

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

    // 3. Accounts + balances
    const accounts = await Account.find({ userId });

    let totalBalance = 0;
    let availableBalance = 0;
    let pendingBalance = 0;

    const formattedAccounts = accounts.map((acc) => {
    const bal = getAccountBalance(acc);
    const avail = getAvailableBalance(acc);
    const pend = getPendingBalance(acc);

    // ⬇️ Running totals — unchanged
    totalBalance += bal;
    availableBalance += avail;
    pendingBalance += pend;

    const rawNumber = String(acc.accountNumber || '');
    const lastFour = rawNumber.slice(-4);

    // ⬇️ NEW: what each card shows must match Accounts.jsx
    const displayBalance =
        normalizeType(acc.type) === 'credit'
        ? bal          // credit card → show totalBalance (amount owed)
        : avail;       // checking/savings → show availableBalance

    return {
        id: acc._id,
        type: normalizeType(acc.type),
        accountNumber: `****${lastFour}`,
        balance: displayBalance,   // ⬅️ FIX
    };
    });

    // 4. Recent Transactions — all accounts, past/today only,
    //    internal-transfer mirror pairs merged into one row each.
    const candidateTransactions = await Transaction.find({
      userId,
      date: { $lte: new Date() },
    })
      .sort({ date: -1 })
      .limit(50)
      .lean();

    const paired = pairInternalTransfers(candidateTransactions);

    const recentTransactions = paired.slice(0, 5).map((tx) => ({
      _id: tx._id,
      description: tx.description,
      category: tx.category || normalizeType(tx.type),
      type: isPositiveTransaction(tx) ? 'credit' : 'debit',
      amount: signedAmount(tx),
      status: normalizeType(tx.status),
      date: tx.date,
    }));

    // 5. Upcoming Payments — from the Payment + Autopay collections
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
        balances: {
          total: totalBalance,
          available: availableBalance,
          pending: pendingBalance,
        },
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