// src/pages/Accounts.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Plus,
  ChevronRight,
  Search,
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

const formatShortDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const getAccountTypeLabel = (type) => {
  const map = {
    checking: 'Checking',
    savings: 'Savings',
    loan: 'Loan',
  };
  return map[type] || type;
};

const getAccountIcon = (type) => {
  const map = {
    checking: Wallet,
    savings: PiggyBank,
    loan: Landmark,
  };
  return map[type] || Wallet;
};

const ALERT_DEFINITIONS = [
  { key: 'lowBalance',       name: 'Low balance alert' },
  { key: 'largeTransaction', name: 'Large transaction alert' },
  { key: 'deposit',          name: 'Deposit notification' },
  { key: 'paymentReminder',  name: 'Payment reminder' },
  { key: 'monthlyStatement', name: 'Monthly statement notification' },
];

// Account Card Component
const AccountCard = ({ account, showBalance, onView, isSelected }) => {
  const Icon = getAccountIcon(account.type);

  const getSecondaryInfo = () => {
    if (account.type === 'savings' && account.interestRate != null) {
      return `Interest Rate ${account.interestRate}% APY`;
    } else if (account.type === 'loan') {
      return `Next Payment ${formatCurrency(account.nextPayment)} due ${account.nextPaymentDue}`;
    }
    return null;
  };

  return (
    <div
      onClick={onView}
      className={`group flex flex-col border bg-white p-5 transition-colors sm:p-6 cursor-pointer ${
        isSelected ? 'border-primary' : 'border-hairline hover:border-primary'
      }`}
    >
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
        {showBalance ? formatCurrency(account.balance) : '•••••••'}
      </div>

      {getSecondaryInfo() && (
        <div className="mt-1 text-xs text-body">{getSecondaryInfo()}</div>
      )}
    </div>
  );
};

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
  const [selectedAccountId, setSelectedAccountId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [data, setData] = useState({
    balance: 0,
    accounts: { checking: [], savings: [] },
    loans: [],
    primaryChecking: null,
    alertPreferences: {
      lowBalance: true,
      largeTransaction: true,
      deposit: true,
      paymentReminder: true,
      monthlyStatement: true,
    },
  });

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await apiFetch('/accounts/overview');
        const d = res?.data ?? res;

        const transformAccount = (acc) => {
          let name = getAccountTypeLabel(acc.type.toLowerCase());
          if (acc.type.toLowerCase() === 'savings' && acc.subType) {
            name = `${acc.subType} Savings`;
          }
          return {
            id: acc.id,
            type: acc.type.toLowerCase(),
            name,
            subType: acc.subType,
            lastFour: acc.lastFour,
            accountNumber: acc.accountNumber,
            status: acc.status,
            balance: acc.balance,
            interestRate: acc.interestRate,
          };
        };

        const transformedLoans = (d.loans || []).map((loan) => ({
          id: loan.id,
          type: 'loan',
          name: loan.name,
          lastFour: loan.lastFour,
          status: loan.status,
          balance: loan.currentBalance,
          currentBalance: loan.currentBalance,
          nextPayment: loan.monthlyPayment,
          nextPaymentDue: formatShortDate(loan.nextPaymentDate),
          interestRate: loan.interestRate,
        }));

        const transformedPrimaryChecking = d.primaryChecking
          ? {
              ...transformAccount({
                ...d.primaryChecking,
                type: 'Checking',
                subType: null,
              }),
            }
          : null;

        const checkingList = (d.accounts.checking || []).map((acc) => {
          if (transformedPrimaryChecking && acc.id === transformedPrimaryChecking.id) {
            return transformedPrimaryChecking;
          }
          return transformAccount(acc);
        });

        setData({
          balance: d.balance ?? 0,
          accounts: {
            checking: checkingList,
            savings: (d.accounts.savings || []).map(transformAccount),
          },
          loans: transformedLoans,
          primaryChecking: transformedPrimaryChecking,
          alertPreferences: {
            lowBalance:       d.alertPreferences?.lowBalance       ?? true,
            largeTransaction: d.alertPreferences?.largeTransaction ?? true,
            deposit:          d.alertPreferences?.deposit          ?? true,
            paymentReminder:  d.alertPreferences?.paymentReminder  ?? true,
            monthlyStatement: d.alertPreferences?.monthlyStatement ?? true,
          },
        });

        if (transformedPrimaryChecking) {
          setSelectedAccountId(transformedPrimaryChecking.id);
        }
      } catch (err) {
        console.error('❌ Failed to load accounts:', err);
        setError(err.message || 'Failed to load accounts');
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  const handleToggleAlert = async (key) => {
    const currentValue = data.alertPreferences[key];
    const newValue = !currentValue;

    setData((prev) => ({
      ...prev,
      alertPreferences: { ...prev.alertPreferences, [key]: newValue },
    }));

    try {
      await apiFetch('/accounts/alerts', {
        method: 'PUT',
        body: JSON.stringify({ [key]: newValue }),
      });
    } catch (err) {
      setData((prev) => ({
        ...prev,
        alertPreferences: { ...prev.alertPreferences, [key]: currentValue },
      }));
      console.error('❌ Failed to update alert:', err);
    }
  };

  const toggleBalance = () => setShowBalance(!showBalance);
  const handleViewAccount = (accountId) => setSelectedAccountId(accountId);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" strokeWidth={1.75} />
        <p className="text-sm text-muted">Loading your accounts…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-4">
        <p className="font-serif text-xl font-bold text-deep-accent">
          We couldn&rsquo;t load your accounts
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

  const allAccounts = [
    ...data.accounts.checking,
    ...data.accounts.savings,
    ...data.loans,
  ];

  const selectedAccount = allAccounts.find((acc) => acc.id === selectedAccountId);

  const categories = [
    { key: 'checking', title: 'Checking', accounts: data.accounts.checking },
    { key: 'savings', title: 'Savings', accounts: data.accounts.savings },
    ...(data.loans.length > 0 ? [{ key: 'loans', title: 'Loans', accounts: data.loans }] : []),
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
      </div>

      {/* Account Balance Summary */}
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
                  isSelected={acc.id === selectedAccountId}
                />
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Account Detail Panel */}
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
                    Balance
                  </span>
                  <span className="font-serif text-lg font-bold text-deep-accent sm:text-xl">
                    {showBalance
                      ? formatCurrency(
                          selectedAccount.balance ??
                            selectedAccount.currentBalance ??
                            0
                        )
                      : '•••••••'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Transfer', path: '/transfers' },
                { label: 'Pay', path: '/payments' },
                { label: 'Deposit', path: '/deposits' },
              ].map(({ label, path }) => (
                <Link
                  key={label}
                  to={path}
                  className="inline-flex min-h-[40px] items-center justify-center border border-hairline bg-white px-4 py-2 text-sm font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  {label}
                </Link>
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
              {ALERT_DEFINITIONS.map((alert) => {
                const isOn = data.alertPreferences[alert.key] === true;
                return (
                  <div
                    key={alert.key}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <span className="text-sm font-medium text-ink">{alert.name}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleAlert(alert.key)}
                      className={`text-xs font-bold uppercase tracking-wide cursor-pointer transition-colors ${
                        isOn ? 'text-primary' : 'text-[#d9534f]'
                      }`}
                      aria-label={`Toggle ${alert.name}`}
                    >
                      {isOn ? 'ON' : 'OFF'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Accounts;