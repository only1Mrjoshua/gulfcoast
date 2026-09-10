// src/pages/Notifications.jsx
import React, { useState, useMemo } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Search,
  X,
  Archive,
  Trash2,
  ChevronRight,
  Inbox,
  ShieldCheck,
  CheckCheck,
  Lock,
  TrendingUp,
  Gift,
  Landmark,
  Info,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Mock notification data (kept inline so this page is self-contained)
// ---------------------------------------------------------------------------
const mockNotifications = [
  {
    id: 'n1',
    title: 'Large transaction alert',
    preview: 'A purchase of $842.10 was made on your Rewards Visa •••• 2208.',
    body: 'A purchase of $842.10 was made on your Rewards Visa •••• 2208 at Best Buy.\n\nIf you did not authorize this transaction, please contact us immediately at 1-800-555-0142.',
    type: 'Transactions',
    date: '2025-06-14',
    read: false,
    priority: 'high',
  },
  {
    id: 'n2',
    title: 'New device signed in',
    preview: 'A new sign-in was detected from an unrecognized device.',
    body: 'A new sign-in to your account was detected from an unrecognized device.\n\nDevice: Chrome on Windows\nLocation: Mobile, AL\nTime: June 14, 2025 at 9:42 AM\n\nIf this was you, no action is needed. If not, secure your account immediately.',
    type: 'Security',
    date: '2025-06-14',
    read: false,
    priority: 'high',
  },
  {
    id: 'n3',
    title: 'Direct deposit received',
    preview: 'Your paycheck of $2,450.00 was deposited into Checking •••• 4821.',
    body: 'Your paycheck of $2,450.00 was deposited into Checking •••• 4821.\n\nYour available balance has been updated.',
    type: 'Transactions',
    date: '2025-06-13',
    read: false,
    priority: 'normal',
  },
  {
    id: 'n4',
    title: 'Statement ready',
    preview: 'Your May statement for Savings •••• 9134 is now available.',
    body: 'Your May statement for Savings •••• 9134 is now available to view and download.\n\nStatements are available for 24 months in your account documents.',
    type: 'Account',
    date: '2025-06-12',
    read: true,
    priority: 'normal',
  },
  {
    id: 'n5',
    title: 'Payment due reminder',
    preview: 'Your Auto Loan •••• 3812 payment of $389.00 is due June 20.',
    body: 'Your Auto Loan •••• 3812 payment of $389.00 is due on June 20, 2025.\n\nSet up autopay to avoid missing a payment.',
    type: 'Account',
    date: '2025-06-11',
    read: false,
    priority: 'normal',
  },
  {
    id: 'n6',
    title: 'You earned 1,200 reward points',
    preview: 'Your recent purchases earned 1,200 points on your Rewards Visa.',
    body: 'Your recent purchases earned 1,200 reward points on your Rewards Visa •••• 2208.\n\nRedeem points for statement credits, travel, and more.',
    type: 'Promotions',
    date: '2025-06-10',
    read: true,
    priority: 'normal',
  },
  {
    id: 'n7',
    title: 'Password changed successfully',
    preview: 'Your online banking password was changed on June 9.',
    body: 'Your online banking password was changed on June 9, 2025 at 3:18 PM.\n\nIf you did not make this change, contact us immediately.',
    type: 'Security',
    date: '2025-06-09',
    read: true,
    priority: 'normal',
  },
  {
    id: 'n8',
    title: 'Low balance warning',
    preview: 'Checking •••• 4821 balance fell below your $500 alert threshold.',
    body: 'Your Checking •••• 4821 balance fell below your $500 alert threshold.\n\nCurrent balance: $412.87\n\nConsider transferring funds to avoid overdraft fees.',
    type: 'Account',
    date: '2025-06-08',
    read: true,
    priority: 'high',
  },
];

const notificationCategories = [
  'All Notifications',
  'Unread',
  'Transactions',
  'Security',
  'Account',
  'Promotions',
];

