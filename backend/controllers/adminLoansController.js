// controllers/adminLoansController.js
import mongoose from 'mongoose';
import User from '../models/User.js';
import Loan from '../models/Loan.js';
import LoanPayment from '../models/LoanPayment.js';
import UserLoan from '../models/UserLoan.js';
import LoanApplication from '../models/LoanApplication.js';

const toDateOnly = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '';
  return dt.toISOString().split('T')[0];
};

const DEFAULT_LOAN_ALERTS = [
  { key: 'paymentReminder',    type: 'Payment Reminders' },
  { key: 'dueDateAlert',       type: 'Due Date Alerts' },
  { key: 'interestRateChange', type: 'Interest Rate Changes' },
  { key: 'payoffNotification', type: 'Payoff Notifications' },
];

const formatAlerts = (prefs = {}) =>
  DEFAULT_LOAN_ALERTS.map(({ key, type }) => ({
    id: key,
    type,
    active: prefs[key] !== false,
  }));

const formatApplication = (app) => ({
  id: app._id,
  applicationNumber: app.applicationNumber,
  type: app.loanType,
  amount: app.loanAmount,
  date: app.submittedAt
    ? new Date(app.submittedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '',
  status: app.status,
  adminNote: app.adminNote || '',
  loanTermMonths: app.loanTermMonths,
  loanPurpose: app.loanPurpose,
  submittedAt: app.submittedAt,
});

const formatLoan = (loan) => ({
  id: loan._id,
  type: loan.type,
  name: loan.name,
  loanNumber: (loan.accountNumber || '').slice(-4) || '—',
  accountNumber: loan.accountNumber,
  originalAmount: loan.originalAmount,
  currentBalance: loan.currentBalance,
  interestRate: loan.interestRate,
  monthlyPayment: loan.monthlyPayment,
  nextPaymentDate: toDateOnly(loan.nextPaymentDate),
  maturityDate: toDateOnly(loan.maturityDate),
  termMonths: loan.termMonths,
  monthsRemaining: loan.monthsRemaining,
  amountPaidToDate: Math.max(
    0,
    (loan.originalAmount || 0) - (loan.currentBalance || 0)
  ),
  paymentMethod: loan.paymentMethod || '',
  status: loan.status,
});

const formatPayment = (p) => ({
  id: p._id,
  loanId: p.loanId,
  date: p.date,
  amount: p.amount,
  principal: p.principal,
  interest: p.interest,
  status: p.status,
});

const deriveSummaryFromLoans = (loans = []) => {
  const active = loans.filter((l) => l.status === 'Active');
  const totalLoanBalance = active.reduce(
    (s, l) => s + (l.currentBalance || 0),
    0
  );
  const next = active
    .filter((l) => l.nextPaymentDate)
    .sort(
      (a, b) =>
        new Date(a.nextPaymentDate).getTime() -
        new Date(b.nextPaymentDate).getTime()
    )[0];
  return {
    totalLoanBalance,
    nextPayment: next?.monthlyPayment ?? 0,
    dueDate: toDateOnly(next?.nextPaymentDate),
    activeLoans: active.length,
  };
};

// ================================================================
// GET /api/admin/loans
// ================================================================
export const adminListLoans = async (req, res) => {
  try {
    const [userLoans, loans, applications] = await Promise.all([
      UserLoan.find().populate('userId', 'firstName lastName email').lean(),
      Loan.find().lean(),
      LoanApplication.find().sort({ submittedAt: -1 }).lean(),
    ]);

    const appsByUser = new Map();
    for (const app of applications) {
      const key = String(app.userId);
      if (!appsByUser.has(key)) appsByUser.set(key, []);
      appsByUser.get(key).push(app);
    }

    const loansByUser = new Map();
    for (const loan of loans) {
      const key = String(loan.userId);
      if (!loansByUser.has(key)) loansByUser.set(key, []);
      loansByUser.get(key).push(loan);
    }

    const allUserIds = new Set();
    for (const ul of userLoans) {
      allUserIds.add(String(ul.userId?._id || ul.userId));
    }
    for (const uid of appsByUser.keys()) allUserIds.add(uid);
    for (const uid of loansByUser.keys()) allUserIds.add(uid);

    const userMap = new Map();
    for (const ul of userLoans) {
      const u = ul.userId;
      if (u && u._id) userMap.set(String(u._id), u);
    }
    const missing = [];
    for (const uid of allUserIds) {
      if (!userMap.has(uid)) missing.push(uid);
    }
    if (missing.length > 0) {
      const users = await User.find({ _id: { $in: missing } })
        .select('firstName lastName email')
        .lean();
      for (const u of users) userMap.set(String(u._id), u);
    }

    const list = [];
    for (const uid of allUserIds) {
      const userLoan = userLoans.find(
        (ul) => String(ul.userId?._id || ul.userId) === uid
      );
      const summary = userLoan
        ? {
            totalLoanBalance: userLoan.totalLoanBalance ?? 0,
            nextPayment: userLoan.nextPayment ?? 0,
            dueDate: toDateOnly(userLoan.dueDate),
            activeLoans: userLoan.activeLoans ?? 0,
          }
        : deriveSummaryFromLoans(loansByUser.get(uid) || []);

      const u = userMap.get(uid);
      list.push({
        id: uid,
        user: u
          ? `${u.firstName || ''} ${u.lastName || ''}`.trim() || '—'
          : '—',
        userEmail: u?.email || '',
        ...summary,
        applications: (appsByUser.get(uid) || []).map(formatApplication),
      });
    }

    res.json({ users: list });
  } catch (err) {
    console.error('❌ adminListLoans:', err);
    res.status(500).json({ error: 'Failed to load loans' });
  }
};

// ================================================================
// GET /api/admin/loans/:userId
// Full detail for one user — everything the user sees on their page.
// ================================================================
export const adminGetUserLoans = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    const [user, userLoan, loans, applications] = await Promise.all([
      User.findById(userId)
        .select('firstName lastName email loanAlertPreferences')
        .lean(),
      UserLoan.findOne({ userId }).lean(),
      Loan.find({ userId }).sort({ createdAt: -1 }).lean(),
      LoanApplication.find({ userId }).sort({ submittedAt: -1 }).lean(),
    ]);

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Payments for every loan belonging to the user
    const loanIds = loans.map((l) => l._id);
    const payments = loanIds.length
      ? await LoanPayment.find({ loanId: { $in: loanIds } })
          .sort({ date: -1 })
          .lean()
      : [];

    const paymentsByLoan = new Map();
    for (const p of payments) {
      const key = String(p.loanId);
      if (!paymentsByLoan.has(key)) paymentsByLoan.set(key, []);
      paymentsByLoan.get(key).push(p);
    }

    const loansWithPayments = loans.map((loan) => ({
      ...formatLoan(loan),
      payments: (paymentsByLoan.get(String(loan._id)) || []).map(formatPayment),
    }));

    const summary = userLoan
      ? {
          totalLoanBalance: userLoan.totalLoanBalance ?? 0,
          nextPayment: userLoan.nextPayment ?? 0,
          dueDate: toDateOnly(userLoan.dueDate),
          activeLoans: userLoan.activeLoans ?? 0,
        }
      : deriveSummaryFromLoans(loans);

    res.json({
      user: {
        id: String(user._id),
        user:
          `${user.firstName || ''} ${user.lastName || ''}`.trim() || '—',
        userEmail: user.email || '',
        summary,
        loans: loansWithPayments,
        applications: applications.map(formatApplication),
        alerts: formatAlerts(user.loanAlertPreferences),
      },
    });
  } catch (err) {
    console.error('❌ adminGetUserLoans:', err);
    res.status(500).json({ error: 'Failed to load user loans' });
  }
};

