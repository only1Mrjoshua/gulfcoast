// controllers/accountsController.js
import User from '../models/User.js';
import Account from '../models/Account.js';
import Loan from '../models/Loan.js';
import Transaction from '../models/Transaction.js';

const DEFAULT_ALERTS = {
  lowBalance: true,
  largeTransaction: true,
  deposit: true,
  paymentReminder: true,
  monthlyStatement: true,
};

const POSITIVE_TX_TYPES = ['credit', 'deposit'];
const isPositiveTransaction = (tx) =>
  POSITIVE_TX_TYPES.includes((tx.type || '').toLowerCase());

const signedAmount = (tx) =>
  isPositiveTransaction(tx) ? Math.abs(tx.amount) : -Math.abs(tx.amount);

// ============================================================
// GET /api/accounts/overview
// ============================================================
export const getAccountsOverview = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select('alertPreferences');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const allAccounts = await Account.find({ userId }).lean();
    const loans = await Loan.find({ userId, status: { $ne: 'Paid Off' } }).lean();

    // Only Checking + Savings are considered accounts.
    // Credit cards are managed via the Cards module, not here.
    const realAccounts = allAccounts.filter(
      (a) => (a.type || '').toLowerCase() !== 'credit'
    );

    const accountBalance = realAccounts.reduce(
      (sum, acc) => sum + (acc.totalBalance || 0),
      0
    );

    const checkingAccounts = realAccounts.filter((a) => a.type === 'Checking');
    const savingsAccounts  = realAccounts.filter((a) => a.type === 'Savings');

    const primaryChecking =
      checkingAccounts.find((a) => a.isPrimary) || checkingAccounts[0] || null;

    let primaryCheckingTransactions = [];
    if (primaryChecking) {
      primaryCheckingTransactions = await Transaction.find({
        userId,
        accountId: primaryChecking._id,
        date: { $lte: new Date() },
      })
        .sort({ date: -1 })
        .limit(10)
        .lean();
    }

    const alerts = {
      ...DEFAULT_ALERTS,
      ...(user.alertPreferences?.toObject?.() || user.alertPreferences || {}),
    };

    res.json({
      balance: accountBalance,
      accounts: {
        checking: checkingAccounts.map(formatAccount),
        savings:  savingsAccounts.map(formatAccount),
      },
      loans: loans.map(formatLoan),
      primaryChecking: primaryChecking
        ? {
            ...formatAccount(primaryChecking),
            transactions: primaryCheckingTransactions.map((tx) => ({
              _id: tx._id,
              description: tx.description,
              category: tx.category || tx.type,
              amount: signedAmount(tx),
              type: tx.type,
              status: tx.status,
              date: tx.date,
            })),
          }
        : null,
      alertPreferences: alerts,
    });
  } catch (error) {
    console.error('❌ getAccountsOverview error:', error);
    res.status(500).json({ error: 'Failed to load accounts overview' });
  }
};

// ============================================================
// PUT /api/accounts/alerts
// ============================================================
export const updateAlertPreferences = async (req, res) => {
  try {
    const userId = req.user._id;

    const ALLOWED_KEYS = [
      'lowBalance',
      'largeTransaction',
      'deposit',
      'paymentReminder',
      'monthlyStatement',
    ];

    const updates = {};
    for (const key of ALLOWED_KEYS) {
      if (typeof req.body[key] === 'boolean') {
        updates[`alertPreferences.${key}`] = req.body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid alert preferences provided' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { returnDocument: 'after', select: 'alertPreferences' }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Alert preferences updated',
      alertPreferences: {
        lowBalance:       updatedUser.alertPreferences.lowBalance,
        largeTransaction: updatedUser.alertPreferences.largeTransaction,
        deposit:          updatedUser.alertPreferences.deposit,
        paymentReminder:  updatedUser.alertPreferences.paymentReminder,
        monthlyStatement: updatedUser.alertPreferences.monthlyStatement,
      },
    });
  } catch (error) {
    console.error('❌ updateAlertPreferences error:', error);
    res.status(500).json({ error: 'Failed to update alert preferences' });
  }
};

// ============================================================
// Helpers
// ============================================================
function formatAccount(acc) {
  return {
    id: acc._id,
    type: acc.type,
    subType: acc.subType || null,
    accountNumber: acc.accountNumber,
    lastFour: acc.accountNumber ? acc.accountNumber.slice(-4) : '',
    balance: acc.totalBalance ?? 0,
    interestRate: acc.interestRate ?? null,
    status: acc.status,
    isPrimary: !!acc.isPrimary,
  };
}

function formatLoan(loan) {
  return {
    id: loan._id,
    type: loan.type,
    name: loan.name,
    accountNumber: loan.accountNumber,
    lastFour: loan.accountNumber ? loan.accountNumber.slice(-4) : '',
    originalAmount: loan.originalAmount,
    currentBalance: loan.currentBalance,
    interestRate: loan.interestRate,
    monthlyPayment: loan.monthlyPayment,
    nextPaymentDate: loan.nextPaymentDate,
    termMonths: loan.termMonths,
    monthsRemaining: loan.monthsRemaining,
    status: loan.status,
  };
}