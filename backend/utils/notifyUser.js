// utils/notifyUser.js
import Notification from '../models/Notification.js';
import User from '../models/User.js';

/**
 * CARD and LOAN subcategories — used by the admin form and the
 * preferences resolver. Keep these in sync with the frontend.
 */
export const CARD_SUBCATEGORIES = {
  largePurchase:            'Large Purchase',
  cardTransaction:          'Card Transaction',
  internationalTransaction: 'International Transaction',
  onlinePurchase:           'Online Purchase',
  atmWithdrawal:            'ATM Withdrawal',
  paymentDue:               'Payment Due',
  cardExpiration:           'Card Expiration',
};

export const LOAN_SUBCATEGORIES = {
  paymentReminder:    'Payment Reminder',
  dueDateAlert:       'Due Date Alert',
  interestRateChange: 'Interest Rate Change',
  payoffNotification: 'Payoff Notification',
};

const BASIC_CATEGORY_KEYS = {
  Account:     'account',
  Transaction: 'transaction',
  Promotions:  'promotions',
  Security:    'security',
  Deposit:     'deposit',
  Transfer:    'transfer',
  Payment:     'payment',
};

/**
 * Returns true if a notification should be visible to the user.
 */
export const shouldShowNotification = (notification, user) => {
  if (!notification || !user) return false;

  const { category, subCategory } = notification;

  if (category === 'Card') {
    const prefs = user.cardAlertPreferences || {};
    return prefs[subCategory] !== false;
  }
  if (category === 'Loan') {
    const prefs = user.loanAlertPreferences || {};
    return prefs[subCategory] !== false;
  }

  const key = BASIC_CATEGORY_KEYS[category];
  if (!key) return true; // unknown category — don't hide

  const prefs = user.notificationPreferences || {};
  return prefs[key] !== false;
};

/**
 * Builds a full preferences object for the frontend.
 */
export const buildFullPreferences = (user) => {
  const np = user?.notificationPreferences || {};
  const cp = user?.cardAlertPreferences || {};
  const lp = user?.loanAlertPreferences || {};

  const card = {};
  for (const key of Object.keys(CARD_SUBCATEGORIES)) {
    card[key] = cp[key] !== false;
  }
  const loan = {};
  for (const key of Object.keys(LOAN_SUBCATEGORIES)) {
    loan[key] = lp[key] !== false;
  }

  return {
    account:     np.account !== false,
    transaction: np.transaction !== false,
    promotions:  np.promotions !== false,
    security:    np.security !== false,
    deposit:     np.deposit !== false,
    transfer:    np.transfer !== false,
    payment:     np.payment !== false,
    card,
    loan,
  };
};

/**
 * Creates a notification. Does NOT check preferences — filtering
 * happens at read time so the user sees past ones after re-enabling.
 */
export const notifyUser = async ({
  userId,
  category,
  subCategory = null,
  title,
  message,
  date = null,
  priority = 'Normal',
  sentBy = null,
}) => {
  if (!userId || !category || !title || !message) {
    console.warn('notifyUser: missing required fields', {
      userId,
      category,
      title,
      message,
    });
    return null;
  }

  return Notification.create({
    userId,
    category,
    subCategory,
    title,
    message,
    date: date ? new Date(date) : new Date(),
    priority,
    read: false,
    sentBy,
  });
};