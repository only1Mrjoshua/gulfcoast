// src/pages/Transactions.jsx
import React, { useState, useMemo } from 'react';
import {
  Download,
  Search,
  SlidersHorizontal,
  X,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
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
} from 'lucide-react';
import {
  mockTransactionAccounts,
  mockTransactions,
  transactionCategories,
} from '../data/mockTransactionsData';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Math.abs(amount));
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getDateGroup = (dateStr) => {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.getTime() === today.getTime()) return 'Today';
  if (date.getTime() === yesterday.getTime()) return 'Yesterday';
  return formatDate(dateStr);
};

const Transactions = () => {
  // State
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('last30');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [transactionType, setTransactionType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter logic — unchanged from original
  const filteredTransactions = useMemo(() => {
    let filtered = mockTransactions;

    if (selectedAccount !== 'all') {
      filtered = filtered.filter((tx) => tx.accountId === selectedAccount);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (tx) =>
          tx.description.toLowerCase().includes(query) ||
          tx.category.toLowerCase().includes(query) ||
          tx.merchant.toLowerCase().includes(query) ||
          tx.referenceNumber.toLowerCase().includes(query)
      );
    }

    if (dateRange !== 'custom') {
      const now = new Date();
      let start = new Date();
      switch (dateRange) {
        case 'today':
          start.setHours(0, 0, 0, 0);
          break;
        case 'last7':
          start.setDate(now.getDate() - 7);
          start.setHours(0, 0, 0, 0);
          break;
        case 'last30':
          start.setDate(now.getDate() - 30);
          start.setHours(0, 0, 0, 0);
          break;
        case 'thismonth':
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'lastmonth':
          start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const end = new Date(now.getFullYear(), now.getMonth(), 0);
          filtered = filtered.filter((tx) => {
            const d = new Date(tx.date + 'T00:00:00');
            return d >= start && d <= end;
          });
          break;
        default:
          break;
      }
      if (dateRange !== 'lastmonth') {
        filtered = filtered.filter((tx) => {
          const d = new Date(tx.date + 'T00:00:00');
          return d >= start;
        });
      }
    } else {
      if (startDate) {
        const start = new Date(startDate + 'T00:00:00');
        filtered = filtered.filter((tx) => {
          const d = new Date(tx.date + 'T00:00:00');
          return d >= start;
        });
      }
      if (endDate) {
        const end = new Date(endDate + 'T00:00:00');
        filtered = filtered.filter((tx) => {
          const d = new Date(tx.date + 'T00:00:00');
          return d <= end;
        });
      }
    }

    if (transactionType !== 'all') {
      filtered = filtered.filter((tx) => tx.type === transactionType);
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((tx) => tx.category === selectedCategory);
    }

    if (minAmount) {
      const min = parseFloat(minAmount);
      if (!isNaN(min)) {
        filtered = filtered.filter((tx) => Math.abs(tx.amount) >= min);
      }
    }
    if (maxAmount) {
      const max = parseFloat(maxAmount);
      if (!isNaN(max)) {
        filtered = filtered.filter((tx) => Math.abs(tx.amount) <= max);
      }
    }

    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    return filtered;
  }, [
    selectedAccount,
    searchQuery,
    dateRange,
    startDate,
    endDate,
    transactionType,
    selectedCategory,
    minAmount,
    maxAmount,
  ]);

  const groupedTransactions = useMemo(() => {
    const groups = {};
    filteredTransactions.forEach((tx) => {
      const key = getDateGroup(tx.date);
      if (!groups[key]) groups[key] = [];
      groups[key].push(tx);
    });
    return groups;
  }, [filteredTransactions]);

  const totalIn = filteredTransactions
    .filter((tx) => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalOut = filteredTransactions
    .filter((tx) => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const net = totalIn - totalOut;
  const count = filteredTransactions.length;

  const handleClearFilters = () => {
    setSelectedAccount('all');
    setSearchQuery('');
    setDateRange('last30');
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

  const summaryItems = [
    { label: 'Money In', value: `+${formatCurrency(totalIn)}`, color: 'text-primary' },
    { label: 'Money Out', value: `-${formatCurrency(totalOut)}`, color: 'text-[#d9534f]' },
    {
      label: 'Net',
      value: `${net >= 0 ? '+' : ''}${formatCurrency(net)}`,
      color: net >= 0 ? 'text-primary' : 'text-[#d9534f]',
    },
    { label: 'Transactions', value: count, color: 'text-deep-accent' },
  ];

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
        <button
          type="button"
          className="inline-flex min-h-[44px] items-center justify-center gap-2 border border-primary bg-white px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <Download className="h-4 w-4" strokeWidth={2.25} />
          Download Transactions
        </button>
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
        {/* Primary filter row */}
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
              {mockTransactionAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
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

        {/* Advanced filters */}
        {showFilters && (
          <div className="mt-4 flex flex-col gap-3 border-t border-hairline pt-4 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="flex flex-col gap-1.5 sm:min-w-[160px]">
              <label className="text-xs font-semibold text-deep-accent">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
              >
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
                {transactionCategories.map((cat) => (
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
        {Object.keys(groupedTransactions).length === 0 ? (
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

            {/* Detail rows */}
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

            {/* Actions */}
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                className="inline-flex min-h-[40px] items-center justify-center gap-1.5 border border-hairline bg-white px-4 py-2 text-sm font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <Download className="h-3.5 w-3.5" strokeWidth={2.25} />
                Download
              </button>
              <button
                type="button"
                className="inline-flex min-h-[40px] items-center justify-center gap-1.5 border border-hairline bg-white px-4 py-2 text-sm font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <AlertCircle className="h-3.5 w-3.5" strokeWidth={2.25} />
                Report a Problem
              </button>
              <button
                type="button"
                className="inline-flex min-h-[40px] items-center justify-center gap-1.5 border border-hairline bg-white px-4 py-2 text-sm font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <Tag className="h-3.5 w-3.5" strokeWidth={2.25} />
                Change Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable modal row with icon + label + value
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