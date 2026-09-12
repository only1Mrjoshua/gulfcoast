// controllers/paymentsController.js
import mongoose from 'mongoose';
import Payee from '../models/Payee.js';
import Payment from '../models/Payment.js';
import Autopay from '../models/Autopay.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';

// ---------- Helpers ----------
const normalizeType = (type) => (type || '').toLowerCase();

const startOfMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
};
const endOfMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 1);
};
const daysFromNow = (n) => {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  d.setDate(d.getDate() + n);
  return d;
};

const formatPayee = (p) => ({
  id: p._id,
  name: p.name,
  nickname: p.nickname || '',
  category: p.category,
  accountNumber: p.accountNumber || '',
  status: p.status,
});

const formatPayment = (p) => ({
  id: p._id,
  payeeId: p.payeeId,
  payee: p.payeeName,
  account: `${p.fromAccountName} •••• ${p.fromLastFour}`,
  fromAccountId: p.fromAccountId,
  fromAccountName: p.fromAccountName,
  fromLastFour: p.fromLastFour,
  amount: p.amount,
  date: p.date,
  frequency: p.frequency,
  isRecurring: p.isRecurring,
  memo: p.memo,
  status: p.status,
  confirmationNumber: p.confirmationNumber,
  completedAt: p.completedAt,
});

const formatAutopay = (a) => ({
  id: a._id,
  payeeId: a.payeeId,
  payee: a.payeeName,
  fromAccountId: a.fromAccountId,
  fromAccountName: a.fromAccountName,
  fromLastFour: a.fromLastFour,
  nextAmount: a.nextAmount,
  frequency: a.frequency,
  nextDate: a.nextDate,
  endDate: a.endDate,
  enabled: a.enabled,
});

// ================================================================
// GET /api/payments/overview
// Query: ?dueWithinDays=7
// ================================================================
export const getPaymentsOverview = async (req, res) => {
  try {
    const userId = req.user._id;
    const dueWithinDays = parseInt(req.query.dueWithinDays) || 7;

    const now = new Date();
    const dueSoonCutoff = daysFromNow(dueWithinDays);
    const monthStart = startOfMonth();
    const monthEnd = endOfMonth();

    const [payees, upcomingRaw, historyRaw, autopayRaw, accountsRaw] = await Promise.all([
      Payee.find({ userId, status: 'Active' }).sort({ name: 1 }).lean(),

      Payment.find({
        userId,
        status: { $in: ['Scheduled', 'Pending'] },
        date: { $gte: now },
      })
        .sort({ date: 1 })
        .lean(),

      Payment.find({
        userId,
        status: { $in: ['Completed', 'Failed', 'Cancelled'] },
      })
        .sort({ date: -1 })
        .limit(12)
        .lean(),

      Autopay.find({ userId }).sort({ nextDate: 1 }).lean(),

      Account.find({
        userId,
        status: 'Active',
        type: { $in: ['Checking', 'Savings'] },
      }).lean(),
    ]);

    const dueSoonTotal = upcomingRaw
      .filter((p) => new Date(p.date) <= dueSoonCutoff)
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const scheduledTotal = upcomingRaw.reduce((sum, p) => sum + (p.amount || 0), 0);

    const paidThisMonthTotal = historyRaw
      .filter(
        (p) =>
          p.status === 'Completed' &&
          p.completedAt &&
          new Date(p.completedAt) >= monthStart &&
          new Date(p.completedAt) < monthEnd
      )
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    res.json({
      overview: {
        dueSoon: dueSoonTotal,
        dueSoonDays: dueWithinDays,
        scheduled: scheduledTotal,
        paidThisMonth: paidThisMonthTotal,
      },
      upcomingPayments: upcomingRaw.map(formatPayment),
      paymentHistory: historyRaw.map(formatPayment),
      automaticPayments: autopayRaw.map(formatAutopay),
      payees: payees.map(formatPayee),
      accounts: accountsRaw.map((acc) => ({
        id: acc._id,
        name: acc.subType ? `${acc.subType} ${acc.type}` : acc.type,
        type: normalizeType(acc.type),
        subType: acc.subType || null,
        lastFour: acc.accountNumber ? acc.accountNumber.slice(-4) : '',
        available: acc.availableBalance ?? 0,
        totalBalance: acc.totalBalance ?? 0,
      })),
    });
  } catch (err) {
    console.error('❌ getPaymentsOverview:', err);
    res.status(500).json({ error: 'Failed to load payments overview' });
  }
};

