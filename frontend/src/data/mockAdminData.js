// src/data/mockAdminData.js

export const mockAdminStats = {
  totalUsers: 1420,
  activeAccounts: 1850,
  transactionsToday: 342,
  pendingApprovals: 12,
};

export const mockAdminUsers = [
  { 
    id: 'USR-001', 
    name: 'Joshua Smith', 
    email: 'joshua@example.com', 
    role: 'user', 
    status: 'Active', 
    joined: '2025-01-15', 
    balance: 24680.42,
    creditScore: { score: 742, change: 12, lastUpdated: '2026-09-08' }
  },
  { 
    id: 'USR-002', 
    name: 'Sarah Jenkins', 
    email: 'sarah.j@example.com', 
    role: 'user', 
    status: 'Active', 
    joined: '2025-02-03', 
    balance: 8450.00,
    creditScore: { score: 710, change: 5, lastUpdated: '2026-09-05' }
  },
  { 
    id: 'USR-003', 
    name: 'Michael Chen', 
    email: 'm.chen@example.com', 
    role: 'user', 
    status: 'Suspended', 
    joined: '2024-11-20', 
    balance: 120.50,
    creditScore: { score: 580, change: -15, lastUpdated: '2026-09-01' }
  },
  { 
    id: 'USR-004', 
    name: 'Admin User', 
    email: 'admin@example.com', 
    role: 'admin', 
    status: 'Active', 
    joined: '2024-01-01', 
    balance: 0,
    creditScore: { score: 820, change: 0, lastUpdated: '2026-09-01' }
  },
  { 
    id: 'USR-005', 
    name: 'Emily Davis', 
    email: 'emily.d@example.com', 
    role: 'user', 
    status: 'Active', 
    joined: '2026-03-12', 
    balance: 15300.75,
    creditScore: { score: 742, change: 8, lastUpdated: '2026-09-08' }
  },
];

export const mockAdminTransactions = [
  { id: 'TX-1001', user: 'Joshua Smith', description: 'Amazon', date: '2026-09-08', amount: -84.21, status: 'Completed' },
  { id: 'TX-1002', user: 'Sarah Jenkins', description: 'Payroll Deposit', date: '2026-09-07', amount: 3850.00, status: 'Completed' },
  { id: 'TX-1003', user: 'Michael Chen', description: 'Shell', date: '2026-09-06', amount: -52.40, status: 'Flagged' },
  { id: 'TX-1004', user: 'Emily Davis', description: 'Target', date: '2026-09-04', amount: -132.75, status: 'Pending' },
];

export const mockAdminAccounts = [
  { id: 'ACC-001', user: 'Joshua Smith', type: 'Checking', balance: 12840.52, status: 'Active' },
  { id: 'ACC-002', user: 'Joshua Smith', type: 'Savings', balance: 11839.90, status: 'Active' },
  { id: 'ACC-003', user: 'Sarah Jenkins', type: 'Checking', balance: 8450.00, status: 'Active' },
  { id: 'ACC-004', user: 'Michael Chen', type: 'Credit Card', balance: -120.50, status: 'Suspended' },
];

export const mockAdminCards = [
  {
    id: 'CRD-001',
    user: 'Joshua Smith',
    cardName: 'Joshua Platinum Debit',
    type: 'Debit',
    fullNumber: '4532890123454821',
    expiryMonth: '12',
    expiryYear: '2027',
    linkedAccount: 'Checking',
    status: 'Active',
    activity: [
      { id: 'act-1', company: 'Amazon', description: 'Shopping', amount: -500.00, date: '2026-09-04' },
      { id: 'act-2', company: 'Shell', description: 'Gas', amount: -52.40, date: '2026-09-06' },
    ]
  },
  {
    id: 'CRD-002',
    user: 'Joshua Smith',
    cardName: 'Joshua Rewards Credit',
    type: 'Credit',
    fullNumber: '5512987612342208',
    expiryMonth: '05',
    expiryYear: '2028',
    linkedAccount: 'Checking',
    status: 'Active',
    activity: [
      { id: 'act-3', company: 'Target', description: 'Shopping', amount: -132.75, date: '2026-09-04' },
    ]
  },
  {
    id: 'CRD-003',
    user: 'Sarah Jenkins',
    cardName: 'Sarah Everyday Debit',
    type: 'Debit',
    fullNumber: '4021123498769134',
    expiryMonth: '09',
    expiryYear: '2026',
    linkedAccount: 'Savings',
    status: 'Temporary Locked',
    activity: []
  },
  {
    id: 'CRD-004',
    user: 'Emily Davis',
    cardName: 'Emily Student Credit',
    type: 'Credit',
    fullNumber: '6011345678905512',
    expiryMonth: '02',
    expiryYear: '2029',
    linkedAccount: 'Checking',
    status: 'Locked',
    activity: [
      { id: 'act-4', company: 'Uber Eats', description: 'Food & Dining', amount: -32.50, date: '2026-09-09' },
    ]
  },
];

