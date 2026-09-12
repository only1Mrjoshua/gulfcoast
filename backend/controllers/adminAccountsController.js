// controllers/adminAccountsController.js
import Account from '../models/Account.js';
import User from '../models/User.js';

// ── Helpers ──────────────────────────────────────────
const getAccountLabel = (acc) => {
  if (!acc) return '';
  const base = acc.subType ? `${acc.subType} ${acc.type}` : acc.type;
  const last4 = acc.accountNumber ? acc.accountNumber.slice(-4) : '';
  return last4 ? `${base} •••• ${last4}` : base;
};

const formatAccount = (acc, user) => {
  const u = user || acc.userId;
  return {
    id: acc._id,
    userId: u?._id || acc.userId,
    user: u && u.firstName ? `${u.firstName} ${u.lastName}`.trim() : '—',
    userEmail: u?.email || '',
    accountNumber: acc.accountNumber || '',
    lastFour: acc.accountNumber ? acc.accountNumber.slice(-4) : '',
    type: acc.type,
    subType: acc.subType || null,
    balance: acc.totalBalance ?? 0,
    interestRate: acc.interestRate ?? null,
    status: acc.status || 'Active',
    isPrimary: !!acc.isPrimary,
    createdAt: acc.createdAt,
  };
};

// ================================================================
// GET /api/admin/accounts
// Only Checking + Savings accounts.
// ================================================================
export const adminListAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({
      type: { $in: ['Checking', 'Savings'] },
    })
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ accounts: accounts.map((a) => formatAccount(a, a.userId)) });
  } catch (err) {
    console.error('❌ adminListAccounts:', err);
    res.status(500).json({ error: 'Failed to load accounts' });
  }
};

// ================================================================
// GET /api/admin/accounts/users
// ================================================================
export const adminListAccountUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('firstName lastName email username')
      .sort({ firstName: 1 })
      .lean();

    res.json({
      users: users.map((u) => ({
        id: u._id,
        name: `${u.firstName} ${u.lastName}`.trim(),
        email: u.email,
        username: u.username,
      })),
    });
  } catch (err) {
    console.error('❌ adminListAccountUsers:', err);
    res.status(500).json({ error: 'Failed to load users' });
  }
};

// ================================================================
// POST /api/admin/accounts
// Only Checking + Savings can be created.
// ================================================================
export const adminCreateAccount = async (req, res) => {
  try {
    const {
      userId,
      accountNumber,
      type,
      subType = null,
      balance = 0,
      interestRate = null,
      status = 'Active',
    } = req.body;

    if (!userId)         return res.status(400).json({ error: 'User is required' });
    if (!accountNumber)  return res.status(400).json({ error: 'Account number is required' });
    if (!type)           return res.status(400).json({ error: 'Account type is required' });
    if (!['Checking', 'Savings'].includes(type)) {
      return res
        .status(400)
        .json({ error: 'Account type must be Checking or Savings' });
    }

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const existing = await Account.findOne({
      accountNumber: String(accountNumber),
    }).lean();
    if (existing) {
      return res
        .status(400)
        .json({ error: 'An account with this number already exists' });
    }

    const balanceNum = parseFloat(balance) || 0;

    const account = await Account.create({
      userId,
      accountNumber: String(accountNumber),
      type,
      subType: type === 'Savings' ? (subType || 'Standard') : null,
      totalBalance: balanceNum,
      availableBalance: balanceNum,
      pendingBalance: 0,
      interestRate: type === 'Savings' ? (parseFloat(interestRate) || 0) : null,
      status,
      isPrimary: false,
    });

    const populated = await Account.findById(account._id)
      .populate('userId', 'firstName lastName email')
      .lean();

    res.status(201).json({
      message: 'Account created',
      account: formatAccount(populated, populated.userId),
    });
  } catch (err) {
    console.error('❌ adminCreateAccount:', err);
    res.status(500).json({ error: 'Failed to create account' });
  }
};

// ================================================================
// PUT /api/admin/accounts/:id
// ================================================================
export const adminUpdateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const account = await Account.findById(id);
    if (!account) return res.status(404).json({ error: 'Account not found' });

    // ── Account number ──
    if (typeof body.accountNumber === 'string' && body.accountNumber.trim()) {
      const conflict = await Account.findOne({
        _id: { $ne: account._id },
        accountNumber: body.accountNumber.trim(),
      }).lean();
      if (conflict) {
        return res
          .status(400)
          .json({ error: 'Another account already uses this number' });
      }
      account.accountNumber = body.accountNumber.trim();
    }

    // ── Type + subType + interestRate ──
    if (
      typeof body.type === 'string' &&
      ['Checking', 'Savings'].includes(body.type)
    ) {
      account.type = body.type;
      if (body.type !== 'Savings') {
        account.subType = null;
        account.interestRate = null;
      } else {
        account.subType = body.subType || account.subType || 'Standard';
      }
    }

    if (body.subType !== undefined && account.type === 'Savings') {
      account.subType = body.subType || 'Standard';
    }

    if (body.interestRate !== undefined && account.type === 'Savings') {
      account.interestRate =
        body.interestRate === '' || body.interestRate === null
          ? null
          : parseFloat(body.interestRate);
    }

    // ── Balance ──
    if (body.balance !== undefined) {
      const balanceNum = parseFloat(body.balance) || 0;
      account.totalBalance = balanceNum;
      account.availableBalance = balanceNum;
    }
    account.pendingBalance = 0;

    // ── Status ──
    if (
      typeof body.status === 'string' &&
      ['Active', 'Suspended', 'Closed'].includes(body.status)
    ) {
      account.status = body.status;
    }

    await account.save();

    const populated = await Account.findById(account._id)
      .populate('userId', 'firstName lastName email')
      .lean();

    res.json({
      message: 'Account updated',
      account: formatAccount(populated, populated.userId),
    });
  } catch (err) {
    console.error('❌ adminUpdateAccount:', err);
    res.status(500).json({ error: 'Failed to update account' });
  }
};

// ================================================================
// GET /api/admin/accounts/:id
// ================================================================
export const adminGetAccount = async (req, res) => {
  try {
    const account = await Account.findById(req.params.id)
      .populate('userId', 'firstName lastName email')
      .lean();
    if (!account) return res.status(404).json({ error: 'Account not found' });

    res.json({ account: formatAccount(account, account.userId) });
  } catch (err) {
    console.error('❌ adminGetAccount:', err);
    res.status(500).json({ error: 'Failed to load account' });
  }
};