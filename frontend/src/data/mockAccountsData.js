// src/data/mockAccountsData.js

export const mockAccountDetails = {
  checking: [
    {
      id: 'chk1',
      name: 'Primary Checking',
      type: 'checking',
      lastFour: '4821',
      availableBalance: 12840.52,
      currentBalance: 13120.76,
      pending: 280.24,
      status: 'Active',
    },
  ],
  savings: [
    {
      id: 'sav1',
      name: 'High-Yield Savings',
      type: 'savings',
      lastFour: '9134',
      availableBalance: 11839.90,
      currentBalance: 11839.90,
      interestRate: 4.25,
      status: 'Active',
    },
  ],
  creditCards: [
    {
      id: 'cc1',
      name: 'Gulf Coast Rewards Visa',
      type: 'credit',
      lastFour: '2208',
      currentBalance: 1240.50,
      availableCredit: 8759.50,
      creditLimit: 10000.00,
      paymentDue: '2026-09-15',
      minimumPayment: 85.00,
      status: 'Active',
    },
  ],
  loans: [
    {
      id: 'loan1',
      name: 'Auto Loan',
      type: 'loan',
      lastFour: '7712',
      outstandingBalance: 18420.00,
      nextPayment: 540.00,
      nextPaymentDue: '2026-09-18',
      status: 'Active',
    },
  ],
};

export const mockRecentTransactions = [
  {
    id: 1,
    description: 'Amazon',
    category: 'Shopping',
    date: '2026-09-08',
    amount: -84.21,
    accountId: 'chk1',
    accountName: 'Checking •••• 4821',
  },
  {
    id: 2,
    description: 'Payroll Deposit',
    category: 'Income',
    date: '2026-09-07',
    amount: 3850.00,
    accountId: 'chk1',
    accountName: 'Checking •••• 4821',
  },
  {
    id: 3,
    description: 'Interest Payment',
    category: 'Income',
    date: '2026-09-06',
    amount: 42.18,
    accountId: 'sav1',
    accountName: 'Savings •••• 9134',
  },
  {
    id: 4,
    description: 'Shell',
    category: 'Gas',
    date: '2026-09-06',
    amount: -52.40,
    accountId: 'chk1',
    accountName: 'Checking •••• 4821',
  },
  {
    id: 5,
    description: 'Netflix',
    category: 'Entertainment',
    date: '2026-09-05',
    amount: -15.99,
    accountId: 'chk1',
    accountName: 'Checking •••• 4821',
  },
  {
    id: 6,
    description: 'Target',
    category: 'Shopping',
    date: '2026-09-04',
    amount: -132.75,
    accountId: 'chk1',
    accountName: 'Checking •••• 4821',
  },
  {
    id: 7,
    description: 'Electric Company',
    category: 'Utilities',
    date: '2026-09-03',
    amount: -124.50,
    accountId: 'chk1',
    accountName: 'Checking •••• 4821',
  },
];

export const mockStatements = [
  { month: 'September 2026', type: 'Checking Statement', available: true },
  { month: 'August 2026', type: 'Checking Statement', available: true },
  { month: 'July 2026', type: 'Checking Statement', available: true },
];

export const mockAlerts = [
  { name: 'Low balance alert', status: 'ON' },
  { name: 'Large transaction alert', status: 'ON' },
  { name: 'Deposit notification', status: 'OFF' },
  { name: 'Payment reminder', status: 'ON' },
  { name: 'Monthly statement notification', status: 'ON' },
];

// Also export totals from dashboard data, or define here
export const totalBalance = 24680.42;
export const availableBalance = 23940.18;
export const pendingAmount = 740.24;