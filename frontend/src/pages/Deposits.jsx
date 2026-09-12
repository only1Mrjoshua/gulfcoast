// src/pages/Deposits.jsx
import React, { useState, useEffect } from 'react';
import {
  Plus,
  Camera,
  CheckCircle2,
  Check,
  X,
  Image as ImageIcon,
  ShieldCheck,
  MessageCircle,
  Phone,
  HelpCircle,
  ArrowRight,
  Wallet,
  Landmark,
  Clock,
  BadgeCheck,
  Upload,
  Send,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { apiFetch } from '../utils/api';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Math.abs(amount ?? 0));
};

const formatShortDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const toISODate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toISOString().split('T')[0];
};

// Status color helper — matches the Pending / Completed / Rejected enum
const statusColor = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'completed') return 'text-primary';
  if (s === 'rejected' || s === 'canceled' || s === 'cancelled') return 'text-[#d9534f]';
  return 'text-[#b8860b]'; // pending
};

const statusDotColor = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'completed') return 'bg-primary';
  if (s === 'rejected' || s === 'canceled' || s === 'cancelled') return 'bg-[#d9534f]';
  return 'bg-[#b8860b]';
};

const Deposits = () => {
  // State
  const [currentStep, setCurrentStep] = useState('overview');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [amount, setAmount] = useState('');

  // Preview (base64) for showing the user
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  // Actual File objects for upload
  const [frontImageFile, setFrontImageFile] = useState(null);
  const [backImageFile, setBackImageFile] = useState(null);

  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('');

  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState('');

  // Backend data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState({
    overview: {
      depositedThisMonth: 0,
      pendingDeposits: 0,
      availableDeposits: 0,
    },
    accounts: [],
    recentDeposits: [],
  });

  // ------------------------------------------------------------
  // Fetch overview on mount
  // ------------------------------------------------------------
  const loadOverview = async () => {
    const res = await apiFetch('/deposits/overview');
    const d = res?.data ?? res;

    setData({
      overview: d.overview ?? {
        depositedThisMonth: 0,
        pendingDeposits: 0,
        availableDeposits: 0,
      },
      accounts: d.accounts ?? [],
      recentDeposits: d.recentDeposits ?? [],
    });

    return d;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const d = await loadOverview();
        // Default to first account
        if (d.accounts?.length > 0) {
          setSelectedAccountId((prev) => prev || d.accounts[0].id);
        }
      } catch (err) {
        console.error('❌ Failed to load deposits:', err);
        setError(err.message || 'Failed to load deposits');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------
  const handleStartDeposit = () => {
    setCurrentStep('form');
    setConfirmError('');
    if (data.accounts?.length > 0) {
      setSelectedAccountId(data.accounts[0].id);
    }
    setAmount('');
    setFrontImage(null);
    setBackImage(null);
    setFrontImageFile(null);
    setBackImageFile(null);
  };

  const handleAccountChange = (e) => {
    setSelectedAccountId(e.target.value);
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
    if (confirmError) setConfirmError('');
  };

  const handleImageUpload = (side) => (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Save the File for upload
    if (side === 'front') setFrontImageFile(file);
    else setBackImageFile(file);

    // Generate a preview URL
    const reader = new FileReader();
    reader.onload = (event) => {
      if (side === 'front') setFrontImage(event.target.result);
      else setBackImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setCurrentStep('review');
  };

  const handleConfirm = async () => {
    setConfirmError('');
    setConfirmLoading(true);

    try {
      const formData = new FormData();
      formData.append('accountId', selectedAccountId);
      formData.append('amount', parseFloat(amount));
      formData.append('method', 'Mobile Check Deposit');
      if (frontImageFile) formData.append('frontImage', frontImageFile);
      if (backImageFile) formData.append('backImage', backImageFile);

      const res = await apiFetch('/deposits', {
        method: 'POST',
        body: formData,
      });

      const deposit = res.data?.deposit ?? res.deposit;
      setConfirmationNumber(deposit?.confirmationNumber || '');
      await loadOverview();
      setCurrentStep('success');
    } catch (err) {
      setConfirmError(err.message || 'Failed to submit deposit');
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleNewDeposit = () => {
    setCurrentStep('overview');
    setAmount('');
    setFrontImage(null);
    setBackImage(null);
    setFrontImageFile(null);
    setBackImageFile(null);
    setConfirmError('');
    if (data.accounts?.length > 0) {
      setSelectedAccountId(data.accounts[0].id);
    }
  };

  const getAccount = (id) =>
    data.accounts.find((a) => String(a.id) === String(id));

  // Filter deposits
  const filteredDeposits = data.recentDeposits
    .filter((dep) => {
      if (filterType === 'all') return true;
      if (filterType === 'mobile') return dep.method === 'Mobile Check Deposit';
      if (filterType === 'direct') return dep.method === 'Direct Deposit';
      if (filterType === 'other')
        return !['Mobile Check Deposit', 'Direct Deposit'].includes(dep.method);
      return true;
    })
    .filter((dep) => {
      if (!filterDate) return true;
      return toISODate(dep.submittedAt) === filterDate;
    });

  const overviewCards = [
    {
      label: 'Deposited This Month',
      value: data.overview.depositedThisMonth,
      icon: BadgeCheck,
    },
    {
      label: 'Pending Deposits',
      value: data.overview.pendingDeposits,
      icon: Clock,
    },
    {
      label: 'Available Deposits',
      value: data.overview.availableDeposits,
      icon: Wallet,
    },
  ];

  const depositSteps = [
    'Endorse your check',
    'Capture the front',
    'Capture the back',
    'Enter the amount',
    'Review and submit',
  ];

  // ------------------------------------------------------------
  // Loading state
  // ------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" strokeWidth={1.75} />
        <p className="text-sm text-muted">Loading your deposits…</p>
      </div>
    );
  }

  // ------------------------------------------------------------
  // Error state
  // ------------------------------------------------------------
  if (error) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-4">
        <p className="font-serif text-xl font-bold text-deep-accent">
          We couldn&rsquo;t load your deposits
        </p>
        <p className="max-w-md text-center text-sm text-muted">{error}</p>
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
    <div className="mx-auto max-w-[1000px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Page Header */}
      <div className="mb-8 flex flex-col gap-4 border-b border-hairline pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold leading-tight text-deep-accent sm:text-3xl">
            Deposits
          </h1>
          <p className="mt-1 text-sm text-body sm:text-base">
            Deposit checks and manage your recent deposits securely.
          </p>
        </div>
        {currentStep === 'overview' && (
          <button
            type="button"
            onClick={handleStartDeposit}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <Plus className="h-4 w-4" strokeWidth={2.25} />
            Deposit a Check
          </button>
        )}
      </div>

      {/* Deposit Overview */}
      {currentStep === 'overview' && (
        <>
          {/* Overview stats */}
          <section className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {overviewCards.map(({ label, value, icon: Icon }) => (
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
              </div>
            ))}
          </section>

          {/* Mobile Check Deposit CTA */}
          <section className="mb-10 border border-hairline bg-faint p-6 sm:p-8">
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" strokeWidth={1.75} />
              <h2 className="font-serif text-xl font-bold text-deep-accent sm:text-2xl">
                Deposit a Check
              </h2>
            </div>
            <p className="mt-1 text-sm text-body">
              Deposit a check securely using your mobile device.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {depositSteps.map((step, idx) => (
                <div
                  key={step}
                  className="flex items-center gap-3 border border-hairline bg-white px-3 py-2.5"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-primary text-[11px] font-bold text-white">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-medium text-deep-accent sm:text-sm">
                    {step}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleStartDeposit}
              className="mt-6 inline-flex min-h-[44px] items-center justify-center gap-2 bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              Start Deposit
              <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
            </button>

            <div className="mt-4 flex items-start gap-2.5 border-t border-hairline pt-4">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
              <p className="text-xs text-body sm:text-sm">
                Make sure your check is properly endorsed and placed on a flat, well-lit
                surface.
              </p>
            </div>
          </section>

          {/* Recent Deposits */}
          <section className="mb-10">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-serif text-lg font-bold text-deep-accent sm:text-xl">
                Recent Deposits
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="min-h-[38px] border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                >
                  <option value="all">All</option>
                  <option value="mobile">Mobile Check</option>
                  <option value="direct">Direct Deposit</option>
                  <option value="other">Other</option>
                </select>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="min-h-[38px] border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                />
                {filterDate && (
                  <button
                    type="button"
                    onClick={() => setFilterDate('')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={2.25} />
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="border-t border-hairline">
              {filteredDeposits.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted">No deposits found.</p>
              ) : (
                filteredDeposits.map((dep) => (
                  <div
                    key={dep.id}
                    className="flex flex-col gap-2 border-b border-faint py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                  >
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-semibold text-ink">
                        {dep.method}
                      </span>
                      <span className="truncate text-xs text-muted">
                        {dep.accountName} •••• {dep.accountLastFour}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 sm:justify-end">
                      <span className="text-xs text-muted">
                        {formatShortDate(dep.submittedAt)}
                      </span>
                      <span className="text-sm font-semibold text-primary">
                        +{formatCurrency(dep.amount)}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide ${statusColor(
                          dep.status
                        )}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 ${statusDotColor(dep.status)}`}
                          aria-hidden="true"
                        />
                        {dep.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      )}

      {/* Deposit Form */}
      {currentStep === 'form' && (
        <div className="mb-10 border border-hairline bg-faint p-6 sm:p-8">
          <h2 className="mb-6 font-serif text-xl font-bold text-deep-accent sm:text-2xl">
            Deposit a Check
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Step 1: Deposit to account */}
            <div>
              <label
                htmlFor="depositAccount"
                className="mb-1.5 block text-sm font-semibold text-deep-accent"
              >
                Deposit to
              </label>
              <select
                id="depositAccount"
                value={selectedAccountId}
                onChange={handleAccountChange}
                required
                className="min-h-[44px] w-full border border-hairline bg-white px-3 py-2 text-sm text-deep-accent focus:border-primary focus:outline-none"
              >
                <option value="">Select account</option>
                {data.accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} •••• {acc.lastFour} (Available:{' '}
                    {formatCurrency(acc.available)})
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Amount */}
            <div>
              <label
                htmlFor="depositAmount"
                className="mb-1.5 block text-sm font-semibold text-deep-accent"
              >
                Check Amount
              </label>
              <div className="flex items-center border border-hairline bg-white focus-within:border-primary">
                <span className="pl-3 pr-1 text-base font-bold text-body">$</span>
                <input
                  type="number"
                  id="depositAmount"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  required
                  className="min-h-[44px] w-full border-none bg-transparent px-2 py-2 text-lg font-semibold text-deep-accent outline-none placeholder:text-muted/60"
                />
              </div>
              <p className="mt-1.5 text-xs text-muted">
                Enter the exact amount written on the check.
              </p>
            </div>

            {/* Step 3: Check images */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-deep-accent">
                Check Images
              </label>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Front */}
                <div className="border border-hairline bg-white p-4 text-center">
                  <p className="mb-3 text-sm font-semibold text-deep-accent">
                    Front of Check
                  </p>
                  <input
                    type="file"
                    id="fileFront"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload('front')}
                    className="sr-only"
                  />
                  {frontImage ? (
                    <img
                      src={frontImage}
                      alt="Front of check"
                      className="mx-auto max-h-[140px] max-w-full object-contain"
                    />
                  ) : (
                    <label
                      htmlFor="fileFront"
                      className="flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-hairline bg-faint px-6 py-8 text-xs font-medium text-body transition-colors hover:border-primary hover:text-primary"
                    >
                      <Camera className="h-5 w-5 text-primary" strokeWidth={1.75} />
                      Upload / Capture
                    </label>
                  )}
                </div>

                {/* Back */}
                <div className="border border-hairline bg-white p-4 text-center">
                  <p className="mb-3 text-sm font-semibold text-deep-accent">
                    Back of Check
                  </p>
                  <input
                    type="file"
                    id="fileBack"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload('back')}
                    className="sr-only"
                  />
                  {backImage ? (
                    <img
                      src={backImage}
                      alt="Back of check"
                      className="mx-auto max-h-[140px] max-w-full object-contain"
                    />
                  ) : (
                    <label
                      htmlFor="fileBack"
                      className="flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-hairline bg-faint px-6 py-8 text-xs font-medium text-body transition-colors hover:border-primary hover:text-primary"
                    >
                      <Camera className="h-5 w-5 text-primary" strokeWidth={1.75} />
                      Upload / Capture
                    </label>
                  )}
                </div>
              </div>
              <p className="mt-2 text-xs text-muted">
                Ensure the entire check is visible and readable.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-hairline pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setCurrentStep('overview')}
                className="min-h-[44px] border border-hairline bg-white px-6 py-2.5 text-sm font-semibold text-deep-accent transition-colors hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                Review Deposit
                <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Review Step */}
      {currentStep === 'review' && (
        <div className="mb-10 border border-hairline bg-faint p-6 sm:p-8">
          <h2 className="mb-6 font-serif text-xl font-bold text-deep-accent sm:text-2xl">
            Review Deposit
          </h2>

          <div className="mb-6 divide-y divide-hairline border-y border-hairline">
            <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-body">Deposit To</span>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-deep-accent sm:text-right">
                <Landmark className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
                {getAccount(selectedAccountId)?.name} ••••{' '}
                {getAccount(selectedAccountId)?.lastFour}
              </span>
            </div>
            <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-body">Amount</span>
              <span className="font-serif text-lg font-bold text-deep-accent sm:text-right">
                {formatCurrency(parseFloat(amount) || 0)}
              </span>
            </div>
            <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-body">Images</span>
              <span className="flex items-center gap-4 text-sm font-semibold text-deep-accent sm:justify-end">
                <span className="inline-flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
                  Front:
                  {frontImage ? (
                    <Check className="h-4 w-4 text-primary" strokeWidth={2.5} />
                  ) : (
                    <X className="h-4 w-4 text-[#d9534f]" strokeWidth={2.5} />
                  )}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
                  Back:
                  {backImage ? (
                    <Check className="h-4 w-4 text-primary" strokeWidth={2.5} />
                  ) : (
                    <X className="h-4 w-4 text-[#d9534f]" strokeWidth={2.5} />
                  )}
                </span>
              </span>
            </div>
          </div>

          {confirmError && (
            <div className="mb-6 flex items-start gap-2 border border-[#f5c6cb] bg-[#f8d7da] px-4 py-3">
              <AlertCircle
                className="mt-0.5 h-4 w-4 shrink-0 text-[#721c24]"
                strokeWidth={2}
              />
              <span className="text-sm text-[#721c24]">{confirmError}</span>
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-hairline pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setCurrentStep('form')}
              disabled={confirmLoading}
              className="min-h-[44px] border border-hairline bg-white px-6 py-2.5 text-sm font-semibold text-deep-accent transition-colors hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-60"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={confirmLoading}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {confirmLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.25} />
                  Submitting…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" strokeWidth={2.25} />
                  Submit Deposit
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Success Step */}
      {currentStep === 'success' && (
        <div className="mb-10 border border-hairline bg-faint p-6 text-center sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center bg-[#e7f3f5]">
            <CheckCircle2 className="h-8 w-8 text-primary" strokeWidth={1.75} />
          </div>

          <h2 className="mt-4 font-serif text-2xl font-bold text-deep-accent sm:text-3xl">
            Deposit Submitted
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-body sm:text-base">
            Your check deposit has been submitted successfully.
          </p>

          <div className="mx-auto mt-6 max-w-lg border border-hairline bg-white p-5 text-left">
            <div className="flex items-center justify-between py-1.5">
              <span className="text-xs text-muted sm:text-sm">Status</span>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#b8860b]">
                <Clock className="h-3.5 w-3.5" strokeWidth={2} />
                Pending
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-xs text-muted sm:text-sm">Account</span>
              <span className="text-sm font-semibold text-deep-accent">
                {getAccount(selectedAccountId)?.name} ••••{' '}
                {getAccount(selectedAccountId)?.lastFour}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-xs text-muted sm:text-sm">Submitted</span>
              <span className="text-sm font-semibold text-deep-accent">
                {new Date().toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-xs text-muted sm:text-sm">Status</span>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#b8860b]">
                <Clock className="h-3.5 w-3.5" strokeWidth={2} />
                Processing
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-xs text-muted sm:text-sm">Confirmation Number</span>
              <span className="text-sm font-semibold text-deep-accent">
                {confirmationNumber}
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={handleNewDeposit}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 border border-primary bg-white px-6 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              View Deposit
              <ChevronRight className="h-4 w-4" strokeWidth={2.25} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deposits;