// src/pages/Loans.jsx
import React, { useState } from 'react';
import {
  Plus,
  Landmark,
  CreditCard,
  Home,
  Car,
  GraduationCap,
  PiggyBank,
  Briefcase,
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  CheckCircle2,
  X,
  Info,
  FileText,
  Download,
  Eye,
  Calendar,
  TrendingDown,
  Wallet,
  ShieldCheck,
  Bell,
} from 'lucide-react';
import {
  mockLoans,
  mockLoanPayments,
  mockLoanDocuments,
  mockLoanAlerts,
  exploreLoanOptions,
} from '../data/mockLoansData';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatDateLong = (dateStr) => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Map explore-loan option to a Lucide icon without touching mock data
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
  // State
  const [selectedLoanId, setSelectedLoanId] = useState(mockLoans[0]?.id || null);
  const [showPayment, setShowPayment] = useState(false);
  const [showPayoff, setShowPayoff] = useState(false);
  const [showAutopay, setShowAutopay] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [additionalPrincipal, setAdditionalPrincipal] = useState('');
  const [paymentFrom, setPaymentFrom] = useState('chk1');
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const selectedLoan = mockLoans.find((l) => l.id === selectedLoanId);
  const loanPayments = mockLoanPayments.filter((p) => p.loanId === selectedLoanId);
  const loanDocuments = mockLoanDocuments.filter(
    (d) => d.loanId === selectedLoanId
  );

  // Totals
  const totalBalance = mockLoans.reduce(
    (sum, loan) => sum + loan.currentBalance,
    0
  );
  const nextPayment = mockLoans
    .filter((l) => l.status === 'Active')
    .sort((a, b) => new Date(a.nextPaymentDate) - new Date(b.nextPaymentDate))[0];

  // Handlers
  const handleMakePayment = () => setShowPayment(true);

  const closePayment = () => {
    setShowPayment(false);
    setPaymentAmount('');
    setAdditionalPrincipal('');
  };

  const handleSubmitPayment = () => {
    const total =
      parseFloat(paymentAmount) + parseFloat(additionalPrincipal || 0);
    alert(`Payment of ${formatCurrency(total)} submitted for ${selectedLoan?.name}`);
    closePayment();
  };

  const handleManageAutopay = () => setShowAutopay(true);
  const closeAutopay = () => setShowAutopay(false);

  const toggleAutopay = () => {
    alert(
      `Autopay ${selectedLoan?.autopayEnabled ? 'disabled' : 'enabled'} for ${
        selectedLoan?.name
      }`
    );
    closeAutopay();
  };

  const handlePayoff = () => setShowPayoff(true);
  const closePayoff = () => setShowPayoff(false);

  const handleDocumentAction = (doc, action) => {
    alert(`${action} ${doc.name}`);
  };

  const toggleAlert = (alertId) => {
    alert(`Toggling alert ${alertId}`);
  };

  const getRepaymentProgress = (loan) => {
    const paid = loan.amountPaidToDate;
    const total = loan.originalAmount;
    return Math.min((paid / total) * 100, 100);
  };

  // Overview cards
  const overviewCards = [
    {
      label: 'Total Loan Balance',
      value: formatCurrency(totalBalance),
      icon: Landmark,
    },
    {
      label: 'Next Payment',
      value: nextPayment ? formatCurrency(nextPayment.monthlyPayment) : 'N/A',
      icon: TrendingDown,
    },
    {
      label: 'Due',
      value: nextPayment ? formatDate(nextPayment.nextPaymentDate) : 'N/A',
      icon: Calendar,
    },
    {
      label: 'Active Loans',
      value: mockLoans.filter((l) => l.status === 'Active').length,
      icon: CheckCircle2,
    },
  ];

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
            onClick={handleMakePayment}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <Plus className="h-4 w-4" strokeWidth={2.25} />
            Make a Payment
          </button>
          <button
            type="button"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 border border-primary bg-white px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Explore Loan Options
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockLoans.map((loan) => {
            const isSelected = selectedLoanId === loan.id;
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
      </section>

      {/* Selected Loan Details */}
      {selectedLoan && (
        <section className="mb-10 border-t border-hairline pt-8">
          <h2 className="mb-4 font-serif text-lg font-bold text-deep-accent sm:text-xl">
            Loan Details
          </h2>

          <div className="border border-hairline bg-faint p-5 sm:p-6">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 border-b border-hairline pb-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 items-start gap-3">
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

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleMakePayment}
                  className="inline-flex min-h-[36px] items-center gap-1.5 bg-primary px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 sm:text-sm"
                >
                  <Wallet className="h-3.5 w-3.5" strokeWidth={2} />
                  Make Payment
                </button>
                <button
                  type="button"
                  onClick={handleManageAutopay}
                  className="inline-flex min-h-[36px] items-center gap-1.5 border border-hairline bg-white px-4 py-1.5 text-xs font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:text-sm"
                >
                  <Calendar className="h-3.5 w-3.5" strokeWidth={2} />
                  Manage Autopay
                </button>
                <button
                  type="button"
                  onClick={handlePayoff}
                  className="inline-flex min-h-[36px] items-center gap-1.5 border border-hairline bg-white px-4 py-1.5 text-xs font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:text-sm"
                >
                  <Info className="h-3.5 w-3.5" strokeWidth={2} />
                  Payoff Information
                </button>
              </div>
            </div>

            {/* Detail content */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Info panel */}
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
                  value={formatDateLong(selectedLoan.maturityDate)}
                />
                <DetailRow
                  label="Amount Paid"
                  value={formatCurrency(selectedLoan.amountPaidToDate)}
                />
                <DetailRow
                  label="Payment Method"
                  value={selectedLoan.paymentMethod}
                />
                <DetailRow
                  label="Status"
                  value={selectedLoan.status}
                  valueColor="text-primary"
                />

                {/* Progress */}
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

              {/* Payment History */}
              <div className="flex flex-col">
                <h3 className="mb-3 font-serif text-base font-bold text-deep-accent sm:text-lg">
                  Payment History
                </h3>

                <div className="flex flex-col border-t border-hairline">
                  {loanPayments.length === 0 ? (
                    <p className="py-4 text-sm text-muted">
                      No payment history available.
                    </p>
                  ) : (
                    loanPayments.slice(0, 5).map((payment) => (
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

                {loanPayments.length > 5 && (
                  <button
                    type="button"
                    className="mt-3 inline-flex items-center gap-1 self-start text-sm font-semibold text-primary hover:underline"
                  >
                    View Payment History
                    <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.25} />
                  </button>
                )}
              </div>
            </div>

            {/* Documents */}
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
          {mockLoanAlerts.map((alert) => (
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

      {/* Explore Loan Options */}
      <section className="mb-4 border-t border-hairline pt-8">
        <h2 className="mb-4 font-serif text-lg font-bold text-deep-accent sm:text-xl">
          Explore Loan Options
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {exploreLoanOptions.map((option) => {
            const Icon = getExploreIcon(option);
            return (
              <div
                key={option.id}
                className="flex flex-col border border-hairline bg-white p-5"
              >
                <span className="flex h-10 w-10 items-center justify-center bg-[#e7f3f5] text-primary">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <span className="mt-3 text-sm font-bold text-deep-accent sm:text-base">
                  {option.name}
                </span>
                <span className="mt-1 text-xs text-body sm:text-sm">
                  {option.description}
                </span>
                <button
                  type="button"
                  className="mt-4 inline-flex min-h-[36px] items-center justify-center gap-1.5 border border-primary bg-white px-4 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:text-sm"
                >
                  Learn More
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Payment Modal */}
      {showPayment && selectedLoan && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4"
          onClick={closePayment}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-[550px] overflow-y-auto border border-hairline bg-white p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <ModalCloseButton onClick={closePayment} />

            <h2 className="font-serif text-xl font-bold text-deep-accent sm:text-2xl">
              Make a Payment
            </h2>
            <p className="mt-1 text-sm text-body">Pay your {selectedLoan.name}</p>

            <div className="mt-6 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="paymentFrom"
                  className="text-sm font-semibold text-deep-accent"
                >
                  Pay From
                </label>
                <select
                  id="paymentFrom"
                  value={paymentFrom}
                  onChange={(e) => setPaymentFrom(e.target.value)}
                  className="min-h-[40px] w-full border border-hairline bg-white px-3 py-2 text-sm text-deep-accent focus:border-primary focus:outline-none"
                >
                  <option value="chk1">Checking •••• 4821</option>
                  <option value="sav1">Savings •••• 9134</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="paymentAmount"
                  className="text-sm font-semibold text-deep-accent"
                >
                  Payment Amount
                </label>
                <div className="flex items-center border border-hairline bg-white focus-within:border-primary">
                  <span className="pl-3 pr-1 text-base font-bold text-body">$</span>
                  <input
                    type="number"
                    id="paymentAmount"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    className="min-h-[42px] w-full border-none bg-transparent px-2 py-2 text-lg font-semibold text-deep-accent outline-none placeholder:text-muted/60"
                  />
                </div>
                <p className="text-xs text-muted">
                  Minimum: {formatCurrency(selectedLoan.monthlyPayment)}
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="additionalPrincipal"
                  className="text-sm font-semibold text-deep-accent"
                >
                  Additional Principal{' '}
                  <span className="font-normal text-muted">(optional)</span>
                </label>
                <div className="flex items-center border border-hairline bg-white focus-within:border-primary">
                  <span className="pl-3 pr-1 text-base font-bold text-body">$</span>
                  <input
                    type="number"
                    id="additionalPrincipal"
                    value={additionalPrincipal}
                    onChange={(e) => setAdditionalPrincipal(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="min-h-[42px] w-full border-none bg-transparent px-2 py-2 text-lg font-semibold text-deep-accent outline-none placeholder:text-muted/60"
                  />
                </div>
                <p className="text-xs text-muted">
                  Additional principal reduces your loan balance faster.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="paymentDate"
                  className="text-sm font-semibold text-deep-accent"
                >
                  Payment Date
                </label>
                <input
                  type="date"
                  id="paymentDate"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="min-h-[40px] w-full border border-hairline bg-white px-3 py-2 text-sm text-deep-accent focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-hairline pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closePayment}
                  className="min-h-[40px] border border-hairline bg-white px-5 py-2 text-sm font-semibold text-deep-accent transition-colors hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitPayment}
                  className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  <Wallet className="h-4 w-4" strokeWidth={2.25} />
                  Review Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Autopay Modal */}
      {showAutopay && selectedLoan && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4"
          onClick={closeAutopay}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-[550px] overflow-y-auto border border-hairline bg-white p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <ModalCloseButton onClick={closeAutopay} />

            <h2 className="font-serif text-xl font-bold text-deep-accent sm:text-2xl">
              Manage Autopay
            </h2>
            <p className="mt-1 text-sm text-body">
              Automatic payments for {selectedLoan.name}
            </p>

            <div className="mt-6 flex flex-col divide-y divide-faint">
              <div className="flex items-center justify-between py-2.5">
                <span className="text-sm text-muted">Current Status</span>
                <span
                  className={`inline-flex items-center gap-1.5 text-sm font-semibold ${
                    selectedLoan.autopayEnabled ? 'text-primary' : 'text-[#d9534f]'
                  }`}
                >
                  {selectedLoan.autopayEnabled ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
                      Enabled
                    </>
                  ) : (
                    'Disabled'
                  )}
                </span>
              </div>

              {selectedLoan.autopayEnabled && (
                <>
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-sm text-muted">Payment Account</span>
                    <span className="text-sm font-semibold text-ink">
                      {selectedLoan.autopayAccount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-sm text-muted">Payment Amount</span>
                    <span className="text-sm font-semibold text-ink">
                      {formatCurrency(selectedLoan.monthlyPayment)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-sm text-muted">Next Payment</span>
                    <span className="text-sm font-semibold text-ink">
                      {formatDateLong(selectedLoan.nextPaymentDate)}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-hairline pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeAutopay}
                className="min-h-[40px] border border-hairline bg-white px-5 py-2 text-sm font-semibold text-deep-accent transition-colors hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={toggleAutopay}
                className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <Calendar className="h-4 w-4" strokeWidth={2.25} />
                {selectedLoan.autopayEnabled ? 'Disable Autopay' : 'Enable Autopay'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payoff Modal */}
      {showPayoff && selectedLoan && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4"
          onClick={closePayoff}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-[550px] overflow-y-auto border border-hairline bg-white p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <ModalCloseButton onClick={closePayoff} />

            <h2 className="font-serif text-xl font-bold text-deep-accent sm:text-2xl">
              Payoff Information
            </h2>
            <p className="mt-1 text-sm text-body">
              Payoff details for {selectedLoan.name}
            </p>

            <div className="mt-6 flex flex-col divide-y divide-faint">
              <div className="flex items-center justify-between py-2.5">
                <span className="text-sm text-muted">Current Balance</span>
                <span className="text-sm font-semibold text-ink">
                  {formatCurrency(selectedLoan.currentBalance)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-sm text-muted">Estimated Payoff Amount</span>
                <span className="font-serif text-base font-bold text-deep-accent">
                  {formatCurrency(selectedLoan.currentBalance * 1.0025)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-sm text-muted">Payoff Date</span>
                <span className="text-sm font-semibold text-ink">
                  {formatDateLong(new Date().toISOString().split('T')[0])}
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-3 border border-hairline bg-faint px-4 py-3">
              <Info
                className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                strokeWidth={1.75}
              />
              <span className="text-xs text-body sm:text-sm">
                The estimated payoff amount includes accrued interest. Actual payoff
                amount may vary. A formal payoff quote can be requested for accurate
                figures.
              </span>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-hairline pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closePayoff}
                className="min-h-[40px] border border-hairline bg-white px-5 py-2 text-sm font-semibold text-deep-accent transition-colors hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                Close
              </button>
              <button
                type="button"
                className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <FileText className="h-4 w-4" strokeWidth={2.25} />
                Request Payoff Quote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable detail row
const DetailRow = ({ label, value, valueColor = 'text-ink' }) => (
  <div className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
    <span className="text-xs text-muted sm:text-sm">{label}</span>
    <span className={`text-sm font-semibold ${valueColor} sm:text-right`}>{value}</span>
  </div>
);

// Reusable modal close button
const ModalCloseButton = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label="Close"
    className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-faint hover:text-deep-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
  >
    <X className="h-4 w-4" strokeWidth={2.25} />
  </button>
);

export default Loans;