// src/data/mockSettingsData.js

export const mockUserProfile = {
  fullName: 'Joshua Sorochi',
  email: 'joshua.sorochi@email.com',
  phone: '(555) 123-4567',
  mailingAddress: '123 Main Street, Houston, TX 77001',
  dateOfBirth: '1985-06-15',
};

export const mockSecuritySettings = {
  twoStepVerification: true,
  trustedDevices: [
    { name: 'iPhone 15 Pro', lastUsed: '2026-09-08', current: true },
    { name: 'MacBook Pro', lastUsed: '2026-09-05', current: false },
    { name: 'iPad Air', lastUsed: '2026-08-20', current: false },
  ],
  recentSignIns: [
    { date: '2026-09-08 19:45', location: 'Houston, TX', device: 'iPhone 15 Pro' },
    { date: '2026-09-07 09:12', location: 'Houston, TX', device: 'MacBook Pro' },
    { date: '2026-09-05 14:30', location: 'Houston, TX', device: 'Chrome on Windows' },
  ],
};

export const mockNotificationSettings = {
  accountAlerts: {
    lowBalance: true,
    largeTransaction: true,
    depositReceived: true,
    paymentDue: true,
  },
  cardAlerts: {
    cardTransaction: true,
    onlinePurchase: true,
    internationalPurchase: false,
    atmWithdrawal: true,
  },
  securityAlerts: {
    newSignIn: true,
    passwordChange: true,
    profileChange: true,
    suspiciousActivity: true,
  },
  channels: {
    email: true,
    text: false,
    push: true,
  },
};

export const mockCommunicationPreferences = {
  marketing: false,
  productUpdates: true,
  educational: true,
  general: true,
};

export const mockPaperlessStatus = {
  enrolled: true,
};

export const mockAccountPreferences = {
  defaultAccount: 'Primary Checking •••• 4821',
  defaultTransferAccount: 'Primary Checking •••• 4821',
  defaultPaymentAccount: 'Primary Checking •••• 4821',
  dateFormat: 'MM/DD/YYYY',
};

export const mockLinkedAccounts = [
  { institution: 'External Bank', account: '•••• 5572', status: 'Active' },
];