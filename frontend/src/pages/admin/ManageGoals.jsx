// src/pages/admin/ManageGoals.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Filter, Edit, X, Save, Target,
  TrendingUp, Calendar, CheckCircle2, Loader2, ArrowUpRight,
  Pencil, Trash2, Plus, AlertCircle,
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

const todayISO = () => new Date().toISOString().split('T')[0];

const getStatusBadge = (status) => {
  switch (status) {
    case 'On Track':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-primary">
          <span className="h-1.5 w-1.5 bg-primary" />
          On Track
        </span>
      );
    case 'Completed':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-primary">
          <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.25} />
          Completed
        </span>
      );
    case 'Paused':
    case 'Off Track':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#f0ad4e]">
          <span className="h-1.5 w-1.5 bg-[#f0ad4e]" />
          {status}
        </span>
      );
    default:
      return null;
  }
};

const ManageGoals = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [originalUser, setOriginalUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Activity management state
  const [activityModalMode, setActivityModalMode] = useState(null); // 'add' | 'edit' | null
  const [activityGoalId, setActivityGoalId] = useState(null);
  const [activityBeingEdited, setActivityBeingEdited] = useState(null);
  const [activityForm, setActivityForm] = useState({
    amount: '',
    date: todayISO(),
    description: '',
  });
  const [activitySaving, setActivitySaving] = useState(false);
  const [activityError, setActivityError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null); // activity object or null
  const [deletingActivity, setDeletingActivity] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadUsers = useCallback(async () => {
    const res = await apiFetch('/admin/goals');
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
        console.error('❌ Failed to load goals:', err);
        setError(err.message || 'Failed to load goals');
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

  // Refetch the user's detail and merge into selectedUser + originalUser.
  // Pending goal-field edits on OTHER goals are preserved by merging on id.
  const refreshUserDetail = async (userId, preservePending = true) => {
    const res = await apiFetch(`/admin/goals/${userId}`);
    const d = res?.data ?? res;
    const detail = d?.user;
    if (!detail) return;

    setSelectedUser((prev) => {
      const prevGoalsById = new Map(
        ((prev?.goals) || []).map((g) => [g.id, g])
      );
      const mergedGoals = (detail.goals || []).map((fresh) => {
        const old = prevGoalsById.get(fresh.id);
        if (!old || !preservePending) return fresh;
        // Preserve locally-edited goal fields (but always use fresh activities)
        return {
          ...fresh,
          name: old.name,
          category: old.category,
          targetAmount: old.targetAmount,
          targetDate: old.targetDate,
          contributionAmount: old.contributionAmount,
          contributionFrequency: old.contributionFrequency,
          nextContributionDate: old.nextContributionDate,
          status: old.status,
        };
      });
      return {
        ...(prev || {}),
        totalSavedBalance: prev?.totalSavedBalance ?? detail.summary.totalSavedBalance,
        activeGoals: prev?.activeGoals ?? detail.summary.activeGoals,
        onTrack: prev?.onTrack ?? detail.summary.onTrack,
        upcomingTargetDate:
          prev?.upcomingTargetDate ?? detail.summary.upcomingTargetDate,
        goals: mergedGoals,
      };
    });

    setOriginalUser((prev) => {
      const prevGoalsById = new Map(
        ((prev?.goals) || []).map((g) => [g.id, g])
      );
      const mergedGoals = (detail.goals || []).map((fresh) => {
        const old = prevGoalsById.get(fresh.id);
        if (!old || !preservePending) return fresh;
        return {
          ...fresh,
          name: old.name,
          category: old.category,
          targetAmount: old.targetAmount,
          targetDate: old.targetDate,
          contributionAmount: old.contributionAmount,
          contributionFrequency: old.contributionFrequency,
          nextContributionDate: old.nextContributionDate,
          status: old.status,
        };
      });
      return {
        ...(prev || {}),
        totalSavedBalance: prev?.totalSavedBalance ?? detail.summary.totalSavedBalance,
        activeGoals: prev?.activeGoals ?? detail.summary.activeGoals,
        onTrack: prev?.onTrack ?? detail.summary.onTrack,
        upcomingTargetDate:
          prev?.upcomingTargetDate ?? detail.summary.upcomingTargetDate,
        goals: mergedGoals,
      };
    });
  };

  const handleManageClick = async (user) => {
    setSelectedUser(JSON.parse(JSON.stringify(user)));
    setOriginalUser(JSON.parse(JSON.stringify(user)));
    setIsModalOpen(true);
    setDetailLoading(true);

    try {
      const res = await apiFetch(`/admin/goals/${user.id}`);
      const d = res?.data ?? res;
      const detail = d?.user;
      if (detail) {
        const merged = {
          ...JSON.parse(JSON.stringify(user)),
          totalSavedBalance: detail.summary.totalSavedBalance,
          activeGoals: detail.summary.activeGoals,
          onTrack: detail.summary.onTrack,
          upcomingTargetDate: detail.summary.upcomingTargetDate,
          goals: detail.goals || [],
        };
        setSelectedUser(merged);
        setOriginalUser(JSON.parse(JSON.stringify(merged)));
      }
    } catch (err) {
      console.error('❌ Failed to load goal detail:', err);
      showToast(err.message || 'Failed to load goal detail');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpdateGoalField = (goalId, field, value) => {
    setSelectedUser((prev) => ({
      ...prev,
      goals: (prev.goals || []).map((g) =>
        g.id === goalId ? { ...g, [field]: value } : g
      ),
    }));
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    setSaving(true);

    try {
      await apiFetch(`/admin/goals/${selectedUser.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          totalSavedBalance: selectedUser.totalSavedBalance,
          activeGoals: selectedUser.activeGoals,
          onTrack: selectedUser.onTrack,
          upcomingTargetDate: selectedUser.upcomingTargetDate || null,
        }),
      });

      const originalById = new Map(
        (originalUser?.goals || []).map((g) => [g.id, g])
      );
      for (const goal of selectedUser.goals || []) {
        const orig = originalById.get(goal.id);
        if (!orig) continue;

        const changed =
          orig.name !== goal.name ||
          orig.category !== goal.category ||
          orig.targetAmount !== goal.targetAmount ||
          orig.targetDate !== goal.targetDate ||
          orig.contributionAmount !== goal.contributionAmount ||
          orig.contributionFrequency !== goal.contributionFrequency ||
          orig.contributionDay !== goal.contributionDay ||
          orig.nextContributionDate !== goal.nextContributionDate ||
          orig.status !== goal.status;

        if (!changed) continue;

        await apiFetch(`/admin/goals/${selectedUser.id}/goals/${goal.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: goal.name,
            category: goal.category,
            targetAmount: goal.targetAmount,
            targetDate: goal.targetDate || null,
            contributionAmount: goal.contributionAmount,
            contributionFrequency: goal.contributionFrequency,
            contributionDay: goal.contributionDay,
            nextContributionDate: goal.nextContributionDate || null,
            status: goal.status,
          }),
        });
      }

      await loadUsers();
      setIsModalOpen(false);
      showToast('Goal record updated successfully.');
    } catch (err) {
      console.error('❌ Save goals failed:', err);
      showToast(err.message || 'Failed to update goal record');
    } finally {
      setSaving(false);
    }
  };

  // ────────────────────────────────────────────────────────
  // Activity handlers
  // ────────────────────────────────────────────────────────
  const openAddActivity = (goal) => {
    setActivityModalMode('add');
    setActivityGoalId(goal.id);
    setActivityBeingEdited(null);
    setActivityForm({
      amount: '',
      date: todayISO(),
      description: 'Admin contribution',
    });
    setActivityError('');
  };

  const openEditActivity = (goal, activity) => {
    setActivityModalMode('edit');
    setActivityGoalId(goal.id);
    setActivityBeingEdited(activity);
    setActivityForm({
      amount: String(activity.amount),
      date: activity.date
        ? new Date(activity.date).toISOString().split('T')[0]
        : todayISO(),
      description: activity.description || '',
    });
    setActivityError('');
  };

  const closeActivityModal = () => {
    setActivityModalMode(null);
    setActivityGoalId(null);
    setActivityBeingEdited(null);
    setActivityForm({ amount: '', date: todayISO(), description: '' });
    setActivityError('');
  };

  const handleSubmitActivity = async (e) => {
    e.preventDefault();
    if (!selectedUser || !activityGoalId) return;

    setActivitySaving(true);
    setActivityError('');

    try {
      const payload = {
        amount: parseFloat(activityForm.amount),
        date: activityForm.date,
        description: activityForm.description,
      };

      if (activityModalMode === 'add') {
        await apiFetch(
          `/admin/goals/${selectedUser.id}/goals/${activityGoalId}/activities`,
          { method: 'POST', body: JSON.stringify(payload) }
        );
      } else if (activityModalMode === 'edit' && activityBeingEdited) {
        await apiFetch(
          `/admin/goals/${selectedUser.id}/goals/${activityGoalId}/activities/${activityBeingEdited.id}`,
          { method: 'PUT', body: JSON.stringify(payload) }
        );
      }

      await refreshUserDetail(selectedUser.id);
      await loadUsers();
      closeActivityModal();
      showToast(
        activityModalMode === 'add'
          ? 'Activity added successfully.'
          : 'Activity updated successfully.'
      );
    } catch (err) {
      setActivityError(err.message || 'Failed to save activity');
    } finally {
      setActivitySaving(false);
    }
  };

  const handleDeleteActivity = async () => {
    if (!selectedUser || !deleteConfirm) return;

    setDeletingActivity(true);
    try {
      await apiFetch(
        `/admin/goals/${selectedUser.id}/goals/${deleteConfirm.goalId}/activities/${deleteConfirm.activity.id}`,
        { method: 'DELETE' }
      );
      await refreshUserDetail(selectedUser.id);
      await loadUsers();
      setDeleteConfirm(null);
      showToast('Activity deleted successfully.');
    } catch (err) {
      showToast(err.message || 'Failed to delete activity');
    } finally {
      setDeletingActivity(false);
    }
  };

  // ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" strokeWidth={1.75} />
        <p className="text-sm text-muted">Loading goals…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-4">
        <p className="font-serif text-xl font-bold text-deep-accent">
          We couldn&rsquo;t load goals
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
            Manage Financial Goals
          </h1>
          <p className="mt-1 text-sm text-body">
            Manage user savings summaries and individual goals.
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
              <th className="px-5 py-3 font-semibold">Total Saved</th>
              <th className="px-5 py-3 font-semibold">Active Goals</th>
              <th className="px-5 py-3 font-semibold">On Track</th>
              <th className="px-5 py-3 font-semibold">Next Target Date</th>
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
                  {formatCurrency(u.totalSavedBalance)}
                </td>
                <td className="px-5 py-4 text-body">{u.activeGoals}</td>
                <td className="px-5 py-4">
                  <span
                    className={`font-semibold ${
                      u.onTrack > 0 ? 'text-primary' : 'text-[#f0ad4e]'
                    }`}
                  >
                    {u.onTrack} / {u.activeGoals}
                  </span>
                </td>
                <td className="px-5 py-4 text-muted">
                  {u.upcomingTargetDate || 'N/A'}
                </td>
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

      {/* Main Modal */}
      {isModalOpen && selectedUser && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4"
          onClick={() => !saving && setIsModalOpen(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-[800px] overflow-y-auto border border-hairline bg-white p-6 sm:p-8"
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
                <Target className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <h2 className="font-serif text-xl font-bold text-deep-accent">
                  Manage Goals
                </h2>
                <p className="mt-1 text-sm text-body">
                  {selectedUser.user} • {selectedUser.id}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-8">
              {/* Summary */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 font-serif text-lg font-bold text-deep-accent">
                  <TrendingUp className="h-4 w-4 text-primary" /> Summary Overview
                </h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-deep-accent">
                      Total Saved
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={selectedUser.totalSavedBalance ?? 0}
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          totalSavedBalance: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-deep-accent">
                      Active Goals
                    </label>
                    <input
                      type="number"
                      value={selectedUser.activeGoals ?? 0}
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          activeGoals: parseInt(e.target.value) || 0,
                        })
                      }
                      className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-deep-accent">
                      On Track
                    </label>
                    <input
                      type="number"
                      value={selectedUser.onTrack ?? 0}
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          onTrack: parseInt(e.target.value) || 0,
                        })
                      }
                      className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-deep-accent">
                      Next Target Date
                    </label>
                    <input
                      type="date"
                      value={selectedUser.upcomingTargetDate || ''}
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          upcomingTargetDate: e.target.value,
                        })
                      }
                      className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Individual goals */}
              <div>
                <div className="mb-3 flex items-center gap-2 border-b border-hairline pb-2">
                  <Calendar className="h-4 w-4 text-primary" strokeWidth={1.75} />
                  <h3 className="font-serif text-lg font-bold text-deep-accent">
                    Individual Goals
                  </h3>
                </div>

                {detailLoading ? (
                  <p className="py-4 text-sm text-muted">Loading goals…</p>
                ) : (selectedUser.goals || []).length === 0 ? (
                  <div className="border border-dashed border-hairline py-4 text-center text-sm text-muted">
                    No goals on file.
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {(selectedUser.goals || []).map((goal) => {
                      const progress = Math.min(
                        100,
                        Math.round(
                          ((goal.currentAmount || 0) /
                            Math.max(goal.targetAmount || 1, 0.01)) *
                            100
                        )
                      );
                      return (
                        <div
                          key={goal.id}
                          className="border border-hairline bg-faint/30 p-4"
                        >
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-deep-accent">
                                {goal.name}
                              </span>
                              <span className="font-mono text-xs text-muted">
                                {goal.category}
                              </span>
                            </div>
                            {getStatusBadge(goal.status)}
                          </div>

                          {/* Progress */}
                          <div className="mb-4 flex items-center gap-3">
                            <div className="h-2 flex-1 bg-hairline">
                              <div
                                className="h-full bg-primary"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="w-32 text-right text-xs font-semibold text-deep-accent">
                              {formatCurrency(goal.currentAmount)} /{' '}
                              {formatCurrency(goal.targetAmount)}
                            </span>
                          </div>

                          {/* Editable fields */}
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-semibold text-deep-accent">
                                Name
                              </label>
                              <input
                                type="text"
                                value={goal.name}
                                onChange={(e) =>
                                  handleUpdateGoalField(
                                    goal.id,
                                    'name',
                                    e.target.value
                                  )
                                }
                                className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-semibold text-deep-accent">
                                Category
                              </label>
                              <input
                                type="text"
                                value={goal.category}
                                onChange={(e) =>
                                  handleUpdateGoalField(
                                    goal.id,
                                    'category',
                                    e.target.value
                                  )
                                }
                                className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-semibold text-deep-accent">
                                Status
                              </label>
                              <select
                                value={goal.status}
                                onChange={(e) =>
                                  handleUpdateGoalField(
                                    goal.id,
                                    'status',
                                    e.target.value
                                  )
                                }
                                className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                              >
                                <option value="On Track">On Track</option>
                                <option value="Paused">Paused</option>
                                <option value="Off Track">Off Track</option>
                                <option value="Completed">Completed</option>
                              </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-semibold text-deep-accent">
                                Current Amount
                              </label>
                              <input
                                type="number"
                                value={goal.currentAmount}
                                readOnly
                                tabIndex={-1}
                                className="min-h-[38px] w-full cursor-not-allowed border border-hairline bg-faint px-3 py-1.5 text-sm text-muted focus:outline-none"
                              />
                              <p className="text-[10px] text-muted">
                                Managed through activity below.
                              </p>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-semibold text-deep-accent">
                                Target Amount
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                value={goal.targetAmount}
                                onChange={(e) =>
                                  handleUpdateGoalField(
                                    goal.id,
                                    'targetAmount',
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-semibold text-deep-accent">
                                Target Date
                              </label>
                              <input
                                type="date"
                                value={goal.targetDate || ''}
                                onChange={(e) =>
                                  handleUpdateGoalField(
                                    goal.id,
                                    'targetDate',
                                    e.target.value
                                  )
                                }
                                className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                              />
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-semibold text-deep-accent">
                                Contribution
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                value={goal.contributionAmount}
                                onChange={(e) =>
                                  handleUpdateGoalField(
                                    goal.id,
                                    'contributionAmount',
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-semibold text-deep-accent">
                                Frequency
                              </label>
                              <select
                                value={goal.contributionFrequency}
                                onChange={(e) =>
                                  handleUpdateGoalField(
                                    goal.id,
                                    'contributionFrequency',
                                    e.target.value
                                  )
                                }
                                className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                              >
                                <option value="Daily">Daily</option>
                                <option value="Weekly">Weekly</option>
                                <option value="Biweekly">Biweekly</option>
                                <option value="Monthly">Monthly</option>
                              </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-semibold text-deep-accent">
                                Next Contribution
                              </label>
                              <input
                                type="date"
                                value={goal.nextContributionDate || ''}
                                onChange={(e) =>
                                  handleUpdateGoalField(
                                    goal.id,
                                    'nextContributionDate',
                                    e.target.value
                                  )
                                }
                                className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* Activity list */}
                          <div className="mt-4 border-t border-hairline pt-3">
                            <div className="mb-2 flex items-center justify-between">
                              <h4 className="text-xs font-bold uppercase tracking-wide text-muted">
                                Recent Activity
                              </h4>
                              <button
                                type="button"
                                onClick={() => openAddActivity(goal)}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition-colors hover:text-primary-deep"
                              >
                                <Plus className="h-3 w-3" strokeWidth={2.5} />
                                Add Activity
                              </button>
                            </div>
                            {(goal.activities || []).length === 0 ? (
                              <p className="py-1 text-xs text-muted">
                                No activity recorded.
                              </p>
                            ) : (
                              <div className="flex flex-col divide-y divide-faint">
                                {(goal.activities || []).map((activity) => (
                                  <div
                                    key={activity.id}
                                    className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2 text-xs"
                                  >
                                    <span className="inline-flex items-center gap-1.5 text-muted">
                                      <ArrowUpRight
                                        className="h-3 w-3"
                                        strokeWidth={2}
                                      />
                                      {formatDate(activity.date)}
                                    </span>
                                    <span className="text-body">
                                      {activity.description}
                                    </span>
                                    <span className="font-semibold text-primary">
                                      +{formatCurrency(activity.amount)}
                                    </span>
                                    <span className="text-muted">
                                      Bal: {formatCurrency(activity.balance)}
                                    </span>
                                    <div className="ml-auto flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          openEditActivity(goal, activity)
                                        }
                                        className="inline-flex h-6 w-6 items-center justify-center text-muted transition-colors hover:text-primary"
                                        title="Edit activity"
                                      >
                                        <Pencil
                                          className="h-3 w-3"
                                          strokeWidth={2}
                                        />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setDeleteConfirm({
                                            goalId: goal.id,
                                            goalName: goal.name,
                                            activity,
                                          })
                                        }
                                        className="inline-flex h-6 w-6 items-center justify-center text-muted transition-colors hover:text-[#d9534f]"
                                        title="Delete activity"
                                      >
                                        <Trash2
                                          className="h-3 w-3"
                                          strokeWidth={2}
                                        />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Actions */}
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

      {/* Activity Add/Edit Modal */}
      {activityModalMode && selectedUser && (
        <div
          className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/50 p-4"
          onClick={() => !activitySaving && closeActivityModal()}
        >
          <div
            className="relative w-full max-w-[480px] border border-hairline bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => !activitySaving && closeActivityModal()}
              disabled={activitySaving}
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-faint hover:text-deep-accent disabled:opacity-40"
            >
              <X className="h-4 w-4" strokeWidth={2.25} />
            </button>

            <h3 className="font-serif text-lg font-bold text-deep-accent">
              {activityModalMode === 'add' ? 'Add Activity' : 'Edit Activity'}
            </h3>
            <p className="mt-1 text-sm text-body">
              {activityModalMode === 'add'
                ? 'Money will move from the source to the linked account.'
                : 'Changes will adjust the money in both accounts.'}
            </p>

            <form
              onSubmit={handleSubmitActivity}
              className="mt-5 flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-deep-accent">
                  Amount
                </label>
                <div className="flex items-center border border-hairline bg-white focus-within:border-primary">
                  <span className="pl-3 pr-1 text-base font-bold text-body">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={activityForm.amount}
                    onChange={(e) =>
                      setActivityForm({
                        ...activityForm,
                        amount: e.target.value,
                      })
                    }
                    placeholder="0.00"
                    className="min-h-[40px] w-full border-none bg-transparent px-2 py-2 text-sm font-semibold text-deep-accent outline-none placeholder:text-muted/60"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-deep-accent">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={activityForm.date}
                  onChange={(e) =>
                    setActivityForm({
                      ...activityForm,
                      date: e.target.value,
                    })
                  }
                  className="min-h-[40px] w-full border border-hairline bg-white px-3 py-2 text-sm text-deep-accent focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-deep-accent">
                  Description
                </label>
                <input
                  type="text"
                  value={activityForm.description}
                  onChange={(e) =>
                    setActivityForm({
                      ...activityForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="e.g. Monthly contribution"
                  className="min-h-[40px] w-full border border-hairline bg-white px-3 py-2 text-sm text-deep-accent focus:border-primary focus:outline-none"
                />
              </div>

              {activityError && (
                <div className="flex items-start gap-2 border border-[#f5c6cb] bg-[#f8d7da] px-3 py-2">
                  <AlertCircle
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#721c24]"
                    strokeWidth={2}
                  />
                  <span className="text-xs text-[#721c24]">
                    {activityError}
                  </span>
                </div>
              )}

              <div className="flex flex-col-reverse gap-2 border-t border-hairline pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeActivityModal}
                  disabled={activitySaving}
                  className="min-h-[38px] border border-hairline bg-white px-4 py-2 text-sm font-semibold text-deep-accent hover:bg-faint disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={activitySaving}
                  className="inline-flex min-h-[38px] items-center justify-center gap-2 bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-deep disabled:opacity-70"
                >
                  {activitySaving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2.25} />
                  ) : (
                    <Save className="h-3.5 w-3.5" strokeWidth={2.25} />
                  )}
                  {activityModalMode === 'add' ? 'Add Activity' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/50 p-4"
          onClick={() => !deletingActivity && setDeleteConfirm(null)}
        >
          <div
            className="relative w-full max-w-[420px] border border-hairline bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#fdf2f2] text-[#d9534f]">
                <Trash2 className="h-4 w-4" strokeWidth={2} />
              </span>
              <div className="flex-1">
                <h3 className="font-serif text-base font-bold text-deep-accent">
                  Delete Activity
                </h3>
                <p className="mt-1 text-sm text-body">
                  Delete the{' '}
                  <span className="font-semibold">
                    {formatCurrency(deleteConfirm.activity.amount)}
                  </span>{' '}
                  entry from{' '}
                  <span className="font-semibold">
                    {deleteConfirm.goalName}
                  </span>
                  ? The money will be returned to the source account and the
                  matching transactions will be removed.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 border-t border-hairline pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                disabled={deletingActivity}
                className="min-h-[38px] border border-hairline bg-white px-4 py-2 text-sm font-semibold text-deep-accent hover:bg-faint disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteActivity}
                disabled={deletingActivity}
                className="inline-flex min-h-[38px] items-center justify-center gap-2 bg-[#d9534f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c9302c] disabled:opacity-70"
              >
                {deletingActivity ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2.25} />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={2.25} />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed right-4 top-4 z-[10002] flex items-start gap-3 border border-hairline bg-white p-4 shadow-lg">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2.25} />
          <p className="text-sm font-semibold text-deep-accent">{toast}</p>
        </div>
      )}
    </div>
  );
};

export default ManageGoals;