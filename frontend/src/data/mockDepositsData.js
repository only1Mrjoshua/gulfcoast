// src/data/mockDepositsData.js

export const mockDepositAccounts = [
  { id: 'chk1', name: 'Primary Checking', lastFour: '4821', available: 12840.52 },
  { id: 'sav1', name: 'High-Yield Savings', lastFour: '9134', available: 11839.90 },
];

export const mockRecentDeposits = [
  {
    id: 1,
    type: 'Direct Deposit',
    accountId: 'chk1',
    accountName: 'Checking •••• 4821',
    amount: 3850.00,
    date: '2026-09-07',
    status: 'Completed',
  },
  {
    id: 2,
    type: 'Mobile Check Deposit',
    accountId: 'chk1',
    accountName: 'Checking •••• 4821',
    amount: 750.00,
    date: '2026-09-05',
    status: 'Completed',
  },
  {
    id: 3,
    type: 'Mobile Check Deposit',
    accountId: 'sav1',
    accountName: 'Savings •••• 9134',
    amount: 500.00,
    date: '2026-08-28',
    status: 'Completed',
  },
  {
    id: 4,
    type: 'Mobile Check Deposit',
    accountId: 'chk1',
    accountName: 'Checking •••• 4821',
    amount: 200.00,
    date: '2026-09-09',
    status: 'Processing',
  },
];

export const depositLimits = {
  daily: 5000,
  monthly: 15000,
};

export const depositAvailability = {
  standard: '1-2 business days',
  expedited: 'Same day (subject to approval)',
};