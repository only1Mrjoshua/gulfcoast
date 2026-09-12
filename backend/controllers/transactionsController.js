// controllers/transactionsController.js
import Transaction from '../models/Transaction.js';
import Account from '../models/Account.js';
import User from '../models/User.js';
import Report from '../models/Report.js';
import { generateTransactionsPdf } from '../utils/transactionPdf.js';

// ---------- Helpers ----------
const normalizeType = (t) => (t || '').toLowerCase();
const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

const TYPE_ALIASES = {
  purchase:   ['purchase', 'debit'],
  deposit:    ['deposit', 'credit'],
  transfer:   ['transfer'],
  payment:    ['payment'],
  withdrawal: ['withdrawal'],
  fee:        ['fee'],
  interest:   ['interest'],
};

const SMART_CATEGORY = {
  purchase:   'Purchase',
  debit:      'Purchase',
  deposit:    'Deposit',
  credit:     'Deposit',
  transfer:   'Transfer',
  payment:    'Payment',
  withdrawal: 'Withdrawal',
  fee:        'Fee',
  interest:   'Interest',
};

const smartCategory = (type, existing) => {
  if (existing && existing.trim()) return existing.trim();
  return SMART_CATEGORY[(type || '').toLowerCase()] || 'Other';
};

const formatMonthLabel = (monthKey) => {
  if (!monthKey) return '';
  const [y, m] = monthKey.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
};

const monthKeyOf = (d) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
};

const getReference = (tx) =>
  tx.referenceNumber || `TXN-${String(tx._id).slice(-8).toUpperCase()}`;

const accountLabel = (acc) =>
  acc ? (acc.subType ? `${acc.subType} ${acc.type}` : acc.type) : 'Account';

async function buildBalanceMap(userId) {
  const [accounts, allTxs] = await Promise.all([
    Account.find({ userId }).select('_id totalBalance').lean(),
    Transaction.find({ userId })
      .select('_id accountId amount date createdAt')
      .sort({ date: -1, createdAt: -1 })
      .lean(),
  ]);

  const currentByAcc = new Map();
  accounts.forEach((a) => currentByAcc.set(String(a._id), a.totalBalance ?? 0));

  const byAcc = new Map();
  for (const tx of allTxs) {
    const key = String(tx.accountId);
    if (!byAcc.has(key)) byAcc.set(key, []);
    byAcc.get(key).push(tx);
  }

  const balanceMap = new Map();
  for (const [accId, list] of byAcc) {
    let running = currentByAcc.get(accId) ?? 0;
    for (const tx of list) {
      balanceMap.set(String(tx._id), running);
      running -= tx.amount;
    }
  }
  return balanceMap;
}

const formatTransaction = (tx, acc, runningBalance) => ({
  id: tx._id,
  description: tx.description,
  category: smartCategory(tx.type, tx.category),
  merchant: tx.merchant || '',
  referenceNumber: getReference(tx),
  accountId: tx.accountId,
  accountName: accountLabel(acc),
  accountLastFour: acc?.accountNumber ? acc.accountNumber.slice(-4) : '',
  date: tx.date,
  amount: tx.amount,
  balance: runningBalance ?? 0,
  type: normalizeType(tx.type),
  status: capitalize(tx.status || 'Completed'),
  location: tx.location || '',
  paymentMethod: tx.paymentMethod || '',
});

// ================================================================
// GET /api/transactions/months
// ================================================================
export const getMonthsOverview = async (req, res) => {
  try {
    const userId = req.user._id;

    const txs = await Transaction.find({
    userId,
    status: 'Completed',
    date: { $lte: new Date() },
    })
    .select('date amount')
    .lean();

    const map = new Map();

    for (const tx of txs) {
      const key = monthKeyOf(tx.date);
      if (!map.has(key)) map.set(key, { key, totalIn: 0, totalOut: 0, count: 0 });
      const m = map.get(key);
      if (tx.amount >= 0) m.totalIn  += tx.amount;
      else                m.totalOut += Math.abs(tx.amount);
      m.count += 1;
    }

    const currentKey = monthKeyOf(new Date());
    if (!map.has(currentKey)) {
      map.set(currentKey, { key: currentKey, totalIn: 0, totalOut: 0, count: 0 });
    }

    const months = Array.from(map.values())
      .map((m) => ({
        key: m.key,
        label: formatMonthLabel(m.key),
        totalIn: m.totalIn,
        totalOut: m.totalOut,
        net: m.totalIn - m.totalOut,
        count: m.count,
      }))
      .sort((a, b) => b.key.localeCompare(a.key));

    res.json({ months });
  } catch (err) {
    console.error('❌ getMonthsOverview:', err);
    res.status(500).json({ error: 'Failed to load transaction months' });
  }
};

