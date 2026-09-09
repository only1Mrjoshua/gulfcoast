// src/data/mockInsightsData.js

export const mockInsightsSummary = {
  moneyIn: 6850.00,
  moneyOut: 4230.50,
  netCashFlow: 2619.50,
  saved: 1200.00,
};

export const mockSpendingCategories = [
  { category: 'Housing', amount: 1250.00, transactions: 3, color: '#003256' },
  { category: 'Food & Dining', amount: 620.00, transactions: 18, color: '#008296' },
  { category: 'Transportation', amount: 480.00, transactions: 12, color: '#005D6B' },
  { category: 'Shopping', amount: 550.00, transactions: 9, color: '#F2672A' },
  { category: 'Bills & Utilities', amount: 430.00, transactions: 6, color: '#4A6A7F' },
  { category: 'Entertainment', amount: 320.00, transactions: 8, color: '#6B8E9C' },
  { category: 'Healthcare', amount: 180.00, transactions: 4, color: '#9BB8C4' },
  { category: 'Other', amount: 400.50, transactions: 11, color: '#C4D4DB' },
];

export const mockIncomeData = {
  currentMonth: 6850.00,
  previousMonth: 6420.00,
  change: 430.00,
  numberOfDeposits: 8,
  largestSource: 'Payroll Deposit',
};

export const mockCashFlowData = {
  weekly: [
    { week: 'Week 1', income: 1200, spending: 980, net: 220 },
    { week: 'Week 2', income: 1800, spending: 1050, net: 750 },
    { week: 'Week 3', income: 1500, spending: 1200, net: 300 },
    { week: 'Week 4', income: 2350, spending: 1000.5, net: 1349.5 },
  ],
  monthly: [
    { month: 'Jan', income: 5800, spending: 4200, net: 1600 },
    { month: 'Feb', income: 6100, spending: 4400, net: 1700 },
    { month: 'Mar', income: 5900, spending: 4600, net: 1300 },
    { month: 'Apr', income: 6300, spending: 4300, net: 2000 },
    { month: 'May', income: 6200, spending: 4700, net: 1500 },
    { month: 'Jun', income: 6600, spending: 4900, net: 1700 },
    { month: 'Jul', income: 6400, spending: 4500, net: 1900 },
    { month: 'Aug', income: 6850, spending: 4230.5, net: 2619.5 },
  ],
};

export const mockSpendingTrends = {
  comparison: 'Spending was lower this month than last month.',
  highestCategory: 'Housing',
  totalTransactions: 48,
  averageTransaction: 88.14,
  diningAmount: 620,
  diningChange: 12,
};

export const mockRecurringExpenses = [
  { merchant: 'Rent', amount: 1200.00, frequency: 'Monthly', nextPayment: '2026-10-01' },
  { merchant: 'Electric Company', amount: 124.50, frequency: 'Monthly', nextPayment: '2026-09-12' },
  { merchant: 'Water Utility', amount: 85.00, frequency: 'Monthly', nextPayment: '2026-09-15' },
  { merchant: 'Internet Provider', amount: 79.99, frequency: 'Monthly', nextPayment: '2026-09-20' },
  { merchant: 'Insurance', amount: 180.00, frequency: 'Monthly', nextPayment: '2026-09-25' },
  { merchant: 'Netflix', amount: 15.99, frequency: 'Monthly', nextPayment: '2026-09-05' },
  { merchant: 'Gym Membership', amount: 45.00, frequency: 'Monthly', nextPayment: '2026-09-10' },
];

export const mockSavingsProgress = {
  totalSaved: 7850.00,
  activeGoals: 3,
  goals: [
    { name: 'Emergency Fund', current: 7850, target: 10000, progress: 78.5 },
    { name: 'Vacation', current: 2100, target: 3500, progress: 60.0 },
    { name: 'New Car', current: 14000, target: 25000, progress: 56.0 },
  ],
  recentContributions: 500.00,
};

export const mockFinancialObservations = [
  'Your spending was lower this month than last month.',
  'Your largest spending category was Housing.',
  'You contributed $500 toward your savings goals this month.',
];

export const mockTopMerchants = [
  { merchant: 'Amazon', category: 'Shopping', amount: 420.00, transactions: 5 },
  { merchant: 'Shell', category: 'Transportation', amount: 280.00, transactions: 8 },
  { merchant: 'Target', category: 'Shopping', amount: 310.00, transactions: 4 },
  { merchant: 'Netflix', category: 'Entertainment', amount: 120.00, transactions: 2 },
];

export const mockRecentActivity = [
  { date: '2026-09-08', description: 'Amazon', category: 'Shopping', amount: -84.21, type: 'spending' },
  { date: '2026-09-07', description: 'Payroll Deposit', category: 'Income', amount: 3850.00, type: 'income' },
  { date: '2026-09-06', description: 'Shell', category: 'Transportation', amount: -52.40, type: 'spending' },
  { date: '2026-09-06', description: 'Interest Payment', category: 'Income', amount: 42.18, type: 'income' },
  { date: '2026-09-05', description: 'Transfer to Savings', category: 'Transfer', amount: -500.00, type: 'transfer' },
];