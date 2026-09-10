// src/pages/Payments.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  ArrowRight,
  ArrowLeftRight,
  Wallet,
  Receipt,
  Repeat,
  Pencil,
  Trash2,
  Settings2,
  UserPlus,
  MessageCircle,
  Phone,
  HelpCircle,
  ShieldCheck,
  Send,
  ChevronRight,
  CircleDollarSign,
  Loader2,
  X,
  Power,
} from 'lucide-react';
import {
  mockPayees,
  mockUpcomingPayments,
  mockPaymentHistory,
  mockAutopay,
  paymentOverview,
  paymentAccounts,
} from '../data/mockPaymentsData';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Status color helper (mirrors previous CSS module status classes)
const statusColor = (status) => {
  const s = status.toLowerCase();
  if (s === 'paid' || s === 'completed') return 'text-primary';
  if (s === 'failed' || s === 'canceled') return 'text-[#d9534f]';
  return 'text-[#b8860b]'; // scheduled / processing
};

const Payments = () => {
  // UI state
  const [currentStep, setCurrentStep] = useState('overview'); // 'overview' | 'form' | 'review' | 'success'
  const [selectedPayeeId, setSelectedPayeeId] = useState(null);

  // Quick-pay state for Upcoming Payments
  const [payingId, setPayingId] = useState(null); // id of the payment currently processing
  const [completedPayment, setCompletedPayment] = useState(null); // drives the success popup
  const payTimerRef = useRef(null);
  const dismissTimerRef = useRef(null);

  // Autopay management
  // Map of autopay.id -> boolean (enabled). Defaults to each item's `enabled` field or true.
  const [autopayEnabledMap, setAutopayEnabledMap] = useState(() =>
    Object.fromEntries(mockAutopay.map((a) => [a.id, a.enabled ?? true]))
  );
  const [managingAutopayId, setManagingAutopayId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    fromAccountId: 'chk1',
    payeeId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    frequency: 'One time',
    memo: '',
    isRecurring: false,
    endDate: '',
  });

  const [confirmationNumber] = useState('PAY-729481');

  // Cleanup any pending timers on unmount
  useEffect(() => {
    return () => {
      if (payTimerRef.current) clearTimeout(payTimerRef.current);
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, []);

  // Handlers
  const handlePayBill = () => {
    setCurrentStep('form');
    setSelectedPayeeId(null);
    setFormData({
      fromAccountId: 'chk1',
      payeeId: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      frequency: 'One time',
      memo: '',
      isRecurring: false,
      endDate: '',
    });
  };

  // Quick-pay from Upcoming Payments (only when autopay is OFF)
  const handleQuickPay = (payment) => {
    if (payingId) return; // ignore clicks while another is processing
    setPayingId(payment.id);

    payTimerRef.current = setTimeout(() => {
      setPayingId(null);
      setCompletedPayment(payment);

      // Auto-dismiss the popup
      dismissTimerRef.current = setTimeout(() => {
        setCompletedPayment(null);
      }, 2600);
    }, 1800);
  };

  // Autopay handlers
  const handleOpenManage = (autopayId) => {
    setManagingAutopayId(autopayId);
  };

  const handleSaveAutopay = (autopayId, enabled) => {
    setAutopayEnabledMap((prev) => ({ ...prev, [autopayId]: enabled }));
    setManagingAutopayId(null);
  };

  const handlePayeeSelect = (payeeId) => {
    setSelectedPayeeId(payeeId);
    setFormData((prev) => ({ ...prev, payeeId }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setCurrentStep('review');
  };

  const handleConfirm = () => {
    setCurrentStep('success');
  };

  const handleNewPayment = () => {
    setCurrentStep('overview');
    setSelectedPayeeId(null);
    setFormData({
      fromAccountId: 'chk1',
      payeeId: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      frequency: 'One time',
      memo: '',
      isRecurring: false,
      endDate: '',
    });
  };

  const getPayee = (id) => mockPayees.find((p) => p.id === parseInt(id));
  const getFromAccount = () => paymentAccounts.find((a) => a.id === formData.fromAccountId);
  const selectedPayee = getPayee(formData.payeeId);
  const managingAutopay = mockAutopay.find((a) => a.id === managingAutopayId);

  const overviewCards = [
    {
      label: 'Due Soon',
      value: paymentOverview.dueSoon,
      sub: 'Bills due within 7 days',
      icon: Clock,
    },
    {
      label: 'Scheduled',
      value: paymentOverview.scheduled,
      sub: 'Upcoming payments scheduled',
      icon: Calendar,
    },
    {
      label: 'Paid This Month',
      value: paymentOverview.paidThisMonth,
      sub: 'Total payments completed',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Page Header */}
      <div className="mb-8 flex flex-col gap-4 border-b border-hairline pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold leading-tight text-deep-accent sm:text-3xl">
            Payments
          </h1>
          <p className="mt-1 text-sm text-body sm:text-base">
            Pay your bills, manage scheduled payments, and keep track of your payment activity.
          </p>
        </div>
      </div>

      {/* Payment Overview */}
      {currentStep === 'overview' && (
        <section className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {overviewCards.map(({ label, value, sub, icon: Icon }) => (
            <div key={label} className="border border-hairline bg-faint p-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted sm:text-xs">
                  {label}
                </span>
                <Icon className="h-4 w-4 text-primary" strokeWidth={1.75} />
              </div>
              <div className="mt-2 font-serif text-2xl font-bold text-deep-accent sm:text-3xl">
                {formatCurrency(value)}
              </div>
              <div className="mt-1 text-xs text-body">{sub}</div>
            </div>
          ))}
        </section>
      )}

      {/* Main Content */}
      <div className="mb-12">
        {currentStep === 'overview' && (
          <>
            {/* Upcoming Payments */}
            <section className="mb-10">
              <div className="mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" strokeWidth={1.75} />
                <h2 className="font-serif text-lg font-bold text-deep-accent sm:text-xl">
                  Upcoming Payments
                </h2>
              </div>

              <div className="flex flex-col gap-3">
                {mockUpcomingPayments.map((p) => {
                  const isPaying = payingId === p.id;
                  const isAnyPaying = payingId !== null;
                  const showPayNow = !p.autopay;

                  return (
                    <div
                      key={p.id}
                      className="flex flex-col gap-3 border border-hairline bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
                        <span className="text-sm font-semibold text-deep-accent">{p.payee}</span>
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted sm:text-sm">
                          <Calendar className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
                          Due {p.dueDate}
                        </span>
                        <span className="text-sm font-semibold text-deep-accent">
                          {formatCurrency(p.amount)}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide ${
                            p.autopay ? 'text-primary' : 'text-[#d9534f]'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 ${
                              p.autopay ? 'bg-primary' : 'bg-[#d9534f]'
                            }`}
                            aria-hidden="true"
                          />
                          {p.autopay ? 'Autopay ON' : 'Autopay OFF'}
                        </span>
                      </div>

                      {showPayNow && (
                        <button
                          type="button"
                          onClick={() => handleQuickPay(p)}
                          disabled={isAnyPaying}
                          className="inline-flex min-h-[36px] items-center justify-center gap-1.5 border border-primary bg-white px-4 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:border-hairline disabled:bg-faint disabled:text-muted sm:text-sm"
                        >
                          {isPaying ? (
                            <>
                              <Loader2
                                className="h-3.5 w-3.5 animate-spin"
                                strokeWidth={2.25}
                              />
                              Processing…
                            </>
                          ) : (
                            <>
                              Pay Now
                              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Automatic Payments */}
            <section className="mb-10">
              <div className="mb-4 flex items-center gap-2">
                <Repeat className="h-4 w-4 text-primary" strokeWidth={1.75} />
                <h2 className="font-serif text-lg font-bold text-deep-accent sm:text-xl">
                  Automatic Payments
                </h2>
              </div>

              <div className="flex flex-col gap-3">
                {mockAutopay.map((a) => {
                  const isEnabled = autopayEnabledMap[a.id] ?? true;

                  return (
                    <div
                      key={a.id}
                      className="flex flex-col gap-3 border border-hairline bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
                        <span className="text-sm font-semibold text-deep-accent">{a.payee}</span>
                        <span className="inline-flex items-center gap-1.5 text-xs text-body sm:text-sm">
                          <Repeat className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
                          {a.frequency}
                        </span>
                        <span className="text-sm font-semibold text-deep-accent">
                          {formatCurrency(a.nextAmount)}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted sm:text-sm">
                          <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />
                          Next: {a.nextDate}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide ${
                            isEnabled ? 'text-primary' : 'text-[#d9534f]'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 ${
                              isEnabled ? 'bg-primary' : 'bg-[#d9534f]'
                            }`}
                            aria-hidden="true"
                          />
                          {isEnabled ? 'Autopay ON' : 'Autopay OFF'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenManage(a.id)}
                        className="inline-flex min-h-[36px] items-center gap-1.5 border border-hairline bg-white px-4 py-1.5 text-xs font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:text-sm"
                      >
                        <Settings2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                        Manage
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Payment History */}
            <section className="mb-10">
              <div className="mb-4 flex items-center gap-2">
                <Receipt className="h-4 w-4 text-primary" strokeWidth={1.75} />
                <h2 className="font-serif text-lg font-bold text-deep-accent sm:text-xl">
                  Payment History
                </h2>
              </div>

              <div className="overflow-hidden border border-hairline bg-white">
                {/* Header (desktop only) */}
                <div className="hidden grid-cols-[1fr_1.5fr_1.5fr_1fr_1fr] gap-4 border-b border-hairline bg-faint px-4 py-3 text-xs font-bold uppercase tracking-wide text-deep-accent md:grid">
                  <span>Date</span>
                  <span>Payee</span>
                  <span>Account</span>
                  <span className="text-right">Amount</span>
                  <span className="text-right">Status</span>
                </div>

                {mockPaymentHistory.map((p) => (
                  <div
                    key={p.id}
                    className="grid grid-cols-1 gap-1 border-b border-faint px-4 py-3 last:border-b-0 md:grid-cols-[1fr_1.5fr_1.5fr_1fr_1fr] md:items-center md:gap-4"
                  >
                    <span className="text-xs text-muted sm:text-sm">{p.date}</span>
                    <span className="text-sm font-medium text-ink">{p.payee}</span>
                    <span className="text-xs text-body sm:text-sm">{p.account}</span>
                    <span className="text-sm font-semibold text-deep-accent md:text-right">
                      {formatCurrency(p.amount)}
                    </span>
                    <span
                      className={`text-xs font-bold uppercase tracking-wide md:text-right md:text-sm md:normal-case ${statusColor(
                        p.status
                      )}`}
                    >
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {currentStep === 'form' && (
          <PaymentForm
            formData={formData}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            payees={mockPayees}
            accounts={paymentAccounts}
            selectedPayeeId={selectedPayeeId}
            onPayeeSelect={handlePayeeSelect}
            onCancel={() => setCurrentStep('overview')}
          />
        )}

        {currentStep === 'review' && (
          <PaymentReview
            formData={formData}
            payee={selectedPayee}
            fromAccount={getFromAccount()}
            onConfirm={handleConfirm}
            onBack={() => setCurrentStep('form')}
          />
        )}

        {currentStep === 'success' && (
          <PaymentSuccess
            confirmationNumber={confirmationNumber}
            formData={formData}
            payee={selectedPayee}
            fromAccount={getFromAccount()}
            onNewPayment={handleNewPayment}
          />
        )}
      </div>

      {/* Security notice */}
      <div className="mb-10 flex items-start gap-3 border border-hairline bg-faint px-4 py-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
        <p className="text-xs text-body sm:text-sm">
          Payments are secured with bank-grade encryption. We never share your payee
          information with third parties.
        </p>
      </div>

      {/* Quick-pay success popup */}
      {completedPayment && (
        <QuickPaySuccessPopup
          payment={completedPayment}
          onClose={() => setCompletedPayment(null)}
        />
      )}

      {/* Manage Autopay popup */}
      {managingAutopay && (
        <ManageAutopayModal
          item={managingAutopay}
          initialEnabled={autopayEnabledMap[managingAutopay.id] ?? true}
          onSave={(enabled) => handleSaveAutopay(managingAutopay.id, enabled)}
          onClose={() => setManagingAutopayId(null)}
        />
      )}
    </div>
  );
};

// ----- Subcomponents -----

// Popup shown after a quick "Pay Now" payment completes. Auto-dismisses.
const QuickPaySuccessPopup = ({ payment, onClose }) => {
  // Lock body scroll + close on Escape while visible
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="quickpay-title"
        className="w-full max-w-sm border border-hairline bg-white p-6 text-center shadow-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center bg-[#e7f3f5]">
          <CheckCircle2 className="h-8 w-8 text-primary" strokeWidth={1.75} />
        </div>

        <h2
          id="quickpay-title"
          className="mt-4 font-serif text-xl font-bold text-deep-accent sm:text-2xl"
        >
          Payment Completed
        </h2>
        <p className="mt-2 text-sm text-body">
          Your {formatCurrency(payment.amount)} payment to{' '}
          <span className="font-semibold text-deep-accent">{payment.payee}</span> was
          successful.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 inline-flex min-h-[40px] w-full items-center justify-center bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          Done
        </button>
      </div>
    </div>
  );
};

// Modal that lets the user toggle autopay on/off for a single automatic payment.
const ManageAutopayModal = ({ item, initialEnabled, onSave, onClose }) => {
  const [enabled, setEnabled] = useState(initialEnabled);

  // Lock body scroll + close on Escape while open
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const handleSave = () => onSave(enabled);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="manage-autopay-title"
        className="w-full max-w-md border border-hairline bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-hairline px-5 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Repeat className="h-4 w-4 text-primary" strokeWidth={2} />
              <span className="text-[11px] font-bold uppercase tracking-wide text-muted">
                Automatic Payment
              </span>
            </div>
            <h3
              id="manage-autopay-title"
              className="mt-1 truncate font-serif text-lg font-bold text-deep-accent"
            >
              {item.payee}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close autopay settings"
            className="flex h-9 w-9 shrink-0 items-center justify-center border border-hairline text-body transition-colors hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5">
          {/* Current schedule summary */}
          <div className="mb-5 border border-hairline bg-faint px-4 py-3">
            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-muted sm:text-sm">Frequency</span>
              <span className="text-sm font-semibold text-deep-accent">
                {item.frequency}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-muted sm:text-sm">Next payment</span>
              <span className="text-sm font-semibold text-deep-accent">
                {formatCurrency(item.nextAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-muted sm:text-sm">Scheduled for</span>
              <span className="text-sm font-semibold text-deep-accent">
                {item.nextDate}
              </span>
            </div>
          </div>

          {/* Toggle row */}
          <div className="flex items-center justify-between gap-4 border border-hairline bg-white px-4 py-4">
            <div className="flex min-w-0 items-start gap-3">
              <Power
                className={`mt-0.5 h-4 w-4 shrink-0 ${
                  enabled ? 'text-primary' : 'text-muted'
                }`}
                strokeWidth={2}
              />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-deep-accent">
                  {enabled ? 'Autopay is ON' : 'Autopay is OFF'}
                </div>
                <div className="mt-0.5 text-xs text-body">
                  {enabled
                    ? 'Payments will be made automatically on the scheduled date.'
                    : 'You’ll need to pay this bill manually before the due date.'}
                </div>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              aria-label="Toggle autopay"
              onClick={() => setEnabled((v) => !v)}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                enabled ? 'bg-primary' : 'bg-[#d1d5db]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform bg-white transition-transform ${
                  enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-2 border-t border-hairline px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] border border-hairline bg-white px-5 py-2.5 text-sm font-semibold text-deep-accent transition-colors hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <CheckCircle2 className="h-4 w-4" strokeWidth={2.25} />
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const PaymentReview = ({ formData, payee, fromAccount, onConfirm, onBack }) => {
  return (
    <div className="border border-hairline bg-faint p-6 sm:p-8">
      <h2 className="mb-6 font-serif text-xl font-bold text-deep-accent sm:text-2xl">
        Review Payment
      </h2>

      <div className="mb-6 divide-y divide-hairline border-y border-hairline">
        <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-body">Pay From</span>
          <span className="text-sm font-semibold text-deep-accent sm:text-right">
            {fromAccount ? `${fromAccount.name} •••• ${fromAccount.lastFour}` : '—'}
          </span>
        </div>
        <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-body">Payee</span>
          <span className="text-sm font-semibold text-deep-accent sm:text-right">
            {payee ? payee.name : '—'}
          </span>
        </div>
        <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-body">Amount</span>
          <span className="font-serif text-lg font-bold text-deep-accent sm:text-right">
            {formatCurrency(parseFloat(formData.amount) || 0)}
          </span>
        </div>
        <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-body">Payment Date</span>
          <span className="text-sm font-semibold text-deep-accent sm:text-right">
            {formData.date}
          </span>
        </div>
        <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-body">Frequency</span>
          <span className="text-sm font-semibold text-deep-accent sm:text-right">
            {formData.frequency}
          </span>
        </div>
        {formData.memo && (
          <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-body">Memo</span>
            <span className="text-sm font-semibold text-deep-accent sm:text-right">
              {formData.memo}
            </span>
          </div>
        )}
        <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-body">Processing / Delivery</span>
          <span className="text-sm font-semibold text-deep-accent sm:text-right">
            {formData.date}
          </span>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-hairline pt-6 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] border border-hairline bg-white px-6 py-2.5 text-sm font-semibold text-deep-accent transition-colors hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <Send className="h-4 w-4" strokeWidth={2.25} />
          Confirm Payment
        </button>
      </div>
    </div>
  );
};

const PaymentSuccess = ({ confirmationNumber, formData, payee, onNewPayment }) => {
  return (
    <div className="border border-hairline bg-faint p-6 text-center sm:p-10">
      <div className="mx-auto flex h-14 w-14 items-center justify-center bg-[#e7f3f5]">
        <CheckCircle2 className="h-8 w-8 text-primary" strokeWidth={1.75} />
      </div>

      <h2 className="mt-4 font-serif text-2xl font-bold text-deep-accent sm:text-3xl">
        Payment Scheduled
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-body sm:text-base">
        Your {formatCurrency(parseFloat(formData.amount) || 0)} payment to {payee?.name} has
        been scheduled.
      </p>

      <div className="mx-auto mt-6 max-w-md border border-hairline bg-white p-5 text-left">
        <div className="flex items-center justify-between py-1.5">
          <span className="text-xs text-muted sm:text-sm">Payment Date</span>
          <span className="text-sm font-semibold text-deep-accent">{formData.date}</span>
        </div>
        <div className="flex items-center justify-between py-1.5">
          <span className="text-xs text-muted sm:text-sm">Confirmation Number</span>
          <span className="text-sm font-semibold text-deep-accent">{confirmationNumber}</span>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          className="inline-flex min-h-[44px] items-center justify-center gap-2 border border-primary bg-white px-6 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          View Payment
          <ChevronRight className="h-4 w-4" strokeWidth={2.25} />
        </button>
        <button
          type="button"
          onClick={onNewPayment}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <Plus className="h-4 w-4" strokeWidth={2.25} />
          Make Another Payment
        </button>
      </div>
    </div>
  );
};

export default Payments;