// controllers/transfersController.js
import Transfer from '../models/Transfer.js';
import Account from '../models/Account.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { generateTransferReceiptPdf } from '../utils/pdfReceipt.js';
import { notifyUser } from '../utils/notifyUser.js';

const WIRE_FEE = 25;

// ----------------------------------------------------------------
// Helper: unique transaction number
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
// Helper: shape a Transfer for the frontend
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

// ----------------------------------------------------------------
// Helper: build the notification message from a transfer doc
// ----------------------------------------------------------------
export function buildTransferNotificationMessage(transfer, statusLabel) {
  const from = transfer.fromLastFour
    ? `${transfer.fromAccountName} •••• ${transfer.fromLastFour}`
    : transfer.fromAccountName;

  let to;
  if (transfer.type === 'internal' || transfer.type === 'recurring') {
    to = transfer.toLastFour
      ? `${transfer.toAccountName} •••• ${transfer.toLastFour}`
      : transfer.toAccountName || 'your account';
  } else {
    const name = transfer.recipient?.fullName || 'your recipient';
    const bank = transfer.recipient?.bankName || 'their bank';
    to = `${name} at ${bank}`;
  }

  const amount = Number(transfer.amount || 0).toFixed(2);
  return `You just made a transfer of $${amount} from ${from} to ${to}. ${statusLabel}`;
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

    const monthSet = new Set();
    formatted.forEach((t) => {
      if (t.date) monthSet.add(t.date.slice(0, 7));
    });
    const months = Array.from(monthSet).sort().reverse();

    res.json({ transfers: formatted, months });
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
      type: { $in: ['Checking', 'Savings', 'External'] },
    })
      .sort({ type: 1, isPrimary: -1, createdAt: 1 })
      .lean();

    res.json({
      accounts: accounts.map((acc) => {
        const external = acc.type === 'External';
        const lastFour = acc.accountNumber
          ? acc.accountNumber.slice(-4)
          : '';

        const name = external
          ? `${acc.institution || 'External Bank'} — ${acc.subType || 'Account'}`
          : acc.subType
          ? `${acc.subType} ${acc.type}`
          : acc.type;

        return {
          id: acc._id,
          name,
          type: acc.type,
          subType: acc.subType || null,
          lastFour,
          available: acc.availableBalance ?? 0,
          totalBalance: acc.totalBalance ?? 0,
          external,
          institution: external ? acc.institution || '' : '',
        };
      }),
    });
  } catch (err) {
    console.error('❌ getTransferAccounts:', err);
    res.status(500).json({ error: 'Failed to load accounts' });
  }
};

