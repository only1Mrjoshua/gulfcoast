// src/data/mockLoansData.js

// Empty loans array - user has no loans (debt-free!)
export const mockLoans = [];

export const mockLoanPayments = [];

export const mockLoanDocuments = [];

export const mockLoanAlerts = [
  { id: 1, type: 'Payment Due Soon', active: false },
  { id: 2, type: 'Payment Received', active: false },
  { id: 3, type: 'Payment Overdue', active: false },
  { id: 4, type: 'Autopay Failed', active: false },
  { id: 5, type: 'Loan Document Available', active: false },
];

export const exploreLoanOptions = [
  { id: 1, name: 'Auto Loans', description: 'Finance a new or used vehicle.', icon: '🚗' },
  { id: 2, name: 'Personal Loans', description: 'Borrow for eligible personal expenses.', icon: '💳' },
  { id: 3, name: 'Home Loans', description: 'Explore available home financing options.', icon: '🏠' },
  { id: 4, name: 'Student Loans', description: 'Financing for educational expenses.', icon: '🎓' },
];