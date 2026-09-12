// controllers/settingsController.js
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Account from '../models/Account.js';
import TrustedDevice from '../models/TrustedDevice.js';
import SignInActivity from '../models/SignInActivity.js';

// ---------- Helpers ----------
const formatRelative = (date) => {
  if (!date) return 'never';
  const d = new Date(date);
  const diffDays = Math.floor(
    (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays <= 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatAbsolute = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatLinkedAccount = (acc) => {
  const last4 = acc.accountNumber ? acc.accountNumber.slice(-4) : '';
  const typeLabel = acc.subType || 'Account';
  return {
    id: acc._id,
    institution: acc.institution || 'External Bank',
    account: `${typeLabel} •••• ${last4}`,
    status: acc.status || 'Active',
  };
};

// ================================================================
// GET /api/settings
// ================================================================
export const getSettings = async (req, res) => {
  try {
    const userId = req.user._id;

    const [user, devices, signIns, linkedRaw] = await Promise.all([
      User.findById(userId)
        .select(
          'firstName lastName email phone mailingAddress dateOfBirth twoStepVerification accountPreferences'
        )
        .lean(),
      TrustedDevice.find({ userId }).sort({ lastUsed: -1 }).lean(),
      SignInActivity.find({ userId }).sort({ date: -1 }).limit(10).lean(),
      Account.find({
        userId,
        type: 'External',
        status: { $ne: 'Closed' },
      })
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    if (!user) return res.status(404).json({ error: 'User not found' });

    const prefs = user.accountPreferences || {};

    res.json({
      profile: {
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email || '',
        phone: user.phone || '',
        mailingAddress: user.mailingAddress || '',
        dateOfBirth: user.dateOfBirth || '',
      },
      security: {
        twoStepVerification: !!user.twoStepVerification,
        trustedDevices: devices.map((d) => ({
          id: d._id,
          name: d.name,
          current: !!d.current,
          lastUsed: formatRelative(d.lastUsed),
        })),
        recentSignIns: signIns.map((s) => ({
          id: s._id,
          date: formatAbsolute(s.date),
          location: s.location || 'Unknown',
          device: s.device || 'Unknown',
        })),
      },
      preferences: {
        defaultAccount:         prefs.defaultAccount || '',
        defaultTransferAccount: prefs.defaultTransferAccount || '',
        defaultPaymentAccount:  prefs.defaultPaymentAccount || '',
      },
      linkedAccounts: linkedRaw.map(formatLinkedAccount),
    });
  } catch (err) {
    console.error('❌ getSettings:', err);
    res.status(500).json({ error: 'Failed to load settings' });
  }
};

// ================================================================
// PUT /api/settings/profile
// ================================================================
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fullName, email, phone, mailingAddress, dateOfBirth } =
      req.body || {};

    const update = {};

    if (fullName !== undefined) {
      const parts = String(fullName).trim().split(/\s+/);
      update.firstName = parts[0] || '';
      update.lastName = parts.slice(1).join(' ') || '';
    }
    if (email !== undefined) update.email = String(email).trim();
    if (phone !== undefined) update.phone = String(phone).trim();
    if (mailingAddress !== undefined)
      update.mailingAddress = String(mailingAddress).trim();
    if (dateOfBirth !== undefined) update.dateOfBirth = String(dateOfBirth);

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: update },
      { new: true, lean: true }
    );

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      message: 'Profile updated',
      profile: {
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email || '',
        phone: user.phone || '',
        mailingAddress: user.mailingAddress || '',
        dateOfBirth: user.dateOfBirth || '',
      },
    });
  } catch (err) {
    console.error('❌ updateProfile:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// ================================================================
// PUT /api/settings/preferences
// ================================================================
export const updatePreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const body = req.body || {};
    const update = {};

    for (const key of [
      'defaultAccount',
      'defaultTransferAccount',
      'defaultPaymentAccount',
    ]) {
      if (body[key] !== undefined) {
        update[`accountPreferences.${key}`] = String(body[key]);
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: update },
      { new: true, lean: true }
    ).select('accountPreferences');

    if (!user) return res.status(404).json({ error: 'User not found' });

    const prefs = user.accountPreferences || {};

    res.json({
      message: 'Preferences updated',
      preferences: {
        defaultAccount:         prefs.defaultAccount || '',
        defaultTransferAccount: prefs.defaultTransferAccount || '',
        defaultPaymentAccount:  prefs.defaultPaymentAccount || '',
      },
    });
  } catch (err) {
    console.error('❌ updatePreferences:', err);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
};

// ================================================================
// PUT /api/settings/two-step
// ================================================================
export const updateTwoStep = async (req, res) => {
  try {
    const userId = req.user._id;
    const { enabled } = req.body || {};

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'enabled must be a boolean' });
    }

    await User.findByIdAndUpdate(userId, {
      $set: { twoStepVerification: enabled },
    });

    res.json({ twoStepVerification: enabled });
  } catch (err) {
    console.error('❌ updateTwoStep:', err);
    res.status(500).json({ error: 'Failed to update two-step verification' });
  }
};

// ================================================================
// PUT /api/settings/password
// ================================================================
export const updatePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: 'Current and new password are required' });
    }
    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ error: 'New password must be at least 8 characters long' });
    }
    if (newPassword === currentPassword) {
      return res.status(400).json({
        error: 'New password must be different from your current password',
      });
    }

    const user = await User.findById(userId).select('password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('❌ updatePassword:', err);
    res.status(500).json({ error: 'Failed to update password' });
  }
};

// ================================================================
// POST /api/settings/linked-accounts
// Body: { institution, accountType, accountNumber, routingNumber }
// Creates a new external Account belonging to the user.
// ================================================================
export const createLinkedAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const { institution, accountType, accountNumber, routingNumber } =
      req.body || {};

    if (!institution || !accountNumber || !routingNumber) {
      return res.status(400).json({
        error: 'institution, accountNumber, and routingNumber are required',
      });
    }
    if (!/^\d{9}$/.test(routingNumber)) {
      return res
        .status(400)
        .json({ error: 'Routing number must be 9 digits' });
    }

    const account = await Account.create({
      userId,
      type: 'External',
      subType: accountType || 'Checking',
      accountNumber: String(accountNumber),
      routingNumber: String(routingNumber),
      institution: String(institution).trim(),
      totalBalance: 0,
      availableBalance: 0,
      status: 'Active',
      isPrimary: false,
    });

    res.status(201).json({
      message: 'Linked account added',
      linkedAccount: formatLinkedAccount(account.toObject()),
    });
  } catch (err) {
    console.error('❌ createLinkedAccount:', err);
    res.status(500).json({ error: 'Failed to add linked account' });
  }
};

// ================================================================
// DELETE /api/settings/linked-accounts/:id
// Soft-deletes (status = 'Closed') so the transaction history
// referencing this account stays intact.
// ================================================================
export const removeLinkedAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const account = await Account.findOne({
      _id: id,
      userId,
      type: 'External',
    });
    if (!account) {
      return res.status(404).json({ error: 'Linked account not found' });
    }

    account.status = 'Closed';
    await account.save();

    res.json({ message: 'Linked account removed' });
  } catch (err) {
    console.error('❌ removeLinkedAccount:', err);
    res.status(500).json({ error: 'Failed to remove linked account' });
  }
};

// ================================================================
// POST /api/settings/sign-out-all
// ================================================================
export const signOutAllDevices = async (req, res) => {
  res.json({ message: 'Signed out of all devices' });
};