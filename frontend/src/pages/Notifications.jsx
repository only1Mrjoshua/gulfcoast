// src/pages/Notifications.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Search,
  X,
  Trash2,
  Inbox,
  ShieldCheck,
  CheckCheck,
  Lock,
  TrendingUp,
  Gift,
  Landmark,
  Info,
  Loader2,
  Settings,
  CreditCard,
  Wallet,
} from 'lucide-react';
import { apiFetch } from '../utils/api';

const CARD_ALERT_OPTIONS = [
  { key: 'largePurchase',            label: 'Large Purchase' },
  { key: 'cardTransaction',          label: 'Card Transaction' },
  { key: 'internationalTransaction', label: 'International Transaction' },
  { key: 'onlinePurchase',           label: 'Online Purchase' },
  { key: 'atmWithdrawal',            label: 'ATM Withdrawal' },
  { key: 'paymentDue',               label: 'Payment Due' },
  { key: 'cardExpiration',           label: 'Card Expiration' },
];

const LOAN_ALERT_OPTIONS = [
  { key: 'paymentReminder',    label: 'Payment Reminder' },
  { key: 'dueDateAlert',       label: 'Due Date Alert' },
  { key: 'interestRateChange', label: 'Interest Rate Change' },
  { key: 'payoffNotification', label: 'Payoff Notification' },
];

const notificationCategories = [
  { value: 'All Notifications', label: 'All Notifications' },
  { value: 'Unread',            label: 'Unread' },
  { value: 'Account',           label: 'Account' },
  { value: 'Transaction',       label: 'Transactions' },
  { value: 'Security',          label: 'Security' },
  { value: 'Promotions',        label: 'Promotions' },
  { value: 'Card',              label: 'Card' },
  { value: 'Loan',              label: 'Loan' },
  { value: 'Deposit',           label: 'Deposit' },
  { value: 'Transfer',          label: 'Transfer' },
  { value: 'Payment',           label: 'Payment' },
];

const parseDate = (s) => {
  if (!s) return null;
  return s.includes('T') ? new Date(s) : new Date(s + 'T00:00:00');
};

