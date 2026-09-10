// src/pages/Accounts.jsx
import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Plus,
  ChevronRight,
  Search,
  Download,
  X,
  Wallet,
  PiggyBank,
  CreditCard,
  Landmark,
  FileText,
  Bell,
  MessageCircle,
  Phone,
  MapPin,
  HelpCircle,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  mockAccountDetails,
  mockRecentTransactions,
  mockStatements,
  mockAlerts,
  totalBalance,
  availableBalance,
  pendingAmount,
} from '../data/mockAccountsData';

// Helper
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Math.abs(amount));
};

// Helper for account type label
const getAccountTypeLabel = (type) => {
  const map = {
    checking: 'Checking',
    savings: 'Savings',
    credit: 'Credit Card',
    loan: 'Loan',
  };
  return map[type] || type;
};

// Icon per account type
const getAccountIcon = (type) => {
  const map = {
    checking: Wallet,
    savings: PiggyBank,
    credit: CreditCard,
    loan: Landmark,
  };
  return map[type] || Wallet;
};

// Account Card Component
const AccountCard = ({ account, showBalance, onView }) => {
  const Icon = getAccountIcon(account.type);

  const getBalanceDisplay = () => {
    if (account.type === 'credit') {
      return account.currentBalance;
    } else if (account.type === 'loan') {
      return account.outstandingBalance;
    } else {
      return account.availableBalance;
    }
  };

  const getSecondaryInfo = () => {
    if (account.type === 'savings') {
      return `Interest Rate ${account.interestRate}% APY`;
    } else if (account.type === 'credit') {
      return `Available Credit ${formatCurrency(account.availableCredit)}`;
    } else if (account.type === 'loan') {
      return `Next Payment ${formatCurrency(account.nextPayment)} due ${account.nextPaymentDue}`;
    }
    return null;
  };

  return (
    <div className="group flex flex-col border border-hairline bg-white p-5 transition-colors hover:border-primary sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
          <span className="text-xs font-semibold uppercase tracking-wide text-body">
            {getAccountTypeLabel(account.type)}
          </span>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-primary">
          <span className="h-1.5 w-1.5 bg-primary" aria-hidden="true" />
          {account.status}
        </span>
      </div>

      <div className="mt-4 text-sm font-bold text-deep-accent sm:text-base">
        {account.name}
      </div>
      <div className="mt-0.5 text-xs text-muted">•••• {account.lastFour}</div>

      <div className="mt-3 font-serif text-2xl font-bold text-deep-accent">
        {showBalance ? formatCurrency(getBalanceDisplay()) : '•••••••'}
      </div>

      {getSecondaryInfo() && (
        <div className="mt-1 text-xs text-body">{getSecondaryInfo()}</div>
      )}

      <button
        type="button"
        onClick={onView}
        className="mt-4 inline-flex items-center gap-1 self-start border border-primary px-3.5 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        View Account
        <ChevronRight className="h-3 w-3" strokeWidth={2.25} />
      </button>
    </div>
  );
};

// Section header used multiple times
const SectionHeading = ({ title, subtitle }) => (
  <div className="mb-4 flex items-end justify-between gap-3 border-b border-hairline pb-3">
    <div>
      <h2 className="font-serif text-lg font-bold text-deep-accent sm:text-xl">{title}</h2>
      {subtitle && <p className="mt-0.5 text-xs text-muted sm:text-sm">{subtitle}</p>}
    </div>
  </div>
);

