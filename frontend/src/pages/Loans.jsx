// src/pages/Loans.jsx
import React, { useState, useEffect } from 'react';
import {
  Plus,
  Landmark,
  CreditCard,
  Home,
  Car,
  GraduationCap,
  PiggyBank,
  Briefcase,
  ArrowUpRight,
  ChevronRight,
  CheckCircle2,
  X,
  FileText,
  Download,
  Eye,
  Calendar,
  TrendingDown,
  Wallet,
  ShieldCheck,
  Bell,
  User,
  MapPin,
  Building2,
  DollarSign,
  ClipboardCheck,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { mockLoanDocuments } from '../data/mockLoansData';
import { apiFetch } from '../utils/api';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount ?? 0);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const s = String(dateStr);
  const date = s.includes('T') ? new Date(s) : new Date(s + 'T00:00:00');
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatDateLong = (dateStr) => {
  if (!dateStr) return '—';
  const s = String(dateStr);
  const date = s.includes('T') ? new Date(s) : new Date(s + 'T00:00:00');
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
];

const getExploreIcon = (option) => {
  const key = `${option.id || ''} ${option.name || ''}`.toLowerCase();
  if (key.includes('mortgage') || key.includes('home')) return Home;
  if (key.includes('auto') || key.includes('car') || key.includes('vehicle')) return Car;
  if (key.includes('student') || key.includes('education')) return GraduationCap;
  if (key.includes('personal')) return Wallet;
  if (key.includes('business')) return Briefcase;
  if (key.includes('saving') || key.includes('cd')) return PiggyBank;
  if (key.includes('credit') || key.includes('card')) return CreditCard;
  return Landmark;
};

