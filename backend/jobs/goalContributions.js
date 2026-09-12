// jobs/goalContributions.js
import Goal from '../models/Goal.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import GoalActivity from '../models/GoalActivity.js';

const RUN_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

const daysInMonth = (year, month) =>
  new Date(year, month + 1, 0).getDate();

const computeNextDate = (from, frequency, contributionDay) => {
  const d = new Date(from);
  if (frequency === 'Daily') {
    d.setDate(d.getDate() + 1);
    return d;
  }
  if (frequency === 'Weekly') d.setDate(d.getDate() + 7);
  else if (frequency === 'Biweekly') d.setDate(d.getDate() + 14);
  else if (frequency === 'Monthly') d.setMonth(d.getMonth() + 1);

  if (
    (frequency === 'Weekly' || frequency === 'Biweekly') &&
    contributionDay != null
  ) {
    const diff = (contributionDay - d.getDay() + 7) % 7;
    d.setDate(d.getDate() + diff);
  } else if (frequency === 'Monthly' && contributionDay != null) {
    const desired = Math.min(
      contributionDay,
      daysInMonth(d.getFullYear(), d.getMonth())
    );
    d.setDate(desired);
  }
  return d;
};

const computeFirstDate = (startFrom, frequency, contributionDay) => {
  const base = new Date(startFrom);
  base.setHours(10, 0, 0, 0);

  if (frequency === 'Daily') return base;

  if (frequency === 'Weekly' && contributionDay != null) {
    const diff = (contributionDay - base.getDay() + 7) % 7;
    base.setDate(base.getDate() + (diff === 0 ? 7 : diff));
    return base;
  }
  if (frequency === 'Biweekly' && contributionDay != null) {
    const diff = (contributionDay - base.getDay() + 7) % 7;
    base.setDate(base.getDate() + (diff === 0 ? 14 : diff));
    return base;
  }
  if (frequency === 'Monthly' && contributionDay != null) {
    const desired = Math.min(
      contributionDay,
      daysInMonth(base.getFullYear(), base.getMonth())
    );
    if (base.getDate() >= desired) {
      base.setMonth(base.getMonth() + 1);
    }
    const newDesired = Math.min(
      desired,
      daysInMonth(base.getFullYear(), base.getMonth())
    );
    base.setDate(newDesired);
    return base;
  }
  return base;
};

const executeContribution = async (goal) => {
  const amount = goal.contributionAmount;
  if (!amount || amount <= 0) return false;

  const [source, dest] = await Promise.all([
    Account.findById(goal.sourceAccountId),
    Account.findById(goal.linkedAccountId),
  ]);

  if (!source || !dest) return false;

  if ((source.availableBalance ?? 0) < amount) {
    goal.status = 'Paused';
    await goal.save();
    return false;
  }

  source.availableBalance -= amount;
  source.totalBalance -= amount;
  dest.availableBalance += amount;
  dest.totalBalance += amount;
  await source.save();
  await dest.save();

  const contributionDate = goal.nextContributionDate || new Date();

  const createdTxs = await Transaction.create([
    {
      userId: goal.userId,
      accountId: source._id,
      goalId: goal._id,
      description: `Goal Savings — ${goal.name}`,
      amount: -amount,
      type: 'transfer',
      status: 'Completed',
      date: contributionDate,
    },
    {
      userId: goal.userId,
      accountId: dest._id,
      goalId: goal._id,
      description: `Goal Savings — ${goal.name}`,
      amount,
      type: 'transfer',
      status: 'Completed',
      date: contributionDate,
    },
  ]);

  goal.currentAmount = (goal.currentAmount || 0) + amount;
  goal.lastContributionDate = contributionDate;

  await GoalActivity.create({
    userId: goal.userId,
    goalId: goal._id,
    transactionIds: createdTxs.map((t) => t._id),
    date: contributionDate,
    description: 'Automatic contribution',
    amount,
    balance: goal.currentAmount,
    kind: 'auto',
  });

  if (goal.currentAmount >= goal.targetAmount) {
    goal.status = 'Completed';
    goal.nextContributionDate = null;
  } else {
    goal.nextContributionDate = computeNextDate(
      contributionDate,
      goal.contributionFrequency,
      goal.contributionDay
    );
  }
  await goal.save();
  return true;
};

export const runGoalContributions = async () => {
  const now = new Date();
  const due = await Goal.find({
    status: 'On Track',
    contributionAmount: { $gt: 0 },
    nextContributionDate: { $ne: null, $lte: now },
  });

  let processed = 0;

  for (const goal of due) {
    try {
      let safety = 0;
      while (
        goal.nextContributionDate &&
        goal.nextContributionDate <= now &&
        goal.status === 'On Track' &&
        safety < 366
      ) {
        const ok = await executeContribution(goal);
        if (!ok) break;
        safety += 1;
        processed += 1;
      }
    } catch (err) {
      console.error(`❌ Goal contribution failed for ${goal._id}:`, err);
    }
  }

  if (processed > 0) {
    console.log(`💸 Goal contribution job processed ${processed} contribution(s)`);
  }
};

let intervalHandle = null;

export const startGoalContributionJob = () => {
  if (intervalHandle) return;
  intervalHandle = setInterval(runGoalContributions, RUN_INTERVAL_MS);
  runGoalContributions().catch((err) =>
    console.error('Startup goal contribution run failed:', err)
  );
  console.log('🔄 Goal contribution job started');
};

export const stopGoalContributionJob = () => {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
};

export { computeFirstDate };