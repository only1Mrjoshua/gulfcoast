// src/pages/Goals.jsx
import React, { useState } from 'react';
import {
  Plus,
  Target,
  Wallet,
  CheckCircle2,
  Calendar,
  PiggyBank,
  TrendingUp,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  ChevronRight,
  AlertCircle,
  Sparkles,
  Activity,
  Trophy,
  ArrowUpRight,
  Landmark,
  Info,
} from 'lucide-react';
import {
  mockGoals,
  mockGoalActivities,
  mockCompletedGoals,
} from '../data/mockGoalsData';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

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

const Goals = () => {
  // State
  const [selectedGoalId, setSelectedGoalId] = useState(mockGoals[0]?.id || null);
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [showEditGoal, setShowEditGoal] = useState(false);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showAutoSave, setShowAutoSave] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Create goal form state
  const [createForm, setCreateForm] = useState({
    name: '',
    category: 'General Savings',
    targetAmount: '',
    targetDate: '',
    startingAmount: '',
    linkedAccount: 'chk1',
    autoContribution: false,
    contributionAmount: '',
    contributionFrequency: 'Monthly',
  });

  // Edit goal form state
  const [editForm, setEditForm] = useState({
    name: '',
    targetAmount: '',
    targetDate: '',
    contributionAmount: '',
    contributionFrequency: '',
    linkedAccount: '',
  });

  // Add money form state
  const [addMoneyForm, setAddMoneyForm] = useState({
    amount: '',
    fromAccount: 'chk1',
  });

  // Auto save form state
  const [autoSaveForm, setAutoSaveForm] = useState({
    amount: '',
    fromAccount: 'chk1',
    frequency: 'Monthly',
    startDate: new Date().toISOString().split('T')[0],
  });

  const selectedGoal = mockGoals.find((g) => g.id === selectedGoalId);
  const goalActivities = selectedGoal
    ? mockGoalActivities[selectedGoal.id] || []
    : [];

  // Totals
  const totalSaved = mockGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const activeGoals = mockGoals.length;
  const goalsOnTrack = mockGoals.filter((g) => g.status === 'On Track').length;

  // Handlers
  const handleCreateGoal = () => setShowCreateGoal(true);

  const closeCreateGoal = () => {
    setShowCreateGoal(false);
    setCreateForm({
      name: '',
      category: 'General Savings',
      targetAmount: '',
      targetDate: '',
      startingAmount: '',
      linkedAccount: 'chk1',
      autoContribution: false,
      contributionAmount: '',
      contributionFrequency: 'Monthly',
    });
  };

  const handleSubmitCreateGoal = () => {
    alert(`Goal "${createForm.name}" created successfully!`);
    closeCreateGoal();
  };

  const handleEditGoal = () => {
    if (selectedGoal) {
      setEditForm({
        name: selectedGoal.name,
        targetAmount: selectedGoal.targetAmount,
        targetDate: selectedGoal.targetDate,
        contributionAmount: selectedGoal.contributionAmount,
        contributionFrequency: selectedGoal.contributionFrequency,
        linkedAccount: selectedGoal.linkedAccount,
      });
      setShowEditGoal(true);
    }
  };

  const closeEditGoal = () => setShowEditGoal(false);

  const handleSubmitEditGoal = () => {
    alert(`Goal "${editForm.name}" updated successfully!`);
    closeEditGoal();
  };

  const handleAddMoney = () => setShowAddMoney(true);

  const closeAddMoney = () => {
    setShowAddMoney(false);
    setAddMoneyForm({ amount: '', fromAccount: 'chk1' });
  };

  const handleSubmitAddMoney = () => {
    alert(
      `Added ${formatCurrency(parseFloat(addMoneyForm.amount) || 0)} to ${
        selectedGoal?.name
      }`
    );
    closeAddMoney();
  };

  const handleAutoSave = () => setShowAutoSave(true);

  const closeAutoSave = () => {
    setShowAutoSave(false);
    setAutoSaveForm({
      amount: '',
      fromAccount: 'chk1',
      frequency: 'Monthly',
      startDate: new Date().toISOString().split('T')[0],
    });
  };

  const handleSubmitAutoSave = () => {
    alert(
      `Auto-save of ${formatCurrency(
        parseFloat(autoSaveForm.amount) || 0
      )} set up for ${selectedGoal?.name}`
    );
    closeAutoSave();
  };

  const handleDeleteGoal = () => setShowDeleteConfirm(true);
  const closeDeleteConfirm = () => setShowDeleteConfirm(false);

  const confirmDeleteGoal = () => {
    alert(`Goal "${selectedGoal?.name}" has been deleted.`);
    setShowDeleteConfirm(false);
    setSelectedGoalId(null);
  };

  const handleCreateFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCreateForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddMoneyChange = (e) => {
    const { name, value } = e.target;
    setAddMoneyForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAutoSaveChange = (e) => {
    const { name, value } = e.target;
    setAutoSaveForm((prev) => ({ ...prev, [name]: value }));
  };

  // Suggested contribution
  const calculateSuggestedContribution = () => {
    if (
      !createForm.targetAmount ||
      !createForm.targetDate ||
      !createForm.startingAmount
    )
      return null;
    const target = parseFloat(createForm.targetAmount);
    const current = parseFloat(createForm.startingAmount) || 0;
    const remaining = target - current;
    if (remaining <= 0) return null;
    const today = new Date();
    const targetDate = new Date(createForm.targetDate + 'T00:00:00');
    const monthsDiff =
      (targetDate.getFullYear() - today.getFullYear()) * 12 +
      targetDate.getMonth() -
      today.getMonth();
    const months = Math.max(monthsDiff, 1);
    return remaining / months;
  };

  const suggestedContribution = calculateSuggestedContribution();

  // Overview config
  const overviewCards = [
    { label: 'Total Saved', value: formatCurrency(totalSaved), icon: Wallet },
    { label: 'Active Goals', value: activeGoals, icon: Target },
    { label: 'On Track', value: goalsOnTrack, icon: TrendingUp },
    {
      label: 'Upcoming Target',
      value: mockGoals.length > 0 ? formatDate(mockGoals[0].targetDate) : 'N/A',
      icon: Calendar,
    },
  ];

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
          {mockGoals.length === 0 ? (
            <div className="col-span-full border border-hairline bg-faint py-12 text-center">
              <Target className="mx-auto h-8 w-8 text-muted" strokeWidth={1.5} />
              <p className="mt-3 text-sm font-semibold text-deep-accent">
                Start your first financial goal
              </p>
              <p className="mx-auto mt-1 max-w-md text-xs text-muted">
                Set a target, choose a date, and track your progress as you save.
              </p>
              <button
                type="button"
                onClick={handleCreateGoal}
                className="mt-5 inline-flex min-h-[40px] items-center gap-2 bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
                Create a Goal
              </button>
            </div>
          ) : (
            mockGoals.map((goal) => {
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

                  {/* Progress */}
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
                        {formatCurrency(goal.targetAmount - goal.currentAmount)} remaining
                      </span>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-hairline pt-3 text-xs text-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" strokeWidth={2} />
                      Target: {formatDate(goal.targetDate)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Landmark className="h-3 w-3" strokeWidth={2} />
                      Linked: {goal.linkedAccount}
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
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 border-b border-hairline pb-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 items-start gap-3">
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

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleAddMoney}
                  className="inline-flex min-h-[36px] items-center gap-1.5 bg-primary px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 sm:text-sm"
                >
                  <Wallet className="h-3.5 w-3.5" strokeWidth={2} />
                  Add Money
                </button>
                <button
                  type="button"
                  onClick={handleAutoSave}
                  className="inline-flex min-h-[36px] items-center gap-1.5 border border-hairline bg-white px-4 py-1.5 text-xs font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:text-sm"
                >
                  <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
                  Auto-Save
                </button>
                <button
                  type="button"
                  onClick={handleEditGoal}
                  className="inline-flex min-h-[36px] items-center gap-1.5 border border-hairline bg-white px-4 py-1.5 text-xs font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:text-sm"
                >
                  <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={handleDeleteGoal}
                  className="inline-flex min-h-[36px] items-center gap-1.5 border border-[#d9534f] bg-white px-4 py-1.5 text-xs font-semibold text-[#d9534f] transition-colors hover:bg-[#fdf2f2] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d9534f]/40 sm:text-sm"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                  Delete
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Info panel */}
              <div>
                {/* Progress block */}
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

                {/* Info rows */}
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
                    label="Linked Account"
                    value={selectedGoal.linkedAccount}
                  />
                  <DetailRow
                    label="Contribution"
                    value={`${formatCurrency(
                      selectedGoal.contributionAmount
                    )} / ${selectedGoal.contributionFrequency}`}
                  />
                  <DetailRow
                    label="Next Contribution"
                    value={formatDate(selectedGoal.nextContributionDate)}
                  />
                </div>
              </div>

              {/* Recent Activity */}
              <div className="flex flex-col">
                <div className="mb-3 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" strokeWidth={1.75} />
                  <h3 className="font-serif text-base font-bold text-deep-accent sm:text-lg">
                    Recent Activity
                  </h3>
                </div>

                <div className="flex flex-col border-t border-hairline">
                  {goalActivities.length === 0 ? (
                    <p className="py-4 text-sm text-muted">No activity yet.</p>
                  ) : (
                    goalActivities.slice(0, 5).map((activity) => (
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

                {goalActivities.length > 5 && (
                  <button
                    type="button"
                    className="mt-3 inline-flex items-center gap-1 self-start text-sm font-semibold text-primary hover:underline"
                  >
                    View All Activity
                    <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.25} />
                  </button>
                )}
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
          {mockCompletedGoals.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              No completed goals yet.
            </p>
          ) : (
            mockCompletedGoals.map((goal) => (
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
                    Completed {formatDate(goal.completionDate)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Create Goal Modal */}
      {showCreateGoal && (
        <ModalShell onClose={closeCreateGoal}>
          <h2 className="font-serif text-xl font-bold text-deep-accent sm:text-2xl">
            Create a Goal
          </h2>
          <p className="mt-1 text-sm text-body">
            Set your savings target and start tracking your progress.
          </p>

          <form
            onSubmit={handleSubmitCreateGoal}
            className="mt-6 flex flex-col gap-5"
          >
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="goalName"
                className="text-sm font-semibold text-deep-accent"
              >
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
              <label
                htmlFor="goalCategory"
                className="text-sm font-semibold text-deep-accent"
              >
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
                <label
                  htmlFor="targetAmount"
                  className="text-sm font-semibold text-deep-accent"
                >
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
                <label
                  htmlFor="targetDate"
                  className="text-sm font-semibold text-deep-accent"
                >
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
              <label
                htmlFor="startingAmount"
                className="text-sm font-semibold text-deep-accent"
              >
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

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="linkedAccount"
                className="text-sm font-semibold text-deep-accent"
              >
                Savings Account
              </label>
              <select
                id="linkedAccount"
                name="linkedAccount"
                value={createForm.linkedAccount}
                onChange={handleCreateFormChange}
                className="min-h-[40px] w-full border border-hairline bg-white px-3 py-2 text-sm text-deep-accent focus:border-primary focus:outline-none"
              >
                <option value="chk1">Checking •••• 4821</option>
                <option value="sav1">Savings •••• 9134</option>
              </select>
            </div>

            {suggestedContribution && suggestedContribution > 0 && (
              <div className="flex items-center justify-between border border-hairline bg-faint px-4 py-3">
                <span className="inline-flex items-center gap-2 text-xs text-body sm:text-sm">
                  <Sparkles className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
                  Suggested Monthly Contribution
                </span>
                <span className="font-serif text-base font-bold text-deep-accent">
                  {formatCurrency(suggestedContribution)}
                </span>
              </div>
            )}

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
                  <label
                    htmlFor="contributionAmount"
                    className="text-sm font-semibold text-deep-accent"
                  >
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
                  <label
                    htmlFor="contributionFrequency"
                    className="text-sm font-semibold text-deep-accent"
                  >
                    Frequency
                  </label>
                  <select
                    id="contributionFrequency"
                    name="contributionFrequency"
                    value={createForm.contributionFrequency}
                    onChange={handleCreateFormChange}
                    className="min-h-[40px] w-full border border-hairline bg-white px-3 py-2 text-sm text-deep-accent focus:border-primary focus:outline-none"
                  >
                    <option value="Weekly">Weekly</option>
                    <option value="Biweekly">Biweekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-hairline pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeCreateGoal}
                className="min-h-[40px] border border-hairline bg-white px-5 py-2 text-sm font-semibold text-deep-accent transition-colors hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <Plus className="h-4 w-4" strokeWidth={2.25} />
                Create Goal
              </button>
            </div>
          </form>
        </ModalShell>
      )}

      {/* Edit Goal Modal */}
      {showEditGoal && selectedGoal && (
        <ModalShell onClose={closeEditGoal}>
          <h2 className="font-serif text-xl font-bold text-deep-accent sm:text-2xl">
            Edit Goal
          </h2>
          <p className="mt-1 text-sm text-body">Update your goal details.</p>

          <form
            onSubmit={handleSubmitEditGoal}
            className="mt-6 flex flex-col gap-5"
          >
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="editName"
                className="text-sm font-semibold text-deep-accent"
              >
                Goal Name
              </label>
              <input
                type="text"
                id="editName"
                name="name"
                value={editForm.name}
                onChange={handleEditFormChange}
                required
                className="min-h-[40px] w-full border border-hairline bg-white px-3 py-2 text-sm text-deep-accent focus:border-primary focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="editTargetAmount"
                  className="text-sm font-semibold text-deep-accent"
                >
                  Target Amount
                </label>
                <div className="flex items-center border border-hairline bg-white focus-within:border-primary">
                  <span className="pl-3 pr-1 text-base font-bold text-body">$</span>
                  <input
                    type="number"
                    id="editTargetAmount"
                    name="targetAmount"
                    value={editForm.targetAmount}
                    onChange={handleEditFormChange}
                    min="0.01"
                    step="0.01"
                    required
                    className="min-h-[40px] w-full border-none bg-transparent px-2 py-2 text-sm font-semibold text-deep-accent outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="editTargetDate"
                  className="text-sm font-semibold text-deep-accent"
                >
                  Target Date
                </label>
                <input
                  type="date"
                  id="editTargetDate"
                  name="targetDate"
                  value={editForm.targetDate}
                  onChange={handleEditFormChange}
                  required
                  className="min-h-[40px] w-full border border-hairline bg-white px-3 py-2 text-sm text-deep-accent focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="editContributionAmount"
                  className="text-sm font-semibold text-deep-accent"
                >
                  Contribution Amount
                </label>
                <div className="flex items-center border border-hairline bg-white focus-within:border-primary">
                  <span className="pl-3 pr-1 text-base font-bold text-body">$</span>
                  <input
                    type="number"
                    id="editContributionAmount"
                    name="contributionAmount"
                    value={editForm.contributionAmount}
                    onChange={handleEditFormChange}
                    min="0.01"
                    step="0.01"
                    className="min-h-[40px] w-full border-none bg-transparent px-2 py-2 text-sm font-semibold text-deep-accent outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="editContributionFrequency"
                  className="text-sm font-semibold text-deep-accent"
                >
                  Frequency
                </label>
                <select
                  id="editContributionFrequency"
                  name="contributionFrequency"
                  value={editForm.contributionFrequency}
                  onChange={handleEditFormChange}
                  className="min-h-[40px] w-full border border-hairline bg-white px-3 py-2 text-sm text-deep-accent focus:border-primary focus:outline-none"
                >
                  <option value="Weekly">Weekly</option>
                  <option value="Biweekly">Biweekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-hairline pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeEditGoal}
                className="min-h-[40px] border border-hairline bg-white px-5 py-2 text-sm font-semibold text-deep-accent transition-colors hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <CheckCircle2 className="h-4 w-4" strokeWidth={2.25} />
                Save Changes
              </button>
            </div>
          </form>
        </ModalShell>
      )}

      {/* Add Money Modal */}
      {showAddMoney && selectedGoal && (
        <ModalShell onClose={closeAddMoney}>
          <h2 className="font-serif text-xl font-bold text-deep-accent sm:text-2xl">
            Add Money
          </h2>
          <p className="mt-1 text-sm text-body">
            Add funds to {selectedGoal.name}
          </p>

          <div className="mt-6 flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="addAmount"
                className="text-sm font-semibold text-deep-accent"
              >
                Amount
              </label>
              <div className="flex items-center border border-hairline bg-white focus-within:border-primary">
                <span className="pl-3 pr-1 text-base font-bold text-body">$</span>
                <input
                  type="number"
                  id="addAmount"
                  name="amount"
                  value={addMoneyForm.amount}
                  onChange={handleAddMoneyChange}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  required
                  className="min-h-[42px] w-full border-none bg-transparent px-2 py-2 text-lg font-semibold text-deep-accent outline-none placeholder:text-muted/60"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="addFromAccount"
                className="text-sm font-semibold text-deep-accent"
              >
                From Account
              </label>
              <select
                id="addFromAccount"
                name="fromAccount"
                value={addMoneyForm.fromAccount}
                onChange={handleAddMoneyChange}
                className="min-h-[40px] w-full border border-hairline bg-white px-3 py-2 text-sm text-deep-accent focus:border-primary focus:outline-none"
              >
                <option value="chk1">Checking •••• 4821</option>
                <option value="sav1">Savings •••• 9134</option>
              </select>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-hairline pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeAddMoney}
                className="min-h-[40px] border border-hairline bg-white px-5 py-2 text-sm font-semibold text-deep-accent transition-colors hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitAddMoney}
                className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <Wallet className="h-4 w-4" strokeWidth={2.25} />
                Add Money
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {/* Auto-Save Modal */}
      {showAutoSave && selectedGoal && (
        <ModalShell onClose={closeAutoSave}>
          <h2 className="font-serif text-xl font-bold text-deep-accent sm:text-2xl">
            Automatic Savings
          </h2>
          <p className="mt-1 text-sm text-body">
            Schedule automatic contributions to {selectedGoal.name}
          </p>

          <div className="mt-6 flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="autoAmount"
                  className="text-sm font-semibold text-deep-accent"
                >
                  Amount
                </label>
                <div className="flex items-center border border-hairline bg-white focus-within:border-primary">
                  <span className="pl-3 pr-1 text-base font-bold text-body">$</span>
                  <input
                    type="number"
                    id="autoAmount"
                    name="amount"
                    value={autoSaveForm.amount}
                    onChange={handleAutoSaveChange}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    required
                    className="min-h-[40px] w-full border-none bg-transparent px-2 py-2 text-sm font-semibold text-deep-accent outline-none placeholder:text-muted/60"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="autoFrequency"
                  className="text-sm font-semibold text-deep-accent"
                >
                  Frequency
                </label>
                <select
                  id="autoFrequency"
                  name="frequency"
                  value={autoSaveForm.frequency}
                  onChange={handleAutoSaveChange}
                  className="min-h-[40px] w-full border border-hairline bg-white px-3 py-2 text-sm text-deep-accent focus:border-primary focus:outline-none"
                >
                  <option value="Weekly">Weekly</option>
                  <option value="Biweekly">Biweekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="autoFromAccount"
                className="text-sm font-semibold text-deep-accent"
              >
                From Account
              </label>
              <select
                id="autoFromAccount"
                name="fromAccount"
                value={autoSaveForm.fromAccount}
                onChange={handleAutoSaveChange}
                className="min-h-[40px] w-full border border-hairline bg-white px-3 py-2 text-sm text-deep-accent focus:border-primary focus:outline-none"
              >
                <option value="chk1">Checking •••• 4821</option>
                <option value="sav1">Savings •••• 9134</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="autoStartDate"
                className="text-sm font-semibold text-deep-accent"
              >
                Start Date
              </label>
              <input
                type="date"
                id="autoStartDate"
                name="startDate"
                value={autoSaveForm.startDate}
                onChange={handleAutoSaveChange}
                className="min-h-[40px] w-full border border-hairline bg-white px-3 py-2 text-sm text-deep-accent focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-hairline pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeAutoSave}
                className="min-h-[40px] border border-hairline bg-white px-5 py-2 text-sm font-semibold text-deep-accent transition-colors hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitAutoSave}
                className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <RefreshCw className="h-4 w-4" strokeWidth={2.25} />
                Review Contribution
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedGoal && (
        <ModalShell onClose={closeDeleteConfirm}>
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#fdf2f2] text-[#d9534f]">
              <AlertCircle className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <div>
              <h2 className="font-serif text-xl font-bold text-deep-accent sm:text-2xl">
                Delete Goal
              </h2>
              <p className="mt-1 text-sm text-body">
                Are you sure you want to delete &ldquo;{selectedGoal.name}&rdquo;?
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-start gap-3 border border-hairline bg-faint px-4 py-3">
            <Info
              className="mt-0.5 h-4 w-4 shrink-0 text-primary"
              strokeWidth={1.75}
            />
            <p className="text-xs text-body sm:text-sm">
              This will remove this goal from your dashboard. The money already saved
              remains in your linked account.
            </p>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-hairline pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeDeleteConfirm}
              className="min-h-[40px] border border-hairline bg-white px-5 py-2 text-sm font-semibold text-deep-accent transition-colors hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDeleteGoal}
              className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-[#d9534f] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#c9302c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d9534f]/50"
            >
              <Trash2 className="h-4 w-4" strokeWidth={2.25} />
              Delete Goal
            </button>
          </div>
        </ModalShell>
      )}
    </div>
  );
};

// Reusable modal shell with overlay + close button
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

// Reusable detail row
const DetailRow = ({ label, value }) => (
  <div className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
    <span className="text-xs text-muted sm:text-sm">{label}</span>
    <span className="text-sm font-semibold text-ink sm:text-right">{value}</span>
  </div>
);

export default Goals;