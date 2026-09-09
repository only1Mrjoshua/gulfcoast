// src/data/mockGoalsData.js

export const mockGoals = [
  {
    id: 'goal1',
    name: 'Emergency Fund',
    category: 'Emergency Fund',
    targetAmount: 10000.00,
    currentAmount: 7850.00,
    targetDate: '2026-12-31',
    startDate: '2025-01-01',
    linkedAccount: 'Checking •••• 4821',
    contributionAmount: 250.00,
    contributionFrequency: 'Monthly',
    nextContributionDate: '2026-09-15',
    status: 'On Track',
    progress: 78.5,
  },
  {
    id: 'goal2',
    name: 'Vacation',
    category: 'Vacation',
    targetAmount: 3500.00,
    currentAmount: 2100.00,
    targetDate: '2026-06-30',
    startDate: '2025-06-01',
    linkedAccount: 'Savings •••• 9134',
    contributionAmount: 150.00,
    contributionFrequency: 'Biweekly',
    nextContributionDate: '2026-09-20',
    status: 'On Track',
    progress: 60.0,
  },
  {
    id: 'goal3',
    name: 'New Car',
    category: 'New Car',
    targetAmount: 25000.00,
    currentAmount: 14000.00,
    targetDate: '2027-03-15',
    startDate: '2024-03-15',
    linkedAccount: 'Checking •••• 4821',
    contributionAmount: 500.00,
    contributionFrequency: 'Monthly',
    nextContributionDate: '2026-10-01',
    status: 'Behind',
    progress: 56.0,
  },
];

export const mockGoalActivities = {
  'goal1': [
    { id: 1, date: '2026-09-05', description: 'Automatic Contribution', amount: 250.00, balance: 7850.00 },
    { id: 2, date: '2026-08-05', description: 'Automatic Contribution', amount: 250.00, balance: 7600.00 },
    { id: 3, date: '2026-07-05', description: 'Automatic Contribution', amount: 250.00, balance: 7350.00 },
    { id: 4, date: '2026-06-05', description: 'Automatic Contribution', amount: 250.00, balance: 7100.00 },
  ],
  'goal2': [
    { id: 1, date: '2026-09-06', description: 'Manual Contribution', amount: 150.00, balance: 2100.00 },
    { id: 2, date: '2026-08-23', description: 'Manual Contribution', amount: 150.00, balance: 1950.00 },
    { id: 3, date: '2026-08-09', description: 'Manual Contribution', amount: 150.00, balance: 1800.00 },
  ],
  'goal3': [
    { id: 1, date: '2026-09-01', description: 'Automatic Contribution', amount: 500.00, balance: 14000.00 },
    { id: 2, date: '2026-08-01', description: 'Automatic Contribution', amount: 500.00, balance: 13500.00 },
    { id: 3, date: '2026-07-01', description: 'Automatic Contribution', amount: 500.00, balance: 13000.00 },
  ],
};

export const mockCompletedGoals = [
  {
    id: 'comp1',
    name: 'New Laptop',
    category: 'Major Purchase',
    targetAmount: 2000.00,
    currentAmount: 2000.00,
    completionDate: '2026-08-15',
    linkedAccount: 'Checking •••• 4821',
  },
  {
    id: 'comp2',
    name: 'Vacation Fund',
    category: 'Vacation',
    targetAmount: 3500.00,
    currentAmount: 3500.00,
    completionDate: '2026-06-30',
    linkedAccount: 'Savings •••• 9134',
  },
];

export const mockGoalInsights = [
  "You're 78% of the way to your Emergency Fund goal.",
  "Increasing your monthly contribution by $50 could help you reach your target sooner.",
  "Your Vacation goal is on track with current contributions.",
];