// src/pages/Transfers.jsx
import React, { useState, useEffect } from 'react';
import {
  ArrowLeftRight,
  Landmark,
  Repeat,
  Zap,
  Plus,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  CalendarClock,
  Send,
  Info,
  Clock,
  Building2,
  User,
  X,
  Download,
  Copy,
  Check,
  Hash,
  FileText,
} from 'lucide-react';
import {
  mockTransferAccounts,
  mockScheduledTransfers,
  mockTransferHistory,
  mockTransferMonths,
  ACCOUNT_HOLDER_NAME,
} from '../data/mockTransfersData';

const WIRE_FEE = 25;

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

const getAccountById = (id) => mockTransferAccounts.find((acc) => acc.id === id);

const statusColor = (status) => {
  const s = status.toLowerCase();
  if (s === 'completed') return 'text-primary';
  if (s === 'failed' || s === 'canceled') return 'text-[#d9534f]';
  return 'text-[#b8860b]';
};

const getProcessingLabel = (type) => {
  if (type === 'wire') return 'Same business day';
  if (type === 'external') return '1–3 business days';
  return 'Immediately';
};

const getArrivalText = (type, dateStr) => {
  if (type === 'wire') return 'Same business day (if submitted before 4 PM ET)';
  if (type === 'external') return '1–3 business days';
  if (type === 'recurring') return 'On the scheduled date';
  return 'Immediately';
};

const formatExternalRecipient = (formData) => {
  const last4 = (formData.recipientAccountNumber || '').slice(-4) || '••••';
  const type = formData.recipientAccountType === 'savings' ? 'Savings' : 'Checking';
  const name = formData.recipientName || '—';
  return `${name} · ${formData.recipientBankName || '—'} •••• ${last4} (${type})`;
};

// ---- History helpers -------------------------------------------------

