// src/pages/Transactions.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Download,
  Search,
  SlidersHorizontal,
  X,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  ChevronDown,
  Clock,
  CheckCircle2,
  FileText,
  AlertCircle,
  Tag,
  MapPin,
  CreditCard,
  Store,
  Hash,
  Calendar,
  Loader2,
  Send,
} from 'lucide-react';
import { apiFetch } from '../utils/api';

const PAGE_SIZE = 15;

// ---------- Formatting helpers ----------
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Math.abs(amount ?? 0));
};

const toISODate = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getDateGroup = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.getTime() === today.getTime()) return 'Today';
  if (date.getTime() === yesterday.getTime()) return 'Yesterday';
  return formatDate(dateStr);
};

const currentMonthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const Transactions = () => {
  // ── Core data ────────────────────────────────────────
  const [months, setMonths] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);

  // ── Filters ──────────────────────────────────────────
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey());
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [transactionType, setTransactionType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // ── Results ──────────────────────────────────────────
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalIn: 0, totalOut: 0, net: 0, count: 0 });

  // ── Pagination ───────────────────────────────────────
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  // ── UI state ─────────────────────────────────────────
  const [initialLoading, setInitialLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Modals ───────────────────────────────────────────
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Download modal
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadFrom, setDownloadFrom] = useState('');
  const [downloadTo, setDownloadTo] = useState('');
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  // Report modal
  const [reportTransaction, setReportTransaction] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState('');
  const [reportSuccess, setReportSuccess] = useState(null);

  // ============================================================
  // Initial load
  // ============================================================
  useEffect(() => {
    const loadInitial = async () => {
      try {
        setInitialLoading(true);
        setError('');

        const [monthsRes, optionsRes] = await Promise.all([
          apiFetch('/transactions/months'),
          apiFetch('/transactions/filter-options'),
        ]);

        const m = monthsRes.data?.months ?? monthsRes.months ?? [];
        const opts = optionsRes.data ?? optionsRes;

        setMonths(m);
        setAccounts(opts.accounts ?? []);
        setCategories(opts.categories ?? []);

        if (m.length > 0 && !m.find((x) => x.key === currentMonthKey())) {
          setSelectedMonth(m[0].key);
        }
      } catch (err) {
        console.error('❌ Failed to load transactions init:', err);
        setError(err.message || 'Failed to load transactions');
      } finally {
        setInitialLoading(false);
      }
    };
    loadInitial();
  }, []);

  // ============================================================
  // Build query params for a given page
  // ============================================================
  const buildQueryParams = useCallback(
    (pageNum) => {
      const params = new URLSearchParams();

      // Date scope
      if (dateRange === 'custom' && (startDate || endDate)) {
        if (startDate) params.append('fromDate', startDate);
        if (endDate) params.append('toDate', endDate);
      } else {
        const now = new Date();
        let from = null, to = null;

        if (dateRange === 'today') {
          from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          to = from;
        } else if (dateRange === 'last7') {
          to = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          from = new Date(to); from.setDate(from.getDate() - 6);
        } else if (dateRange === 'last30') {
          to = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          from = new Date(to); from.setDate(from.getDate() - 29);
        } else if (dateRange === 'thismonth') {
          from = new Date(now.getFullYear(), now.getMonth(), 1);
          to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        } else if (dateRange === 'lastmonth') {
          from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          to = new Date(now.getFullYear(), now.getMonth(), 0);
        }

        if (from && to) {
          params.append('fromDate', toISODate(from));
          params.append('toDate', toISODate(to));
        } else if (selectedMonth) {
          params.append('month', selectedMonth);
        }
      }

      if (selectedAccount !== 'all') params.append('accountId', selectedAccount);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (transactionType !== 'all') params.append('type', transactionType);
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (minAmount) params.append('minAmount', minAmount);
      if (maxAmount) params.append('maxAmount', maxAmount);

      params.append('page', pageNum);
      params.append('limit', PAGE_SIZE);

      return params;
    },
    [
      selectedMonth,
      selectedAccount,
      searchQuery,
      dateRange,
      startDate,
      endDate,
      transactionType,
      selectedCategory,
      minAmount,
      maxAmount,
    ]
  );

  // ============================================================
  // Fetch a page. `replace=true` → replaces list (fresh load).
  //                `replace=false` → appends (See more).
  // ============================================================
  const fetchPage = useCallback(
    async (pageNum, replace) => {
      try {
        setListLoading(true);
        setError('');

        const params = buildQueryParams(pageNum);
        const res = await apiFetch(`/transactions?${params.toString()}`);
        const d = res?.data ?? res;

        const mapped = (d.transactions ?? []).map((tx) => ({
          id: tx.id,
          description: tx.description,
          category: tx.category || 'Uncategorized',
          merchant: tx.merchant || '',
          referenceNumber: tx.referenceNumber || '',
          accountId: tx.accountId,
          accountName: tx.accountName,
          accountLastFour: tx.accountLastFour,
          date: toISODate(tx.date),
          amount: tx.amount,
          balance: tx.balance,
          type: tx.type,
          status: tx.status,
          location: tx.location || '',
          paymentMethod: tx.paymentMethod || '',
        }));

        setTransactions((prev) => (replace ? mapped : [...prev, ...mapped]));
        setSummary({
          totalIn:  d.summary?.totalIn  ?? 0,
          totalOut: d.summary?.totalOut ?? 0,
          net:      d.summary?.net      ?? 0,
          count:    d.summary?.count    ?? 0,
        });
        setHasMore(d.pagination?.hasMore ?? false);
        setTotal(d.pagination?.total ?? mapped.length);
        setPage(pageNum);
      } catch (err) {
        console.error('❌ Failed to load transactions:', err);
        setError(err.message || 'Failed to load transactions');
      } finally {
        setListLoading(false);
      }
    },
    [buildQueryParams]
  );

  // Reset to page 1 whenever any filter changes
  useEffect(() => {
    if (initialLoading) return;
    fetchPage(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedMonth,
    selectedAccount,
    searchQuery,
    dateRange,
    startDate,
    endDate,
    transactionType,
    selectedCategory,
    minAmount,
    maxAmount,
    initialLoading,
  ]);

  const loadMore = () => {
    if (!hasMore || listLoading) return;
    fetchPage(page + 1, false);
  };

  // ============================================================
  // Grouping
  // ============================================================
  const groupedTransactions = useMemo(() => {
    const groups = {};
    transactions.forEach((tx) => {
      const key = getDateGroup(tx.date);
      if (!groups[key]) groups[key] = [];
      groups[key].push(tx);
    });
    return groups;
  }, [transactions]);

  const summaryItems = [
    { label: 'Money In',  value: `+${formatCurrency(summary.totalIn)}`,  color: 'text-primary' },
    { label: 'Money Out', value: `-${formatCurrency(summary.totalOut)}`, color: 'text-[#d9534f]' },
    {
      label: 'Net',
      value: `${summary.net >= 0 ? '+' : ''}${formatCurrency(summary.net)}`,
      color: summary.net >= 0 ? 'text-primary' : 'text-[#d9534f]',
    },
    { label: 'Transactions', value: summary.count, color: 'text-deep-accent' },
  ];

  const handleClearFilters = () => {
    setSelectedAccount('all');
    setSearchQuery('');
    setDateRange('all');
    setStartDate('');
    setEndDate('');
    setTransactionType('all');
    setSelectedCategory('All');
    setMinAmount('');
    setMaxAmount('');
  };

  const handleTransactionClick = (tx) => {
    setSelectedTransaction(tx);
  };

  const closeDetail = () => {
    setSelectedTransaction(null);
  };

  // ============================================================
  // Download modal
  // ============================================================
  const openDownloadModal = () => {
    const [y, m] = (selectedMonth || currentMonthKey()).split('-').map(Number);
    const first = new Date(y, m - 1, 1);
    const last  = new Date(y, m, 0);
    setDownloadFrom(toISODate(first));
    setDownloadTo(toISODate(last));
    setDownloadError('');
    setShowDownloadModal(true);
  };

  const handleDownload = async () => {
    setDownloadError('');
    setDownloadLoading(true);

    try {
      const API_URL =
        import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');

      const params = new URLSearchParams();
      if (downloadFrom) params.append('fromDate', downloadFrom);
      if (downloadTo)   params.append('toDate', downloadTo);

      if (selectedAccount !== 'all') params.append('accountId', selectedAccount);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (transactionType !== 'all') params.append('type', transactionType);
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (minAmount) params.append('minAmount', minAmount);
      if (maxAmount) params.append('maxAmount', maxAmount);

      const response = await fetch(
        `${API_URL}/transactions/download?${params.toString()}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      if (!response.ok) {
        throw new Error('Download failed. Please try again.');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const label = `${downloadFrom}_to_${downloadTo}`.replace(/[^0-9-]/g, '');
      a.download = `transactions-${label}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setShowDownloadModal(false);
    } catch (err) {
      setDownloadError(err.message || 'Download failed');
    } finally {
      setDownloadLoading(false);
    }
  };

  // ============================================================
  // Report modal
  // ============================================================
  const openReportModal = (tx) => {
    setSelectedTransaction(null);
    setReportTransaction(tx);
    setReportReason('');
    setReportError('');
    setReportSuccess(null);
  };

  const closeReportModal = () => {
    setReportTransaction(null);
    setReportReason('');
    setReportError('');
    setReportSuccess(null);
  };

  const handleSubmitReport = async () => {
    setReportError('');
    if (!reportReason.trim()) {
      setReportError('Please enter a reason for the report.');
      return;
    }

    setReportLoading(true);
    try {
      const res = await apiFetch(`/transactions/${reportTransaction.id}/report`, {
        method: 'POST',
        body: JSON.stringify({ reason: reportReason.trim() }),
      });

      const report = res.data?.report ?? res.report;
      setReportSuccess(report);
    } catch (err) {
      setReportError(err.message || 'Failed to submit report');
    } finally {
      setReportLoading(false);
    }
  };

  // ============================================================
  // Full-page states
  // ============================================================
  if (initialLoading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" strokeWidth={1.75} />
        <p className="text-sm text-muted">Loading your transactions…</p>
      </div>
    );
  }

  if (error && transactions.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-4">
        <p className="font-serif text-xl font-bold text-deep-accent">
          We couldn&rsquo;t load your transactions
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

  const remaining = Math.max(0, total - transactions.length);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 border-b border-hairline pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold leading-tight text-deep-accent sm:text-3xl">
            Transactions
          </h1>
          <p className="mt-1 text-sm text-body sm:text-base">
            View and search your recent account activity.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <div className="flex items-center gap-2">
            <label
              htmlFor="monthSelect"
              className="text-[11px] font-bold uppercase tracking-wide text-muted"
            >
              Month
            </label>
            <select
              id="monthSelect"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="min-h-[44px] border border-hairline bg-white px-3 py-2 text-sm font-semibold text-deep-accent focus:border-primary focus:outline-none"
            >
              {months.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={openDownloadModal}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 border border-primary bg-white px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <Download className="h-4 w-4" strokeWidth={2.25} />
            Download Transactions
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summaryItems.map(({ label, value, color }) => (
          <div key={label} className="border border-hairline bg-faint px-4 py-3">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted sm:text-xs">
              {label}
            </span>
            <div className={`mt-1 font-serif text-xl font-bold sm:text-2xl ${color}`}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-6 border border-hairline bg-faint p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="flex flex-col gap-1.5 sm:min-w-[180px]">
            <label
              htmlFor="accountSelect"
              className="text-xs font-semibold text-deep-accent"
            >
              Account
            </label>
            <select
              id="accountSelect"
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
            >
              <option value="all">All accounts</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} {acc.lastFour ? `•••• ${acc.lastFour}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-1 flex-col gap-1.5">
            <label
              htmlFor="searchInput"
              className="text-xs font-semibold text-deep-accent"
            >
              Search
            </label>
            <div className="flex items-center border border-hairline bg-white focus-within:border-primary">
              <Search
                className="ml-3 h-4 w-4 shrink-0 text-muted"
                strokeWidth={2}
              />
              <input
                type="text"
                id="searchInput"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="min-h-[38px] w-full border-none bg-transparent px-2 py-1.5 text-sm text-deep-accent outline-none placeholder:text-muted/70"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mr-2 inline-flex h-6 w-6 items-center justify-center text-muted hover:text-deep-accent"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2.25} />
                </button>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex min-h-[38px] items-center justify-center gap-2 border border-hairline bg-white px-4 py-1.5 text-sm font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <SlidersHorizontal className="h-4 w-4" strokeWidth={2} />
            {showFilters ? 'Hide Filters' : 'More Filters'}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 flex flex-col gap-3 border-t border-hairline pt-4 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="flex flex-col gap-1.5 sm:min-w-[160px]">
              <label className="text-xs font-semibold text-deep-accent">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
              >
                <option value="all">Selected Month</option>
                <option value="today">Today</option>
                <option value="last7">Last 7 Days</option>
                <option value="last30">Last 30 Days</option>
                <option value="thismonth">This Month</option>
                <option value="lastmonth">Last Month</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {dateRange === 'custom' && (
              <>
                <div className="flex flex-col gap-1.5 sm:min-w-[150px]">
                  <label className="text-xs font-semibold text-deep-accent">From</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5 sm:min-w-[150px]">
                  <label className="text-xs font-semibold text-deep-accent">To</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                  />
                </div>
              </>
            )}

            <div className="flex flex-col gap-1.5 sm:min-w-[150px]">
              <label className="text-xs font-semibold text-deep-accent">Type</label>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
              >
                <option value="all">All</option>
                <option value="purchase">Purchases</option>
                <option value="deposit">Deposits</option>
                <option value="transfer">Transfers</option>
                <option value="payment">Payments</option>
                <option value="withdrawal">Withdrawals</option>
                <option value="fee">Fees</option>
                <option value="interest">Interest</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 sm:min-w-[160px]">
              <label className="text-xs font-semibold text-deep-accent">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
              >
                <option value="All">All</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5 sm:min-w-[120px]">
              <label className="text-xs font-semibold text-deep-accent">Min Amount</label>
              <input
                type="number"
                placeholder="0.00"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                step="0.01"
                className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent placeholder:text-muted/70 focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:min-w-[120px]">
              <label className="text-xs font-semibold text-deep-accent">Max Amount</label>
              <input
                type="number"
                placeholder="0.00"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                step="0.01"
                className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent placeholder:text-muted/70 focus:border-primary focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex min-h-[38px] items-center gap-1.5 self-start border border-hairline bg-white px-4 py-1.5 text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:self-auto"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2.25} />
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Transaction List */}
      <div className="mb-6">
        {transactions.length === 0 && !listLoading ? (
          <div className="border border-hairline bg-faint py-12 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-muted" strokeWidth={1.5} />
            <p className="mt-3 text-sm font-semibold text-deep-accent">
              No transactions found
            </p>
            <p className="mt-1 text-xs text-muted">
              Try changing your search or filter criteria.
            </p>
            <button
              type="button"
              onClick={handleClearFilters}
              className="mt-5 inline-flex min-h-[40px] items-center gap-1.5 border border-primary bg-white px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2.25} />
              Clear Filters
            </button>
          </div>
        ) : (
          Object.entries(groupedTransactions).map(([dateGroup, txs]) => (
            <div key={dateGroup} className="mb-6">
              <h3 className="mb-3 border-b border-hairline pb-2 font-serif text-base font-bold text-deep-accent sm:text-lg">
                {dateGroup}
              </h3>

              <div className="flex flex-col">
                {txs.map((tx) => {
                  const isPositive = tx.amount >= 0;
                  return (
                    <button
                      key={tx.id}
                      type="button"
                      onClick={() => handleTransactionClick(tx)}
                      className="group flex flex-col gap-2 border-b border-faint px-3 py-3 text-left transition-colors hover:bg-faint sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center ${
                            isPositive
                              ? 'bg-[#e7f3f5] text-primary'
                              : 'bg-faint text-body'
                          }`}
                        >
                          {isPositive ? (
                            <ArrowDownLeft className="h-4 w-4" strokeWidth={1.75} />
                          ) : (
                            <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
                          )}
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold text-ink">
                            {tx.description}
                          </div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                            <span className="truncate">{tx.accountName}</span>
                            <span className="inline-flex items-center gap-1 bg-faint px-2 py-0.5 text-[11px] font-medium text-body">
                              <Tag className="h-3 w-3" strokeWidth={2} />
                              {tx.category}
                            </span>
                            {tx.status === 'Pending' && (
                              <span className="inline-flex items-center gap-1 bg-[#fff3e0] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#b8860b]">
                                <Clock className="h-3 w-3" strokeWidth={2.25} />
                                Pending
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 sm:justify-end">
                        <div className="flex flex-col items-start sm:items-end">
                          <span
                            className={`text-sm font-bold ${
                              isPositive ? 'text-primary' : 'text-[#d9534f]'
                            }`}
                          >
                            {isPositive ? '+' : '-'}
                            {formatCurrency(tx.amount)}
                          </span>
                          <span className="text-xs text-muted">
                            {formatCurrency(tx.balance)}
                          </span>
                        </div>
                        <ChevronRight
                          className="hidden h-4 w-4 text-muted transition-transform group-hover:translate-x-0.5 sm:block"
                          strokeWidth={2}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {/* See more button */}
        {transactions.length > 0 && hasMore && (
          <div className="mt-6 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={loadMore}
              disabled={listLoading}
              className="inline-flex min-h-[48px] w-full max-w-md items-center justify-center gap-2 border border-hairline bg-white px-6 py-3 text-sm font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {listLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.25} />
                  Loading…
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" strokeWidth={2.25} />
                  See more ({remaining} remaining)
                </>
              )}
            </button>
            <span className="text-xs text-muted">
              Showing {transactions.length} of {total}
            </span>
          </div>
        )}

        {/* Fully-loaded indicator */}
        {transactions.length > 0 && !hasMore && total > PAGE_SIZE && (
          <div className="mt-6 text-center text-xs text-muted">
            Showing all {total} transactions
          </div>
        )}
      </div>

      {/* Statements link */}
      <div className="mb-6 flex flex-col items-start gap-2 border border-hairline bg-faint px-4 py-3 sm:flex-row sm:items-center sm:gap-3">
        <FileText className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
        <span className="text-sm text-body">Looking for your monthly statement?</span>
        <a
          href="/statements"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          View Statements
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.25} />
        </a>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4"
          onClick={closeDetail}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-[600px] overflow-y-auto border border-hairline bg-white p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeDetail}
              aria-label="Close"
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-faint hover:text-deep-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <X className="h-4 w-4" strokeWidth={2.25} />
            </button>

            <div className="flex flex-col gap-1 pr-8">
              <h2 className="font-serif text-xl font-bold text-deep-accent sm:text-2xl">
                {selectedTransaction.description}
              </h2>

              <div className="mt-3 flex items-center gap-3 border-b border-faint pb-4">
                <span
                  className={`flex h-11 w-11 items-center justify-center ${
                    selectedTransaction.amount >= 0
                      ? 'bg-[#e7f3f5] text-primary'
                      : 'bg-faint text-body'
                  }`}
                >
                  {selectedTransaction.amount >= 0 ? (
                    <ArrowDownLeft className="h-5 w-5" strokeWidth={1.75} />
                  ) : (
                    <ArrowUpRight className="h-5 w-5" strokeWidth={1.75} />
                  )}
                </span>
                <div>
                  <div
                    className={`font-serif text-2xl font-bold ${
                      selectedTransaction.amount >= 0
                        ? 'text-primary'
                        : 'text-[#d9534f]'
                    }`}
                  >
                    {selectedTransaction.amount >= 0 ? '+' : '-'}
                    {formatCurrency(selectedTransaction.amount)}
                  </div>
                  <div className="text-xs text-muted">
                    {formatDate(selectedTransaction.date)}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col divide-y divide-faint">
              <ModalRow
                icon={FileText}
                label="Account"
                value={selectedTransaction.accountName}
              />
              <ModalRow
                icon={Tag}
                label="Category"
                value={selectedTransaction.category}
              />
              <ModalRow
                icon={SlidersHorizontal}
                label="Transaction Type"
                value={
                  selectedTransaction.type.charAt(0).toUpperCase() +
                  selectedTransaction.type.slice(1)
                }
              />
              <ModalRow
                icon={
                  selectedTransaction.status === 'Pending'
                    ? Clock
                    : CheckCircle2
                }
                label="Status"
                value={selectedTransaction.status}
                valueColor={
                  selectedTransaction.status === 'Pending'
                    ? 'text-[#b8860b]'
                    : 'text-primary'
                }
              />
              <ModalRow
                icon={Hash}
                label="Reference Number"
                value={selectedTransaction.referenceNumber}
              />
              {selectedTransaction.merchant && (
                <ModalRow
                  icon={Store}
                  label="Merchant"
                  value={selectedTransaction.merchant}
                />
              )}
              {selectedTransaction.location && (
                <ModalRow
                  icon={MapPin}
                  label="Location"
                  value={selectedTransaction.location}
                />
              )}
              {selectedTransaction.paymentMethod && (
                <ModalRow
                  icon={CreditCard}
                  label="Payment Method"
                  value={selectedTransaction.paymentMethod}
                />
              )}
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={openDownloadModal}
                className="inline-flex min-h-[40px] items-center justify-center gap-1.5 border border-hairline bg-white px-4 py-2 text-sm font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <Download className="h-3.5 w-3.5" strokeWidth={2.25} />
                Download
              </button>
              <button
                type="button"
                onClick={() => openReportModal(selectedTransaction)}
                className="inline-flex min-h-[40px] items-center justify-center gap-1.5 border border-hairline bg-white px-4 py-2 text-sm font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <AlertCircle className="h-3.5 w-3.5" strokeWidth={2.25} />
                Report a Problem
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download Modal */}
      {showDownloadModal && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowDownloadModal(false)}
        >
          <div
            className="relative w-full max-w-[480px] border border-hairline bg-white p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowDownloadModal(false)}
              aria-label="Close"
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-faint hover:text-deep-accent"
            >
              <X className="h-4 w-4" strokeWidth={2.25} />
            </button>

            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#e7f3f5] text-primary">
                <Download className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <h2 className="font-serif text-xl font-bold text-deep-accent">
                  Download Transactions
                </h2>
                <p className="mt-1 text-sm text-body">
                  Choose a date range for your PDF statement.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-deep-accent">From</label>
                  <input
                    type="date"
                    value={downloadFrom}
                    onChange={(e) => setDownloadFrom(e.target.value)}
                    className="min-h-[40px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-deep-accent">To</label>
                  <input
                    type="date"
                    value={downloadTo}
                    onChange={(e) => setDownloadTo(e.target.value)}
                    className="min-h-[40px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {downloadError && (
                <div className="flex items-start gap-2 border border-[#f5c6cb] bg-[#f8d7da] px-4 py-2.5">
                  <AlertCircle
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#721c24]"
                    strokeWidth={2}
                  />
                  <span className="text-sm text-[#721c24]">{downloadError}</span>
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-hairline pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowDownloadModal(false)}
                  disabled={downloadLoading}
                  className="min-h-[40px] border border-hairline bg-white px-5 py-2 text-sm font-semibold text-deep-accent hover:bg-faint disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={downloadLoading}
                  className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-deep disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {downloadLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.25} />
                      Preparing…
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" strokeWidth={2.25} />
                      Download PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report a Problem Modal */}
      {reportTransaction && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4"
          onClick={closeReportModal}
        >
          <div
            className="relative w-full max-w-[520px] border border-hairline bg-white p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeReportModal}
              aria-label="Close"
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-faint hover:text-deep-accent"
            >
              <X className="h-4 w-4" strokeWidth={2.25} />
            </button>

            {reportSuccess ? (
              <div className="flex flex-col items-center py-4 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center bg-[#e7f3f5]">
                  <CheckCircle2 className="h-8 w-8 text-primary" strokeWidth={1.75} />
                </div>
                <h2 className="font-serif text-xl font-bold text-deep-accent">
                  Report Submitted
                </h2>
                <p className="mx-auto mt-2 max-w-sm text-sm text-body">
                  A designated agent will reach out to you shortly regarding this
                  transaction.
                </p>

                <div className="mt-4 w-full border border-hairline bg-faint px-4 py-3 text-left">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-xs text-muted sm:text-sm">Reference</span>
                    <span className="font-mono text-xs font-semibold text-deep-accent">
                      {reportSuccess.referenceNumber}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-xs text-muted sm:text-sm">Status</span>
                    <span className="text-sm font-semibold text-[#b8860b]">
                      {reportSuccess.status}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeReportModal}
                  className="mt-6 inline-flex min-h-[40px] w-full items-center justify-center bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-deep"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#e7f3f5] text-primary">
                    <AlertCircle className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <div>
                    <h2 className="font-serif text-xl font-bold text-deep-accent">
                      Report a Problem
                    </h2>
                    <p className="mt-1 text-sm text-body">
                      Tell us what&rsquo;s wrong with this transaction.
                    </p>
                  </div>
                </div>

                <div className="mt-5 border border-hairline bg-faint px-4 py-3">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-xs text-muted sm:text-sm">Transaction</span>
                    <span className="text-sm font-semibold text-deep-accent text-right">
                      {reportTransaction.description}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-xs text-muted sm:text-sm">Amount</span>
                    <span
                      className={`text-sm font-semibold ${
                        reportTransaction.amount >= 0
                          ? 'text-primary'
                          : 'text-[#d9534f]'
                      }`}
                    >
                      {reportTransaction.amount >= 0 ? '+' : '-'}
                      {formatCurrency(reportTransaction.amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-xs text-muted sm:text-sm">Date</span>
                    <span className="text-sm font-semibold text-deep-accent">
                      {formatDate(reportTransaction.date)}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-deep-accent">
                    Reason for report
                  </label>
                  <textarea
                    rows="4"
                    placeholder="e.g. I don't recognize this charge."
                    value={reportReason}
                    onChange={(e) => {
                      setReportReason(e.target.value);
                      if (reportError) setReportError('');
                    }}
                    maxLength={2000}
                    className="w-full border border-hairline bg-white p-3 text-sm text-deep-accent outline-none focus:border-primary placeholder:text-muted/60 resize-none"
                  />
                  <p className="text-[11px] text-muted">
                    {reportReason.length} / 2000 characters
                  </p>
                </div>

                {reportError && (
                  <div className="mt-4 flex items-start gap-2 border border-[#f5c6cb] bg-[#f8d7da] px-4 py-2.5">
                    <AlertCircle
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#721c24]"
                      strokeWidth={2}
                    />
                    <span className="text-sm text-[#721c24]">{reportError}</span>
                  </div>
                )}

                <div className="mt-6 flex flex-col-reverse gap-3 border-t border-hairline pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeReportModal}
                    disabled={reportLoading}
                    className="min-h-[40px] border border-hairline bg-white px-5 py-2 text-sm font-semibold text-deep-accent hover:bg-faint disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitReport}
                    disabled={reportLoading || !reportReason.trim()}
                    className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-deep disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {reportLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.25} />
                        Submitting…
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" strokeWidth={2.25} />
                        Submit Report
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable modal row
const ModalRow = ({ icon: Icon, label, value, valueColor = 'text-ink' }) => (
  <div className="flex items-start justify-between gap-4 py-2.5">
    <span className="inline-flex items-center gap-1.5 text-xs text-muted sm:text-sm">
      <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
      {label}
    </span>
    <span className={`text-sm font-semibold text-right ${valueColor}`}>{value}</span>
  </div>
);

export default Transactions;