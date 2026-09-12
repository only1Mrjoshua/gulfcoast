// src/pages/admin/ManageUsers.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Edit, Trash2, X, Save, TrendingUp, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiFetch } from '../../utils/api';

const ManageUsers = () => {
  // Data
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null); // user object

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  // ──────────────────────────────────────────────────────
  // Load users
  // ──────────────────────────────────────────────────────
  const loadUsers = useCallback(async () => {
    const res = await apiFetch('/admin/users');
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
        console.error('❌ Failed to load users:', err);
        setError(err.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    boot();
  }, [loadUsers]);

  // ──────────────────────────────────────────────────────
  // Filter
  // ──────────────────────────────────────────────────────
  const filteredUsers = users.filter((user) =>
    (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ──────────────────────────────────────────────────────
  // Edit handlers
  // ──────────────────────────────────────────────────────
  const handleEditClick = (user) => {
    setSelectedUser(JSON.parse(JSON.stringify(user))); // deep clone for safe editing
    setIsModalOpen(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    setSaving(true);

    try {
      const payload = {
        name: selectedUser.name,
        role: selectedUser.role,
        status: selectedUser.status,
        creditScore: {
          score: Number(selectedUser.creditScore?.score) || 0,
          change: Number(selectedUser.creditScore?.change) || 0,
          lastUpdated: selectedUser.creditScore?.lastUpdated || undefined,
        },
      };

      await apiFetch(`/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      await loadUsers();
      setIsModalOpen(false);
      showToast('User updated successfully.');
    } catch (err) {
      console.error('❌ Save user failed:', err);
      showToast(err.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  // Helper to safely update nested credit score fields
  const handleCreditScoreChange = (field, value) => {
    setSelectedUser({
      ...selectedUser,
      creditScore: {
        ...selectedUser.creditScore,
        [field]: value,
      },
    });
  };

  // ──────────────────────────────────────────────────────
  // Delete handlers
  // ──────────────────────────────────────────────────────
  const handleDeleteClick = (user) => {
    setConfirmDelete(user);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    const user = confirmDelete;

    setDeletingId(user.id);
    try {
      await apiFetch(`/admin/users/${user.id}`, { method: 'DELETE' });
      await loadUsers();
      showToast(`${user.name} deleted along with all their data.`);
      setConfirmDelete(null);
    } catch (err) {
      console.error('❌ Delete user failed:', err);
      showToast(err.message || 'Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  // ──────────────────────────────────────────────────────
  // Full-page loading / error
  // ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" strokeWidth={1.75} />
        <p className="text-sm text-muted">Loading users…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-4">
        <p className="font-serif text-xl font-bold text-deep-accent">
          We couldn&rsquo;t load users
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
            Manage Users
          </h1>
          <p className="mt-1 text-sm text-body">View and manage all user accounts.</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center border border-hairline bg-white px-3 focus-within:border-primary">
          <Search className="h-4 w-4 text-muted" strokeWidth={2} />
          <input
            type="text"
            autoComplete="off"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="min-h-[40px] w-full border-none bg-transparent px-3 py-2 text-sm text-deep-accent outline-none placeholder:text-muted/60"
          />
        </div>
        <button className="inline-flex min-h-[40px] items-center justify-center gap-2 border border-hairline bg-white px-4 py-2 text-sm font-semibold text-deep-accent transition-colors hover:bg-faint">
          <Filter className="h-4 w-4" strokeWidth={2} />
          Filter
        </button>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto border border-hairline bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-hairline bg-faint/50 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">User</th>
              <th className="px-5 py-3 font-semibold">Role</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Credit Score</th>
              <th className="px-5 py-3 font-semibold">Joined</th>
              <th className="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-faint">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="transition-colors hover:bg-faint/30">
                <td className="px-5 py-4">
                  <div className="font-semibold text-deep-accent">{user.name}</div>
                  <div className="text-xs text-muted">{user.email}</div>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-faint text-body'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide ${user.status === 'Active' ? 'text-primary' : 'text-[#d9534f]'}`}>
                    <span className={`h-1.5 w-1.5 ${user.status === 'Active' ? 'bg-primary' : 'bg-[#d9534f]'}`} />
                    {user.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  {user.creditScore ? (
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-deep-accent">{user.creditScore.score}</span>
                      <span className={`text-xs ${user.creditScore.change >= 0 ? 'text-primary' : 'text-[#d9534f]'}`}>
                        {user.creditScore.change >= 0 ? '+' : ''}{user.creditScore.change} this month
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted">N/A</span>
                  )}
                </td>
                <td className="px-5 py-4 text-muted">{user.joined}</td>
                <td className="px-5 py-4 text-right">
                  <button
                    onClick={() => handleEditClick(user)}
                    className="inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:text-primary"
                  >
                    <Edit className="h-4 w-4" strokeWidth={2} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(user)}
                    className="ml-2 inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:text-[#d9534f]"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={2} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-muted">No users found matching your search.</div>
        )}
      </div>

      {/* Edit User Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="relative max-h-[90vh] w-full max-w-[520px] overflow-y-auto border border-hairline bg-white p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsModalOpen(false)}
              disabled={saving}
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-faint hover:text-deep-accent disabled:opacity-40"
            >
              <X className="h-4 w-4" strokeWidth={2.25} />
            </button>

            <div className="flex items-start gap-3 mb-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#e7f3f5] text-primary">
                <Edit className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <h2 className="font-serif text-xl font-bold text-deep-accent">Edit User</h2>
                <p className="mt-1 text-sm text-body">Update account and credit details for {selectedUser.name}.</p>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-deep-accent">Full Name</label>
                <input
                  type="text"
                  autoComplete="off"
                  value={selectedUser.name}
                  onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                  className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                />
              </div>

              {/* Role */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-deep-accent">Role</label>
                <select
                  value={selectedUser.role}
                  autoComplete="off"
                  onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                  className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Status */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-deep-accent">Status</label>
                <select
                  value={selectedUser.status}
                  autoComplete="off"
                  onChange={(e) => setSelectedUser({ ...selectedUser, status: e.target.value })}
                  className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              {/* Credit Score Section */}
              <div className="border-t border-hairline pt-5">
                <div className="mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" strokeWidth={1.75} />
                  <h3 className="font-serif text-base font-bold text-deep-accent">Credit Score</h3>
                </div>

                {selectedUser.creditScore ? (
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Credit Score */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-deep-accent">Score</label>
                        <input
                          type="number"
                          min="300"
                          max="850"
                          autoComplete="off"
                          value={selectedUser.creditScore.score}
                          onChange={(e) => handleCreditScoreChange('score', parseInt(e.target.value) || 0)}
                          className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                        />
                      </div>

                      {/* Change This Month */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-deep-accent">Change This Month</label>
                        <input
                          type="number"
                          autoComplete="off"
                          value={selectedUser.creditScore.change}
                          onChange={(e) => handleCreditScoreChange('change', parseInt(e.target.value) || 0)}
                          className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Last Updated */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-deep-accent">Last Updated</label>
                      <input
                        type="date"
                        autoComplete="off"
                        value={selectedUser.creditScore.lastUpdated}
                        onChange={(e) => handleCreditScoreChange('lastUpdated', e.target.value)}
                        className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-muted text-center py-3 border border-dashed border-hairline">
                    No credit score data available for this user.
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex flex-col-reverse gap-3 border-t border-hairline pt-5 sm:flex-row sm:justify-end">
                <button
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                  className="min-h-[40px] border border-hairline bg-white px-5 py-2 text-sm font-semibold text-deep-accent transition-colors hover:bg-faint disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveUser}
                  disabled={saving}
                  className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-deep disabled:opacity-70"
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

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4"
          onClick={() => !deletingId && setConfirmDelete(null)}
        >
          <div
            className="relative w-full max-w-[480px] border border-hairline bg-white p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setConfirmDelete(null)}
              disabled={!!deletingId}
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-faint hover:text-deep-accent disabled:opacity-40"
            >
              <X className="h-4 w-4" strokeWidth={2.25} />
            </button>

            <div className="flex items-start gap-3 mb-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#fdf2f2] text-[#d9534f]">
                <AlertCircle className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <h2 className="font-serif text-xl font-bold text-deep-accent">Delete User</h2>
                <p className="mt-1 text-sm text-body">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="border border-hairline bg-faint px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted">User</div>
              <div className="mt-1 text-sm font-semibold text-deep-accent">{confirmDelete.name}</div>
              <div className="text-xs text-muted">{confirmDelete.email}</div>
            </div>

            <p className="mt-4 text-sm text-body">
              All of <strong className="text-deep-accent">{confirmDelete.name}</strong>&rsquo;s accounts,
              cards, transactions, statements, and related records will be permanently removed.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-hairline pt-5 sm:flex-row sm:justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={!!deletingId}
                className="min-h-[40px] border border-hairline bg-white px-5 py-2 text-sm font-semibold text-deep-accent transition-colors hover:bg-faint disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={!!deletingId}
                className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-[#d9534f] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#c9302c] disabled:opacity-70"
              >
                {deletingId ? (
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.25} />
                ) : (
                  <Trash2 className="h-4 w-4" strokeWidth={2.25} />
                )}
                Delete User
              </button>
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

export default ManageUsers;