export const mockAdminLoans = [
  {
    id: 'USR-001',
    user: 'Joshua Smith',
    totalLoanBalance: 15000,
    nextPayment: 450.00,
    dueDate: '2026-10-01',
    activeLoans: 1,
    applications: [
      { id: 'APP-1001', type: 'Auto Loan', amount: 15000, date: '2026-08-15', status: 'Active' }
    ]
  },
  {
    id: 'USR-002',
    user: 'Sarah Jenkins',
    totalLoanBalance: 0,
    nextPayment: 0,
    dueDate: '',
    activeLoans: 0,
    applications: [
      { id: 'APP-1002', type: 'Personal Loan', amount: 5000, date: '2026-09-08', status: 'Pending' }
    ]
  },
  {
    id: 'USR-003',
    user: 'Michael Chen',
    totalLoanBalance: 250000,
    nextPayment: 1200.00,
    dueDate: '2026-09-25',
    activeLoans: 1,
    applications: [
      { id: 'APP-1003', type: 'Home Mortgage', amount: 250000, date: '2024-05-10', status: 'Active' },
      { id: 'APP-1004', type: 'Home Equity', amount: 30000, date: '2026-09-09', status: 'Pending' }
    ]
  },
  {
    id: 'USR-004',
    user: 'Emily Davis',
    totalLoanBalance: 0,
    nextPayment: 0,
    dueDate: '',
    activeLoans: 0,
    applications: [
      { id: 'APP-1005', type: 'Student Loan', amount: 20000, date: '2026-07-20', status: 'Rejected' }
    ]
  },
];

export const mockAdminTransfers = [
  { id: 'TRF-2001', user: 'Joshua Smith', from: 'Checking •••• 4821', to: 'Savings •••• 9134', amount: 500.00, date: '2026-09-08', status: 'Completed' },
  { id: 'TRF-2002', user: 'Sarah Jenkins', from: 'Checking •••• 3312', to: 'External Bank •••• 9921', amount: 1200.00, date: '2026-09-08', status: 'Pending' },
  { id: 'TRF-2003', user: 'Michael Chen', from: 'Savings •••• 7710', to: 'Checking •••• 1102', amount: 150.00, date: '2026-09-07', status: 'Failed' },
  { id: 'TRF-2004', user: 'Emily Davis', from: 'Checking •••• 5512', to: 'Savings •••• 4432', amount: 3000.00, date: '2026-09-06', status: 'Completed' },
];

export const mockAdminPayments = [
  {
    id: 'USR-001',
    user: 'Joshua Smith',
    dueSoonAmount: 450.00,
    dueWithinDays: 7,
    scheduledAmount: 1200.00,
    paidThisMonth: 850.00,
    upcomingPayments: [
      { id: 'up-1', name: 'Electric Company', dueDate: '2026-09-12', balance: 124.50, autopay: true },
      { id: 'up-2', name: 'Visa', dueDate: '2026-09-15', balance: 420.00, autopay: true }
    ],
    automaticPayments: [
      { id: 'auto-1', name: 'Netflix', frequency: 'Monthly', balance: 15.99, nextDate: '2026-10-01', autopay: true },
      { id: 'auto-2', name: 'Gym Membership', frequency: 'Monthly', balance: 45.00, nextDate: '2026-09-20', autopay: false }
    ]
  },
  {
    id: 'USR-002',
    user: 'Sarah Jenkins',
    dueSoonAmount: 120.00,
    dueWithinDays: 14,
    scheduledAmount: 500.00,
    paidThisMonth: 1500.00,
    upcomingPayments: [
      { id: 'up-3', name: 'Water & Sewer', dueDate: '2026-09-20', balance: 85.20, autopay: false }
    ],
    automaticPayments: [
      { id: 'auto-3', name: 'Spotify', frequency: 'Monthly', balance: 9.99, nextDate: '2026-09-25', autopay: true }
    ]
  },
  {
    id: 'USR-003',
    user: 'Michael Chen',
    dueSoonAmount: 2000.00,
    dueWithinDays: 3,
    scheduledAmount: 300.00,
    paidThisMonth: 0,
    upcomingPayments: [],
    automaticPayments: []
  }
];