// ================================================================
// POST /api/payments — schedule a new payment (form flow)
// Body: { payeeId, fromAccountId, amount, date, frequency, memo, isRecurring }
// ================================================================
export const createPayment = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      payeeId,
      fromAccountId,
      amount,
      date,
      frequency = 'One time',
      memo = '',
      isRecurring = false,
    } = req.body;

    if (!payeeId) return res.status(400).json({ error: 'Payee is required' });
    if (!fromAccountId) return res.status(400).json({ error: 'Source account is required' });

    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const [payee, fromAccount] = await Promise.all([
      Payee.findOne({ _id: payeeId, userId }),
      Account.findOne({ _id: fromAccountId, userId }),
    ]);

    if (!payee) return res.status(404).json({ error: 'Payee not found' });
    if (!fromAccount) return res.status(404).json({ error: 'Source account not found' });

    // Soft balance check at scheduling time
    if (fromAccount.availableBalance < amountNum) {
      return res.status(400).json({
        error: `Insufficient funds in ${fromAccount.subType ? fromAccount.subType + ' ' : ''}${fromAccount.type}. Available: $${fromAccount.availableBalance.toFixed(2)}`,
      });
    }

    const payment = await Payment.create({
      userId,
      payeeId: payee._id,
      payeeName: payee.name,

      fromAccountId: fromAccount._id,
      fromAccountName: fromAccount.subType
        ? `${fromAccount.subType} ${fromAccount.type}`
        : fromAccount.type,
      fromLastFour: fromAccount.accountNumber ? fromAccount.accountNumber.slice(-4) : '',

      amount: amountNum,
      date: date ? new Date(date) : new Date(),

      frequency,
      isRecurring,
      memo,

      status: 'Scheduled',
    });

    res.status(201).json({
      message: 'Payment scheduled',
      payment: formatPayment(payment.toObject()),
    });
  } catch (err) {
    console.error('❌ createPayment:', err);
    res.status(500).json({ error: 'Failed to create payment' });
  }
};

// ================================================================
// POST /api/payments/:id/pay — quick-pay a scheduled payment
// Atomically: debit account, mark payment completed, log transaction
// ================================================================
export const payScheduledPayment = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      const userId = req.user._id;
      const { id } = req.params;

      const payment = await Payment.findOne({ _id: id, userId }).session(session);
      if (!payment) throw new Error('Payment not found');

      if (payment.status === 'Completed') {
        throw new Error('Payment already completed');
      }
      if (!['Scheduled', 'Pending'].includes(payment.status)) {
        throw new Error('Payment cannot be paid in its current state');
      }

      const fromAccount = await Account.findOne({
        _id: payment.fromAccountId,
        userId,
      }).session(session);

      if (!fromAccount) throw new Error('Source account not found');

      if (fromAccount.availableBalance < payment.amount) {
        throw new Error(
          `Insufficient funds in ${payment.fromAccountName} •••• ${payment.fromLastFour}. Available: $${fromAccount.availableBalance.toFixed(2)}`
        );
      }

      // 1. Debit the account
      fromAccount.totalBalance     -= payment.amount;
      fromAccount.availableBalance -= payment.amount;
      await fromAccount.save({ session });

      // 2. Log a signed transaction (money out → negative)
      await Transaction.create([{
        userId,
        accountId: fromAccount._id,
        description: `Payment to ${payment.payeeName}`,
        amount: -Math.abs(payment.amount),
        type: 'payment',
        status: 'Completed',
        date: new Date(),
      }], { session });

      // 3. Mark the payment complete
      payment.status = 'Completed';
      payment.completedAt = new Date();
      payment.confirmationNumber =
        'PAY-' + Math.floor(100000 + Math.random() * 900000);
      await payment.save({ session });

      result = formatPayment(payment.toObject());
    });

    res.json({ message: 'Payment completed', payment: result });
  } catch (err) {
    console.error('❌ payScheduledPayment:', err);
    const status = /not found/i.test(err.message) ? 404 : /insufficient|already|cannot/i.test(err.message) ? 400 : 500;
    res.status(status).json({ error: err.message || 'Failed to process payment' });
  } finally {
    await session.endSession();
  }
};

// ================================================================
// PUT /api/payments/autopay/:id — toggle autopay on/off
// Body: { enabled: boolean }
// ================================================================
export const updateAutopay = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: '`enabled` must be a boolean' });
    }

    const autopay = await Autopay.findOneAndUpdate(
      { _id: id, userId },
      { $set: { enabled } },
      { returnDocument: 'after' }
    ).lean();

    if (!autopay) {
      return res.status(404).json({ error: 'Autopay not found' });
    }

    res.json({
      message: enabled ? 'Autopay enabled' : 'Autopay disabled',
      automaticPayment: formatAutopay(autopay),
    });
  } catch (err) {
    console.error('❌ updateAutopay:', err);
    res.status(500).json({ error: 'Failed to update autopay' });
  }
};

// ================================================================
// DELETE /api/payments/:id — cancel a scheduled payment
// ================================================================
export const cancelScheduledPayment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const payment = await Payment.findOne({ _id: id, userId });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    if (!['Scheduled', 'Pending'].includes(payment.status)) {
      return res.status(400).json({ error: 'Only scheduled or pending payments can be cancelled' });
    }

    payment.status = 'Cancelled';
    await payment.save();

    res.json({ message: 'Payment cancelled', payment: formatPayment(payment.toObject()) });
  } catch (err) {
    console.error('❌ cancelScheduledPayment:', err);
    res.status(500).json({ error: 'Failed to cancel payment' });
  }
};