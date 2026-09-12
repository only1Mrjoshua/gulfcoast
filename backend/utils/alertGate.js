// utils/alertGate.js
import User from '../models/User.js';

// Maps a notification's `type` (from the admin form) to the user's alert preference key
const ALERT_TYPE_TO_PREF = {
  'Low Balance Alert':                    'lowBalance',
  'Large Transaction Alert':              'largeTransaction',
  'Deposit Notification':                 'deposit',
  'Payment Reminder':                     'paymentReminder',
  'Monthly Statement Notification':       'monthlyStatement',
  // Aliases the admin might type — normalized to the same preference
  'Deposit':                              'deposit',
  'Payment Reminder Alert':               'paymentReminder',
  'Monthly Statement':                    'monthlyStatement',
};

/**
 * Checks whether a user has the relevant alert enabled.
 * Returns true if the notification should be delivered.
 * Returns true if the notification type isn't a gated alert (e.g. Promotions).
 */
export async function shouldDeliverAlert(userId, notificationType) {
  const prefKey = ALERT_TYPE_TO_PREF[notificationType];
  if (!prefKey) {
    // Not an alert type we gate (e.g. "New Feature" promotion) → always deliver
    return true;
  }

  const user = await User.findById(userId).select('alertPreferences');
  if (!user) return false;

  // Default to true if somehow missing
  return user.alertPreferences?.[prefKey] !== false;
}