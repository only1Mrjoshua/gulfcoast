// src/pages/admin/ManageAccounts.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Edit, X, Save, Wallet, Plus, Loader2, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '../../utils/api';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount ?? 0);
};

const emptyAccount = () => ({
  userId: '',
  user: '',
  accountNumber: '',
  type: 'Checking',
  subType: null,
  balance: 0,
  interestRate: '',
  status: 'Active',
});

const ManageAccounts = () => {
  // Data
  const [accounts, setAccounts] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');

  // Edit Modal State
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newAccount, setNewAccount] = useState(emptyAccount());

  // Toast
  const [toast, setToast] = useState('');
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  // ──────────────────────────────────────────────────────
  // Loaders
  // ──────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    const [accountsRes, usersRes] = await Promise.all([
      apiFetch('/admin/accounts'),
      apiFetch('/admin/accounts/users'),
    ]);
    const accountsData = accountsRes?.data ?? accountsRes;
    const usersData = usersRes?.data ?? usersRes;
    setAccounts(accountsData.accounts ?? []);
    setUsers(usersData.users ?? []);
  }, []);

  useEffect(() => {
    const boot = async () => {
      try {
        setLoading(true);
        setError('');
        await loadAll();
      } catch (err) {
        console.error('❌ Failed to load accounts:', err);
        setError(err.message || 'Failed to load accounts');
      } finally {
        setLoading(false);
      }
    };
    boot();
  }, [loadAll]);

  // ──────────────────────────────────────────────────────
  // Filter
  // ──────────────────────────────────────────────────────
  const filteredAccounts = accounts.filter((acc) =>
    (acc.user || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (acc.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (acc.accountNumber || '').includes(searchTerm)
  );

  // ──────────────────────────────────────────────────────
  // Edit handlers
  // ──────────────────────────────────────────────────────
  const handleEditClick = (acc) => {
    setSelectedAccount(JSON.parse(JSON.stringify(acc)));
    setIsEditModalOpen(true);
  };

  const handleSaveAccount = async () => {
    if (!selectedAccount) return;
    setSaving(true);

    try {
      const payload = {
        accountNumber: selectedAccount.accountNumber,
        type: selectedAccount.type,
        subType:
          selectedAccount.type === 'Savings'
            ? selectedAccount.subType || 'Standard'
            : null,
        balance: parseFloat(selectedAccount.balance) || 0,
        interestRate:
          selectedAccount.type === 'Savings'
            ? selectedAccount.interestRate === '' ||
              selectedAccount.interestRate === null
              ? null
              : parseFloat(selectedAccount.interestRate)
            : null,
        status: selectedAccount.status,
      };

      await apiFetch(`/admin/accounts/${selectedAccount.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      await loadAll();
      setIsEditModalOpen(false);
      showToast('Account updated successfully.');
    } catch (err) {
      console.error('❌ Save account failed:', err);
      showToast(err.message || 'Failed to update account');
    } finally {
      setSaving(false);
    }
  };

  // ──────────────────────────────────────────────────────
  // Create handlers
  // ──────────────────────────────────────────────────────
  const handleCreateClick = () => {
    setNewAccount(emptyAccount());
    setIsCreateModalOpen(true);
  };

  const handleCreateAccount = async () => {
    if (!newAccount.userId) {
      showToast('Please select a user.');
      return;
    }
    if (!newAccount.accountNumber) {
      showToast('Account number is required.');
      return;
    }
    setSaving(true);

    try {
      const payload = {
        userId: newAccount.userId,
        accountNumber: newAccount.accountNumber,
        type: newAccount.type,
        subType:
          newAccount.type === 'Savings'
            ? newAccount.subType || 'Standard'
            : null,
        balance: parseFloat(newAccount.balance) || 0,
        interestRate:
          newAccount.type === 'Savings'
            ? parseFloat(newAccount.interestRate) || 0
            : null,
        status: newAccount.status,
      };

      await apiFetch('/admin/accounts', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      await loadAll();
      setIsCreateModalOpen(false);
      showToast('Account created successfully.');
    } catch (err) {
      console.error('❌ Create account failed:', err);
      showToast(err.message || 'Failed to create account');
    } finally {
      setSaving(false);
    }
  };

  // ──────────────────────────────────────────────────────
  // Display helpers
  // ──────────────────────────────────────────────────────
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':    return 'text-primary bg-primary/10';
      case 'Suspended': return 'text-[#f0ad4e] bg-[#f0ad4e]/10';
      case 'Closed':    return 'text-[#d9534f] bg-[#d9534f]/10';
      default:          return 'text-muted bg-faint';
    }
  };

  const formatAccountType = (acc) => {
    if (acc.type === 'Savings' && acc.subType) {
      return `${acc.type} (${acc.subType})`;
    }
    return acc.type;
  };

  // ──────────────────────────────────────────────────────
  // Full-page states
  // ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" strokeWidth={1.75} />
        <p className="text-sm text-muted">Loading accounts…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-4">
        <p className="font-serif text-xl font-bold text-deep-accent">
          We couldn&rsquo;t load accounts
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
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 border-b border-hairline pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold leading-tight text-deep-accent sm:text-3xl">
            Manage Accounts
          </h1>
          <p className="mt-1 text-sm text-body">View, edit, and create user bank accounts.</p>
        </div>
        <button
          onClick={handleCreateClick}
          className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-deep transition-colors"
        >
          <Plus className="h-4 w-4" strokeWidth={2} /> Create Account
        </button>
      </div>

      {/* Filters & Search */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center border border-hairline bg-white px-3 focus-within:border-primary">
          <Search className="h-4 w-4 text-muted" strokeWidth={2} />
          <input
            type="text"
            autoComplete="off"
            placeholder="Search by user, account ID, or number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="min-h-[40px] w-full border-none bg-transparent px-3 py-2 text-sm text-deep-accent outline-none placeholder:text-muted/60"
          />
        </div>
        <button className="inline-flex min-h-[40px] items-center justify-center gap-2 border border-hairline bg-white px-4 py-2 text-sm font-semibold text-deep-accent hover:bg-faint">
          <Filter className="h-4 w-4" strokeWidth={2} /> Filter
        </button>
      </div>

      {/* Accounts Table */}
      <div className="overflow-x-auto border border-hairline bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-hairline bg-faint/50 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">Account ID</th>
              <th className="px-5 py-3 font-semibold">User</th>
              <th className="px-5 py-3 font-semibold">Acct No.</th>
              <th className="px-5 py-3 font-semibold">Type</th>
              <th className="px-5 py-3 font-semibold">Balance</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-faint">
            {filteredAccounts.map((acc) => (
              <tr key={acc.id} className="transition-colors hover:bg-faint/30">
                <td className="px-5 py-4 font-mono text-xs text-muted">
                  {String(acc.id).slice(-8).toUpperCase()}
                </td>
                <td className="px-5 py-4 font-semibold text-deep-accent">{acc.user}</td>
                <td className="px-5 py-4 text-muted">•••• {acc.accountNumber}</td>
                <td className="px-5 py-4 text-body">
                  {formatAccountType(acc)}
                  {acc.interestRate !== null && acc.type === 'Savings' && (
                    <span className="ml-1 text-xs text-primary font-semibold">
                      ({acc.interestRate}%)
                    </span>
                  )}
                </td>
                <td className="px-5 py-4 font-semibold text-deep-accent">
                  {formatCurrency(acc.balance)}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${getStatusBadge(acc.status)}`}
                  >
                    {acc.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    onClick={() => handleEditClick(acc)}
                    className="inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:text-primary"
                  >
                    <Edit className="h-4 w-4" strokeWidth={2} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredAccounts.length === 0 && (
          <div className="p-8 text-center text-muted">No accounts found.</div>
        )}
      </div>

      {/* --- EDIT ACCOUNT MODAL --- */}
      {isEditModalOpen && selectedAccount && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-[500px] overflow-y-auto border border-hairline bg-white p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsEditModalOpen(false)}
              disabled={saving}
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-faint hover:text-deep-accent disabled:opacity-40"
            >
              <X className="h-4 w-4" strokeWidth={2.25} />
            </button>
            <div className="flex items-start gap-3 mb-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#e7f3f5] text-primary">
                <Wallet className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <h2 className="font-serif text-xl font-bold text-deep-accent">Edit Account</h2>
                <p className="mt-1 text-sm text-body">
                  {String(selectedAccount.id).slice(-8).toUpperCase()} • {selectedAccount.user}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-deep-accent">Account Number</label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={selectedAccount.accountNumber}
                    onChange={(e) =>
                      setSelectedAccount({ ...selectedAccount, accountNumber: e.target.value })
                    }
                    className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-deep-accent">Account Type</label>
                  <select
                    value={selectedAccount.type}
                    autoComplete="off"
                    onChange={(e) =>
                      setSelectedAccount({ ...selectedAccount, type: e.target.value })
                    }
                    className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                  >
                    <option value="Checking">Checking</option>
                    <option value="Savings">Savings</option>
                  </select>
                </div>
              </div>

              {selectedAccount.type === 'Savings' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-deep-accent">Savings Type</label>
                    <select
                      value={selectedAccount.subType || 'Standard'}
                      autoComplete="off"
                      onChange={(e) =>
                        setSelectedAccount({ ...selectedAccount, subType: e.target.value })
                      }
                      className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                    >
                      <option value="Standard">Standard Savings</option>
                      <option value="High Yield">High Yield Savings</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-deep-accent">Interest Rate (%)</label>
                    <input
                      type="number"
                      autoComplete="off"
                      step="0.01"
                      value={selectedAccount.interestRate ?? ''}
                      onChange={(e) =>
                        setSelectedAccount({ ...selectedAccount, interestRate: e.target.value })
                      }
                      className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="border-t border-hairline pt-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-deep-accent">Balance</label>
                  <input
                    type="number"
                    autoComplete="off"
                    step="0.01"
                    value={selectedAccount.balance}
                    onChange={(e) =>
                      setSelectedAccount({
                        ...selectedAccount,
                        balance: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 border-t border-hairline pt-4">
                <label className="text-sm font-semibold text-deep-accent">Account Status</label>
                <select
                  value={selectedAccount.status}
                  autoComplete="off"
                  onChange={(e) =>
                    setSelectedAccount({ ...selectedAccount, status: e.target.value })
                  }
                  className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-hairline pt-5 sm:flex-row sm:justify-end">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={saving}
                  className="min-h-[40px] border border-hairline bg-white px-5 py-2 text-sm font-semibold text-deep-accent hover:bg-faint disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAccount}
                  disabled={saving}
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

      {/* --- CREATE ACCOUNT MODAL --- */}
      {isCreateModalOpen && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-[500px] overflow-y-auto border border-hairline bg-white p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsCreateModalOpen(false)}
              disabled={saving}
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-faint hover:text-deep-accent disabled:opacity-40"
            >
              <X className="h-4 w-4" strokeWidth={2.25} />
            </button>
            <div className="flex items-start gap-3 mb-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#e7f3f5] text-primary">
                <Plus className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <h2 className="font-serif text-xl font-bold text-deep-accent">Create New Account</h2>
                <p className="mt-1 text-sm text-body">Open a new account for a user.</p>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-deep-accent">User Name</label>
                  <select
                    value={newAccount.userId || ''}
                    autoComplete="off"
                    onChange={(e) => {
                      const uid = e.target.value;
                      const u = users.find((x) => String(x.id) === uid);
                      setNewAccount({
                        ...newAccount,
                        userId: uid,
                        user: u?.name || '',
                      });
                    }}
                    className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                  >
                    <option value="" disabled>Select a user</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-deep-accent">Account Number</label>
                  <input
                    type="text"
                    autoComplete="off"
                    placeholder="e.g. 1234"
                    value={newAccount.accountNumber}
                    onChange={(e) =>
                      setNewAccount({ ...newAccount, accountNumber: e.target.value })
                    }
                    className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-deep-accent">Account Type</label>
                  <select
                    value={newAccount.type}
                    autoComplete="off"
                    onChange={(e) =>
                      setNewAccount({ ...newAccount, type: e.target.value })
                    }
                    className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                  >
                    <option value="Checking">Checking</option>
                    <option value="Savings">Savings</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-deep-accent">Status</label>
                  <select
                    value={newAccount.status}
                    autoComplete="off"
                    onChange={(e) =>
                      setNewAccount({ ...newAccount, status: e.target.value })
                    }
                    className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {newAccount.type === 'Savings' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-deep-accent">Savings Type</label>
                    <select
                      value={newAccount.subType || 'Standard'}
                      autoComplete="off"
                      onChange={(e) =>
                        setNewAccount({ ...newAccount, subType: e.target.value })
                      }
                      className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                    >
                      <option value="Standard">Standard Savings</option>
                      <option value="High Yield">High Yield Savings</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-deep-accent">Interest Rate (%)</label>
                    <input
                      type="number"
                      autoComplete="off"
                      step="0.01"
                      placeholder="e.g. 4.5"
                      value={newAccount.interestRate}
                      onChange={(e) =>
                        setNewAccount({ ...newAccount, interestRate: e.target.value })
                      }
                      className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="border-t border-hairline pt-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-deep-accent">Balance</label>
                  <input
                    type="number"
                    autoComplete="off"
                    step="0.01"
                    value={newAccount.balance}
                    onChange={(e) =>
                      setNewAccount({ ...newAccount, balance: e.target.value })
                    }
                    className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-hairline pt-5 sm:flex-row sm:justify-end">
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={saving}
                  className="min-h-[40px] border border-hairline bg-white px-5 py-2 text-sm font-semibold text-deep-accent hover:bg-faint disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAccount}
                  disabled={saving}
                  className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-deep disabled:opacity-70"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.25} />
                  ) : (
                    <Save className="h-4 w-4" strokeWidth={2.25} />
                  )}
                  Create Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed right-4 top-4 z-[10001] flex items-start gap-3 border border-hairline bg-white p-4 shadow-lg">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2.25} />
          <p className="text-sm font-semibold text-deep-accent">{toast}</p>
        </div>
      )}
    </div>
  );
};

export default ManageAccounts;