const formatDate = (dateStr) => {
  const date = parseDate(dateStr);
  if (!date || Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatDateLong = (dateStr) => {
  const date = parseDate(dateStr);
  if (!date || Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getTypeIcon = (category) => {
  switch (category) {
    case 'Security':    return Lock;
    case 'Transaction': return TrendingUp;
    case 'Promotions':  return Gift;
    case 'Account':     return Landmark;
    case 'Card':        return CreditCard;
    case 'Loan':        return Landmark;
    case 'Deposit':     return Wallet;
    case 'Transfer':    return TrendingUp;
    case 'Payment':     return TrendingUp;
    default:            return Bell;
  }
};

const Notifications = () => {
  // Data
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // UI state
  const [selectedCategory, setSelectedCategory] = useState('All Notifications');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Preferences
  const [preferences, setPreferences] = useState({
    account: true,
    transaction: true,
    promotions: true,
    security: true,
    deposit: true,
    transfer: true,
    payment: true,
    card: {
      largePurchase: true,
      cardTransaction: true,
      internationalTransaction: true,
      onlinePurchase: true,
      atmWithdrawal: true,
      paymentDue: true,
      cardExpiration: true,
    },
    loan: {
      paymentReminder: true,
      dueDateAlert: true,
      interestRateChange: true,
      payoffNotification: true,
    },
  });
  const [showPreferences, setShowPreferences] = useState(false);
  const [prefSaving, setPrefSaving] = useState(false);

  // Load
  const loadNotifications = useCallback(async () => {
    const res = await apiFetch('/notifications');
    const d = res?.data ?? res;
    setNotifications(d.notifications ?? []);
    if (d.preferences) {
      setPreferences((prev) => ({ ...prev, ...d.preferences }));
    }
  }, []);

  useEffect(() => {
    const boot = async () => {
      try {
        setLoading(true);
        setError('');
        await loadNotifications();
      } catch (err) {
        console.error('❌ Failed to load notifications:', err);
        setError(err.message || 'Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };
    boot();
  }, [loadNotifications]);

  // Filter
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    if (selectedCategory === 'Unread') {
      filtered = filtered.filter((n) => !n.read);
    } else if (selectedCategory !== 'All Notifications') {
      filtered = filtered.filter((n) => n.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q)
      );
    }

    return [...filtered].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  }, [notifications, selectedCategory, searchQuery]);

  const selectedNotification = notifications.find(
    (n) => n.id === selectedNotificationId
  );

  // Handlers
  const handleOpenNotification = async (id) => {
    setSelectedNotificationId(id);

    const target = notifications.find((n) => n.id === id);
    if (!target || target.read) return;

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    try {
      await apiFetch(`/notifications/${id}/read`, { method: 'PUT' });
    } catch (err) {
      console.error('❌ Mark read failed:', err);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: false } : n))
      );
    }
  };

  const handleCloseNotification = () => setSelectedNotificationId(null);

  const handleDelete = async () => {
    if (!selectedNotification) return;
    setActionLoading(true);

    try {
      await apiFetch(`/notifications/${selectedNotification.id}`, {
        method: 'DELETE',
      });
      setNotifications((prev) =>
        prev.filter((n) => n.id !== selectedNotification.id)
      );
      setSelectedNotificationId(null);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error('❌ Delete failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    setActionLoading(true);
    try {
      await apiFetch('/notifications/read-all', { method: 'PUT' });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('❌ Mark-all-read failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Preferences
  const togglePreference = (path) => {
    setPreferences((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      if (path.includes('.')) {
        const [parent, child] = path.split('.');
        next[parent][child] = !next[parent][child];
      } else {
        next[path] = !next[path];
      }
      return next;
    });
  };

  const handleSavePreferences = async () => {
    setPrefSaving(true);
    try {
      await apiFetch('/notifications/preferences', {
        method: 'PUT',
        body: JSON.stringify(preferences),
      });
      await loadNotifications();
      setShowPreferences(false);
    } catch (err) {
      console.error('❌ Save preferences failed:', err);
    } finally {
      setPrefSaving(false);
    }
  };

  // Stats
  const unreadCount = notifications.filter((n) => !n.read).length;
  const importantCount = notifications.filter(
    (n) => n.priority === 'Important'
  ).length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = notifications.filter(
    (n) => (n.date || '').slice(0, 10) === todayStr
  ).length;
  const totalCount = notifications.length;

  const overviewCards = [
    { label: 'Unread', value: unreadCount, icon: Bell },
    { label: 'Important', value: importantCount, icon: AlertCircle },
    { label: 'Today', value: todayCount, icon: CheckCircle2 },
    { label: 'Total', value: totalCount, icon: Inbox },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" strokeWidth={1.75} />
        <p className="text-sm text-muted">Loading your notifications…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-4">
        <p className="font-serif text-xl font-bold text-deep-accent">
          We couldn&rsquo;t load your notifications
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
            Notifications
          </h1>
          <p className="mt-1 text-sm text-body sm:text-base">
            Stay up to date with account alerts, security notices, and important
            updates.
          </p>
        </div>
        <button
          type="button"
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0 || actionLoading}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:bg-muted/40"
        >
          <CheckCheck className="h-4 w-4" strokeWidth={2.25} />
          Mark All as Read
        </button>
      </div>

      {/* Overview */}
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

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 border border-hairline bg-faint p-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4">
        <div className="flex flex-col gap-1.5 sm:min-w-[200px]">
          <label
            htmlFor="categorySelect"
            className="text-xs font-semibold text-deep-accent"
          >
            Filter
          </label>
          <select
            id="categorySelect"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
          >
            {notificationCategories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-1 flex-col gap-1.5">
          <label
            htmlFor="searchInput"
            className="text-xs font-semibold text-deep-accent"
          >
            Search
          </label>
          <div className="flex items-center border border-hairline bg-white focus-within:border-primary">
            <Search className="ml-3 h-4 w-4 shrink-0 text-muted" strokeWidth={2} />
            <input
              type="text"
              id="searchInput"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="min-h-[38px] w-full border-none bg-transparent px-2 py-1.5 text-sm text-deep-accent outline-none placeholder:text-muted/70"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mr-2 inline-flex h-6 w-6 items-center justify-center text-muted hover:text-deep-accent"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2.25} />
              </button>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowPreferences(true)}
          className="inline-flex min-h-[38px] items-center gap-1.5 border border-hairline bg-white px-4 py-1.5 text-sm font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <Settings className="h-3.5 w-3.5" strokeWidth={2} />
          Manage Alerts
        </button>
      </div>

      {/* Notification Container */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.8fr] lg:min-h-[400px]">
        {/* List */}
        <div className="max-h-[340px] overflow-y-auto border border-hairline bg-white lg:max-h-[600px]">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center">
              <Inbox className="mx-auto h-8 w-8 text-muted" strokeWidth={1.5} />
              <p className="mt-3 text-sm font-semibold text-deep-accent">
                You&rsquo;re all caught up
              </p>
              <p className="mx-auto mt-1 max-w-xs px-4 text-xs text-muted">
                New alerts and account notifications will appear here.
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const isSelected = selectedNotificationId === notification.id;
              const TypeIcon = getTypeIcon(notification.category);
              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleOpenNotification(notification.id)}
                  className={`flex w-full flex-col gap-1 border-b border-faint px-4 py-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40 ${
                    isSelected
                      ? 'border-l-[3px] border-l-primary bg-[#e8f0f2] pl-[13px]'
                      : 'border-l-[3px] border-l-transparent hover:bg-faint'
                  } ${!notification.read ? 'bg-[#f4f8fa]' : 'bg-white'}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex min-w-0 items-center gap-2">
                      <TypeIcon
                        className="h-3.5 w-3.5 shrink-0 text-primary"
                        strokeWidth={2}
                      />
                      <span className="truncate text-xs font-semibold uppercase tracking-wide text-deep-accent sm:text-[11px]">
                        {notification.category}
                      </span>
                    </span>
                    <span className="shrink-0 text-[11px] text-muted sm:text-xs">
                      {formatDate(notification.date)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <span
                        className="h-2 w-2 shrink-0 bg-primary"
                        aria-hidden="true"
                      />
                    )}
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                      {notification.title}
                    </span>
                    {notification.priority === 'Important' && (
                      <span className="shrink-0 bg-[#d9534f] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        Important
                      </span>
                    )}
                  </div>

                  <div className="truncate text-xs text-body sm:text-sm">
                    {notification.preview}
                  </div>

                  {!notification.read && (
                    <div className="mt-1 flex items-center gap-2">
                      <span className="inline-block bg-[#e7f3f5] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                        Unread
                      </span>
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Detail View */}
        {selectedNotification ? (
          <div className="relative max-h-[600px] overflow-y-auto border border-hairline bg-white p-5 sm:p-6">
            <button
              type="button"
              onClick={handleCloseNotification}
              aria-label="Close"
              className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-faint hover:text-deep-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <X className="h-4 w-4" strokeWidth={2.25} />
            </button>

            <div className="flex flex-col gap-4 pr-8">
              {/* Header */}
              <div className="border-b border-hairline pb-3">
                <div className="mb-2 inline-flex items-center gap-1.5 bg-faint px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-body">
                  {React.createElement(getTypeIcon(selectedNotification.category), {
                    className: 'h-3 w-3 text-primary',
                    strokeWidth: 2,
                  })}
                  {selectedNotification.category}
                </div>
                <h2 className="font-serif text-lg font-bold text-deep-accent sm:text-xl">
                  {selectedNotification.title}
                </h2>
                <div className="mt-2 flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-xs text-muted sm:text-sm">
                    {formatDateLong(selectedNotification.date)}
                  </span>
                </div>
                {selectedNotification.priority === 'Important' && (
                  <span className="mt-2 inline-block bg-[#d9534f] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    Important
                  </span>
                )}
              </div>

              {/* Body */}
              <div className="text-sm leading-relaxed text-ink sm:text-base">
                {selectedNotification.message.split('\n').map((line, idx) => (
                  <p key={idx} className="mb-2 last:mb-0">
                    {line}
                  </p>
                ))}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 border-t border-hairline pt-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex min-h-[36px] items-center gap-1.5 border border-hairline bg-white px-4 py-1.5 text-xs font-semibold text-[#d9534f] transition-colors hover:border-[#d9534f] hover:bg-[#fdf2f2] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d9534f]/40 sm:text-sm"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                  Delete
                </button>
              </div>

              {/* Help footer */}
              <div className="flex items-start gap-2.5 border-t border-hairline pt-3">
                <Info
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
                  strokeWidth={1.75}
                />
                <p className="text-xs text-body sm:text-sm">
                  Need help with this notification? Visit the Help Center or
                  contact support for assistance.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex max-h-[200px] flex-col items-center justify-center border border-hairline bg-white p-8 text-center lg:max-h-[600px]">
            <Bell className="h-8 w-8 text-muted" strokeWidth={1.5} />
            <p className="mt-3 text-sm text-body">
              Select a notification to view its details.
            </p>
          </div>
        )}
      </div>

      {/* Security notice */}
      <div className="flex items-start gap-3 border border-hairline bg-faint px-4 py-3">
        <ShieldCheck
          className="mt-0.5 h-4 w-4 shrink-0 text-primary"
          strokeWidth={1.75}
        />
        <p className="text-xs text-body sm:text-sm">
          Notifications are secured with bank-grade encryption. We will never ask
          for your password, PIN, or full account number by notification.
        </p>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedNotification && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-[500px] overflow-y-auto border border-hairline bg-white p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              aria-label="Close"
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-faint hover:text-deep-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <X className="h-4 w-4" strokeWidth={2.25} />
            </button>

            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#fdf2f2] text-[#d9534f]">
                <AlertCircle className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <h2 className="font-serif text-xl font-bold text-deep-accent sm:text-2xl">
                  Delete Notification
                </h2>
                <p className="mt-1 text-sm text-body">
                  Are you sure you want to delete &ldquo;
                  {selectedNotification.title}&rdquo;?
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-start gap-3 border border-hairline bg-faint px-4 py-3">
              <Info
                className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                strokeWidth={1.75}
              />
              <p className="text-xs text-body sm:text-sm">
                This notification will be permanently removed and cannot be
                restored.
              </p>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-hairline pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={actionLoading}
                className="min-h-[40px] border border-hairline bg-white px-5 py-2 text-sm font-semibold text-deep-accent transition-colors hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={actionLoading}
                className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-[#d9534f] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#c9302c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d9534f]/50 disabled:opacity-70"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.25} />
                ) : (
                  <Trash2 className="h-4 w-4" strokeWidth={2.25} />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Preferences Modal */}
      {showPreferences && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4"
          onClick={() => !prefSaving && setShowPreferences(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-[520px] overflow-y-auto border border-hairline bg-white p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => !prefSaving && setShowPreferences(false)}
              disabled={prefSaving}
              aria-label="Close"
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-faint hover:text-deep-accent disabled:opacity-40"
            >
              <X className="h-4 w-4" strokeWidth={2.25} />
            </button>

            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#e7f3f5] text-primary">
                <Settings className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <h2 className="font-serif text-xl font-bold text-deep-accent">
                  Alert Preferences
                </h2>
                <p className="mt-1 text-sm text-body">
                  Choose which alerts you want to see.
                </p>
              </div>
            </div>

            {/* General */}
            <div className="mt-6">
              <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted">
                General
              </h3>
              <div className="flex flex-col divide-y divide-faint border-y border-hairline">
                {[
                  { key: 'account',     label: 'Account Alerts' },
                  { key: 'transaction', label: 'Transaction Alerts' },
                  { key: 'promotions',  label: 'Promotions' },
                  { key: 'security',    label: 'Security Alerts' },
                  { key: 'deposit',     label: 'Deposit Alerts' },
                  { key: 'transfer',    label: 'Transfer Alerts' },
                  { key: 'payment',     label: 'Payment Alerts' },
                ].map(({ key, label }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between py-2.5"
                  >
                    <span className="text-sm font-semibold text-deep-accent">
                      {label}
                    </span>
                    <button
                      type="button"
                      onClick={() => togglePreference(key)}
                      className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors ${
                        preferences[key]
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-hairline bg-faint text-muted'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 ${
                          preferences[key] ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                      {preferences[key] ? 'ON' : 'OFF'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Card alerts */}
            <div className="mt-6">
              <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted">
                Card Alerts
              </h3>
              <div className="flex flex-col divide-y divide-faint border-y border-hairline">
                {CARD_ALERT_OPTIONS.map(({ key, label }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between py-2.5"
                  >
                    <span className="text-sm font-semibold text-deep-accent">
                      {label}
                    </span>
                    <button
                      type="button"
                      onClick={() => togglePreference(`card.${key}`)}
                      className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors ${
                        preferences.card[key]
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-hairline bg-faint text-muted'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 ${
                          preferences.card[key] ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                      {preferences.card[key] ? 'ON' : 'OFF'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Loan alerts */}
            <div className="mt-6">
              <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted">
                Loan Alerts
              </h3>
              <div className="flex flex-col divide-y divide-faint border-y border-hairline">
                {LOAN_ALERT_OPTIONS.map(({ key, label }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between py-2.5"
                  >
                    <span className="text-sm font-semibold text-deep-accent">
                      {label}
                    </span>
                    <button
                      type="button"
                      onClick={() => togglePreference(`loan.${key}`)}
                      className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors ${
                        preferences.loan[key]
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-hairline bg-faint text-muted'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 ${
                          preferences.loan[key] ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                      {preferences.loan[key] ? 'ON' : 'OFF'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-hairline pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                disabled={prefSaving}
                className="min-h-[40px] border border-hairline bg-white px-5 py-2 text-sm font-semibold text-deep-accent transition-colors hover:bg-faint disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePreferences}
                disabled={prefSaving}
                className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-deep disabled:opacity-70"
              >
                {prefSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.25} />
                ) : (
                  <CheckCircle2 className="h-4 w-4" strokeWidth={2.25} />
                )}
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;