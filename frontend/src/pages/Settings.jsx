// src/pages/Settings.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  KeyRound,
  Smartphone,
  Laptop,
  LogOut,
  Settings as SettingsIcon,
  AlertCircle,
  X,
  Save,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
} from 'lucide-react';
import { apiFetch } from '../utils/api';

// Humanize a camelCase key into Title Case
const humanizeKey = (key) =>
  key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase());

const emptyPasswordForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

const Settings = () => {
  // Data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const [trustedDevices, setTrustedDevices] = useState([]);
  const [recentSignIns, setRecentSignIns] = useState([]);
  const [preferences, setPreferences] = useState({
    defaultAccount: '',
    defaultTransferAccount: '',
    defaultPaymentAccount: '',
  });
  const [userAccounts, setUserAccounts] = useState([]);

  // UI state — two-step
  const [twoStep, setTwoStep] = useState(false);
  const [twoStepSaving, setTwoStepSaving] = useState(false);

  // UI state — preferences
  const [isEditingPrefs, setIsEditingPrefs] = useState(false);
  const [prefsSnapshot, setPrefsSnapshot] = useState({
    defaultAccount: '',
    defaultTransferAccount: '',
    defaultPaymentAccount: '',
  });
  const [prefSaving, setPrefSaving] = useState(false);
  const [prefSaved, setPrefSaved] = useState(false);

  // UI state — sign-out-all
  const [signOutSaving, setSignOutSaving] = useState(false);
  const [signOutSuccess, setSignOutSuccess] = useState(false);

  // Change password modal
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ────────────────────────────────────────────────────────
  // Load
  // ────────────────────────────────────────────────────────
  const loadSettings = useCallback(async () => {
    const res = await apiFetch('/settings');
    const d = res?.data ?? res;

    const prefs = d.preferences || {
      defaultAccount: '',
      defaultTransferAccount: '',
      defaultPaymentAccount: '',
    };

    setTwoStep(!!d.security?.twoStepVerification);
    setTrustedDevices(d.security?.trustedDevices || []);
    setRecentSignIns(d.security?.recentSignIns || []);
    setPreferences(prefs);
    setPrefsSnapshot(prefs);
    setUserAccounts(d.accounts || []);
  }, []);

  useEffect(() => {
    const boot = async () => {
      try {
        setLoading(true);
        setError('');
        await loadSettings();
        setHasLoadedOnce(true);
      } catch (err) {
        console.error('❌ Failed to load settings:', err);
        setError(err.message || 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    boot();
  }, [loadSettings]);

  // ────────────────────────────────────────────────────────
  // Two-step verification
  // ────────────────────────────────────────────────────────
  const handleToggleTwoStep = async () => {
    const next = !twoStep;
    setTwoStep(next); // optimistic
    setTwoStepSaving(true);
    try {
      await apiFetch('/settings/two-step', {
        method: 'PUT',
        body: JSON.stringify({ enabled: next }),
      });
    } catch (err) {
      console.error('❌ Failed to update two-step:', err);
      setTwoStep(!next); // roll back
    } finally {
      setTwoStepSaving(false);
    }
  };

  // ────────────────────────────────────────────────────────
  // Preferences
  // ────────────────────────────────────────────────────────
  const handleEditPrefs = () => {
    setPrefsSnapshot({ ...preferences });
    setIsEditingPrefs(true);
    setPrefSaved(false);
  };

  const handleCancelEditPrefs = () => {
    setPreferences(prefsSnapshot);
    setIsEditingPrefs(false);
  };

  const handlePreferenceChange = (e) => {
    const { name, value } = e.target;
    setPreferences((prev) => ({ ...prev, [name]: value }));
  };

  const handleSavePreferences = async () => {
    setPrefSaving(true);
    try {
      const res = await apiFetch('/settings/preferences', {
        method: 'PUT',
        body: JSON.stringify(preferences),
      });
      const d = res?.data ?? res;
      const saved = d.preferences || preferences;

      setPreferences(saved);
      setPrefsSnapshot(saved);
      setIsEditingPrefs(false);
      setPrefSaved(true);
      setTimeout(() => setPrefSaved(false), 3000);
    } catch (err) {
      console.error('❌ Failed to save preferences:', err);
    } finally {
      setPrefSaving(false);
    }
  };

  // Build the label for an account, e.g. "Primary Checking •••• 4821"
  const buildAccountLabel = (acc) =>
    `${acc.name}${acc.lastFour ? ` •••• ${acc.lastFour}` : ''}`;

  // ────────────────────────────────────────────────────────
  // Sign out all devices
  // ────────────────────────────────────────────────────────
  const handleSignOutAll = async () => {
    setSignOutSaving(true);
    try {
      await apiFetch('/settings/sign-out-all', { method: 'POST' });
      setSignOutSuccess(true);
      setTimeout(() => setSignOutSuccess(false), 3000);
    } catch (err) {
      console.error('❌ Failed to sign out all devices:', err);
    } finally {
      setSignOutSaving(false);
    }
  };

  // ────────────────────────────────────────────────────────
  // Change password
  // ────────────────────────────────────────────────────────
  const openChangePassword = () => {
    setPasswordForm(emptyPasswordForm);
    setPasswordError('');
    setPasswordSuccess(false);
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setShowChangePassword(true);
  };

  const closeChangePassword = () => {
    if (passwordSaving) return;
    setShowChangePassword(false);
    setPasswordForm(emptyPasswordForm);
    setPasswordError('');
    setPasswordSuccess(false);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    if (passwordError) setPasswordError('');
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();

    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all fields.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }
    if (newPassword === currentPassword) {
      setPasswordError(
        'New password must be different from your current password.'
      );
      return;
    }

    setPasswordSaving(true);
    setPasswordError('');

    try {
      await apiFetch('/settings/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setPasswordSuccess(true);
      setTimeout(() => {
        closeChangePassword();
      }, 1600);
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  // ────────────────────────────────────────────────────────
  // Render: loading / error
  // ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" strokeWidth={1.75} />
        <p className="text-sm text-muted">Loading your settings…</p>
      </div>
    );
  }

  if (error && !hasLoadedOnce) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-4">
        <p className="font-serif text-xl font-bold text-deep-accent">
          We couldn&rsquo;t load your settings
        </p>
        <p className="max-w-md text-center text-sm text-muted">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-2 bg-primary px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-primary-deep"
        >
          Retry
        </button>
      </div>
    );
  }

  const hasAccounts = userAccounts.length > 0;

  return (
    <div className="mx-auto max-w-[900px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Page Header */}
      <div className="mb-6 border-b border-hairline pb-5">
        <h1 className="font-serif text-2xl font-bold leading-tight text-deep-accent sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-body sm:text-base">
          Manage your security preferences and account settings.
        </p>
      </div>

      {/* Login & Security */}
      <section className="mb-8 border-t border-hairline pt-6">
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" strokeWidth={1.75} />
          <h2 className="font-serif text-lg font-bold text-deep-accent sm:text-xl">
            Login &amp; Security
          </h2>
        </div>

        <div className="flex flex-col divide-y divide-faint border border-hairline bg-white p-5">
          {/* Two-step verification */}
          <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-3">
            <span className="inline-flex min-w-0 flex-1 items-center gap-2 text-sm font-semibold text-deep-accent">
              <KeyRound className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
              Two-Step Verification
            </span>
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide ${
                twoStep ? 'text-primary' : 'text-muted'
              }`}
            >
              {twoStep && (
                <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.25} />
              )}
              {twoStep ? 'Enabled' : 'Disabled'}
            </span>
            <button
              type="button"
              onClick={handleToggleTwoStep}
              disabled={twoStepSaving}
              className="inline-flex min-h-[30px] items-center border border-primary bg-white px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-60"
            >
              {twoStepSaving ? (
                <Loader2 className="h-3 w-3 animate-spin" strokeWidth={2} />
              ) : twoStep ? (
                'Disable'
              ) : (
                'Enable'
              )}
            </button>
          </div>

          {/* Change password */}
          <div className="flex items-center gap-3 py-3">
            <span className="inline-flex min-w-0 flex-1 items-center gap-2 text-sm font-semibold text-deep-accent">
              <KeyRound className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
              Change Password
            </span>
            <button
              type="button"
              onClick={openChangePassword}
              className="inline-flex min-h-[30px] items-center border border-primary bg-white px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              Change
            </button>
          </div>

          {/* Trusted devices */}
          <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-start sm:gap-4">
            <span className="inline-flex min-w-[160px] items-center gap-2 text-sm font-semibold text-deep-accent">
              <Smartphone className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
              Trusted Devices
            </span>
            <div className="flex flex-1 flex-col divide-y divide-faint">
              {trustedDevices.length === 0 ? (
                <p className="py-1.5 text-xs text-muted">
                  No trusted devices on file.
                </p>
              ) : (
                trustedDevices.map((device) => (
                  <div
                    key={device.id}
                    className="flex flex-col gap-0.5 py-1.5 sm:flex-row sm:items-center sm:gap-3"
                  >
                    <span className="inline-flex min-w-0 flex-1 items-center gap-2 text-sm text-ink">
                      <Laptop
                        className="h-3.5 w-3.5 shrink-0 text-muted"
                        strokeWidth={1.75}
                      />
                      <span className="truncate">{device.name}</span>
                    </span>
                    <span className="text-xs text-muted">
                      {device.current
                        ? 'Current device'
                        : `Last used ${device.lastUsed}`}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent sign-ins */}
          <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-start sm:gap-4">
            <span className="inline-flex min-w-[160px] items-center gap-2 text-sm font-semibold text-deep-accent">
              <ShieldCheck className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
              Recent Sign-In Activity
            </span>
            <div className="flex flex-1 flex-col divide-y divide-faint">
              {recentSignIns.length === 0 ? (
                <p className="py-1.5 text-xs text-muted">
                  No recent sign-in activity.
                </p>
              ) : (
                recentSignIns.map((signin) => (
                  <div
                    key={signin.id}
                    className="flex flex-col gap-0.5 py-1.5 text-sm sm:flex-row sm:items-center sm:gap-4"
                  >
                    <span className="text-xs text-muted sm:w-28">
                      {signin.date}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-body">
                      {signin.location}
                    </span>
                    <span className="text-xs text-muted sm:w-32">
                      {signin.device}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sign out of all devices */}
          <div className="flex flex-col gap-2 pt-4 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
            {signOutSuccess && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.25} />
                Signed out of all devices.
              </span>
            )}
            <button
              type="button"
              onClick={handleSignOutAll}
              disabled={signOutSaving}
              className="inline-flex min-h-[36px] items-center gap-1.5 bg-[#d9534f] px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#c9302c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d9534f]/50 disabled:opacity-70 sm:text-sm"
            >
              {signOutSaving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2.25} />
              ) : (
                <LogOut className="h-3.5 w-3.5" strokeWidth={2.25} />
              )}
              Sign Out of All Devices
            </button>
          </div>
        </div>
      </section>

      {/* Account Preferences */}
      <section className="mb-8 border-t border-hairline pt-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4 text-primary" strokeWidth={1.75} />
            <h2 className="font-serif text-lg font-bold text-deep-accent sm:text-xl">
              Account Preferences
            </h2>
          </div>

          {hasAccounts && !isEditingPrefs && (
            <button
              type="button"
              onClick={handleEditPrefs}
              className="inline-flex min-h-[30px] items-center gap-1.5 border border-primary bg-white px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <Pencil className="h-3 w-3" strokeWidth={2} />
              Edit
            </button>
          )}
        </div>

        <div className="border border-hairline bg-white p-5">
          {!hasAccounts ? (
            <p className="py-3 text-sm text-muted">
              You don&rsquo;t have any accounts available to set as a default yet.
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-faint">
              {Object.entries(preferences).map(([key, value]) => {
                if (
                  key === 'defaultAccount' ||
                  key === 'defaultTransferAccount' ||
                  key === 'defaultPaymentAccount'
                ) {
                  return (
                    <div
                      key={key}
                      className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-4"
                    >
                      <span className="min-w-[180px] text-sm font-semibold text-deep-accent">
                        {humanizeKey(key)}
                      </span>
                      <select
                        name={key}
                        value={value || ''}
                        onChange={handlePreferenceChange}
                        disabled={!isEditingPrefs}
                        className="min-h-[36px] flex-1 border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:bg-faint disabled:text-muted"
                      >
                        <option value="">— Select account —</option>
                        {userAccounts.map((acc) => {
                          const label = buildAccountLabel(acc);
                          return (
                            <option key={acc.id} value={label}>
                              {label}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          )}

          {/* Editing mode: Save + Cancel */}
          {isEditingPrefs && (
            <div className="mt-4 flex flex-col-reverse items-stretch gap-3 border-t border-hairline pt-4 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
              <button
                type="button"
                onClick={handleCancelEditPrefs}
                disabled={prefSaving}
                className="min-h-[36px] border border-hairline bg-white px-4 py-1.5 text-xs font-semibold text-deep-accent transition-colors hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-60 sm:text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePreferences}
                disabled={prefSaving}
                className="inline-flex min-h-[36px] items-center justify-center gap-1.5 bg-primary px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-70 sm:text-sm"
              >
                {prefSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
                ) : (
                  <Save className="h-3.5 w-3.5" strokeWidth={2} />
                )}
                Save Preferences
              </button>
            </div>
          )}

          {/* View mode: success indicator only */}
          {!isEditingPrefs && prefSaved && (
            <div className="mt-4 flex items-center gap-1.5 border-t border-hairline pt-4">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" strokeWidth={2.25} />
              <span className="text-xs font-semibold text-primary">
                Preferences saved.
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Account Management */}
      <section className="mb-8 border-t border-hairline pt-6">
        <div className="mb-4 flex items-center gap-2">
          <SettingsIcon className="h-4 w-4 text-primary" strokeWidth={1.75} />
          <h2 className="font-serif text-lg font-bold text-deep-accent sm:text-xl">
            Account Management
          </h2>
        </div>

        <div className="flex flex-col divide-y divide-faint border border-hairline bg-white p-5">
          <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:gap-4">
            <span className="min-w-0 flex-1 text-sm font-semibold text-deep-accent">
              Sign Out of All Devices
            </span>
            <button
              type="button"
              onClick={handleSignOutAll}
              disabled={signOutSaving}
              className="inline-flex min-h-[34px] items-center gap-1.5 border border-hairline bg-white px-4 py-1.5 text-xs font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-60 sm:text-sm"
            >
              {signOutSaving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
              ) : (
                <LogOut className="h-3.5 w-3.5" strokeWidth={2} />
              )}
              Sign Out
            </button>
          </div>

          <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:gap-4">
            <span className="min-w-0 flex-1 text-sm font-semibold text-deep-accent">
              Close Account
            </span>
            <button
              type="button"
              className="inline-flex min-h-[34px] items-center gap-1.5 bg-[#d9534f] px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#c9302c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d9534f]/50 sm:text-sm"
            >
              <AlertCircle className="h-3.5 w-3.5" strokeWidth={2} />
              Close Account
            </button>
          </div>
        </div>
      </section>

      {/* Security Notice */}
      <div className="flex items-start gap-3 border border-hairline bg-faint px-4 py-3">
        <ShieldCheck
          className="mt-0.5 h-4 w-4 shrink-0 text-primary"
          strokeWidth={1.75}
        />
        <p className="text-xs text-body sm:text-sm">
          For your security, we may require additional verification when you change
          sensitive account information.
        </p>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4"
          onClick={closeChangePassword}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-[480px] overflow-y-auto border border-hairline bg-white p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeChangePassword}
              disabled={passwordSaving}
              aria-label="Close"
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center text-muted transition-colors hover:bg-faint hover:text-deep-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-40"
            >
              <X className="h-4 w-4" strokeWidth={2.25} />
            </button>

            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#e7f3f5] text-primary">
                <KeyRound className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <h2 className="font-serif text-xl font-bold text-deep-accent sm:text-2xl">
                  Change Password
                </h2>
                <p className="mt-1 text-sm text-body">
                  Choose a strong password you haven&rsquo;t used before.
                </p>
              </div>
            </div>

            {passwordSuccess ? (
              <div className="mt-6 flex items-start gap-2 border border-[#c3e6cb] bg-[#d4edda] px-4 py-3">
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#155724]"
                  strokeWidth={2}
                />
                <span className="text-sm text-[#155724]">
                  Your password has been updated successfully.
                </span>
              </div>
            ) : (
              <form
                onSubmit={handleSubmitPassword}
                className="mt-6 flex flex-col gap-5"
              >
                {/* Current password */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="currentPassword"
                    className="text-sm font-semibold text-deep-accent"
                  >
                    Current Password
                  </label>
                  <div className="flex items-center border border-hairline bg-white focus-within:border-primary">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      autoComplete="current-password"
                      placeholder="Enter current password"
                      className="min-h-[40px] w-full border-none bg-transparent px-3 py-2 text-sm text-deep-accent outline-none placeholder:text-muted/60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((v) => !v)}
                      aria-label={
                        showCurrentPassword ? 'Hide password' : 'Show password'
                      }
                      className="mr-2 inline-flex h-7 w-7 shrink-0 items-center justify-center text-muted hover:text-deep-accent"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" strokeWidth={2} />
                      ) : (
                        <Eye className="h-4 w-4" strokeWidth={2} />
                      )}
                    </button>
                  </div>
                </div>

                {/* New password */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="newPassword"
                    className="text-sm font-semibold text-deep-accent"
                  >
                    New Password
                  </label>
                  <div className="flex items-center border border-hairline bg-white focus-within:border-primary">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      id="newPassword"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      autoComplete="new-password"
                      placeholder="Enter new password"
                      className="min-h-[40px] w-full border-none bg-transparent px-3 py-2 text-sm text-deep-accent outline-none placeholder:text-muted/60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((v) => !v)}
                      aria-label={
                        showNewPassword ? 'Hide password' : 'Show password'
                      }
                      className="mr-2 inline-flex h-7 w-7 shrink-0 items-center justify-center text-muted hover:text-deep-accent"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" strokeWidth={2} />
                      ) : (
                        <Eye className="h-4 w-4" strokeWidth={2} />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted">
                    Must be at least 8 characters.
                  </p>
                </div>

                {/* Confirm new password */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="confirmPassword"
                    className="text-sm font-semibold text-deep-accent"
                  >
                    Confirm New Password
                  </label>
                  <div className="flex items-center border border-hairline bg-white focus-within:border-primary">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      autoComplete="new-password"
                      placeholder="Re-enter new password"
                      className="min-h-[40px] w-full border-none bg-transparent px-3 py-2 text-sm text-deep-accent outline-none placeholder:text-muted/60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      aria-label={
                        showConfirmPassword ? 'Hide password' : 'Show password'
                      }
                      className="mr-2 inline-flex h-7 w-7 shrink-0 items-center justify-center text-muted hover:text-deep-accent"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" strokeWidth={2} />
                      ) : (
                        <Eye className="h-4 w-4" strokeWidth={2} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {passwordError && (
                  <div className="flex items-start gap-2 border border-[#f5c6cb] bg-[#f8d7da] px-4 py-2.5">
                    <AlertCircle
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#721c24]"
                      strokeWidth={2}
                    />
                    <span className="text-sm text-[#721c24]">{passwordError}</span>
                  </div>
                )}

                <div className="flex flex-col-reverse gap-3 border-t border-hairline pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeChangePassword}
                    disabled={passwordSaving}
                    className="min-h-[40px] border border-hairline bg-white px-5 py-2 text-sm font-semibold text-deep-accent transition-colors hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={passwordSaving}
                    className="inline-flex min-h-[40px] items-center justify-center gap-2 bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-70"
                  >
                    {passwordSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.25} />
                    ) : (
                      <Save className="h-4 w-4" strokeWidth={2.25} />
                    )}
                    Update Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;