// src/pages/Transactions.jsx
import React, { useState, useMemo } from 'react';
import {
  mockTransactionAccounts,
  mockTransactions,
  transactionCategories,
} from '../data/mockTransactionsData';
import styles from './Transactions.module.css';

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
  today.setHours(0,0,0,0);
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
  const [dateRange, setDateRange] = useState('last30'); // 'today' | 'last7' | 'last30' | 'thismonth' | 'lastmonth' | 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [transactionType, setTransactionType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter logic
  const filteredTransactions = useMemo(() => {
    let filtered = mockTransactions;

    // Account filter
    if (selectedAccount !== 'all') {
      filtered = filtered.filter(tx => tx.accountId === selectedAccount);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(tx =>
        tx.description.toLowerCase().includes(query) ||
        tx.category.toLowerCase().includes(query) ||
        tx.merchant.toLowerCase().includes(query) ||
        tx.referenceNumber.toLowerCase().includes(query)
      );
    }

    // Date filter
    if (dateRange !== 'custom') {
      const now = new Date();
      let start = new Date();
      switch (dateRange) {
        case 'today':
          start.setHours(0,0,0,0);
          break;
        case 'last7':
          start.setDate(now.getDate() - 7);
          start.setHours(0,0,0,0);
          break;
        case 'last30':
          start.setDate(now.getDate() - 30);
          start.setHours(0,0,0,0);
          break;
        case 'thismonth':
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'lastmonth':
          start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const end = new Date(now.getFullYear(), now.getMonth(), 0);
          filtered = filtered.filter(tx => {
            const d = new Date(tx.date + 'T00:00:00');
            return d >= start && d <= end;
          });
          // We handle differently, but for simplicity we'll just filter by start date
          break;
        default:
          break;
      }
      if (dateRange !== 'lastmonth') {
        filtered = filtered.filter(tx => {
          const d = new Date(tx.date + 'T00:00:00');
          return d >= start;
        });
      }
    } else {
      // Custom range
      if (startDate) {
        const start = new Date(startDate + 'T00:00:00');
        filtered = filtered.filter(tx => {
          const d = new Date(tx.date + 'T00:00:00');
          return d >= start;
        });
      }
      if (endDate) {
        const end = new Date(endDate + 'T00:00:00');
        filtered = filtered.filter(tx => {
          const d = new Date(tx.date + 'T00:00:00');
          return d <= end;
        });
      }
    }

    // Transaction type filter
    if (transactionType !== 'all') {
      filtered = filtered.filter(tx => tx.type === transactionType);
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(tx => tx.category === selectedCategory);
    }

    // Amount filter
    if (minAmount) {
      const min = parseFloat(minAmount);
      if (!isNaN(min)) {
        filtered = filtered.filter(tx => Math.abs(tx.amount) >= min);
      }
    }
    if (maxAmount) {
      const max = parseFloat(maxAmount);
      if (!isNaN(max)) {
        filtered = filtered.filter(tx => Math.abs(tx.amount) <= max);
      }
    }

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    return filtered;
  }, [selectedAccount, searchQuery, dateRange, startDate, endDate, transactionType, selectedCategory, minAmount, maxAmount]);

  // Group by date
  const groupedTransactions = useMemo(() => {
    const groups = {};
    filteredTransactions.forEach(tx => {
      const key = getDateGroup(tx.date);
      if (!groups[key]) groups[key] = [];
      groups[key].push(tx);
    });
    return groups;
  }, [filteredTransactions]);

  // Summary calculations
  const totalIn = filteredTransactions
    .filter(tx => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalOut = filteredTransactions
    .filter(tx => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const net = totalIn - totalOut;
  const count = filteredTransactions.length;

  // Handlers
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

  return (
    <div className={styles.transactionsPage}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Transactions</h1>
          <p className={styles.pageSubtitle}>View and search your recent account activity.</p>
        </div>
        <button className={styles.downloadBtn}>Download Transactions</button>
      </div>

      {/* Summary */}
      <div className={styles.summarySection}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Money In</span>
          <span className={styles.summaryValuePositive}>+{formatCurrency(totalIn)}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Money Out</span>
          <span className={styles.summaryValueNegative}>-{formatCurrency(totalOut)}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Net</span>
          <span className={net >= 0 ? styles.summaryValuePositive : styles.summaryValueNegative}>
            {net >= 0 ? '+' : ''}{formatCurrency(net)}
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Transactions</span>
          <span className={styles.summaryValue}>{count}</span>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersBar}>
        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <label htmlFor="accountSelect">Account</label>
            <select
              id="accountSelect"
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className={styles.filterSelect}
            >
              {mockTransactionAccounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="searchInput">Search</label>
            <input
              type="text"
              id="searchInput"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.filterInput}
            />
          </div>

          <button
            className={styles.toggleFiltersBtn}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'More Filters'}
          </button>
        </div>

        {showFilters && (
          <div className={styles.advancedFilters}>
            <div className={styles.filterGroup}>
              <label>Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className={styles.filterSelect}
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
              <div className={styles.filterGroup}>
                <label>From</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={styles.filterInput}
                />
                <label>To</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={styles.filterInput}
                />
              </div>
            )}

            <div className={styles.filterGroup}>
              <label>Type</label>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                className={styles.filterSelect}
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

            <div className={styles.filterGroup}>
              <label>Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={styles.filterSelect}
              >
                {transactionCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Min Amount</label>
              <input
                type="number"
                placeholder="0.00"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                className={styles.filterInput}
                step="0.01"
              />
            </div>
            <div className={styles.filterGroup}>
              <label>Max Amount</label>
              <input
                type="number"
                placeholder="0.00"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                className={styles.filterInput}
                step="0.01"
              />
            </div>

            <button className={styles.clearFiltersBtn} onClick={handleClearFilters}>
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Transaction List */}
      <div className={styles.transactionListContainer}>
        {Object.keys(groupedTransactions).length === 0 ? (
          <div className={styles.emptyState}>
            <p>No transactions found</p>
            <p className={styles.emptySub}>Try changing your search or filter criteria.</p>
            <button className={styles.clearFiltersBtn} onClick={handleClearFilters}>
              Clear Filters
            </button>
          </div>
        ) : (
          Object.entries(groupedTransactions).map(([dateGroup, txs]) => (
            <div key={dateGroup} className={styles.dateGroup}>
              <h3 className={styles.dateGroupTitle}>{dateGroup}</h3>
              <div className={styles.transactionList}>
                {txs.map(tx => (
                  <div
                    key={tx.id}
                    className={styles.transactionItem}
                    onClick={() => handleTransactionClick(tx)}
                  >
                    <div className={styles.txLeft}>
                      <span className={styles.txDescription}>{tx.description}</span>
                      <span className={styles.txAccount}>{tx.accountName}</span>
                      <span className={styles.txCategory}>{tx.category}</span>
                      {tx.status === 'Pending' && (
                        <span className={styles.txStatusPending}>Pending</span>
                      )}
                    </div>
                    <div className={styles.txRight}>
                      <span className={styles.txAmount}>
                        {tx.amount >= 0 ? '+' : ''}{formatCurrency(tx.amount)}
                      </span>
                      <span className={styles.txBalance}>{formatCurrency(tx.balance)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Statements link */}
      <div className={styles.statementsLink}>
        <span>Looking for your monthly statement?</span>
        <a href="/statements">View Statements</a>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className={styles.modalOverlay} onClick={closeDetail}>
          <div className={styles.modalPanel} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={closeDetail}>×</button>
            <div className={styles.modalContent}>
              <h2 className={styles.modalTitle}>{selectedTransaction.description}</h2>
              <div className={styles.modalRow}>
                <span className={styles.modalLabel}>Amount</span>
                <span className={`${styles.modalValue} ${selectedTransaction.amount >= 0 ? styles.positive : styles.negative}`}>
                  {selectedTransaction.amount >= 0 ? '+' : ''}{formatCurrency(selectedTransaction.amount)}
                </span>
              </div>
              <div className={styles.modalRow}>
                <span className={styles.modalLabel}>Date</span>
                <span className={styles.modalValue}>{formatDate(selectedTransaction.date)}</span>
              </div>
              <div className={styles.modalRow}>
                <span className={styles.modalLabel}>Account</span>
                <span className={styles.modalValue}>{selectedTransaction.accountName}</span>
              </div>
              <div className={styles.modalRow}>
                <span className={styles.modalLabel}>Category</span>
                <span className={styles.modalValue}>{selectedTransaction.category}</span>
              </div>
              <div className={styles.modalRow}>
                <span className={styles.modalLabel}>Transaction Type</span>
                <span className={styles.modalValue}>{selectedTransaction.type.charAt(0).toUpperCase() + selectedTransaction.type.slice(1)}</span>
              </div>
              <div className={styles.modalRow}>
                <span className={styles.modalLabel}>Status</span>
                <span className={`${styles.modalValue} ${selectedTransaction.status === 'Pending' ? styles.statusPending : styles.statusCompleted}`}>
                  {selectedTransaction.status}
                </span>
              </div>
              <div className={styles.modalRow}>
                <span className={styles.modalLabel}>Reference Number</span>
                <span className={styles.modalValue}>{selectedTransaction.referenceNumber}</span>
              </div>
              {selectedTransaction.merchant && (
                <div className={styles.modalRow}>
                  <span className={styles.modalLabel}>Merchant</span>
                  <span className={styles.modalValue}>{selectedTransaction.merchant}</span>
                </div>
              )}
              {selectedTransaction.location && (
                <div className={styles.modalRow}>
                  <span className={styles.modalLabel}>Location</span>
                  <span className={styles.modalValue}>{selectedTransaction.location}</span>
                </div>
              )}
              {selectedTransaction.paymentMethod && (
                <div className={styles.modalRow}>
                  <span className={styles.modalLabel}>Payment Method</span>
                  <span className={styles.modalValue}>{selectedTransaction.paymentMethod}</span>
                </div>
              )}
              <div className={styles.modalActions}>
                <button className={styles.modalAction}>Download</button>
                <button className={styles.modalAction}>Report a Problem</button>
                <button className={styles.modalAction}>Change Category</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Transactions;