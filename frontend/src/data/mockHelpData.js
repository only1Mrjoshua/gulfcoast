// src/data/mockHelpData.js

export const mockHelpTopics = [
  {
    id: 'accounts',
    title: 'Accounts',
    description: 'Manage balances, account details, and account access.',
    icon: '💰',
  },
  {
    id: 'transfers',
    title: 'Transfers',
    description: 'Learn about transferring money between accounts.',
    icon: '↔️',
  },
  {
    id: 'payments',
    title: 'Payments',
    description: 'Get help with bills and scheduled payments.',
    icon: '💳',
  },
  {
    id: 'cards',
    title: 'Cards',
    description: 'Manage cards, locks, replacements, and transactions.',
    icon: '💳',
  },
  {
    id: 'deposits',
    title: 'Deposits',
    description: 'Learn about check deposits and deposit availability.',
    icon: '📥',
  },
  {
    id: 'statements',
    title: 'Statements',
    description: 'Find and download account statements.',
    icon: '📄',
  },
  {
    id: 'loans',
    title: 'Loans',
    description: 'Manage loan payments and loan information.',
    icon: '🏦',
  },
  {
    id: 'security',
    title: 'Security',
    description: 'Protect your account and personal information.',
    icon: '🔒',
  },
];

export const mockHelpFAQs = [
  {
    id: 1,
    question: 'How do I reset my password?',
    answer: 'To reset your password, go to the login page and click "Forgot Password". Follow the instructions sent to your registered email address. If you need further assistance, contact our support team.',
  },
  {
    id: 2,
    question: 'How do I lock my card?',
    answer: 'To lock your card, go to the Cards page, select the card you wish to lock, and click "Lock Card". This temporarily prevents new purchases while keeping your account active.',
  },
  {
    id: 3,
    question: 'How do I transfer money?',
    answer: 'To transfer money, go to the Transfers page. Select the source account, the destination account, enter the amount and date, and confirm the transfer. You can also schedule recurring transfers.',
  },
  {
    id: 4,
    question: 'How do I deposit a check?',
    answer: 'To deposit a check, go to the Deposits page and select "Deposit a Check". Follow the instructions to capture images of the front and back of the endorsed check, enter the amount, and submit.',
  },
  {
    id: 5,
    question: 'Where can I find my statements?',
    answer: 'Your statements are available in the Statements page. You can view, download, and manage your account statements for all eligible accounts.',
  },
  {
    id: 6,
    question: 'How do I update my contact information?',
    answer: 'To update your contact information, go to the Settings page and navigate to Personal Information. You can edit your email address, phone number, and mailing address there.',
  },
  {
    id: 7,
    question: 'How do I report a suspicious transaction?',
    answer: 'If you notice a transaction you do not recognize, go to the Transactions page, locate the transaction, and select "Report a Problem". You can also contact us immediately through Secure Message or by phone.',
  },
];

export const mockSupportChannels = [
  { label: 'Secure Message', description: 'Send a private message to the bank.', icon: '💬', action: 'messages' },
  { label: 'Call Us', description: 'Contact customer support.', icon: '📞', action: 'call' },
  { label: 'Find a Branch', description: 'Locate a nearby branch.', icon: '🏛️', action: 'branch' },
  { label: 'Find an ATM', description: 'Find an available ATM.', icon: '🏧', action: 'atm' },
];

export const mockSecurityResources = [
  { label: 'Protect Your Account', icon: '🛡️' },
  { label: 'Report Suspicious Activity', icon: '🚨' },
  { label: 'Lost or Stolen Card', icon: '💳' },
  { label: 'Password & Sign-In Help', icon: '🔑' },
  { label: 'Security Alerts', icon: '🔔' },
];