// src/pages/Cards.jsx
import React, { useState } from 'react';
import {
  Plus,
  CreditCard,
  CheckCircle2,
  Bell,
  Clock,
  Lock,
  Unlock,
  Eye,
  X,
  Info,
  FileText,
  ChevronRight,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  CircleDollarSign,
  ShieldCheck,
} from 'lucide-react';
import {
  mockCards,
  mockCardTransactions,
  mockCardAlerts,
} from '../data/mockCardsData';

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

const formatExpiration = (expStr) => {
  const [year, month] = expStr.split('-');
  return `${month}/${year.slice(2)}`;
};

// Status → Tailwind color class (mirrors original status color mapping)
const getStatusColor = (status) => {
  const map = {
    Active: 'text-primary',
    'Temporarily Locked': 'text-[#d9534f]',
    Locked: 'text-[#d9534f]',
    Expired: 'text-[#d9534f]',
    'Replacement Pending': 'text-[#f0ad4e]',
    Suspended: 'text-[#d9534f]',
  };
  return map[status] || 'text-primary';
};

const Cards = () => {
  // State
  const [selectedCardId, setSelectedCardId] = useState(mockCards[0]?.id || null);
  const [showDetails, setShowDetails] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showReplacement, setShowReplacement] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentFrom, setPaymentFrom] = useState('chk1');
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [replacementReason, setReplacementReason] = useState('Damaged');

  const selectedCard = mockCards.find((c) => c.id === selectedCardId);
  const cardTransactions = mockCardTransactions.filter(
    (t) => t.cardId === selectedCardId
  );

  // Handlers
  const toggleLock = (cardId) => {
    alert(`Toggling lock for card ${cardId}`);
  };

  const handleViewDetails = () => {
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
  };

  const handleMakePayment = () => {
    setShowPayment(true);
  };

  const closePayment = () => {
    setShowPayment(false);
    setPaymentAmount('');
  };

  const handleSubmitPayment = () => {
    alert(`Payment of ${formatCurrency(parseFloat(paymentAmount) || 0)} submitted`);
    closePayment();
  };

  const handleReplaceCard = () => {
    setShowReplacement(true);
  };

  const closeReplacement = () => {
    setShowReplacement(false);
  };

  const handleSubmitReplacement = () => {
    alert(
      `Replacement requested for ${selectedCard?.name} - Reason: ${replacementReason}`
    );
    closeReplacement();
  };

  const toggleAlert = (alertId) => {
    alert(`Toggling alert ${alertId}`);
  };

  // Overview cards config
  const overviewCards = [
    { label: 'Total Cards', value: mockCards.length, icon: CreditCard },
    {
      label: 'Active Cards',
      value: mockCards.filter((c) => c.status === 'Active').length,
      icon: CheckCircle2,
    },
    {
      label: 'Cards With Alerts',
      value: mockCardAlerts.filter((a) => a.enabled).length,
      icon: Bell,
    },
    { label: 'Expiring Soon', value: 0, icon: Clock },
  ];

  // Card control items — labeled grid
  const controlItems = selectedCard
    ? [
        {
          label: 'Lock Card',
          status: selectedCard.controls.locked ? 'Locked' : 'Unlocked',
          on: selectedCard.controls.locked,
          action: () => toggleLock(selectedCard.id),
          toggleLabel: selectedCard.controls.locked ? 'Unlock' : 'Lock',
        },
        {
          label: 'Contactless Payments',
          status: selectedCard.controls.contactless ? 'On' : 'Off',
          on: selectedCard.controls.contactless,
          toggleLabel: selectedCard.controls.contactless ? 'Turn Off' : 'Turn On',
        },
        {
          label: 'Online Purchases',
          status: selectedCard.controls.onlinePurchases ? 'On' : 'Off',
          on: selectedCard.controls.onlinePurchases,
          toggleLabel: selectedCard.controls.onlinePurchases ? 'Turn Off' : 'Turn On',
        },
        {
          label: 'International Purchases',
          status: selectedCard.controls.internationalPurchases ? 'On' : 'Off',
          on: selectedCard.controls.internationalPurchases,
          toggleLabel: selectedCard.controls.internationalPurchases
            ? 'Turn Off'
            : 'Turn On',
        },
        {
          label: 'ATM Withdrawals',
          status: selectedCard.controls.atmWithdrawals ? 'On' : 'Off',
          on: selectedCard.controls.atmWithdrawals,
          toggleLabel: selectedCard.controls.atmWithdrawals ? 'Turn Off' : 'Turn On',
        },
        {
          label: 'Card Notifications',
          status: selectedCard.controls.notifications ? 'On' : 'Off',
          on: selectedCard.controls.notifications,
          toggleLabel: selectedCard.controls.notifications ? 'Turn Off' : 'Turn On',
        },
      ]
    : [];

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 border-b border-hairline pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold leading-tight text-deep-accent sm:text-3xl">
            Cards
          </h1>
          <p className="mt-1 text-sm text-body sm:text-base">
            Manage your debit and credit cards, view activity, and control your card
            settings.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex min-h-[44px] items-center justify-center gap-2 bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <Plus className="h-4 w-4" strokeWidth={2.25} />
          Manage Cards
        </button>
      </div>

      {/* Card Overview */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {overviewCards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="border border-hairline bg-faint px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted sm:text-xs">
                {label}
              </span>
              <Icon className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
            </div>
            <div className="mt-1 font-serif text-xl font-bold text-deep-accent sm:text-2xl">
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* My Cards */}
      <section className="mb-10">
        <h2 className="mb-4 font-serif text-lg font-bold text-deep-accent sm:text-xl">
          My Cards
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockCards.map((card) => {
            const isSelected = selectedCardId === card.id;
            return (
              <div
                key={card.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedCardId(card.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedCardId(card.id);
                  }
                }}
                className={`group flex cursor-pointer flex-col border bg-white p-5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                  isSelected
                    ? 'border-2 border-primary'
                    : 'border border-hairline hover:border-primary'
                }`}
              >
                {/* Header: type + status */}
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-deep-accent">
                    <CreditCard className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
                    {card.type}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide ${getStatusColor(
                      card.status
                    )}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 ${
                        card.status === 'Active'
                          ? 'bg-primary'
                          : card.status === 'Replacement Pending'
                          ? 'bg-[#f0ad4e]'
                          : 'bg-[#d9534f]'
                      }`}
                      aria-hidden="true"
                    />
                    {card.status}
                  </span>
                </div>

                {/* Name */}
                <div className="mt-3 text-sm font-semibold text-deep-accent sm:text-base">
                  {card.name}
                </div>

                {/* Number */}
                <div className="mt-1 font-mono text-lg tracking-[0.15em] text-ink">
                  •••• {card.lastFour}
                </div>

                {/* Cardholder */}
                <div className="mt-1 text-xs text-body">{card.cardholderName}</div>
                <div className="text-xs text-muted">
                  Expires {formatExpiration(card.expirationDate)}
                </div>

                {/* Credit balance */}
                {card.type === 'Credit' && (
                  <div className="mt-3 flex items-center justify-between border-t border-hairline pt-3">
                    <span className="text-xs text-muted">Balance</span>
                    <span className="font-serif text-base font-bold text-deep-accent">
                      {formatCurrency(card.balance)}
                    </span>
                  </div>
                )}

                {/* Linked account */}
                <div className="mt-3 text-xs text-muted">
                  Linked: {card.linkedAccount}
                </div>

                {/* Actions */}
                <div className="mt-4 flex flex-wrap gap-2 border-t border-hairline pt-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLock(card.id);
                    }}
                    className="inline-flex min-h-[32px] items-center gap-1.5 border border-hairline bg-white px-3 py-1 text-xs font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    {card.controls.locked ? (
                      <>
                        <Unlock className="h-3.5 w-3.5" strokeWidth={2} />
                        Unlock Card
                      </>
                    ) : (
                      <>
                        <Lock className="h-3.5 w-3.5" strokeWidth={2} />
                        Lock Card
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails();
                    }}
                    className="inline-flex min-h-[32px] items-center gap-1.5 border border-hairline bg-white px-3 py-1 text-xs font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <Eye className="h-3.5 w-3.5" strokeWidth={2} />
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Selected Card Details */}
      {selectedCard && (
        <section className="mb-10 border-t border-hairline pt-8">
          <h2 className="mb-4 font-serif text-lg font-bold text-deep-accent sm:text-xl">
            Card Details
          </h2>

          <div className="border border-hairline bg-faint p-5 sm:p-6">
            {/* Detail Header */}
            <div className="mb-6 flex flex-col gap-4 border-b border-hairline pb-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-deep-accent text-white">
                  <CreditCard className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-deep-accent sm:text-base">
                    {selectedCard.name}
                  </div>
                  <div className="font-mono text-sm text-muted">
                    •••• {selectedCard.lastFour}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleViewDetails}
                  className="inline-flex min-h-[36px] items-center gap-1.5 border border-hairline bg-white px-4 py-1.5 text-xs font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:text-sm"
                >
                  <Eye className="h-3.5 w-3.5" strokeWidth={2} />
                  View Full Details
                </button>
                {selectedCard.type === 'Credit' && (
                  <button
                    type="button"
                    onClick={handleMakePayment}
                    className="inline-flex min-h-[36px] items-center gap-1.5 bg-primary px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 sm:text-sm"
                  >
                    <CircleDollarSign className="h-3.5 w-3.5" strokeWidth={2} />
                    Make Payment
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleReplaceCard}
                  className="inline-flex min-h-[36px] items-center gap-1.5 border border-hairline bg-white px-4 py-1.5 text-xs font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:text-sm"
                >
                  <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
                  Replace Card
                </button>
              </div>
            </div>

            {/* Detail Content */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Info panel */}
              <div className="flex flex-col divide-y divide-hairline">
                <DetailRow label="Card Type" value={selectedCard.type} />
                <DetailRow
                  label="Status"
                  value={selectedCard.status}
                  valueColor={getStatusColor(selectedCard.status)}
                />
                <DetailRow
                  label="Linked Account"
                  value={selectedCard.linkedAccount}
                />
                <DetailRow label="Cardholder" value={selectedCard.cardholderName} />
                <DetailRow
                  label="Expires"
                  value={formatExpiration(selectedCard.expirationDate)}
                />

                {selectedCard.type === 'Credit' && (
                  <>
                    <DetailRow
                      label="Current Balance"
                      value={formatCurrency(selectedCard.balance)}
                    />
                    <DetailRow
                      label="Available Credit"
                      value={formatCurrency(selectedCard.availableCredit)}
                    />
                    <DetailRow
                      label="Credit Limit"
                      value={formatCurrency(selectedCard.creditLimit)}
                    />
                    <DetailRow
                      label="Minimum Payment"
                      value={formatCurrency(selectedCard.minimumPayment)}
                    />
                    <DetailRow
                      label="Payment Due"
                      value={formatDate(selectedCard.paymentDueDate)}
                    />
                    <DetailRow
                      label="Next Statement"
                      value={formatDate(selectedCard.nextStatementDate)}
                    />

                    {/* Credit utilization */}
                    <div className="pt-3">
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-xs text-muted">Credit Utilization</span>
                        <span className="text-xs font-bold text-deep-accent">
                          {Math.round(
                            (selectedCard.balance / selectedCard.creditLimit) * 100
                          )}
                          %
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-hairline">
                        <div
                          className="h-full transition-[width] duration-300"
                          style={{
                            width: `${Math.min(
                              (selectedCard.balance / selectedCard.creditLimit) * 100,
                              100
                            )}%`,
                            backgroundColor:
                              selectedCard.balance / selectedCard.creditLimit > 0.8
                                ? '#d9534f'
                                : '#008296',
                          }}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Recent activity */}
              <div className="flex flex-col">
                <h3 className="mb-3 font-serif text-base font-bold text-deep-accent sm:text-lg">
                  Recent Activity
                </h3>

                <div className="flex flex-col border-t border-hairline">
                  {cardTransactions.length === 0 ? (
                    <p className="py-4 text-sm text-muted">No recent transactions.</p>
                  ) : (
                    cardTransactions.slice(0, 5).map((tx) => {
                      const isNegative = tx.amount < 0;
                      return (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between gap-4 border-b border-faint py-2.5"
                        >
                          <div className="flex min-w-0 items-start gap-3">
                            <span
                              className={`flex h-8 w-8 shrink-0 items-center justify-center ${
                                isNegative
                                  ? 'bg-faint text-body'
                                  : 'bg-[#e7f3f5] text-primary'
                              }`}
                            >
                              {isNegative ? (
                                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
                              ) : (
                                <ArrowDownLeft className="h-3.5 w-3.5" strokeWidth={2} />
                              )}
                            </span>
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold text-ink">
                                {tx.merchant}
                              </div>
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                                <span>{tx.category}</span>
                                {tx.status === 'Pending' && (
                                  <span className="inline-flex items-center gap-1 bg-[#fff3e0] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#f0ad4e]">
                                    <Clock className="h-2.5 w-2.5" strokeWidth={2.5} />
                                    Pending
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex shrink-0 flex-col items-end">
                            <span
                              className={`text-sm font-semibold ${
                                isNegative ? 'text-[#d9534f]' : 'text-primary'
                              }`}
                            >
                              {isNegative ? '-' : '+'}
                              {formatCurrency(tx.amount)}
                            </span>
                            <span className="text-xs text-muted">
                              {formatDate(tx.date)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <button
                  type="button"
                  className="mt-3 inline-flex items-center gap-1 self-start text-sm font-semibold text-primary hover:underline"
                >
                  View All Transactions
                  <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.25} />
                </button>
              </div>
            </div>

            {/* Card Controls */}
            <div className="mt-8 border-t border-hairline pt-6">
              <h3 className="mb-4 font-serif text-base font-bold text-deep-accent sm:text-lg">
                Card Controls
              </h3>
              <div className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
                {controlItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 border-b border-faint py-3"
                  >
                    <span
                      className={`h-1.5 w-1.5 shrink-0 ${
                        item.on ? 'bg-primary' : 'bg-muted'
                      }`}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-deep-accent">
                      {item.label}
                    </span>
                    <span className="shrink-0 text-xs text-muted">{item.status}</span>
                    <button
                      type="button"
                      onClick={item.action}
                      className="shrink-0 border border-hairline bg-white px-2.5 py-1 text-xs font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      {item.toggleLabel}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Statements link */}
            <div className="mt-6 flex flex-col items-start gap-2 border-t border-hairline pt-4 sm:flex-row sm:items-center sm:gap-3">
              <FileText className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
              <span className="text-sm text-body">
                View your card statements
              </span>
              <a
                href="/statements"
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                Go to Statements
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.25} />
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Card Alerts */}
      <section className="mb-4 border-t border-hairline pt-8">
        <div className="mb-4 flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" strokeWidth={1.75} />
          <h2 className="font-serif text-lg font-bold text-deep-accent sm:text-xl">
            Card Alerts
          </h2>
        </div>

        <div className="flex flex-col divide-y divide-faint border-t border-hairline">
          {mockCardAlerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center gap-3 py-3"
            >
              <span
                className={`h-1.5 w-1.5 shrink-0 ${
                  alert.enabled ? 'bg-primary' : 'bg-[#d9534f]'
                }`}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-deep-accent">
                {alert.name}
              </span>
              <span
                className={`shrink-0 text-xs font-bold uppercase tracking-wide ${
                  alert.enabled ? 'text-primary' : 'text-[#d9534f]'
                }`}
              >
                {alert.enabled ? 'ON' : 'OFF'}
              </span>
              <button
                type="button"
                onClick={() => toggleAlert(alert.id)}
                className="shrink-0 border border-hairline bg-white px-2.5 py-1 text-xs font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                {alert.enabled ? 'Turn Off' : 'Turn On'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Detail Modal */}
      {showDetails && selectedCard && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4"
          onClick={closeDetails}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-[600px] overflow-y-auto border border-hairline bg-white p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeDetails}
              aria-label="Close"
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-faint hover:text-deep-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <X className="h-4 w-4" strokeWidth={2.25} />
            </button>

            <h2 className="mb-5 font-serif text-xl font-bold text-deep-accent sm:text-2xl">
              Card Details
            </h2>

            {/* Card preview */}
            <div className="bg-deep-accent p-5 text-white sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/70">
                  {selectedCard.type}
                </span>
                <CreditCard className="h-5 w-5 text-white/70" strokeWidth={1.75} />
              </div>
              <div className="mt-4 text-sm font-semibold text-white/90 sm:text-base">
                {selectedCard.name}
              </div>
              <div className="mt-2 font-mono text-xl tracking-[0.2em] text-white">
                •••• •••• •••• {selectedCard.lastFour}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-white/80">
                <span>Cardholder: {selectedCard.cardholderName}</span>
                <span>Expires: {formatExpiration(selectedCard.expirationDate)}</span>
              </div>
              <div className="mt-3 flex items-center gap-2 border-t border-white/15 pt-3 text-xs">
                <span className="text-white/70">Status:</span>
                <span
                  className={`font-bold uppercase tracking-wide ${
                    selectedCard.status === 'Active'
                      ? 'text-white'
                      : 'text-[#ffb4b0]'
                  }`}
                >
                  {selectedCard.status}
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                className="inline-flex min-h-[40px] items-center justify-center gap-1.5 border border-hairline bg-white px-4 py-2 text-sm font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <Eye className="h-3.5 w-3.5" strokeWidth={2} />
                Show Full Number
              </button>
              <button
                type="button"
                className="inline-flex min-h-[40px] items-center justify-center gap-1.5 border border-hairline bg-white px-4 py-2 text-sm font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2} />
                View CVV
              </button>
              <button
                type="button"
                onClick={closeDetails}
                className="inline-flex min-h-[40px] items-center justify-center gap-1.5 bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 sm:ml-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && selectedCard && selectedCard.type === 'Credit' && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4"
          onClick={closePayment}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-[600px] overflow-y-auto border border-hairline bg-white p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closePayment}
              aria-label="Close"
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-faint hover:text-deep-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <X className="h-4 w-4" strokeWidth={2.25} />
            </button>

            <h2 className="font-serif text-xl font-bold text-deep-accent sm:text-2xl">
              Make a Payment
            </h2>
            <p className="mt-1 text-sm text-body">Pay your {selectedCard.name}</p>

            <div className="mt-6 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="paymentFrom"
                  className="text-sm font-semibold text-deep-accent"
                >
                  Pay From
                </label>
                <select
                  id="paymentFrom"
                  value={paymentFrom}
                  onChange={(e) => setPaymentFrom(e.target.value)}
                  className="min-h-[40px] w-full border border-hairline bg-white px-3 py-2 text-sm text-deep-accent focus:border-primary focus:outline-none"
                >
                  <option value="chk1">Checking •••• 4821</option>
                  <option value="sav1">Savings •••• 9134</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="paymentAmount"
                  className="text-sm font-semibold text-deep-accent"
                >
                  Payment Amount
                </label>
                <div className="flex items-center border border-hairline bg-white focus-within:border-primary">
                  <span className="pl-3 pr-1 text-base font-bold text-body">$</span>
                  <input
                    type="number"
                    id="paymentAmount"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    className="min-h-[42px] w-full border-none bg-transparent px-2 py-2 text-lg font-semibold text-deep-accent outline-none placeholder:text-muted/60"
                  />
                </div>
                <p className="text-xs text-muted">
                  Minimum: {formatCurrency(selectedCard.minimumPayment)} |
                  Statement Balance: {formatCurrency(selectedCard.balance)}
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="paymentDate"
                  className="text-sm font-semibold text-deep-accent"
                >
                  Payment Date
                </label>
                <input
                  type="date"
                  id="paymentDate"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="min-h-[40px] w-full border border-hairline bg-white px-3 py-2 text-sm text-deep-accent focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-hairline pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closePayment}
                  className="min-h-[40px] border border-hairline bg-white px-5 py-2 text-sm font-semibold text-deep-accent transition-colors hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitPayment}
                  className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  <CircleDollarSign className="h-4 w-4" strokeWidth={2.25} />
                  Review Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Replacement Modal */}
      {showReplacement && selectedCard && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4"
          onClick={closeReplacement}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-[600px] overflow-y-auto border border-hairline bg-white p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeReplacement}
              aria-label="Close"
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-faint hover:text-deep-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <X className="h-4 w-4" strokeWidth={2.25} />
            </button>

            <h2 className="font-serif text-xl font-bold text-deep-accent sm:text-2xl">
              Replace Card
            </h2>
            <p className="mt-1 text-sm text-body">
              Request a replacement for {selectedCard.name}
            </p>

            <div className="mt-6 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="replacementReason"
                  className="text-sm font-semibold text-deep-accent"
                >
                  Reason for replacement
                </label>
                <select
                  id="replacementReason"
                  value={replacementReason}
                  onChange={(e) => setReplacementReason(e.target.value)}
                  className="min-h-[40px] w-full border border-hairline bg-white px-3 py-2 text-sm text-deep-accent focus:border-primary focus:outline-none"
                >
                  <option value="Damaged">Damaged</option>
                  <option value="Lost">Lost</option>
                  <option value="Stolen">Stolen</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>

              {/* Info banner */}
              <div className="flex items-start gap-3 border border-hairline bg-faint px-4 py-3">
                <Info
                  className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                  strokeWidth={1.75}
                />
                <span className="text-xs text-body sm:text-sm">
                  {replacementReason === 'Stolen' || replacementReason === 'Lost'
                    ? 'Your card will be immediately deactivated. A new card will be issued and sent to your address on file.'
                    : 'A new card will be issued and sent to your address on file. Your current card will remain active until you activate the new card.'}
                </span>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-hairline pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeReplacement}
                  className="min-h-[40px] border border-hairline bg-white px-5 py-2 text-sm font-semibold text-deep-accent transition-colors hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitReplacement}
                  className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  <RefreshCw className="h-4 w-4" strokeWidth={2.25} />
                  Request Replacement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable detail row
const DetailRow = ({ label, value, valueColor = 'text-ink' }) => (
  <div className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
    <span className="text-xs text-muted sm:text-sm">{label}</span>
    <span className={`text-sm font-semibold ${valueColor} sm:text-right`}>{value}</span>
  </div>
);

export default Cards;