// ================================================================
// POST /api/transfers
// Body also accepts `pin` — the user's 4-digit bank PIN.
// ================================================================
export const createTransfer = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('firstName lastName +bankPin');

    let {
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
      pin,
    } = req.body;

    // ── Bank PIN verification ─────────────────────────────────
    // Only enforced when the user has a PIN on file. Users who
    // have not set one yet can transfer without a PIN.
    if (user.bankPin) {
      const pinStr = pin === undefined || pin === null ? '' : String(pin).trim();
      if (!/^\d{4}$/.test(pinStr)) {
        return res.status(400).json({ error: 'Please enter your 4-digit PIN' });
      }
      const pinOk = await bcrypt.compare(pinStr, user.bankPin);
      if (!pinOk) {
        return res.status(401).json({ error: 'Incorrect PIN. Please try again.' });
      }
    }

    // ── Detect linked-account destination ─────────────────────
    let linkedDestination = null;
    if (toAccountId) {
      linkedDestination = await Account.findOne({
        _id: toAccountId,
        userId,
        type: 'External',
        status: { $ne: 'Closed' },
      });

      if (linkedDestination) {
        type = 'external';
        recipientName =
          recipientName ||
          `${user?.firstName || ''} ${user?.lastName || ''}`.trim() ||
          `${linkedDestination.institution} Account`;
        recipientBankName = linkedDestination.institution || 'External Bank';
        recipientRoutingNumber = linkedDestination.routingNumber || '';
        recipientAccountNumber = linkedDestination.accountNumber || '';
        recipientAccountType =
          (linkedDestination.subType || 'Checking').toLowerCase();
      }
    }

    // ── Validation ─────────────────────────────────────────────
    if (!['internal', 'external', 'wire', 'recurring'].includes(type)) {
      return res.status(400).json({ error: 'Invalid transfer type' });
    }

    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const from = await Account.findOne({ _id: fromAccountId, userId });
    if (!from) return res.status(404).json({ error: 'Source account not found' });

    if (from.type === 'External') {
      return res
        .status(400)
        .json({ error: 'Cannot transfer from a linked external account' });
    }

    const wireFee = type === 'wire' ? WIRE_FEE : 0;
    const totalDebit = amountNum + wireFee;

    if (from.availableBalance < totalDebit) {
      const acctLabel = from.subType
        ? `${from.subType} ${from.type}`
        : from.type;
      return res.status(400).json({
        error: `Insufficient funds in your ${acctLabel} account. Available: $${from.availableBalance.toFixed(
          2
        )}`,
      });
    }

    let to = null;
    if (type === 'internal' || type === 'recurring') {
      to = await Account.findOne({ _id: toAccountId, userId });
      if (!to)
        return res
          .status(400)
          .json({ error: 'Destination account is required' });
      if (to.type === 'External') {
        return res
          .status(400)
          .json({ error: 'External accounts cannot be internal destinations' });
      }
      if (String(to._id) === String(from._id)) {
        return res
          .status(400)
          .json({ error: 'From and To accounts must be different' });
      }
    }

    if (type === 'external' || type === 'wire') {
      if (
        !recipientName ||
        !recipientBankName ||
        !recipientRoutingNumber ||
        !recipientAccountNumber
      ) {
        return res
          .status(400)
          .json({ error: 'Recipient details are incomplete' });
      }
      if (!/^\d{9}$/.test(recipientRoutingNumber)) {
        return res
          .status(400)
          .json({ error: 'Routing number must be 9 digits' });
      }
    }

    // ── Build & save ───────────────────────────────────────────
    const transactionNumber = await generateTransactionNumber();

    const isLinked = !!linkedDestination;

    const transfer = await Transfer.create({
      userId,
      transactionNumber,
      type,

      fromAccountId: from._id,
      fromAccountName: from.subType
        ? `${from.subType} ${from.type}`
        : from.type,
      fromLastFour: from.accountNumber ? from.accountNumber.slice(-4) : '',

      toAccountId:
        isLinked && linkedDestination
          ? linkedDestination._id
          : to?._id || null,
      toAccountName: isLinked
        ? `${linkedDestination.institution} — ${linkedDestination.subType} •••• ${String(
            linkedDestination.accountNumber || ''
          ).slice(-4)}`
        : to
        ? to.subType
          ? `${to.subType} ${to.type}`
          : to.type
        : '',
      toLastFour: isLinked
        ? String(linkedDestination.accountNumber || '').slice(-4)
        : to?.accountNumber
        ? to.accountNumber.slice(-4)
        : '',

      recipient:
        type === 'external' || type === 'wire'
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
      frequency: type === 'recurring' ? frequency || 'One time' : 'One time',
      expectedArrival: getExpectedArrival(type),
      memo: memo || '',

      verificationMethod: verificationMethod || 'instant',
      senderName: `${user.firstName} ${user.lastName}`.trim(),
      status: 'Pending',
    });

    // ── Notify the user ────────────────────────────────────────
    try {
      await notifyUser({
        userId,
        category: 'Transfer',
        title: 'Transfer Submitted',
        message: buildTransferNotificationMessage(
          transfer,
          'Your transfer has been submitted and is pending review.'
        ),
        priority: 'Normal',
      });
    } catch (notifyErr) {
      console.warn('Transfer notification failed:', notifyErr.message);
    }

    res.status(201).json({
      message: 'Transfer scheduled',
      transfer: formatTransferForList(
        transfer.toObject ? transfer.toObject() : transfer
      ),
    });
  } catch (err) {
    console.error('❌ createTransfer:', err);
    res.status(500).json({ error: 'Failed to create transfer' });
  }
};

// ================================================================
// GET /api/transfers/:id/receipt
// ================================================================
export const downloadReceipt = async (req, res) => {
  try {
    const userId = req.user._id;
    const transfer = await Transfer.findOne({
      _id: req.params.id,
      userId,
    }).lean();
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