// ================================================================
// GET /api/transactions/filter-options
// ================================================================
export const getFilterOptions = async (req, res) => {
  try {
    const userId = req.user._id;

    const [accounts, categoriesRaw] = await Promise.all([
      Account.find({ userId, status: { $ne: 'Closed' } })
        .sort({ isPrimary: -1, createdAt: 1 })
        .lean(),
      Transaction.distinct('category', { userId }),
    ]);

    const categories = categoriesRaw
      .filter((c) => c && c.trim())
      .sort((a, b) => a.localeCompare(b));

    res.json({
      accounts: accounts.map((acc) => ({
        id: acc._id,
        name: accountLabel(acc),
        type: normalizeType(acc.type),
        lastFour: acc.accountNumber ? acc.accountNumber.slice(-4) : '',
      })),
      categories,
    });
  } catch (err) {
    console.error('❌ getFilterOptions:', err);
    res.status(500).json({ error: 'Failed to load filter options' });
  }
};

// ================================================================
// GET /api/transactions
// Query params:
//   month=YYYY-MM        → primary selector
//   fromDate, toDate     → optional custom range
//   accountId, search, type, category, minAmount, maxAmount
//   page (default 1), limit (default 15, max 100)
// ================================================================
export const getTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      month,
      accountId,
      search,
      type,
      category,
      minAmount,
      maxAmount,
      fromDate,
      toDate,
      page = 1,
      limit = 15,
    } = req.query;

    const pageNum  = Math.max(1, parseInt(page) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit) || 15));

    const filter = { userId, status: 'Completed' };

    if (fromDate || toDate) {
      filter.date = {};
      if (fromDate) filter.date.$gte = new Date(fromDate);
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    } else if (month) {
      const [y, m] = month.split('-').map(Number);
      filter.date = { $gte: new Date(y, m - 1, 1), $lt: new Date(y, m, 1) };
    }

    if (accountId && accountId !== 'all') filter.accountId = accountId;
    if (category && category !== 'All') filter.category = category;
    if (type && type !== 'all') {
      const aliases = TYPE_ALIASES[type] || [type];
      filter.type = { $in: aliases };
    }

    const amountConds = [];
    if (minAmount) {
      const n = parseFloat(minAmount);
      if (!isNaN(n)) amountConds.push({ $gte: [{ $abs: '$amount' }, n] });
    }
    if (maxAmount) {
      const n = parseFloat(maxAmount);
      if (!isNaN(n)) amountConds.push({ $lte: [{ $abs: '$amount' }, n] });
    }
    if (amountConds.length) filter.$expr = { $and: amountConds };

    let txs = await Transaction.find(filter).sort({ date: -1, createdAt: -1 }).lean();

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      txs = txs.filter((tx) =>
        (tx.description    || '').toLowerCase().includes(q) ||
        (tx.category       || '').toLowerCase().includes(q) ||
        (tx.merchant       || '').toLowerCase().includes(q) ||
        (tx.referenceNumber|| '').toLowerCase().includes(q)
      );
    }

    const [accounts, balanceMap] = await Promise.all([
      Account.find({ userId }).lean(),
      buildBalanceMap(userId),
    ]);
    const accById = new Map(accounts.map((a) => [String(a._id), a]));

    const formatted = txs.map((tx) =>
      formatTransaction(
        tx,
        accById.get(String(tx.accountId)),
        balanceMap.get(String(tx._id))
      )
    );

    // ── Summary across the WHOLE filtered set (not just this page) ──
    let totalIn = 0, totalOut = 0;
    for (const tx of formatted) {
      if (tx.amount >= 0) totalIn  += tx.amount;
      else                totalOut += Math.abs(tx.amount);
    }

    // ── Paginate ────────────────────────────────────────
    const total = formatted.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const startIdx = (pageNum - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    const pageItems = formatted.slice(startIdx, endIdx);

    res.json({
      transactions: pageItems,
      summary: {
        totalIn,
        totalOut,
        net: totalIn - totalOut,
        count: total,
      },
      pagination: {
        page: pageNum,
        limit: pageSize,
        total,
        totalPages,
        hasMore: endIdx < total,
      },
    });
  } catch (err) {
    console.error('❌ getTransactions:', err);
    res.status(500).json({ error: 'Failed to load transactions' });
  }
};

