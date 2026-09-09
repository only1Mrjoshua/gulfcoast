// src/pages/Settings.jsx
import React, { useState } from 'react';
import {
  mockUserProfile,
  mockSecuritySettings,
  mockNotificationSettings,
  mockCommunicationPreferences,
  mockPaperlessStatus,
  mockAccountPreferences,
  mockLinkedAccounts,
} from '../data/mockSettingsData';
import styles from './Settings.module.css';

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
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({ ...profile });
  };

  const handleToggle = (category, key) => {
    // Generic toggle for notification settings
    setNotifications(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key],
      },
    }));
  };

  const handleCommToggle = (key) => {
    setComms(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePreferenceChange = (e) => {
    const { name, value } = e.target;
    setPreferences(prev => ({ ...prev, [name]: value }));
  };

  const handlePaperlessToggle = () => {
    setPaperless(prev => ({ ...prev, enrolled: !prev.enrolled }));
  };

  return (
    <div className={styles.settingsPage}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Settings</h1>
          <p className={styles.pageSubtitle}>
            Manage your personal information, security preferences, notifications, and account settings.
          </p>
        </div>
      </div>

      {/* Personal Information */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Personal Information</h2>
          <button className={styles.editBtn} onClick={handleEditToggle}>
            {isEditing ? 'Save Changes' : 'Edit Information'}
          </button>
        </div>
        {saveSuccess && (
          <div className={styles.successMessage}>Your settings have been updated.</div>
        )}
        <div className={styles.profileCard}>
          {isEditing ? (
            <div className={styles.editForm}>
              <div className={styles.formGroup}>
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={editForm.fullName}
                  onChange={handleEditChange}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditChange}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Mailing Address</label>
                <input
                  type="text"
                  name="mailingAddress"
                  value={editForm.mailingAddress}
                  onChange={handleEditChange}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={editForm.dateOfBirth}
                  onChange={handleEditChange}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.editActions}>
                <button className={styles.cancelBtn} onClick={handleCancelEdit}>Cancel</button>
                <button className={styles.saveBtn} onClick={handleEditToggle}>Save Changes</button>
              </div>
            </div>
          ) : (
            <div className={styles.profileDisplay}>
              <div className={styles.profileRow}>
                <span className={styles.profileLabel}>Full Name</span>
                <span className={styles.profileValue}>{profile.fullName}</span>
              </div>
              <div className={styles.profileRow}>
                <span className={styles.profileLabel}>Email Address</span>
                <span className={styles.profileValue}>{profile.email}</span>
              </div>
              <div className={styles.profileRow}>
                <span className={styles.profileLabel}>Phone Number</span>
                <span className={styles.profileValue}>{profile.phone}</span>
              </div>
              <div className={styles.profileRow}>
                <span className={styles.profileLabel}>Mailing Address</span>
                <span className={styles.profileValue}>{profile.mailingAddress}</span>
              </div>
              <div className={styles.profileRow}>
                <span className={styles.profileLabel}>Date of Birth</span>
                <span className={styles.profileValue}>{profile.dateOfBirth}</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Login & Security */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Login & Security</h2>
        <div className={styles.securityCard}>
          <div className={styles.securityRow}>
            <span className={styles.securityLabel}>Two-Step Verification</span>
            <span className={styles.securityStatus}>
              {twoStep ? 'Enabled ✓' : 'Disabled'}
            </span>
            <button
              className={styles.securityToggle}
              onClick={() => setTwoStep(!twoStep)}
            >
              {twoStep ? 'Disable' : 'Enable'}
            </button>
          </div>
          <div className={styles.securityRow}>
            <span className={styles.securityLabel}>Change Password</span>
            <button className={styles.securityAction}>Change</button>
          </div>
          <div className={styles.securityRow}>
            <span className={styles.securityLabel}>Trusted Devices</span>
            <div className={styles.deviceList}>
              {mockSecuritySettings.trustedDevices.map((device, idx) => (
                <div key={idx} className={styles.deviceItem}>
                  <span>{device.name}</span>
                  <span className={styles.deviceStatus}>
                    {device.current ? 'Current device' : `Last used ${device.lastUsed}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.securityRow}>
            <span className={styles.securityLabel}>Recent Sign-In Activity</span>
            <div className={styles.signInList}>
              {mockSecuritySettings.recentSignIns.map((signin, idx) => (
                <div key={idx} className={styles.signInItem}>
                  <span>{signin.date}</span>
                  <span>{signin.location}</span>
                  <span>{signin.device}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.securityRow}>
            <button className={styles.securityDanger}>Sign Out of All Devices</button>
          </div>
        </div>
      </section>

      {/* Notification Settings */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Notifications</h2>
        <div className={styles.notificationsCard}>
          <h3 className={styles.notifCategory}>Account Alerts</h3>
          {Object.entries(notifications.accountAlerts).map(([key, value]) => (
            <div key={key} className={styles.notifRow}>
              <span className={styles.notifLabel}>
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </span>
              <span className={styles.notifStatus}>{value ? 'ON' : 'OFF'}</span>
              <button
                className={styles.notifToggle}
                onClick={() => handleToggle('accountAlerts', key)}
              >
                {value ? 'Turn Off' : 'Turn On'}
              </button>
            </div>
          ))}

          <h3 className={styles.notifCategory}>Card Alerts</h3>
          {Object.entries(notifications.cardAlerts).map(([key, value]) => (
            <div key={key} className={styles.notifRow}>
              <span className={styles.notifLabel}>
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </span>
              <span className={styles.notifStatus}>{value ? 'ON' : 'OFF'}</span>
              <button
                className={styles.notifToggle}
                onClick={() => handleToggle('cardAlerts', key)}
              >
                {value ? 'Turn Off' : 'Turn On'}
              </button>
            </div>
          ))}

          <h3 className={styles.notifCategory}>Security Alerts</h3>
          {Object.entries(notifications.securityAlerts).map(([key, value]) => (
            <div key={key} className={styles.notifRow}>
              <span className={styles.notifLabel}>
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </span>
              <span className={styles.notifStatus}>{value ? 'ON' : 'OFF'}</span>
              <button
                className={styles.notifToggle}
                onClick={() => handleToggle('securityAlerts', key)}
              >
                {value ? 'Turn Off' : 'Turn On'}
              </button>
            </div>
          ))}

          <h3 className={styles.notifCategory}>Notification Channels</h3>
          {Object.entries(notifications.channels).map(([key, value]) => (
            <div key={key} className={styles.notifRow}>
              <span className={styles.notifLabel}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </span>
              <span className={styles.notifStatus}>{value ? 'ON' : 'OFF'}</span>
              <button
                className={styles.notifToggle}
                onClick={() => handleToggle('channels', key)}
              >
                {value ? 'Turn Off' : 'Turn On'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Communication Preferences */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Communication Preferences</h2>
        <div className={styles.commsCard}>
          {Object.entries(comms).map(([key, value]) => (
            <div key={key} className={styles.commsRow}>
              <span className={styles.commsLabel}>
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </span>
              <span className={styles.commsStatus}>{value ? 'ON' : 'OFF'}</span>
              <button
                className={styles.commsToggle}
                onClick={() => handleCommToggle(key)}
              >
                {value ? 'Turn Off' : 'Turn On'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Paperless Settings */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Paperless Statements</h2>
        <div className={styles.paperlessCard}>
          <span className={styles.paperlessStatus}>
            {paperless.enrolled ? 'Enrolled ✓' : 'Not Enrolled'}
          </span>
          <button
            className={styles.paperlessToggle}
            onClick={handlePaperlessToggle}
          >
            {paperless.enrolled ? 'Unenroll' : 'Enroll'}
          </button>
          <p className={styles.paperlessNote}>
            Manage your paperless statement preferences. {paperless.enrolled ? 'You are currently enrolled.' : 'You are not currently enrolled.'}
          </p>
        </div>
      </section>

      {/* Account Preferences */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Account Preferences</h2>
        <div className={styles.preferencesCard}>
          {Object.entries(preferences).map(([key, value]) => {
            if (key === 'defaultAccount' || key === 'defaultTransferAccount' || key === 'defaultPaymentAccount') {
              return (
                <div key={key} className={styles.prefRow}>
                  <span className={styles.prefLabel}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                  <select
                    name={key}
                    value={value}
                    onChange={handlePreferenceChange}
                    className={styles.prefSelect}
                  >
                    <option value="Primary Checking •••• 4821">Primary Checking •••• 4821</option>
                    <option value="Savings •••• 9134">Savings •••• 9134</option>
                    <option value="Rewards Visa •••• 2208">Rewards Visa •••• 2208</option>
                  </select>
                </div>
              );
            }
            if (key === 'dateFormat') {
              return (
                <div key={key} className={styles.prefRow}>
                  <span className={styles.prefLabel}>Date Format</span>
                  <select
                    name={key}
                    value={value}
                    onChange={handlePreferenceChange}
                    className={styles.prefSelect}
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
          <button className={styles.savePrefsBtn}>Save Preferences</button>
        </div>
      </section>

      {/* Linked Accounts */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Linked Accounts</h2>
        <div className={styles.linkedCard}>
          {mockLinkedAccounts.map((acc, idx) => (
            <div key={idx} className={styles.linkedRow}>
              <span className={styles.linkedInstitution}>{acc.institution}</span>
              <span className={styles.linkedAccount}>{acc.account}</span>
              <span className={styles.linkedStatus}>{acc.status}</span>
              <button className={styles.linkedAction}>Manage</button>
              <button className={styles.linkedRemove}>Remove</button>
            </div>
          ))}
        </div>
      </section>

      {/* Danger Zone */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Account Management</h2>
        <div className={styles.dangerCard}>
          <div className={styles.dangerRow}>
            <span className={styles.dangerLabel}>Sign Out of All Devices</span>
            <button className={styles.dangerAction}>Sign Out</button>
          </div>
          <div className={styles.dangerRow}>
            <span className={styles.dangerLabel}>Close Account</span>
            <button className={styles.dangerActionDanger}>Close Account</button>
          </div>
        </div>
      </section>

      {/* Security Notice */}
      <div className={styles.securityNotice}>
        <span className={styles.securityIcon}>🔒</span>
        <span className={styles.securityText}>
          For your security, we may require additional verification when you change sensitive account information.
        </span>
      </div>
    </div>
  );
};

export default Settings;