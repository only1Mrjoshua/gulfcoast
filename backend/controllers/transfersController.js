// controllers/transfersController.js
import Transfer from '../models/Transfer.js';
import Account from '../models/Account.js';
import User from '../models/User.js';
import { generateTransferReceiptPdf } from '../utils/pdfReceipt.js';

const WIRE_FEE = 25;

// ----------------------------------------------------------------
// Helper: generate a unique transaction number
// ----------------------------------------------------------------
async function generateTransactionNumber() {
  for (let i = 0; i < 5; i++) {
    const num = 'TRX-' + Math.floor(100000 + Math.random() * 900000);
    const exists = await Transfer.exists({ transactionNumber: num });
    if (!exists) return num;
  }
  return 'TRX-' + Date.now();
}

// ----------------------------------------------------------------
// Helper: expected arrival label
// ----------------------------------------------------------------
function getExpectedArrival(type) {
  switch (type) {
    case 'wire':      return 'Same business day (if submitted before 4 PM ET)';
    case 'external':  return '1–3 business days';
    case 'recurring': return 'On the scheduled date';
    default:          return 'Immediately';
  }
}

// ----------------------------------------------------------------
// Helper: shape a Transfer doc for the frontend history list
// ----------------------------------------------------------------
function formatTransferForList(t) {
  const date = new Date(t.transferDate || t.createdAt);
  const isoDate = date.toISOString().split('T')[0];
  const time = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return {
    id: t._id,
    transactionNumber: t.transactionNumber,
    type: t.type,
    date: isoDate,
    time,
    amount: t.amount,
    wireFee: t.wireFee,
    totalDebit: t.totalDebit,
    status: t.status,
    memo: t.memo,
    senderName: t.senderName,
    from: t.fromAccountName,
    fromLastFour: t.fromLastFour,
    to: t.toAccountName || t.recipient?.bankName || '',
    toLastFour: t.toLastFour || (t.recipient?.accountNumber || '').slice(-4),
    recipientName: t.recipient?.fullName || '',
    recipientBankName: t.recipient?.bankName || '',
    recipientAccountType: t.recipient?.accountType || '',
    recipientBankAddress: t.recipient?.bankAddress || '',
    expectedArrival: t.expectedArrival,
    frequency: t.frequency,
    createdAt: t.createdAt,
  };
}

// ================================================================
// GET /api/transfers
// ================================================================
export const getTransfers = async (req, res) => {
  try {
    const userId = req.user._id;

    const transfers = await Transfer.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    const formatted = transfers.map(formatTransferForList);

    // Build the unique list of YYYY-MM month keys for the dropdown
    const monthSet = new Set();
    formatted.forEach((t) => {
      if (t.date) monthSet.add(t.date.slice(0, 7)); // 'YYYY-MM'
    });
    const months = Array.from(monthSet).sort().reverse();

    res.json({
      transfers: formatted,
      months,
    });
  } catch (err) {
    console.error('❌ getTransfers:', err);
    res.status(500).json({ error: 'Failed to load transfers' });
  }
};

// ================================================================
// GET /api/transfers/accounts
// ================================================================
export const getTransferAccounts = async (req, res) => {
  try {
    const userId = req.user._id;

    const accounts = await Account.find({
      userId,
      status: 'Active',
      type: { $in: ['Checking', 'Savings'] }, // no credit cards for transfers
    }).lean();

    res.json({
      accounts: accounts.map((acc) => ({
        id: acc._id,
        name: acc.subType ? `${acc.subType} ${acc.type}` : acc.type,
        type: acc.type,
        subType: acc.subType || null,
        lastFour: acc.accountNumber ? acc.accountNumber.slice(-4) : '',
        available: acc.availableBalance ?? 0,
        totalBalance: acc.totalBalance ?? 0,
      })),
    });
  } catch (err) {
    console.error('❌ getTransferAccounts:', err);
    res.status(500).json({ error: 'Failed to load accounts' });
  }
};

