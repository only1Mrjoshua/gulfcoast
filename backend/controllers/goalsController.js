// controllers/goalsController.js
import mongoose from 'mongoose';
import User from '../models/User.js';
import Goal from '../models/Goal.js';
import GoalActivity from '../models/GoalActivity.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import { computeFirstDate } from '../jobs/goalContributions.js';

const toDateOnly = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '';
  return dt.toISOString().split('T')[0];
};

const accountLabel = (acc) =>
  acc
    ? `${acc.subType ? acc.subType + ' ' : ''}${acc.type} •••• ${
        acc.accountNumber ? acc.accountNumber.slice(-4) : ''
      }`
    : '';

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
  date: act.date,
  description: act.description,
  amount: act.amount,
  balance: act.balance,
  kind: act.kind,
});

const formatAccount = (acc) => ({
  id: acc._id,
  type: acc.type,
  subType: acc.subType || '',
  lastFour: acc.accountNumber ? acc.accountNumber.slice(-4) : '',
  label: accountLabel(acc),
  available: acc.availableBalance ?? 0,
  total: acc.totalBalance ?? 0,
});

export const getGoalsOverview = async (req, res) => {
  try {
    const userId = req.user._id;

    const [goals, accounts, activities] = await Promise.all([
      Goal.find({ userId }).sort({ createdAt: -1 }).lean(),
      Account.find({
        userId,
        status: { $ne: 'Closed' },
        type: { $in: ['Checking', 'Savings'] },
      })
        .sort({ isPrimary: -1, createdAt: 1 })
        .lean(),
      GoalActivity.find({ userId }).sort({ date: -1 }).limit(200).lean(),
    ]);

    const activitiesByGoal = {};
    for (const act of activities) {
      const key = String(act.goalId);
      if (!activitiesByGoal[key]) activitiesByGoal[key] = [];
      activitiesByGoal[key].push(formatActivity(act));
    }

    const formatted = goals.map((g) => ({
      ...formatGoal(g),
      activities: activitiesByGoal[String(g._id)] || [],
    }));

    const activeGoals = formatted.filter(
      (g) => g.status === 'On Track' || g.status === 'Off Track'
    );
    const totalSaved = formatted.reduce((s, g) => s + g.currentAmount, 0);
    const onTrack = activeGoals.filter((g) => g.status === 'On Track').length;

    const upcoming =
      activeGoals.length > 0
        ? activeGoals.reduce((soonest, g) =>
            new Date(g.targetDate) < new Date(soonest.targetDate) ? g : soonest
          )
        : null;

    const checking = accounts.filter((a) => a.type === 'Checking');
    const savings = accounts.filter((a) => a.type === 'Savings');

    res.json({
      summary: {
        totalSaved,
        activeGoals: activeGoals.length,
        onTrack,
        upcomingTargetDate: upcoming ? upcoming.targetDate : '',
      },
      goals: formatted,
      accounts: {
        all: accounts.map(formatAccount),
        checking: checking.map(formatAccount),
        savings: savings.map(formatAccount),
      },
    });
  } catch (err) {
    console.error('❌ getGoalsOverview:', err);
    res.status(500).json({ error: 'Failed to load goals overview' });
  }
};

