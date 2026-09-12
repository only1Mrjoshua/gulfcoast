// controllers/adminDepositsController.js
import mongoose from 'mongoose';
import Deposit from '../models/Deposit.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import { deleteCloudinaryImage } from '../config/cloudinary.js';

const formatDeposit = (d) => ({
  id: d._id,
  userId: d.userId,
  user: d.userName || '',
  userEmail: d.userEmail || '',
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
});

// ================================================================
// GET /api/admin/deposits?status=Processing
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

    const formatted = deposits.map((d) => {
      const u = d.userId;
      return {
        ...formatDeposit(d),
        userId: u?._id || d.userId,
        user: u ? `${u.firstName} ${u.lastName}`.trim() : '—',
        userEmail: u?.email || '',
      };
    });

    res.json({ deposits: formatted });
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

    const u = deposit.userId;
    res.json({
      deposit: {
        ...formatDeposit(deposit),
        userId: u?._id || deposit.userId,
        user: u ? `${u.firstName} ${u.lastName}`.trim() : '—',
        userEmail: u?.email || '',
      },
    });
  } catch (err) {
    console.error('❌ adminGetDeposit:', err);
    res.status(500).json({ error: 'Failed to load deposit' });
  }
};

// ================================================================
// PUT /api/admin/deposits/:id/accept
// ================================================================
export const adminAcceptDeposit = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    let updated;

    await session.withTransaction(async () => {
      const { id } = req.params;
      const { adminNote = '' } = req.body || {};

      const deposit = await Deposit.findById(id).session(session);
      if (!deposit) throw new Error('Deposit not found');

      if (deposit.status === 'Accepted') {
        throw new Error('Deposit is already accepted');
      }
      if (deposit.status === 'Rejected') {
        throw new Error('Deposit was rejected and cannot be accepted');
      }

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
            description: `Check Deposit •••• ${deposit.accountLastFour}`,
            amount: Math.abs(deposit.amount),
            type: 'deposit',
            status: 'Completed',
            date: new Date(),
          },
        ],
        { session }
      );

      deposit.status = 'Accepted';
      deposit.processedAt = new Date();
      if (adminNote) deposit.adminNote = adminNote;
      await deposit.save({ session });

      updated = deposit.toObject();
    });

    res.json({ message: 'Deposit accepted', deposit: formatDeposit(updated) });
  } catch (err) {
    console.error('❌ adminAcceptDeposit:', err);
    const status = /not found/i.test(err.message)
      ? 404
      : /already|rejected|cannot/i.test(err.message)
      ? 400
      : 500;
    res.status(status).json({ error: err.message || 'Failed to accept deposit' });
  } finally {
    await session.endSession();
  }
};

// ================================================================
// PUT /api/admin/deposits/:id/reject
// Deletes Cloudinary images to save space after rejection
// ================================================================
export const adminRejectDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNote = '' } = req.body || {};

    const deposit = await Deposit.findById(id);
    if (!deposit) return res.status(404).json({ error: 'Deposit not found' });

    if (deposit.status === 'Accepted') {
      return res.status(400).json({ error: 'Deposit is already accepted' });
    }
    if (deposit.status === 'Rejected') {
      return res.status(400).json({ error: 'Deposit is already rejected' });
    }

    // Best-effort cleanup of Cloudinary assets
    await Promise.all([
      deleteCloudinaryImage(deposit.frontImagePublicId),
      deleteCloudinaryImage(deposit.backImagePublicId),
    ]);

    deposit.status = 'Rejected';
    deposit.processedAt = new Date();
    if (adminNote) deposit.adminNote = adminNote;
    // Clear URLs since files are gone
    deposit.frontImage = '';
    deposit.backImage = '';
    deposit.frontImagePublicId = '';
    deposit.backImagePublicId = '';
    await deposit.save();

    res.json({ message: 'Deposit rejected', deposit: formatDeposit(deposit.toObject()) });
  } catch (err) {
    console.error('❌ adminRejectDeposit:', err);
    res.status(500).json({ error: 'Failed to reject deposit' });
  }
};