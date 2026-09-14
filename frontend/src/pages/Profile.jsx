// src/pages/Profile.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  UserRound,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Link2,
  Trash2,
  Settings as SettingsIcon,
  Loader2,
} from 'lucide-react';
import { apiFetch } from '../utils/api';

const formatDob = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    mailingAddress: '',
    dateOfBirth: '',
  });
  const [linkedAccounts, setLinkedAccounts] = useState([]);

  const loadProfile = useCallback(async () => {
    const res = await apiFetch('/settings');
    const d = res?.data ?? res;
    setProfile(d.profile || {});
    setLinkedAccounts(d.linkedAccounts || []);
  }, []);

  useEffect(() => {
    const boot = async () => {
      try {
        setLoading(true);
        setError('');
        await loadProfile();
      } catch (err) {
        console.error('❌ Failed to load profile:', err);
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    boot();
  }, [loadProfile]);

  const handleRemoveLinkedAccount = async (id) => {
    try {
      await apiFetch(`/settings/linked-accounts/${id}`, {
        method: 'DELETE',
      });
      setLinkedAccounts((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error('❌ Failed to remove linked account:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" strokeWidth={1.75} />
        <p className="text-sm text-muted">Loading your profile…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-4">
        <p className="font-serif text-xl font-bold text-deep-accent">
          We couldn&rsquo;t load your profile
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

  return (
    <div className="mx-auto max-w-[900px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Page Header */}
      <div className="relative mb-6 border-b border-hairline pb-5">
        <h1 className="font-serif text-2xl font-bold leading-tight text-deep-accent sm:text-3xl">
          Profile
        </h1>
        <p className="mt-1 text-sm text-body sm:text-base">
          Manage your personal information and linked accounts.
        </p>
        <Link
          to="/settings"
          title="Settings"
          aria-label="Settings"
          className="absolute right-0 top-0 inline-flex h-10 w-10 items-center justify-center border border-hairline bg-white text-deep-accent transition-colors hover:border-primary hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <SettingsIcon className="h-5 w-5" strokeWidth={1.75} />
        </Link>
      </div>

      {/* Personal Information (read-only) */}
      <section className="mb-8 border-t border-hairline pt-6">
        <div className="mb-4 flex items-center gap-2">
          <UserRound className="h-4 w-4 text-primary" strokeWidth={1.75} />
          <h2 className="font-serif text-lg font-bold text-deep-accent sm:text-xl">
            Personal Information
          </h2>
        </div>

        <div className="border border-hairline bg-white p-5">
          <div className="flex flex-col divide-y divide-faint">
            <ProfileRow
              icon={UserRound}
              label="Full Name"
              value={profile.fullName || '—'}
            />
            <ProfileRow
              icon={Mail}
              label="Email Address"
              value={profile.email || '—'}
            />
            <ProfileRow
              icon={Phone}
              label="Phone Number"
              value={profile.phone || '—'}
            />
            <ProfileRow
              icon={MapPin}
              label="Mailing Address"
              value={profile.mailingAddress || '—'}
            />
            <ProfileRow
              icon={Calendar}
              label="Date of Birth"
              value={formatDob(profile.dateOfBirth)}
            />
          </div>
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
          {linkedAccounts.length === 0 ? (
            <p className="py-3 text-sm text-muted">
              No linked accounts on file.
            </p>
          ) : (
            linkedAccounts.map((acc) => (
              <div
                key={acc.id}
                className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-deep-accent">
                    {acc.institution}
                  </div>
                  <div className="truncate text-xs text-muted">
                    {acc.account}
                  </div>
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
                    onClick={() => handleRemoveLinkedAccount(acc.id)}
                    className="inline-flex min-h-[32px] items-center gap-1.5 border border-[#d9534f] bg-white px-3 py-1 text-xs font-semibold text-[#d9534f] transition-colors hover:bg-[#fdf2f2] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d9534f]/40"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
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

export default Profile;