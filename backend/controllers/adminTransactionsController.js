// controllers/adminTransactionsController.js
import Transaction from '../models/Transaction.js';

// ----------------------------------------------------------------
// Format helper — handles both populated and non-populated userId
// ----------------------------------------------------------------
const formatTransaction = (t) => {
  const u = t.userId;
  const isPopulated =
    u && typeof u === 'object' && (u.firstName || u.lastName || u.email);

  return {
    id: t._id,
    userId: isPopulated ? u._id : u,
    user: isPopulated
      ? `${u.firstName || ''} ${u.lastName || ''}`.trim() || '—'
      : t.userName || '—',
    userEmail: isPopulated ? u.email || '' : t.userEmail || '',
    accountId: t.accountId,
    accountName: t.accountName || '',
    accountLastFour: t.accountLastFour || '',
    description: t.description || '',
    amount: t.amount,
    type: t.type || '',
    status: t.status || '',
    date: t.date || t.createdAt,
  };
};

// ================================================================
// GET /api/admin/transactions
// Optional query params:
//   ?search=...   → case-insensitive filter on id / user / description
//   ?type=deposit → filter by transaction type
//   ?limit=500    → hard cap on rows returned (default 500, max 2000)
// ================================================================
export const adminListTransactions = async (req, res) => {
  try {
    const { search = '', type } = req.query;

    const requestedLimit = parseInt(req.query.limit, 10);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 2000)
      : 500;

    const filter = {};
    if (type) filter.type = type;

    const transactions = await Transaction.find(filter)
      .populate('userId', 'firstName lastName email')
      .sort({ date: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    const formatted = transactions.map(formatTransaction);

    // Post-populate text search — the user field only exists after populate
    const q = String(search).trim().toLowerCase();
    const filtered = q
      ? formatted.filter(
          (t) =>
            String(t.id).toLowerCase().includes(q) ||
            (t.user || '').toLowerCase().includes(q) ||
            (t.userEmail || '').toLowerCase().includes(q) ||
            (t.description || '').toLowerCase().includes(q)
        )
      : formatted;

    res.json({ transactions: filtered });
  } catch (err) {
    console.error('❌ adminListTransactions:', err);
    res.status(500).json({ error: 'Failed to load transactions' });
  }
};