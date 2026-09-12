// controllers/cardsController.js
import Card from '../models/Card.js';
import User from '../models/User.js';

// ── Helpers ──
const maskNumber = (num) => {
  if (!num) return '••••';
  return `•••• ${num.slice(-4)}`;
};

const getCardStatus = (card) => {
  // If controls.locked is on, status reflects that
  if (card.controls?.locked) return 'Locked';
  return card.status;
};

const formatCardForList = (card, user) => {
  const exp = card.expiryMonth && card.expiryYear
    ? `${card.expiryMonth}/${card.expiryYear.slice(-2)}`
    : '';

  return {
    id: card._id,
    name: card.cardName,
    type: card.type,
    lastFour: card.fullNumber ? card.fullNumber.slice(-4) : '',
    maskedNumber: maskNumber(card.fullNumber),
    cardholderName: card.cardholderName || (user ? `${user.firstName} ${user.lastName}`.trim() : ''),
    expirationDate: `${card.expiryYear}-${card.expiryMonth}`,
    expirationLabel: exp,
    status: getCardStatus(card),
    linkedAccount: card.linkedAccountLabel || card.linkedAccountType || '—',
    linkedAccountId: card.linkedAccountId || null,
    balance: card.balance ?? 0,
    availableCredit: card.availableCredit ?? 0,
    creditLimit: card.creditLimit ?? 0,
    minimumPayment: card.minimumPayment ?? 0,
    paymentDueDate: card.paymentDueDate,
    nextStatementDate: card.nextStatementDate,
    controls: {
      locked:                 card.controls?.locked ?? false,
      contactless:            card.controls?.contactless ?? true,
      onlinePurchases:        card.controls?.onlinePurchases ?? true,
      internationalPurchases: card.controls?.internationalPurchases ?? true,
      atmWithdrawals:         card.controls?.atmWithdrawals ?? true,
      notifications:          card.controls?.notifications ?? true,
    },
  };
};

const formatActivity = (a) => ({
  id: a._id,
  company: a.company || '',
  merchant: a.company || '',
  description: a.description || '',
  category: a.description || 'Card Activity',
  amount: a.amount || 0,
  date: a.date,
  status: 'Completed',
});

// ================================================================
// GET /api/cards  — full overview for the user's Cards page
// ================================================================
export const getCards = async (req, res) => {
  try {
    const userId = req.user._id;

    const [user, cards] = await Promise.all([
      User.findById(userId).select('firstName lastName cardAlertPreferences').lean(),
      Card.find({ userId }).sort({ createdAt: -1 }).lean(),
    ]);

    // Overview stats
    const now = new Date();
    const ninetyDays = new Date();
    ninetyDays.setDate(ninetyDays.getDate() + 90);

    const totalCards = cards.length;
    const activeCards = cards.filter((c) => getCardStatus(c) === 'Active').length;

    const cardsWithAlerts = cards.filter((c) => c.controls?.notifications).length;

    const expiringSoon = cards.filter((c) => {
      if (!c.expiryMonth || !c.expiryYear) return false;
      const exp = new Date(Number(c.expiryYear), Number(c.expiryMonth), 0);
      return exp <= ninetyDays && exp >= now;
    }).length;

    // Alert preferences (7 types)
    const alerts = {
      largePurchase:            user?.cardAlertPreferences?.largePurchase            ?? true,
      cardTransaction:          user?.cardAlertPreferences?.cardTransaction          ?? true,
      internationalTransaction: user?.cardAlertPreferences?.internationalTransaction ?? true,
      onlinePurchase:           user?.cardAlertPreferences?.onlinePurchase           ?? true,
      atmWithdrawal:            user?.cardAlertPreferences?.atmWithdrawal            ?? true,
      paymentDue:               user?.cardAlertPreferences?.paymentDue               ?? true,
      cardExpiration:           user?.cardAlertPreferences?.cardExpiration           ?? true,
    };

    // Per-card activity map
    const activityByCard = {};
    cards.forEach((c) => {
      activityByCard[String(c._id)] = (c.activity || [])
        .slice()
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(formatActivity);
    });

    res.json({
      overview: {
        totalCards,
        activeCards,
        cardsWithAlerts,
        expiringSoon,
      },
      cards: cards.map((c) => formatCardForList(c, user)),
      activityByCard,
      alertPreferences: alerts,
    });
  } catch (err) {
    console.error('❌ getCards:', err);
    res.status(500).json({ error: 'Failed to load cards' });
  }
};

