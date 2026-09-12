// controllers/adminStatementsController.js
import Statement from '../models/Statement.js';
import User from '../models/User.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import { generateStatementPdf } from '../utils/statementPdf.js';

// ── Helpers ──
const monthKeyOf = (d) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
};

const monthLabelOf = (monthKey) => {
  const [y, m] = monthKey.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
};

const accountLabel = (acc) => {
  if (!acc) return 'All Accounts';
  const base = acc.subType ? `${acc.subType} ${acc.type}` : acc.type;
  const last4 = acc.accountNumber ? acc.accountNumber.slice(-4) : '';
  return last4 ? `${base} •••• ${last4}` : base;
};

const formatStatement = (s) => ({
  id: s._id,
  userId: s.userId,
  user: s.userName || '',
  userEmail: s.userEmail || '',
  month: s.month,
  monthLabel: s.monthLabel,
  accountId: s.accountId,
  accountLabel: s.accountLabel,
  generatedAt: s.generatedAt,
  generatedByName: s.generatedByName,
  summary: s.summary,
  status: s.status,
});

// ================================================================
// GET /api/admin/statements
// Query: ?userId=&status=&month=
// ================================================================
export const adminListStatements = async (req, res) => {
  try {
    const { userId, status, month } = req.query;

    const filter = {};
    if (userId) filter.userId = userId;
    if (status) filter.status = status;
    if (month)  filter.month = month;

    const statements = await Statement.find(filter)
      .populate('userId', 'firstName lastName email')
      .sort({ generatedAt: -1 })
      .lean();

    res.json({
      statements: statements.map((s) => {
        const u = s.userId;
        return {
          ...formatStatement(s),
          userId: u?._id || s.userId,
          user: u ? `${u.firstName} ${u.lastName}`.trim() : '—',
          userEmail: u?.email || '',
        };
      }),
    });
  } catch (err) {
    console.error('❌ adminListStatements:', err);
    res.status(500).json({ error: 'Failed to load statements' });
  }
};

// ================================================================
// GET /api/admin/statements/users  — list users for dropdown
// ================================================================
export const adminListUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('firstName lastName username email')
      .sort({ firstName: 1 })
      .lean();

    res.json({
      users: users.map((u) => ({
        id: u._id,
        name: `${u.firstName} ${u.lastName}`.trim(),
        username: u.username,
        email: u.email,
      })),
    });
  } catch (err) {
    console.error('❌ adminListUsers:', err);
    res.status(500).json({ error: 'Failed to load users' });
  }
};

// ================================================================
// GET /api/admin/statements/users/:userId/accounts
// ================================================================
export const adminGetUserAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({
      userId: req.params.userId,
      status: { $ne: 'Closed' },
    })
      .sort({ isPrimary: -1, createdAt: 1 })
      .lean();

    res.json({
      accounts: accounts.map((acc) => ({
        id: acc._id,
        label: accountLabel(acc),
        type: (acc.type || '').toLowerCase(),
        subType: acc.subType || null,
        lastFour: acc.accountNumber ? acc.accountNumber.slice(-4) : '',
      })),
    });
  } catch (err) {
    console.error('❌ adminGetUserAccounts:', err);
    res.status(500).json({ error: 'Failed to load accounts' });
  }
};

// ================================================================
// POST /api/admin/statements
// Body: { userId, month: "YYYY-MM", accountId?: null|string }
// ================================================================
export const adminGenerateStatement = async (req, res) => {
  try {
    const { userId, month, accountId = null } = req.body;

    if (!userId) return res.status(400).json({ error: 'userId is required' });
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ error: 'month must be in YYYY-MM format' });
    }

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Build the snapshot
    const { transactions, summary, accountLabelText } =
      await buildStatementSnapshot({
        userId,
        month,
        accountId: accountId || null,
      });

    const generatingUser = await User.findById(req.user._id)
      .select('firstName lastName')
      .lean();
    const adminName = generatingUser
      ? `${generatingUser.firstName} ${generatingUser.lastName}`.trim()
      : 'Admin';

    // Upsert — regenerating replaces the previous statement
    const statement = await Statement.findOneAndUpdate(
      { userId, month, accountId: accountId || null },
      {
        $set: {
          monthLabel: monthLabelOf(month),
          accountId: accountId || null,
          accountLabel: accountLabelText,
          generatedBy: req.user._id,
          generatedByName: adminName,
          generatedAt: new Date(),
          summary,
          transactions,
          status: 'Available',
        },
      },
      { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
    ).lean();

    res.status(201).json({
      message: 'Statement generated',
      statement: {
        ...formatStatement(statement),
        userId: user._id,
        user: `${user.firstName} ${user.lastName}`.trim(),
        userEmail: user.email,
      },
    });
  } catch (err) {
    console.error('❌ adminGenerateStatement:', err);
    res.status(500).json({ error: 'Failed to generate statement' });
  }
};

