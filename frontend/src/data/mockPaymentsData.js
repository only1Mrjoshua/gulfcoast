// src/data/mockPaymentsData.js

export const mockPayees = [
  { id: 1, name: 'Electric Company', category: 'Utilities', accountNumber: 'EL-48291' },
  { id: 2, name: 'Visa', category: 'Credit Card', accountNumber: '•••• 2208' },
  { id: 3, name: 'Water Utility', category: 'Utilities', accountNumber: 'WU-77341' },
  { id: 4, name: 'Internet Provider', category: 'Communications', accountNumber: 'IP-92017' },
  { id: 5, name: 'Insurance Company', category: 'Insurance', accountNumber: 'IC-55823' },
  { id: 6, name: 'Mobile Provider', category: 'Communications', accountNumber: 'MP-66104' },
];

export const mockUpcomingPayments = [
  { id: 1, payee: 'Electric Company', dueDate: '2026-09-12', amount: 124.50, autopay: true, status: 'Due Soon' },
  { id: 2, payee: 'Visa', dueDate: '2026-09-15', amount: 420.00, autopay: true, status: 'Scheduled' },
  { id: 3, payee: 'Auto Loan', dueDate: '2026-09-18', amount: 540.00, autopay: false, status: 'Scheduled' },
];

export const mockPaymentHistory = [
  { id: 101, date: '2026-09-05', payee: 'Internet Provider', account: 'Checking •••• 4821', amount: 79.99, status: 'Paid' },
  { id: 102, date: '2026-09-02', payee: 'Visa', account: 'Checking •••• 4821', amount: 420.00, status: 'Paid' },
  { id: 103, date: '2026-08-30', payee: 'Electric Company', account: 'Checking •••• 4821', amount: 118.40, status: 'Paid' },
  { id: 104, date: '2026-08-25', payee: 'Water Utility', account: 'Checking •••• 4821', amount: 65.75, status: 'Paid' },
];

export const mockAutopay = [
  { id: 1, payee: 'Electric Company', frequency: 'Monthly', nextAmount: 124.50, nextDate: '2026-09-12' },
  { id: 2, payee: 'Visa', frequency: 'Monthly', nextAmount: 420.00, nextDate: '2026-09-15' },
];

export const mockPaymentReminders = [
  { id: 1, name: 'Bill due soon', enabled: true },
  { id: 2, name: 'Payment scheduled', enabled: true },
  { id: 3, name: 'Payment completed', enabled: true },
  { id: 4, name: 'Payment failed', enabled: true },
  { id: 5, name: 'Autopay upcoming', enabled: false },
];

// For overview totals
export const paymentOverview = {
  dueSoon: 1084.50,
  scheduled: 2420.00,
  paidThisMonth: 3842.16,
};

// Available accounts for payment source
export const paymentAccounts = [
  { id: 'chk1', name: 'Primary Checking', lastFour: '4821', available: 12840.52 },
];