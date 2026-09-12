// src/pages/Cards.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
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

const toDate = (d) => (typeof d === 'string' ? new Date(d) : d);

const formatDate = (d) => {
  if (!d) return '';
  return toDate(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// "2027-12" → "12/27"
const formatExpiration = (expStr) => {
  if (!expStr) return '';
  const [year, month] = expStr.split('-');
  if (!year || !month) return expStr;
  return `${month}/${year.slice(2)}`;
};

// "4532890123454821" → "4532 8901 2345 4821"
const formatFullNumber = (num) => {
  if (!num) return '';
  return String(num).replace(/(.{4})/g, '$1 ').trim();
};

// Backend alert keys → display labels
const ALERT_LABELS = {
  largePurchase:            'Large Purchase',
  cardTransaction:          'Card Transaction',
  internationalTransaction: 'International Transaction',
  onlinePurchase:           'Online Purchase',
  atmWithdrawal:            'ATM Withdrawal',
  paymentDue:               'Payments Due',
  cardExpiration:           'Card Expiration',
};

const getStatusColor = (status) => {
  const map = {
    Active: 'text-primary',
    'Temporarily Locked': 'text-[#d9534f]',
    'Temporary Locked': 'text-[#f0ad4e]',
    Locked: 'text-[#d9534f]',
    Expired: 'text-[#d9534f]',
    'Replacement Pending': 'text-[#f0ad4e]',
    Suspended: 'text-[#d9534f]',
  };
  return map[status] || 'text-primary';
};

const getStatusDot = (status) => {
  if (status === 'Active') return 'bg-primary';
  if (status === 'Temporary Locked' || status === 'Replacement Pending') return 'bg-[#f0ad4e]';
  return 'bg-[#d9534f]';
};

// -------------------- Component --------------------
const Cards = () => {
  // ── Data from backend ──
  const [cards, setCards] = useState([]);
  const [activityByCard, setActivityByCard] = useState({});
  const [overview, setOverview] = useState({
    totalCards: 0,
    activeCards: 0,
    cardsWithAlerts: 0,
    expiringSoon: 0,
  });
  const [alertPreferences, setAlertPreferences] = useState({});

  // ── UI state ──
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyKey, setBusyKey] = useState(null); // e.g. "CARD_ID:locked" or "alert:largePurchase"

  const [selectedCardId, setSelectedCardId] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showReplacement, setShowReplacement] = useState(false);

  // Reveal state (per modal open)
  const [revealed, setRevealed] = useState(null); // { fullNumber, cvv }
  const [revealing, setRevealing] = useState(false);

  // Payment / replacement form state
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentFrom, setPaymentFrom] = useState('chk1');
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [replacementReason, setReplacementReason] = useState('Damaged');

  // ── Derived ──
  const selectedCard = cards.find((c) => c.id === selectedCardId) || null;
  const cardTransactions = selectedCardId ? activityByCard[selectedCardId] || [] : [];

  // ── Loaders ──
  const loadCards = useCallback(async () => {
    const res = await apiFetch('/cards');
    const d = res?.data ?? res;

    const list = d.cards ?? [];
    setCards(list);
    setActivityByCard(d.activityByCard ?? {});
    setAlertPreferences(d.alertPreferences ?? {});
    setOverview(d.overview ?? {
      totalCards: list.length,
      activeCards: list.filter((c) => c.status === 'Active').length,
      cardsWithAlerts: 0,
      expiringSoon: 0,
    });

    // Auto-select first card on initial load
    setSelectedCardId((prev) => prev || list[0]?.id || null);
  }, []);

  useEffect(() => {
    const boot = async () => {
      try {
        setLoading(true);
        setError('');
        await loadCards();
      } catch (err) {
        console.error('❌ Failed to load cards:', err);
        setError(err.message || 'Failed to load cards');
      } finally {
        setLoading(false);
      }
    };
    boot();
  }, [loadCards]);

  // ── Card controls toggle ──
  const toggleControl = async (cardId, key) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;
    const current = card.controls?.[key] === true;
    const newValue = !current;

    setBusyKey(`${cardId}:${key}`);
    try {
      await apiFetch(`/cards/${cardId}/controls`, {
        method: 'PUT',
        body: JSON.stringify({ key, value: newValue }),
      });
      await loadCards();
    } catch (err) {
      console.error('❌ Toggle control failed:', err);
    } finally {
      setBusyKey(null);
    }
  };

  // Keep the exact same external call signature as the original
  const toggleLock = (cardId) => toggleControl(cardId, 'locked');

  // ── Alert preference toggle ──
  const toggleAlert = async (key) => {
    const current = alertPreferences[key] === true;
    const newValue = !current;

    // Optimistic update
    setAlertPreferences((prev) => ({ ...prev, [key]: newValue }));
    setBusyKey(`alert:${key}`);

    try {
      const res = await apiFetch('/cards/alerts', {
        method: 'PUT',
        body: JSON.stringify({ [key]: newValue }),
      });
      const d = res?.data ?? res;
      if (d?.alertPreferences) {
        setAlertPreferences(d.alertPreferences);
      }
    } catch (err) {
      console.error('❌ Toggle alert failed:', err);
      // Revert on failure
      setAlertPreferences((prev) => ({ ...prev, [key]: current }));
    } finally {
      setBusyKey(null);
    }
  };

  // ── Modal handlers ──
  const handleViewDetails = () => {
    setRevealed(null);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setRevealed(null);
  };

  const handleMakePayment = () => {
    setShowPayment(true);
  };

  const closePayment = () => {
    setShowPayment(false);
    setPaymentAmount('');
  };

  const handleSubmitPayment = () => {
    // No backend endpoint for card payments yet — placeholder
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
    // No backend endpoint for card replacement yet — placeholder
    alert(
      `Replacement requested for ${selectedCard?.name} - Reason: ${replacementReason}`
    );
    closeReplacement();
  };

  // ── Reveal full number / CVV ──
  const handleShowFullNumber = async () => {
    if (revealed?.fullNumber) {
      // Already showing — hide it
      setRevealed((prev) => ({ ...(prev || {}), fullNumber: null }));
      return;
    }
    await revealCardData();
  };

  const handleShowCvv = async () => {
    if (revealed?.cvv) {
      setRevealed((prev) => ({ ...(prev || {}), cvv: null }));
      return;
    }
    await revealCardData();
  };

  const revealCardData = async () => {
    if (!selectedCard) return;
    // If we already have the data cached this session, just show it
    if (revealed?.fullNumber || revealed?.cvv) return;

    setRevealing(true);
    try {
      const res = await apiFetch(`/cards/${selectedCard.id}/reveal`);
      const d = res?.data ?? res;
      setRevealed({
        fullNumber: d.fullNumber || null,
        cvv: d.cvv || null,
      });
    } catch (err) {
      console.error('❌ Reveal failed:', err);
      alert('Could not reveal card details. Please try again.');
    } finally {
      setRevealing(false);
    }
  };

  // ── Overview cards config ──
  const alertsEnabledCount = Object.values(alertPreferences).filter(Boolean).length;

  const overviewCards = [
    { label: 'Total Cards', value: cards.length, icon: CreditCard },
    {
      label: 'Active Cards',
      value: cards.filter((c) => c.status === 'Active').length,
      icon: CheckCircle2,
    },
    { label: 'Cards With Alerts', value: alertsEnabledCount, icon: Bell },
    { label: 'Expiring Soon', value: overview.expiringSoon || 0, icon: Clock },
  ];

  // ── Card controls grid config ──
  const controlItems = selectedCard
    ? [
        {
          key: 'locked',
          label: 'Lock Card',
          status: selectedCard.controls.locked ? 'Locked' : 'Unlocked',
          on: selectedCard.controls.locked,
          action: () => toggleLock(selectedCard.id),
          toggleLabel: selectedCard.controls.locked ? 'Unlock' : 'Lock',
        },
        {
          key: 'contactless',
          label: 'Contactless Payments',
          status: selectedCard.controls.contactless ? 'On' : 'Off',
          on: selectedCard.controls.contactless,
          action: () => toggleControl(selectedCard.id, 'contactless'),
          toggleLabel: selectedCard.controls.contactless ? 'Turn Off' : 'Turn On',
        },
        {
          key: 'onlinePurchases',
          label: 'Online Purchases',
          status: selectedCard.controls.onlinePurchases ? 'On' : 'Off',
          on: selectedCard.controls.onlinePurchases,
          action: () => toggleControl(selectedCard.id, 'onlinePurchases'),
          toggleLabel: selectedCard.controls.onlinePurchases ? 'Turn Off' : 'Turn On',
        },
        {
          key: 'internationalPurchases',
          label: 'International Purchases',
          status: selectedCard.controls.internationalPurchases ? 'On' : 'Off',
          on: selectedCard.controls.internationalPurchases,
          action: () => toggleControl(selectedCard.id, 'internationalPurchases'),
          toggleLabel: selectedCard.controls.internationalPurchases ? 'Turn Off' : 'Turn On',
        },
        {
          key: 'atmWithdrawals',
          label: 'ATM Withdrawals',
          status: selectedCard.controls.atmWithdrawals ? 'On' : 'Off',
          on: selectedCard.controls.atmWithdrawals,
          action: () => toggleControl(selectedCard.id, 'atmWithdrawals'),
          toggleLabel: selectedCard.controls.atmWithdrawals ? 'Turn Off' : 'Turn On',
        },
        {
          key: 'notifications',
          label: 'Card Notifications',
          status: selectedCard.controls.notifications ? 'On' : 'Off',
          on: selectedCard.controls.notifications,
          action: () => toggleControl(selectedCard.id, 'notifications'),
          toggleLabel: selectedCard.controls.notifications ? 'Turn Off' : 'Turn On',
        },
      ]
    : [];

  // ── Full-page loading ──
  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" strokeWidth={1.75} />
        <p className="text-sm text-muted">Loading your cards…</p>
      </div>
    );
  }

  // ── Full-page error ──
  if (error) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-4">
        <p className="font-serif text-xl font-bold text-deep-accent">
          We couldn&rsquo;t load your cards
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

        {cards.length === 0 ? (
          <div className="border border-hairline bg-faint py-12 text-center">
            <CreditCard className="mx-auto h-8 w-8 text-muted" strokeWidth={1.5} />
            <p className="mt-3 text-sm font-semibold text-deep-accent">No cards yet</p>
            <p className="mt-1 text-xs text-muted">
              Cards issued to you will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => {
              const isSelected = selectedCardId === card.id;
              const isBusy = busyKey === `${card.id}:locked`;
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
                        className={`h-1.5 w-1.5 ${getStatusDot(card.status)}`}
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
                    Linked: {card.linkedAccount || '—'}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-hairline pt-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLock(card.id);
                      }}
                      disabled={isBusy}
                      className="inline-flex min-h-[32px] items-center gap-1.5 border border-hairline bg-white px-3 py-1 text-xs font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-60"
                    >
                      {isBusy ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
                      ) : card.controls.locked ? (
                        <Unlock className="h-3.5 w-3.5" strokeWidth={2} />
                      ) : (
                        <Lock className="h-3.5 w-3.5" strokeWidth={2} />
                      )}
                      {card.controls.locked ? 'Unlock Card' : 'Lock Card'}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCardId(card.id);
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
        )}
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
                  value={selectedCard.linkedAccount || '—'}
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
                          {selectedCard.creditLimit > 0
                            ? Math.round(
                                (Math.abs(selectedCard.balance) / selectedCard.creditLimit) * 100
                              )
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-hairline">
                        <div
                          className="h-full transition-[width] duration-300"
                          style={{
                            width: `${
                              selectedCard.creditLimit > 0
                                ? Math.min(
                                    (Math.abs(selectedCard.balance) / selectedCard.creditLimit) * 100,
                                    100
                                  )
                                : 0
                            }%`,
                            backgroundColor:
                              selectedCard.creditLimit > 0 &&
                              Math.abs(selectedCard.balance) / selectedCard.creditLimit > 0.8
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
                                {tx.merchant || tx.company || 'Card Activity'}
                              </div>
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                                <span>{tx.category || tx.description || '—'}</span>
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

                <Link
                  to="/transactions"
                  className="mt-3 inline-flex items-center gap-1 self-start text-sm font-semibold text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  View All Transactions
                  <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.25} />
                </Link>
              </div>
            </div>

            {/* Card Controls */}
            <div className="mt-8 border-t border-hairline pt-6">
              <h3 className="mb-4 font-serif text-base font-bold text-deep-accent sm:text-lg">
                Card Controls
              </h3>
              <div className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
                {controlItems.map((item) => {
                  const isBusy = busyKey === `${selectedCard.id}:${item.key}`;
                  return (
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
                        disabled={isBusy}
                        className="shrink-0 border border-hairline bg-white px-2.5 py-1 text-xs font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-60"
                      >
                        {isBusy ? (
                          <Loader2 className="h-3 w-3 animate-spin inline" strokeWidth={2} />
                        ) : (
                          item.toggleLabel
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
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
          {Object.entries(ALERT_LABELS).map(([key, label]) => {
            const enabled = alertPreferences[key] === true;
            const isBusy = busyKey === `alert:${key}`;
            return (
              <div key={key} className="flex items-center gap-3 py-3">
                <span
                  className={`h-1.5 w-1.5 shrink-0 ${
                    enabled ? 'bg-primary' : 'bg-[#d9534f]'
                  }`}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-deep-accent">
                  {label}
                </span>
                <span
                  className={`shrink-0 text-xs font-bold uppercase tracking-wide ${
                    enabled ? 'text-primary' : 'text-[#d9534f]'
                  }`}
                >
                  {enabled ? 'ON' : 'OFF'}
                </span>
                <button
                  type="button"
                  onClick={() => toggleAlert(key)}
                  disabled={isBusy}
                  className="shrink-0 border border-hairline bg-white px-2.5 py-1 text-xs font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-60"
                >
                  {isBusy ? (
                    <Loader2 className="h-3 w-3 animate-spin inline" strokeWidth={2} />
                  ) : enabled ? (
                    'Turn Off'
                  ) : (
                    'Turn On'
                  )}
                </button>
              </div>
            );
          })}
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
                {revealed?.fullNumber
                  ? formatFullNumber(revealed.fullNumber)
                  : `•••• •••• •••• ${selectedCard.lastFour}`}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-white/80">
                <span>Cardholder: {selectedCard.cardholderName}</span>
                <span>Expires: {formatExpiration(selectedCard.expirationDate)}</span>
                {revealed?.cvv && <span>CVV: {revealed.cvv}</span>}
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
                onClick={handleShowFullNumber}
                disabled={revealing}
                className="inline-flex min-h-[40px] items-center justify-center gap-1.5 border border-hairline bg-white px-4 py-2 text-sm font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-60"
              >
                {revealing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
                ) : (
                  <Eye className="h-3.5 w-3.5" strokeWidth={2} />
                )}
                {revealed?.fullNumber ? 'Hide Full Number' : 'Show Full Number'}
              </button>
              <button
                type="button"
                onClick={handleShowCvv}
                disabled={revealing}
                className="inline-flex min-h-[40px] items-center justify-center gap-1.5 border border-hairline bg-white px-4 py-2 text-sm font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-60"
              >
                {revealing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
                ) : (
                  <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2} />
                )}
                {revealed?.cvv ? 'Hide CVV' : 'View CVV'}
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
                    autoComplete="off"
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
                  autoComplete="off"
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