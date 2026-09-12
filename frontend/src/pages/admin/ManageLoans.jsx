// src/pages/admin/ManageLoans.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Filter, Edit, X, Save, Loader2, Landmark,
  CheckCircle2, XCircle, FileText, Bell, ArrowUpRight,
} from 'lucide-react';
import { apiFetch } from '../../utils/api';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount ?? 0);

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const s = String(dateStr);
  const date = s.includes('T') ? new Date(s) : new Date(s + 'T00:00:00');
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const ManageLoans = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const [selectedUser, setSelectedUser] = useState(null);
  const [originalUser, setOriginalUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadLoans = useCallback(async () => {
    const res = await apiFetch('/admin/loans');
    const d = res?.data ?? res;
    setUsers(d.users ?? []);
  }, []);

  useEffect(() => {
    const boot = async () => {
      try {
        setLoading(true);
        setError('');
        await loadLoans();
      } catch (err) {
        console.error('❌ Failed to load loans:', err);
        setError(err.message || 'Failed to load loans');
      } finally {
        setLoading(false);
      }
    };
    boot();
  }, [loadLoans]);

  const filteredUsers = users.filter(
    (u) =>
      (u.user || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Opens modal and fetches the full detail for this user.
  const handleManageClick = async (user) => {
    setSelectedUser(JSON.parse(JSON.stringify(user)));
    setOriginalUser(JSON.parse(JSON.stringify(user)));
    setIsModalOpen(true);
    setDetailLoading(true);

    try {
      const res = await apiFetch(`/admin/loans/${user.id}`);
      const d = res?.data ?? res;
      const detail = d?.user;
      if (detail) {
        const merged = {
          ...JSON.parse(JSON.stringify(user)),
          summary: detail.summary,
          loans: detail.loans || [],
          alerts: detail.alerts || [],
        };
        setSelectedUser(merged);
        setOriginalUser(JSON.parse(JSON.stringify(merged)));
      }
    } catch (err) {
      console.error('❌ Failed to load user loan detail:', err);
      showToast(err.message || 'Failed to load loan detail');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpdateApplicationStatus = (appId, newStatus) => {
    setSelectedUser((prev) => ({
      ...prev,
      applications: prev.applications.map((app) =>
        app.id === appId ? { ...app, status: newStatus } : app
      ),
    }));
  };

  const handleUpdateLoanField = (loanId, field, value) => {
    setSelectedUser((prev) => ({
      ...prev,
      loans: (prev.loans || []).map((l) =>
        l.id === loanId ? { ...l, [field]: value } : l
      ),
    }));
  };

  const handleToggleAlert = (alertId) => {
    setSelectedUser((prev) => ({
      ...prev,
      alerts: (prev.alerts || []).map((a) =>
        a.id === alertId ? { ...a, active: !a.active } : a
      ),
    }));
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    setSaving(true);

    try {
      // 1. Save summary
      await apiFetch(`/admin/loans/${selectedUser.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          totalLoanBalance: selectedUser.totalLoanBalance,
          nextPayment: selectedUser.nextPayment,
          dueDate: selectedUser.dueDate || null,
          activeLoans: selectedUser.activeLoans,
        }),
      });

      // 2. Save any changed loans
      const originalLoansById = new Map(
        (originalUser?.loans || []).map((l) => [l.id, l])
      );
      for (const loan of selectedUser.loans || []) {
        const orig = originalLoansById.get(loan.id);
        if (!orig) continue;
        const changed =
          orig.name !== loan.name ||
          orig.type !== loan.type ||
          orig.accountNumber !== loan.accountNumber ||
          orig.originalAmount !== loan.originalAmount ||
          orig.currentBalance !== loan.currentBalance ||
          orig.interestRate !== loan.interestRate ||
          orig.monthlyPayment !== loan.monthlyPayment ||
          orig.nextPaymentDate !== loan.nextPaymentDate ||
          orig.maturityDate !== loan.maturityDate ||
          orig.termMonths !== loan.termMonths ||
          orig.monthsRemaining !== loan.monthsRemaining ||
          orig.status !== loan.status ||
          orig.paymentMethod !== loan.paymentMethod;

        if (!changed) continue;

        await apiFetch(`/admin/loans/${selectedUser.id}/loans/${loan.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            type: loan.type,
            name: loan.name,
            accountNumber: loan.accountNumber,
            originalAmount: loan.originalAmount,
            currentBalance: loan.currentBalance,
            interestRate: loan.interestRate,
            monthlyPayment: loan.monthlyPayment,
            nextPaymentDate: loan.nextPaymentDate || null,
            maturityDate: loan.maturityDate || null,
            termMonths: loan.termMonths,
            monthsRemaining: loan.monthsRemaining,
            status: loan.status,
            paymentMethod: loan.paymentMethod,
          }),
        });
      }

      // 3. Save application status changes
      const originalAppsById = new Map(
        (originalUser?.applications || []).map((a) => [a.id, a])
      );
      for (const app of selectedUser.applications || []) {
        const orig = originalAppsById.get(app.id);
        if (!orig || orig.status === app.status) continue;
        await apiFetch(`/admin/loans/applications/${app.id}`, {
          method: 'PUT',
          body: JSON.stringify({ status: app.status }),
        });
      }

      // 4. Save alerts if any changed
      const alertsChanged =
        JSON.stringify(originalUser?.alerts || []) !==
        JSON.stringify(selectedUser.alerts || []);
      if (alertsChanged) {
        await apiFetch(`/admin/loans/${selectedUser.id}/alerts`, {
          method: 'PUT',
          body: JSON.stringify({
            alerts: (selectedUser.alerts || []).map((a) => ({
              id: a.id,
              active: a.active,
            })),
          }),
        });
      }

      await loadLoans();
      setIsModalOpen(false);
      showToast('Loan record updated successfully.');
    } catch (err) {
      console.error('❌ Save loan failed:', err);
      showToast(err.message || 'Failed to update loan record');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-primary">
            <span className="h-1.5 w-1.5 bg-primary" />
            {status}
          </span>
        );
      case 'Pending':
      case 'Under Review':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#f0ad4e]">
            <span className="h-1.5 w-1.5 bg-[#f0ad4e]" />
            {status}
          </span>
        );
      case 'Rejected':
      case 'Defaulted':
      case 'Paid Off':
        return (
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide ${
              status === 'Paid Off' ? 'text-primary' : 'text-[#d9534f]'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 ${
                status === 'Paid Off' ? 'bg-primary' : 'bg-[#d9534f]'
              }`}
            />
            {status}
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" strokeWidth={1.75} />
        <p className="text-sm text-muted">Loading loans…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-4">
        <p className="font-serif text-xl font-bold text-deep-accent">
          We couldn&rsquo;t load loans
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
            Manage Loans
          </h1>
          <p className="mt-1 text-sm text-body">
            Manage user loan summaries and review applications.
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

      <div className="overflow-x-auto border border-hairline bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-hairline bg-faint/50 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">User</th>
              <th className="px-5 py-3 font-semibold">Total Loan Balance</th>
              <th className="px-5 py-3 font-semibold">Next Payment</th>
              <th className="px-5 py-3 font-semibold">Due Date</th>
              <th className="px-5 py-3 font-semibold">Active Loans</th>
              <th className="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-faint">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="transition-colors hover:bg-faint/30">
                <td className="px-5 py-4">
                  <div className="font-semibold text-deep-accent">{u.user}</div>
                  <div className="text-xs text-muted">{u.id}</div>
                </td>
                <td className="px-5 py-4 font-semibold text-deep-accent">
                  {formatCurrency(u.totalLoanBalance)}
                </td>
                <td className="px-5 py-4 text-body">
                  {formatCurrency(u.nextPayment)}
                </td>
                <td className="px-5 py-4 text-muted">{u.dueDate || 'N/A'}</td>
                <td className="px-5 py-4 text-body">{u.activeLoans}</td>
                <td className="px-5 py-4 text-right">
                  <button
                    onClick={() => handleManageClick(u)}
                    className="inline-flex h-8 items-center gap-2 border border-hairline bg-white px-3 py-1 text-xs font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint"
                  >
                    <Edit className="h-3.5 w-3.5" strokeWidth={2} /> Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-muted">No users found.</div>
        )}
      </div>

      {isModalOpen && selectedUser && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4"
          onClick={() => !saving && setIsModalOpen(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-[900px] overflow-y-auto border border-hairline bg-white p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => !saving && setIsModalOpen(false)}
              disabled={saving}
              className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-faint hover:text-deep-accent disabled:opacity-40"
            >
              <X className="h-4 w-4" strokeWidth={2.25} />
            </button>

            <div className="mb-6 flex items-start gap-3 border-b border-hairline pb-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#e7f3f5] text-primary">
                <Landmark className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <h2 className="font-serif text-xl font-bold text-deep-accent">
                  Manage Loans
                </h2>
                <p className="mt-1 text-sm text-body">
                  {selectedUser.user} • {selectedUser.id}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-8">
              {/* ─── SECTION 1: SUMMARY ─── */}
              <div>
                <h3 className="mb-3 font-serif text-lg font-bold text-deep-accent">
                  Loan Summary
                </h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-deep-accent">
                      Total Balance
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={selectedUser.totalLoanBalance ?? 0}
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          totalLoanBalance: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-deep-accent">
                      Next Payment
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={selectedUser.nextPayment ?? 0}
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          nextPayment: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-deep-accent">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={selectedUser.dueDate || ''}
                      onChange={(e) =>
                        setSelectedUser({ ...selectedUser, dueDate: e.target.value })
                      }
                      className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-deep-accent">
                      Active Loans
                    </label>
                    <input
                      type="number"
                      value={selectedUser.activeLoans ?? 0}
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          activeLoans: parseInt(e.target.value) || 0,
                        })
                      }
                      className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* ─── SECTION 2: LOANS ─── */}
              <div>
                <div className="mb-3 flex items-center gap-2 border-b border-hairline pb-2">
                  <Landmark className="h-4 w-4 text-primary" strokeWidth={1.75} />
                  <h3 className="font-serif text-lg font-bold text-deep-accent">
                    Loans
                  </h3>
                </div>

                {detailLoading ? (
                  <p className="py-4 text-sm text-muted">Loading loans…</p>
                ) : (selectedUser.loans || []).length === 0 ? (
                  <div className="border border-dashed border-hairline py-4 text-center text-sm text-muted">
                    No loans on file.
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {(selectedUser.loans || []).map((loan) => (
                      <div
                        key={loan.id}
                        className="border border-hairline bg-faint/30 p-4"
                      >
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-deep-accent">
                              {loan.name}
                            </span>
                            <span className="font-mono text-xs text-muted">
                              •••• {loan.loanNumber}
                            </span>
                          </div>
                          {getStatusBadge(loan.status)}
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <FieldInput
                            label="Name"
                            value={loan.name}
                            onChange={(v) =>
                              handleUpdateLoanField(loan.id, 'name', v)
                            }
                          />
                          <FieldInput
                            label="Type"
                            value={loan.type}
                            onChange={(v) =>
                              handleUpdateLoanField(loan.id, 'type', v)
                            }
                          />
                          <FieldInput
                            label="Account #"
                            value={loan.accountNumber}
                            onChange={(v) =>
                              handleUpdateLoanField(loan.id, 'accountNumber', v)
                            }
                          />
                          <FieldInput
                            label="Original Amount"
                            type="number"
                            value={loan.originalAmount}
                            onChange={(v) =>
                              handleUpdateLoanField(
                                loan.id,
                                'originalAmount',
                                parseFloat(v) || 0
                              )
                            }
                          />
                          <FieldInput
                            label="Current Balance"
                            type="number"
                            value={loan.currentBalance}
                            onChange={(v) =>
                              handleUpdateLoanField(
                                loan.id,
                                'currentBalance',
                                parseFloat(v) || 0
                              )
                            }
                          />
                          <FieldInput
                            label="Interest Rate (%)"
                            type="number"
                            value={loan.interestRate}
                            onChange={(v) =>
                              handleUpdateLoanField(
                                loan.id,
                                'interestRate',
                                parseFloat(v) || 0
                              )
                            }
                          />
                          <FieldInput
                            label="Monthly Payment"
                            type="number"
                            value={loan.monthlyPayment}
                            onChange={(v) =>
                              handleUpdateLoanField(
                                loan.id,
                                'monthlyPayment',
                                parseFloat(v) || 0
                              )
                            }
                          />
                          <FieldInput
                            label="Next Payment"
                            type="date"
                            value={loan.nextPaymentDate}
                            onChange={(v) =>
                              handleUpdateLoanField(loan.id, 'nextPaymentDate', v)
                            }
                          />
                          <FieldInput
                            label="Maturity Date"
                            type="date"
                            value={loan.maturityDate}
                            onChange={(v) =>
                              handleUpdateLoanField(loan.id, 'maturityDate', v)
                            }
                          />
                          <FieldInput
                            label="Term (Months)"
                            type="number"
                            value={loan.termMonths}
                            onChange={(v) =>
                              handleUpdateLoanField(
                                loan.id,
                                'termMonths',
                                parseInt(v) || 0
                              )
                            }
                          />
                          <FieldInput
                            label="Months Remaining"
                            type="number"
                            value={loan.monthsRemaining}
                            onChange={(v) =>
                              handleUpdateLoanField(
                                loan.id,
                                'monthsRemaining',
                                parseInt(v) || 0
                              )
                            }
                          />
                          <FieldInput
                            label="Payment Method"
                            value={loan.paymentMethod}
                            onChange={(v) =>
                              handleUpdateLoanField(loan.id, 'paymentMethod', v)
                            }
                          />
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-deep-accent">
                              Status
                            </label>
                            <select
                              value={loan.status}
                              onChange={(e) =>
                                handleUpdateLoanField(
                                  loan.id,
                                  'status',
                                  e.target.value
                                )
                              }
                              className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                            >
                              <option value="Active">Active</option>
                              <option value="Paid Off">Paid Off</option>
                              <option value="Defaulted">Defaulted</option>
                              <option value="Pending">Pending</option>
                            </select>
                          </div>
                        </div>

                        {/* Payment history nested under each loan */}
                        <div className="mt-4 border-t border-hairline pt-3">
                          <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">
                            Payment History
                          </h4>
                          {(loan.payments || []).length === 0 ? (
                            <p className="py-1 text-xs text-muted">
                              No payments recorded.
                            </p>
                          ) : (
                            <div className="flex flex-col divide-y divide-faint">
                              {(loan.payments || []).map((p) => (
                                <div
                                  key={p.id}
                                  className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2 text-xs"
                                >
                                  <span className="inline-flex items-center gap-1.5 text-muted">
                                    <ArrowUpRight
                                      className="h-3 w-3"
                                      strokeWidth={2}
                                    />
                                    {formatDate(p.date)}
                                  </span>
                                  <span className="font-semibold text-[#d9534f]">
                                    -{formatCurrency(p.amount)}
                                  </span>
                                  <span className="text-muted">
                                    P: {formatCurrency(p.principal)}
                                  </span>
                                  <span className="text-muted">
                                    I: {formatCurrency(p.interest)}
                                  </span>
                                  <span className="text-primary font-bold uppercase tracking-wide">
                                    {p.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ─── SECTION 3: APPLICATIONS ─── */}
              <div>
                <div className="mb-3 flex items-center gap-2 border-b border-hairline pb-2">
                  <FileText className="h-4 w-4 text-primary" strokeWidth={1.75} />
                  <h3 className="font-serif text-lg font-bold text-deep-accent">
                    Loan Applications
                  </h3>
                </div>

                {(selectedUser.applications || []).length === 0 && (
                  <div className="border border-dashed border-hairline py-4 text-center text-sm text-muted">
                    No applications on file.
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  {(selectedUser.applications || []).map((app) => (
                    <div
                      key={app.id}
                      className="flex flex-col items-start justify-between gap-4 border border-hairline bg-faint/30 p-4 sm:flex-row sm:items-center"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-deep-accent">
                            {app.type}
                          </span>
                          <span className="font-mono text-xs text-muted">
                            {app.applicationNumber || app.id}
                          </span>
                        </div>
                        <div className="text-sm text-body">
                          Amount: {formatCurrency(app.amount)}
                        </div>
                        <div className="text-xs text-muted">
                          Applied: {app.date}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {getStatusBadge(app.status)}

                        {(app.status === 'Pending' ||
                          app.status === 'Under Review') && (
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleUpdateApplicationStatus(app.id, 'Rejected')
                              }
                              className="inline-flex h-8 items-center justify-center gap-1.5 border border-[#d9534f] bg-white px-3 text-xs font-semibold text-[#d9534f] transition-colors hover:bg-[#fdf2f2]"
                            >
                              <XCircle className="h-3.5 w-3.5" strokeWidth={2} /> Reject
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateApplicationStatus(app.id, 'Approved')
                              }
                              className="inline-flex h-8 items-center justify-center gap-1.5 bg-primary px-3 text-xs font-semibold text-white transition-colors hover:bg-primary-deep"
                            >
                              <CheckCircle2
                                className="h-3.5 w-3.5"
                                strokeWidth={2}
                              />{' '}
                              Approve
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ─── SECTION 4: ALERTS ─── */}
              <div>
                <div className="mb-3 flex items-center gap-2 border-b border-hairline pb-2">
                  <Bell className="h-4 w-4 text-primary" strokeWidth={1.75} />
                  <h3 className="font-serif text-lg font-bold text-deep-accent">
                    Loan Alerts
                  </h3>
                </div>

                {detailLoading ? (
                  <p className="py-2 text-sm text-muted">Loading alerts…</p>
                ) : (selectedUser.alerts || []).length === 0 ? (
                  <div className="border border-dashed border-hairline py-4 text-center text-sm text-muted">
                    No alerts available.
                  </div>
                ) : (
                  <div className="flex flex-col divide-y divide-faint border border-hairline bg-faint/30 px-4">
                    {(selectedUser.alerts || []).map((alert) => (
                      <div
                        key={alert.id}
                        className="flex items-center gap-3 py-3"
                      >
                        <span
                          className={`h-1.5 w-1.5 shrink-0 ${
                            alert.active ? 'bg-primary' : 'bg-[#d9534f]'
                          }`}
                          aria-hidden="true"
                        />
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-deep-accent">
                          {alert.type}
                        </span>
                        <span
                          className={`shrink-0 text-xs font-bold uppercase tracking-wide ${
                            alert.active ? 'text-primary' : 'text-[#d9534f]'
                          }`}
                        >
                          {alert.active ? 'ON' : 'OFF'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleAlert(alert.id)}
                          className="shrink-0 border border-hairline bg-white px-2.5 py-1 text-xs font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint"
                        >
                          {alert.active ? 'Turn Off' : 'Turn On'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ─── ACTIONS ─── */}
              <div className="flex flex-col-reverse gap-3 border-t border-hairline pt-5 sm:flex-row sm:justify-end">
                <button
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                  className="min-h-[40px] border border-hairline bg-white px-5 py-2 text-sm font-semibold text-deep-accent hover:bg-faint disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveUser}
                  disabled={saving || detailLoading}
                  className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-deep disabled:opacity-70"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.25} />
                  ) : (
                    <Save className="h-4 w-4" strokeWidth={2.25} />
                  )}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed right-4 top-4 z-[10001] flex items-start gap-3 border border-hairline bg-white p-4 shadow-lg">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2.25} />
          <p className="text-sm font-semibold text-deep-accent">{toast}</p>
        </div>
      )}
    </div>
  );
};

// Small reusable input
const FieldInput = ({ label, value, onChange, type = 'text' }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-deep-accent">{label}</label>
    <input
      type={type}
      step={type === 'number' ? '0.01' : undefined}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
    />
  </div>
);

export default ManageLoans;