const TRANSFER_TYPE_META = {
  internal: { label: 'Internal', icon: ArrowLeftRight },
  external: { label: 'ACH', icon: Landmark },
  wire: { label: 'Wire', icon: Zap },
  recurring: { label: 'Recurring', icon: Repeat },
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const formatMonthLabel = (monthKey) => {
  const [year, month] = monthKey.split('-').map(Number);
  return `${MONTH_NAMES[month - 1]} ${year}`;
};

const formatHistoryDate = (dateStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const isExternalRecipient = (type) => type === 'external' || type === 'wire';

// Build the plain-text receipt that gets downloaded
const buildReceiptText = (t) => {
  const meta = TRANSFER_TYPE_META[t.type] || TRANSFER_TYPE_META.internal;
  const line = '========================================';
  const divider = '----------------------------------------';

  const rows = [
    line,
    '           TRANSFER RECEIPT',
    line,
    '',
    `Transaction Number : ${t.transactionNumber}`,
    `Date               : ${formatHistoryDate(t.date)}`,
    `Time               : ${t.time}`,
    `Status             : ${t.status}`,
    `Transfer Type      : ${meta.label}`,
    '',
    divider,
    'SENDER',
    divider,
    `Name               : ${t.senderName || ACCOUNT_HOLDER_NAME}`,
    `Account            : ${t.from} •••• ${t.fromLastFour}`,
    '',
    divider,
    'RECIPIENT',
    divider,
    `Name               : ${t.recipientName || t.to}`,
    `Account            : ${t.to} •••• ${t.toLastFour}`,
    '',
    divider,
    'DETAILS',
    divider,
    `Amount             : ${formatCurrency(t.amount)}`,
  ];

  if (t.type === 'wire') {
    rows.push(`Wire Fee           : ${formatCurrency(WIRE_FEE)}`);
    rows.push(`Total Debited      : ${formatCurrency(t.amount + WIRE_FEE)}`);
  }

  if (t.memo) {
    rows.push(`Memo               : ${t.memo}`);
  }

  rows.push('', line);
  rows.push('   Thank you for banking with us.');
  rows.push('   This receipt is for your records only.');
  rows.push(line);

  return rows.join('\n');
};

const downloadReceipt = (t) => {
  const text = buildReceiptText(t);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `receipt-${t.transactionNumber}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const Transfers = () => {
  const [currentStep, setCurrentStep] = useState('type');
  const [selectedType, setSelectedType] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(mockTransferMonths[0]);
  const [selectedTransfer, setSelectedTransfer] = useState(null);

  const [formData, setFormData] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    frequency: 'One time',
    memo: '',
    isRecurring: false,
    recipientName: '',
    recipientBankName: '',
    recipientRoutingNumber: '',
    recipientAccountNumber: '',
    recipientAccountType: 'checking',
    recipientBankAddress: '',
    verificationMethod: 'instant',
  });

  const [confirmationNumber] = useState('TRX-482193');

  const resetForm = (type) => ({
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    frequency: 'One time',
    memo: '',
    isRecurring: type === 'recurring',
    recipientName: '',
    recipientBankName: '',
    recipientRoutingNumber: '',
    recipientAccountNumber: '',
    recipientAccountType: 'checking',
    recipientBankAddress: '',
    verificationMethod: 'instant',
  });

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setCurrentStep('form');
    setFormData(resetForm(type));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setCurrentStep('review');
  };

  const handleConfirm = () => setCurrentStep('success');

  const handleNewTransfer = () => {
    setCurrentStep('type');
    setSelectedType(null);
    setFormData(resetForm(null));
  };

  const getFromAccount = () => getAccountById(formData.fromAccountId);
  const getToAccount = () => getAccountById(formData.toAccountId);

  const amountValue = parseFloat(formData.amount) || 0;
  const isWire = selectedType === 'wire';

  const monthTransfers = mockTransferHistory.filter((t) =>
    t.date.startsWith(selectedMonth)
  );
  const monthTotal = monthTransfers.reduce((sum, t) => sum + t.amount, 0);

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
            selectedType={selectedType}
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
            selectedType={selectedType}
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

      {/* Transfer History */}
      <section className="mb-12 border-t border-hairline pt-8">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-serif text-lg font-bold text-deep-accent sm:text-xl">
              Transfer History
            </h2>
            <p className="mt-1 text-xs text-muted sm:text-sm">
              {monthTransfers.length}{' '}
              {monthTransfers.length === 1 ? 'transfer' : 'transfers'} ·{' '}
              {formatCurrency(monthTotal)} moved
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="historyMonth"
              className="text-[11px] font-bold uppercase tracking-wide text-muted"
            >
              Month
            </label>
            <select
              id="historyMonth"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="min-h-[44px] border border-hairline bg-white px-3 py-2 text-sm font-semibold text-deep-accent focus:border-primary focus:outline-none"
            >
              {mockTransferMonths.map((monthKey) => (
                <option key={monthKey} value={monthKey}>
                  {formatMonthLabel(monthKey)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-hidden border border-hairline bg-white">
          <div className="hidden grid-cols-[0.9fr_2fr_1fr_1fr_0.9fr] gap-4 border-b border-hairline bg-faint px-4 py-3 text-xs font-bold uppercase tracking-wide text-deep-accent sm:grid">
            <span>Date</span>
            <span>From → To</span>
            <span>Type</span>
            <span className="text-right">Amount</span>
            <span className="text-right">Status</span>
          </div>

          {monthTransfers.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted">
              No transfers in {formatMonthLabel(selectedMonth)}.
            </div>
          )}

          {monthTransfers.map((t) => {
            const meta = TRANSFER_TYPE_META[t.type] || TRANSFER_TYPE_META.internal;
            const TypeIcon = meta.icon;
            const showRecipient = isExternalRecipient(t.type);

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTransfer(t)}
                aria-label={`View details for transfer ${t.transactionNumber}`}
                className="group grid w-full grid-cols-1 gap-1 border-b border-faint px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-faint focus:outline-none focus-visible:bg-faint sm:grid-cols-[0.9fr_2fr_1fr_1fr_0.9fr] sm:items-center sm:gap-4"
              >
                <span className="text-xs text-muted sm:text-sm">
                  {formatHistoryDate(t.date)}
                </span>

                <span className="flex items-center gap-2 text-sm font-medium text-ink">
                  <ArrowLeftRight
                    className="h-3.5 w-3.5 shrink-0 text-primary"
                    strokeWidth={2}
                  />
                  <span className="truncate">
                    {showRecipient ? (t.recipientName || t.to) : t.from}
                  </span>
                  <ArrowRight className="h-3 w-3 shrink-0 text-muted" strokeWidth={2} />
                  <span className="truncate">
                    {showRecipient ? t.to : t.to}
                  </span>
                </span>

                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-body sm:text-xs">
                  <TypeIcon className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
                  {meta.label}
                </span>

                <span className="text-sm font-semibold text-deep-accent sm:text-right">
                  {formatCurrency(t.amount)}
                </span>

                <span className="flex items-center justify-between gap-2 sm:justify-end">
                  <span
                    className={`text-xs font-bold uppercase tracking-wide sm:text-right sm:text-sm sm:normal-case ${statusColor(
                      t.status
                    )}`}
                  >
                    {t.status}
                  </span>
                  <ChevronRight
                    className="h-3.5 w-3.5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
                    strokeWidth={2}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Transfer Details Modal */}
      {selectedTransfer && (
        <TransferDetailsModal
          transfer={selectedTransfer}
          onClose={() => setSelectedTransfer(null)}
        />
      )}
    </div>
  );
};

// ============================================================
// Transfer Type Selection
// ============================================================
const TransferTypeSelection = ({ onSelect }) => {
  const options = [
    {
      key: 'internal',
      icon: ArrowLeftRight,
      label: 'Between My Accounts',
      desc: 'Move money between your checking and savings accounts.',
      meta: 'Instant · No fee',
    },
    {
      key: 'external',
      icon: Landmark,
      label: 'To Another Bank (ACH)',
      desc: 'Send money to an external bank account using ACH.',
      meta: '1–3 business days · No fee',
    },
    {
      key: 'wire',
      icon: Zap,
      label: 'Wire Transfer',
      desc: 'Send a domestic wire to another bank, delivered same business day.',
      meta: 'Same day · $25 fee',
    },
    {
      key: 'recurring',
      icon: Repeat,
      label: 'Recurring Transfer',
      desc: 'Automatically move money on a schedule.',
      meta: 'Automated · No fee',
    },
  ];

  return (
    <div className="border border-hairline bg-faint p-6 sm:p-8">
      <h2 className="mb-6 font-serif text-xl font-bold text-deep-accent sm:text-2xl">
        Choose transfer type
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {options.map(({ key, icon: Icon, label, desc, meta }) => (
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
            <span className="mt-1 inline-flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                {meta}
              </span>
              <ChevronRight
                className="h-3.5 w-3.5 text-primary transition-transform group-hover:translate-x-0.5"
                strokeWidth={2.25}
              />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// Transfer Form
// ============================================================
const TransferForm = ({ formData, onChange, onSubmit, accounts, selectedType, onCancel }) => {
  const fromAccount = accounts.find((a) => a.id === formData.fromAccountId);
  const availableToAccounts = accounts.filter((a) => a.id !== formData.fromAccountId);

  const isWire = selectedType === 'wire';
  const isExternal = selectedType === 'external';
  const isInternal = selectedType === 'internal' || selectedType === 'recurring';

  const amountValue = parseFloat(formData.amount) || 0;

  return (
    <form onSubmit={onSubmit} className="border border-hairline bg-faint p-6 sm:p-8">
      <h2 className="mb-6 font-serif text-xl font-bold text-deep-accent sm:text-2xl">
        {isWire ? 'New Wire Transfer' : isExternal ? 'New ACH Transfer' : 'New Transfer'}
      </h2>

      {(isWire || isExternal) && (
        <div className="mb-6 flex items-start gap-3 border border-hairline bg-white px-4 py-3">
          {isWire ? (
            <Zap className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
          ) : (
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
          )}
          <div className="text-xs text-body sm:text-sm">
            {isWire ? (
              <>
                <strong className="text-deep-accent">Wire transfers</strong> are
                delivered the same business day if submitted before 4 PM ET. A{' '}
                <strong className="text-deep-accent">{formatCurrency(WIRE_FEE)}</strong>{' '}
                wire fee applies. Wires cannot be reversed once sent.
              </>
            ) : (
              <>
                <strong className="text-deep-accent">ACH transfers</strong> are usually
                free and arrive in 1–3 business days. You may be asked to verify the
                recipient account before the first transfer.
              </>
            )}
          </div>
        </div>
      )}

      {/* From account */}
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

      {/* Internal / Recurring: to-account dropdown */}
      {isInternal && (
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
        </div>
      )}

      {/* External / Wire: recipient details */}
      {(isExternal || isWire) && (
        <div className="mb-5 border-t border-hairline pt-5">
          <div className="mb-4 flex items-center gap-2">
            <User className="h-4 w-4 text-primary" strokeWidth={1.75} />
            <h3 className="text-sm font-bold uppercase tracking-wide text-deep-accent">
              Recipient Information
            </h3>
          </div>

          {/* Recipient full name — required so we can show it in history + receipt */}
          <div className="mb-4">
            <label
              htmlFor="recipientName"
              className="mb-1.5 block text-sm font-semibold text-deep-accent"
            >
              Recipient Full Name
            </label>
            <input
              type="text"
              id="recipientName"
              name="recipientName"
              value={formData.recipientName}
              onChange={onChange}
              placeholder="e.g. Jane Smith"
              required
              className="min-h-[44px] w-full border border-hairline bg-white px-3 py-2 text-sm text-deep-accent placeholder:text-muted/70 focus:border-primary focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-muted">
              The name on the recipient&apos;s bank account.
            </p>
          </div>

          <div className="mb-4 flex items-center gap-2 border-t border-hairline pt-4">
            <Building2 className="h-4 w-4 text-primary" strokeWidth={1.75} />
            <h3 className="text-sm font-bold uppercase tracking-wide text-deep-accent">
              Recipient Bank Details
            </h3>
          </div>

          <div className="mb-4">
            <label
              htmlFor="recipientBankName"
              className="mb-1.5 block text-sm font-semibold text-deep-accent"
            >
              Bank Name
            </label>
            <input
              type="text"
              id="recipientBankName"
              name="recipientBankName"
              value={formData.recipientBankName}
              onChange={onChange}
              placeholder="e.g. Chase Bank"
              required
              className="min-h-[44px] w-full border border-hairline bg-white px-3 py-2 text-sm text-deep-accent placeholder:text-muted/70 focus:border-primary focus:outline-none"
            />
          </div>

          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="recipientRoutingNumber"
                className="mb-1.5 block text-sm font-semibold text-deep-accent"
              >
                Routing Number
              </label>
              <input
                type="text"
                id="recipientRoutingNumber"
                name="recipientRoutingNumber"
                value={formData.recipientRoutingNumber}
                onChange={onChange}
                placeholder="9 digits"
                inputMode="numeric"
                maxLength={9}
                pattern="\d{9}"
                required
                className="min-h-[44px] w-full border border-hairline bg-white px-3 py-2 text-sm text-deep-accent placeholder:text-muted/70 focus:border-primary focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-muted">
                9-digit code identifying the recipient&apos;s bank.
              </p>
            </div>

            <div>
              <label
                htmlFor="recipientAccountNumber"
                className="mb-1.5 block text-sm font-semibold text-deep-accent"
              >
                Account Number
              </label>
              <input
                type="text"
                id="recipientAccountNumber"
                name="recipientAccountNumber"
                value={formData.recipientAccountNumber}
                onChange={onChange}
                placeholder="Account number"
                inputMode="numeric"
                required
                className="min-h-[44px] w-full border border-hairline bg-white px-3 py-2 text-sm text-deep-accent placeholder:text-muted/70 focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="recipientAccountType"
                className="mb-1.5 block text-sm font-semibold text-deep-accent"
              >
                Account Type
              </label>
              <select
                id="recipientAccountType"
                name="recipientAccountType"
                value={formData.recipientAccountType}
                onChange={onChange}
                className="min-h-[44px] w-full border border-hairline bg-white px-3 py-2 text-sm text-deep-accent focus:border-primary focus:outline-none"
              >
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
              </select>
            </div>

            {isWire && (
              <div>
                <label
                  htmlFor="recipientBankAddress"
                  className="mb-1.5 block text-sm font-semibold text-deep-accent"
                >
                  Bank Address
                </label>
                <input
                  type="text"
                  id="recipientBankAddress"
                  name="recipientBankAddress"
                  value={formData.recipientBankAddress}
                  onChange={onChange}
                  placeholder="City, State"
                  required
                  className="min-h-[44px] w-full border border-hairline bg-white px-3 py-2 text-sm text-deep-accent placeholder:text-muted/70 focus:border-primary focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Amount */}
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

        {isWire && amountValue > 0 && (
          <div className="mt-2 flex items-center justify-between border border-hairline bg-white px-3 py-2 text-xs sm:text-sm">
            <span className="text-muted">Total to be debited (incl. wire fee)</span>
            <span className="font-bold text-deep-accent">
              {formatCurrency(amountValue + WIRE_FEE)}
            </span>
          </div>
        )}
      </div>

      {/* Date + Frequency */}
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

      {/* Memo */}
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

      {/* Actions */}
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

// ============================================================
// Transfer Review
// ============================================================
const TransferReview = ({
  formData,
  fromAccount,
  toAccount,
  selectedType,
  onConfirm,
  onBack,
}) => {
  const isWire = selectedType === 'wire';
  const isExternal = selectedType === 'external';
  const isInternal = selectedType === 'internal' || selectedType === 'recurring';

  const amountValue = parseFloat(formData.amount) || 0;

  const recipientDisplay = isInternal
    ? toAccount
      ? `${toAccount.name} •••• ${toAccount.lastFour}`
      : '—'
    : formatExternalRecipient(formData);

  const typeLabel = isWire
    ? 'Wire Transfer'
    : isExternal
    ? 'ACH Transfer'
    : selectedType === 'recurring'
    ? 'Recurring Transfer'
    : 'Internal Transfer';

  return (
    <div className="border border-hairline bg-faint p-6 sm:p-8">
      <h2 className="mb-6 font-serif text-xl font-bold text-deep-accent sm:text-2xl">
        Review {typeLabel}
      </h2>

      <div className="mb-6 divide-y divide-hairline border-y border-hairline">
        <Row label="From">
          {fromAccount ? `${fromAccount.name} •••• ${fromAccount.lastFour}` : '—'}
        </Row>

        {!isInternal && formData.recipientName && (
          <Row label="Recipient">{formData.recipientName}</Row>
        )}

        <Row label={isInternal ? 'To' : 'Recipient Account'}>{recipientDisplay}</Row>

        <Row label="Method">
          <span className="inline-flex items-center gap-1.5">
            {isWire ? (
              <Zap className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
            ) : isExternal ? (
              <Landmark className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
            ) : (
              <ArrowLeftRight className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
            )}
            {typeLabel}
          </span>
        </Row>
        <Row label="Amount">
          <span className="font-serif text-lg font-bold text-deep-accent">
            {formatCurrency(amountValue)}
          </span>
        </Row>

        {isWire && (
          <>
            <Row label="Wire Fee">
              <span className="font-semibold text-deep-accent">
                {formatCurrency(WIRE_FEE)}
              </span>
            </Row>
            <Row label="Total Debit">
              <span className="font-serif text-lg font-bold text-primary">
                {formatCurrency(amountValue + WIRE_FEE)}
              </span>
            </Row>
          </>
        )}

        <Row label="Transfer Date">{formData.date}</Row>
        <Row label="Expected Arrival">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-deep-accent">
            <Clock className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
            {getArrivalText(selectedType, formData.date)}
          </span>
        </Row>

        {isExternal && (
          <Row label="Verification">
            {formData.verificationMethod === 'micro'
              ? 'Micro-deposits (1–3 business days)'
              : 'Instant verification'}
          </Row>
        )}

        {isWire && formData.recipientBankAddress && (
          <Row label="Bank Address">{formData.recipientBankAddress}</Row>
        )}

        {selectedType === 'recurring' && (
          <Row label="Frequency">{formData.frequency}</Row>
        )}

        {formData.memo && <Row label="Memo">{formData.memo}</Row>}
      </div>

      {isWire && (
        <div className="mb-6 flex items-start gap-3 border border-hairline bg-white px-4 py-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
          <p className="text-xs text-body sm:text-sm">
            Wire transfers <strong className="text-deep-accent">cannot be reversed</strong>{' '}
            once sent. Please double-check all details before confirming.
          </p>
        </div>
      )}

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

const Row = ({ label, children }) => (
  <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
    <span className="text-sm text-body">{label}</span>
    <span className="text-sm font-semibold text-deep-accent sm:text-right">{children}</span>
  </div>
);

// ============================================================
// Transfer Success
// ============================================================
const TransferSuccess = ({
  confirmationNumber,
  formData,
  fromAccount,
  toAccount,
  selectedType,
  onNewTransfer,
}) => {
  const isWire = selectedType === 'wire';
  const isExternal = selectedType === 'external';
  const isInternal = selectedType === 'internal' || selectedType === 'recurring';

  const amountValue = parseFloat(formData.amount) || 0;

  const recipientName = isInternal
    ? toAccount?.name
    : formData.recipientName || 'recipient';

  const title = isWire
    ? 'Wire Transfer Submitted'
    : isExternal
    ? 'ACH Transfer Scheduled'
    : 'Transfer Scheduled';

  const subtitle = isWire
    ? `Your ${formatCurrency(amountValue)} wire to ${recipientName} has been submitted. A ${formatCurrency(
        WIRE_FEE
      )} fee applies.`
    : isExternal
    ? `Your ${formatCurrency(amountValue)} ACH transfer to ${recipientName} has been scheduled. Funds usually arrive in 1–3 business days.`
    : `Your ${formatCurrency(amountValue)} transfer from ${fromAccount?.name} to ${toAccount?.name} has been scheduled.`;

  return (
    <div className="border border-hairline bg-faint p-6 text-center sm:p-10">
      <div className="mx-auto flex h-14 w-14 items-center justify-center bg-[#e7f3f5]">
        <CheckCircle2 className="h-8 w-8 text-primary" strokeWidth={1.75} />
      </div>

      <h2 className="mt-4 font-serif text-2xl font-bold text-deep-accent sm:text-3xl">
        {title}
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-body sm:text-base">{subtitle}</p>

      <div className="mx-auto mt-6 max-w-md border border-hairline bg-white p-5 text-left">
        <SummaryRow label="Transfer Date" value={formData.date} />
        <SummaryRow
          label="Expected Arrival"
          value={getArrivalText(selectedType, formData.date)}
        />
        {isWire && (
          <SummaryRow
            label="Total Debited"
            value={formatCurrency(amountValue + WIRE_FEE)}
          />
        )}
        <SummaryRow label="Confirmation Number" value={confirmationNumber} />
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

const SummaryRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-1.5">
    <span className="text-xs text-muted sm:text-sm">{label}</span>
    <span className="text-sm font-semibold text-deep-accent">{value}</span>
  </div>
);

// ============================================================
// Transfer Details Modal
// ============================================================
const TransferDetailsModal = ({ transfer, onClose }) => {
  const [copied, setCopied] = useState(false);

  // Close on Escape + lock body scroll while open
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

  const meta = TRANSFER_TYPE_META[transfer.type] || TRANSFER_TYPE_META.internal;
  const TypeIcon = meta.icon;
  const isWire = transfer.type === 'wire';
  const isExternal = isExternalRecipient(transfer.type);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transfer.transactionNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard not available */
    }
  };

  const handleDownload = () => downloadReceipt(transfer);

  const recipientTitle = isExternal ? transfer.recipientName || transfer.to : 'Between Accounts';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="transfer-details-title"
        className="flex max-h-[92vh] w-full max-w-lg flex-col border border-hairline bg-white shadow-2xl sm:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-hairline px-5 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <TypeIcon className="h-4 w-4 text-primary" strokeWidth={2} />
              <span className="text-[11px] font-bold uppercase tracking-wide text-muted">
                {meta.label} Transfer
              </span>
            </div>
            <h3
              id="transfer-details-title"
              className="mt-1 truncate font-serif text-lg font-bold text-deep-accent"
            >
              {recipientTitle}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close transfer details"
            className="flex h-9 w-9 shrink-0 items-center justify-center border border-hairline text-body transition-colors hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Amount + status */}
          <div className="border-b border-hairline px-5 py-5 text-center">
            <div className="font-serif text-3xl font-bold text-deep-accent">
              {formatCurrency(transfer.amount)}
            </div>
            <span
              className={`mt-2 inline-block text-xs font-bold uppercase tracking-wide ${statusColor(
                transfer.status
              )}`}
            >
              {transfer.status}
            </span>
          </div>

          {/* Details list */}
          <dl className="divide-y divide-hairline px-5">
            <DetailRow
              icon={ArrowLeftRight}
              label="Sender"
              value={transfer.senderName || ACCOUNT_HOLDER_NAME}
              sub={`${transfer.from} •••• ${transfer.fromLastFour}`}
            />
            <DetailRow
              icon={User}
              label={isExternal ? 'Recipient' : 'To Account'}
              value={isExternal ? transfer.recipientName || '—' : transfer.to}
              sub={`${transfer.to} •••• ${transfer.toLastFour}`}
            />
            <DetailRow
              icon={CalendarClock}
              label="Date & Time"
              value={formatHistoryDate(transfer.date)}
              sub={transfer.time}
            />
            <DetailRow
              icon={Clock}
              label="Status"
              value={
                <span className={`font-bold ${statusColor(transfer.status)}`}>
                  {transfer.status}
                </span>
              }
            />
            <DetailRow
              icon={FileText}
              label="Transfer Type"
              value={meta.label}
            />
            <DetailRow
              icon={Hash}
              label="Transaction Number"
              value={
                <span className="inline-flex items-center gap-2">
                  <span className="font-mono text-xs sm:text-sm">
                    {transfer.transactionNumber}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    aria-label="Copy transaction number"
                    className="inline-flex h-6 w-6 items-center justify-center border border-hairline text-muted transition-colors hover:bg-faint hover:text-deep-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    {copied ? (
                      <Check className="h-3 w-3 text-primary" strokeWidth={2.5} />
                    ) : (
                      <Copy className="h-3 w-3" strokeWidth={2} />
                    )}
                  </button>
                </span>
              }
            />

            {isWire && (
              <>
                <DetailRow
                  icon={Zap}
                  label="Wire Fee"
                  value={formatCurrency(WIRE_FEE)}
                />
                <DetailRow
                  icon={Zap}
                  label="Total Debited"
                  value={
                    <span className="font-serif text-base font-bold text-primary">
                      {formatCurrency(transfer.amount + WIRE_FEE)}
                    </span>
                  }
                />
              </>
            )}

            {transfer.memo && (
              <DetailRow icon={Info} label="Memo" value={transfer.memo} />
            )}
          </dl>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col gap-2 border-t border-hairline px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] border border-hairline bg-white px-5 py-2.5 text-sm font-semibold text-deep-accent transition-colors hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <Download className="h-4 w-4" strokeWidth={2.25} />
            Download Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

const DetailRow = ({ icon: Icon, label, value, sub }) => (
  <div className="flex items-start justify-between gap-4 py-3.5">
    <div className="flex min-w-0 items-center gap-2">
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-muted" strokeWidth={2} />}
      <span className="text-xs text-muted sm:text-sm">{label}</span>
    </div>
    <div className="min-w-0 text-right">
      <div className="truncate text-sm font-semibold text-deep-accent">{value}</div>
      {sub && <div className="mt-0.5 truncate text-[11px] text-muted">{sub}</div>}
    </div>
  </div>
);

export default Transfers;