// ================================================================
// POST /api/transfers
// ================================================================
export const createTransfer = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('firstName lastName');

    const {
      type,
      fromAccountId,
      toAccountId,
      amount,
      date,
      frequency,
      memo,
      recipientName,
      recipientBankName,
      recipientRoutingNumber,
      recipientAccountNumber,
      recipientAccountType,
      recipientBankAddress,
      verificationMethod,
    } = req.body;

    // ── Validation ────────────────────────────────────────────
    if (!['internal', 'external', 'wire', 'recurring'].includes(type)) {
      return res.status(400).json({ error: 'Invalid transfer type' });
    }

    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Load source account
    const from = await Account.findOne({ _id: fromAccountId, userId });
    if (!from) return res.status(404).json({ error: 'Source account not found' });

    // Insufficient funds check (user-side, at creation time)
    const wireFee = type === 'wire' ? WIRE_FEE : 0;
    const totalDebit = amountNum + wireFee;

    if (from.availableBalance < totalDebit) {
      const acctLabel = from.subType ? `${from.subType} ${from.type}` : from.type;
      return res.status(400).json({
        error: `Insufficient funds in your ${acctLabel} account. Available: $${from.availableBalance.toFixed(2)}`,
      });
    }

    // Internal / recurring require a destination account
    let to = null;
    if (type === 'internal' || type === 'recurring') {
      to = await Account.findOne({ _id: toAccountId, userId });
      if (!to) return res.status(400).json({ error: 'Destination account is required' });
      if (String(to._id) === String(from._id)) {
        return res.status(400).json({ error: 'From and To accounts must be different' });
      }
    }

    // External / wire require recipient fields
    if (type === 'external' || type === 'wire') {
      if (!recipientName || !recipientBankName || !recipientRoutingNumber || !recipientAccountNumber) {
        return res.status(400).json({ error: 'Recipient details are incomplete' });
      }
      if (!/^\d{9}$/.test(recipientRoutingNumber)) {
        return res.status(400).json({ error: 'Routing number must be 9 digits' });
      }
    }

    // ── Build & save ──────────────────────────────────────────
    const transactionNumber = await generateTransactionNumber();

    const transfer = await Transfer.create({
      userId,
      transactionNumber,
      type,

      fromAccountId: from._id,
      fromAccountName: from.subType ? `${from.subType} ${from.type}` : from.type,
      fromLastFour: from.accountNumber ? from.accountNumber.slice(-4) : '',

      toAccountId: to?._id || null,
      toAccountName: to ? (to.subType ? `${to.subType} ${to.type}` : to.type) : '',
      toLastFour: to?.accountNumber ? to.accountNumber.slice(-4) : '',

      recipient: (type === 'external' || type === 'wire')
        ? {
            fullName: recipientName,
            bankName: recipientBankName,
            routingNumber: recipientRoutingNumber,
            accountNumber: recipientAccountNumber,
            accountType: recipientAccountType || 'checking',
            bankAddress: recipientBankAddress || '',
          }
        : undefined,

      amount: amountNum,
      wireFee,
      totalDebit,

      transferDate: date ? new Date(date) : new Date(),
      frequency: type === 'recurring' ? (frequency || 'One time') : 'One time',
      expectedArrival: getExpectedArrival(type),
      memo: memo || '',

      verificationMethod: verificationMethod || 'instant',

      senderName: `${user.firstName} ${user.lastName}`.trim(),
      status: 'Pending',
    });

    res.status(201).json({
      message: 'Transfer scheduled',
      transfer: formatTransferForList(transfer.toObject ? transfer.toObject() : transfer),
    });
  } catch (err) {
    console.error('❌ createTransfer:', err);
    res.status(500).json({ error: 'Failed to create transfer' });
  }
};

// ================================================================
// GET /api/transfers/:id/receipt   → PDF download
// ================================================================
export const downloadReceipt = async (req, res) => {
  try {
    const userId = req.user._id;
    const transfer = await Transfer.findOne({ _id: req.params.id, userId }).lean();
    if (!transfer) return res.status(404).json({ error: 'Transfer not found' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="receipt-${transfer.transactionNumber}.pdf"`
    );

    generateTransferReceiptPdf(transfer, res);
  } catch (err) {
    console.error('❌ downloadReceipt:', err);
    res.status(500).json({ error: 'Failed to generate receipt' });
  }
};