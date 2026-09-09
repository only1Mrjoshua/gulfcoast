// src/pages/Insights.jsx
import React, { useState } from 'react';
import {
  mockInsightsSummary,
  mockSpendingCategories,
  mockIncomeData,
  mockCashFlowData,
  mockSpendingTrends,
  mockRecurringExpenses,
  mockSavingsProgress,
  mockFinancialObservations,
  mockTopMerchants,
  mockRecentActivity,
} from '../data/mockInsightsData';
import styles from './Insights.module.css';

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

const Insights = () => {
  const [period, setPeriod] = useState('This Month');
  const [cashFlowView, setCashFlowView] = useState('monthly');

  const totalSpending = mockSpendingCategories.reduce((sum, cat) => sum + cat.amount, 0);
  const maxCategoryAmount = Math.max(...mockSpendingCategories.map(c => c.amount));

  // Get cash flow data based on view
  const cashFlowData = cashFlowView === 'monthly' ? mockCashFlowData.monthly : mockCashFlowData.weekly;
  const cashFlowMax = Math.max(
    ...cashFlowData.flatMap(d => [d.income, d.spending])
  );

  return (
    <div className={styles.insightsPage}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Insights</h1>
          <p className={styles.pageSubtitle}>
            Understand your spending, cash flow, and financial habits at a glance.
          </p>
        </div>
        <div className={styles.periodSelector}>
          <button
            className={`${styles.periodBtn} ${period === 'This Month' ? styles.active : ''}`}
            onClick={() => setPeriod('This Month')}
          >
            This Month
          </button>
          <button
            className={`${styles.periodBtn} ${period === 'Last Month' ? styles.active : ''}`}
            onClick={() => setPeriod('Last Month')}
          >
            Last Month
          </button>
          <button
            className={`${styles.periodBtn} ${period === 'Last 3 Months' ? styles.active : ''}`}
            onClick={() => setPeriod('Last 3 Months')}
          >
            Last 3 Months
          </button>
          <button
            className={`${styles.periodBtn} ${period === 'This Year' ? styles.active : ''}`}
            onClick={() => setPeriod('This Year')}
          >
            This Year
          </button>
        </div>
      </div>

      {/* Financial Summary */}
      <div className={styles.summarySection}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Money In</span>
          <span className={styles.summaryValuePositive}>
            +{formatCurrency(mockInsightsSummary.moneyIn)}
          </span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Money Out</span>
          <span className={styles.summaryValueNegative}>
            -{formatCurrency(mockInsightsSummary.moneyOut)}
          </span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Net Cash Flow</span>
          <span className={mockInsightsSummary.netCashFlow >= 0 ? styles.summaryValuePositive : styles.summaryValueNegative}>
            {mockInsightsSummary.netCashFlow >= 0 ? '+' : ''}{formatCurrency(mockInsightsSummary.netCashFlow)}
          </span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Saved</span>
          <span className={styles.summaryValuePositive}>
            {formatCurrency(mockInsightsSummary.saved)}
          </span>
        </div>
      </div>

      {/* Spending Overview */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Spending Overview</h2>
        <div className={styles.spendingContainer}>
          <div className={styles.spendingTotal}>
            <span className={styles.spendingTotalLabel}>Total Spending</span>
            <span className={styles.spendingTotalAmount}>{formatCurrency(totalSpending)}</span>
          </div>
          <div className={styles.categoryBars}>
            {mockSpendingCategories.map(cat => (
              <div key={cat.category} className={styles.categoryRow}>
                <div className={styles.categoryInfo}>
                  <span className={styles.categoryName}>{cat.category}</span>
                  <span className={styles.categoryAmount}>{formatCurrency(cat.amount)}</span>
                </div>
                <div className={styles.categoryBar}>
                  <div
                    className={styles.categoryFill}
                    style={{
                      width: `${(cat.amount / maxCategoryAmount) * 100}%`,
                      background: cat.color,
                    }}
                  />
                </div>
                <span className={styles.categoryPercent}>
                  {Math.round((cat.amount / totalSpending) * 100)}%
                </span>
              </div>
            ))}
          </div>
          <button className={styles.viewTransactionsBtn}>View Transactions</button>
        </div>
      </section>

      {/* Income Overview */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Income Overview</h2>
        <div className={styles.incomeContainer}>
          <div className={styles.incomeGrid}>
            <div className={styles.incomeItem}>
              <span className={styles.incomeLabel}>Income This Month</span>
              <span className={styles.incomeValue}>{formatCurrency(mockIncomeData.currentMonth)}</span>
            </div>
            <div className={styles.incomeItem}>
              <span className={styles.incomeLabel}>Previous Month</span>
              <span className={styles.incomeValue}>{formatCurrency(mockIncomeData.previousMonth)}</span>
            </div>
            <div className={styles.incomeItem}>
              <span className={styles.incomeLabel}>Change</span>
              <span className={mockIncomeData.change >= 0 ? styles.positive : styles.negative}>
                {mockIncomeData.change >= 0 ? '+' : ''}{formatCurrency(mockIncomeData.change)}
              </span>
            </div>
            <div className={styles.incomeItem}>
              <span className={styles.incomeLabel}>Number of Deposits</span>
              <span className={styles.incomeValue}>{mockIncomeData.numberOfDeposits}</span>
            </div>
          </div>
          <div className={styles.incomeSource}>
            <span className={styles.incomeSourceLabel}>Largest Income Source</span>
            <span className={styles.incomeSourceValue}>{mockIncomeData.largestSource}</span>
          </div>
        </div>
      </section>

      {/* Cash Flow */}
      <section className={styles.section}>
        <div className={styles.cashFlowHeader}>
          <h2 className={styles.sectionTitle}>Cash Flow</h2>
          <div className={styles.cashFlowToggle}>
            <button
              className={`${styles.toggleBtn} ${cashFlowView === 'weekly' ? styles.active : ''}`}
              onClick={() => setCashFlowView('weekly')}
            >
              Weekly
            </button>
            <button
              className={`${styles.toggleBtn} ${cashFlowView === 'monthly' ? styles.active : ''}`}
              onClick={() => setCashFlowView('monthly')}
            >
              Monthly
            </button>
          </div>
        </div>
        <div className={styles.cashFlowContainer}>
          <div className={styles.cashFlowChart}>
            {cashFlowData.map((item, index) => {
              const incomeHeight = (item.income / cashFlowMax) * 100;
              const spendingHeight = (item.spending / cashFlowMax) * 100;
              const net = item.net;
              const label = cashFlowView === 'monthly' ? item.month : item.week;
              return (
                <div key={index} className={styles.cashFlowBarGroup}>
                  <div className={styles.cashFlowBars}>
                    <div
                      className={styles.cashFlowIncome}
                      style={{ height: `${Math.max(incomeHeight, 2)}%` }}
                      title={`Income: ${formatCurrency(item.income)}`}
                    />
                    <div
                      className={styles.cashFlowSpending}
                      style={{ height: `${Math.max(spendingHeight, 2)}%` }}
                      title={`Spending: ${formatCurrency(item.spending)}`}
                    />
                  </div>
                  <div className={styles.cashFlowLabel}>{label}</div>
                  <div className={styles.cashFlowNet}>
                    {net >= 0 ? '+' : ''}{formatCurrency(net)}
                  </div>
                </div>
              );
            })}
          </div>
          <div className={styles.cashFlowLegend}>
            <span><span className={styles.legendIncome}></span> Income</span>
            <span><span className={styles.legendSpending}></span> Spending</span>
          </div>
        </div>
      </section>

      {/* Spending Trends */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Spending Trends</h2>
        <div className={styles.trendsContainer}>
          <div className={styles.trendsGrid}>
            <div className={styles.trendItem}>
              <span className={styles.trendLabel}>Comparison</span>
              <span className={styles.trendValue}>{mockSpendingTrends.comparison}</span>
            </div>
            <div className={styles.trendItem}>
              <span className={styles.trendLabel}>Highest Category</span>
              <span className={styles.trendValue}>{mockSpendingTrends.highestCategory}</span>
            </div>
            <div className={styles.trendItem}>
              <span className={styles.trendLabel}>Total Transactions</span>
              <span className={styles.trendValue}>{mockSpendingTrends.totalTransactions}</span>
            </div>
            <div className={styles.trendItem}>
              <span className={styles.trendLabel}>Average Transaction</span>
              <span className={styles.trendValue}>{formatCurrency(mockSpendingTrends.averageTransaction)}</span>
            </div>
          </div>
          <div className={styles.trendHighlight}>
            <span className={styles.trendHighlightLabel}>Dining</span>
            <span className={styles.trendHighlightValue}>
              {formatCurrency(mockSpendingTrends.diningAmount)}
              <span className={mockSpendingTrends.diningChange >= 0 ? styles.highlightPositive : styles.highlightNegative}>
                {mockSpendingTrends.diningChange >= 0 ? '+' : ''}{mockSpendingTrends.diningChange}% vs last month
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* Recurring Expenses */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Recurring Expenses</h2>
        <div className={styles.recurringContainer}>
          <div className={styles.recurringList}>
            {mockRecurringExpenses.map((exp, index) => (
              <div key={index} className={styles.recurringItem}>
                <span className={styles.recurringMerchant}>{exp.merchant}</span>
                <span className={styles.recurringAmount}>{formatCurrency(exp.amount)}</span>
                <span className={styles.recurringFrequency}>{exp.frequency}</span>
                <span className={styles.recurringNext}>Next: {formatDate(exp.nextPayment)}</span>
              </div>
            ))}
          </div>
          <button className={styles.viewPaymentsBtn}>View Payments</button>
        </div>
      </section>

      {/* Savings Progress */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Savings Progress</h2>
        <div className={styles.savingsContainer}>
          <div className={styles.savingsSummary}>
            <div className={styles.savingsItem}>
              <span className={styles.savingsLabel}>Total Saved</span>
              <span className={styles.savingsValue}>{formatCurrency(mockSavingsProgress.totalSaved)}</span>
            </div>
            <div className={styles.savingsItem}>
              <span className={styles.savingsLabel}>Active Goals</span>
              <span className={styles.savingsValue}>{mockSavingsProgress.activeGoals}</span>
            </div>
            <div className={styles.savingsItem}>
              <span className={styles.savingsLabel}>Recent Contribution</span>
              <span className={styles.savingsValue}>{formatCurrency(mockSavingsProgress.recentContributions)}</span>
            </div>
          </div>
          <div className={styles.savingsGoals}>
            {mockSavingsProgress.goals.map((goal, idx) => (
              <div key={idx} className={styles.savingsGoal}>
                <div className={styles.savingsGoalInfo}>
                  <span className={styles.savingsGoalName}>{goal.name}</span>
                  <span className={styles.savingsGoalAmount}>
                    {formatCurrency(goal.current)} / {formatCurrency(goal.target)}
                  </span>
                </div>
                <div className={styles.savingsGoalBar}>
                  <div
                    className={styles.savingsGoalFill}
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
                <span className={styles.savingsGoalPercent}>{goal.progress}%</span>
              </div>
            ))}
          </div>
          <button className={styles.viewGoalsBtn}>View Financial Goals</button>
        </div>
      </section>

      {/* Financial Observations */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Your Financial Snapshot</h2>
        <div className={styles.observationsContainer}>
          {mockFinancialObservations.map((obs, idx) => (
            <div key={idx} className={styles.observationItem}>
              <span className={styles.observationIcon}>💡</span>
              <span className={styles.observationText}>{obs}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Top Merchants */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Top Merchants</h2>
        <div className={styles.merchantsContainer}>
          {mockTopMerchants.map((merchant, idx) => (
            <div key={idx} className={styles.merchantItem}>
              <span className={styles.merchantName}>{merchant.merchant}</span>
              <span className={styles.merchantCategory}>{merchant.category}</span>
              <span className={styles.merchantAmount}>{formatCurrency(merchant.amount)}</span>
              <span className={styles.merchantTransactions}>{merchant.transactions} txns</span>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Financial Activity */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Recent Financial Activity</h2>
        <div className={styles.activityContainer}>
          {mockRecentActivity.map((activity, idx) => (
            <div key={idx} className={styles.activityItem}>
              <span className={styles.activityDate}>{formatDate(activity.date)}</span>
              <span className={styles.activityDescription}>{activity.description}</span>
              <span className={styles.activityCategory}>{activity.category}</span>
              <span className={`${styles.activityAmount} ${activity.amount >= 0 ? styles.positive : styles.negative}`}>
                {activity.amount >= 0 ? '+' : ''}{formatCurrency(activity.amount)}
              </span>
            </div>
          ))}
          <button className={styles.viewAllActivityBtn}>View All Transactions</button>
        </div>
      </section>

      {/* Security Notice */}
      <div className={styles.securityNotice}>
        <span className={styles.securityIcon}>🔒</span>
        <span className={styles.securityText}>
          Your financial insights are based on activity across your eligible accounts and are available only within your secure banking session.
        </span>
      </div>

      {/* Help */}
      <section className={styles.supportSection}>
        <h3 className={styles.supportTitle}>Questions about your financial activity?</h3>
        <div className={styles.supportOptions}>
          <button>Contact Support</button>
          <button>Secure Message</button>
          <button>Help Center</button>
        </div>
      </section>
    </div>
  );
};

export default Insights;