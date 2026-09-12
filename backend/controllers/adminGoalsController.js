// controllers/adminGoalsController.js
import mongoose from 'mongoose';
import User from '../models/User.js';
import Goal from '../models/Goal.js';
import GoalActivity from '../models/GoalActivity.js';
import UserGoal from '../models/UserGoal.js';
import Transaction from '../models/Transaction.js';
import Account from '../models/Account.js';

const toDateOnly = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '';
  return dt.toISOString().split('T')[0];
};

const formatGoal = (goal) => ({
  id: goal._id,
  name: goal.name,
  category: goal.category,
  currentAmount: goal.currentAmount ?? 0,
  targetAmount: goal.targetAmount,
  progress: Math.min(
    100,
    Math.round(
      ((goal.currentAmount || 0) / Math.max(goal.targetAmount, 0.01)) * 100
    )
  ),
  targetDate: toDateOnly(goal.targetDate),
  sourceAccountId: goal.sourceAccountId,
  linkedAccountId: goal.linkedAccountId,
  sourceAccount: goal.sourceAccountLabel || '',
  linkedAccount: goal.linkedAccountLabel || '',
  contributionAmount: goal.contributionAmount ?? 0,
  contributionFrequency: goal.contributionFrequency,
  contributionDay: goal.contributionDay ?? null,
  nextContributionDate: toDateOnly(goal.nextContributionDate),
  lastContributionDate: toDateOnly(goal.lastContributionDate),
  status: goal.status,
});

const formatActivity = (act) => ({
  id: act._id,
  goalId: act.goalId,
  date: act.date,
  description: act.description,
  amount: act.amount,
  balance: act.balance,
  kind: act.kind,
});

const deriveSummaryFromGoals = (goals = []) => {
  const active = goals.filter(
    (g) => g.status === 'On Track' || g.status === 'Off Track'
  );
  const totalSaved = goals.reduce((s, g) => s + (g.currentAmount || 0), 0);
  const onTrack = active.filter((g) => g.status === 'On Track').length;

  const upcoming =
    active
      .filter((g) => g.targetDate)
      .sort(
        (a, b) =>
          new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
      )[0] || null;

  return {
    totalSavedBalance: totalSaved,
    activeGoals: active.length,
    onTrack,
    upcomingTargetDate: upcoming ? toDateOnly(upcoming.targetDate) : '',
  };
};

// ── Recompute every activity's running balance in chronological order ──
const rebalanceActivityBalances = async (goalId) => {
  const activities = await GoalActivity.find({ goalId }).sort({
    date: 1,
    createdAt: 1,
  });
  let running = 0;
  for (const act of activities) {
    running += act.amount;
    if (act.balance !== running) {
      act.balance = running;
      await act.save();
    }
  }
};

// ── Find the pair of transaction rows for an activity ──
const findActivityTransactions = async (activity, goal) => {
  if (activity.transactionIds && activity.transactionIds.length > 0) {
    return Transaction.find({ _id: { $in: activity.transactionIds } });
  }
  // Fallback for activities created before transactionIds existed
  return Transaction.find({
    goalId: goal._id,
    date: activity.date,
    amount: { $in: [activity.amount, -activity.amount] },
  });
};

// ── Recompute goal status after a balance change ──
const syncGoalStatus = (goal) => {
  if (goal.currentAmount >= goal.targetAmount) {
    goal.status = 'Completed';
    goal.nextContributionDate = null;
  } else if (goal.status === 'Completed') {
    goal.status = 'On Track';
  }
};

// ================================================================
// GET /api/admin/goals
// ================================================================
export const adminListGoals = async (req, res) => {
  try {
    const [userGoals, goals] = await Promise.all([
      UserGoal.find().populate('userId', 'firstName lastName email').lean(),
      Goal.find().lean(),
    ]);

    const goalsByUser = new Map();
    for (const g of goals) {
      const key = String(g.userId);
      if (!goalsByUser.has(key)) goalsByUser.set(key, []);
      goalsByUser.get(key).push(g);
    }

    const allUserIds = new Set();
    for (const ug of userGoals) allUserIds.add(String(ug.userId?._id || ug.userId));
    for (const uid of goalsByUser.keys()) allUserIds.add(uid);

    const userMap = new Map();
    for (const ug of userGoals) {
      const u = ug.userId;
      if (u && u._id) userMap.set(String(u._id), u);
    }

    const missing = [];
    for (const uid of allUserIds) if (!userMap.has(uid)) missing.push(uid);
    if (missing.length > 0) {
      const users = await User.find({ _id: { $in: missing } })
        .select('firstName lastName email')
        .lean();
      for (const u of users) userMap.set(String(u._id), u);
    }

    const list = [];
    for (const uid of allUserIds) {
      const override = userGoals.find(
        (ug) => String(ug.userId?._id || ug.userId) === uid
      );
      const summary = override
        ? {
            totalSavedBalance: override.totalSavedBalance ?? 0,
            activeGoals: override.activeGoals ?? 0,
            onTrack: override.onTrack ?? 0,
            upcomingTargetDate: toDateOnly(override.upcomingTargetDate),
          }
        : deriveSummaryFromGoals(goalsByUser.get(uid) || []);

      const u = userMap.get(uid);
      list.push({
        id: uid,
        user: u
          ? `${u.firstName || ''} ${u.lastName || ''}`.trim() || '—'
          : '—',
        userEmail: u?.email || '',
        ...summary,
      });
    }

    res.json({ users: list });
  } catch (err) {
    console.error('❌ adminListGoals:', err);
    res.status(500).json({ error: 'Failed to load goals' });
  }
};

