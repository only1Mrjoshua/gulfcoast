// src/pages/Payments.jsx
import React, { useState } from 'react';
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
        {currentStep === 'overview' && (
          <button
            type="button"
            onClick={handlePayBill}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <Plus className="h-4 w-4" strokeWidth={2.25} />
            Pay a Bill
          </button>
        )}
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
                {mockUpcomingPayments.map((p) => (
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

                    <button
                      type="button"
                      onClick={() => {
                        handlePayBill();
                        const payee = mockPayees.find((pp) => pp.name === p.payee);
                        if (payee) {
                          setFormData((prev) => ({
                            ...prev,
                            payeeId: String(payee.id),
                            amount: String(p.amount),
                          }));
                          setSelectedPayeeId(String(payee.id));
                        }
                      }}
                      className="inline-flex min-h-[36px] items-center gap-1.5 border border-primary bg-white px-4 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:text-sm"
                    >
                      Pay Now
                      <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Saved Payees */}
            <section className="mb-10">
              <div className="mb-4 flex items-center gap-2">
                <Receipt className="h-4 w-4 text-primary" strokeWidth={1.75} />
                <h2 className="font-serif text-lg font-bold text-deep-accent sm:text-xl">
                  Saved Payees
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {mockPayees.map((payee) => (
                  <div
                    key={payee.id}
                    className="flex flex-col gap-2 border border-hairline bg-white p-5"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#e7f3f5] text-primary">
                        <CircleDollarSign className="h-4 w-4" strokeWidth={1.75} />
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold text-deep-accent">
                          {payee.name}
                        </div>
                        <div className="truncate text-xs text-muted">{payee.category}</div>
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-4 border-t border-faint pt-3">
                      <button
                        type="button"
                        onClick={() => {
                          handlePayBill();
                          setFormData((prev) => ({ ...prev, payeeId: String(payee.id) }));
                          setSelectedPayeeId(String(payee.id));
                        }}
                        className="text-xs font-semibold text-primary hover:underline sm:text-sm"
                      >
                        Pay
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-body hover:text-primary hover:underline sm:text-sm"
                      >
                        <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                        Edit
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#d9534f] hover:underline sm:text-sm"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
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
                {mockAutopay.map((a) => (
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
                    </div>

                    <button
                      type="button"
                      className="inline-flex min-h-[36px] items-center gap-1.5 border border-hairline bg-white px-4 py-1.5 text-xs font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:text-sm"
                    >
                      <Settings2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                      Manage
                    </button>
                  </div>
                ))}
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

    </div>
  );
};

// ----- Subcomponents -----

const PaymentForm = ({
  formData,
  onChange,
  onSubmit,
  payees,
  accounts,
  selectedPayeeId,
  onPayeeSelect,
  onCancel,
}) => {
  const fromAccount = accounts.find((a) => a.id === formData.fromAccountId);

  return (
    <form onSubmit={onSubmit} className="border border-hairline bg-faint p-6 sm:p-8">
      <h2 className="mb-6 font-serif text-xl font-bold text-deep-accent sm:text-2xl">
        Pay a Bill
      </h2>

      <div className="mb-5">
        <label className="mb-2 block text-sm font-semibold text-deep-accent">
          Select Payee
        </label>
        <div className="flex flex-wrap gap-2">
          {payees.map((payee) => {
            const isSelected = formData.payeeId === String(payee.id);
            return (
              <button
                key={payee.id}
                type="button"
                onClick={() => onPayeeSelect(String(payee.id))}
                className={`flex min-h-[48px] flex-col justify-center border px-4 py-2 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                  isSelected
                    ? 'border-primary bg-[#e7f3f5]'
                    : 'border-hairline bg-white hover:border-primary'
                }`}
              >
                <span className="text-sm font-semibold text-deep-accent">{payee.name}</span>
                <span className="text-xs text-muted">{payee.category}</span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline sm:text-sm"
        >
          <UserPlus className="h-3.5 w-3.5" strokeWidth={2.25} />
          Add a Payee
        </button>
      </div>

      {formData.payeeId && (
        <>
          <div className="mb-5">
            <label
              htmlFor="fromAccountId"
              className="mb-1.5 block text-sm font-semibold text-deep-accent"
            >
              Pay From
            </label>
            <select
              id="fromAccountId"
              name="fromAccountId"
              value={formData.fromAccountId}
              onChange={onChange}
              className="min-h-[44px] w-full border border-hairline bg-white px-3 py-2 text-sm text-deep-accent focus:border-primary focus:outline-none"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} •••• {acc.lastFour} (Available:{' '}
                  {formatCurrency(acc.available)})
                </option>
              ))}
            </select>
            {fromAccount && (
              <div className="mt-1.5 text-xs text-muted">
                Available: {formatCurrency(fromAccount.available)}
              </div>
            )}
          </div>

          <div className="mb-5">
            <label
              htmlFor="amount"
              className="mb-1.5 block text-sm font-semibold text-deep-accent"
            >
              Amount
            </label>
            <div className="flex items-center border border-hairline bg-white focus-within:border-primary">
              <span className="pl-3 pr-1 text-base font-bold text-body">$</span>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={onChange}
                placeholder="0.00"
                min="0.01"
                step="0.01"
                required
                className="min-h-[44px] w-full border-none bg-transparent px-2 py-2 text-lg font-semibold text-deep-accent outline-none placeholder:text-muted/60"
              />
            </div>
          </div>

          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="date"
                className="mb-1.5 block text-sm font-semibold text-deep-accent"
              >
                Payment Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={onChange}
                required
                className="min-h-[44px] w-full border border-hairline bg-white px-3 py-2 text-sm text-deep-accent focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="frequency"
                className="mb-1.5 block text-sm font-semibold text-deep-accent"
              >
                Frequency
              </label>
              <select
                id="frequency"
                name="frequency"
                value={formData.frequency}
                onChange={onChange}
                className="min-h-[44px] w-full border border-hairline bg-white px-3 py-2 text-sm text-deep-accent focus:border-primary focus:outline-none"
              >
                <option value="One time">One time</option>
                <option value="Weekly">Weekly</option>
                <option value="Every 2 weeks">Every 2 weeks</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
              </select>
            </div>
          </div>

          {formData.frequency !== 'One time' && (
            <div className="mb-5">
              <label
                htmlFor="endDate"
                className="mb-1.5 block text-sm font-semibold text-deep-accent"
              >
                End Date <span className="font-normal text-muted">(optional)</span>
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={onChange}
                className="min-h-[44px] w-full border border-hairline bg-white px-3 py-2 text-sm text-deep-accent focus:border-primary focus:outline-none"
              />
            </div>
          )}

          <div className="mb-6">
            <label
              htmlFor="memo"
              className="mb-1.5 block text-sm font-semibold text-deep-accent"
            >
              Memo <span className="font-normal text-muted">(optional)</span>
            </label>
            <input
              type="text"
              id="memo"
              name="memo"
              value={formData.memo}
              onChange={onChange}
              placeholder="e.g. September payment"
              className="min-h-[44px] w-full border border-hairline bg-white px-3 py-2 text-sm text-deep-accent placeholder:text-muted/70 focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-hairline pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="min-h-[44px] border border-hairline bg-white px-6 py-2.5 text-sm font-semibold text-deep-accent transition-colors hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              Review Payment
              <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
            </button>
          </div>
        </>
      )}
    </form>
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