export const createGoal = async (req, res) => {
  try {
    const userId = req.user._id;
    const body = req.body || {};

    const name = String(body.name || '').trim();
    if (!name) return res.status(400).json({ error: 'Goal name is required' });

    const targetAmount = parseFloat(body.targetAmount);
    if (!targetAmount || targetAmount <= 0) {
      return res.status(400).json({ error: 'Target amount must be positive' });
    }

    if (!body.targetDate) {
      return res.status(400).json({ error: 'Target date is required' });
    }

    const [source, linked] = await Promise.all([
      Account.findOne({ _id: body.sourceAccountId, userId }),
      Account.findOne({ _id: body.linkedAccountId, userId }),
    ]);

    if (!source) return res.status(404).json({ error: 'Source account not found' });
    if (!linked) return res.status(404).json({ error: 'Linked account not found' });
    if (source._id.equals(linked._id)) {
      return res
        .status(400)
        .json({ error: 'Source and linked accounts must be different' });
    }
    if (linked.type !== 'Savings') {
      return res
        .status(400)
        .json({ error: 'Goal savings must go into a Savings account' });
    }
    if (source.type !== 'Checking') {
      return res
        .status(400)
        .json({ error: 'Goal contributions must come from a Checking account' });
    }

    const startingAmount = parseFloat(body.startingAmount) || 0;
    if (startingAmount < 0) {
      return res.status(400).json({ error: 'Starting amount cannot be negative' });
    }

    const autoContribution = !!body.autoContribution;
    const contributionAmount = autoContribution
      ? Math.max(0, parseFloat(body.contributionAmount) || 0)
      : 0;
    const frequency = body.contributionFrequency || 'Monthly';
    const contributionDay =
      frequency === 'Daily'
        ? null
        : Number.isFinite(parseInt(body.contributionDay, 10))
        ? parseInt(body.contributionDay, 10)
        : null;

    let nextContributionDate = null;
    if (autoContribution && contributionAmount > 0) {
      const startFrom = body.contributionStartDate
        ? new Date(body.contributionStartDate)
        : new Date();
      nextContributionDate = computeFirstDate(
        startFrom,
        frequency,
        contributionDay
      );
    }

    let startTxIds = [];

    if (startingAmount > 0) {
      if ((source.availableBalance ?? 0) < startingAmount) {
        return res
          .status(400)
          .json({ error: 'Insufficient funds in source account for starting amount' });
      }
      source.availableBalance -= startingAmount;
      source.totalBalance -= startingAmount;
      linked.availableBalance += startingAmount;
      linked.totalBalance += startingAmount;
      await source.save();
      await linked.save();

      const created = await Transaction.create([
        {
          userId,
          accountId: source._id,
          description: `Goal Starting — ${name}`,
          amount: -startingAmount,
          type: 'transfer',
          status: 'Completed',
          date: new Date(),
        },
        {
          userId,
          accountId: linked._id,
          description: `Goal Starting — ${name}`,
          amount: startingAmount,
          type: 'transfer',
          status: 'Completed',
          date: new Date(),
        },
      ]);
      startTxIds = created.map((t) => t._id);
    }

    const goal = await Goal.create({
      userId,
      name,
      category: body.category || 'General Savings',
      currentAmount: startingAmount,
      targetAmount,
      targetDate: new Date(body.targetDate),
      sourceAccountId: source._id,
      linkedAccountId: linked._id,
      sourceAccountLabel: accountLabel(source),
      linkedAccountLabel: accountLabel(linked),
      contributionAmount,
      contributionFrequency: frequency,
      contributionDay,
      nextContributionDate,
      status: 'On Track',
    });

    if (startingAmount > 0) {
      await GoalActivity.create({
        userId,
        goalId: goal._id,
        transactionIds: startTxIds,
        date: new Date(),
        description: 'Starting balance',
        amount: startingAmount,
        balance: startingAmount,
        kind: 'starting',
      });
    }

    const fresh = await Goal.findById(goal._id).lean();
    res.status(201).json({ goal: formatGoal(fresh) });
  } catch (err) {
    console.error('❌ createGoal:', err);
    res.status(500).json({ error: 'Failed to create goal' });
  }
};

export const updateGoal = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const body = req.body || {};

    const goal = await Goal.findOne({ _id: id, userId });
    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    if (body.name !== undefined) goal.name = String(body.name).trim();
    if (body.category !== undefined) goal.category = body.category;

    if (body.targetAmount !== undefined) {
      const t = parseFloat(body.targetAmount);
      if (t > 0) goal.targetAmount = t;
    }
    if (body.targetDate !== undefined) {
      goal.targetDate = new Date(body.targetDate);
    }
    if (body.sourceAccountId !== undefined) {
      const src = await Account.findOne({ _id: body.sourceAccountId, userId });
      if (src) {
        goal.sourceAccountId = src._id;
        goal.sourceAccountLabel = accountLabel(src);
      }
    }
    if (body.linkedAccountId !== undefined) {
      const lnk = await Account.findOne({ _id: body.linkedAccountId, userId });
      if (lnk && lnk.type === 'Savings') {
        goal.linkedAccountId = lnk._id;
        goal.linkedAccountLabel = accountLabel(lnk);
      }
    }

    if (body.contributionAmount !== undefined) {
      goal.contributionAmount = Math.max(0, parseFloat(body.contributionAmount) || 0);
    }
    if (body.contributionFrequency !== undefined) {
      goal.contributionFrequency = body.contributionFrequency;
    }
    if (body.contributionDay !== undefined) {
      goal.contributionDay = Number.isFinite(parseInt(body.contributionDay, 10))
        ? parseInt(body.contributionDay, 10)
        : null;
    }

    if (
      body.contributionFrequency !== undefined ||
      body.contributionDay !== undefined ||
      body.contributionAmount !== undefined
    ) {
      if (goal.contributionAmount > 0) {
        const startFrom = body.contributionStartDate
          ? new Date(body.contributionStartDate)
          : new Date();
        goal.nextContributionDate = computeFirstDate(
          startFrom,
          goal.contributionFrequency,
          goal.contributionDay
        );
      } else {
        goal.nextContributionDate = null;
      }
    }

    if (body.status !== undefined && ['On Track', 'Paused', 'Off Track', 'Completed'].includes(body.status)) {
      goal.status = body.status;
    }

    await goal.save();

    const fresh = await Goal.findById(goal._id).lean();
    res.json({ goal: formatGoal(fresh) });
  } catch (err) {
    console.error('❌ updateGoal:', err);
    res.status(500).json({ error: 'Failed to update goal' });
  }
};

