// controllers/depositsController.js
import mongoose from 'mongoose';
import Deposit from '../models/Deposit.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import { deleteCloudinaryImage } from '../config/cloudinary.js';

// ---------- Helpers ----------
const startOfMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
};
const startOfDaysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
};

const formatDeposit = (d) => ({
  id: d._id,
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
// GET /api/deposits/overview
// ================================================================
export const getDepositsOverview = async (req, res) => {
  try {
    const userId = req.user._id;
    const monthStart = startOfMonth();
    const thirtyDaysAgo = startOfDaysAgo(30);

    const [accountsRaw, deposits] = await Promise.all([
      Account.find({
        userId,
        status: 'Active',
        type: { $in: ['Checking', 'Savings'] },
      })
        .sort({ isPrimary: -1, createdAt: 1 })
        .lean(),

      Deposit.find({ userId })
        .sort({ submittedAt: -1 })
        .limit(30)
        .lean(),
    ]);

    const depositedThisMonth = deposits
      .filter(
        (d) =>
          d.status === 'Completed' &&
          d.processedAt &&
          new Date(d.processedAt) >= monthStart
      )
      .reduce((sum, d) => sum + (d.amount || 0), 0);

    const pendingDeposits = deposits
      .filter((d) => d.status === 'Pending')
      .reduce((sum, d) => sum + (d.amount || 0), 0);

    const availableDeposits = deposits
      .filter(
        (d) =>
          d.status === 'Completed' &&
          d.processedAt &&
          new Date(d.processedAt) >= thirtyDaysAgo
      )
      .reduce((sum, d) => sum + (d.amount || 0), 0);

    res.json({
      overview: {
        depositedThisMonth,
        pendingDeposits,
        availableDeposits,
      },
      accounts: accountsRaw.map((acc) => ({
        id: acc._id,
        name: acc.subType ? `${acc.subType} ${acc.type}` : acc.type,
        type: acc.type.toLowerCase(),
        subType: acc.subType || null,
        lastFour: acc.accountNumber ? acc.accountNumber.slice(-4) : '',
        available: acc.availableBalance ?? 0,
        totalBalance: acc.totalBalance ?? 0,
      })),
      recentDeposits: deposits.map(formatDeposit),
    });
  } catch (err) {
    console.error('❌ getDepositsOverview:', err);
    res.status(500).json({ error: 'Failed to load deposits overview' });
  }
};

// ================================================================
// POST /api/deposits
// ================================================================
export const createDeposit = async (req, res) => {
  const cleanupUploads = async () => {
    const front = req.files?.frontImage?.[0];
    const back  = req.files?.backImage?.[0];
    if (front?.filename) await deleteCloudinaryImage(front.filename);
    if (back?.filename)  await deleteCloudinaryImage(back.filename);
  };

  try {
    const userId = req.user._id;
    const { accountId, amount, method = 'Mobile Check Deposit' } = req.body;

    if (!accountId) {
      await cleanupUploads();
      return res.status(400).json({ error: 'Account is required' });
    }

    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      await cleanupUploads();
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const account = await Account.findOne({ _id: accountId, userId });
    if (!account) {
      await cleanupUploads();
      return res.status(404).json({ error: 'Account not found' });
    }

    if (account.status !== 'Active') {
      await cleanupUploads();
      return res.status(400).json({ error: 'Account is not active' });
    }

    if (!['Checking', 'Savings'].includes(account.type)) {
      await cleanupUploads();
      return res.status(400).json({ error: 'Cannot deposit into this account type' });
    }

    const frontFile = req.files?.frontImage?.[0];
    const backFile  = req.files?.backImage?.[0];

    const confirmationNumber =
      'DEP-' + Math.floor(100000 + Math.random() * 900000);

    const deposit = await Deposit.create({
      userId,
      accountId: account._id,
      accountName: account.subType
        ? `${account.subType} ${account.type}`
        : account.type,
      accountLastFour: account.accountNumber ? account.accountNumber.slice(-4) : '',

      amount: amountNum,
      method,

      frontImage:         frontFile?.path     || '',
      frontImagePublicId: frontFile?.filename || '',
      backImage:          backFile?.path      || '',
      backImagePublicId:  backFile?.filename  || '',

      status: 'Pending',                 // <-- new default
      confirmationNumber,
      submittedAt: new Date(),
    });

    res.status(201).json({
      message: 'Deposit submitted — pending admin review',
      deposit: formatDeposit(deposit.toObject()),
    });
  } catch (err) {
    console.error('❌ createDeposit:', err);
    await cleanupUploads();
    res.status(500).json({ error: 'Failed to submit deposit' });
  }
};

// ================================================================
// GET /api/deposits/:id
// ================================================================
export const getDepositById = async (req, res) => {
  try {
    const userId = req.user._id;
    const deposit = await Deposit.findOne({ _id: req.params.id, userId }).lean();
    if (!deposit) return res.status(404).json({ error: 'Deposit not found' });

    res.json({ deposit: formatDeposit(deposit) });
  } catch (err) {
    console.error('❌ getDepositById:', err);
    res.status(500).json({ error: 'Failed to load deposit' });
  }
};