const formatDate = (dateStr) => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatDateLong = (dateStr) => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getTypeIcon = (type) => {
  switch (type) {
    case 'Security':
      return Lock;
    case 'Transactions':
      return TrendingUp;
    case 'Promotions':
      return Gift;
    case 'Account':
      return Landmark;
    default:
      return Bell;
  }
};

const Notifications = () => {
  // State
  const [notifications, setNotifications] = useState(mockNotifications);
  const [selectedCategory, setSelectedCategory] = useState('All Notifications');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    if (selectedCategory === 'Unread') {
      filtered = filtered.filter((n) => !n.read);
    } else if (selectedCategory !== 'All Notifications') {
      filtered = filtered.filter((n) => n.type === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.preview.toLowerCase().includes(query) ||
          n.body.toLowerCase().includes(query)
      );
    }

    filtered = [...filtered].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    return filtered;
  }, [notifications, selectedCategory, searchQuery]);

  // Selected notification
  const selectedNotification = notifications.find(
    (n) => n.id === selectedNotificationId
  );

  // Handlers
  const handleOpenNotification = (id) => {
    setSelectedNotificationId(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleCloseNotification = () => {
    setSelectedNotificationId(null);
  };

  const handleArchive = () => {
    if (!selectedNotification) return;
    setNotifications((prev) =>
      prev.filter((n) => n.id !== selectedNotification.id)
    );
    setSelectedNotificationId(null);
  };

  const handleDelete = () => {
    if (!selectedNotification) return;
    setNotifications((prev) =>
      prev.filter((n) => n.id !== selectedNotification.id)
    );
    setSelectedNotificationId(null);
    setShowDeleteConfirm(false);
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Overview stats
  const unreadCount = notifications.filter((n) => !n.read).length;
  const importantCount = notifications.filter(
    (n) => n.priority === 'high'
  ).length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = notifications.filter((n) => n.date === todayStr).length;
  const totalCount = notifications.length;

  const overviewCards = [
    { label: 'Unread', value: unreadCount, icon: Bell },
    { label: 'Important', value: importantCount, icon: AlertCircle },
    { label: 'Today', value: todayCount, icon: CheckCircle2 },
    { label: 'Total', value: totalCount, icon: Inbox },
  ];

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
          disabled={unreadCount === 0}
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
            {notificationCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
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
              const TypeIcon = getTypeIcon(notification.type);
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
                        {notification.type}
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
                    {notification.priority === 'high' && (
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
                  {React.createElement(getTypeIcon(selectedNotification.type), {
                    className: 'h-3 w-3 text-primary',
                    strokeWidth: 2,
                  })}
                  {selectedNotification.type}
                </div>
                <h2 className="font-serif text-lg font-bold text-deep-accent sm:text-xl">
                  {selectedNotification.title}
                </h2>
                <div className="mt-2 flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-xs text-muted sm:text-sm">
                    {formatDateLong(selectedNotification.date)}
                  </span>
                </div>
                {selectedNotification.priority === 'high' && (
                  <span className="mt-2 inline-block bg-[#d9534f] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    Important
                  </span>
                )}
              </div>

              {/* Body */}
              <div className="text-sm leading-relaxed text-ink sm:text-base">
                {selectedNotification.body.split('\n').map((line, idx) => (
                  <p key={idx} className="mb-2 last:mb-0">
                    {line}
                  </p>
                ))}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 border-t border-hairline pt-3">
                <button
                  type="button"
                  onClick={handleArchive}
                  className="inline-flex min-h-[36px] items-center gap-1.5 border border-hairline bg-white px-4 py-1.5 text-xs font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:text-sm"
                >
                  <Archive className="h-3.5 w-3.5" strokeWidth={2} />
                  Archive
                </button>
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
                className="min-h-[40px] border border-hairline bg-white px-5 py-2 text-sm font-semibold text-deep-accent transition-colors hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-[#d9534f] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#c9302c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d9534f]/50"
              >
                <Trash2 className="h-4 w-4" strokeWidth={2.25} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;