// ================================================================
// GET /api/admin/statements/:id  — detail (with transactions)
// ================================================================
export const adminGetStatement = async (req, res) => {
  try {
    const statement = await Statement.findById(req.params.id)
      .populate('userId', 'firstName lastName email')
      .lean();

    if (!statement) return res.status(404).json({ error: 'Statement not found' });

    const u = statement.userId;
    res.json({
      statement: {
        ...formatStatement(statement),
        userId: u?._id || statement.userId,
        user: u ? `${u.firstName} ${u.lastName}`.trim() : '—',
        userEmail: u?.email || '',
        transactions: (statement.transactions || []).map((tx, i) => ({
          id: `${statement._id}-${i}`,
          ...tx,
        })),
      },
    });
  } catch (err) {
    console.error('❌ adminGetStatement:', err);
    res.status(500).json({ error: 'Failed to load statement' });
  }
};

// ================================================================
// GET /api/admin/statements/:id/download  — admin download
// ================================================================
export const adminDownloadStatement = async (req, res) => {
  try {
    const statement = await Statement.findById(req.params.id)
      .populate('userId', 'firstName lastName')
      .lean();

    if (!statement) return res.status(404).json({ error: 'Statement not found' });

    const u = statement.userId;
    const fullName = u ? `${u.firstName} ${u.lastName}`.trim() : '';

    res.setHeader('Content-Type', 'application/pdf');
    const safeName = fullName.replace(/\s+/g, '-') || 'user';
    const safeMonth = statement.month.replace(/[^0-9-]/g, '');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="statement-${safeName}-${safeMonth}.pdf"`
    );

    generateStatementPdf(
      { statement, user: { name: fullName } },
      res
    );
  } catch (err) {
    console.error('❌ adminDownloadStatement:', err);
    res.status(500).json({ error: 'Failed to generate statement PDF' });
  }
};

// ================================================================
// DELETE /api/admin/statements/:id  — revoke
// ================================================================
export const adminRevokeStatement = async (req, res) => {
  try {
    const statement = await Statement.findByIdAndUpdate(
      req.params.id,
      { $set: { status: 'Revoked' } },
      { returnDocument: 'after' }
    ).lean();

    if (!statement) return res.status(404).json({ error: 'Statement not found' });

    res.json({ message: 'Statement revoked', statement: formatStatement(statement) });
  } catch (err) {
    console.error('❌ adminRevokeStatement:', err);
    res.status(500).json({ error: 'Failed to revoke statement' });
  }
};

// ================================================================
// Snapshot builder
// ================================================================
async function buildStatementSnapshot({ userId, month, accountId }) {
  // Accounts scope
  const accountFilter = { userId };
  if (accountId) accountFilter._id = accountId;
  const accounts = await Account.find(accountFilter).lean();
  const accountIds = accounts.map((a) => a._id);

  // Current balance per account — used to walk backwards for running balances
  const runningByAcc = new Map();
  accounts.forEach((a) => runningByAcc.set(String(a._id), a.totalBalance ?? 0));

  // All completed transactions for those accounts, newest first
  const allTx = await Transaction.find({
    userId,
    accountId: { $in: accountIds },
    status: 'Completed',
  })
    .sort({ date: -1, createdAt: -1 })
    .lean();

  // Compute balance AFTER each transaction
  const balanceMap = new Map();
  for (const tx of allTx) {
    const accId = String(tx.accountId);
    const running = runningByAcc.get(accId) ?? 0;
    balanceMap.set(String(tx._id), running);
    runningByAcc.set(accId, running - tx.amount);
  }

  // Filter to the requested month
  const [y, m] = month.split('-').map(Number);
  const start = new Date(y, m - 1, 1);
  const end   = new Date(y, m, 1);

  const monthTx = allTx
    .filter((tx) => {
      const d = new Date(tx.date);
      return d >= start && d < end;
    })
    .reverse(); // oldest first for the statement

  const transactions = monthTx.map((tx) => ({
    date: tx.date,
    description: tx.description || '',
    category: tx.category || '',
    merchant: tx.merchant || '',
    amount: tx.amount,
    balance: balanceMap.get(String(tx._id)) ?? 0,
    type: tx.type || '',
    referenceNumber: tx.referenceNumber || '',
  }));

  let totalIn = 0;
  let totalOut = 0;
  for (const tx of transactions) {
    if (tx.amount >= 0) totalIn  += tx.amount;
    else                totalOut += Math.abs(tx.amount);
  }

  const accountLabelText = accountId
    ? accountLabel(accounts[0])
    : 'All Accounts';

  return {
    transactions,
    summary: {
      totalIn,
      totalOut,
      net: totalIn - totalOut,
      count: transactions.length,
    },
    accountLabelText,
  };
}