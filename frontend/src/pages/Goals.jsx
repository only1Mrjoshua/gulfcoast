// src/pages/Goals.jsx
import React, { useState } from 'react';
import {
  mockGoals,
  mockGoalActivities,
  mockCompletedGoals,
  mockGoalInsights,
} from '../data/mockGoalsData';
import styles from './Goals.module.css';

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

  const selectedGoal = mockGoals.find(g => g.id === selectedGoalId);
  const goalActivities = selectedGoal ? mockGoalActivities[selectedGoal.id] || [] : [];

  // Calculate totals
  const totalSaved = mockGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const activeGoals = mockGoals.length;
  const goalsOnTrack = mockGoals.filter(g => g.status === 'On Track').length;

  // Handlers
  const handleCreateGoal = () => {
    setShowCreateGoal(true);
  };

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

  const closeEditGoal = () => {
    setShowEditGoal(false);
  };

  const handleSubmitEditGoal = () => {
    alert(`Goal "${editForm.name}" updated successfully!`);
    closeEditGoal();
  };

  const handleAddMoney = () => {
    setShowAddMoney(true);
  };

  const closeAddMoney = () => {
    setShowAddMoney(false);
    setAddMoneyForm({ amount: '', fromAccount: 'chk1' });
  };

  const handleSubmitAddMoney = () => {
    alert(`Added ${formatCurrency(parseFloat(addMoneyForm.amount) || 0)} to ${selectedGoal?.name}`);
    closeAddMoney();
  };

  const handleAutoSave = () => {
    setShowAutoSave(true);
  };

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
    alert(`Auto-save of ${formatCurrency(parseFloat(autoSaveForm.amount) || 0)} set up for ${selectedGoal?.name}`);
    closeAutoSave();
  };

  const handleDeleteGoal = () => {
    setShowDeleteConfirm(true);
  };

  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false);
  };

  const confirmDeleteGoal = () => {
    alert(`Goal "${selectedGoal?.name}" has been deleted.`);
    setShowDeleteConfirm(false);
    setSelectedGoalId(null);
  };

  const handleCreateFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCreateForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddMoneyChange = (e) => {
    const { name, value } = e.target;
    setAddMoneyForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAutoSaveChange = (e) => {
    const { name, value } = e.target;
    setAutoSaveForm(prev => ({ ...prev, [name]: value }));
  };

  // Calculate suggested contribution
  const calculateSuggestedContribution = () => {
    if (!createForm.targetAmount || !createForm.targetDate || !createForm.startingAmount) return null;
    const target = parseFloat(createForm.targetAmount);
    const current = parseFloat(createForm.startingAmount) || 0;
    const remaining = target - current;
    if (remaining <= 0) return null;
    const today = new Date();
    const targetDate = new Date(createForm.targetDate + 'T00:00:00');
    const monthsDiff = (targetDate.getFullYear() - today.getFullYear()) * 12 + targetDate.getMonth() - today.getMonth();
    const months = Math.max(monthsDiff, 1);
    return remaining / months;
  };

  const suggestedContribution = calculateSuggestedContribution();

  return (
    <div className={styles.goalsPage}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Financial Goals</h1>
          <p className={styles.pageSubtitle}>
            Set savings goals, track your progress, and build toward the things that matter to you.
          </p>
        </div>
        <button className={styles.primaryAction} onClick={handleCreateGoal}>
          + Create a Goal
        </button>
      </div>

      {/* Goals Overview */}
      <div className={styles.overviewSection}>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Total Saved</span>
          <span className={styles.overviewValue}>{formatCurrency(totalSaved)}</span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Active Goals</span>
          <span className={styles.overviewValue}>{activeGoals}</span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>On Track</span>
          <span className={styles.overviewValue}>{goalsOnTrack}</span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Upcoming Target</span>
          <span className={styles.overviewValue}>
            {mockGoals.length > 0 ? formatDate(mockGoals[0].targetDate) : 'N/A'}
          </span>
        </div>
      </div>

      {/* My Goals */}
      <section className={styles.goalsSection}>
        <h2 className={styles.sectionTitle}>My Financial Goals</h2>
        <div className={styles.goalsGrid}>
          {mockGoals.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Start your first financial goal</p>
              <p className={styles.emptySub}>Set a target, choose a date, and track your progress as you save.</p>
              <button className={styles.emptyAction} onClick={handleCreateGoal}>
                + Create a Goal
              </button>
            </div>
          ) : (
            mockGoals.map(goal => (
              <div
                key={goal.id}
                className={`${styles.goalCard} ${selectedGoalId === goal.id ? styles.selected : ''}`}
                onClick={() => setSelectedGoalId(goal.id)}
              >
                <div className={styles.goalHeader}>
                  <span className={styles.goalCategory}>{goal.category}</span>
                  <span className={`${styles.goalStatus} ${goal.status === 'On Track' ? styles.onTrack : styles.behind}`}>
                    {goal.status}
                  </span>
                </div>
                <div className={styles.goalName}>{goal.name}</div>
                <div className={styles.goalProgress}>
                  <div className={styles.progressInfo}>
                    <span className={styles.progressAmount}>{formatCurrency(goal.currentAmount)}</span>
                    <span className={styles.progressTarget}>of {formatCurrency(goal.targetAmount)}</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <div className={styles.progressStats}>
                    <span className={styles.progressPercent}>{goal.progress}% complete</span>
                    <span className={styles.progressRemaining}>
                      {formatCurrency(goal.targetAmount - goal.currentAmount)} remaining
                    </span>
                  </div>
                </div>
                <div className={styles.goalMeta}>
                  <span className={styles.goalTarget}>Target: {formatDate(goal.targetDate)}</span>
                  <span className={styles.goalAccount}>Linked: {goal.linkedAccount}</span>
                </div>
                <button className={styles.viewGoalBtn}>View Goal</button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Selected Goal Details */}
      {selectedGoal && (
        <section className={styles.detailSection}>
          <h2 className={styles.sectionTitle}>Goal Details</h2>
          <div className={styles.detailPanel}>
            <div className={styles.detailHeader}>
              <div className={styles.detailGoalInfo}>
                <span className={styles.detailGoalName}>{selectedGoal.name}</span>
                <span className={styles.detailGoalCategory}>{selectedGoal.category}</span>
              </div>
              <div className={styles.detailActions}>
                <button className={styles.detailActionBtn} onClick={handleAddMoney}>
                  Add Money
                </button>
                <button className={styles.detailActionBtn} onClick={handleAutoSave}>
                  Auto-Save
                </button>
                <button className={styles.detailActionBtn} onClick={handleEditGoal}>
                  Edit
                </button>
                <button className={styles.detailActionBtnDanger} onClick={handleDeleteGoal}>
                  Delete
                </button>
              </div>
            </div>

            <div className={styles.detailContent}>
              <div className={styles.detailInfo}>
                <div className={styles.detailProgress}>
                  <div className={styles.detailProgressHeader}>
                    <span className={styles.detailProgressLabel}>Progress</span>
                    <span className={styles.detailProgressPercent}>{selectedGoal.progress}%</span>
                  </div>
                  <div className={styles.progressBarLarge}>
                    <div
                      className={styles.progressFillLarge}
                      style={{ width: `${selectedGoal.progress}%` }}
                    />
                  </div>
                  <div className={styles.detailProgressStats}>
                    <span className={styles.detailCurrent}>{formatCurrency(selectedGoal.currentAmount)}</span>
                    <span className={styles.detailTarget}>Target: {formatCurrency(selectedGoal.targetAmount)}</span>
                  </div>
                </div>

                <div className={styles.detailInfoGrid}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Current Balance</span>
                    <span className={styles.detailValue}>{formatCurrency(selectedGoal.currentAmount)}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Target Amount</span>
                    <span className={styles.detailValue}>{formatCurrency(selectedGoal.targetAmount)}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Remaining</span>
                    <span className={styles.detailValue}>{formatCurrency(selectedGoal.targetAmount - selectedGoal.currentAmount)}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Target Date</span>
                    <span className={styles.detailValue}>{formatDateLong(selectedGoal.targetDate)}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Linked Account</span>
                    <span className={styles.detailValue}>{selectedGoal.linkedAccount}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Contribution</span>
                    <span className={styles.detailValue}>
                      {formatCurrency(selectedGoal.contributionAmount)} / {selectedGoal.contributionFrequency}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Next Contribution</span>
                    <span className={styles.detailValue}>{formatDate(selectedGoal.nextContributionDate)}</span>
                  </div>
                </div>
              </div>

              {/* Goal Activity */}
              <div className={styles.activitySection}>
                <h3 className={styles.activityTitle}>Recent Activity</h3>
                <div className={styles.activityList}>
                  {goalActivities.length === 0 ? (
                    <p className={styles.noActivity}>No activity yet.</p>
                  ) : (
                    goalActivities.slice(0, 5).map(activity => (
                      <div key={activity.id} className={styles.activityItem}>
                        <div className={styles.activityLeft}>
                          <span className={styles.activityDate}>{formatDate(activity.date)}</span>
                          <span className={styles.activityDesc}>{activity.description}</span>
                        </div>
                        <div className={styles.activityRight}>
                          <span className={styles.activityAmount}>+{formatCurrency(activity.amount)}</span>
                          <span className={styles.activityBalance}>{formatCurrency(activity.balance)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {goalActivities.length > 5 && (
                  <button className={styles.viewAllBtn}>View All Activity</button>
                )}
              </div>
            </div>


          </div>
        </section>
      )}

      {/* Completed Goals */}
      <section className={styles.completedSection}>
        <h2 className={styles.sectionTitle}>Completed Goals</h2>
        <div className={styles.completedList}>
          {mockCompletedGoals.length === 0 ? (
            <p className={styles.noCompleted}>No completed goals yet.</p>
          ) : (
            mockCompletedGoals.map(goal => (
              <div key={goal.id} className={styles.completedItem}>
                <div className={styles.completedInfo}>
                  <span className={styles.completedName}>{goal.name}</span>
                  <span className={styles.completedCategory}>{goal.category}</span>
                </div>
                <div className={styles.completedRight}>
                  <span className={styles.completedAmount}>{formatCurrency(goal.targetAmount)}</span>
                  <span className={styles.completedDate}>Completed {formatDate(goal.completionDate)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>


      {/* Create Goal Modal */}
      {showCreateGoal && (
        <div className={styles.modalOverlay} onClick={closeCreateGoal}>
          <div className={styles.modalPanel} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={closeCreateGoal}>×</button>
            <div className={styles.modalContent}>
              <h2 className={styles.modalTitle}>Create a Goal</h2>
              <p className={styles.modalSubtitle}>Set your savings target and start tracking your progress.</p>

              <form onSubmit={handleSubmitCreateGoal} className={styles.goalForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="goalName">Goal Name</label>
                  <input
                    type="text"
                    id="goalName"
                    name="name"
                    value={createForm.name}
                    onChange={handleCreateFormChange}
                    placeholder="e.g. Emergency Fund"
                    required
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="goalCategory">Goal Category</label>
                  <select
                    id="goalCategory"
                    name="category"
                    value={createForm.category}
                    onChange={handleCreateFormChange}
                    className={styles.formSelect}
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

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="targetAmount">Target Amount</label>
                    <div className={styles.amountInput}>
                      <span className={styles.currencySymbol}>$</span>
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
                        className={styles.amountField}
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="targetDate">Target Date</label>
                    <input
                      type="date"
                      id="targetDate"
                      name="targetDate"
                      value={createForm.targetDate}
                      onChange={handleCreateFormChange}
                      required
                      className={styles.formInput}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="startingAmount">Starting Amount</label>
                  <div className={styles.amountInput}>
                    <span className={styles.currencySymbol}>$</span>
                    <input
                      type="number"
                      id="startingAmount"
                      name="startingAmount"
                      value={createForm.startingAmount}
                      onChange={handleCreateFormChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className={styles.amountField}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="linkedAccount">Savings Account</label>
                  <select
                    id="linkedAccount"
                    name="linkedAccount"
                    value={createForm.linkedAccount}
                    onChange={handleCreateFormChange}
                    className={styles.formSelect}
                  >
                    <option value="chk1">Checking •••• 4821</option>
                    <option value="sav1">Savings •••• 9134</option>
                  </select>
                </div>

                {suggestedContribution && suggestedContribution > 0 && (
                  <div className={styles.suggestedContribution}>
                    <span className={styles.suggestedLabel}>Suggested Monthly Contribution</span>
                    <span className={styles.suggestedValue}>{formatCurrency(suggestedContribution)}</span>
                  </div>
                )}

                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="autoContribution"
                      checked={createForm.autoContribution}
                      onChange={handleCreateFormChange}
                    />
                    Set up automatic contributions
                  </label>
                </div>

                {createForm.autoContribution && (
                  <div className={styles.autoContributionFields}>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label htmlFor="contributionAmount">Contribution Amount</label>
                        <div className={styles.amountInput}>
                          <span className={styles.currencySymbol}>$</span>
                          <input
                            type="number"
                            id="contributionAmount"
                            name="contributionAmount"
                            value={createForm.contributionAmount}
                            onChange={handleCreateFormChange}
                            placeholder="0.00"
                            min="0.01"
                            step="0.01"
                            className={styles.amountField}
                          />
                        </div>
                      </div>
                      <div className={styles.formGroup}>
                        <label htmlFor="contributionFrequency">Frequency</label>
                        <select
                          id="contributionFrequency"
                          name="contributionFrequency"
                          value={createForm.contributionFrequency}
                          onChange={handleCreateFormChange}
                          className={styles.formSelect}
                        >
                          <option value="Weekly">Weekly</option>
                          <option value="Biweekly">Biweekly</option>
                          <option value="Monthly">Monthly</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelBtn} onClick={closeCreateGoal}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.submitBtn}>
                    Create Goal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Goal Modal */}
      {showEditGoal && selectedGoal && (
        <div className={styles.modalOverlay} onClick={closeEditGoal}>
          <div className={styles.modalPanel} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={closeEditGoal}>×</button>
            <div className={styles.modalContent}>
              <h2 className={styles.modalTitle}>Edit Goal</h2>
              <p className={styles.modalSubtitle}>Update your goal details.</p>

              <form onSubmit={handleSubmitEditGoal} className={styles.goalForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="editName">Goal Name</label>
                  <input
                    type="text"
                    id="editName"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditFormChange}
                    required
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="editTargetAmount">Target Amount</label>
                    <div className={styles.amountInput}>
                      <span className={styles.currencySymbol}>$</span>
                      <input
                        type="number"
                        id="editTargetAmount"
                        name="targetAmount"
                        value={editForm.targetAmount}
                        onChange={handleEditFormChange}
                        min="0.01"
                        step="0.01"
                        required
                        className={styles.amountField}
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="editTargetDate">Target Date</label>
                    <input
                      type="date"
                      id="editTargetDate"
                      name="targetDate"
                      value={editForm.targetDate}
                      onChange={handleEditFormChange}
                      required
                      className={styles.formInput}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="editContributionAmount">Contribution Amount</label>
                    <div className={styles.amountInput}>
                      <span className={styles.currencySymbol}>$</span>
                      <input
                        type="number"
                        id="editContributionAmount"
                        name="contributionAmount"
                        value={editForm.contributionAmount}
                        onChange={handleEditFormChange}
                        min="0.01"
                        step="0.01"
                        className={styles.amountField}
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="editContributionFrequency">Frequency</label>
                    <select
                      id="editContributionFrequency"
                      name="contributionFrequency"
                      value={editForm.contributionFrequency}
                      onChange={handleEditFormChange}
                      className={styles.formSelect}
                    >
                      <option value="Weekly">Weekly</option>
                      <option value="Biweekly">Biweekly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>
                </div>

                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelBtn} onClick={closeEditGoal}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.submitBtn}>
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Money Modal */}
      {showAddMoney && selectedGoal && (
        <div className={styles.modalOverlay} onClick={closeAddMoney}>
          <div className={styles.modalPanel} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={closeAddMoney}>×</button>
            <div className={styles.modalContent}>
              <h2 className={styles.modalTitle}>Add Money</h2>
              <p className={styles.modalSubtitle}>Add funds to {selectedGoal.name}</p>

              <div className={styles.goalForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="addAmount">Amount</label>
                  <div className={styles.amountInput}>
                    <span className={styles.currencySymbol}>$</span>
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
                      className={styles.amountField}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="addFromAccount">From Account</label>
                  <select
                    id="addFromAccount"
                    name="fromAccount"
                    value={addMoneyForm.fromAccount}
                    onChange={handleAddMoneyChange}
                    className={styles.formSelect}
                  >
                    <option value="chk1">Checking •••• 4821</option>
                    <option value="sav1">Savings •••• 9134</option>
                  </select>
                </div>

                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelBtn} onClick={closeAddMoney}>
                    Cancel
                  </button>
                  <button type="button" className={styles.submitBtn} onClick={handleSubmitAddMoney}>
                    Add Money
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auto-Save Modal */}
      {showAutoSave && selectedGoal && (
        <div className={styles.modalOverlay} onClick={closeAutoSave}>
          <div className={styles.modalPanel} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={closeAutoSave}>×</button>
            <div className={styles.modalContent}>
              <h2 className={styles.modalTitle}>Automatic Savings</h2>
              <p className={styles.modalSubtitle}>Schedule automatic contributions to {selectedGoal.name}</p>

              <div className={styles.goalForm}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="autoAmount">Amount</label>
                    <div className={styles.amountInput}>
                      <span className={styles.currencySymbol}>$</span>
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
                        className={styles.amountField}
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="autoFrequency">Frequency</label>
                    <select
                      id="autoFrequency"
                      name="frequency"
                      value={autoSaveForm.frequency}
                      onChange={handleAutoSaveChange}
                      className={styles.formSelect}
                    >
                      <option value="Weekly">Weekly</option>
                      <option value="Biweekly">Biweekly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="autoFromAccount">From Account</label>
                  <select
                    id="autoFromAccount"
                    name="fromAccount"
                    value={autoSaveForm.fromAccount}
                    onChange={handleAutoSaveChange}
                    className={styles.formSelect}
                  >
                    <option value="chk1">Checking •••• 4821</option>
                    <option value="sav1">Savings •••• 9134</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="autoStartDate">Start Date</label>
                  <input
                    type="date"
                    id="autoStartDate"
                    name="startDate"
                    value={autoSaveForm.startDate}
                    onChange={handleAutoSaveChange}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelBtn} onClick={closeAutoSave}>
                    Cancel
                  </button>
                  <button type="button" className={styles.submitBtn} onClick={handleSubmitAutoSave}>
                    Review Contribution
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedGoal && (
        <div className={styles.modalOverlay} onClick={closeDeleteConfirm}>
          <div className={styles.modalPanel} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={closeDeleteConfirm}>×</button>
            <div className={styles.modalContent}>
              <h2 className={styles.modalTitle}>Delete Goal</h2>
              <p className={styles.modalSubtitle}>
                Are you sure you want to delete "{selectedGoal.name}"?
              </p>
              <div className={styles.deleteInfo}>
                <p className={styles.deleteText}>
                  This will remove this goal from your dashboard. The money already saved remains in your linked account.
                </p>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={closeDeleteConfirm}>
                  Cancel
                </button>
                <button type="button" className={styles.deleteConfirmBtn} onClick={confirmDeleteGoal}>
                  Delete Goal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;