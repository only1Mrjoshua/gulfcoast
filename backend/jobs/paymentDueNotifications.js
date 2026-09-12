// jobs/paymentDueNotifications.js
import Payment from '../models/Payment.js';
import { notifyUser } from '../utils/notifyUser.js';

const RUN_INTERVAL_MS = 24 * 60 * 60 * 1000; // once per day
const RUN_ON_START = true;

const formatUSD = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(n ?? 0);

/**
 * Scans for payments whose due date has passed and that still have
 * status 'Scheduled' or 'Pending'. Sends one notification per payment
 * per day, tracked via `lastDueReminderAt` on the Payment document.
 */
export const runPaymentDueNotifications = async () => {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const overdue = await Payment.find({
      date: { $lt: now },
      status: { $in: ['Scheduled', 'Pending'] },
      $or: [
        { lastDueReminderAt: null },
        { lastDueReminderAt: { $lt: oneDayAgo } },
      ],
    }).lean();

    let sent = 0;

    for (const payment of overdue) {
      try {
        await notifyUser({
          userId: payment.userId,
          category: 'Payment',
          title: 'Payment Overdue',
          message:
            `Your payment of ${formatUSD(payment.amount)} to ` +
            `${payment.payeeName || 'your payee'} was due on ` +
            `${new Date(payment.date).toLocaleDateString('en-US')}. ` +
            `Please make your payment as soon as possible.`,
          priority: 'Important',
        });

        await Payment.updateOne(
          { _id: payment._id },
          { $set: { lastDueReminderAt: new Date() } }
        );
        sent += 1;
      } catch (err) {
        console.error(
          `Payment reminder failed for ${payment._id}:`,
          err.message
        );
      }
    }

    if (sent > 0) {
      console.log(`🔔 Sent ${sent} payment reminder notification(s)`);
    }
  } catch (err) {
    console.error('❌ runPaymentDueNotifications:', err);
  }
};

let intervalHandle = null;

export const startPaymentDueJob = () => {
  if (intervalHandle) return;
  if (RUN_ON_START) {
    runPaymentDueNotifications().catch((err) =>
      console.error('Startup payment reminder run failed:', err)
    );
  }
  intervalHandle = setInterval(runPaymentDueNotifications, RUN_INTERVAL_MS);
  console.log('🔔 Payment due notification job started');
};

export const stopPaymentDueJob = () => {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
};