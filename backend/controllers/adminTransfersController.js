// controllers/adminTransfersController.js
import Transfer from '../models/Transfer.js';
import { executeTransfer } from '../utils/transferExecutor.js';

// ── Formatter ────────────────────────────────────────────────
const formatTransfer = (t) => {
  const u = t.userId;
  const wireFee = Number(t.wireFee) || 0;
  const amount = Number(t.amount) || 0;
  const totalDebit =
    Number.isFinite(Number(t.totalDebit)) && t.totalDebit > 0
      ? Number(t.totalDebit)
      : amount + wireFee;

  return {
    id: t._id,
    transactionNumber: t.transactionNumber,
    userId: u?._id || u,
    user: u && u.firstName ? `${u.firstName} ${u.lastName}`.trim() : '—',
    userEmail: u?.email || '',
    type: t.type,
    from: t.fromAccountName || '',
    fromLastFour: t.fromLastFour || '',
    to:
      t.toAccountName ||
      t.recipient?.bankName ||
      (t.recipient?.fullName ? t.recipient.fullName : ''),
    toLastFour:
      t.toLastFour || (t.recipient?.accountNumber || '').slice(-4),
    recipientName: t.recipient?.fullName || '',
    amount,
    wireFee,
    totalDebit,
    status: t.status || 'Pending',
    memo: t.memo || '',
    date: t.transferDate,
    createdAt: t.createdAt,
    completedAt: t.completedAt,
    failedAt: t.failedAt,
    adminNote: t.adminNote || '',
  };
};

// ================================================================
// GET /api/admin/transfers
// ================================================================
export const adminListTransfers = async (req, res) => {
  try {
    const completedPage = Math.max(1, parseInt(req.query.completedPage) || 1);
    const completedLimit = Math.min(
      50,
      Math.max(1, parseInt(req.query.completedLimit) || 10)
    );
    const skip = (completedPage - 1) * completedLimit;

    const [pending, failed, completedTotal, completed] = await Promise.all([
      Transfer.find({ status: 'Pending' })
        .populate('userId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .lean(),

      Transfer.find({ status: 'Failed' })
        .populate('userId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .lean(),

      Transfer.countDocuments({ status: 'Completed' }),

      Transfer.find({ status: 'Completed' })
        .populate('userId', 'firstName lastName email')
        .sort({ completedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(completedLimit)
        .lean(),
    ]);

    res.json({
      pending: pending.map(formatTransfer),
      failed: failed.map(formatTransfer),
      completed: {
        items: completed.map(formatTransfer),
        page: completedPage,
        limit: completedLimit,
        total: completedTotal,
        hasMore: skip + completed.length < completedTotal,
      },
    });
  } catch (err) {
    console.error('❌ adminListTransfers:', err);
    res.status(500).json({ error: 'Failed to load transfers' });
  }
};

// ================================================================
// PUT /api/admin/transfers/:id/status
// ================================================================
export const adminUpdateTransferStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    if (!['Completed', 'Failed', 'Pending'].includes(status)) {
      return res
        .status(400)
        .json({ error: 'Status must be Completed, Failed, or Pending' });
    }

    const transfer = await Transfer.findById(id);
    if (!transfer) return res.status(404).json({ error: 'Transfer not found' });

    if (transfer.status === 'Completed' && status !== 'Completed') {
      return res
        .status(400)
        .json({ error: 'Completed transfers cannot be changed' });
    }

    // ── COMPLETED — run the money movement ────────────────────
    if (status === 'Completed') {
      if (transfer.status === 'Completed') {
        const populated = await Transfer.findById(id)
          .populate('userId', 'firstName lastName email')
          .lean();
        return res.json({
          message: 'Transfer already completed',
          transfer: formatTransfer(populated),
        });
      }

      const exec = await executeTransfer(id);

      if (exec?.failed) {
        return res.status(400).json({
          error:
            'Transfer could not be completed: ' +
            (exec.reason || 'unknown reason'),
          transfer: exec.transfer,
        });
      }

      if (adminNote) {
        await Transfer.findByIdAndUpdate(id, { adminNote });
      }

      const updated = await Transfer.findById(id)
        .populate('userId', 'firstName lastName email')
        .lean();

      return res.json({
        message: 'Transfer completed — balances updated',
        transfer: formatTransfer(updated),
      });
    }

    // ── FAILED or PENDING — status only ──────────────────────
    transfer.status = status;
    if (status === 'Failed') transfer.failedAt = new Date();
    if (adminNote) transfer.adminNote = adminNote;
    await transfer.save();

    const populated = await Transfer.findById(id)
      .populate('userId', 'firstName lastName email')
      .lean();

    res.json({
      message: `Transfer marked ${status}`,
      transfer: formatTransfer(populated),
    });
  } catch (err) {
    console.error('❌ adminUpdateTransferStatus:', err);
    res.status(500).json({ error: 'Failed to update transfer status' });
  }
};