// controllers/adminCardsController.js
import mongoose from 'mongoose';
import Card from '../models/Card.js';
import User from '../models/User.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';

// ── Helpers ──
const accountLabel = (acc) => {
  if (!acc) return '';
  const base = acc.subType ? `${acc.subType} ${acc.type}` : acc.type;
  const last4 = acc.accountNumber ? acc.accountNumber.slice(-4) : '';
  return last4 ? `${base} •••• ${last4}` : base;
};

const formatCard = (c, user) => {
  const u = user || c.userId;
  return {
    id: c._id,
    userId: u?._id || c.userId,
    user: u && u.firstName ? `${u.firstName} ${u.lastName}`.trim() : '—',
    userEmail: u?.email || '',
    cardName: c.cardName,
    type: c.type,
    fullNumber: c.fullNumber,
    lastFour: c.fullNumber ? c.fullNumber.slice(-4) : '',
    cvv: c.cvv || '',
    expiryMonth: c.expiryMonth,
    expiryYear: c.expiryYear,
    linkedAccountId: c.linkedAccountId,
    linkedAccount: c.linkedAccountLabel || c.linkedAccountType || '',
    linkedAccountType: c.linkedAccountType || '',
    status: c.status,
    controls: c.controls,
    balance: c.balance ?? 0,
    availableCredit: c.availableCredit ?? 0,
    creditLimit: c.creditLimit ?? 0,
    minimumPayment: c.minimumPayment ?? 0,
    paymentDueDate: c.paymentDueDate,
    nextStatementDate: c.nextStatementDate,
    activity: (c.activity || []).map((a) => ({
      id: a._id,
      company: a.company || '',
      description: a.description || '',
      amount: a.amount || 0,
      date: a.date,
      transactionId: a.transactionId || null,
    })),
    createdAt: c.createdAt,
  };
};

// Build a Transaction payload from a card activity
const buildTransactionFromActivity = (card, activity) => {
  const isNegative = (activity.amount || 0) < 0;
  const parts = [activity.company, activity.description].filter(Boolean);
  const description = parts.length > 0 ? parts.join(' - ') : 'Card Activity';
  const last4 = card.fullNumber ? card.fullNumber.slice(-4) : '••••';

  return {
    userId: card.userId,
    accountId: card.linkedAccountId,
    description,
    amount: activity.amount,
    type: isNegative ? 'purchase' : 'credit',
    status: 'Completed',
    date: activity.date || new Date(),
    category: activity.description || 'Card Activity',
    merchant: activity.company || '',
    paymentMethod: `${card.type} Card •••• ${last4}`,
  };
};

// Sync a card's activities with the Transaction collection.
// - Creates Transactions for new activities (no transactionId)
// - Updates Transactions for existing activities (has transactionId)
const syncCardTransactions = async (card) => {
  if (!card.linkedAccountId) return; // can't create Transactions without an account

  for (const activity of card.activity) {
    const txData = buildTransactionFromActivity(card, activity);
    if (activity.transactionId) {
      await Transaction.findByIdAndUpdate(activity.transactionId, txData);
    } else {
      const tx = await Transaction.create(txData);
      activity.transactionId = tx._id;
    }
  }
  await card.save();
};

// ================================================================
// GET /api/admin/cards
// ================================================================
export const adminListCards = async (req, res) => {
  try {
    const cards = await Card.find({})
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      cards: cards.map((c) => formatCard(c, c.userId)),
    });
  } catch (err) {
    console.error('❌ adminListCards:', err);
    res.status(500).json({ error: 'Failed to load cards' });
  }
};

// ================================================================
// GET /api/admin/cards/users
// ================================================================
export const adminListCardUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('firstName lastName email username')
      .sort({ firstName: 1 })
      .lean();

    res.json({
      users: users.map((u) => ({
        id: u._id,
        name: `${u.firstName} ${u.lastName}`.trim(),
        email: u.email,
        username: u.username,
      })),
    });
  } catch (err) {
    console.error('❌ adminListCardUsers:', err);
    res.status(500).json({ error: 'Failed to load users' });
  }
};

// ================================================================
// GET /api/admin/cards/users/:userId/accounts
// ================================================================
export const adminGetUserAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({
      userId: req.params.userId,
      status: { $ne: 'Closed' },
      type: { $in: ['Checking', 'Savings'] },
    })
      .sort({ isPrimary: -1, createdAt: 1 })
      .lean();

    res.json({
      accounts: accounts.map((acc) => ({
        id: acc._id,
        label: accountLabel(acc),
        type: acc.type,
        subType: acc.subType || null,
        lastFour: acc.accountNumber ? acc.accountNumber.slice(-4) : '',
      })),
    });
  } catch (err) {
    console.error('❌ adminGetUserAccounts:', err);
    res.status(500).json({ error: 'Failed to load accounts' });
  }
};

