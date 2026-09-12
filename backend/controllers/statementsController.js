// controllers/statementsController.js
import Statement from '../models/Statement.js';
import User from '../models/User.js';
import Account from '../models/Account.js';
import { generateStatementPdf } from '../utils/statementPdf.js';

// ── Formatting helpers ────────────────────────────────────────
function formatStatement(s) {
  return {
    id: s._id,
    month: s.month,
    monthLabel: s.monthLabel,
    year: Number(s.month.split('-')[0]),
    accountId: s.accountId,
    accountLabel: s.accountLabel,
    generatedAt: s.generatedAt,
    generatedByName: s.generatedByName,
    summary: s.summary,
    status: s.status,
  };
}

function formatStatementFull(s) {
  return {
    ...formatStatement(s),
    transactions: (s.transactions || []).map((tx, i) => ({
      id: `${s._id}-${i}`,
      date: tx.date,
      description: tx.description,
      category: tx.category,
      merchant: tx.merchant,
      amount: tx.amount,
      balance: tx.balance,
      type: tx.type,
      referenceNumber: tx.referenceNumber,
    })),
  };
}

function accountLabel(acc) {
  if (!acc) return 'Account';
  const base = acc.subType ? `${acc.subType} ${acc.type}` : acc.type;
  const last4 = acc.accountNumber ? acc.accountNumber.slice(-4) : '';
  return last4 ? `${base} •••• ${last4}` : base;
}

// ================================================================
// GET /api/statements  — list the user's available statements
// ================================================================
export const getMyStatements = async (req, res) => {
  try {
    const userId = req.user._id;

    const statements = await Statement.find({
      userId,
      status: 'Available',
    })
      .sort({ month: -1, generatedAt: -1 })
      .lean();

    res.json({
      statements: statements.map(formatStatement),
    });
  } catch (err) {
    console.error('❌ getMyStatements:', err);
    res.status(500).json({ error: 'Failed to load statements' });
  }
};

// ================================================================
// GET /api/statements/accounts
// Returns the accounts that have at least one available statement,
// plus a flag indicating whether an "All Accounts" statement exists.
// ================================================================
export const getStatementAccounts = async (req, res) => {
  try {
    const userId = req.user._id;

    const accountIds = await Statement.distinct('accountId', {
      userId,
      status: 'Available',
    });

    // accountId === null means the statement covers all accounts
    const hasAllAccounts = accountIds.some((id) => id === null || id === undefined);
    const realAccountIds = accountIds.filter(Boolean);

    const accounts = realAccountIds.length > 0
      ? await Account.find({ _id: { $in: realAccountIds }, userId })
          .select('type subType accountNumber')
          .lean()
      : [];

    res.json({
      accounts: accounts.map((acc) => ({
        id: acc._id,
        label: accountLabel(acc),
        type: (acc.type || '').toLowerCase(),
        subType: acc.subType || null,
        lastFour: acc.accountNumber ? acc.accountNumber.slice(-4) : '',
      })),
      hasAllAccounts,
    });
  } catch (err) {
    console.error('❌ getStatementAccounts:', err);
    res.status(500).json({ error: 'Failed to load statement accounts' });
  }
};

// ================================================================
// GET /api/statements/:id  — one statement, full detail
// ================================================================
export const getMyStatement = async (req, res) => {
  try {
    const userId = req.user._id;
    const statement = await Statement.findOne({
      _id: req.params.id,
      userId,
      status: 'Available',
    }).lean();

    if (!statement) {
      return res.status(404).json({ error: 'Statement not found' });
    }

    res.json({ statement: formatStatementFull(statement) });
  } catch (err) {
    console.error('❌ getMyStatement:', err);
    res.status(500).json({ error: 'Failed to load statement' });
  }
};

// ================================================================
// GET /api/statements/:id/download  — stream the PDF
// ================================================================
export const downloadMyStatement = async (req, res) => {
  try {
    const userId = req.user._id;
    const statement = await Statement.findOne({
      _id: req.params.id,
      userId,
      status: 'Available',
    }).lean();

    if (!statement) {
      return res.status(404).json({ error: 'Statement not found' });
    }

    const user = await User.findById(userId)
      .select('firstName lastName')
      .lean();
    const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : '';

    // ⬇️ NEW: "Emily Davis September 2026 Statement.pdf"
    const filename = `${fullName} ${statement.monthLabel} Statement.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"`
    );

    generateStatementPdf({ statement, user: { name: fullName } }, res);
  } catch (err) {
    console.error('❌ downloadMyStatement:', err);
    res.status(500).json({ error: 'Failed to generate statement PDF' });
  }
};