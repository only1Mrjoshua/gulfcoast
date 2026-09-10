// src/pages/Insights.jsx
import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  LineChart,
  Repeat,
  Target,
  Lightbulb,
  Store,
  Activity,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  PiggyBank,
  Wallet,
  Scale,
} from 'lucide-react';
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

  const totalSpending = mockSpendingCategories.reduce(
    (sum, cat) => sum + cat.amount,
    0
  );
  const maxCategoryAmount = Math.max(
    ...mockSpendingCategories.map((c) => c.amount)
  );

  // Cash flow data based on view
  const cashFlowData =
    cashFlowView === 'monthly'
      ? mockCashFlowData.monthly
      : mockCashFlowData.weekly;
  const cashFlowMax = Math.max(
    ...cashFlowData.flatMap((d) => [d.income, d.spending])
  );

  const periods = ['This Month', 'Last Month', 'Last 3 Months', 'This Year'];

  // Summary config
  const summaryCards = [
    {
      label: 'Money In',
      value: `+${formatCurrency(mockInsightsSummary.moneyIn)}`,
      color: 'text-primary',
      icon: ArrowDownLeft,
    },
    {
      label: 'Money Out',
      value: `-${formatCurrency(mockInsightsSummary.moneyOut)}`,
      color: 'text-[#d9534f]',
      icon: ArrowUpRight,
    },
    {
      label: 'Net Cash Flow',
      value: `${
        mockInsightsSummary.netCashFlow >= 0 ? '+' : '-'
      }${formatCurrency(mockInsightsSummary.netCashFlow)}`,
      color:
        mockInsightsSummary.netCashFlow >= 0 ? 'text-primary' : 'text-[#d9534f]',
      icon: Scale,
    },
    {
      label: 'Saved',
      value: formatCurrency(mockInsightsSummary.saved),
      color: 'text-primary',
      icon: PiggyBank,
    },
  ];

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 border-b border-hairline pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-2xl font-bold leading-tight text-deep-accent sm:text-3xl">
            Insights
          </h1>
          <p className="mt-1 text-sm text-body sm:text-base">
            Understand your spending, cash flow, and financial habits at a glance.
          </p>
        </div>

        <div className="flex flex-wrap gap-1">
          {periods.map((p) => {
            const isActive = period === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`min-h-[36px] border px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:px-4 sm:text-sm ${
                  isActive
                    ? 'border-primary bg-primary text-white'
                    : 'border-hairline bg-white text-deep-accent hover:bg-faint'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      {/* Financial Summary */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="border border-hairline bg-faint px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted sm:text-xs">
                {label}
              </span>
              <Icon className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
            </div>
            <div className={`mt-1 font-serif text-xl font-bold sm:text-2xl ${color}`}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Spending Overview */}
      <section className="mb-8 border-t border-hairline pt-6">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" strokeWidth={1.75} />
          <h2 className="font-serif text-lg font-bold text-deep-accent sm:text-xl">
            Spending Overview
          </h2>
        </div>

        <div className="border border-hairline bg-white p-5">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <span className="text-sm font-semibold text-deep-accent">
              Total Spending
            </span>
            <span className="font-serif text-lg font-bold text-deep-accent">
              {formatCurrency(totalSpending)}
            </span>
          </div>

          <div className="mt-4 flex flex-col gap-2.5">
            {mockSpendingCategories.map((cat) => (
              <div key={cat.category} className="flex items-center gap-3">
                <div className="flex w-28 shrink-0 items-baseline justify-between gap-2 text-xs sm:w-40 sm:text-sm">
                  <span className="truncate text-body">{cat.category}</span>
                  <span className="shrink-0 font-semibold text-ink">
                    {formatCurrency(cat.amount)}
                  </span>
                </div>
                <div className="h-2 flex-1 bg-faint">
                  <div
                    className="h-full transition-[width] duration-300"
                    style={{
                      width: `${(cat.amount / maxCategoryAmount) * 100}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right text-xs text-muted">
                  {Math.round((cat.amount / totalSpending) * 100)}%
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="mt-5 inline-flex min-h-[38px] items-center gap-1.5 border border-primary bg-white px-4 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            View Transactions
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
          </button>
        </div>
      </section>

      {/* Income Overview */}
      <section className="mb-8 border-t border-hairline pt-6">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" strokeWidth={1.75} />
          <h2 className="font-serif text-lg font-bold text-deep-accent sm:text-xl">
            Income Overview
          </h2>
        </div>

        <div className="border border-hairline bg-white p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col">
              <span className="text-xs text-muted">Income This Month</span>
              <span className="font-serif text-lg font-bold text-deep-accent">
                {formatCurrency(mockIncomeData.currentMonth)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted">Previous Month</span>
              <span className="font-serif text-lg font-bold text-deep-accent">
                {formatCurrency(mockIncomeData.previousMonth)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted">Change</span>
              <span
                className={`font-serif text-lg font-bold ${
                  mockIncomeData.change >= 0 ? 'text-primary' : 'text-[#d9534f]'
                }`}
              >
                {mockIncomeData.change >= 0 ? '+' : '-'}
                {formatCurrency(mockIncomeData.change)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted">Number of Deposits</span>
              <span className="font-serif text-lg font-bold text-deep-accent">
                {mockIncomeData.numberOfDeposits}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-hairline pt-3">
            <span className="text-sm text-muted">Largest Income Source</span>
            <span className="text-sm font-semibold text-deep-accent">
              {mockIncomeData.largestSource}
            </span>
          </div>
        </div>
      </section>

      {/* Cash Flow */}
      <section className="mb-8 border-t border-hairline pt-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <LineChart className="h-4 w-4 text-primary" strokeWidth={1.75} />
            <h2 className="font-serif text-lg font-bold text-deep-accent sm:text-xl">
              Cash Flow
            </h2>
          </div>
          <div className="flex gap-1">
            {['weekly', 'monthly'].map((view) => {
              const isActive = cashFlowView === view;
              return (
                <button
                  key={view}
                  type="button"
                  onClick={() => setCashFlowView(view)}
                  className={`min-h-[32px] border px-3 py-1 text-xs font-semibold capitalize transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:text-sm ${
                    isActive
                      ? 'border-primary bg-primary text-white'
                      : 'border-hairline bg-white text-deep-accent hover:bg-faint'
                  }`}
                >
                  {view}
                </button>
              );
            })}
          </div>
        </div>

        <div className="border border-hairline bg-white p-5">
          {/* Chart */}
          <div className="flex h-[140px] items-end gap-2 pb-4 sm:h-[160px]">
            {cashFlowData.map((item, index) => {
              const incomeHeight = (item.income / cashFlowMax) * 100;
              const spendingHeight = (item.spending / cashFlowMax) * 100;
              const net = item.net;
              const label = cashFlowView === 'monthly' ? item.month : item.week;
              return (
                <div
                  key={index}
                  className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
                >
                  <div className="flex h-full w-full items-end justify-center gap-1">
                    <div
                      className="w-3 bg-primary"
                      style={{ height: `${Math.max(incomeHeight, 2)}%` }}
                      title={`Income: ${formatCurrency(item.income)}`}
                    />
                    <div
                      className="w-3 bg-[#d9534f]"
                      style={{ height: `${Math.max(spendingHeight, 2)}%` }}
                      title={`Spending: ${formatCurrency(item.spending)}`}
                    />
                  </div>
                  <div className="mt-1 truncate text-[10px] text-muted">{label}</div>
                  <div
                    className={`truncate text-[10px] font-semibold ${
                      net >= 0 ? 'text-primary' : 'text-[#d9534f]'
                    }`}
                  >
                    {net >= 0 ? '+' : '-'}
                    {formatCurrency(net)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-3 flex items-center justify-center gap-6 text-xs text-body">
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-3 w-3 bg-primary" aria-hidden="true" />
              Income
            </span>
            <span className="inline-flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 bg-[#d9534f]"
                aria-hidden="true"
              />
              Spending
            </span>
          </div>
        </div>
      </section>

      {/* Spending Trends */}
      <section className="mb-8 border-t border-hairline pt-6">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" strokeWidth={1.75} />
          <h2 className="font-serif text-lg font-bold text-deep-accent sm:text-xl">
            Spending Trends
          </h2>
        </div>

        <div className="border border-hairline bg-white p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col">
              <span className="text-xs text-muted">Comparison</span>
              <span className="text-sm font-semibold text-deep-accent">
                {mockSpendingTrends.comparison}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted">Highest Category</span>
              <span className="text-sm font-semibold text-deep-accent">
                {mockSpendingTrends.highestCategory}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted">Total Transactions</span>
              <span className="text-sm font-semibold text-deep-accent">
                {mockSpendingTrends.totalTransactions}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted">Average Transaction</span>
              <span className="text-sm font-semibold text-deep-accent">
                {formatCurrency(mockSpendingTrends.averageTransaction)}
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 border-t border-hairline pt-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-semibold text-deep-accent">Dining</span>
            <span className="flex flex-wrap items-center gap-3">
              <span className="font-serif text-base font-bold text-deep-accent">
                {formatCurrency(mockSpendingTrends.diningAmount)}
              </span>
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold ${
                  mockSpendingTrends.diningChange >= 0
                    ? 'text-[#d9534f]'
                    : 'text-primary'
                }`}
              >
                {mockSpendingTrends.diningChange >= 0 ? (
                  <TrendingUp className="h-3.5 w-3.5" strokeWidth={2} />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" strokeWidth={2} />
                )}
                {mockSpendingTrends.diningChange >= 0 ? '+' : '-'}
                {Math.abs(mockSpendingTrends.diningChange)}% vs last month
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* Recurring Expenses */}
      <section className="mb-8 border-t border-hairline pt-6">
        <div className="mb-4 flex items-center gap-2">
          <Repeat className="h-4 w-4 text-primary" strokeWidth={1.75} />
          <h2 className="font-serif text-lg font-bold text-deep-accent sm:text-xl">
            Recurring Expenses
          </h2>
        </div>

        <div className="border border-hairline bg-white p-5">
          <div className="flex flex-col divide-y divide-faint">
            {mockRecurringExpenses.map((exp, index) => (
              <div
                key={index}
                className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:gap-4"
              >
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                  {exp.merchant}
                </span>
                <span className="text-sm font-semibold text-deep-accent sm:w-24">
                  {formatCurrency(exp.amount)}
                </span>
                <span className="text-xs text-body sm:w-20 sm:text-sm">
                  {exp.frequency}
                </span>
                <span className="text-xs text-muted sm:text-sm">
                  Next: {formatDate(exp.nextPayment)}
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="mt-4 inline-flex min-h-[36px] items-center gap-1.5 border border-primary bg-white px-4 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:text-sm"
          >
            View Payments
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
          </button>
        </div>
      </section>

      {/* Savings Progress */}
      <section className="mb-8 border-t border-hairline pt-6">
        <div className="mb-4 flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" strokeWidth={1.75} />
          <h2 className="font-serif text-lg font-bold text-deep-accent sm:text-xl">
            Savings Progress
          </h2>
        </div>

        <div className="border border-hairline bg-white p-5">
          <div className="grid grid-cols-1 gap-4 border-b border-hairline pb-4 sm:grid-cols-3">
            <div className="flex flex-col">
              <span className="text-xs text-muted">Total Saved</span>
              <span className="font-serif text-lg font-bold text-deep-accent">
                {formatCurrency(mockSavingsProgress.totalSaved)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted">Active Goals</span>
              <span className="font-serif text-lg font-bold text-deep-accent">
                {mockSavingsProgress.activeGoals}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted">Recent Contribution</span>
              <span className="font-serif text-lg font-bold text-deep-accent">
                {formatCurrency(mockSavingsProgress.recentContributions)}
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-4">
            {mockSavingsProgress.goals.map((goal, idx) => (
              <div key={idx} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm font-medium text-deep-accent">
                    {goal.name}
                  </span>
                  <span className="shrink-0 text-xs text-muted">
                    {formatCurrency(goal.current)} / {formatCurrency(goal.target)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-1.5 flex-1 bg-faint">
                    <div
                      className="h-full bg-primary transition-[width] duration-300"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right text-xs text-muted">
                    {goal.progress}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="mt-5 inline-flex min-h-[36px] items-center gap-1.5 border border-primary bg-white px-4 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:text-sm"
          >
            View Financial Goals
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
          </button>
        </div>
      </section>

      {/* Financial Snapshot */}
      <section className="mb-8 border-t border-hairline pt-6">
        <div className="mb-4 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary" strokeWidth={1.75} />
          <h2 className="font-serif text-lg font-bold text-deep-accent sm:text-xl">
            Your Financial Snapshot
          </h2>
        </div>

        <div className="flex flex-col divide-y divide-faint border border-hairline bg-white px-5">
          {mockFinancialObservations.map((obs, idx) => (
            <div key={idx} className="flex items-start gap-3 py-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center bg-[#e7f3f5] text-primary">
                <Lightbulb className="h-3.5 w-3.5" strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1 text-sm text-body">{obs}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Top Merchants */}
      <section className="mb-8 border-t border-hairline pt-6">
        <div className="mb-4 flex items-center gap-2">
          <Store className="h-4 w-4 text-primary" strokeWidth={1.75} />
          <h2 className="font-serif text-lg font-bold text-deep-accent sm:text-xl">
            Top Merchants
          </h2>
        </div>

        <div className="flex flex-col divide-y divide-faint border border-hairline bg-white px-5">
          {mockTopMerchants.map((merchant, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:gap-4"
            >
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-deep-accent">
                {merchant.merchant}
              </span>
              <span className="text-xs text-muted sm:w-32 sm:text-sm">
                {merchant.category}
              </span>
              <span className="text-sm font-semibold text-deep-accent sm:w-24 sm:text-right">
                {formatCurrency(merchant.amount)}
              </span>
              <span className="text-xs text-muted sm:w-20 sm:text-right">
                {merchant.transactions} txns
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Financial Activity */}
      <section className="mb-8 border-t border-hairline pt-6">
        <div className="mb-4 flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" strokeWidth={1.75} />
          <h2 className="font-serif text-lg font-bold text-deep-accent sm:text-xl">
            Recent Financial Activity
          </h2>
        </div>

        <div className="border border-hairline bg-white p-5">
          <div className="flex flex-col divide-y divide-faint">
            {mockRecentActivity.map((activity, idx) => {
              const isPositive = activity.amount >= 0;
              return (
                <div
                  key={idx}
                  className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:gap-4"
                >
                  <span className="text-xs text-muted sm:w-24 sm:text-sm">
                    {formatDate(activity.date)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                    {activity.description}
                  </span>
                  <span className="text-xs text-muted sm:w-24 sm:text-sm">
                    {activity.category}
                  </span>
                  <span
                    className={`text-sm font-semibold sm:w-24 sm:text-right ${
                      isPositive ? 'text-primary' : 'text-[#d9534f]'
                    }`}
                  >
                    {isPositive ? '+' : '-'}
                    {formatCurrency(activity.amount)}
                  </span>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            className="mt-4 inline-flex min-h-[36px] items-center gap-1.5 border border-primary bg-white px-4 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:text-sm"
          >
            View All Transactions
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.25} />
          </button>
        </div>
      </section>

      {/* Security Notice */}
      <div className="flex items-start gap-3 border border-hairline bg-faint px-4 py-3">
        <ShieldCheck
          className="mt-0.5 h-4 w-4 shrink-0 text-primary"
          strokeWidth={1.75}
        />
        <p className="text-xs text-body sm:text-sm">
          Your financial insights are based on activity across your eligible accounts
          and are available only within your secure banking session.
        </p>
      </div>
    </div>
  );
};

export default Insights;