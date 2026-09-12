// controllers/accountsController.js
import User from '../models/User.js';
import Account from '../models/Account.js';
import Loan from '../models/Loan.js';
import Transaction from '../models/Transaction.js';

// Default alert preferences in case user has none
const DEFAULT_ALERTS = {
  lowBalance: true,
  largeTransaction: true,
  deposit: true,
  paymentReminder: true,
  monthlyStatement: true,
};

// Which types count as money-in vs money-out
const POSITIVE_TX_TYPES = ['credit', 'deposit'];
const isPositiveTransaction = (tx) =>
  POSITIVE_TX_TYPES.includes((tx.type || '').toLowerCase());

// Returns amount with the correct sign for display
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

    const totalBalance = allAccounts.reduce((sum, acc) => sum + (acc.totalBalance || 0), 0);
    const availableBalance = allAccounts.reduce((sum, acc) => sum + (acc.availableBalance || 0), 0);
    const pendingBalance = allAccounts.reduce((sum, acc) => sum + (acc.pendingBalance || 0), 0);

    const checkingAccounts = allAccounts.filter((a) => a.type === 'Checking');
    const savingsAccounts  = allAccounts.filter((a) => a.type === 'Savings');
    const creditAccounts   = allAccounts.filter((a) => a.type === 'Credit');

    const primaryChecking =
      checkingAccounts.find((a) => a.isPrimary) || checkingAccounts[0] || null;

    let primaryCheckingTransactions = [];
    if (primaryChecking) {
      primaryCheckingTransactions = await Transaction.find({
        userId,
        accountId: primaryChecking._id,
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
      balances: {
        total: totalBalance,
        available: availableBalance,
        pending: pendingBalance,
      },
      accounts: {
        checking: checkingAccounts.map(formatAccount),
        savings:  savingsAccounts.map(formatAccount),
        credit:   creditAccounts.map(formatAccount),
      },
      loans: loans.map(formatLoan),
      primaryChecking: primaryChecking
        ? {
            ...formatAccount(primaryChecking),
            transactions: primaryCheckingTransactions.map((tx) => ({
              _id: tx._id,
              description: tx.description,
              category: tx.category || tx.type,
              amount: signedAmount(tx),      // ⬅️ signed in backend
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
    totalBalance: acc.totalBalance ?? 0,
    availableBalance: acc.availableBalance ?? 0,
    pendingBalance: acc.pendingBalance ?? 0,
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