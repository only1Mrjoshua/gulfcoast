// controllers/adminTransfersController.js
import Transfer from '../models/Transfer.js';
import { executeTransfer } from '../utils/transferExecutor.js';

// ================================================================
// GET /api/admin/transfers  → list ALL transfers (all users)
// ================================================================
export const adminListTransfers = async (req, res) => {
  try {
    const { status, type } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const transfers = await Transfer.find(filter)
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      transfers: transfers.map((t) => ({
        id: t._id,
        transactionNumber: t.transactionNumber,
        user: t.userId
          ? `${t.userId.firstName} ${t.userId.lastName}`.trim()
          : '—',
        userEmail: t.userId?.email || '',
        type: t.type,
        amount: t.amount,
        status: t.status,
        from: t.fromAccountName,
        fromLastFour: t.fromLastFour,
        to: t.toAccountName || t.recipient?.bankName || '',
        toLastFour: t.toLastFour || (t.recipient?.accountNumber || '').slice(-4),
        recipientName: t.recipient?.fullName || '',
        date: t.transferDate,
        memo: t.memo,
        createdAt: t.createdAt,
      })),
    });
  } catch (err) {
    console.error('❌ adminListTransfers:', err);
    res.status(500).json({ error: 'Failed to load transfers' });
  }
};

// ================================================================
// PUT /api/admin/transfers/:id/status
// Body: { status: 'Completed' | 'Failed' | 'Cancelled', adminNote? }
// ================================================================
export const adminUpdateTransferStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    if (!['Completed', 'Failed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const transfer = await Transfer.findById(id);
    if (!transfer) return res.status(404).json({ error: 'Transfer not found' });

    // ── Completing a transfer → run the money movement ────────
    if (status === 'Completed') {
      const exec = await executeTransfer(id);

      if (exec?.failed) {
        return res.status(400).json({
          error: 'Transfer could not be completed: ' + (exec.reason || 'unknown reason'),
          transfer: exec.transfer,
        });
      }

      if (adminNote) {
        await Transfer.findByIdAndUpdate(id, { adminNote });
      }

      const updated = await Transfer.findById(id).lean();
      return res.json({ message: 'Transfer completed', transfer: updated });
    }

    // ── Failed / Cancelled → just update the status ───────────
    transfer.status = status;
    if (status === 'Failed') transfer.failedAt = new Date();
    if (adminNote) transfer.adminNote = adminNote;
    await transfer.save();

    res.json({ message: `Transfer marked ${status}`, transfer });
  } catch (err) {
    console.error('❌ adminUpdateTransferStatus:', err);
    res.status(500).json({ error: 'Failed to update transfer status' });
  }
};