const Loans = () => {
  const [selectedLoanId, setSelectedLoanId] = useState(null);
  const [showApplication, setShowApplication] = useState(false);

  // Backend data
  const [loans, setLoans] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState({
    totalLoanBalance: 0,
    nextPayment: 0,
    dueDate: '',
    activeLoans: 0,
  });
  const [loansLoading, setLoansLoading] = useState(true);
  const [loansError, setLoansError] = useState('');
  const [applicationPrefill, setApplicationPrefill] = useState(null);

  // Payment history — fetched per selected loan
  const [loanPayments, setLoanPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState('');

  // ── Load overview on mount ─────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setLoansLoading(true);
        setLoansError('');
        const res = await apiFetch('/loans/overview');
        const d = res?.data ?? res;
        setLoans(d.loans ?? []);
        setAlerts(d.alerts ?? []);
        setSummary(
          d.summary ?? {
            totalLoanBalance: 0,
            nextPayment: 0,
            dueDate: '',
            activeLoans: 0,
          }
        );
      } catch (err) {
        console.error('❌ Failed to load loans:', err);
        setLoansError(err.message || 'Failed to load loans');
      } finally {
        setLoansLoading(false);
      }
    };
    load();
  }, []);

  const selectedLoan = loans.find(
    (l) => String(l.id) === String(selectedLoanId)
  );

  // ── Load payments when a loan is selected ──────────────
  useEffect(() => {
    if (!selectedLoan) {
      setLoanPayments([]);
      return;
    }

    let cancelled = false;

    const loadPayments = async () => {
      try {
        setPaymentsLoading(true);
        setPaymentsError('');
        const res = await apiFetch(`/loans/${selectedLoan.id}/payments`);
        const d = res?.data ?? res;
        if (!cancelled) setLoanPayments(d.payments ?? []);
      } catch (err) {
        console.error('❌ Failed to load loan payments:', err);
        if (!cancelled) {
          setLoanPayments([]);
          setPaymentsError(err.message || 'Failed to load payments');
        }
      } finally {
        if (!cancelled) setPaymentsLoading(false);
      }
    };

    loadPayments();
    return () => {
      cancelled = true;
    };
  }, [selectedLoan?.id]);

  const loanDocuments = selectedLoan
    ? mockLoanDocuments.filter(
        (d) => String(d.loanId) === String(selectedLoan.id)
      )
    : [];

  const activeLoans = loans.filter((l) => l.status === 'Active');
  const hasActiveLoans = activeLoans.length > 0;

  // ── Handlers ───────────────────────────────────────────
  const handleApplyForLoan = async () => {
    setShowApplication(true);
    try {
      const res = await apiFetch('/loans/application-profile');
      const d = res?.data ?? res;
      setApplicationPrefill(d.profile ?? null);
    } catch (err) {
      console.error('❌ Failed to load profile:', err);
      setApplicationPrefill(null);
    }
  };
  const closeApplication = () => setShowApplication(false);

  const handleDocumentAction = (doc, action) => {
    alert(`${action} ${doc.name}`);
  };

  const toggleAlert = async (alertId) => {
    const current = alerts.find((a) => a.id === alertId);
    if (!current) return;

    const previous = alerts;
    const next = alerts.map((a) =>
      a.id === alertId ? { ...a, active: !a.active } : a
    );
    setAlerts(next);

    try {
      const res = await apiFetch('/loans/alerts', {
        method: 'PUT',
        body: JSON.stringify({
          alerts: next.map((a) => ({ id: a.id, active: a.active })),
        }),
      });
      const d = res?.data ?? res;
      if (d?.alerts) setAlerts(d.alerts);
    } catch (err) {
      console.error('❌ Failed to update alert:', err);
      setAlerts(previous);
    }
  };

  const getRepaymentProgress = (loan) => {
    const paid = loan.amountPaidToDate;
    const total = loan.originalAmount;
    if (!total || total <= 0) return 0;
    return Math.min((paid / total) * 100, 100);
  };

  const overviewCards = [
    {
      label: 'Total Loan Balance',
      value: hasActiveLoans ? formatCurrency(summary.totalLoanBalance) : '—',
      icon: Landmark,
    },
    {
      label: 'Next Payment',
      value: summary.nextPayment ? formatCurrency(summary.nextPayment) : '—',
      icon: TrendingDown,
    },
    {
      label: 'Due',
      value: summary.dueDate ? formatDate(summary.dueDate) : '—',
      icon: Calendar,
    },
    {
      label: 'Active Loans',
      value: summary.activeLoans || 0,
      icon: CheckCircle2,
    },
  ];

  if (loansLoading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" strokeWidth={1.75} />
        <p className="text-sm text-muted">Loading your loans…</p>
      </div>
    );
  }

  if (loansError) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-4">
        <p className="font-serif text-xl font-bold text-deep-accent">
          We couldn&rsquo;t load your loans
        </p>
        <p className="max-w-md text-center text-sm text-muted">{loansError}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-2 bg-primary px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-primary-deep"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 border-b border-hairline pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-2xl font-bold leading-tight text-deep-accent sm:text-3xl">
            Loans
          </h1>
          <p className="mt-1 text-sm text-body sm:text-base">
            Manage your loans, view payment details, and stay on top of your repayment
            schedule.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={handleApplyForLoan}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <Plus className="h-4 w-4" strokeWidth={2.25} />
            Apply for a Loan
          </button>
        </div>
      </div>

      {/* Overview */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {overviewCards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="border border-hairline bg-faint px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted sm:text-xs">
                {label}
              </span>
              <Icon className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
            </div>
            <div className="mt-1 font-serif text-lg font-bold text-deep-accent sm:text-xl">
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* My Loans */}
      <section className="mb-10">
        <h2 className="mb-4 font-serif text-lg font-bold text-deep-accent sm:text-xl">
          My Loans
        </h2>

        {!hasActiveLoans ? (
          <div className="flex flex-col items-center justify-center border border-hairline bg-faint px-6 py-12 text-center sm:py-16">
            <span className="flex h-12 w-12 items-center justify-center bg-[#e7f3f5] text-primary">
              <Landmark className="h-6 w-6" strokeWidth={1.75} />
            </span>
            <h3 className="mt-4 font-serif text-base font-bold text-deep-accent sm:text-lg">
              You do not have an active loan
            </h3>
            <p className="mt-1 max-w-md text-sm text-body">
              When you take out a loan with us, it will appear here so you can track
              payments, view documents, and manage autopay.
            </p>
            <button
              type="button"
              onClick={handleApplyForLoan}
              className="mt-5 inline-flex min-h-[44px] items-center justify-center gap-2 bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <Plus className="h-4 w-4" strokeWidth={2.25} />
              Apply for a Loan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loans.map((loan) => {
              const isSelected = String(selectedLoanId) === String(loan.id);
              return (
                <div
                  key={loan.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedLoanId(loan.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedLoanId(loan.id);
                    }
                  }}
                  className={`group flex cursor-pointer flex-col border bg-white p-5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                    isSelected
                      ? 'border-2 border-primary'
                      : 'border border-hairline hover:border-primary'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-deep-accent">
                      <Landmark className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
                      {loan.type}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide ${
                        loan.status === 'Active' ? 'text-primary' : 'text-muted'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 ${
                          loan.status === 'Active' ? 'bg-primary' : 'bg-muted'
                        }`}
                        aria-hidden="true"
                      />
                      {loan.status}
                    </span>
                  </div>

                  <div className="mt-3 text-sm font-semibold text-deep-accent sm:text-base">
                    {loan.name}
                  </div>
                  <div className="mt-0.5 text-xs text-muted">
                    Loan #•••• {loan.loanNumber}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-y border-hairline py-3">
                    <span className="text-xs text-muted">Current Balance</span>
                    <span className="font-serif text-base font-bold text-deep-accent">
                      {formatCurrency(loan.currentBalance)}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wide text-muted">
                        Monthly
                      </span>
                      <span className="text-xs font-semibold text-deep-accent">
                        {formatCurrency(loan.monthlyPayment)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wide text-muted">
                        Next Payment
                      </span>
                      <span className="text-xs font-semibold text-deep-accent">
                        {formatDate(loan.nextPaymentDate)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wide text-muted">
                        Rate
                      </span>
                      <span className="text-xs font-semibold text-deep-accent">
                        {loan.interestRate}%
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLoanId(loan.id);
                    }}
                    className="mt-4 inline-flex min-h-[34px] items-center justify-center gap-1.5 border border-hairline bg-white px-3 py-1.5 text-xs font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    View Loan Details
                    <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.25} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Selected Loan Details */}
      {selectedLoan && (
        <section className="mb-10 border-t border-hairline pt-8">
          <h2 className="mb-4 font-serif text-lg font-bold text-deep-accent sm:text-xl">
            Loan Details
          </h2>

          <div className="border border-hairline bg-faint p-5 sm:p-6">
            <div className="mb-6 flex min-w-0 items-start gap-3 border-b border-hairline pb-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-deep-accent text-white">
                <Landmark className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-deep-accent sm:text-base">
                  {selectedLoan.name}
                </div>
                <div className="truncate text-xs text-body sm:text-sm">
                  {selectedLoan.type}
                </div>
                <div className="text-xs text-muted">
                  Loan #•••• {selectedLoan.loanNumber}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="flex flex-col divide-y divide-hairline">
                <DetailRow
                  label="Original Amount"
                  value={formatCurrency(selectedLoan.originalAmount)}
                />
                <DetailRow
                  label="Current Balance"
                  value={formatCurrency(selectedLoan.currentBalance)}
                />
                <DetailRow
                  label="Interest Rate"
                  value={`${selectedLoan.interestRate}%`}
                />
                <DetailRow
                  label="Monthly Payment"
                  value={formatCurrency(selectedLoan.monthlyPayment)}
                />
                <DetailRow
                  label="Next Payment Due"
                  value={formatDateLong(selectedLoan.nextPaymentDate)}
                />
                <DetailRow
                  label="Maturity Date"
                  value={
                    selectedLoan.maturityDate
                      ? formatDateLong(selectedLoan.maturityDate)
                      : '—'
                  }
                />
                <DetailRow
                  label="Amount Paid"
                  value={formatCurrency(selectedLoan.amountPaidToDate || 0)}
                />
                <DetailRow
                  label="Payment Method"
                  value={selectedLoan.paymentMethod || '—'}
                />
                <DetailRow
                  label="Status"
                  value={selectedLoan.status}
                  valueColor="text-primary"
                />

                <div className="pt-3">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-xs text-muted">Repayment Progress</span>
                    <span className="text-xs font-bold text-deep-accent">
                      {Math.round(getRepaymentProgress(selectedLoan))}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-hairline">
                    <div
                      className="h-full bg-primary transition-[width] duration-300"
                      style={{ width: `${getRepaymentProgress(selectedLoan)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col">
                <h3 className="mb-3 font-serif text-base font-bold text-deep-accent sm:text-lg">
                  Payment History
                </h3>

                <div className="flex flex-col border-t border-hairline">
                  {paymentsLoading ? (
                    <p className="py-4 text-sm text-muted">Loading payments…</p>
                  ) : paymentsError ? (
                    <p className="py-4 text-sm text-[#d9534f]">{paymentsError}</p>
                  ) : loanPayments.length === 0 ? (
                    <p className="py-4 text-sm text-muted">
                      No payment history available.
                    </p>
                  ) : (
                    loanPayments.slice(0, 12).map((payment) => (
                      <div
                        key={payment.id}
                        className="flex flex-col gap-2 border-b border-faint py-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-faint text-body">
                            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
                          </span>
                          <div className="flex flex-col">
                            <span className="text-xs text-muted">
                              {formatDate(payment.date)}
                            </span>
                            <span className="text-sm font-semibold text-[#d9534f]">
                              -{formatCurrency(payment.amount)}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 sm:justify-end">
                          <span className="text-xs text-muted">
                            Principal: {formatCurrency(payment.principal)}
                          </span>
                          <span className="text-xs text-muted">
                            Interest: {formatCurrency(payment.interest)}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-primary">
                            <span
                              className="h-1.5 w-1.5 bg-primary"
                              aria-hidden="true"
                            />
                            {payment.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-hairline pt-6">
              <div className="mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" strokeWidth={1.75} />
                <h3 className="font-serif text-base font-bold text-deep-accent sm:text-lg">
                  Loan Documents
                </h3>
              </div>

              <div className="flex flex-col divide-y divide-faint border-t border-hairline">
                {loanDocuments.length === 0 ? (
                  <p className="py-3 text-sm text-muted">No documents available.</p>
                ) : (
                  loanDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-6"
                    >
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                        {doc.name}
                      </span>
                      <span className="text-xs text-muted sm:w-28">
                        {formatDate(doc.date)}
                      </span>
                      <span className="text-xs text-body sm:w-20">{doc.type}</span>
                      <span className="text-xs text-muted sm:w-20">{doc.size}</span>
                      <div className="flex gap-3 sm:gap-4">
                        <button
                          type="button"
                          onClick={() => handleDocumentAction(doc, 'View')}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline sm:text-sm"
                        >
                          <Eye className="h-3.5 w-3.5" strokeWidth={2} />
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDocumentAction(doc, 'Download')}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline sm:text-sm"
                        >
                          <Download className="h-3.5 w-3.5" strokeWidth={2} />
                          Download
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Loan Alerts */}
      <section className="mb-10 border-t border-hairline pt-8">
        <div className="mb-4 flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" strokeWidth={1.75} />
          <h2 className="font-serif text-lg font-bold text-deep-accent sm:text-xl">
            Loan Alerts
          </h2>
        </div>

        <div className="flex flex-col divide-y divide-faint border-t border-hairline">
          {alerts.length === 0 && (
            <p className="py-3 text-sm text-muted">No alerts available.</p>
          )}

          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-center gap-3 py-3">
              <span
                className={`h-1.5 w-1.5 shrink-0 ${
                  alert.active ? 'bg-primary' : 'bg-[#d9534f]'
                }`}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-deep-accent">
                {alert.type}
              </span>
              <span
                className={`shrink-0 text-xs font-bold uppercase tracking-wide ${
                  alert.active ? 'text-primary' : 'text-[#d9534f]'
                }`}
              >
                {alert.active ? 'ON' : 'OFF'}
              </span>
              <button
                type="button"
                onClick={() => toggleAlert(alert.id)}
                className="shrink-0 border border-hairline bg-white px-2.5 py-1 text-xs font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                {alert.active ? 'Turn Off' : 'Turn On'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Loan Application Modal */}
      {showApplication && (
        <LoanApplicationModal
          onClose={closeApplication}
          prefill={applicationPrefill}
        />
      )}
    </div>
  );
};

// ============================================================
// Loan Application Modal (unchanged)
// ============================================================
const LoanApplicationModal = ({ onClose, prefill }) => {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [submitError, setSubmitError] = useState('');

  const [formData, setFormData] = useState({
    firstName: prefill?.firstName || '',
    lastName: prefill?.lastName || '',
    dateOfBirth: prefill?.dateOfBirth || '',
    ssn: prefill?.ssn || '',
    email: prefill?.email || '',
    phone: prefill?.phone || '',
    street: prefill?.street || '',
    city: prefill?.city || '',
    state: prefill?.state || '',
    zip: prefill?.zip || '',
    housingStatus: prefill?.housingStatus || 'Rent',
    monthlyHousing: prefill?.monthlyHousing ?? '',
    employmentStatus: 'Employed',
    employerName: '',
    jobTitle: '',
    yearsEmployed: '',
    annualIncome: '',
    additionalIncome: '',
    loanType: 'Personal',
    loanAmount: '',
    loanTermMonths: '36',
    loanPurpose: '',
    authorizeCredit: false,
    agreeTerms: false,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSsnChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 9);
    let formatted = digits;
    if (digits.length > 5) {
      formatted = `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
    } else if (digits.length > 3) {
      formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
    }
    setFormData((prev) => ({ ...prev, ssn: formatted }));
  };

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    let formatted = digits;
    if (digits.length > 6) {
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length > 3) {
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else if (digits.length > 0) {
      formatted = `(${digits}`;
    }
    setFormData((prev) => ({ ...prev, phone: formatted }));
  };

  const validate = () => {
    const next = {};
    if (!formData.firstName.trim()) next.firstName = 'Required';
    if (!formData.lastName.trim()) next.lastName = 'Required';
    if (!formData.dateOfBirth) next.dateOfBirth = 'Required';
    if (formData.ssn.replace(/\D/g, '').length !== 9) next.ssn = 'Enter 9 digits';
    if (!formData.email.trim()) next.email = 'Required';
    if (formData.phone.replace(/\D/g, '').length !== 10) next.phone = 'Enter 10 digits';
    if (!formData.street.trim()) next.street = 'Required';
    if (!formData.city.trim()) next.city = 'Required';
    if (!formData.state) next.state = 'Required';
    if (!/^\d{5}$/.test(formData.zip)) next.zip = 'Enter 5 digits';
    if (!formData.annualIncome) next.annualIncome = 'Required';
    if (!formData.loanAmount || parseFloat(formData.loanAmount) <= 0)
      next.loanAmount = 'Enter amount';
    if (!formData.authorizeCredit) next.authorizeCredit = 'Required';
    if (!formData.agreeTerms) next.agreeTerms = 'Required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await apiFetch('/loans/apply', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      const d = res?.data ?? res;
      setConfirmationNumber(d?.application?.applicationNumber || '');
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="loan-app-title"
        className="relative flex max-h-[92vh] w-full max-w-[720px] flex-col border border-hairline bg-white shadow-2xl sm:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalCloseButton onClick={onClose} />

        {submitted ? (
          <div className="flex flex-col items-center px-6 py-10 text-center sm:px-10">
            <div className="flex h-14 w-14 items-center justify-center bg-[#e7f3f5]">
              <CheckCircle2 className="h-8 w-8 text-primary" strokeWidth={1.75} />
            </div>
            <h2
              id="loan-app-title"
              className="mt-4 font-serif text-2xl font-bold text-deep-accent sm:text-3xl"
            >
              Application Submitted
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-body sm:text-base">
              Thank you, {formData.firstName}. We&apos;ve received your{' '}
              {formData.loanType.toLowerCase()} loan application for{' '}
              {formatCurrency(parseFloat(formData.loanAmount) || 0)}. A specialist
              will reach out within 1–2 business days.
            </p>

            <div className="mt-6 w-full max-w-md border border-hairline bg-faint p-5 text-left">
              <SummaryLine label="Confirmation Number" value={confirmationNumber} />
              <SummaryLine label="Loan Type" value={formData.loanType} />
              <SummaryLine
                label="Requested Amount"
                value={formatCurrency(parseFloat(formData.loanAmount) || 0)}
              />
              <SummaryLine label="Term" value={`${formData.loanTermMonths} months`} />
              <SummaryLine
                label="Submitted"
                value={new Date().toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              />
              <SummaryLine
                label="Status"
                value={
                  <span className="inline-flex items-center gap-1.5 text-[#b8860b]">
                    <span className="h-1.5 w-1.5 bg-[#b8860b]" aria-hidden="true" />
                    Under Review
                  </span>
                }
              />
            </div>

            <div className="mt-6 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 border border-primary bg-white px-6 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="border-b border-hairline px-5 py-4 sm:px-7">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-primary" strokeWidth={2} />
                <span className="text-[11px] font-bold uppercase tracking-wide text-muted">
                  Loan Application
                </span>
              </div>
              <h2
                id="loan-app-title"
                className="mt-1 font-serif text-xl font-bold text-deep-accent sm:text-2xl"
              >
                Apply for a Loan
              </h2>
              <p className="mt-1 text-xs text-body sm:text-sm">
                Complete the form below. All fields marked with * are required.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto px-5 py-5 sm:px-7"
            >
              <FormSection icon={User} title="Personal Information">
                <Field
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={errors.firstName}
                  required
                />
                <Field
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  error={errors.lastName}
                  required
                />
                <Field
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  error={errors.dateOfBirth}
                  required
                />
                <Field
                  label="Social Security Number"
                  name="ssn"
                  value={formData.ssn}
                  onChange={handleSsnChange}
                  placeholder="XXX-XX-XXXX"
                  error={errors.ssn}
                  required
                />
                <Field
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  required
                />
                <Field
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="(XXX) XXX-XXXX"
                  error={errors.phone}
                  required
                />
              </FormSection>

              <FormSection icon={MapPin} title="Current Address">
                <Field
                  label="Street Address"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  error={errors.street}
                  required
                  className="sm:col-span-2"
                />
                <Field
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  error={errors.city}
                  required
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-deep-accent">
                    State <span className="text-[#d9534f]">*</span>
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className={`min-h-[44px] w-full border bg-white px-3 py-2 text-sm text-deep-accent focus:outline-none ${
                      errors.state
                        ? 'border-[#d9534f] focus:border-[#d9534f]'
                        : 'border-hairline focus:border-primary'
                    }`}
                  >
                    <option value="">Select state</option>
                    {US_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {errors.state && (
                    <p className="text-xs text-[#d9534f]">{errors.state}</p>
                  )}
                </div>
                <Field
                  label="ZIP Code"
                  name="zip"
                  value={formData.zip}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      zip: e.target.value.replace(/\D/g, '').slice(0, 5),
                    }))
                  }
                  placeholder="12345"
                  error={errors.zip}
                  required
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-deep-accent">
                    Housing Status
                  </label>
                  <select
                    name="housingStatus"
                    value={formData.housingStatus}
                    onChange={handleChange}
                    className="min-h-[44px] w-full border border-hairline bg-white px-3 py-2 text-sm text-deep-accent focus:border-primary focus:outline-none"
                  >
                    <option value="Own">Own</option>
                    <option value="Rent">Rent</option>
                    <option value="Live with family">Live with family</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <Field
                  label="Monthly Housing Payment"
                  name="monthlyHousing"
                  type="number"
                  value={formData.monthlyHousing}
                  onChange={handleChange}
                  placeholder="0.00"
                  prefix="$"
                />
              </FormSection>

              <FormSection icon={Building2} title="Employment & Income">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-deep-accent">
                    Employment Status
                  </label>
                  <select
                    name="employmentStatus"
                    value={formData.employmentStatus}
                    onChange={handleChange}
                    className="min-h-[44px] w-full border border-hairline bg-white px-3 py-2 text-sm text-deep-accent focus:border-primary focus:outline-none"
                  >
                    <option value="Employed">Employed</option>
                    <option value="Self-Employed">Self-Employed</option>
                    <option value="Retired">Retired</option>
                    <option value="Student">Student</option>
                    <option value="Unemployed">Unemployed</option>
                  </select>
                </div>
                <Field
                  label="Employer Name"
                  name="employerName"
                  value={formData.employerName}
                  onChange={handleChange}
                />
                <Field
                  label="Job Title"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                />
                <Field
                  label="Years at Employer"
                  name="yearsEmployed"
                  type="number"
                  value={formData.yearsEmployed}
                  onChange={handleChange}
                  placeholder="0"
                />
                <Field
                  label="Annual Gross Income"
                  name="annualIncome"
                  type="number"
                  value={formData.annualIncome}
                  onChange={handleChange}
                  placeholder="0.00"
                  prefix="$"
                  error={errors.annualIncome}
                  required
                />
                <Field
                  label="Additional Income"
                  name="additionalIncome"
                  type="number"
                  value={formData.additionalIncome}
                  onChange={handleChange}
                  placeholder="0.00"
                  prefix="$"
                />
              </FormSection>

              <FormSection icon={DollarSign} title="Loan Request">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-deep-accent">
                    Loan Type
                  </label>
                  <select
                    name="loanType"
                    value={formData.loanType}
                    onChange={handleChange}
                    className="min-h-[44px] w-full border border-hairline bg-white px-3 py-2 text-sm text-deep-accent focus:border-primary focus:outline-none"
                  >
                    <option value="Personal">Personal Loan</option>
                    <option value="Auto">Auto Loan</option>
                    <option value="Home">Home / Mortgage</option>
                    <option value="Student">Student Loan</option>
                    <option value="Business">Business Loan</option>
                  </select>
                </div>
                <Field
                  label="Loan Amount Requested"
                  name="loanAmount"
                  type="number"
                  value={formData.loanAmount}
                  onChange={handleChange}
                  placeholder="0.00"
                  prefix="$"
                  error={errors.loanAmount}
                  required
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-deep-accent">
                    Loan Term
                  </label>
                  <select
                    name="loanTermMonths"
                    value={formData.loanTermMonths}
                    onChange={handleChange}
                    className="min-h-[44px] w-full border border-hairline bg-white px-3 py-2 text-sm text-deep-accent focus:border-primary focus:outline-none"
                  >
                    <option value="12">12 months</option>
                    <option value="24">24 months</option>
                    <option value="36">36 months</option>
                    <option value="48">48 months</option>
                    <option value="60">60 months</option>
                    <option value="84">84 months</option>
                    <option value="120">120 months</option>
                    <option value="180">180 months</option>
                    <option value="360">360 months</option>
                  </select>
                </div>
                <Field
                  label="Purpose of Loan"
                  name="loanPurpose"
                  value={formData.loanPurpose}
                  onChange={handleChange}
                  placeholder="e.g. Debt consolidation"
                  className="sm:col-span-2"
                />
              </FormSection>

              <FormSection icon={ShieldCheck} title="Authorization">
                <div className="flex flex-col gap-3 sm:col-span-2">
                  <CheckboxField
                    name="authorizeCredit"
                    checked={formData.authorizeCredit}
                    onChange={handleChange}
                    error={errors.authorizeCredit}
                  >
                    I authorize the bank to obtain a credit report and verify the
                    information provided in this application.
                  </CheckboxField>
                  <CheckboxField
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    error={errors.agreeTerms}
                  >
                    I certify that the information I have provided is accurate and
                    complete, and I agree to the terms and conditions.
                  </CheckboxField>
                </div>
              </FormSection>

              {submitError && (
                <div className="mb-2 flex items-start gap-2 border border-[#f5c6cb] bg-[#f8d7da] px-4 py-2.5">
                  <AlertCircle
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#721c24]"
                    strokeWidth={2}
                  />
                  <span className="text-sm text-[#721c24]">{submitError}</span>
                </div>
              )}
            </form>

            <div className="flex flex-col-reverse gap-2 border-t border-hairline px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="min-h-[44px] border border-hairline bg-white px-5 py-2.5 text-sm font-semibold text-deep-accent transition-colors hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.25} />
                    Submitting…
                  </>
                ) : (
                  <>
                    <ClipboardCheck className="h-4 w-4" strokeWidth={2.25} />
                    Submit Application
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const Field = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  error,
  required,
  prefix,
  className = '',
}) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label htmlFor={name} className="text-sm font-semibold text-deep-accent">
      {label} {required && <span className="text-[#d9534f]">*</span>}
    </label>
    {prefix ? (
      <div
        className={`flex items-center border bg-white focus-within:border-primary ${
          error ? 'border-[#d9534f]' : 'border-hairline'
        }`}
      >
        <span className="pl-3 pr-1 text-sm font-bold text-body">{prefix}</span>
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          min={type === 'number' ? '0' : undefined}
          step={type === 'number' ? '0.01' : undefined}
          className="min-h-[44px] w-full border-none bg-transparent px-2 py-2 text-sm text-deep-accent outline-none placeholder:text-muted/60"
        />
      </div>
    ) : (
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`min-h-[44px] w-full border bg-white px-3 py-2 text-sm text-deep-accent placeholder:text-muted/60 focus:outline-none ${
          error ? 'border-[#d9534f] focus:border-[#d9534f]' : 'border-hairline focus:border-primary'
        }`}
      />
    )}
    {error && <p className="text-xs text-[#d9534f]">{error}</p>}
  </div>
);

const FormSection = ({ icon: Icon, title, children }) => (
  <div className="mb-6 border-b border-hairline pb-6 last:border-b-0 last:pb-0">
    <div className="mb-4 flex items-center gap-2">
      <Icon className="h-4 w-4 text-primary" strokeWidth={1.75} />
      <h3 className="text-sm font-bold uppercase tracking-wide text-deep-accent">
        {title}
      </h3>
    </div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
  </div>
);

const CheckboxField = ({ name, checked, onChange, error, children }) => (
  <div className="flex flex-col gap-1">
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--primary,#0f766e)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      />
      <span className="text-xs text-body sm:text-sm">{children}</span>
    </label>
    {error && <p className="pl-7 text-xs text-[#d9534f]">{error}</p>}
  </div>
);

const SummaryLine = ({ label, value }) => (
  <div className="flex items-center justify-between py-1.5">
    <span className="text-xs text-muted sm:text-sm">{label}</span>
    <span className="text-sm font-semibold text-deep-accent">{value}</span>
  </div>
);

const DetailRow = ({ label, value, valueColor = 'text-ink' }) => (
  <div className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
    <span className="text-xs text-muted sm:text-sm">{label}</span>
    <span className={`text-sm font-semibold ${valueColor} sm:text-right`}>{value}</span>
  </div>
);

const ModalCloseButton = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label="Close"
    className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-faint hover:text-deep-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
  >
    <X className="h-4 w-4" strokeWidth={2.25} />
  </button>
);

export default Loans;