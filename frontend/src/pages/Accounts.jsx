// src/pages/Accounts.jsx
import React, { useState } from 'react';
import {
  mockAccountDetails,
  mockRecentTransactions,
  mockStatements,
  mockAlerts,
  totalBalance,
  availableBalance,
  pendingAmount,
} from '../data/mockAccountsData';
import styles from './Accounts.module.css';

// Helper
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Math.abs(amount));
};

const Accounts = () => {
  const [showBalance, setShowBalance] = useState(true);
  const [selectedAccountId, setSelectedAccountId] = useState('chk1'); // default to first checking
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
  const selectedAccount = allAccounts.find(acc => acc.id === selectedAccountId);

  // Get transactions for selected account
  const accountTransactions = mockRecentTransactions
    .filter(tx => tx.accountId === selectedAccountId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Filter transactions by type (credit/debit) and date
  const filteredTransactions = accountTransactions.filter(tx => {
    if (filterType === 'all') return true;
    if (filterType === 'credit') return tx.amount > 0;
    if (filterType === 'debit') return tx.amount < 0;
    return true;
  }).filter(tx => {
    if (!filterDate) return true;
    return tx.date === filterDate;
  });

  // Toggle balance visibility
  const toggleBalance = () => setShowBalance(!showBalance);

  // Handle account selection
  const handleViewAccount = (accountId) => {
    setSelectedAccountId(accountId);
  };

  // Get account type label
  const getAccountTypeLabel = (type) => {
    const map = {
      checking: 'Checking',
      savings: 'Savings',
      credit: 'Credit Card',
      loan: 'Loan',
    };
    return map[type] || type;
  };

  return (
    <div className={styles.accountsPage}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Accounts</h1>
          <p className={styles.pageSubtitle}>View and manage all your accounts in one place.</p>
        </div>
        <button className={styles.primaryAction}>+ Open an Account</button>
      </div>

      {/* Total Balance Summary */}
      <section className={styles.balanceSummary}>
        <div className={styles.balanceCard}>
          <div className={styles.balanceHeader}>
            <span className={styles.balanceLabel}>Total Balance</span>
            <button className={styles.eyeButton} onClick={toggleBalance}>
              {showBalance ? '👁️' : '🔒'}
            </button>
          </div>
          <div className={styles.balanceAmount}>
            {showBalance ? formatCurrency(totalBalance) : '•••••••'}
          </div>
          <div className={styles.balanceDetails}>
            <div className={styles.balanceDetailItem}>
              <span className={styles.detailLabel}>Available</span>
              <span className={styles.detailValue}>
                {showBalance ? formatCurrency(availableBalance) : '•••••••'}
              </span>
            </div>
            <div className={styles.balanceDetailItem}>
              <span className={styles.detailLabel}>Pending</span>
              <span className={styles.detailValue}>
                {showBalance ? formatCurrency(pendingAmount) : '•••••••'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Account Categories */}
      <section className={styles.accountsSection}>
        {/* Checking */}
        <div className={styles.categoryGroup}>
          <h2 className={styles.categoryTitle}>Checking</h2>
          <div className={styles.accountCards}>
            {mockAccountDetails.checking.map(acc => (
              <AccountCard
                key={acc.id}
                account={acc}
                showBalance={showBalance}
                onView={() => handleViewAccount(acc.id)}
              />
            ))}
          </div>
        </div>

        {/* Savings */}
        <div className={styles.categoryGroup}>
          <h2 className={styles.categoryTitle}>Savings</h2>
          <div className={styles.accountCards}>
            {mockAccountDetails.savings.map(acc => (
              <AccountCard
                key={acc.id}
                account={acc}
                showBalance={showBalance}
                onView={() => handleViewAccount(acc.id)}
              />
            ))}
          </div>
        </div>

        {/* Credit Cards */}
        <div className={styles.categoryGroup}>
          <h2 className={styles.categoryTitle}>Credit Cards</h2>
          <div className={styles.accountCards}>
            {mockAccountDetails.creditCards.map(acc => (
              <AccountCard
                key={acc.id}
                account={acc}
                showBalance={showBalance}
                onView={() => handleViewAccount(acc.id)}
              />
            ))}
          </div>
        </div>

        {/* Loans */}
        <div className={styles.categoryGroup}>
          <h2 className={styles.categoryTitle}>Loans</h2>
          <div className={styles.accountCards}>
            {mockAccountDetails.loans.map(acc => (
              <AccountCard
                key={acc.id}
                account={acc}
                showBalance={showBalance}
                onView={() => handleViewAccount(acc.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Account Detail Panel (when account selected) */}
      {selectedAccount && (
        <section className={styles.detailPanel}>
          <div className={styles.detailHeader}>
            <div className={styles.detailHeaderLeft}>
              <h2 className={styles.detailTitle}>
                {selectedAccount.name}
                <span className={styles.detailLastFour}> •••• {selectedAccount.lastFour}</span>
              </h2>
              <div className={styles.detailBalances}>
                <div className={styles.detailBalanceItem}>
                  <span className={styles.detailBalanceLabel}>Current Balance</span>
                  <span className={styles.detailBalanceAmount}>
                    {showBalance ? formatCurrency(selectedAccount.currentBalance || selectedAccount.outstandingBalance || 0) : '•••••••'}
                  </span>
                </div>
                <div className={styles.detailBalanceItem}>
                  <span className={styles.detailBalanceLabel}>Available Balance</span>
                  <span className={styles.detailBalanceAmount}>
                    {showBalance ? formatCurrency(selectedAccount.availableBalance || selectedAccount.availableCredit || 0) : '•••••••'}
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.detailActions}>
              <button className={styles.actionButton}>Transfer</button>
              <button className={styles.actionButton}>Pay</button>
              <button className={styles.actionButton}>Deposit</button>
              <button className={styles.actionButton}>More</button>
            </div>
          </div>

          {/* Transaction Filter */}
          <div className={styles.filterBar}>
            <div className={styles.filterGroup}>
              <label>Show:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Transactions</option>
                <option value="credit">Credits</option>
                <option value="debit">Debits</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label>Date:</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className={styles.filterInput}
              />
              {filterDate && (
                <button
                  className={styles.clearFilter}
                  onClick={() => setFilterDate('')}
                >
                  Clear
                </button>
              )}
            </div>
            <div className={styles.filterGroup}>
              <button className={styles.searchButton}>Search</button>
              <button className={styles.downloadButton}>Download</button>
            </div>
          </div>

          {/* Transaction List */}
          <div className={styles.transactionList}>
            {filteredTransactions.length === 0 ? (
              <p className={styles.noTransactions}>No transactions found.</p>
            ) : (
              filteredTransactions.map((tx) => (
                <div key={tx.id} className={styles.transactionItem}>
                  <div className={styles.txLeft}>
                    <span className={styles.txDescription}>{tx.description}</span>
                    <span className={styles.txCategory}>{tx.category}</span>
                  </div>
                  <div className={styles.txRight}>
                    <span className={styles.txDate}>{tx.date}</span>
                    <span className={`${styles.txAmount} ${tx.amount >= 0 ? styles.positive : styles.negative}`}>
                      {tx.amount >= 0 ? '+' : ''}{formatCurrency(tx.amount)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Statements & Documents */}
          <div className={styles.statementsSection}>
            <h3 className={styles.statementsTitle}>Statements & Documents</h3>
            <div className={styles.statementsList}>
              {mockStatements.map((stmt, idx) => (
                <div key={idx} className={styles.statementItem}>
                  <span className={styles.statementMonth}>{stmt.month}</span>
                  <span className={styles.statementType}>{stmt.type}</span>
                  <span className={styles.statementStatus}>
                    {stmt.available ? 'Available' : 'Not available'}
                  </span>
                  <div className={styles.statementActions}>
                    <button className={styles.statementActionBtn}>View</button>
                    <button className={styles.statementActionBtn}>Download PDF</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Account Alerts */}
          <div className={styles.alertsSection}>
            <h3 className={styles.alertsTitle}>Account Alerts</h3>
            <div className={styles.alertsList}>
              {mockAlerts.map((alert, idx) => (
                <div key={idx} className={styles.alertItem}>
                  <span className={styles.alertName}>{alert.name}</span>
                  <span className={`${styles.alertStatus} ${alert.status === 'ON' ? styles.statusOn : styles.statusOff}`}>
                    {alert.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Account Management */}
          <div className={styles.managementSection}>
            <h3 className={styles.managementTitle}>Account Management</h3>
            <div className={styles.managementLinks}>
              <a href="#">Account Details</a>
              <a href="#">Account & Routing Number</a>
              <a href="#">Statements</a>
              <a href="#">Transaction History</a>
              <a href="#">Direct Deposit Information</a>
              <a href="#">Automatic Payments</a>
              <a href="#">Transfers</a>
              <a href="#">Download Statements</a>
              <a href="#">Rename Account</a>
              <a href="#">Manage Alerts</a>
              <a href="#">Account Preferences</a>
            </div>
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section className={styles.quickActionsSection}>
        <h2 className={styles.quickActionsTitle}>Quick Actions</h2>
        <div className={styles.quickActions}>
          <button className={styles.quickActionBtn}>Transfer Money</button>
          <button className={styles.quickActionBtn}>Pay a Bill</button>
          <button className={styles.quickActionBtn}>Deposit a Check</button>
          <button className={styles.quickActionBtn}>View Statements</button>
          <button className={styles.quickActionBtn}>Manage Alerts</button>
          <button className={styles.quickActionBtn}>Open an Account</button>
        </div>
      </section>

      {/* Open New Account Section */}
      <section className={styles.openAccountSection}>
        <h3 className={styles.openAccountTitle}>Looking for another account?</h3>
        <p className={styles.openAccountText}>
          Explore checking, savings, credit card and lending options designed around your financial needs.
        </p>
        <button className={styles.openAccountBtn}>Explore Accounts</button>
      </section>

      {/* Help / Support */}
      <section className={styles.supportSection}>
        <h3 className={styles.supportTitle}>Help & Support</h3>
        <div className={styles.supportOptions}>
          <button>Message Us</button>
          <button>Call Us</button>
          <button>Visit a Branch</button>
          <button>Help Center</button>
        </div>
      </section>
    </div>
  );
};

// Account Card Component
const AccountCard = ({ account, showBalance, onView }) => {
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
    <div className={styles.accountCard}>
      <div className={styles.cardHeader}>
        <div className={styles.cardType}>{getAccountTypeLabel(account.type)}</div>
        <div className={styles.cardStatus}>{account.status}</div>
      </div>
      <div className={styles.cardName}>{account.name}</div>
      <div className={styles.cardLastFour}>•••• {account.lastFour}</div>
      <div className={styles.cardBalance}>
        {showBalance ? formatCurrency(getBalanceDisplay()) : '•••••••'}
      </div>
      {getSecondaryInfo() && (
        <div className={styles.cardSecondary}>{getSecondaryInfo()}</div>
      )}
      <button className={styles.cardAction} onClick={onView}>
        View Account
      </button>
    </div>
  );
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

export default Accounts;