// src/data/mockTransfersData.js

// Name on the account — used as sender on every transfer
export const ACCOUNT_HOLDER_NAME = 'Jordan Ellis';

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
    amount: 500.0,
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
    amount: 250.0,
    date: '2026-09-20',
    frequency: 'One time',
    status: 'Scheduled',
  },
];

// Months shown in the history dropdown — newest first
export const mockTransferMonths = [
  '2026-09',
  '2026-08',
  '2026-07',
  '2026-06',
  '2026-05',
  '2026-04',
  '2026-03',
  '2026-02',
  '2026-01',
  '2025-12',
];

// Transfer history — Dec 2025 → Sep 2026
// type: 'internal' | 'external' | 'wire' | 'recurring'
export const mockTransferHistory = [
  // ---------- December 2025 ----------
  { id: 1,  senderName: 'Jordan Ellis', recipientName: 'Jordan Ellis',       from: 'Primary Checking', fromLastFour: '4821', to: 'High-Yield Savings', toLastFour: '9134', amount: 500.0,  date: '2025-12-03', time: '09:14 ET', status: 'Completed', type: 'internal',  transactionNumber: 'TRX-9F2A4C81', memo: 'Monthly savings' },
  { id: 2,  senderName: 'Jordan Ellis', recipientName: 'Sarah Chen',         from: 'Primary Checking', fromLastFour: '4821', to: 'External Bank',      toLastFour: '5572', amount: 1200.0, date: '2025-12-08', time: '11:42 ET', status: 'Completed', type: 'external',  transactionNumber: 'TRX-4B7D1E29', memo: 'Rent share' },
  { id: 3,  senderName: 'Jordan Ellis', recipientName: 'Robert Kim',         from: 'Primary Checking', fromLastFour: '4821', to: 'Chase Bank',         toLastFour: '8810', amount: 2500.0, date: '2025-12-15', time: '14:05 ET', status: 'Completed', type: 'wire',      transactionNumber: 'TRX-A1C93F60', memo: 'Contractor payment' },
  { id: 4,  senderName: 'Jordan Ellis', recipientName: 'Jordan Ellis',       from: 'High-Yield Savings', fromLastFour: '9134', to: 'Primary Checking', toLastFour: '4821', amount: 300.0,  date: '2025-12-19', time: '08:30 ET', status: 'Completed', type: 'recurring', transactionNumber: 'TRX-2E8B5D14', memo: 'Auto transfer' },
  { id: 5,  senderName: 'Jordan Ellis', recipientName: 'Jordan Ellis',       from: 'Primary Checking', fromLastFour: '4821', to: 'High-Yield Savings', toLastFour: '9134', amount: 750.0,  date: '2025-12-28', time: '16:20 ET', status: 'Completed', type: 'internal',  transactionNumber: 'TRX-7D3C1A98', memo: 'Holiday savings' },

  // ---------- January 2026 ----------
  { id: 6,  senderName: 'Jordan Ellis', recipientName: 'Jordan Ellis',       from: 'Primary Checking', fromLastFour: '4821', to: 'High-Yield Savings', toLastFour: '9134', amount: 500.0,  date: '2026-01-02', time: '08:30 ET', status: 'Completed', type: 'recurring', transactionNumber: 'TRX-5C9E2B47', memo: 'Auto transfer' },
  { id: 7,  senderName: 'Jordan Ellis', recipientName: 'Michael Torres',     from: 'Primary Checking', fromLastFour: '4821', to: 'External Bank',      toLastFour: '5572', amount: 850.0,  date: '2026-01-09', time: '10:15 ET', status: 'Completed', type: 'external',  transactionNumber: 'TRX-8A1F4D63', memo: 'Utilities split' },
  { id: 8,  senderName: 'Jordan Ellis', recipientName: 'Jordan Ellis',       from: 'High-Yield Savings', fromLastFour: '9134', to: 'Primary Checking', toLastFour: '4821', amount: 400.0,  date: '2026-01-14', time: '13:48 ET', status: 'Completed', type: 'internal',  transactionNumber: 'TRX-3F6B9C25', memo: 'Cover overdraft' },
  { id: 9,  senderName: 'Jordan Ellis', recipientName: 'Linda Patel',        from: 'Primary Checking', fromLastFour: '4821', to: 'Wells Fargo',        toLastFour: '3391', amount: 3000.0, date: '2026-01-20', time: '15:02 ET', status: 'Failed',    type: 'wire',      transactionNumber: 'TRX-B2D8E1A7', memo: 'Down payment' },
  { id: 10, senderName: 'Jordan Ellis', recipientName: 'Jordan Ellis',       from: 'Primary Checking', fromLastFour: '4821', to: 'High-Yield Savings', toLastFour: '9134', amount: 600.0,  date: '2026-01-27', time: '09:55 ET', status: 'Completed', type: 'internal',  transactionNumber: 'TRX-6E4A7B90', memo: 'Savings top-up' },

  // ---------- February 2026 ----------
  { id: 11, senderName: 'Jordan Ellis', recipientName: 'Jordan Ellis',       from: 'Primary Checking', fromLastFour: '4821', to: 'High-Yield Savings', toLastFour: '9134', amount: 500.0,  date: '2026-02-03', time: '08:30 ET', status: 'Completed', type: 'recurring', transactionNumber: 'TRX-1A7C3E85', memo: 'Auto transfer' },
  { id: 12, senderName: 'Jordan Ellis', recipientName: 'Emily Watson',       from: 'Primary Checking', fromLastFour: '4821', to: 'External Bank',      toLastFour: '5572', amount: 1500.0, date: '2026-02-10', time: '12:20 ET', status: 'Pending',   type: 'external',  transactionNumber: 'TRX-9D2F6B14', memo: 'Tuition' },
  { id: 13, senderName: 'Jordan Ellis', recipientName: 'David Nguyen',       from: 'Primary Checking', fromLastFour: '4821', to: 'Bank of America',    toLastFour: '7724', amount: 1800.0, date: '2026-02-17', time: '14:45 ET', status: 'Completed', type: 'wire',      transactionNumber: 'TRX-4C8E1A72', memo: 'Car purchase' },
  { id: 14, senderName: 'Jordan Ellis', recipientName: 'Jordan Ellis',       from: 'High-Yield Savings', fromLastFour: '9134', to: 'Primary Checking', toLastFour: '4821', amount: 250.0,  date: '2026-02-22', time: '11:10 ET', status: 'Completed', type: 'internal',  transactionNumber: 'TRX-7B3D9F26', memo: 'Transfer back' },
  { id: 15, senderName: 'Jordan Ellis', recipientName: 'Jordan Ellis',       from: 'Primary Checking', fromLastFour: '4821', to: 'High-Yield Savings', toLastFour: '9134', amount: 900.0,  date: '2026-02-28', time: '17:05 ET', status: 'Completed', type: 'internal',  transactionNumber: 'TRX-2F5A8C41', memo: 'End of month' },

  // ---------- March 2026 ----------
  { id: 16, senderName: 'Jordan Ellis', recipientName: 'Jordan Ellis',       from: 'Primary Checking', fromLastFour: '4821', to: 'High-Yield Savings', toLastFour: '9134', amount: 500.0,  date: '2026-03-03', time: '08:30 ET', status: 'Completed', type: 'recurring', transactionNumber: 'TRX-8E1C4B73', memo: 'Auto transfer' },
  { id: 17, senderName: 'Jordan Ellis', recipientName: 'Priya Sharma',       from: 'Primary Checking', fromLastFour: '4821', to: 'External Bank',      toLastFour: '5572', amount: 2200.0, date: '2026-03-11', time: '10:50 ET', status: 'Completed', type: 'external',  transactionNumber: 'TRX-3A9D6E18', memo: 'Wedding gift' },
  { id: 18, senderName: 'Jordan Ellis', recipientName: 'Thomas Wright',      from: 'Primary Checking', fromLastFour: '4821', to: 'Citibank',           toLastFour: '5540', amount: 4500.0, date: '2026-03-18', time: '13:25 ET', status: 'Completed', type: 'wire',      transactionNumber: 'TRX-5F2B8A47', memo: 'Home repair' },
  { id: 19, senderName: 'Jordan Ellis', recipientName: 'Jordan Ellis',       from: 'High-Yield Savings', fromLastFour: '9134', to: 'Primary Checking', toLastFour: '4821', amount: 700.0,  date: '2026-03-23', time: '15:40 ET', status: 'Canceled',  type: 'internal',  transactionNumber: 'TRX-1D7E3C92', memo: 'Canceled by user' },
  { id: 20, senderName: 'Jordan Ellis', recipientName: 'Jordan Ellis',       from: 'Primary Checking', fromLastFour: '4821', to: 'High-Yield Savings', toLastFour: '9134', amount: 1100.0, date: '2026-03-30', time: '09:20 ET', status: 'Completed', type: 'internal',  transactionNumber: 'TRX-6B4A9D15', memo: 'Quarterly savings' },

  // ---------- April 2026 ----------
  { id: 21, senderName: 'Jordan Ellis', recipientName: 'Jordan Ellis',       from: 'Primary Checking', fromLastFour: '4821', to: 'High-Yield Savings', toLastFour: '9134', amount: 500.0,  date: '2026-04-02', time: '08:30 ET', status: 'Completed', type: 'recurring', transactionNumber: 'TRX-9C1F5E84', memo: 'Auto transfer' },
  { id: 22, senderName: 'Jordan Ellis', recipientName: 'Daniel Okafor',      from: 'Primary Checking', fromLastFour: '4821', to: 'External Bank',      toLastFour: '5572', amount: 975.0,  date: '2026-04-08', time: '11:35 ET', status: 'Completed', type: 'external',  transactionNumber: 'TRX-4A8D2B61', memo: 'Shared expenses' },
  { id: 23, senderName: 'Jordan Ellis', recipientName: 'Jordan Ellis',       from: 'High-Yield Savings', fromLastFour: '9134', to: 'Primary Checking', toLastFour: '4821', amount: 350.0,  date: '2026-04-15', time: '14:00 ET', status: 'Completed', type: 'internal',  transactionNumber: 'TRX-7E3B9C28', memo: 'Cash flow' },
  { id: 24, senderName: 'Jordan Ellis', recipientName: 'Olivia Bennett',     from: 'Primary Checking', fromLastFour: '4821', to: 'Capital One',        toLastFour: '6127', amount: 2100.0, date: '2026-04-21', time: '12:15 ET', status: 'Completed', type: 'wire',      transactionNumber: 'TRX-2D6F1A95', memo: 'Consulting fee' },
  { id: 25, senderName: 'Jordan Ellis', recipientName: 'Jordan Ellis',       from: 'Primary Checking', fromLastFour: '4821', to: 'High-Yield Savings', toLastFour: '9134', amount: 800.0,  date: '2026-04-29', time: '16:50 ET', status: 'Completed', type: 'internal',  transactionNumber: 'TRX-5B9E4C73', memo: 'Monthly savings' },

  // ---------- May 2026 ----------
  { id: 26, senderName: 'Jordan Ellis', recipientName: 'Jordan Ellis',       from: 'Primary Checking', fromLastFour: '4821', to: 'High-Yield Savings', toLastFour: '9134', amount: 500.0,  date: '2026-05-04', time: '08:30 ET', status: 'Completed', type: 'recurring', transactionNumber: 'TRX-8F1C6B42', memo: 'Auto transfer' },
  { id: 27, senderName: 'Jordan Ellis', recipientName: 'Rachel Goldstein',   from: 'Primary Checking', fromLastFour: '4821', to: 'External Bank',      toLastFour: '5572', amount: 1400.0, date: '2026-05-12', time: '10:05 ET', status: 'Completed', type: 'external',  transactionNumber: 'TRX-3C7A9D18', memo: 'Vacation share' },
  { id: 28, senderName: 'Jordan Ellis', recipientName: 'James Sullivan',     from: 'Primary Checking', fromLastFour: '4821', to: 'TD Bank',            toLastFour: '9083', amount: 3600.0, date: '2026-05-19', time: '13:40 ET', status: 'Completed', type: 'wire',      transactionNumber: 'TRX-6A2E8F57', memo: 'Equipment purchase' },
  { id: 29, senderName: 'Jordan Ellis', recipientName: 'Jordan Ellis',       from: 'High-Yield Savings', fromLastFour: '9134', to: 'Primary Checking', toLastFour: '4821', amount: 600.0,  date: '2026-05-25', time: '11:55 ET', status: 'Completed', type: 'internal',  transactionNumber: 'TRX-1E5D3B94', memo: 'Transfer back' },
  { id: 30, senderName: 'Jordan Ellis', recipientName: 'Jordan Ellis',       from: 'Primary Checking', fromLastFour: '4821', to: 'High-Yield Savings', toLastFour: '9134', amount: 450.0,  date: '2026-05-30', time: '15:20 ET', status: 'Pending',   type: 'internal',  transactionNumber: 'TRX-9B4F7A26', memo: 'End of month' },

  // ---------- June 2026 ----------
  { id: 31, senderName: 'Jordan Ellis', recipientName: 'Jordan Ellis',       from: 'Primary Checking', fromLastFour: '4821', to: 'High-Yield Savings', toLastFour: '9134', amount: 500.0,  date: '2026-06-03', time: '08:30 ET', status: 'Completed', type: 'recurring', transactionNumber: 'TRX-2C8A1E67', memo: 'Auto transfer' },
  { id: 32, senderName: 'Jordan Ellis', recipientName: 'Marcus Johnson',     from: 'Primary Checking', fromLastFour: '4821', to: 'External Bank',      toLastFour: '5572', amount: 650.0,  date: '2026-06-09', time: '12:45 ET', status: 'Completed', type: 'external',  transactionNumber: 'TRX-7D3F9B14', memo: 'Gym membership' },
  { id: 33, senderName: 'Jordan Ellis', recipientName: 'Jordan Ellis',       from: 'High-Yield Savings', fromLastFour: '9134', to: 'Primary Checking', toLastFour: '4821', amount: 1200.0, date: '2026-06-16', time: '09:10 ET', status: 'Completed', type: 'internal',  transactionNumber: 'TRX-4A1C6E82', memo: 'Home project' },
  { id: 34, senderName: 'Jordan Ellis', recipientName: 'Anna Kowalski',      from: 'Primary Checking', fromLastFour: '4821', to: 'PNC Bank',           toLastFour: '4419', amount: 2750.0, date: '2026-06-23', time: '14:30 ET', status: 'Completed', type: 'wire',      transactionNumber: 'TRX-8E5B2D47', memo: 'Legal retainer' },
  { id: 35, senderName: 'Jordan Ellis', recipientName: 'Jordan Ellis',       from: 'Primary Checking', fromLastFour: '4821', to: 'High-Yield Savings', toLastFour: '9134', amount: 500.0,  date: '2026-06-30', time: '17:15 ET', status: 'Completed', type: 'internal',  transactionNumber: 'TRX-3F9D7A51', memo: 'Monthly savings' },

  // ---------- July 2026 ----------
  { id: 36, senderName: 'Jordan Ellis', recipientName: 'Jordan Ellis',       from: 'Primary Checking', fromLastFour: '4821', to: 'High-Yield Savings', toLastFour: '9134', amount: 500.0,  date: '2026-07-02', time: '08:30 ET', status: 'Completed', type: 'recurring', transactionNumber: 'TRX-6B2E4C98', memo: 'Auto transfer' },
  { id: 37, senderName: 'Jordan Ellis', recipientName: 'Sofia Ramirez',      from: 'Primary Checking', fromLastFour: '4821', to: 'External Bank',      toLastFour: '5572', amount: 1875.0, date: '2026-07-10', time: '11:20 ET', status: 'Completed', type: 'external',  transactionNumber: 'TRX-1A7C5F34', memo: 'Event deposit' },
  { id: 38, senderName: 'Jordan Ellis', recipientName: 'Henry Thompson',     from: 'Primary Checking', fromLastFour: '4821', to: 'US Bank',            toLastFour: '2256', amount: 5000.0, date: '2026-07-17', time: '13:05 ET', status: 'Completed', type: 'wire',      transactionNumber: 'TRX-9D4B8E72', memo: 'Property tax' },
  { id: 39, senderName: 'Jordan Ellis', recipientName: 'Jordan Ellis',       from: 'High-Yield Savings', fromLastFour: '9134', to: 'Primary Checking', toLastFour: '4821', amount: 425.0,  date: '2026-07-22', time: '10:40 ET', status: 'Failed',    type: 'internal',  transactionNumber: 'TRX-5E1A3D86', memo: 'Insufficient funds' },
  { id: 40, senderName: 'Jordan Ellis', recipientName: 'Jordan Ellis',       from: 'Primary Checking', fromLastFour: '4821', to: 'High-Yield Savings', toLastFour: '9134', amount: 700.0,  date: '2026-07-29', time: '16:35 ET', status: 'Completed', type: 'internal',  transactionNumber: 'TRX-2F8C6B19', memo: 'Monthly savings' },

  // ---------- August 2026 ----------
  { id: 41, senderName: 'Jordan Ellis', recipientName: 'Jordan Ellis',       from: 'Primary Checking', fromLastFour: '4821', to: 'High-Yield Savings', toLastFour: '9134', amount: 500.0,  date: '2026-08-03', time: '08:30 ET', status: 'Completed', type: 'recurring', transactionNumber: 'TRX-7A3E9C52', memo: 'Auto transfer' },
  { id: 42, senderName: 'Jordan Ellis', recipientName: 'Nina Petrova',       from: 'Primary Checking', fromLastFour: '4821', to: 'External Bank',      toLastFour: '5572', amount: 1050.0, date: '2026-08-11', time: '12:00 ET', status: 'Completed', type: 'external',  transactionNumber: 'TRX-4C8B1F67', memo: 'Design work' },
  { id: 43, senderName: 'Jordan Ellis', recipientName: 'George Anderson',    from: 'Primary Checking', fromLastFour: '4821', to: 'Chase Bank',         toLastFour: '8810', amount: 3200.0, date: '2026-08-18', time: '14:20 ET', status: 'Completed', type: 'wire',      transactionNumber: 'TRX-1E6D4A93', memo: 'Tuition payment' },
  { id: 44, senderName: 'Jordan Ellis', recipientName: 'Jordan Ellis',       from: 'High-Yield Savings', fromLastFour: '9134', to: 'Primary Checking', toLastFour: '4821', amount: 550.0,  date: '2026-08-24', time: '11:30 ET', status: 'Completed', type: 'internal',  transactionNumber: 'TRX-9B2F7E41', memo: 'Transfer back' },
  { id: 45, senderName: 'Jordan Ellis', recipientName: 'Jordan Ellis',       from: 'Primary Checking', fromLastFour: '4821', to: 'High-Yield Savings', toLastFour: '9134', amount: 950.0,  date: '2026-08-31', time: '17:45 ET', status: 'Completed', type: 'internal',  transactionNumber: 'TRX-5D9A3C78', memo: 'End of month' },

  // ---------- September 2026 (current month) ----------
  { id: 46, senderName: 'Jordan Ellis', recipientName: 'Jordan Ellis',       from: 'Primary Checking', fromLastFour: '4821', to: 'High-Yield Savings', toLastFour: '9134', amount: 500.0,  date: '2026-09-02', time: '08:30 ET', status: 'Completed', type: 'recurring', transactionNumber: 'TRX-3A7E1B64', memo: 'Auto transfer' },
  { id: 47, senderName: 'Jordan Ellis', recipientName: 'Isabella Rossi',     from: 'Primary Checking', fromLastFour: '4821', to: 'External Bank',      toLastFour: '5572', amount: 1200.0, date: '2026-09-05', time: '11:15 ET', status: 'Completed', type: 'external',  transactionNumber: 'TRX-8C4F2D19', memo: 'Shared rent' },
  { id: 48, senderName: 'Jordan Ellis', recipientName: 'Victor Alvarez',     from: 'Primary Checking', fromLastFour: '4821', to: 'Wells Fargo',        toLastFour: '3391', amount: 4000.0, date: '2026-09-08', time: '13:50 ET', status: 'Completed', type: 'wire',      transactionNumber: 'TRX-2E9B5A37', memo: 'Business invoice' },
  { id: 49, senderName: 'Jordan Ellis', recipientName: 'Jordan Ellis',       from: 'High-Yield Savings', fromLastFour: '9134', to: 'Primary Checking', toLastFour: '4821', amount: 300.0,  date: '2026-09-09', time: '10:25 ET', status: 'Pending',   type: 'internal',  transactionNumber: 'TRX-6F1D8C42', memo: 'Transfer back' },
  { id: 50, senderName: 'Jordan Ellis', recipientName: 'Jordan Ellis',       from: 'Primary Checking', fromLastFour: '4821', to: 'High-Yield Savings', toLastFour: '9134', amount: 650.0,  date: '2026-09-10', time: '09:05 ET', status: 'Pending',   type: 'internal',  transactionNumber: 'TRX-7B3A9E15', memo: 'Monthly savings' },
];

export const transferLimits = {
  daily: 2500,
  perTransfer: 1000,
  processingTime: '1-2 business days',
};