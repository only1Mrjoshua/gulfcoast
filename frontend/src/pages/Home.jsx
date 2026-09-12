import React, { useState, useEffect } from 'react';
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
  Loader2,
} from 'lucide-react';
import { apiFetch } from '../utils/api';

// ---------- Formatting helpers ----------
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Math.abs(amount ?? 0));
};

const formatAccountName = (type) => {
  switch (type) {
    case 'checking':
      return 'Checking';
    case 'savings':
      return 'Savings';
    default:
      return 'Account';
  }
};

const formatShortDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const formatMediumDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [data, setData] = useState({
    greeting: '',
    date: '',
    balance: 0,
    accounts: [],
    transactions: [],
    upcomingPayments: [],
    creditScore: { score: 0, rating: '', change: 0, updated: '' },
    goals: [],
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await apiFetch('/home/dashboard');
        const d = res?.data ?? res;

        setData({
          greeting: d.greeting || 'Welcome back',
          date: d.date || '',
          balance: d.balance ?? 0,

          accounts: (d.accounts || []).map((acc) => ({
            id: acc.id,
            name: formatAccountName(acc.type),
            lastFour: acc.accountNumber ? acc.accountNumber.slice(-4) : '',
            balance: acc.balance,
            type: acc.type,
          })),

          transactions: (d.recentTransactions || []).map((tx) => ({
            id: tx._id,
            description: tx.description,
            category: tx.category || (tx.type === 'credit' ? 'Deposit' : 'Payment'),
            amount: tx.amount,
            date: formatShortDate(tx.date),
          })),

          upcomingPayments: (d.upcomingPayments || []).map((p) => ({
            id: p._id,
            payee: p.description,
            dueDate: formatShortDate(p.date),
            amount: p.amount,
            autopay: p.autopay ?? false,
          })),

          creditScore: {
            score: d.creditScore?.score ?? 0,
            rating: d.creditScore?.rating ?? '',
            change: d.creditScore?.change ?? 0,
            updated: formatMediumDate(d.creditScore?.lastUpdated),
          },

          goals: (d.goals || []).map((g) => ({
            id: g._id,
            name: g.name,
            current: g.currentAmount,
            target: g.targetAmount,
          })),
        });
      } catch (err) {
        console.error('❌ Failed to load dashboard:', err);
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const toggleBalance = () => setShowBalance(!showBalance);

  const quickActionClass =
    'flex min-h-[52px] items-center justify-center gap-2 border border-hairline bg-white px-3 text-sm font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40';

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" strokeWidth={1.75} />
        <p className="text-sm text-muted">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-4">
        <p className="font-serif text-xl font-bold text-deep-accent">
          We couldn&rsquo;t load your dashboard
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

  const hasTransactions = data.transactions.length > 0;
  const hasUpcomingPayments = data.upcomingPayments.length > 0;

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Welcome Section */}
      <section className="mb-8 flex flex-col gap-2 border-b border-hairline pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold leading-tight text-deep-accent sm:text-3xl">
            {data.greeting || 'Welcome back'}
          </h1>
          <p className="mt-1 text-sm text-body sm:text-base">
            Here&rsquo;s your financial snapshot.
          </p>
        </div>
        <div className="text-xs text-muted sm:text-sm">{data.date}</div>
      </section>

      {/* Account Balance */}
      <section className="mb-10">
        <div className="bg-deep-accent p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/70 sm:text-xs">
              Account Balance
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
            {showBalance ? formatCurrency(data.balance) : '•••••••'}
          </div>
        </div>
      </section>

      {/* Accounts */}
      {data.accounts.length > 0 && (
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
            {data.accounts.map((account) => (
              <div
                key={account.id}
                className="group flex flex-col border border-hairline bg-white p-5 transition-colors hover:border-primary"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <Wallet className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
                    <span className="truncate text-sm font-semibold text-body">
                      {account.name}
                    </span>
                  </div>
                  <span className="shrink-0 text-xs text-muted">•••• {account.lastFour}</span>
                </div>

                <div className="mt-4 font-serif text-xl font-bold text-deep-accent">
                  {showBalance ? formatCurrency(account.balance) : '•••••••'}
                </div>
                <div className="mt-0.5 text-xs text-muted">Account</div>
              </div>
            ))}
          </div>
        </section>
      )}

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

          {hasTransactions ? (
            <div className="divide-y divide-faint border-t border-hairline">
              {data.transactions.slice(0, 5).map((tx) => {
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
          ) : (
            <div className="border-t border-hairline py-8 text-center text-sm text-muted">
              No recent transactions.
            </div>
          )}
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

          {hasUpcomingPayments ? (
            <div className="divide-y divide-faint border-t border-hairline">
              {data.upcomingPayments.map((payment) => (
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
          ) : (
            <div className="border-t border-hairline py-8 text-center text-sm text-muted">
              No upcoming payments.
            </div>
          )}
        </section>
      </div>

      {/* Credit Score */}
      {data.creditScore.score > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 font-serif text-lg font-bold text-deep-accent sm:text-xl">
            Credit Score
          </h2>
          <div className="flex flex-col gap-4 border border-hairline bg-[#f8f9fa] p-5 sm:flex-row sm:items-center sm:gap-8 sm:p-6">
            <div className="font-serif text-4xl font-bold leading-none text-deep-accent sm:text-5xl">
              {data.creditScore.score}
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-primary" strokeWidth={2} />
                <span className="text-base font-bold text-primary">
                  {data.creditScore.rating}
                </span>
              </div>
              <div className="text-sm font-semibold text-deep-accent">
                {data.creditScore.change >= 0 ? '+' : ''}{data.creditScore.change} this month
              </div>
              <div className="text-xs text-muted">Updated {data.creditScore.updated}</div>
            </div>
          </div>
        </section>
      )}

      {/* Financial Goals */}
      {data.goals.length > 0 && (
        <section className="mb-4">
          <h2 className="mb-4 font-serif text-lg font-bold text-deep-accent sm:text-xl">
            Financial Goals
          </h2>
          <div className="flex flex-col gap-4 border-t border-hairline pt-4">
            {data.goals.map((goal) => {
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
      )}
    </div>
  );
};

export default Home;