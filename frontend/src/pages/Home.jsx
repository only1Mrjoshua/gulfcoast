import React, { useState } from 'react';
import {
  mockAccounts,
  mockTransactions,
  mockUpcomingPayments,
  mockSpendingCategories,
  mockCashFlow,
  mockGoals,
  mockMessages,
  mockCreditScore,
  mockAlerts,
  mockRecommendations,
  totalBalance,
  availableBalance,
  pendingAmount,
} from '../data/mockDashboardData';
import styles from './Home.module.css';

// Helper to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Math.abs(amount));
};

const Home = () => {
  const [showBalance, setShowBalance] = useState(true);
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const toggleBalance = () => setShowBalance(!showBalance);

  return (
    <div className={styles.dashboard}>
      {/* Welcome Section */}
      <section className={styles.welcomeSection}>
        <div className={styles.welcomeLeft}>
          <h1 className={styles.welcomeTitle}>Good morning, Joshua</h1>
          <p className={styles.welcomeSub}>Here's your financial snapshot.</p>
        </div>
        <div className={styles.welcomeDate}>{currentDate}</div>
      </section>

      {/* Total Balance & Financial Snapshot */}
      <section className={styles.balanceSection}>
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

      {/* Accounts */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Accounts</h2>
          <a href="#" className={styles.sectionLink}>View all</a>
        </div>
        <div className={styles.accountGrid}>
          {mockAccounts.map((account) => (
            <div key={account.id} className={styles.accountCard}>
              <div className={styles.accountCardHeader}>
                <span className={styles.accountName}>{account.name}</span>
                <span className={styles.accountLastFour}>•••• {account.lastFour}</span>
              </div>
              <div className={styles.accountBalance}>
                {showBalance ? formatCurrency(account.balance) : '•••••••'}
              </div>
              <div className={styles.accountType}>
                {account.type === 'credit' ? 'Credit Card' : 'Account'}
              </div>
              <a href="#" className={styles.accountAction}>View account</a>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.quickActions}>
          <button className={styles.actionBtn}>Transfer Money</button>
          <button className={styles.actionBtn}>Pay a Bill</button>
          <button className={styles.actionBtn}>Deposit a Check</button>
          <button className={styles.actionBtn}>Send Money</button>
          <button className={styles.actionBtn}>Pay Loan</button>
          <button className={styles.actionBtn}>Manage Card</button>
          <button className={styles.actionBtn}>More</button>
        </div>
      </section>

      {/* Two columns: Recent Transactions & Upcoming Payments */}
      <div className={styles.twoCol}>
        {/* Recent Transactions */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Transactions</h2>
            <a href="#" className={styles.sectionLink}>View all</a>
          </div>
          <div className={styles.transactionList}>
            {mockTransactions.slice(0, 6).map((tx) => (
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
            ))}
          </div>
        </section>

        {/* Upcoming Payments */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Upcoming Payments</h2>
            <a href="#" className={styles.sectionLink}>View all</a>
          </div>
          <div className={styles.paymentList}>
            {mockUpcomingPayments.map((payment) => (
              <div key={payment.id} className={styles.paymentItem}>
                <div className={styles.paymentLeft}>
                  <span className={styles.paymentPayee}>{payment.payee}</span>
                  <span className={styles.paymentDue}>Due {payment.dueDate}</span>
                </div>
                <div className={styles.paymentRight}>
                  <span className={styles.paymentAmount}>{formatCurrency(payment.amount)}</span>
                  {payment.autopay && <span className={styles.autopayBadge}>Autopay ON</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Spending Overview & Cash Flow (two columns) */}
      <div className={styles.twoCol}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Spending Overview</h2>
          <div className={styles.spendingSummary}>
            <div className={styles.spendingTotal}>
              <span className={styles.spendingLabel}>Monthly Spending</span>
              <span className={styles.spendingTotalAmount}>{formatCurrency(2480.36)}</span>
            </div>
            <div className={styles.categoryList}>
              {mockSpendingCategories.map((cat) => (
                <div key={cat.category} className={styles.categoryItem}>
                  <span className={styles.categoryName}>{cat.category}</span>
                  <span className={styles.categoryAmount}>{formatCurrency(cat.amount)}</span>
                  <div className={styles.categoryBar}>
                    <div
                      className={styles.categoryBarFill}
                      style={{ width: `${Math.min((cat.amount / 1000) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Cash Flow</h2>
          <div className={styles.cashFlow}>
            <div className={styles.cashFlowItem}>
              <span className={styles.cfLabel}>Money In</span>
              <span className={styles.cfPositive}>+{formatCurrency(mockCashFlow.moneyIn)}</span>
            </div>
            <div className={styles.cashFlowItem}>
              <span className={styles.cfLabel}>Money Out</span>
              <span className={styles.cfNegative}>-{formatCurrency(mockCashFlow.moneyOut)}</span>
            </div>
            <div className={`${styles.cashFlowItem} ${styles.net}`}>
              <span className={styles.cfLabel}>Net</span>
              <span className={mockCashFlow.net >= 0 ? styles.cfPositive : styles.cfNegative}>
                {/* ✅ FIX: combined expression */}
                {mockCashFlow.net >= 0 ? `+${formatCurrency(mockCashFlow.net)}` : formatCurrency(mockCashFlow.net)}
              </span>
            </div>
          </div>
          <div className={styles.cashFlowChartPlaceholder}>
            {/* Simple chart placeholder – you can embed a simple SVG or use CSS bars */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              {[40, 70, 50, 90, 60, 80, 45, 65, 55, 75].map((val, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ height: `${val}px`, width: '12px', background: '#008296' }}></div>
                  <span style={{ fontSize: '0.6rem', color: '#666' }}>{i+1}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Alerts & Security */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Alerts & Security</h2>
        <div className={styles.alertList}>
          {mockAlerts.map((alert) => (
            <div key={alert.id} className={styles.alertItem}>
              <span className={styles.alertIcon}>🔔</span>
              <span className={styles.alertMessage}>{alert.message}</span>
              <span className={styles.alertDate}>{alert.date}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Credit Score */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Credit Score</h2>
        <div className={styles.creditScore}>
          <div className={styles.scoreNumber}>{mockCreditScore.score}</div>
          <div className={styles.scoreDetails}>
            <div className={styles.scoreRating}>{mockCreditScore.rating}</div>
            <div className={styles.scoreChange}>+{mockCreditScore.change} this month</div>
            <div className={styles.scoreUpdated}>Updated {mockCreditScore.updated}</div>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Cards</h2>
        <div className={styles.cardGrid}>
          <div className={styles.cardItem}>
            <span>Visa •••• 2208</span>
            <div className={styles.cardActions}>
              <button>View</button>
              <button>Freeze</button>
              <button>Pay</button>
              <button>Manage</button>
            </div>
          </div>
          {/* Add more if needed */}
        </div>
      </section>

      {/* Financial Goals */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Financial Goals</h2>
        <div className={styles.goalList}>
          {mockGoals.map((goal) => {
            const progress = Math.min((goal.current / goal.target) * 100, 100);
            return (
              <div key={goal.id} className={styles.goalItem}>
                <div className={styles.goalInfo}>
                  <span className={styles.goalName}>{goal.name}</span>
                  <span className={styles.goalAmount}>
                    {formatCurrency(goal.current)} / {formatCurrency(goal.target)}
                  </span>
                </div>
                <div className={styles.goalBar}>
                  <div className={styles.goalBarFill} style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Customer Support */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Customer Support</h2>
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

export default Home;