export const mockAdminDeposits = [
  { id: 'DEP-4001', user: 'Joshua Smith', amount: 1500.00, method: 'Cheque', date: '2026-09-08', status: 'Pending' },
  { id: 'DEP-4002', user: 'Sarah Jenkins', amount: 250.00, method: 'Direct Deposit', date: '2026-09-07', status: 'Completed' },
  { id: 'DEP-4003', user: 'Michael Chen', amount: 5000.00, method: 'Cheque', date: '2026-09-07', status: 'Rejected' },
  { id: 'DEP-4004', user: 'Emily Davis', amount: 100.00, method: 'ATM Deposit', date: '2026-09-06', status: 'Completed' },
  { id: 'DEP-4005', user: 'Joshua Smith', amount: 750.00, method: 'Cheque', date: '2026-09-09', status: 'Pending' },
];

export const mockAdminStatements = [
  { id: 'STM-5001', user: 'Joshua Smith', period: '2026-08', generated: '2026-09-01', fileName: 'Joshua_Smith_2026_08.pdf', status: 'Available' },
  { id: 'STM-5002', user: 'Sarah Jenkins', period: '2026-08', generated: '2026-09-01', fileName: 'Sarah_Jenkins_2026_08.pdf', status: 'Available' },
  { id: 'STM-5003', user: 'Michael Chen', period: '2026-07', generated: '2026-08-01', fileName: 'Michael_Chen_2026_07.pdf', status: 'Archived' },
  { id: 'STM-5004', user: 'Emily Davis', period: '2026-08', generated: '2026-09-01', fileName: 'Emily_Davis_2026_08.pdf', status: 'Available' },
];

export const mockAdminGoals = [
  {
    id: 'USR-001',
    user: 'Joshua Smith',
    totalSavedBalance: 10500,
    activeGoals: 2,
    onTrack: 1,
    upcomingTargetDate: '2026-12-31',
    goals: [
      { id: 'GOL-001', name: 'Emergency Fund', target: 10000, current: 8400, status: 'Active' },
      { id: 'GOL-002', name: 'Vacation', target: 3500, current: 2100, status: 'Active' }
    ]
  },
  {
    id: 'USR-002',
    user: 'Sarah Jenkins',
    totalSavedBalance: 25000,
    activeGoals: 1,
    onTrack: 1,
    upcomingTargetDate: '2027-06-15',
    goals: [
      { id: 'GOL-003', name: 'New Car', target: 25000, current: 25000, status: 'Completed' }
    ]
  },
  {
    id: 'USR-003',
    user: 'Michael Chen',
    totalSavedBalance: 12000,
    activeGoals: 1,
    onTrack: 0,
    upcomingTargetDate: '2028-01-01',
    goals: [
      { id: 'GOL-004', name: 'Home Down Payment', target: 50000, current: 12000, status: 'Paused' }
    ]
  }
];

export const mockAdminNotifications = [
  {
    id: 'USR-001',
    user: 'Joshua Smith',
    notifications: [
      { 
        id: 'NOT-001', 
        category: 'Account', 
        type: 'New Device Signed In', 
        date: '2026-09-08', 
        priority: 'Important', 
        message: 'A new device signed into your account from Chrome on Windows in New York, NY.' 
      },
      { 
        id: 'NOT-002', 
        category: 'Transaction', 
        type: 'Large Transaction Alert', 
        date: '2026-09-06', 
        priority: 'Important', 
        message: 'A transaction of $500.00 was made at Amazon using your Rewards Credit card.' 
      },
      { 
        id: 'NOT-003', 
        category: 'Promotions', 
        type: 'New Feature', 
        date: '2026-09-01', 
        priority: 'Normal', 
        message: 'Check out our new savings goals feature in the app!' 
      }
    ]
  },
  {
    id: 'USR-002',
    user: 'Sarah Jenkins',
    notifications: [
      { 
        id: 'NOT-004', 
        category: 'Transaction', 
        type: 'Credit Alert', 
        date: '2026-09-07', 
        priority: 'Normal', 
        message: 'Your paycheck of $3,850.00 has been deposited into your Checking account.' 
      }
    ]
  },
  {
    id: 'USR-003',
    user: 'Michael Chen',
    notifications: [],
  }
];

export const mockAdminSystemSettings = {
  maintenanceMode: false,
  allowNewRegistrations: true,
  enableTransfers: true,
  enableDeposits: true,
  enableLoans: true,
  enableInternationalTransfers: false,
};