// ================================================================
// GET /api/transactions/download
// (Always includes ALL matching transactions — no pagination)
// ================================================================
export const downloadTransactionsPdf = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      month,
      accountId,
      search,
      type,
      category,
      minAmount,
      maxAmount,
      fromDate,
      toDate,
    } = req.query;

    const user = await User.findById(userId).select('firstName lastName').lean();
    const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : '';

    const filter = { userId, status: 'Completed' };

    if (fromDate || toDate) {
      filter.date = {};
      if (fromDate) filter.date.$gte = new Date(fromDate);
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    } else if (month) {
      const [y, m] = month.split('-').map(Number);
      filter.date = { $gte: new Date(y, m - 1, 1), $lt: new Date(y, m, 1) };
    }

    if (accountId && accountId !== 'all') filter.accountId = accountId;
    if (category && category !== 'All') filter.category = category;
    if (type && type !== 'all') {
      const aliases = TYPE_ALIASES[type] || [type];
      filter.type = { $in: aliases };
    }

    const amountConds = [];
    if (minAmount) {
      const n = parseFloat(minAmount);
      if (!isNaN(n)) amountConds.push({ $gte: [{ $abs: '$amount' }, n] });
    }
    if (maxAmount) {
      const n = parseFloat(maxAmount);
      if (!isNaN(n)) amountConds.push({ $lte: [{ $abs: '$amount' }, n] });
    }
    if (amountConds.length) filter.$expr = { $and: amountConds };

    let txs = await Transaction.find(filter).sort({ date: 1, createdAt: 1 }).lean();

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      txs = txs.filter((tx) =>
        (tx.description    || '').toLowerCase().includes(q) ||
        (tx.category       || '').toLowerCase().includes(q) ||
        (tx.merchant       || '').toLowerCase().includes(q) ||
        (tx.referenceNumber|| '').toLowerCase().includes(q)
      );
    }

    const [accounts, balanceMap] = await Promise.all([
      Account.find({ userId }).lean(),
      buildBalanceMap(userId),
    ]);
    const accById = new Map(accounts.map((a) => [String(a._id), a]));

    const formatted = txs.map((tx) =>
      formatTransaction(
        tx,
        accById.get(String(tx.accountId)),
        balanceMap.get(String(tx._id))
      )
    );

    let totalIn = 0, totalOut = 0;
    for (const tx of formatted) {
      if (tx.amount >= 0) totalIn  += tx.amount;
      else                totalOut += Math.abs(tx.amount);
    }

    let periodLabel;
    if (fromDate || toDate) {
      periodLabel = `${fromDate || 'Start'} to ${toDate || 'Today'}`;
    } else if (month) {
      periodLabel = formatMonthLabel(month);
    } else {
      periodLabel = 'All Transactions';
    }

    let accountLabelText = '';
    if (accountId && accountId !== 'all') {
      const acc = accById.get(String(accountId));
      accountLabelText = acc
        ? `${accountLabel(acc)} •••• ${acc.accountNumber?.slice(-4) || ''}`
        : '';
    }

    res.setHeader('Content-Type', 'application/pdf');
    const safeLabel = periodLabel.replace(/[^a-zA-Z0-9-]/g, '_');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="transactions-${safeLabel}.pdf"`
    );

    generateTransactionsPdf(
      {
        transactions: formatted,
        summary: {
          totalIn,
          totalOut,
          net: totalIn - totalOut,
          count: formatted.length,
        },
        user: { name: fullName },
        periodLabel,
        accountLabel: accountLabelText,
      },
      res
    );
  } catch (err) {
    console.error('❌ downloadTransactionsPdf:', err);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
};

// ================================================================
// POST /api/transactions/:id/report
// ================================================================
export const reportTransaction = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'Reason is required' });
    }
    if (reason.length > 2000) {
      return res.status(400).json({ error: 'Reason is too long (max 2000 chars)' });
    }

    const tx = await Transaction.findOne({ _id: id, userId }).lean();
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });

    const existing = await Report.findOne({
      userId,
      transactionId: tx._id,
      status: { $in: ['Open', 'In Review'] },
    });
    if (existing) {
      return res.status(400).json({
        error: 'You already have an open report on this transaction.',
        report: {
          id: existing._id,
          referenceNumber: existing.referenceNumber,
          status: existing.status,
          submittedAt: existing.submittedAt,
        },
      });
    }

    const referenceNumber =
      'RPT-' + Math.floor(100000 + Math.random() * 900000);

    const report = await Report.create({
      userId,
      transactionId: tx._id,
      transactionDescription: tx.description,
      transactionAmount: tx.amount,
      referenceNumber,
      reason: reason.trim(),
      status: 'Open',
      submittedAt: new Date(),
    });

    res.status(201).json({
      message:
        'Report submitted. A designated agent will reach out to you shortly.',
      report: {
        id: report._id,
        referenceNumber: report.referenceNumber,
        status: report.status,
        submittedAt: report.submittedAt,
        transactionId: report.transactionId,
      },
    });
  } catch (err) {
    console.error('❌ reportTransaction:', err);
    res.status(500).json({ error: 'Failed to submit report' });
  }
};