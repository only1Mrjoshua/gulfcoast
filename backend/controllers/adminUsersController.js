// controllers/adminUsersController.js
import User from '../models/User.js';
import Account from '../models/Account.js';
import Card from '../models/Card.js';
import Transaction from '../models/Transaction.js';
import Transfer from '../models/Transfer.js';
import Deposit from '../models/Deposit.js';
import Payment from '../models/Payment.js';
import Autopay from '../models/Autopay.js';
import Payee from '../models/Payee.js';
import Report from '../models/Report.js';
import Notification from '../models/Notification.js';
import Goal from '../models/Goal.js';
import Loan from '../models/Loan.js';
import Statement from '../models/Statement.js';

// ── Helpers ──────────────────────────────────────────
const isoDate = (d) => (d ? new Date(d).toISOString().split('T')[0] : '');

// Auto-rate the credit score the way a real bureau would
const ratingFromScore = (score) => {
  if (score >= 800) return 'Excellent';
  if (score >= 740) return 'Very Good';
  if (score >= 670) return 'Good';
  if (score >= 580) return 'Fair';
  return 'Poor';
};

const formatUser = (u) => ({
  id: u._id,
  name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
  firstName: u.firstName || '',
  lastName:  u.lastName  || '',
  username:  u.username  || '',
  email:     u.email     || '',
  role:      u.role      || 'user',
  status:    u.status    || 'Active',
  creditScore: {
    score:       u.creditScore?.score ?? 0,
    rating:      u.creditScore?.rating || 'N/A',
    change:      u.creditScore?.change ?? 0,
    lastUpdated: isoDate(u.creditScore?.lastUpdated),
  },
  joined: isoDate(u.createdAt),
});

// ================================================================
// GET /api/admin/users
// ================================================================
export const adminListUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ users: users.map(formatUser) });
  } catch (err) {
    console.error('❌ adminListUsers:', err);
    res.status(500).json({ error: 'Failed to load users' });
  }
};

// ================================================================
// PUT /api/admin/users/:id
// Body: { name, role, status, creditScore: { score, change, lastUpdated } }
// ================================================================
export const adminUpdateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, status, creditScore } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // ── Full name → firstName + lastName ──
    if (typeof name === 'string' && name.trim()) {
      const parts = name.trim().split(/\s+/);
      user.firstName = parts[0] || '';
      user.lastName  = parts.slice(1).join(' ') || '';
    }

    // ── Role ──
    if (typeof role === 'string' && ['user', 'admin'].includes(role)) {
      user.role = role;
    }

    // ── Status ──
    if (typeof status === 'string' && ['Active', 'Suspended'].includes(status)) {
      user.status = status;
    }

    // ── Credit score ──
    if (creditScore && typeof creditScore === 'object') {
      if (typeof creditScore.score === 'number') {
        const clamped = Math.max(300, Math.min(850, creditScore.score));
        user.creditScore.score = clamped;
        user.creditScore.rating = ratingFromScore(clamped);
      }
      if (typeof creditScore.change === 'number') {
        user.creditScore.change = creditScore.change;
      }
      if (creditScore.lastUpdated) {
        const d = new Date(creditScore.lastUpdated);
        if (!isNaN(d.getTime())) user.creditScore.lastUpdated = d;
      }
    }

    await user.save();

    res.json({
      message: 'User updated',
      user: formatUser(user.toObject()),
    });
  } catch (err) {
    console.error('❌ adminUpdateUser:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// ================================================================
// DELETE /api/admin/users/:id
// Cascades: deletes everything the user owned.
// ================================================================
export const adminDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Guard: you can't delete your own account
    if (String(user._id) === String(req.user._id)) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    // Guard: don't orphan the platform by deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res
          .status(400)
          .json({ error: 'Cannot delete the last remaining admin' });
      }
    }

    const userId = user._id;

    // Cascade — remove every document owned by this user
    const cascadeResults = await Promise.all([
      Account.deleteMany({ userId }),
      Card.deleteMany({ userId }),
      Transaction.deleteMany({ userId }),
      Transfer.deleteMany({ userId }),
      Deposit.deleteMany({ userId }),
      Payment.deleteMany({ userId }),
      Autopay.deleteMany({ userId }),
      Payee.deleteMany({ userId }),
      Report.deleteMany({ userId }),
      Notification.deleteMany({ userId }),
      Goal.deleteMany({ userId }),
      Loan.deleteMany({ userId }),
      Statement.deleteMany({ userId }),
    ]);

    await User.findByIdAndDelete(userId);

    const deleted = cascadeResults.reduce(
      (sum, r) => sum + (r.deletedCount || 0),
      0
    );

    res.json({
      message: 'User deleted',
      deletedUserId: userId,
      relatedDocumentsDeleted: deleted,
    });
  } catch (err) {
    console.error('❌ adminDeleteUser:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};