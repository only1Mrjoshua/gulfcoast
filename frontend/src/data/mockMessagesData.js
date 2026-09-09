// src/data/mockMessagesData.js

export const mockMessages = [
  {
    id: 1,
    sender: 'Gulf Coast Bank & Trust',
    subject: 'Your statement is now available',
    preview: 'Your August checking statement is ready to view.',
    date: '2026-09-01',
    category: 'Account',
    read: false,
    isBank: true,
    fullMessage: `Dear Customer,

Your August 2026 checking account statement is now available. You can view and download it securely in the Statements section of your dashboard.

If you have any questions, please reply to this message.

Thank you for banking with Gulf Coast Bank & Trust.`,
    priority: 'normal',
    attachments: [],
  },
  {
    id: 2,
    sender: 'Gulf Coast Bank & Trust',
    subject: 'Security Alert – New Login Detected',
    preview: 'We noticed a new login to your account from an unrecognized device.',
    date: '2026-09-05',
    category: 'Security',
    read: false,
    isBank: true,
    fullMessage: `Security Alert

We detected a new login to your online banking account from a device we don't recognize.

Time: September 5, 2026 at 8:14 PM
Device: iPhone 15 Pro
Location: Houston, TX

If this was you, no action is needed. If you don't recognize this activity, please reply to this message or call us immediately.

Your security is our priority.`,
    priority: 'high',
    attachments: [],
  },
  {
    id: 3,
    sender: 'Gulf Coast Bank & Trust',
    subject: 'Payment Reminder – Credit Card Due',
    preview: 'Your Visa credit card payment is due in 5 days.',
    date: '2026-09-06',
    category: 'Payments',
    read: false,
    isBank: true,
    fullMessage: `Payment Reminder

Your Visa credit card statement is due in 5 days.

Statement Balance: $420.00
Minimum Payment: $45.00
Due Date: September 15, 2026

Please ensure your payment is scheduled to avoid late fees.

You can make a payment from your dashboard or reply to this message if you need assistance.`,
    priority: 'normal',
    attachments: [],
  },
  {
    id: 4,
    sender: 'Gulf Coast Bank & Trust',
    subject: 'Privacy Policy Update',
    preview: 'We have updated our Privacy Policy effective October 1, 2026.',
    date: '2026-08-28',
    category: 'General',
    read: true,
    isBank: true,
    fullMessage: `Privacy Policy Update

We are committed to protecting your privacy and have updated our Privacy Policy effective October 1, 2026.

Key changes:
- Improved data protection measures
- Clearer explanation of how we use your information
- Enhanced options for controlling your data preferences

You can view the full policy in the Security section of our website.

Thank you for trusting Gulf Coast Bank & Trust.`,
    priority: 'normal',
    attachments: [],
  },
  {
    id: 5,
    sender: 'Gulf Coast Bank & Trust',
    subject: 'Loan Payment Confirmation',
    preview: 'Your auto loan payment of $485.00 was received on September 1, 2026.',
    date: '2026-09-01',
    category: 'Loans',
    read: true,
    isBank: true,
    fullMessage: `Payment Confirmation

Your auto loan payment has been received.

Loan: Auto Loan •••• 3812
Amount: $485.00
Date: September 1, 2026
Status: Completed

Your current loan balance is $18,450.00.

Thank you for your payment.`,
    priority: 'normal',
    attachments: [],
  },
  {
    id: 6,
    sender: 'Gulf Coast Bank & Trust',
    subject: 'Card Transaction Alert – Large Purchase',
    preview: 'We noticed a large transaction of $1,240.00 on your Rewards Visa card.',
    date: '2026-09-03',
    category: 'Cards',
    read: true,
    isBank: true,
    fullMessage: `Card Transaction Alert

We detected a transaction that may be unusual for your spending patterns.

Card: Rewards Visa •••• 2208
Amount: $1,240.00
Merchant: Best Buy
Date: September 3, 2026

If this was you, no action is required. If you did not authorize this transaction, please reply to this message immediately to lock your card and report fraud.

We're here to help.`,
    priority: 'high',
    attachments: [],
  },
  {
    id: 7,
    sender: 'Joshua Sorochi (You)',
    subject: 'Question about direct deposit',
    preview: 'I need to update my direct deposit information for payroll.',
    date: '2026-08-25',
    category: 'General',
    read: true,
    isBank: false,
    fullMessage: `I need to update my direct deposit information for payroll. Can you please provide the routing and account numbers for my checking account?`,
    priority: 'normal',
    attachments: [],
  },
  {
    id: 8,
    sender: 'Gulf Coast Bank & Trust',
    subject: 'Re: Question about direct deposit',
    preview: 'Thank you for your message. Here are the details you requested.',
    date: '2026-08-26',
    category: 'General',
    read: true,
    isBank: true,
    fullMessage: `Dear Joshua,

Thank you for contacting us. Your direct deposit details for your Primary Checking account are as follows:

Account: Primary Checking •••• 4821
Routing Number: 123456789
Account Number: 1002345678

You can also find this information in the Account Details section of your online banking.

Please let us know if you need further assistance.

Sincerely,
Gulf Coast Bank & Trust Support Team`,
    priority: 'normal',
    attachments: [],
  },
  {
    id: 9,
    sender: 'Joshua Sorochi (You)',
    subject: 'Dispute a transaction',
    preview: 'I need to dispute a charge on my card.',
    date: '2026-08-20',
    category: 'Security',
    read: true,
    isBank: false,
    fullMessage: `I noticed a transaction on my Visa card that I don't recognize.

Transaction: $84.21 at Amazon
Date: August 15, 2026

Please investigate this charge. I did not authorize it.`,
    priority: 'high',
    attachments: [],
  },
];

export const mockMessageCategories = [
  'All Messages',
  'Unread',
  'Account',
  'Payments',
  'Cards',
  'Loans',
  'Security',
  'General',
];

export const mockMessageTopics = [
  'Account Question',
  'Transaction Question',
  'Card Support',
  'Loan Support',
  'Payment Support',
  'Technical Support',
  'General Question',
];

export const mockSupportOptions = [
  { label: 'Contact Support', icon: '📞' },
  { label: 'Help Center', icon: '📚' },
  { label: 'Find a Branch or ATM', icon: '📍' },
];