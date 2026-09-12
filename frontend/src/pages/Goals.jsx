// src/pages/Goals.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Target, Wallet, CheckCircle2, Calendar, PiggyBank,
  TrendingUp, X, ChevronRight, AlertCircle, Activity, Trophy,
  ArrowUpRight, Landmark, Loader2,
} from 'lucide-react';
import { apiFetch } from '../utils/api';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount || 0);

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

const formatDateLong = (dateStr) => {
  if (!dateStr) return '—';
  const s = String(dateStr);
  const date = s.includes('T') ? new Date(s) : new Date(s + 'T00:00:00');
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const emptyCreateForm = {
  name: '',
  category: 'General Savings',
  targetAmount: '',
  targetDate: '',
  startingAmount: '',
  sourceAccountId: '',
  linkedAccountId: '',
  autoContribution: false,
  contributionAmount: '',
  contributionFrequency: 'Monthly',
  contributionDay: '',
};

const Goals = () => {
  // ---- Data -------------------------------------------------------
  const [goals, setGoals] = useState([]);
  const [completedGoals, setCompletedGoals] = useState([]);
  const [summary, setSummary] = useState({
    totalSaved: 0,
    activeGoals: 0,
    onTrack: 0,
    upcomingTargetDate: '',
  });
  const [accounts, setAccounts] = useState({
    all: [],
    checking: [],
    savings: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ---- UI state ---------------------------------------------------
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [formError, setFormError] = useState('');

  // ---- Load -------------------------------------------------------
  const loadGoals = useCallback(async () => {
    const res = await apiFetch('/goals/overview');
    const d = res?.data ?? res;

    const loaded = d.goals ?? [];
    setGoals(loaded.filter((g) => g.status !== 'Completed'));
    setCompletedGoals(loaded.filter((g) => g.status === 'Completed'));
    setSummary(
      d.summary ?? {
        totalSaved: 0,
        activeGoals: 0,
        onTrack: 0,
        upcomingTargetDate: '',
      }
    );
    setAccounts(d.accounts ?? { all: [], checking: [], savings: [] });

    setCreateForm((prev) => ({
      ...prev,
      sourceAccountId:
        prev.sourceAccountId || d.accounts?.checking?.[0]?.id || '',
      linkedAccountId:
        prev.linkedAccountId || d.accounts?.savings?.[0]?.id || '',
    }));
  }, []);

  useEffect(() => {
    const boot = async () => {
      try {
        setLoading(true);
        setError('');
        await loadGoals();
      } catch (err) {
        console.error('❌ Failed to load goals:', err);
        setError(err.message || 'Failed to load goals');
      } finally {
        setLoading(false);
      }
    };
    boot();
  }, [loadGoals]);

  const selectedGoal =
    goals.find((g) => g.id === selectedGoalId) ||
    completedGoals.find((g) => g.id === selectedGoalId) ||
    null;

  const goalActivitiesForSelected = selectedGoal?.activities || [];

  // ---- Create -----------------------------------------------------
  const handleCreateGoal = () => {
    setFormError('');
    setCreateForm({
      ...emptyCreateForm,
      sourceAccountId: accounts.checking[0]?.id || '',
      linkedAccountId: accounts.savings[0]?.id || '',
    });
    setShowCreateGoal(true);
  };

  const closeCreateGoal = () => {
    setShowCreateGoal(false);
    setCreateForm(emptyCreateForm);
    setFormError('');
  };

  const handleSubmitCreateGoal = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      const res = await apiFetch('/goals', {
        method: 'POST',
        body: JSON.stringify({
          ...createForm,
          targetAmount: parseFloat(createForm.targetAmount),
          startingAmount: parseFloat(createForm.startingAmount) || 0,
          contributionAmount: parseFloat(createForm.contributionAmount) || 0,
          contributionDay:
            createForm.contributionFrequency === 'Daily'
              ? null
              : parseInt(createForm.contributionDay, 10),
        }),
      });
      const d = res?.data ?? res;
      await loadGoals();
      setSelectedGoalId(d?.goal?.id ?? null);
      closeCreateGoal();
    } catch (err) {
      setFormError(err.message || 'Failed to create goal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCreateForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Overview config
  const overviewCards = [
    {
      label: 'Total Saved',
      value: formatCurrency(summary.totalSaved),
      icon: Wallet,
    },
    { label: 'Active Goals', value: summary.activeGoals, icon: Target },
    { label: 'On Track', value: summary.onTrack, icon: TrendingUp },
    {
      label: 'Upcoming Target',
      value: summary.upcomingTargetDate
        ? formatDate(summary.upcomingTargetDate)
        : '—',
      icon: Calendar,
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" strokeWidth={1.75} />
        <p className="text-sm text-muted">Loading your goals…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-4">
        <p className="font-serif text-xl font-bold text-deep-accent">
          We couldn&rsquo;t load your goals
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
            Financial Goals
          </h1>
          <p className="mt-1 text-sm text-body sm:text-base">
            Set savings goals, track your progress, and build toward the things that
            matter to you.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreateGoal}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <Plus className="h-4 w-4" strokeWidth={2.25} />
          Create a Goal
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
            <div className="mt-1 font-serif text-lg font-bold text-deep-accent sm:text-xl">
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* My Financial Goals */}
      <section className="mb-10">
        <h2 className="mb-4 font-serif text-lg font-bold text-deep-accent sm:text-xl">
          My Financial Goals
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.length === 0 ? (
            <div className="col-span-full border border-hairline bg-faint px-6 py-14 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center bg-[#e7f3f5] text-primary">
                <PiggyBank className="h-6 w-6" strokeWidth={1.5} />
              </span>
              <p className="mt-4 font-serif text-base font-bold text-deep-accent sm:text-lg">
                You haven&rsquo;t set any goals yet
              </p>
              <p className="mx-auto mt-1.5 max-w-md text-xs text-muted sm:text-sm">
                Set a target, choose a date, and track your progress as you save
                toward the things that matter to you.
              </p>
              <button
                type="button"
                onClick={handleCreateGoal}
                className="mt-5 inline-flex min-h-[40px] items-center gap-2 bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
                Create your first goal
              </button>
            </div>
          ) : (
            goals.map((goal) => {
              const isSelected = selectedGoalId === goal.id;
              return (
                <div
                  key={goal.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedGoalId(goal.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedGoalId(goal.id);
                    }
                  }}
                  className={`flex cursor-pointer flex-col border bg-white p-5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                    isSelected
                      ? 'border-2 border-primary'
                      : 'border border-hairline hover:border-primary'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-deep-accent">
                      <Target className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
                      {goal.category}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide ${
                        goal.status === 'On Track' ? 'text-primary' : 'text-[#d9534f]'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 ${
                          goal.status === 'On Track' ? 'bg-primary' : 'bg-[#d9534f]'
                        }`}
                        aria-hidden="true"
                      />
                      {goal.status}
                    </span>
                  </div>

                  <div className="mt-3 text-sm font-semibold text-deep-accent sm:text-base">
                    {goal.name}
                  </div>

                  <div className="mt-3 flex flex-col gap-1.5">
                    <div className="flex items-baseline justify-between">
                      <span className="font-serif text-lg font-bold text-deep-accent">
                        {formatCurrency(goal.currentAmount)}
                      </span>
                      <span className="text-xs text-muted">
                        of {formatCurrency(goal.targetAmount)}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-hairline">
                      <div
                        className="h-full bg-primary transition-[width] duration-300"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-deep-accent">
                        {goal.progress}% complete
                      </span>
                      <span className="text-muted">
                        {formatCurrency(goal.targetAmount - goal.currentAmount)}{' '}
                        remaining
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-hairline pt-3 text-xs text-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" strokeWidth={2} />
                      Target: {formatDate(goal.targetDate)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Landmark className="h-3 w-3" strokeWidth={2} />
                      {goal.linkedAccount}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="mt-4 inline-flex min-h-[34px] items-center justify-center gap-1.5 border border-hairline bg-white px-3 py-1.5 text-xs font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    View Goal
                    <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.25} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Selected Goal Details */}
      {selectedGoal && (
        <section className="mb-10 border-t border-hairline pt-8">
          <h2 className="mb-4 font-serif text-lg font-bold text-deep-accent sm:text-xl">
            Goal Details
          </h2>

          <div className="border border-hairline bg-faint p-5 sm:p-6">
            <div className="mb-6 flex min-w-0 items-start gap-3 border-b border-hairline pb-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-deep-accent text-white">
                <Target className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-deep-accent sm:text-base">
                  {selectedGoal.name}
                </div>
                <div className="truncate text-xs text-body sm:text-sm">
                  {selectedGoal.category}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div>
                <div className="mb-4 border-b border-hairline pb-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-body sm:text-sm">
                      Progress
                    </span>
                    <span className="font-serif text-lg font-bold text-deep-accent">
                      {selectedGoal.progress}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-hairline">
                    <div
                      className="h-full bg-primary transition-[width] duration-300"
                      style={{ width: `${selectedGoal.progress}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="font-serif text-base font-bold text-deep-accent">
                      {formatCurrency(selectedGoal.currentAmount)}
                    </span>
                    <span className="text-xs text-muted">
                      Target: {formatCurrency(selectedGoal.targetAmount)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col divide-y divide-faint">
                  <DetailRow
                    label="Current Balance"
                    value={formatCurrency(selectedGoal.currentAmount)}
                  />
                  <DetailRow
                    label="Target Amount"
                    value={formatCurrency(selectedGoal.targetAmount)}
                  />
                  <DetailRow
                    label="Remaining"
                    value={formatCurrency(
                      selectedGoal.targetAmount - selectedGoal.currentAmount
                    )}
                  />
                  <DetailRow
                    label="Target Date"
                    value={formatDateLong(selectedGoal.targetDate)}
                  />
                  <DetailRow
                    label="From Account"
                    value={selectedGoal.sourceAccount || '—'}
                  />
                  <DetailRow
                    label="Saving Into"
                    value={selectedGoal.linkedAccount || '—'}
                  />
                  <DetailRow
                    label="Contribution"
                    value={
                      selectedGoal.contributionAmount > 0
                        ? `${formatCurrency(
                            selectedGoal.contributionAmount
                          )} / ${selectedGoal.contributionFrequency}`
                        : 'Not set'
                    }
                  />
                  <DetailRow
                    label="Next Contribution"
                    value={formatDate(selectedGoal.nextContributionDate)}
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <div className="mb-3 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" strokeWidth={1.75} />
                  <h3 className="font-serif text-base font-bold text-deep-accent sm:text-lg">
                    Recent Activity
                  </h3>
                </div>

                <div className="flex flex-col border-t border-hairline">
                  {goalActivitiesForSelected.length === 0 ? (
                    <p className="py-4 text-sm text-muted">No activity yet.</p>
                  ) : (
                    goalActivitiesForSelected.slice(0, 12).map((activity) => (
                      <div
                        key={activity.id}
                        className="flex flex-col gap-2 border-b border-faint py-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#e7f3f5] text-primary">
                            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
                          </span>
                          <div className="flex flex-col">
                            <span className="text-xs text-muted">
                              {formatDate(activity.date)}
                            </span>
                            <span className="text-sm text-body">
                              {activity.description}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-0.5 sm:flex-row sm:items-center sm:gap-4">
                          <span className="text-sm font-semibold text-primary">
                            +{formatCurrency(activity.amount)}
                          </span>
                          <span className="text-xs text-muted">
                            {formatCurrency(activity.balance)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Completed Goals */}
      <section className="mb-4 border-t border-hairline pt-8">
        <div className="mb-4 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" strokeWidth={1.75} />
          <h2 className="font-serif text-lg font-bold text-deep-accent sm:text-xl">
            Completed Goals
          </h2>
        </div>

        <div className="overflow-hidden border border-hairline bg-white">
          {completedGoals.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <CheckCircle2 className="mx-auto h-6 w-6 text-muted" strokeWidth={1.5} />
              <p className="mt-2.5 text-sm font-semibold text-deep-accent">
                No completed goals yet
              </p>
              <p className="mx-auto mt-1 max-w-sm text-xs text-muted">
                Goals you finish will show up here so you can look back on your
                progress.
              </p>
            </div>
          ) : (
            completedGoals.map((goal) => (
              <div
                key={goal.id}
                className="flex flex-col gap-2 border-b border-faint px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#e7f3f5] text-primary">
                    <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-deep-accent">
                      {goal.name}
                    </div>
                    <div className="truncate text-xs text-muted">{goal.category}</div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 sm:justify-end">
                  <span className="font-serif text-base font-bold text-primary">
                    {formatCurrency(goal.targetAmount)}
                  </span>
                  <span className="text-xs text-muted">
                    Completed {formatDate(goal.lastContributionDate)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Create Goal Modal (only action left on this page) */}
      {showCreateGoal && (
        <ModalShell onClose={closeCreateGoal}>
          <h2 className="font-serif text-xl font-bold text-deep-accent sm:text-2xl">
            Create a Goal
          </h2>
          <p className="mt-1 text-sm text-body">
            Set your savings target and start tracking your progress.
          </p>

          <form onSubmit={handleSubmitCreateGoal} className="mt-6 flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="goalName" className="text-sm font-semibold text-deep-accent">
                Goal Name
              </label>
              <input
                type="text"
                id="goalName"
                name="name"
                value={createForm.name}
                onChange={handleCreateFormChange}
                placeholder="e.g. Emergency Fund"
                required
                className="min-h-[40px] w-full border border-hairline bg-white px-3 py-2 text-sm text-deep-accent placeholder:text-muted/70 focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="goalCategory" className="text-sm font-semibold text-deep-accent">
                Goal Category
              </label>
              <select
                id="goalCategory"
                name="category"
                value={createForm.category}
                onChange={handleCreateFormChange}
                className="min-h-[40px] w-full border border-hairline bg-white px-3 py-2 text-sm text-deep-accent focus:border-primary focus:outline-none"
              >
                <option value="Emergency Fund">Emergency Fund</option>
                <option value="Vacation">Vacation</option>
                <option value="New Car">New Car</option>
                <option value="Home">Home</option>
                <option value="Education">Education</option>
                <option value="Wedding">Wedding</option>
                <option value="Major Purchase">Major Purchase</option>
                <option value="General Savings">General Savings</option>
                <option value="Custom Goal">Custom Goal</option>
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="targetAmount" className="text-sm font-semibold text-deep-accent">
                  Target Amount
                </label>
                <div className="flex items-center border border-hairline bg-white focus-within:border-primary">
                  <span className="pl-3 pr-1 text-base font-bold text-body">$</span>
                  <input
                    type="number"
                    id="targetAmount"
                    name="targetAmount"
                    value={createForm.targetAmount}
                    onChange={handleCreateFormChange}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    required
                    className="min-h-[40px] w-full border-none bg-transparent px-2 py-2 text-sm font-semibold text-deep-accent outline-none placeholder:text-muted/60"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="targetDate" className="text-sm font-semibold text-deep-accent">
                  Target Date
                </label>
                <input
                  type="date"
                  id="targetDate"
                  name="targetDate"
                  value={createForm.targetDate}
                  onChange={handleCreateFormChange}
                  required
                  className="min-h-[40px] w-full border border-hairline bg-white px-3 py-2 text-sm text-deep-accent focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="startingAmount" className="text-sm font-semibold text-deep-accent">
                Starting Amount
              </label>
              <div className="flex items-center border border-hairline bg-white focus-within:border-primary">
                <span className="pl-3 pr-1 text-base font-bold text-body">$</span>
                <input
                  type="number"
                  id="startingAmount"
                  name="startingAmount"
                  value={createForm.startingAmount}
                  onChange={handleCreateFormChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="min-h-[40px] w-full border-none bg-transparent px-2 py-2 text-sm font-semibold text-deep-accent outline-none placeholder:text-muted/60"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="sourceAccountId" className="text-sm font-semibold text-deep-accent">
                  From Account (Checking)
                </label>
                <select
                  id="sourceAccountId"
                  name="sourceAccountId"
                  value={createForm.sourceAccountId}
                  onChange={handleCreateFormChange}
                  required
                  className="min-h-[40px] w-full border border-hairline bg-white px-3 py-2 text-sm text-deep-accent focus:border-primary focus:outline-none"
                >
                  <option value="">Select account</option>
                  {accounts.checking.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label} — {formatCurrency(a.available)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="linkedAccountId" className="text-sm font-semibold text-deep-accent">
                  Saving Into (Savings)
                </label>
                <select
                  id="linkedAccountId"
                  name="linkedAccountId"
                  value={createForm.linkedAccountId}
                  onChange={handleCreateFormChange}
                  required
                  className="min-h-[40px] w-full border border-hairline bg-white px-3 py-2 text-sm text-deep-accent focus:border-primary focus:outline-none"
                >
                  <option value="">Select account</option>
                  {accounts.savings.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label} — {formatCurrency(a.total)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-body">
              <input
                type="checkbox"
                name="autoContribution"
                checked={createForm.autoContribution}
                onChange={handleCreateFormChange}
                className="h-4 w-4 accent-[#008296]"
              />
              Set up automatic contributions
            </label>

            {createForm.autoContribution && (
              <div className="grid grid-cols-1 gap-4 border-t border-hairline pt-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contributionAmount" className="text-sm font-semibold text-deep-accent">
                    Contribution Amount
                  </label>
                  <div className="flex items-center border border-hairline bg-white focus-within:border-primary">
                    <span className="pl-3 pr-1 text-base font-bold text-body">$</span>
                    <input
                      type="number"
                      id="contributionAmount"
                      name="contributionAmount"
                      value={createForm.contributionAmount}
                      onChange={handleCreateFormChange}
                      placeholder="0.00"
                      min="0.01"
                      step="0.01"
                      className="min-h-[40px] w-full border-none bg-transparent px-2 py-2 text-sm font-semibold text-deep-accent outline-none placeholder:text-muted/60"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contributionFrequency" className="text-sm font-semibold text-deep-accent">
                    Frequency
                  </label>
                  <select
                    id="contributionFrequency"
                    name="contributionFrequency"
                    value={createForm.contributionFrequency}
                    onChange={handleCreateFormChange}
                    className="min-h-[40px] w-full border border-hairline bg-white px-3 py-2 text-sm text-deep-accent focus:border-primary focus:outline-none"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Biweekly">Biweekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>

                {(createForm.contributionFrequency === 'Weekly' ||
                  createForm.contributionFrequency === 'Biweekly') && (
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label htmlFor="contributionDay" className="text-sm font-semibold text-deep-accent">
                      Day of Week
                    </label>
                    <select
                      id="contributionDay"
                      name="contributionDay"
                      value={createForm.contributionDay}
                      onChange={handleCreateFormChange}
                      className="min-h-[40px] w-full border border-hairline bg-white px-3 py-2 text-sm text-deep-accent focus:border-primary focus:outline-none"
                    >
                      <option value="">Select day</option>
                      {DAYS_OF_WEEK.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {createForm.contributionFrequency === 'Monthly' && (
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label htmlFor="contributionDay" className="text-sm font-semibold text-deep-accent">
                      Day of Month
                    </label>
                    <select
                      id="contributionDay"
                      name="contributionDay"
                      value={createForm.contributionDay}
                      onChange={handleCreateFormChange}
                      className="min-h-[40px] w-full border border-hairline bg-white px-3 py-2 text-sm text-deep-accent focus:border-primary focus:outline-none"
                    >
                      <option value="">Select day</option>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {formError && (
              <div className="flex items-start gap-2 border border-[#f5c6cb] bg-[#f8d7da] px-4 py-2.5">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#721c24]" strokeWidth={2} />
                <span className="text-sm text-[#721c24]">{formError}</span>
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-hairline pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeCreateGoal}
                disabled={submitting}
                className="min-h-[40px] border border-hairline bg-white px-5 py-2 text-sm font-semibold text-deep-accent transition-colors hover:bg-faint disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-deep disabled:opacity-70"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.25} />
                ) : (
                  <Plus className="h-4 w-4" strokeWidth={2.25} />
                )}
                Create Goal
              </button>
            </div>
          </form>
        </ModalShell>
      )}
    </div>
  );
};

const ModalShell = ({ children, onClose }) => (
  <div
    className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4"
    onClick={onClose}
  >
    <div
      className="relative max-h-[90vh] w-full max-w-[600px] overflow-y-auto border border-hairline bg-white p-6 sm:p-8"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-faint hover:text-deep-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <X className="h-4 w-4" strokeWidth={2.25} />
      </button>
      {children}
    </div>
  </div>
);

const DetailRow = ({ label, value }) => (
  <div className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
    <span className="text-xs text-muted sm:text-sm">{label}</span>
    <span className="text-sm font-semibold text-ink sm:text-right">{value}</span>
  </div>
);

export default Goals;