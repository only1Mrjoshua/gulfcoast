// src/pages/admin/ManageNotifications.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Filter, Bell, X, Send,
  AlertCircle, CheckCircle2, Tag, FileText, Calendar, Loader2,
} from 'lucide-react';
import { apiFetch } from '../../utils/api';

const ADMIN_CATEGORIES = [
  { value: 'Account',     label: 'Account' },
  { value: 'Transaction', label: 'Transaction' },
  { value: 'Promotions',  label: 'Promotions' },
  { value: 'Security',    label: 'Security' },
  { value: 'Card',        label: 'Card' },
  { value: 'Loan',        label: 'Loan' },
];

const CARD_SUBCATEGORIES = [
  { key: 'largePurchase',            label: 'Large Purchase' },
  { key: 'cardTransaction',          label: 'Card Transaction' },
  { key: 'internationalTransaction', label: 'International Transaction' },
  { key: 'onlinePurchase',           label: 'Online Purchase' },
  { key: 'atmWithdrawal',            label: 'ATM Withdrawal' },
  { key: 'paymentDue',               label: 'Payment Due' },
  { key: 'cardExpiration',           label: 'Card Expiration' },
];

const LOAN_SUBCATEGORIES = [
  { key: 'paymentReminder',    label: 'Payment Reminder' },
  { key: 'dueDateAlert',       label: 'Due Date Alert' },
  { key: 'interestRateChange', label: 'Interest Rate Change' },
  { key: 'payoffNotification', label: 'Payoff Notification' },
];

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const s = String(dateStr);
  const d = s.includes('T') ? new Date(s) : new Date(s + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const todayISO = () => new Date().toISOString().split('T')[0];

const emptyForm = {
  category: 'Account',
  subCategory: '',
  title: '',
  date: todayISO(),
  priority: 'Normal',
  message: '',
};

const ManageNotifications = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const [newNotification, setNewNotification] = useState({ ...emptyForm });
  const [formError, setFormError] = useState('');

  // ────────────────────────────────────────────────────────
  const loadUsers = useCallback(async () => {
    const res = await apiFetch('/admin/notifications');
    const d = res?.data ?? res;
    setUsers(d.users ?? []);
  }, []);

  useEffect(() => {
    const boot = async () => {
      try {
        setLoading(true);
        setError('');
        await loadUsers();
      } catch (err) {
        console.error('❌ Failed to load notifications:', err);
        setError(err.message || 'Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };
    boot();
  }, [loadUsers]);

  const filteredUsers = users.filter(
    (u) =>
      (u.user || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentCategoryHasSub =
    newNotification.category === 'Card' ||
    newNotification.category === 'Loan';

  const currentSubOptions =
    newNotification.category === 'Card'
      ? CARD_SUBCATEGORIES
      : newNotification.category === 'Loan'
      ? LOAN_SUBCATEGORIES
      : [];

  const handleManageClick = async (user) => {
    setSelectedUser(JSON.parse(JSON.stringify(user)));
    setSendSuccess(false);
    setFormError('');
    setNewNotification({ ...emptyForm });
    setIsModalOpen(true);
    setDetailLoading(true);

    try {
      const res = await apiFetch(`/admin/notifications/${user.id}`);
      const d = res?.data ?? res;
      const detail = d?.user;
      if (detail) {
        setSelectedUser((prev) => ({
          ...(prev || {}),
          ...user,
          notifications: detail.notifications || [],
        }));
      }
    } catch (err) {
      console.error('❌ Failed to load user notifications:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSendNotification = async () => {
    if (!selectedUser) return;
    if (!newNotification.title.trim() || !newNotification.message.trim()) return;
    if (currentCategoryHasSub && !newNotification.subCategory) {
      setFormError('Please select a subcategory');
      return;
    }

    setSending(true);
    setFormError('');

    try {
      await apiFetch(`/admin/notifications/${selectedUser.id}`, {
        method: 'POST',
        body: JSON.stringify({
          category: newNotification.category,
          subCategory: newNotification.subCategory || null,
          title: newNotification.title.trim(),
          message: newNotification.message.trim(),
          date: newNotification.date,
          priority: newNotification.priority,
        }),
      });

      // Refresh detail
      const res = await apiFetch(`/admin/notifications/${selectedUser.id}`);
      const d = res?.data ?? res;
      const detail = d?.user;
      if (detail) {
        setSelectedUser((prev) => ({
          ...(prev || {}),
          notifications: detail.notifications || [],
        }));
      }

      await loadUsers();

      setSendSuccess(true);
      setNewNotification({ ...emptyForm });
      setTimeout(() => setSendSuccess(false), 3000);
    } catch (err) {
      setFormError(err.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const getPriorityBadge = (priority) => {
    if (priority === 'Important') {
      return (
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-[#d9534f]">
          <AlertCircle className="h-3 w-3" />
          Important
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-muted">
        <CheckCircle2 className="h-3 w-3" />
        Normal
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" strokeWidth={1.75} />
        <p className="text-sm text-muted">Loading notifications…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-4">
        <p className="font-serif text-xl font-bold text-deep-accent">
          We couldn&rsquo;t load notifications
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
    <div className="mx-auto max-w-[1400px]">
      <div className="mb-6 flex flex-col gap-4 border-b border-hairline pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold leading-tight text-deep-accent sm:text-3xl">
            Manage Notifications
          </h1>
          <p className="mt-1 text-sm text-body">
            Send system alerts and manage notification history for each user.
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center border border-hairline bg-white px-3 focus-within:border-primary">
          <Search className="h-4 w-4 text-muted" strokeWidth={2} />
          <input
            type="text"
            placeholder="Search by user name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="min-h-[40px] w-full border-none bg-transparent px-3 py-2 text-sm text-deep-accent outline-none placeholder:text-muted/60"
          />
        </div>
        <button className="inline-flex min-h-[40px] items-center justify-center gap-2 border border-hairline bg-white px-4 py-2 text-sm font-semibold text-deep-accent hover:bg-faint">
          <Filter className="h-4 w-4" strokeWidth={2} /> Filter
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-hairline bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-hairline bg-faint/50 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">User</th>
              <th className="px-5 py-3 font-semibold">Total Notifications</th>
              <th className="px-5 py-3 font-semibold">Last Notification</th>
              <th className="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-faint">
            {filteredUsers.map((u) => {
              const last = u.lastNotification;
              return (
                <tr key={u.id} className="transition-colors hover:bg-faint/30">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-deep-accent">{u.user}</div>
                    <div className="text-xs text-muted">{u.id}</div>
                  </td>
                  <td className="px-5 py-4 font-semibold text-deep-accent">
                    {u.totalNotifications ?? 0}
                  </td>
                  <td className="px-5 py-4">
                    {last ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-semibold text-body">
                          {last.title}
                        </span>
                        <span className="text-[10px] text-muted">
                          {formatDate(last.date)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted">No notifications</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => handleManageClick(u)}
                      className="inline-flex h-8 items-center gap-2 border border-hairline bg-white px-3 py-1 text-xs font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint"
                    >
                      <Bell className="h-3.5 w-3.5" strokeWidth={2} /> Manage
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-muted">No users found.</div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && selectedUser && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4"
          onClick={() => !sending && setIsModalOpen(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-[800px] overflow-y-auto border border-hairline bg-white p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => !sending && setIsModalOpen(false)}
              disabled={sending}
              className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-faint hover:text-deep-accent disabled:opacity-40"
            >
              <X className="h-4 w-4" strokeWidth={2.25} />
            </button>

            <div className="flex items-start gap-3 mb-6 border-b border-hairline pb-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#e7f3f5] text-primary">
                <Bell className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <h2 className="font-serif text-xl font-bold text-deep-accent">
                  Manage Notifications
                </h2>
                <p className="mt-1 text-sm text-body">
                  {selectedUser.user} • {selectedUser.id}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-8">
              {/* Send new */}
              <div className="border border-hairline bg-faint/30 p-5">
                <h3 className="mb-4 font-serif text-lg font-bold text-deep-accent flex items-center gap-2">
                  <Send className="h-4 w-4 text-primary" /> Send New Notification
                </h3>

                {sendSuccess && (
                  <div className="mb-4 flex items-start gap-2 border border-[#c3e6cb] bg-[#d4edda] px-4 py-2.5">
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#155724]"
                      strokeWidth={2}
                    />
                    <span className="text-sm text-[#155724]">
                      Notification sent successfully!
                    </span>
                  </div>
                )}

                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-deep-accent flex items-center gap-1.5">
                        <Tag className="h-3 w-3" /> Category
                      </label>
                      <select
                        value={newNotification.category}
                        onChange={(e) =>
                          setNewNotification({
                            ...newNotification,
                            category: e.target.value,
                            subCategory: '',
                          })
                        }
                        className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                      >
                        {ADMIN_CATEGORIES.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-deep-accent flex items-center gap-1.5">
                        <FileText className="h-3 w-3" /> Title
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Large Transaction Alert"
                        value={newNotification.title}
                        onChange={(e) =>
                          setNewNotification({
                            ...newNotification,
                            title: e.target.value,
                          })
                        }
                        className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                      />
                    </div>

                    {currentCategoryHasSub && (
                      <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <label className="text-xs font-semibold text-deep-accent flex items-center gap-1.5">
                          <Tag className="h-3 w-3" /> Subcategory
                        </label>
                        <select
                          value={newNotification.subCategory}
                          onChange={(e) =>
                            setNewNotification({
                              ...newNotification,
                              subCategory: e.target.value,
                            })
                          }
                          className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                        >
                          <option value="">Select subcategory</option>
                          {currentSubOptions.map((s) => (
                            <option key={s.key} value={s.key}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-deep-accent flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" /> Date
                      </label>
                      <input
                        type="date"
                        value={newNotification.date}
                        onChange={(e) =>
                          setNewNotification({
                            ...newNotification,
                            date: e.target.value,
                          })
                        }
                        className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-deep-accent flex items-center gap-1.5">
                        <AlertCircle className="h-3 w-3" /> Priority
                      </label>
                      <select
                        value={newNotification.priority}
                        onChange={(e) =>
                          setNewNotification({
                            ...newNotification,
                            priority: e.target.value,
                          })
                        }
                        className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                      >
                        <option value="Normal">Normal</option>
                        <option value="Important">Important</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-deep-accent flex items-center gap-1.5">
                      <FileText className="h-3 w-3" /> Notification Details / Message
                    </label>
                    <textarea
                      rows="3"
                      placeholder="Enter the notification text here..."
                      value={newNotification.message}
                      onChange={(e) =>
                        setNewNotification({
                          ...newNotification,
                          message: e.target.value,
                        })
                      }
                      className="w-full border border-hairline bg-white p-3 text-sm text-deep-accent outline-none focus:border-primary placeholder:text-muted/60 resize-none"
                    />
                  </div>

                  {formError && (
                    <div className="flex items-start gap-2 border border-[#f5c6cb] bg-[#f8d7da] px-4 py-2.5">
                      <AlertCircle
                        className="mt-0.5 h-4 w-4 shrink-0 text-[#721c24]"
                        strokeWidth={2}
                      />
                      <span className="text-sm text-[#721c24]">{formError}</span>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      onClick={handleSendNotification}
                      disabled={
                        !newNotification.title.trim() ||
                        !newNotification.message.trim() ||
                        (currentCategoryHasSub &&
                          !newNotification.subCategory) ||
                        sending
                      }
                      className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-deep disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.25} />
                      ) : (
                        <Send className="h-4 w-4" strokeWidth={2.25} />
                      )}
                      Send Notification
                    </button>
                  </div>
                </div>
              </div>

              {/* History */}
              <div>
                <h3 className="mb-4 font-serif text-lg font-bold text-deep-accent flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" /> Notification History
                </h3>

                {detailLoading ? (
                  <p className="py-4 text-sm text-muted">Loading history…</p>
                ) : (selectedUser.notifications || []).length === 0 ? (
                  <div className="text-sm text-muted py-4 text-center border border-dashed border-hairline">
                    No notifications sent to this user yet.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
                    {selectedUser.notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="flex flex-col gap-2 border border-hairline bg-white p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-deep-accent">
                                {notif.title}
                              </span>
                              <span className="font-mono text-[10px] text-muted bg-faint px-1.5 py-0.5">
                                {notif.category}
                              </span>
                              {notif.subCategory && (
                                <span className="font-mono text-[10px] text-muted bg-faint px-1.5 py-0.5">
                                  {notif.subCategory}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-muted">
                              {formatDate(notif.date)}
                            </span>
                          </div>
                          {getPriorityBadge(notif.priority)}
                        </div>
                        <p className="text-sm text-body border-t border-hairline pt-2 mt-1">
                          {notif.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-hairline pt-5 sm:flex-row sm:justify-end">
                <button
                  onClick={() => setIsModalOpen(false)}
                  disabled={sending}
                  className="min-h-[40px] border border-hairline bg-white px-5 py-2 text-sm font-semibold text-deep-accent hover:bg-faint disabled:opacity-60"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageNotifications;