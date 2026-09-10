// src/pages/Settings.jsx
import React, { useState } from 'react';
import {
  UserRound,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Pencil,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
  Smartphone,
  Laptop,
  LogOut,
  Bell,
  MessageSquare,
  FileText,
  Sliders,
  Link2,
  Trash2,
  Settings as SettingsIcon,
  AlertCircle,
  X,
  Save,
} from 'lucide-react';
import {
  mockUserProfile,
  mockSecuritySettings,
  mockNotificationSettings,
  mockCommunicationPreferences,
  mockPaperlessStatus,
  mockAccountPreferences,
  mockLinkedAccounts,
} from '../data/mockSettingsData';

// Humanize a camelCase key into Title Case
const humanizeKey = (key) =>
  key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase());

const Settings = () => {
  const [profile, setProfile] = useState(mockUserProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...profile });
  const [twoStep, setTwoStep] = useState(mockSecuritySettings.twoStepVerification);
  const [notifications, setNotifications] = useState(mockNotificationSettings);
  const [comms, setComms] = useState(mockCommunicationPreferences);
  const [paperless, setPaperless] = useState(mockPaperlessStatus);
  const [preferences, setPreferences] = useState(mockAccountPreferences);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      setProfile({ ...editForm });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditForm({ ...profile });
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({ ...profile });
  };

  const handleToggle = (category, key) => {
    setNotifications((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key],
      },
    }));
  };

  const handleCommToggle = (key) => {
    setComms((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePreferenceChange = (e) => {
    const { name, value } = e.target;
    setPreferences((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaperlessToggle = () => {
    setPaperless((prev) => ({ ...prev, enrolled: !prev.enrolled }));
  };

  return (
    <div className="mx-auto max-w-[900px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Page Header */}
      <div className="mb-6 border-b border-hairline pb-5">
        <h1 className="font-serif text-2xl font-bold leading-tight text-deep-accent sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-body sm:text-base">
          Manage your personal information, security preferences, notifications, and
          account settings.
        </p>
      </div>

      {/* Personal Information */}
      <section className="mb-8 border-t border-hairline pt-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <UserRound className="h-4 w-4 text-primary" strokeWidth={1.75} />
            <h2 className="font-serif text-lg font-bold text-deep-accent sm:text-xl">
              Personal Information
            </h2>
          </div>
          <button
            type="button"
            onClick={handleEditToggle}
            className={`inline-flex min-h-[36px] items-center gap-1.5 px-4 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:text-sm ${
              isEditing
                ? 'bg-primary text-white hover:bg-primary-deep'
                : 'border border-primary bg-white text-primary hover:bg-faint'
            }`}
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
            {isEditing ? 'Save Changes' : 'Edit Information'}
          </button>
        </div>

        {saveSuccess && (
          <div className="mb-3 flex items-start gap-2 border border-[#c3e6cb] bg-[#d4edda] px-4 py-2.5">
            <CheckCircle2
              className="mt-0.5 h-4 w-4 shrink-0 text-[#155724]"
              strokeWidth={2}
            />
            <span className="text-sm text-[#155724]">
              Your settings have been updated.
            </span>
          </div>
        )}

        <div className="border border-hairline bg-white p-5">
          {isEditing ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-deep-accent">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={editForm.fullName}
                  onChange={handleEditChange}
                  className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-deep-accent">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                  className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-deep-accent">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditChange}
                  className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-deep-accent">
                  Mailing Address
                </label>
                <input
                  type="text"
                  name="mailingAddress"
                  value={editForm.mailingAddress}
                  onChange={handleEditChange}
                  className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-deep-accent">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={editForm.dateOfBirth}
                  onChange={handleEditChange}
                  className="min-h-[38px] w-full border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-hairline pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="inline-flex min-h-[36px] items-center gap-1.5 border border-hairline bg-white px-4 py-1.5 text-xs font-semibold text-deep-accent transition-colors hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:text-sm"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2} />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleEditToggle}
                  className="inline-flex min-h-[36px] items-center gap-1.5 bg-primary px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 sm:text-sm"
                >
                  <Save className="h-3.5 w-3.5" strokeWidth={2} />
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-faint">
              <ProfileRow icon={UserRound} label="Full Name" value={profile.fullName} />
              <ProfileRow icon={Mail} label="Email Address" value={profile.email} />
              <ProfileRow icon={Phone} label="Phone Number" value={profile.phone} />
              <ProfileRow
                icon={MapPin}
                label="Mailing Address"
                value={profile.mailingAddress}
              />
              <ProfileRow
                icon={Calendar}
                label="Date of Birth"
                value={profile.dateOfBirth}
              />
            </div>
          )}
        </div>
      </section>

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
              onClick={() => setTwoStep(!twoStep)}
              className="inline-flex min-h-[30px] items-center border border-primary bg-white px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              {twoStep ? 'Disable' : 'Enable'}
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
              {mockSecuritySettings.trustedDevices.map((device, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-0.5 py-1.5 sm:flex-row sm:items-center sm:gap-3"
                >
                  <span className="inline-flex min-w-0 flex-1 items-center gap-2 text-sm text-ink">
                    <Laptop className="h-3.5 w-3.5 shrink-0 text-muted" strokeWidth={1.75} />
                    <span className="truncate">{device.name}</span>
                  </span>
                  <span className="text-xs text-muted">
                    {device.current ? 'Current device' : `Last used ${device.lastUsed}`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent sign-ins */}
          <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-start sm:gap-4">
            <span className="inline-flex min-w-[160px] items-center gap-2 text-sm font-semibold text-deep-accent">
              <ShieldCheck className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
              Recent Sign-In Activity
            </span>
            <div className="flex flex-1 flex-col divide-y divide-faint">
              {mockSecuritySettings.recentSignIns.map((signin, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-0.5 py-1.5 text-sm sm:flex-row sm:items-center sm:gap-4"
                >
                  <span className="text-xs text-muted sm:w-28">{signin.date}</span>
                  <span className="min-w-0 flex-1 truncate text-body">
                    {signin.location}
                  </span>
                  <span className="text-xs text-muted sm:w-32">{signin.device}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sign out of all devices */}
          <div className="flex justify-start pt-4 sm:justify-end">
            <button
              type="button"
              className="inline-flex min-h-[36px] items-center gap-1.5 bg-[#d9534f] px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#c9302c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d9534f]/50 sm:text-sm"
            >
              <LogOut className="h-3.5 w-3.5" strokeWidth={2.25} />
              Sign Out of All Devices
            </button>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="mb-8 border-t border-hairline pt-6">
        <div className="mb-4 flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" strokeWidth={1.75} />
          <h2 className="font-serif text-lg font-bold text-deep-accent sm:text-xl">
            Notifications
          </h2>
        </div>

        <div className="border border-hairline bg-white p-5">
          <NotificationGroup
            title="Account Alerts"
            data={notifications.accountAlerts}
            onToggle={(key) => handleToggle('accountAlerts', key)}
          />
          <NotificationGroup
            title="Card Alerts"
            data={notifications.cardAlerts}
            onToggle={(key) => handleToggle('cardAlerts', key)}
          />
          <NotificationGroup
            title="Security Alerts"
            data={notifications.securityAlerts}
            onToggle={(key) => handleToggle('securityAlerts', key)}
          />
          <NotificationGroup
            title="Notification Channels"
            data={notifications.channels}
            onToggle={(key) => handleToggle('channels', key)}
            humanize={(k) => k.charAt(0).toUpperCase() + k.slice(1)}
          />
        </div>
      </section>

      {/* Communication Preferences */}
      <section className="mb-8 border-t border-hairline pt-6">
        <div className="mb-4 flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" strokeWidth={1.75} />
          <h2 className="font-serif text-lg font-bold text-deep-accent sm:text-xl">
            Communication Preferences
          </h2>
        </div>

        <div className="border border-hairline bg-white p-5">
          <div className="flex flex-col divide-y divide-faint">
            {Object.entries(comms).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center gap-3 py-3"
              >
                <span
                  className={`h-1.5 w-1.5 shrink-0 ${
                    value ? 'bg-primary' : 'bg-muted'
                  }`}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1 truncate text-sm text-deep-accent">
                  {humanizeKey(key)}
                </span>
                <span
                  className={`shrink-0 text-xs font-bold uppercase tracking-wide ${
                    value ? 'text-primary' : 'text-muted'
                  }`}
                >
                  {value ? 'ON' : 'OFF'}
                </span>
                <button
                  type="button"
                  onClick={() => handleCommToggle(key)}
                  className="shrink-0 border border-hairline bg-white px-3 py-1 text-xs font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  {value ? 'Turn Off' : 'Turn On'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Paperless Statements */}
      <section className="mb-8 border-t border-hairline pt-6">
        <div className="mb-4 flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" strokeWidth={1.75} />
          <h2 className="font-serif text-lg font-bold text-deep-accent sm:text-xl">
            Paperless Statements
          </h2>
        </div>

        <div className="flex flex-col gap-3 border border-hairline bg-white p-5 sm:flex-row sm:items-center sm:gap-4">
          <span
            className={`inline-flex items-center gap-1.5 text-sm font-bold ${
              paperless.enrolled ? 'text-primary' : 'text-muted'
            }`}
          >
            {paperless.enrolled && (
              <CheckCircle2 className="h-4 w-4" strokeWidth={2.25} />
            )}
            {paperless.enrolled ? 'Enrolled' : 'Not Enrolled'}
          </span>
          <button
            type="button"
            onClick={handlePaperlessToggle}
            className="inline-flex min-h-[36px] items-center border border-primary bg-white px-4 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:text-sm"
          >
            {paperless.enrolled ? 'Unenroll' : 'Enroll'}
          </button>
          <p className="text-xs text-body sm:text-sm">
            Manage your paperless statement preferences.{' '}
            {paperless.enrolled
              ? 'You are currently enrolled.'
              : 'You are not currently enrolled.'}
          </p>
        </div>
      </section>

      {/* Account Preferences */}
      <section className="mb-8 border-t border-hairline pt-6">
        <div className="mb-4 flex items-center gap-2">
          <Sliders className="h-4 w-4 text-primary" strokeWidth={1.75} />
          <h2 className="font-serif text-lg font-bold text-deep-accent sm:text-xl">
            Account Preferences
          </h2>
        </div>

        <div className="border border-hairline bg-white p-5">
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
                      value={value}
                      onChange={handlePreferenceChange}
                      className="min-h-[36px] flex-1 border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                    >
                      <option value="Primary Checking •••• 4821">
                        Primary Checking •••• 4821
                      </option>
                      <option value="Savings •••• 9134">Savings •••• 9134</option>
                      <option value="Rewards Visa •••• 2208">
                        Rewards Visa •••• 2208
                      </option>
                    </select>
                  </div>
                );
              }
              if (key === 'dateFormat') {
                return (
                  <div
                    key={key}
                    className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-4"
                  >
                    <span className="min-w-[180px] text-sm font-semibold text-deep-accent">
                      Date Format
                    </span>
                    <select
                      name={key}
                      value={value}
                      onChange={handlePreferenceChange}
                      className="min-h-[36px] flex-1 border border-hairline bg-white px-3 py-1.5 text-sm text-deep-accent focus:border-primary focus:outline-none"
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                );
              }
              return null;
            })}
          </div>

          <button
            type="button"
            className="mt-4 inline-flex min-h-[36px] items-center gap-1.5 bg-primary px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 sm:text-sm"
          >
            <Save className="h-3.5 w-3.5" strokeWidth={2} />
            Save Preferences
          </button>
        </div>
      </section>

      {/* Linked Accounts */}
      <section className="mb-8 border-t border-hairline pt-6">
        <div className="mb-4 flex items-center gap-2">
          <Link2 className="h-4 w-4 text-primary" strokeWidth={1.75} />
          <h2 className="font-serif text-lg font-bold text-deep-accent sm:text-xl">
            Linked Accounts
          </h2>
        </div>

        <div className="flex flex-col divide-y divide-faint border border-hairline bg-white p-5">
          {mockLinkedAccounts.map((acc, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-deep-accent">
                  {acc.institution}
                </div>
                <div className="truncate text-xs text-muted">{acc.account}</div>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide ${
                  acc.status === 'Active' || acc.status === 'Verified'
                    ? 'text-primary'
                    : 'text-muted'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 ${
                    acc.status === 'Active' || acc.status === 'Verified'
                      ? 'bg-primary'
                      : 'bg-muted'
                  }`}
                  aria-hidden="true"
                />
                {acc.status}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="inline-flex min-h-[32px] items-center gap-1.5 border border-hairline bg-white px-3 py-1 text-xs font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  Manage
                </button>
                <button
                  type="button"
                  className="inline-flex min-h-[32px] items-center gap-1.5 border border-[#d9534f] bg-white px-3 py-1 text-xs font-semibold text-[#d9534f] transition-colors hover:bg-[#fdf2f2] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d9534f]/40"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                  Remove
                </button>
              </div>
            </div>
          ))}
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
              className="inline-flex min-h-[34px] items-center gap-1.5 border border-hairline bg-white px-4 py-1.5 text-xs font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:text-sm"
            >
              <LogOut className="h-3.5 w-3.5" strokeWidth={2} />
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
    </div>
  );
};

// Reusable profile display row
const ProfileRow = ({ icon: Icon, label, value }) => (
  <div className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
    <span className="inline-flex items-center gap-2 text-xs text-muted sm:text-sm">
      <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
      {label}
    </span>
    <span className="min-w-0 text-sm font-semibold text-ink sm:text-right">
      {value}
    </span>
  </div>
);

// Reusable notification group
const NotificationGroup = ({ title, data, onToggle, humanize = humanizeKey }) => (
  <>
    <h3 className="mb-2 mt-4 font-serif text-base font-bold text-deep-accent first:mt-0 sm:text-lg">
      {title}
    </h3>
    <div className="flex flex-col divide-y divide-faint">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="flex items-center gap-3 py-3">
          <span
            className={`h-1.5 w-1.5 shrink-0 ${
              value ? 'bg-primary' : 'bg-muted'
            }`}
            aria-hidden="true"
          />
          <span className="min-w-0 flex-1 truncate text-sm text-deep-accent">
            {humanize(key)}
          </span>
          <span
            className={`shrink-0 text-xs font-bold uppercase tracking-wide ${
              value ? 'text-primary' : 'text-muted'
            }`}
          >
            {value ? 'ON' : 'OFF'}
          </span>
          <button
            type="button"
            onClick={() => onToggle(key)}
            className="shrink-0 border border-hairline bg-white px-3 py-1 text-xs font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            {value ? 'Turn Off' : 'Turn On'}
          </button>
        </div>
      ))}
    </div>
  </>
);

export default Settings;