// ================================================================
// GET /api/admin/goals/:userId
// ================================================================
export const adminGetUserGoals = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    const [user, override, goals] = await Promise.all([
      User.findById(userId).select('firstName lastName email').lean(),
      UserGoal.findOne({ userId }).lean(),
      Goal.find({ userId }).sort({ createdAt: -1 }).lean(),
    ]);

    if (!user) return res.status(404).json({ error: 'User not found' });

    const goalIds = goals.map((g) => g._id);
    const activities = goalIds.length
      ? await GoalActivity.find({ goalId: { $in: goalIds } })
          .sort({ date: -1 })
          .lean()
      : [];

    const activitiesByGoal = new Map();
    for (const act of activities) {
      const key = String(act.goalId);
      if (!activitiesByGoal.has(key)) activitiesByGoal.set(key, []);
      activitiesByGoal.get(key).push(formatActivity(act));
    }

    const goalsWithActivities = goals.map((g) => ({
      ...formatGoal(g),
      activities: activitiesByGoal.get(String(g._id)) || [],
    }));

    const summary = override
      ? {
          totalSavedBalance: override.totalSavedBalance ?? 0,
          activeGoals: override.activeGoals ?? 0,
          onTrack: override.onTrack ?? 0,
          upcomingTargetDate: toDateOnly(override.upcomingTargetDate),
        }
      : deriveSummaryFromGoals(goals);

    res.json({
      user: {
        id: String(user._id),
        user: `${user.firstName || ''} ${user.lastName || ''}`.trim() || '—',
        userEmail: user.email || '',
        summary,
        goals: goalsWithActivities,
      },
    });
  } catch (err) {
    console.error('❌ adminGetUserGoals:', err);
    res.status(500).json({ error: 'Failed to load user goals' });
  }
};

// ================================================================
// PUT /api/admin/goals/:userId
// Body: { totalSavedBalance, activeGoals, onTrack, upcomingTargetDate }
// ================================================================
export const adminUpdateUserGoals = async (req, res) => {
  try {
    const { userId } = req.params;
    const { totalSavedBalance, activeGoals, onTrack, upcomingTargetDate } =
      req.body || {};

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    const update = {};
    if (totalSavedBalance !== undefined)
      update.totalSavedBalance = Math.max(0, parseFloat(totalSavedBalance) || 0);
    if (activeGoals !== undefined)
      update.activeGoals = Math.max(0, parseInt(activeGoals, 10) || 0);
    if (onTrack !== undefined)
      update.onTrack = Math.max(0, parseInt(onTrack, 10) || 0);
    if (upcomingTargetDate !== undefined)
      update.upcomingTargetDate = upcomingTargetDate
        ? new Date(upcomingTargetDate)
        : null;

    const record = await UserGoal.findOneAndUpdate(
      { userId },
      { $set: update, $setOnInsert: { userId } },
      { new: true, upsert: true, lean: true }
    );

    res.json({
      message: 'Goal summary updated',
      summary: {
        totalSavedBalance: record.totalSavedBalance ?? 0,
        activeGoals: record.activeGoals ?? 0,
        onTrack: record.onTrack ?? 0,
        upcomingTargetDate: toDateOnly(record.upcomingTargetDate),
      },
    });
  } catch (err) {
    console.error('❌ adminUpdateUserGoals:', err);
    res.status(500).json({ error: 'Failed to update goal summary' });
  }
};

