// src/data/mockTransfersData.js

export const mockTransferAccounts = [
  { id: 'chk1', name: 'Primary Checking', lastFour: '4821', available: 12840.52 },
  { id: 'sav1', name: 'High-Yield Savings', lastFour: '9134', available: 11839.90 },
  { id: 'ext1', name: 'External Bank Account', lastFour: '5572', available: null },
];

export const mockScheduledTransfers = [
  {
    id: 1,
    from: 'Primary Checking',
    fromLastFour: '4821',
    to: 'High-Yield Savings',
    toLastFour: '9134',
    amount: 500.00,
    date: '2026-09-15',
    frequency: 'Monthly',
    status: 'Scheduled',
  },
  {
    id: 2,
    from: 'High-Yield Savings',
    fromLastFour: '9134',
    to: 'Primary Checking',
    toLastFour: '4821',
    amount: 250.00,
    date: '2026-09-20',
    frequency: 'One time',
    status: 'Scheduled',
  },
];

export const mockTransferHistory = [
  {
    id: 101,
    from: 'Primary Checking',
    fromLastFour: '4821',
    to: 'High-Yield Savings',
    toLastFour: '9134',
    amount: 500.00,
    date: '2026-09-08',
    status: 'Completed',
  },
  {
    id: 102,
    from: 'Primary Checking',
    fromLastFour: '4821',
    to: 'External Bank',
    toLastFour: '5572',
    amount: 1200.00,
    date: '2026-09-05',
    status: 'Completed',
  },
  {
    id: 103,
    from: 'High-Yield Savings',
    fromLastFour: '9134',
    to: 'Primary Checking',
    toLastFour: '4821',
    amount: 300.00,
    date: '2026-09-02',
    status: 'Completed',
  },
];

export const transferLimits = {
  daily: 2500,
  perTransfer: 1000,
  processingTime: '1-2 business days',
};