// ================================================================
// POST /api/admin/cards
// ================================================================
export const adminCreateCard = async (req, res) => {
  try {
    const {
      userId,
      cardName,
      type,
      linkedAccountId,
      fullNumber,
      cvv = '',
      expiryMonth,
      expiryYear,
      cardholderName = '',
      status = 'Active',
      activity = [],
    } = req.body;

    if (!userId)      return res.status(400).json({ error: 'User is required' });
    if (!cardName)    return res.status(400).json({ error: 'Card name is required' });
    if (!type)        return res.status(400).json({ error: 'Card type is required' });
    if (!fullNumber)  return res.status(400).json({ error: 'Card number is required' });
    if (!expiryMonth) return res.status(400).json({ error: 'Expiry month is required' });
    if (!expiryYear)  return res.status(400).json({ error: 'Expiry year is required' });

    let account = null;
    if (linkedAccountId) {
      account = await Account.findOne({ _id: linkedAccountId, userId }).lean();
      if (!account) return res.status(404).json({ error: 'Linked account not found' });
    }

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const card = await Card.create({
      userId,
      cardName,
      type,
      fullNumber: String(fullNumber).replace(/\D/g, ''),
      cvv,
      expiryMonth,
      expiryYear,
      cardholderName: cardholderName || `${user.firstName} ${user.lastName}`.trim(),
      linkedAccountId: account?._id || null,
      linkedAccountType: account?.type || null,
      linkedAccountLabel: account ? accountLabel(account) : '',
      status,
      activity: (activity || []).map((a) => ({
        company: a.company || '',
        description: a.description || '',
        amount: parseFloat(a.amount) || 0,
        date: a.date ? new Date(a.date) : new Date(),
      })),
    });

    // Create matching Transactions for every activity that has an account
    await syncCardTransactions(card);

    const populated = await Card.findById(card._id)
      .populate('userId', 'firstName lastName email')
      .lean();

    res.status(201).json({
      message: 'Card created',
      card: formatCard(populated, populated.userId),
    });
  } catch (err) {
    console.error('❌ adminCreateCard:', err);
    res.status(500).json({ error: 'Failed to create card' });
  }
};

// ================================================================
// PUT /api/admin/cards/:id
// ================================================================
export const adminUpdateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const card = await Card.findById(id);
    if (!card) return res.status(404).json({ error: 'Card not found' });

    // Map of existing activity _id → transactionId (before we replace the array)
    const oldActivityTxMap = new Map(
      card.activity.map((a) => [
        String(a._id),
        a.transactionId ? String(a.transactionId) : null,
      ])
    );

    // ── Scalar fields ──
    if (typeof body.cardName === 'string')       card.cardName = body.cardName;
    if (typeof body.type === 'string')           card.type = body.type;
    if (typeof body.status === 'string') {
    card.status = body.status;
    // Keep controls.locked in sync with status so the user side reads the right value
    if (body.status === 'Locked') {
        card.controls.locked = true;
    } else if (body.status === 'Active' || body.status === 'Temporary Locked') {
        card.controls.locked = false;
    }
    }
    if (typeof body.cvv === 'string')            card.cvv = body.cvv;
    if (typeof body.expiryMonth === 'string')    card.expiryMonth = body.expiryMonth;
    if (typeof body.expiryYear === 'string')     card.expiryYear = body.expiryYear;
    if (typeof body.cardholderName === 'string') card.cardholderName = body.cardholderName;
    if (typeof body.fullNumber === 'string') {
      card.fullNumber = body.fullNumber.replace(/\D/g, '');
    }

    // ── Linked account ──
    if (body.linkedAccountId !== undefined) {
      if (!body.linkedAccountId) {
        card.linkedAccountId = null;
        card.linkedAccountType = null;
        card.linkedAccountLabel = '';
      } else {
        const acc = await Account.findOne({
          _id: body.linkedAccountId,
          userId: card.userId,
        }).lean();
        if (!acc) return res.status(404).json({ error: 'Linked account not found' });
        card.linkedAccountId = acc._id;
        card.linkedAccountType = acc.type;
        card.linkedAccountLabel = accountLabel(acc);
      }
    }

    // ── Activity sync ──
    if (Array.isArray(body.activity)) {
      const keptIds = new Set();
      const newActivities = [];

      for (const a of body.activity) {
        const incomingId =
          a.id && mongoose.Types.ObjectId.isValid(a.id) ? String(a.id) : null;
        const existingTxId = incomingId ? oldActivityTxMap.get(incomingId) : null;

        const actObj = {
          company: a.company || '',
          description: a.description || '',
          amount: parseFloat(a.amount) || 0,
          date: a.date ? new Date(a.date) : new Date(),
          transactionId: existingTxId || null,
        };
        if (incomingId) {
          actObj._id = incomingId;
          keptIds.add(incomingId);
        }
        newActivities.push(actObj);
      }

      // Delete Transactions for activities that were removed
      for (const [actId, txId] of oldActivityTxMap) {
        if (!keptIds.has(actId) && txId) {
          await Transaction.findByIdAndDelete(txId);
        }
      }

      card.activity = newActivities;
    }

    // ── Controls (optional) ──
    if (body.controls && typeof body.controls === 'object') {
      const ALLOWED = [
        'locked',
        'contactless',
        'onlinePurchases',
        'internationalPurchases',
        'atmWithdrawals',
        'notifications',
      ];
      for (const k of ALLOWED) {
        if (typeof body.controls[k] === 'boolean') {
          card.controls[k] = body.controls[k];
        }
      }
    }

    await card.save();

    // Create new Transactions + update existing ones
    await syncCardTransactions(card);

    const populated = await Card.findById(card._id)
      .populate('userId', 'firstName lastName email')
      .lean();

    res.json({
      message: 'Card updated',
      card: formatCard(populated, populated.userId),
    });
  } catch (err) {
    console.error('❌ adminUpdateCard:', err);
    res.status(500).json({ error: 'Failed to update card' });
  }
};

// ================================================================
// DELETE /api/admin/cards/:id
// Also deletes every Transaction linked to the card's activities.
// ================================================================
export const adminDeleteCard = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).json({ error: 'Card not found' });

    // Collect all linked Transaction IDs
    const txIds = card.activity
      .map((a) => a.transactionId)
      .filter(Boolean);

    if (txIds.length > 0) {
      await Transaction.deleteMany({ _id: { $in: txIds } });
    }

    await Card.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Card and related transactions deleted',
      deletedTransactions: txIds.length,
    });
  } catch (err) {
    console.error('❌ adminDeleteCard:', err);
    res.status(500).json({ error: 'Failed to delete card' });
  }
};