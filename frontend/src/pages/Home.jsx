import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Bell,
  ArrowRight,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Receipt,
  FileText,
  Send,
  Landmark,
  CreditCard,
  TrendingUp,
  Wallet,
  CalendarClock,
} from 'lucide-react';
import {
  mockAccounts,
  mockTransactions,
  mockUpcomingPayments,
  mockSpendingCategories,
  mockCashFlow,
  mockGoals,
  mockCreditScore,
  mockAlerts,
  totalBalance,
  availableBalance,
  pendingAmount,
} from '../data/mockDashboardData';

// Helper to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Math.abs(amount));
};

const quickActions = [
  { label: 'Transfer Money', icon: ArrowLeftRight, to: '/transfers' },
  { label: 'Pay a Bill', icon: Receipt, to: '/payments' },
  { label: 'Deposit a Check', icon: FileText, to: '/deposits' },
  { label: 'Pay Loan', icon: Landmark, to: '/loans' },
  { label: 'Manage Card', icon: CreditCard, to: '/cards' },
];

const Home = () => {
  const [showBalance, setShowBalance] = useState(true);
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const toggleBalance = () => setShowBalance(!showBalance);

  // Shared className for quick-action items (button or link)
  const quickActionClass =
    'flex min-h-[52px] items-center justify-center gap-2 border border-hairline bg-white px-3 text-sm font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40';

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Welcome Section */}
      <section className="mb-8 flex flex-col gap-2 border-b border-hairline pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold leading-tight text-deep-accent sm:text-3xl">
            Good morning, Joshua
          </h1>
          <p className="mt-1 text-sm text-body sm:text-base">
            Here&rsquo;s your financial snapshot.
          </p>
        </div>
        <div className="text-xs text-muted sm:text-sm">{currentDate}</div>
      </section>

      {/* Total Balance & Financial Snapshot */}
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

      {/* Accounts */}
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-deep-accent sm:text-xl">Accounts</h2>
          <Link
            to="/accounts"
            className="group inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
              strokeWidth={2}
            />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mockAccounts.map((account) => (
            <div
              key={account.id}
              className="group flex flex-col border border-hairline bg-white p-5 transition-colors hover:border-primary"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  {account.type === 'credit' ? (
                    <CreditCard className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
                  ) : (
                    <Wallet className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
                  )}
                  <span className="truncate text-sm font-semibold text-body">
                    {account.name}
                  </span>
                </div>
                <span className="shrink-0 text-xs text-muted">•••• {account.lastFour}</span>
              </div>

              <div className="mt-4 font-serif text-xl font-bold text-deep-accent">
                {showBalance ? formatCurrency(account.balance) : '•••••••'}
              </div>
              <div className="mt-0.5 text-xs text-muted">
                {account.type === 'credit' ? 'Credit Card' : 'Account'}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mb-10">
        <h2 className="mb-4 font-serif text-lg font-bold text-deep-accent sm:text-xl">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {quickActions.map(({ label, icon: Icon, to }) =>
            to ? (
              <Link key={label} to={to} className={quickActionClass}>
                <Icon className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
                <span className="truncate">{label}</span>
              </Link>
            ) : (
              <button key={label} type="button" className={quickActionClass}>
                <Icon className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
                <span className="truncate">{label}</span>
              </button>
            )
          )}
        </div>
      </section>

      {/* Two columns: Recent Transactions & Upcoming Payments */}
      <div className="mb-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Transactions */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-deep-accent sm:text-xl">
              Recent Transactions
            </h2>
            <Link
              to="/transactions"
              className="group inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View all
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                strokeWidth={2}
              />
            </Link>
          </div>

          <div className="divide-y divide-faint border-t border-hairline">
            {mockTransactions.slice(0, 6).map((tx) => {
              const isPositive = tx.amount >= 0;
              return (
                <div key={tx.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center ${
                        isPositive ? 'bg-[#e7f3f5] text-primary' : 'bg-faint text-body'
                      }`}
                    >
                      {isPositive ? (
                        <ArrowDownLeft className="h-4 w-4" strokeWidth={1.75} />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-[#0b1b2b]">
                        {tx.description}
                      </div>
                      <div className="truncate text-xs text-muted">{tx.category}</div>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end">
                    <span
                      className={`text-sm font-semibold ${
                        isPositive ? 'text-primary' : 'text-[#d9534f]'
                      }`}
                    >
                      {isPositive ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </span>
                    <span className="text-xs text-muted">{tx.date}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Upcoming Payments */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-deep-accent sm:text-xl">
              Upcoming Payments
            </h2>
            <Link
              to="/payments"
              className="group inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View all
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                strokeWidth={2}
              />
            </Link>
          </div>

          <div className="divide-y divide-faint border-t border-hairline">
            {mockUpcomingPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between gap-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-faint text-body">
                    <CalendarClock className="h-4 w-4" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-[#0b1b2b]">
                      {payment.payee}
                    </div>
                    <div className="truncate text-xs text-muted">Due {payment.dueDate}</div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm font-semibold text-[#0b1b2b]">
                    {formatCurrency(payment.amount)}
                  </span>
                  {payment.autopay && (
                    <span className="hidden bg-[#e7f3f5] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary sm:inline-block">
                      Autopay ON
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Alerts & Security */}
      <section className="mb-10">
        <h2 className="mb-4 font-serif text-lg font-bold text-deep-accent sm:text-xl">
          Alerts &amp; Security
        </h2>
        <div className="divide-y divide-faint border-t border-hairline">
          {mockAlerts.map((alert) => (
            <div key={alert.id} className="flex items-center gap-3 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#e7f3f5] text-primary">
                <Bell className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-[#0b1b2b]">
                {alert.message}
              </span>
              <span className="shrink-0 text-xs text-muted">{alert.date}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Credit Score */}
      <section className="mb-10">
        <h2 className="mb-4 font-serif text-lg font-bold text-deep-accent sm:text-xl">
          Credit Score
        </h2>
        <div className="flex flex-col gap-4 border border-hairline bg-[#f8f9fa] p-5 sm:flex-row sm:items-center sm:gap-8 sm:p-6">
          <div className="font-serif text-4xl font-bold leading-none text-deep-accent sm:text-5xl">
            {mockCreditScore.score}
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-primary" strokeWidth={2} />
              <span className="text-base font-bold text-primary">{mockCreditScore.rating}</span>
            </div>
            <div className="text-sm font-semibold text-deep-accent">
              +{mockCreditScore.change} this month
            </div>
            <div className="text-xs text-muted">Updated {mockCreditScore.updated}</div>
          </div>
        </div>
      </section>

      {/* Financial Goals */}
      <section className="mb-4">
        <h2 className="mb-4 font-serif text-lg font-bold text-deep-accent sm:text-xl">
          Financial Goals
        </h2>
        <div className="flex flex-col gap-4 border-t border-hairline pt-4">
          {mockGoals.map((goal) => {
            const progress = Math.min((goal.current / goal.target) * 100, 100);
            return (
              <div key={goal.id} className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm font-semibold text-[#0b1b2b]">
                    {goal.name}
                  </span>
                  <span className="shrink-0 text-sm text-body">
                    {formatCurrency(goal.current)} / {formatCurrency(goal.target)}
                  </span>
                </div>
                <div className="h-2 w-full bg-hairline">
                  <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Home;