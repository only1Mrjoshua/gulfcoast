// controllers/adminDepositsController.js
import mongoose from 'mongoose';
import Deposit from '../models/Deposit.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import { deleteCloudinaryImage } from '../config/cloudinary.js';

// ----------------------------------------------------------------
// Formatter — handles both populated and non-populated userId
// ----------------------------------------------------------------
const formatDeposit = (d) => {
  const u = d.userId;
  const isPopulated = u && typeof u === 'object' && (u.firstName || u.lastName || u.email);

  return {
    id: d._id,
    userId: isPopulated ? u._id : u,
    user: isPopulated
      ? `${u.firstName || ''} ${u.lastName || ''}`.trim() || '—'
      : (d.userName || '—'),
    userEmail: isPopulated ? (u.email || '') : (d.userEmail || ''),
    accountId: d.accountId,
    accountName: d.accountName,
    accountLastFour: d.accountLastFour,
    amount: d.amount,
    method: d.method,
    status: d.status,
    confirmationNumber: d.confirmationNumber,
    submittedAt: d.submittedAt,
    processedAt: d.processedAt,
    adminNote: d.adminNote,
    frontImage: d.frontImage || '',
    backImage: d.backImage || '',
    hasFrontImage: !!d.frontImage,
    hasBackImage: !!d.backImage,
  };
};

// ================================================================
// GET /api/admin/deposits?status=Pending
// ================================================================
export const adminListDeposits = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const deposits = await Deposit.find(filter)
      .populate('userId', 'firstName lastName email')
      .sort({ submittedAt: -1 })
      .lean();

    res.json({ deposits: deposits.map(formatDeposit) });
  } catch (err) {
    console.error('❌ adminListDeposits:', err);
    res.status(500).json({ error: 'Failed to load deposits' });
  }
};

// ================================================================
// GET /api/admin/deposits/:id
// ================================================================
export const adminGetDeposit = async (req, res) => {
  try {
    const deposit = await Deposit.findById(req.params.id)
      .populate('userId', 'firstName lastName email')
      .lean();
    if (!deposit) return res.status(404).json({ error: 'Deposit not found' });

    res.json({ deposit: formatDeposit(deposit) });
  } catch (err) {
    console.error('❌ adminGetDeposit:', err);
    res.status(500).json({ error: 'Failed to load deposit' });
  }
};

// ================================================================
// PUT /api/admin/deposits/:id/status
// Body: { status: 'Pending' | 'Completed' | 'Rejected', adminNote?: string }
//
// Rules:
//   - Pending  → just sets the status back to pending (no balance change)
//   - Completed→ credits the destination account and records a Transaction
//   - Rejected → no balance change; best-effort cleanup of Cloudinary images
//   - Completed deposits cannot be moved back to another status
//     (funds have already been applied).
// ================================================================
export const adminUpdateDepositStatus = async (req, res) => {
  const { id } = req.params;
  const { status, adminNote } = req.body || {};

  if (!['Pending', 'Completed', 'Rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const session = await mongoose.startSession();
  let updatedDepositId = null;
  let clearImages = false;

  try {
    await session.withTransaction(async () => {
      const deposit = await Deposit.findById(id).session(session);
      if (!deposit) throw new Error('Deposit not found');

      if (deposit.status === status) {
        throw new Error(`Deposit is already ${status.toLowerCase()}`);
      }

      // Funds are already applied — lock it down.
      if (deposit.status === 'Completed') {
        throw new Error('Completed deposits cannot be changed');
      }

      if (status === 'Completed') {
        const account = await Account.findById(deposit.accountId).session(session);
        if (!account) throw new Error('Destination account not found');

        account.totalBalance     += deposit.amount;
        account.availableBalance += deposit.amount;
        await account.save({ session });

        await Transaction.create(
          [
            {
              userId: deposit.userId,
              accountId: account._id,
              description: `Deposit •••• ${deposit.accountLastFour}`,
              amount: Math.abs(deposit.amount),
              type: 'deposit',
              status: 'Completed',
              date: new Date(),
            },
          ],
          { session }
        );

        deposit.processedAt = new Date();
      } else if (status === 'Rejected') {
        deposit.processedAt = new Date();
        clearImages = true;
      } else if (status === 'Pending') {
        deposit.processedAt = null;
      }

      deposit.status = status;
      if (typeof adminNote === 'string') deposit.adminNote = adminNote;

      await deposit.save({ session });
      updatedDepositId = deposit._id;
    });

    // Best-effort Cloudinary cleanup for rejected deposits (outside the txn)
    if (clearImages && updatedDepositId) {
      const fresh = await Deposit.findById(updatedDepositId).lean();
      try {
        await Promise.all([
          fresh?.frontImagePublicId
            ? deleteCloudinaryImage(fresh.frontImagePublicId)
            : Promise.resolve(),
          fresh?.backImagePublicId
            ? deleteCloudinaryImage(fresh.backImagePublicId)
            : Promise.resolve(),
        ]);
      } catch (cleanupErr) {
        console.warn('⚠️ Cloudinary cleanup failed:', cleanupErr.message);
      }

      await Deposit.updateOne(
        { _id: updatedDepositId },
        {
          $set: {
            frontImage: '',
            backImage: '',
            frontImagePublicId: '',
            backImagePublicId: '',
          },
        }
      );
    }

    const populated = await Deposit.findById(updatedDepositId)
      .populate('userId', 'firstName lastName email')
      .lean();

    res.json({
      message: `Deposit marked as ${status}`,
      deposit: formatDeposit(populated),
    });
  } catch (err) {
    console.error('❌ adminUpdateDepositStatus:', err);
    const code = /not found/i.test(err.message)
      ? 404
      : /already|cannot|invalid/i.test(err.message)
      ? 400
      : 500;
    res.status(code).json({ error: err.message || 'Failed to update deposit status' });
  } finally {
    await session.endSession();
  }
};