export const deleteGoal = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const goal = await Goal.findOneAndDelete({ _id: id, userId });
    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    await GoalActivity.deleteMany({ goalId: goal._id, userId });

    res.json({ message: 'Goal deleted' });
  } catch (err) {
    console.error('❌ deleteGoal:', err);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
};

export const addMoneyToGoal = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { amount, fromAccountId } = req.body || {};

    const value = parseFloat(amount);
    if (!value || value <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }

    const goal = await Goal.findOne({ _id: id, userId });
    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    const sourceId = fromAccountId || goal.sourceAccountId;
    const [source, linked] = await Promise.all([
      Account.findOne({ _id: sourceId, userId }),
      Account.findById(goal.linkedAccountId),
    ]);

    if (!source || !linked) {
      return res.status(404).json({ error: 'Account not found' });
    }
    if ((source.availableBalance ?? 0) < value) {
      return res.status(400).json({ error: 'Insufficient funds' });
    }

    source.availableBalance -= value;
    source.totalBalance -= value;
    linked.availableBalance += value;
    linked.totalBalance += value;
    await source.save();
    await linked.save();

    const createdTxs = await Transaction.create([
      {
        userId,
        accountId: source._id,
        goalId: goal._id,
        description: `Goal Contribution — ${goal.name}`,
        amount: -value,
        type: 'transfer',
        status: 'Completed',
        date: new Date(),
      },
      {
        userId,
        accountId: linked._id,
        goalId: goal._id,
        description: `Goal Contribution — ${goal.name}`,
        amount: value,
        type: 'transfer',
        status: 'Completed',
        date: new Date(),
      },
    ]);

    goal.currentAmount = (goal.currentAmount || 0) + value;
    if (goal.currentAmount >= goal.targetAmount) {
      goal.status = 'Completed';
      goal.nextContributionDate = null;
    }
    await goal.save();

    await GoalActivity.create({
      userId,
      goalId: goal._id,
      transactionIds: createdTxs.map((t) => t._id),
      date: new Date(),
      description: 'Manual contribution',
      amount: value,
      balance: goal.currentAmount,
      kind: 'manual',
    });

    const fresh = await Goal.findById(goal._id).lean();
    res.json({ goal: formatGoal(fresh) });
  } catch (err) {
    console.error('❌ addMoneyToGoal:', err);
    res.status(500).json({ error: 'Failed to add money' });
  }
};

export const updateAutoSave = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { amount, frequency, day, startDate } = req.body || {};

    const goal = await Goal.findOne({ _id: id, userId });
    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    const value = Math.max(0, parseFloat(amount) || 0);
    const freq = frequency || goal.contributionFrequency;
    const dayValue = freq === 'Daily'
      ? null
      : Number.isFinite(parseInt(day, 10))
      ? parseInt(day, 10)
      : null;

    goal.contributionAmount = value;
    goal.contributionFrequency = freq;
    goal.contributionDay = dayValue;

    if (value > 0) {
      const startFrom = startDate ? new Date(startDate) : new Date();
      goal.nextContributionDate = computeFirstDate(startFrom, freq, dayValue);
    } else {
      goal.nextContributionDate = null;
    }

    await goal.save();

    const fresh = await Goal.findById(goal._id).lean();
    res.json({ goal: formatGoal(fresh) });
  } catch (err) {
    console.error('❌ updateAutoSave:', err);
    res.status(500).json({ error: 'Failed to update auto-save' });
  }
};

export const getGoalActivities = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const goal = await Goal.findOne({ _id: id, userId }).lean();
    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    const activities = await GoalActivity.find({ goalId: goal._id, userId })
      .sort({ date: -1 })
      .lean();

    res.json({ activities: activities.map(formatActivity) });
  } catch (err) {
    console.error('❌ getGoalActivities:', err);
    res.status(500).json({ error: 'Failed to load activities' });
  }
};