// ================================================================
// PUT /api/admin/goals/:userId/goals/:goalId
// ================================================================
export const adminUpdateGoal = async (req, res) => {
  try {
    const { userId, goalId } = req.params;
    const body = req.body || {};

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(goalId)
    ) {
      return res.status(400).json({ error: 'Invalid id' });
    }

    const goal = await Goal.findOne({ _id: goalId, userId });
    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    if (body.name !== undefined) goal.name = String(body.name).trim();
    if (body.category !== undefined) goal.category = body.category;
    if (body.currentAmount !== undefined)
      goal.currentAmount = Math.max(0, parseFloat(body.currentAmount) || 0);
    if (body.targetAmount !== undefined) {
      const t = parseFloat(body.targetAmount);
      if (t > 0) goal.targetAmount = t;
    }
    if (body.targetDate !== undefined) goal.targetDate = new Date(body.targetDate);
    if (body.contributionAmount !== undefined)
      goal.contributionAmount = Math.max(
        0,
        parseFloat(body.contributionAmount) || 0
      );
    if (body.contributionFrequency !== undefined)
      goal.contributionFrequency = body.contributionFrequency;
    if (body.contributionDay !== undefined)
      goal.contributionDay = Number.isFinite(parseInt(body.contributionDay, 10))
        ? parseInt(body.contributionDay, 10)
        : null;
    if (body.nextContributionDate !== undefined)
      goal.nextContributionDate = body.nextContributionDate
        ? new Date(body.nextContributionDate)
        : null;
    if (body.status !== undefined)
      goal.status = body.status;
    if (body.sourceAccountLabel !== undefined)
      goal.sourceAccountLabel = body.sourceAccountLabel;
    if (body.linkedAccountLabel !== undefined)
      goal.linkedAccountLabel = body.linkedAccountLabel;

    await goal.save();

    res.json({ goal: formatGoal(goal.toObject()) });
  } catch (err) {
    console.error('❌ adminUpdateGoal:', err);
    res.status(500).json({ error: 'Failed to update goal' });
  }
};

// ================================================================
// POST /api/admin/goals/:userId/goals/:goalId/activities
// Body: { amount, date, description }
// Moves money from the source → linked account, creates a matching
// pair of Transaction rows, and records a GoalActivity.
// ================================================================
export const adminAddGoalActivity = async (req, res) => {
  try {
    const { userId, goalId } = req.params;
    const { amount, date, description } = req.body || {};

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(goalId)
    ) {
      return res.status(400).json({ error: 'Invalid id' });
    }

    const value = parseFloat(amount);
    if (!value || value <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }

    const goal = await Goal.findOne({ _id: goalId, userId });
    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    const [source, linked] = await Promise.all([
      Account.findById(goal.sourceAccountId),
      Account.findById(goal.linkedAccountId),
    ]);
    if (!source || !linked) {
      return res.status(404).json({ error: 'Linked accounts not found' });
    }
    if ((source.availableBalance ?? 0) < value) {
      return res
        .status(400)
        .json({ error: 'Insufficient funds in source account' });
    }

    const activityDate = date ? new Date(date) : new Date();

    source.availableBalance -= value;
    source.totalBalance -= value;
    linked.availableBalance += value;
    linked.totalBalance += value;
    await source.save();
    await linked.save();

    const createdTxs = await Transaction.create([
      {
        userId: goal.userId,
        accountId: source._id,
        goalId: goal._id,
        description: `Goal Contribution — ${goal.name}`,
        amount: -value,
        type: 'transfer',
        status: 'Completed',
        date: activityDate,
      },
      {
        userId: goal.userId,
        accountId: linked._id,
        goalId: goal._id,
        description: `Goal Contribution — ${goal.name}`,
        amount: value,
        type: 'transfer',
        status: 'Completed',
        date: activityDate,
      },
    ]);

    goal.currentAmount = (goal.currentAmount || 0) + value;
    syncGoalStatus(goal);
    await goal.save();

    const activity = await GoalActivity.create({
      userId: goal.userId,
      goalId: goal._id,
      transactionIds: createdTxs.map((t) => t._id),
      date: activityDate,
      description: description || 'Admin contribution',
      amount: value,
      balance: goal.currentAmount,
      kind: 'admin',
    });

    await rebalanceActivityBalances(goal._id);

    const fresh = await GoalActivity.findById(activity._id).lean();

    res.status(201).json({
      message: 'Activity added',
      activity: {
        id: fresh._id,
        date: fresh.date,
        description: fresh.description,
        amount: fresh.amount,
        balance: fresh.balance,
        kind: fresh.kind,
      },
    });
  } catch (err) {
    console.error('❌ adminAddGoalActivity:', err);
    res.status(500).json({ error: 'Failed to add activity' });
  }
};