// ================================================================
// PUT /api/admin/loans/:userId
// Update the admin-managed summary.
// ================================================================
export const adminUpdateUserLoan = async (req, res) => {
  try {
    const { userId } = req.params;
    const { totalLoanBalance, nextPayment, dueDate, activeLoans } =
      req.body || {};

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    const update = {};
    if (totalLoanBalance !== undefined)
      update.totalLoanBalance = Math.max(0, parseFloat(totalLoanBalance) || 0);
    if (nextPayment !== undefined)
      update.nextPayment = Math.max(0, parseFloat(nextPayment) || 0);
    if (activeLoans !== undefined)
      update.activeLoans = Math.max(0, parseInt(activeLoans, 10) || 0);
    if (dueDate !== undefined)
      update.dueDate = dueDate ? new Date(dueDate) : null;

    const record = await UserLoan.findOneAndUpdate(
      { userId },
      { $set: update, $setOnInsert: { userId } },
      { new: true, upsert: true, lean: true }
    );

    res.json({
      message: 'Loan summary updated',
      loan: {
        totalLoanBalance: record.totalLoanBalance ?? 0,
        nextPayment: record.nextPayment ?? 0,
        dueDate: toDateOnly(record.dueDate),
        activeLoans: record.activeLoans ?? 0,
      },
    });
  } catch (err) {
    console.error('❌ adminUpdateUserLoan:', err);
    res.status(500).json({ error: 'Failed to update loan summary' });
  }
};

