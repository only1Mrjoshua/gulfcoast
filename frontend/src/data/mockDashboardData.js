// src/data/mockDashboardData.js

export const mockAccounts = [
  { id: 'chk', name: 'Checking', lastFour: '4821', balance: 12840.52, type: 'checking' },
  { id: 'sav', name: 'Savings', lastFour: '9134', balance: 11839.90, type: 'savings' },
  { id: 'cc', name: 'Credit Card', lastFour: '2208', balance: -1240.50, type: 'credit' },
];

export const mockTransactions = [
  { id: 1, description: 'Amazon', category: 'Shopping', date: '2026-09-08', amount: -84.21 },
  { id: 2, description: 'Payroll Deposit', category: 'Income', date: '2026-09-07', amount: 3850.00 },
  { id: 3, description: 'Shell', category: 'Gas', date: '2026-09-06', amount: -52.40 },
  { id: 4, description: 'Netflix', category: 'Entertainment', date: '2026-09-05', amount: -15.99 },
  { id: 5, description: 'Target', category: 'Shopping', date: '2026-09-04', amount: -132.75 },
  { id: 6, description: 'Electric Company', category: 'Utilities', date: '2026-09-03', amount: -124.50 },
];

export const mockUpcomingPayments = [
  { id: 1, payee: 'Electric Company', dueDate: '2026-09-12', amount: 124.50, autopay: true },
  { id: 2, payee: 'Visa', dueDate: '2026-09-15', amount: 420.00, autopay: true },
  { id: 3, payee: 'Auto Loan', dueDate: '2026-09-18', amount: 540.00, autopay: false },
];

export const mockSpendingCategories = [
  { category: 'Housing', amount: 950.00 },
  { category: 'Food & Dining', amount: 420.30 },
  { category: 'Transportation', amount: 210.80 },
  { category: 'Shopping', amount: 380.45 },
  { category: 'Utilities', amount: 275.60 },
  { category: 'Entertainment', amount: 140.21 },
];

export const mockCashFlow = { moneyIn: 5420, moneyOut: 2480, net: 2940 };

export const mockGoals = [
  { id: 1, name: 'Emergency Fund', current: 8400, target: 10000 },
  { id: 2, name: 'Vacation', current: 2100, target: 3500 },
  { id: 3, name: 'New Car', current: 14000, target: 25000 },
];

export const mockMessages = [
  { id: 1, title: 'New statement available', date: '2026-09-07' },
  { id: 2, title: 'Loan application update', date: '2026-09-05' },
  { id: 3, title: 'Security notification', date: '2026-09-04' },
];

export const mockCreditScore = { score: 742, rating: 'Excellent', change: 12, updated: '2026-09-08' };

export const mockAlerts = [
  { id: 1, type: 'security', message: 'Large purchase detected', date: '2026-09-08' },
  { id: 2, type: 'security', message: 'New sign-in from a new device', date: '2026-09-07' },
  { id: 3, type: 'payment', message: 'Payment due in 3 days', date: '2026-09-06' },
];

export const mockRecommendations = [
  'Build your emergency savings',
  'Explore our home loan options',
  'Set up automatic savings',
];

// For total balance and available
export const totalBalance = 24680.42;
export const availableBalance = 23940.18;
export const pendingAmount = 740.24;