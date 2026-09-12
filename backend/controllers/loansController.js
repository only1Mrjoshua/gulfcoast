// controllers/loansController.js
import User from '../models/User.js';
import Loan from '../models/Loan.js';
import LoanPayment from '../models/LoanPayment.js';
import LoanApplication from '../models/LoanApplication.js';

// ---------- Helpers ----------
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

const formatUserLoan = (loan) => ({
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

// ================================================================
// GET /api/loans/overview
// ================================================================
export const getLoansOverview = async (req, res) => {
  try {
    const userId = req.user._id;

    const [user, loans, applications] = await Promise.all([
      User.findById(userId).select('loanAlertPreferences').lean(),
      Loan.find({ userId }).sort({ createdAt: -1 }).lean(),
      LoanApplication.find({ userId })
        .sort({ submittedAt: -1 })
        .limit(20)
        .lean(),
    ]);

    const activeLoans = loans.filter((l) => l.status === 'Active');
    const totalLoanBalance = activeLoans.reduce(
      (s, l) => s + (l.currentBalance || 0),
      0
    );

    const next = activeLoans
      .filter((l) => l.nextPaymentDate)
      .sort(
        (a, b) =>
          new Date(a.nextPaymentDate).getTime() -
          new Date(b.nextPaymentDate).getTime()
      )[0];

    res.json({
      summary: {
        totalLoanBalance,
        nextPayment: next?.monthlyPayment ?? 0,
        dueDate: toDateOnly(next?.nextPaymentDate),
        activeLoans: activeLoans.length,
      },
      loans: loans.map(formatUserLoan),
      alerts: formatAlerts(user?.loanAlertPreferences),
      applications: applications.map(formatApplication),
    });
  } catch (err) {
    console.error('❌ getLoansOverview:', err);
    res.status(500).json({ error: 'Failed to load loans overview' });
  }
};

// ================================================================
// GET /api/loans/application-profile
// ================================================================
export const getApplicationProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const addr = user.address || {};

    res.json({
      profile: {
        firstName:   user.firstName || '',
        lastName:    user.lastName || '',
        dateOfBirth: user.dateOfBirth || '',
        ssn:         '', // never echo the full SSN
        email:       user.email || '',
        phone:       user.phone || '',
        street:      addr.street || '',
        city:        addr.city || '',
        state:       addr.state || '',
        zip:         addr.zip || '',
        housingStatus:  user.housingStatus || 'Rent',
        monthlyHousing: user.monthlyHousing ?? '',
      },
    });
  } catch (err) {
    console.error('❌ getApplicationProfile:', err);
    res.status(500).json({ error: 'Failed to load profile' });
  }
};

// ================================================================
// POST /api/loans/apply
// ================================================================
export const submitLoanApplication = async (req, res) => {
  try {
    const userId = req.user._id;
    const body = req.body || {};

    const loanAmount = parseFloat(body.loanAmount);
    if (!loanAmount || loanAmount <= 0) {
      return res.status(400).json({ error: 'A valid loan amount is required' });
    }
    if (!body.authorizeCredit || !body.agreeTerms) {
      return res
        .status(400)
        .json({ error: 'You must accept both authorization checkboxes' });
    }

    const applicationNumber =
      'LN-' + Math.floor(100000 + Math.random() * 900000);

    const app = await LoanApplication.create({
      userId,
      applicationNumber,

      firstName:   body.firstName || '',
      lastName:    body.lastName || '',
      dateOfBirth: body.dateOfBirth || '',
      ssn:         body.ssn || '',
      email:       body.email || '',
      phone:       body.phone || '',

      street:        body.street || '',
      city:          body.city || '',
      state:         body.state || '',
      zip:           body.zip || '',
      housingStatus: body.housingStatus || 'Rent',
      monthlyHousing: parseFloat(body.monthlyHousing) || 0,

      employmentStatus: body.employmentStatus || 'Employed',
      employerName:     body.employerName || '',
      jobTitle:         body.jobTitle || '',
      yearsEmployed:    parseFloat(body.yearsEmployed) || 0,
      annualIncome:     parseFloat(body.annualIncome) || 0,
      additionalIncome: parseFloat(body.additionalIncome) || 0,

      loanType:       body.loanType || 'Personal',
      loanAmount,
      loanTermMonths: parseInt(body.loanTermMonths, 10) || 36,
      loanPurpose:    body.loanPurpose || '',

      authorizeCredit: !!body.authorizeCredit,
      agreeTerms:      !!body.agreeTerms,

      status: 'Pending',
      submittedAt: new Date(),
    });

    res.status(201).json({
      message: 'Application submitted',
      application: formatApplication(app.toObject()),
    });
  } catch (err) {
    console.error('❌ submitLoanApplication:', err);
    res.status(500).json({ error: 'Failed to submit application' });
  }
};

// ================================================================
// PUT /api/loans/alerts
// Body: { alerts: [{ id: 'paymentReminder', active: true }, ... ] }
// ================================================================
export const updateLoanAlerts = async (req, res) => {
  try {
    const userId = req.user._id;
    const { alerts } = req.body || {};

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
    console.error('❌ updateLoanAlerts:', err);
    res.status(500).json({ error: 'Failed to update alerts' });
  }
};

// ================================================================
// GET /api/loans/:id/payments
// Returns the payment history for a single loan (belonging to the user)
// ================================================================
export const getLoanPayments = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const loan = await Loan.findOne({ _id: id, userId }).lean();
    if (!loan) return res.status(404).json({ error: 'Loan not found' });

    const payments = await LoanPayment.find({ loanId: loan._id, userId })
      .sort({ date: -1 })
      .lean();

    res.json({
      payments: payments.map((p) => ({
        id: p._id,
        date: p.date,
        amount: p.amount,
        principal: p.principal,
        interest: p.interest,
        status: p.status,
      })),
    });
  } catch (err) {
    console.error('❌ getLoanPayments:', err);
    res.status(500).json({ error: 'Failed to load loan payments' });
  }
};