// ================================================================
// PUT /api/admin/loans/:userId/loans/:loanId
// Edit a single loan document.
// ================================================================
const LOAN_EDITABLE = [
  'type',
  'name',
  'accountNumber',
  'originalAmount',
  'currentBalance',
  'interestRate',
  'monthlyPayment',
  'nextPaymentDate',
  'maturityDate',
  'termMonths',
  'monthsRemaining',
  'status',
  'paymentMethod',
];

const NUMERIC_LOAN_FIELDS = new Set([
  'originalAmount',
  'currentBalance',
  'interestRate',
  'monthlyPayment',
  'termMonths',
  'monthsRemaining',
]);

const DATE_LOAN_FIELDS = new Set(['nextPaymentDate', 'maturityDate']);

export const adminUpdateLoan = async (req, res) => {
  try {
    const { userId, loanId } = req.params;
    const body = req.body || {};

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(loanId)
    ) {
      return res.status(400).json({ error: 'Invalid id' });
    }

    const loan = await Loan.findOne({ _id: loanId, userId });
    if (!loan) return res.status(404).json({ error: 'Loan not found' });

    for (const field of LOAN_EDITABLE) {
      if (!(field in body)) continue;
      const value = body[field];

      if (DATE_LOAN_FIELDS.has(field)) {
        loan[field] = value ? new Date(value) : null;
      } else if (NUMERIC_LOAN_FIELDS.has(field)) {
        const n = parseFloat(value);
        loan[field] = Number.isFinite(n) ? n : 0;
      } else {
        loan[field] = value ?? '';
      }
    }

    await loan.save();

    res.json({
      message: 'Loan updated',
      loan: formatLoan(loan.toObject()),
    });
  } catch (err) {
    console.error('❌ adminUpdateLoan:', err);
    res.status(500).json({ error: 'Failed to update loan' });
  }
};

// ================================================================
// PUT /api/admin/loans/:userId/alerts
// Body: { alerts: [{ id, active }] }
// ================================================================
export const adminUpdateUserAlerts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { alerts } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }
    if (!Array.isArray(alerts)) {
      return res.status(400).json({ error: 'alerts must be an array' });
    }

    const update = {};
    for (const a of alerts) {
      if (!a?.id) continue;
      const valid = DEFAULT_LOAN_ALERTS.some((d) => d.key === a.id);
      if (!valid) continue;
      update[`loanAlertPreferences.${a.id}`] = !!a.active;
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: update },
      { new: true, lean: true }
    ).select('loanAlertPreferences');

    res.json({ alerts: formatAlerts(updated?.loanAlertPreferences) });
  } catch (err) {
    console.error('❌ adminUpdateUserAlerts:', err);
    res.status(500).json({ error: 'Failed to update alerts' });
  }
};

// ================================================================
// PUT /api/admin/loans/applications/:id
// ================================================================
export const adminUpdateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body || {};

    if (!['Pending', 'Under Review', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const app = await LoanApplication.findById(id);
    if (!app) return res.status(404).json({ error: 'Application not found' });

    app.status = status;
    if (typeof adminNote === 'string') app.adminNote = adminNote;
    if (status === 'Approved' || status === 'Rejected') {
      app.reviewedAt = new Date();
      app.reviewedBy = req.user._id;
    }
    await app.save();

    res.json({
      message: `Application ${status.toLowerCase()}`,
      application: formatApplication(app.toObject()),
    });
  } catch (err) {
    console.error('❌ adminUpdateApplicationStatus:', err);
    res.status(500).json({ error: 'Failed to update application status' });
  }
};