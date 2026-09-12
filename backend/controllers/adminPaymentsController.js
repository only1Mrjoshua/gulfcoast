// controllers/adminPaymentsController.js
import User from '../models/User.js';
import Autopay from '../models/Autopay.js';
import Payment from '../models/Payment.js';
import Payee from '../models/Payee.js';
import Account from '../models/Account.js';
import PaymentProfile from '../models/PaymentProfile.js';

// ── Helpers ─────────────────────────────────────────────────
const isoDate = (d) => (d ? new Date(d).toISOString().split('T')[0] : '');
const isValidObjectId = (v) => v && String(v).match(/^[0-9a-fA-F]{24}$/);

async function findOrCreatePayee(userId, name) {
  if (!name || !name.trim()) return null;
  const clean = name.trim();
  let payee = await Payee.findOne({
    userId,
    name: { $regex: new RegExp(`^${clean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
  });
  if (!payee) {
    payee = await Payee.create({ userId, name: clean, category: 'Other' });
  }
  return payee;
}

async function getDefaultAccount(userId) {
  let acc =
    (await Account.findOne({ userId, type: 'Checking', isPrimary: true }).lean()) ||
    (await Account.findOne({ userId, type: 'Checking' }).lean()) ||
    (await Account.findOne({ userId, type: { $in: ['Checking', 'Savings'] } }).lean());
  return acc;
}

// Build the admin profile shape from real collections
function buildUserProfile(user, autopays, upcomingPayments, allPayments, profile) {
  const dueWithinDays = profile?.dueWithinDays ?? 7;

  const now = new Date();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + dueWithinDays);

  const dueSoonAmount = upcomingPayments
    .filter((p) => {
      const d = new Date(p.date);
      return d >= now && d <= cutoff;
    })
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const scheduledAmount = upcomingPayments.reduce(
    (sum, p) => sum + (p.amount || 0),
    0
  );

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const paidThisMonth = allPayments
    .filter((p) => {
      if (p.status !== 'Completed') return false;
      const d = new Date(p.completedAt || p.date);
      return d >= monthStart && d < monthEnd;
    })
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  // Map of payeeId → enabled (used to flag upcoming payments that have autopay)
  const enabledAutopayPayeeIds = new Set(
    autopays.filter((a) => a.enabled).map((a) => String(a.payeeId))
  );

  return {
    id: user._id,
    userId: user._id,
    user: `${user.firstName || ''} ${user.lastName || ''}`.trim() || '—',
    userEmail: user.email || '',

    dueSoonAmount,
    dueWithinDays,
    scheduledAmount,
    paidThisMonth,

    upcomingPayments: upcomingPayments.map((p) => ({
      id: String(p._id),
      name: p.payeeName || '',
      dueDate: isoDate(p.date),
      balance: p.amount || 0,
      autopay: enabledAutopayPayeeIds.has(String(p.payeeId)),
    })),

    automaticPayments: autopays.map((a) => ({
      id: String(a._id),
      name: a.payeeName || '',
      frequency: a.frequency || 'Monthly',
      balance: a.nextAmount || 0,
      nextDate: isoDate(a.nextDate),
      autopay: !!a.enabled,
    })),
  };
}

// ============================================================
// GET /api/admin/payments
// ============================================================
export const adminListPayments = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('firstName lastName email')
      .sort({ firstName: 1 })
      .lean();

    const userIds = users.map((u) => u._id);

    const [autopays, upcomingPayments, allPayments, profiles] = await Promise.all([
      Autopay.find({ userId: { $in: userIds } }).lean(),
      Payment.find({
        userId: { $in: userIds },
        status: { $in: ['Scheduled', 'Pending'] },
      })
        .sort({ date: 1 })
        .lean(),
      Payment.find({ userId: { $in: userIds } }).lean(),
      PaymentProfile.find({ userId: { $in: userIds } }).lean(),
    ]);

    const groupByUser = (arr) => {
      const m = new Map();
      arr.forEach((doc) => {
        const k = String(doc.userId);
        if (!m.has(k)) m.set(k, []);
        m.get(k).push(doc);
      });
      return m;
    };

    const autopaysByUser = groupByUser(autopays);
    const upcomingByUser = groupByUser(upcomingPayments);
    const paymentsByUser = groupByUser(allPayments);
    const profilesByUser = new Map(profiles.map((p) => [String(p.userId), p]));

    res.json({
      users: users.map((u) =>
        buildUserProfile(
          u,
          autopaysByUser.get(String(u._id)) || [],
          upcomingByUser.get(String(u._id)) || [],
          paymentsByUser.get(String(u._id)) || [],
          profilesByUser.get(String(u._id))
        )
      ),
    });
  } catch (err) {
    console.error('❌ adminListPayments:', err);
    res.status(500).json({ error: 'Failed to load payments' });
  }
};

// ============================================================
// PUT /api/admin/payments/:userId
// Syncs changes back to the real Autopay + Payment collections.
// ============================================================
export const adminUpdatePaymentProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      dueWithinDays = 7,
      upcomingPayments = [],
      automaticPayments = [],
    } = req.body;

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Persist the dueWithinDays override (used for dueSoon calc)
    await PaymentProfile.findOneAndUpdate(
      { userId },
      { $set: { dueWithinDays: Math.max(0, parseInt(dueWithinDays) || 0) } },
      { upsert: true, setDefaultsOnInsert: true }
    );

    const defaultAccount = await getDefaultAccount(userId);

    // ── Sync UPCOMING payments (Payment collection) ─────────
    const incomingUpcomingIds = new Set();

    for (const p of upcomingPayments) {
      const payee = await findOrCreatePayee(userId, p.name);
      const amount = parseFloat(p.balance) || 0;
      const date = p.date ? new Date(p.date) : new Date();

      if (isValidObjectId(p.id)) {
        incomingUpcomingIds.add(String(p.id));
        await Payment.findByIdAndUpdate(p.id, {
          $set: {
            payeeName: p.name || '',
            ...(payee ? { payeeId: payee._id } : {}),
            amount,
            date,
          },
        });
      } else if (defaultAccount) {
        const created = await Payment.create({
          userId,
          ...(payee ? { payeeId: payee._id } : {}),
          payeeName: p.name || '',
          fromAccountId: defaultAccount._id,
          fromAccountName: defaultAccount.subType
            ? `${defaultAccount.subType} ${defaultAccount.type}`
            : defaultAccount.type,
          fromLastFour: defaultAccount.accountNumber
            ? defaultAccount.accountNumber.slice(-4)
            : '',
          amount,
          date,
          status: 'Scheduled',
        });
        incomingUpcomingIds.add(String(created._id));
      }
    }

    // Delete upcoming Payments the admin removed
    const existingUpcoming = await Payment.find({
      userId,
      status: { $in: ['Scheduled', 'Pending'] },
    }).lean();
    for (const p of existingUpcoming) {
      if (!incomingUpcomingIds.has(String(p._id))) {
        await Payment.findByIdAndDelete(p._id);
      }
    }

    // ── Sync AUTOMATIC payments (Autopay collection) ────────
    const incomingAutomaticIds = new Set();

    for (const a of automaticPayments) {
      const payee = await findOrCreatePayee(userId, a.name);
      const amount = parseFloat(a.balance) || 0;
      const nextDate = a.nextDate ? new Date(a.nextDate) : new Date();
      const frequency = ['Daily', 'Weekly', 'Monthly', 'Yearly'].includes(a.frequency)
        ? a.frequency
        : 'Monthly';
      const enabled = !!a.autopay;

      if (isValidObjectId(a.id)) {
        incomingAutomaticIds.add(String(a.id));
        await Autopay.findByIdAndUpdate(a.id, {
          $set: {
            payeeName: a.name || '',
            ...(payee ? { payeeId: payee._id } : {}),
            frequency,
            nextAmount: amount,
            nextDate,
            enabled,
          },
        });
      } else if (defaultAccount) {
        const created = await Autopay.create({
          userId,
          ...(payee ? { payeeId: payee._id } : {}),
          payeeName: a.name || '',
          fromAccountId: defaultAccount._id,
          fromAccountName: defaultAccount.subType
            ? `${defaultAccount.subType} ${defaultAccount.type}`
            : defaultAccount.type,
          fromLastFour: defaultAccount.accountNumber
            ? defaultAccount.accountNumber.slice(-4)
            : '',
          frequency,
          nextAmount: amount,
          nextDate,
          enabled,
        });
        incomingAutomaticIds.add(String(created._id));
      }
    }

    // Delete autopays the admin removed
    const existingAutopays = await Autopay.find({ userId }).lean();
    for (const a of existingAutopays) {
      if (!incomingAutomaticIds.has(String(a._id))) {
        await Autopay.findByIdAndDelete(a._id);
      }
    }

    // Return the updated profile
    const [updatedAutopays, updatedUpcoming, updatedPayments, profile] =
      await Promise.all([
        Autopay.find({ userId }).lean(),
        Payment.find({
          userId,
          status: { $in: ['Scheduled', 'Pending'] },
        })
          .sort({ date: 1 })
          .lean(),
        Payment.find({ userId }).lean(),
        PaymentProfile.findOne({ userId }).lean(),
      ]);

    res.json({
      message: 'Payment profile updated',
      user: buildUserProfile(
        user,
        updatedAutopays,
        updatedUpcoming,
        updatedPayments,
        profile
      ),
    });
  } catch (err) {
    console.error('❌ adminUpdatePaymentProfile:', err);
    res.status(500).json({ error: 'Failed to update payment profile' });
  }
};