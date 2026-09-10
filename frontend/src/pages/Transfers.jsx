// src/pages/Transfers.jsx
import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Landmark,
  Repeat,
  Plus,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  CalendarClock,
  Send,
  Phone,
  MessageCircle,
  HelpCircle,
  Building2,
} from 'lucide-react';
import {
  mockTransferAccounts,
  mockScheduledTransfers,
  mockTransferHistory,
} from '../data/mockTransfersData';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Helper to get account by ID
const getAccountById = (id) => {
  return mockTransferAccounts.find((acc) => acc.id === id);
};

// Status color mapping used in history
const statusColor = (status) => {
  const s = status.toLowerCase();
  if (s === 'completed') return 'text-primary';
  if (s === 'failed' || s === 'canceled') return 'text-[#d9534f]';
  return 'text-[#b8860b]'; // scheduled / processing
};

const Transfers = () => {
  // UI state
  const [currentStep, setCurrentStep] = useState('type'); // 'type' | 'form' | 'review' | 'success'
  const [selectedType, setSelectedType] = useState(null); // 'internal' | 'external' | 'recurring'

  // Form state
  const [formData, setFormData] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    frequency: 'One time',
    memo: '',
    isRecurring: false,
  });

  const [confirmationNumber] = useState('TRX-482193');

  // Handlers
  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setCurrentStep('form');
    setFormData({
      fromAccountId: '',
      toAccountId: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      frequency: 'One time',
      memo: '',
      isRecurring: type === 'recurring',
    });
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

  const handleNewTransfer = () => {
    setCurrentStep('type');
    setSelectedType(null);
    setFormData({
      fromAccountId: '',
      toAccountId: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      frequency: 'One time',
      memo: '',
      isRecurring: false,
    });
  };

  const getFromAccount = () => getAccountById(formData.fromAccountId);
  const getToAccount = () => getAccountById(formData.toAccountId);

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Page Header */}
      <div className="mb-8 flex flex-col gap-4 border-b border-hairline pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold leading-tight text-deep-accent sm:text-3xl">
            Transfers
          </h1>
          <p className="mt-1 text-sm text-body sm:text-base">
            Move money securely between your accounts or to another bank.
          </p>
        </div>
        {currentStep !== 'type' && (
          <button
            type="button"
            onClick={handleNewTransfer}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <Plus className="h-4 w-4" strokeWidth={2.25} />
            New Transfer
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="mb-12">
        {currentStep === 'type' && <TransferTypeSelection onSelect={handleTypeSelect} />}

        {currentStep === 'form' && (
          <TransferForm
            formData={formData}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            accounts={mockTransferAccounts}
            selectedType={selectedType}
            onCancel={() => setCurrentStep('type')}
          />
        )}

        {currentStep === 'review' && (
          <TransferReview
            formData={formData}
            fromAccount={getFromAccount()}
            toAccount={getToAccount()}
            onConfirm={handleConfirm}
            onBack={() => setCurrentStep('form')}
          />
        )}

        {currentStep === 'success' && (
          <TransferSuccess
            confirmationNumber={confirmationNumber}
            formData={formData}
            fromAccount={getFromAccount()}
            toAccount={getToAccount()}
            onNewTransfer={handleNewTransfer}
          />
        )}
      </div>

      {/* Security reminder */}
      <div className="mb-10 flex items-start gap-3 border border-hairline bg-faint px-4 py-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
        <p className="text-xs text-body sm:text-sm">
          Transfers are encrypted end-to-end. We will never ask for your password by
          email or phone.
        </p>
      </div>

      {/* Upcoming / Scheduled Transfers */}
      <section className="mb-12 border-t border-hairline pt-8">
        <div className="mb-4 flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-primary" strokeWidth={1.75} />
          <h2 className="font-serif text-lg font-bold text-deep-accent sm:text-xl">
            Upcoming Transfers
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {mockScheduledTransfers.map((t) => (
            <div
              key={t.id}
              className="flex flex-col gap-3 border border-hairline bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-deep-accent">
                  <ArrowLeftRight className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
                  {t.from}
                  <ArrowRight className="h-3 w-3 text-muted" strokeWidth={2} />
                  {t.to}
                </span>
                <span className="text-sm font-semibold text-deep-accent">
                  {formatCurrency(t.amount)}
                </span>
                <span className="text-xs text-body sm:text-sm">{t.date}</span>
                <span className="text-xs text-muted sm:text-sm">{t.frequency}</span>
              </div>

              <div className="flex gap-3 sm:gap-4">
                <button
                  type="button"
                  className="text-xs font-semibold text-primary hover:underline sm:text-sm"
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="text-xs font-semibold text-[#d9534f] hover:underline sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Transfer History */}
      <section className="mb-12 border-t border-hairline pt-8">
        <h2 className="mb-4 font-serif text-lg font-bold text-deep-accent sm:text-xl">
          Transfer History
        </h2>

        <div className="overflow-hidden border border-hairline bg-white">
          {/* Header (desktop) */}
          <div className="hidden grid-cols-[1fr_2fr_1fr_1fr] gap-4 border-b border-hairline bg-faint px-4 py-3 text-xs font-bold uppercase tracking-wide text-deep-accent sm:grid">
            <span>Date</span>
            <span>From → To</span>
            <span className="text-right">Amount</span>
            <span className="text-right">Status</span>
          </div>

          {mockTransferHistory.map((t) => (
            <div
              key={t.id}
              className="grid grid-cols-1 gap-1 border-b border-faint px-4 py-3 last:border-b-0 sm:grid-cols-[1fr_2fr_1fr_1fr] sm:items-center sm:gap-4"
            >
              <span className="text-xs text-muted sm:text-sm">{t.date}</span>
              <span className="flex items-center gap-2 text-sm font-medium text-ink">
                <ArrowLeftRight className="h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={2} />
                {t.from}
                <ArrowRight className="h-3 w-3 text-muted" strokeWidth={2} />
                {t.to}
              </span>
              <span className="text-sm font-semibold text-deep-accent sm:text-right">
                {formatCurrency(t.amount)}
              </span>
              <span
                className={`text-xs font-bold uppercase tracking-wide sm:text-right sm:text-sm sm:normal-case ${statusColor(
                  t.status
                )}`}
              >
                {t.status}
              </span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

// ----- Subcomponents -----

const TransferTypeSelection = ({ onSelect }) => {
  const options = [
    {
      key: 'internal',
      icon: ArrowLeftRight,
      label: 'Between My Accounts',
      desc: 'Move money between your checking and savings accounts.',
    },
    {
      key: 'external',
      icon: Landmark,
      label: 'To Another Bank',
      desc: 'Send money to an external bank account.',
    },
    {
      key: 'recurring',
      icon: Repeat,
      label: 'Recurring Transfer',
      desc: 'Automatically move money on a schedule.',
    },
  ];

  return (
    <div className="border border-hairline bg-faint p-6 sm:p-8">
      <h2 className="mb-6 font-serif text-xl font-bold text-deep-accent sm:text-2xl">
        Choose transfer type
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {options.map(({ key, icon: Icon, label, desc }) => (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            className="group flex flex-col gap-3 border border-hairline bg-white p-5 text-left transition-colors hover:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <span className="flex h-10 w-10 items-center justify-center bg-[#e7f3f5] text-primary">
              <Icon className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <span className="text-sm font-bold text-deep-accent sm:text-base">{label}</span>
            <span className="text-xs text-body sm:text-sm">{desc}</span>
            <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary">
              Continue
              <ChevronRight
                className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
                strokeWidth={2.25}
              />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

const TransferForm = ({ formData, onChange, onSubmit, accounts, selectedType, onCancel }) => {
  const fromAccount = accounts.find((a) => a.id === formData.fromAccountId);

  // Filter "to" accounts: exclude the selected "from" account
  const availableToAccounts = accounts.filter((a) => a.id !== formData.fromAccountId);

  return (
    <form
      onSubmit={onSubmit}
      className="border border-hairline bg-faint p-6 sm:p-8"
    >
      <h2 className="mb-6 font-serif text-xl font-bold text-deep-accent sm:text-2xl">
        New Transfer
      </h2>

      <div className="mb-5">
        <label
          htmlFor="fromAccountId"
          className="mb-1.5 block text-sm font-semibold text-deep-accent"
        >
          From
        </label>
        <select
          id="fromAccountId"
          name="fromAccountId"
          value={formData.fromAccountId}
          onChange={onChange}
          required
          className="min-h-[44px] w-full border border-hairline bg-white px-3 py-2 text-sm text-deep-accent focus:border-primary focus:outline-none"
        >
          <option value="">Select account</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name} •••• {acc.lastFour}{' '}
              {acc.available !== null ? `(Available: ${formatCurrency(acc.available)})` : ''}
            </option>
          ))}
        </select>
        {fromAccount && fromAccount.available !== null && (
          <div className="mt-1.5 text-xs text-muted">
            Available: {formatCurrency(fromAccount.available)}
          </div>
        )}
      </div>

      <div className="mb-5">
        <label
          htmlFor="toAccountId"
          className="mb-1.5 block text-sm font-semibold text-deep-accent"
        >
          To
        </label>
        <select
          id="toAccountId"
          name="toAccountId"
          value={formData.toAccountId}
          onChange={onChange}
          required
          disabled={!formData.fromAccountId}
          className="min-h-[44px] w-full border border-hairline bg-white px-3 py-2 text-sm text-deep-accent focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:bg-faint disabled:text-muted"
        >
          <option value="">Select account</option>
          {availableToAccounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name} •••• {acc.lastFour}
            </option>
          ))}
        </select>
        {selectedType === 'external' && (
          <button
            type="button"
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
            Add External Account
          </button>
        )}
      </div>

      <div className="mb-5">
        <label htmlFor="amount" className="mb-1.5 block text-sm font-semibold text-deep-accent">
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
          <label htmlFor="date" className="mb-1.5 block text-sm font-semibold text-deep-accent">
            Transfer Date
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

        {selectedType === 'recurring' && (
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
            </select>
          </div>
        )}
      </div>

      <div className="mb-6">
        <label htmlFor="memo" className="mb-1.5 block text-sm font-semibold text-deep-accent">
          Memo <span className="font-normal text-muted">(optional)</span>
        </label>
        <input
          type="text"
          id="memo"
          name="memo"
          value={formData.memo}
          onChange={onChange}
          placeholder="e.g. Transfer to savings"
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
          Review Transfer
          <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
        </button>
      </div>
    </form>
  );
};

const TransferReview = ({ formData, fromAccount, toAccount, onConfirm, onBack }) => {
  return (
    <div className="border border-hairline bg-faint p-6 sm:p-8">
      <h2 className="mb-6 font-serif text-xl font-bold text-deep-accent sm:text-2xl">
        Review Transfer
      </h2>

      <div className="mb-6 divide-y divide-hairline border-y border-hairline">
        <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-body">From</span>
          <span className="text-sm font-semibold text-deep-accent sm:text-right">
            {fromAccount ? `${fromAccount.name} •••• ${fromAccount.lastFour}` : '—'}
          </span>
        </div>
        <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-body">To</span>
          <span className="text-sm font-semibold text-deep-accent sm:text-right">
            {toAccount ? `${toAccount.name} •••• ${toAccount.lastFour}` : '—'}
          </span>
        </div>
        <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-body">Amount</span>
          <span className="font-serif text-lg font-bold text-deep-accent sm:text-right">
            {formatCurrency(parseFloat(formData.amount) || 0)}
          </span>
        </div>
        <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-body">Date</span>
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
          Confirm Transfer
        </button>
      </div>
    </div>
  );
};

const TransferSuccess = ({ confirmationNumber, formData, fromAccount, toAccount, onNewTransfer }) => {
  return (
    <div className="border border-hairline bg-faint p-6 text-center sm:p-10">
      <div className="mx-auto flex h-14 w-14 items-center justify-center bg-[#e7f3f5]">
        <CheckCircle2 className="h-8 w-8 text-primary" strokeWidth={1.75} />
      </div>

      <h2 className="mt-4 font-serif text-2xl font-bold text-deep-accent sm:text-3xl">
        Transfer Scheduled
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-body sm:text-base">
        Your {formatCurrency(parseFloat(formData.amount) || 0)} transfer from{' '}
        {fromAccount?.name} to {toAccount?.name} has been scheduled.
      </p>

      <div className="mx-auto mt-6 max-w-md border border-hairline bg-white p-5 text-left">
        <div className="flex items-center justify-between py-1.5">
          <span className="text-xs text-muted sm:text-sm">Transfer Date</span>
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
          View Transfer
        </button>
        <button
          type="button"
          onClick={onNewTransfer}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <Plus className="h-4 w-4" strokeWidth={2.25} />
          Make Another Transfer
        </button>
      </div>
    </div>
  );
};

export default Transfers;