const Accounts = () => {
  const [showBalance, setShowBalance] = useState(true);
  const [selectedAccountId, setSelectedAccountId] = useState('chk1');
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('');

  // Get all accounts from categories for easy lookup
  const allAccounts = [
    ...mockAccountDetails.checking,
    ...mockAccountDetails.savings,
    ...mockAccountDetails.creditCards,
    ...mockAccountDetails.loans,
  ];

  // Find selected account
  const selectedAccount = allAccounts.find((acc) => acc.id === selectedAccountId);

  // Get transactions for selected account
  const accountTransactions = mockRecentTransactions
    .filter((tx) => tx.accountId === selectedAccountId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Filter transactions by type (credit/debit) and date
  const filteredTransactions = accountTransactions
    .filter((tx) => {
      if (filterType === 'all') return true;
      if (filterType === 'credit') return tx.amount > 0;
      if (filterType === 'debit') return tx.amount < 0;
      return true;
    })
    .filter((tx) => {
      if (!filterDate) return true;
      return tx.date === filterDate;
    });

  // Toggle balance visibility
  const toggleBalance = () => setShowBalance(!showBalance);

  // Handle account selection
  const handleViewAccount = (accountId) => {
    setSelectedAccountId(accountId);
  };

  const categories = [
    { key: 'checking', title: 'Checking', accounts: mockAccountDetails.checking },
    { key: 'savings', title: 'Savings', accounts: mockAccountDetails.savings },
    { key: 'creditCards', title: 'Credit Cards', accounts: mockAccountDetails.creditCards },
    { key: 'loans', title: 'Loans', accounts: mockAccountDetails.loans },
  ];

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Page Header */}
      <div className="mb-8 flex flex-col gap-4 border-b border-hairline pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold leading-tight text-deep-accent sm:text-3xl">
            Accounts
          </h1>
          <p className="mt-1 text-sm text-body sm:text-base">
            View and manage all your accounts in one place.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex min-h-[44px] items-center justify-center gap-2 bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <Plus className="h-4 w-4" strokeWidth={2.25} />
          Open an Account
        </button>
      </div>

      {/* Total Balance Summary */}
      <section className="mb-10">
        <div className="bg-deep-accent p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/70 sm:text-xs">
              Total Balance
            </span>
            <button
              type="button"
              onClick={toggleBalance}
              aria-label={showBalance ? 'Hide balance' : 'Show balance'}
              className="text-white/75 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              {showBalance ? (
                <Eye className="h-5 w-5" strokeWidth={1.75} />
              ) : (
                <EyeOff className="h-5 w-5" strokeWidth={1.75} />
              )}
            </button>
          </div>

          <div className="mt-3 font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
            {showBalance ? formatCurrency(totalBalance) : '•••••••'}
          </div>

          <div className="mt-6 flex flex-col gap-4 border-t border-white/15 pt-5 sm:flex-row sm:gap-12">
            <div className="flex items-baseline justify-between gap-3 sm:flex-col sm:items-start sm:gap-1">
              <span className="text-xs uppercase tracking-wide text-white/60">Available</span>
              <span className="text-sm font-semibold text-white sm:text-base">
                {showBalance ? formatCurrency(availableBalance) : '•••••••'}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-3 sm:flex-col sm:items-start sm:gap-1">
              <span className="text-xs uppercase tracking-wide text-white/60">Pending</span>
              <span className="text-sm font-semibold text-white sm:text-base">
                {showBalance ? formatCurrency(pendingAmount) : '•••••••'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Account Categories */}
      <section className="mb-12 flex flex-col gap-10">
        {categories.map(({ key, title, accounts }) => (
          <div key={key}>
            <SectionHeading title={title} />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {accounts.map((acc) => (
                <AccountCard
                  key={acc.id}
                  account={acc}
                  showBalance={showBalance}
                  onView={() => handleViewAccount(acc.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Account Detail Panel (when account selected) */}
      {selectedAccount && (
        <section className="mb-12 border-t-2 border-hairline pt-8">
          {/* Detail Header */}
          <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <h2 className="font-serif text-xl font-bold text-deep-accent sm:text-2xl">
                {selectedAccount.name}
                <span className="ml-1 text-sm font-normal text-muted">
                  •••• {selectedAccount.lastFour}
                </span>
              </h2>

              <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:gap-10">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] uppercase tracking-wide text-muted">
                    Current Balance
                  </span>
                  <span className="font-serif text-lg font-bold text-deep-accent sm:text-xl">
                    {showBalance
                      ? formatCurrency(
                          selectedAccount.currentBalance ||
                            selectedAccount.outstandingBalance ||
                            0
                        )
                      : '•••••••'}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] uppercase tracking-wide text-muted">
                    Available Balance
                  </span>
                  <span className="font-serif text-lg font-bold text-deep-accent sm:text-xl">
                    {showBalance
                      ? formatCurrency(
                          selectedAccount.availableBalance ||
                            selectedAccount.availableCredit ||
                            0
                        )
                      : '•••••••'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {['Transfer', 'Pay', 'Deposit', 'More'].map((label) => (
                <button
                  key={label}
                  type="button"
                  className="min-h-[40px] border border-hairline bg-white px-4 py-2 text-sm font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Transaction Filter */}
          <div className="mb-6 flex flex-col gap-4 border-y border-hairline py-4 lg:flex-row lg:flex-wrap lg:items-center lg:gap-6">
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-sm font-medium text-body">Show:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="min-h-[38px] border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
              >
                <option value="all">All Transactions</option>
                <option value="credit">Credits</option>
                <option value="debit">Debits</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="text-sm font-medium text-body">Date:</label>
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

            <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
              <button
                type="button"
                className="inline-flex min-h-[38px] items-center gap-1.5 bg-primary px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <Search className="h-3.5 w-3.5" strokeWidth={2.25} />
                Search
              </button>
              <button
                type="button"
                className="inline-flex min-h-[38px] items-center gap-1.5 border border-hairline bg-white px-4 py-1.5 text-sm font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <Download className="h-3.5 w-3.5" strokeWidth={2.25} />
                Download
              </button>
            </div>
          </div>

          {/* Transaction List */}
          <div className="mb-8 border-t border-hairline">
            {filteredTransactions.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">No transactions found.</p>
            ) : (
              filteredTransactions.map((tx) => {
                const isPositive = tx.amount >= 0;
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between gap-4 border-b border-faint py-3"
                  >
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-semibold text-ink">
                        {tx.description}
                      </span>
                      <span className="truncate text-xs text-muted">{tx.category}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-4">
                      <span className="hidden text-xs text-muted sm:inline">{tx.date}</span>
                      <span
                        className={`text-sm font-semibold ${
                          isPositive ? 'text-primary' : 'text-[#d9534f]'
                        }`}
                      >
                        {isPositive ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Statements & Documents */}
          <div className="mb-8 border-t border-hairline pt-6">
            <div className="mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" strokeWidth={1.75} />
              <h3 className="font-serif text-lg font-bold text-deep-accent sm:text-xl">
                Statements &amp; Documents
              </h3>
            </div>

            <div className="divide-y divide-faint border-t border-hairline">
              {mockStatements.map((stmt, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-6"
                >
                  <span className="text-sm font-semibold text-deep-accent sm:w-40">
                    {stmt.month}
                  </span>
                  <span className="text-sm text-body sm:w-44">{stmt.type}</span>
                  <span
                    className={`text-xs font-semibold uppercase tracking-wide sm:w-28 ${
                      stmt.available ? 'text-primary' : 'text-muted'
                    }`}
                  >
                    {stmt.available ? 'Available' : 'Not available'}
                  </span>
                  <div className="flex gap-4 sm:ml-auto">
                    <button
                      type="button"
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      Download PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Account Alerts */}
          <div className="mb-8 border-t border-hairline pt-6">
            <div className="mb-4 flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" strokeWidth={1.75} />
              <h3 className="font-serif text-lg font-bold text-deep-accent sm:text-xl">
                Account Alerts
              </h3>
            </div>

            <div className="divide-y divide-faint border-t border-hairline">
              {mockAlerts.map((alert, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <span className="text-sm font-medium text-ink">{alert.name}</span>
                  <span
                    className={`text-xs font-bold uppercase tracking-wide ${
                      alert.status === 'ON' ? 'text-primary' : 'text-[#d9534f]'
                    }`}
                  >
                    {alert.status}
                  </span>
                </div>
              ))}
            </div>
          </div>


        </section>
      )}

      {/* Quick Actions */}
      <section className="mb-12 border-t border-hairline pt-8">
        <h2 className="mb-4 font-serif text-lg font-bold text-deep-accent sm:text-xl">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            'Transfer Money',
            'Pay a Bill',
            'Deposit a Check',
            'View Statements',
            'Manage Alerts',
            'Open an Account',
          ].map((label) => (
            <button
              key={label}
              type="button"
              className="flex min-h-[48px] items-center justify-between border border-hairline bg-white px-4 py-3 text-sm font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <span>{label}</span>
              <ArrowRight className="h-4 w-4 text-primary" strokeWidth={2} />
            </button>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Accounts;