// ================================================================
// PUT /api/admin/goals/:userId/goals/:goalId/activities/:activityId
// Body: { amount?, date?, description? }
// Adjusts the money movement by the delta and updates the pair of
// linked transaction rows. Rebalances every later activity.
// ================================================================
export const adminUpdateGoalActivity = async (req, res) => {
  try {
    const { userId, goalId, activityId } = req.params;
    const { amount, date, description } = req.body || {};

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(goalId) ||
      !mongoose.Types.ObjectId.isValid(activityId)
    ) {
      return res.status(400).json({ error: 'Invalid id' });
    }

    const goal = await Goal.findOne({ _id: goalId, userId });
    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    const activity = await GoalActivity.findOne({
      _id: activityId,
      goalId,
      userId,
    });
    if (!activity) return res.status(404).json({ error: 'Activity not found' });

    const oldAmount = activity.amount;
    const newAmount =
      amount !== undefined ? parseFloat(amount) : oldAmount;

    if (!newAmount || newAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }

    const delta = newAmount - oldAmount;

    // Move money for the delta
    if (Math.abs(delta) > 0.001) {
      const [source, linked] = await Promise.all([
        Account.findById(goal.sourceAccountId),
        Account.findById(goal.linkedAccountId),
      ]);
      if (!source || !linked) {
        return res.status(404).json({ error: 'Linked accounts not found' });
      }

      if (delta > 0 && (source.availableBalance ?? 0) < delta) {
        return res
          .status(400)
          .json({ error: 'Insufficient funds for increase' });
      }

      source.availableBalance -= delta;
      source.totalBalance -= delta;
      linked.availableBalance += delta;
      linked.totalBalance += delta;
      await source.save();
      await linked.save();
    }

    // Update the pair of transaction rows to reflect the new amount
    const txs = await findActivityTransactions(activity, goal);
    for (const tx of txs) {
      tx.amount = tx.amount > 0 ? newAmount : -newAmount;
      if (date !== undefined) tx.date = new Date(date);
      await tx.save();
    }

    // Update the activity
    activity.amount = newAmount;
    if (date !== undefined) activity.date = new Date(date);
    if (description !== undefined) activity.description = description;
    await activity.save();

    // Update goal balance and status
    goal.currentAmount = Math.max(0, (goal.currentAmount || 0) + delta);
    syncGoalStatus(goal);
    await goal.save();

    await rebalanceActivityBalances(goal._id);

    const fresh = await GoalActivity.findById(activity._id).lean();

    res.json({
      message: 'Activity updated',
      activity: {
        id: fresh._id,
        date: fresh.date,
        description: fresh.description,
        amount: fresh.amount,
        balance: fresh.balance,
        kind: fresh.kind,
      },
    });
  } catch (err) {
    console.error('❌ adminUpdateGoalActivity:', err);
    res.status(500).json({ error: 'Failed to update activity' });
  }
};

// ================================================================
// DELETE /api/admin/goals/:userId/goals/:goalId/activities/:activityId
// Reverses the money movement, removes the pair of transaction rows,
// removes the activity, and rebalances every later activity.
// ================================================================
export const adminDeleteGoalActivity = async (req, res) => {
  try {
    const { userId, goalId, activityId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(goalId) ||
      !mongoose.Types.ObjectId.isValid(activityId)
    ) {
      return res.status(400).json({ error: 'Invalid id' });
    }

    const goal = await Goal.findOne({ _id: goalId, userId });
    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    const activity = await GoalActivity.findOne({
      _id: activityId,
      goalId,
      userId,
    });
    if (!activity) return res.status(404).json({ error: 'Activity not found' });

    const value = activity.amount;

    // Reverse the money movement
    const [source, linked] = await Promise.all([
      Account.findById(goal.sourceAccountId),
      Account.findById(goal.linkedAccountId),
    ]);
    if (source && linked) {
      source.availableBalance += value;
      source.totalBalance += value;
      linked.availableBalance -= value;
      linked.totalBalance -= value;
      await source.save();
      await linked.save();
    }

    // Delete the pair of transaction rows
    const txs = await findActivityTransactions(activity, goal);
    if (txs.length > 0) {
      await Transaction.deleteMany({
        _id: { $in: txs.map((t) => t._id) },
      });
    }

    // Update goal balance and status
    goal.currentAmount = Math.max(0, (goal.currentAmount || 0) - value);
    syncGoalStatus(goal);
    await goal.save();

    // Delete the activity
    await GoalActivity.deleteOne({ _id: activity._id });

    await rebalanceActivityBalances(goal._id);

    res.json({ message: 'Activity deleted' });
  } catch (err) {
    console.error('❌ adminDeleteGoalActivity:', err);
    res.status(500).json({ error: 'Failed to delete activity' });
  }
};