// ================================================================
// GET /api/cards/:id/reveal  — full number + CVV (auth required)
// ================================================================
export const revealCard = async (req, res) => {
  try {
    const userId = req.user._id;
    const card = await Card.findOne({ _id: req.params.id, userId }).lean();
    if (!card) return res.status(404).json({ error: 'Card not found' });

    res.json({
      fullNumber: card.fullNumber,
      cvv: card.cvv || '',
      expiryMonth: card.expiryMonth,
      expiryYear: card.expiryYear,
    });
  } catch (err) {
    console.error('❌ revealCard:', err);
    res.status(500).json({ error: 'Failed to reveal card' });
  }
};

// ================================================================
// PUT /api/cards/:id/controls  — toggle a control
// Body: { key: 'locked'|'contactless'|'onlinePurchases'|..., value: bool }
// ================================================================
export const updateCardControl = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { key, value } = req.body;

    const ALLOWED = [
      'locked',
      'contactless',
      'onlinePurchases',
      'internationalPurchases',
      'atmWithdrawals',
      'notifications',
    ];

    if (!ALLOWED.includes(key)) {
      return res.status(400).json({ error: 'Invalid control key' });
    }
    if (typeof value !== 'boolean') {
      return res.status(400).json({ error: 'Value must be a boolean' });
    }

    const update = {
      [`controls.${key}`]: value,
    };

    // When locking the card, also flip the status
    if (key === 'locked') {
      update.status = value ? 'Locked' : 'Active';
    }

    const card = await Card.findOneAndUpdate(
      { _id: id, userId },
      { $set: update },
      { new: true }
    ).lean();

    if (!card) return res.status(404).json({ error: 'Card not found' });

    res.json({
      message: 'Card control updated',
      card: formatCardForList(card, null),
    });
  } catch (err) {
    console.error('❌ updateCardControl:', err);
    res.status(500).json({ error: 'Failed to update card control' });
  }
};

// ================================================================
// PUT /api/cards/alerts  — update card alert preferences
// Body: { largePurchase?: bool, cardTransaction?: bool, ... }
// ================================================================
export const updateCardAlerts = async (req, res) => {
  try {
    const userId = req.user._id;

    const ALLOWED = [
      'largePurchase',
      'cardTransaction',
      'internationalTransaction',
      'onlinePurchase',
      'atmWithdrawal',
      'paymentDue',
      'cardExpiration',
    ];

    const updates = {};
    for (const key of ALLOWED) {
      if (typeof req.body[key] === 'boolean') {
        updates[`cardAlertPreferences.${key}`] = req.body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid alert preferences provided' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, select: 'cardAlertPreferences' }
    );

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      message: 'Card alert preferences updated',
      alertPreferences: {
        largePurchase:            user.cardAlertPreferences.largePurchase,
        cardTransaction:          user.cardAlertPreferences.cardTransaction,
        internationalTransaction: user.cardAlertPreferences.internationalTransaction,
        onlinePurchase:           user.cardAlertPreferences.onlinePurchase,
        atmWithdrawal:            user.cardAlertPreferences.atmWithdrawal,
        paymentDue:               user.cardAlertPreferences.paymentDue,
        cardExpiration:           user.cardAlertPreferences.cardExpiration,
      },
    });
  } catch (err) {
    console.error('❌ updateCardAlerts:', err);
    res.status(500).json({ error: 'Failed to update card alerts' });
  }
};