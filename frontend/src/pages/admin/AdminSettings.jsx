// src/pages/admin/AdminSettings.jsx
import React, { useState } from 'react';
import { Save, Settings as SettingsIcon, ShieldCheck, CheckCircle2, Sliders } from 'lucide-react';
import { mockAdminSystemSettings } from '../../data/mockAdminData';

const AdminSettings = () => {
  const [settings, setSettings] = useState(mockAdminSystemSettings);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Humanize key
  const humanizeKey = (key) => key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());

  return (
    <div className="mx-auto max-w-[900px]">
      <div className="mb-6 border-b border-hairline pb-5">
        <h1 className="font-serif text-2xl font-bold leading-tight text-deep-accent sm:text-3xl">Admin Settings</h1>
        <p className="mt-1 text-sm text-body sm:text-base">Manage system-wide configurations and feature toggles.</p>
      </div>

      {saveSuccess && (
        <div className="mb-3 flex items-start gap-2 border border-[#c3e6cb] bg-[#d4edda] px-4 py-2.5">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#155724]" strokeWidth={2} />
          <span className="text-sm text-[#155724]">System settings have been updated.</span>
        </div>
      )}

      <section className="mb-8 border border-hairline bg-white p-5">
        <div className="mb-4 flex items-center gap-2 border-b border-hairline pb-3">
          <Sliders className="h-4 w-4 text-primary" strokeWidth={1.75} />
          <h2 className="font-serif text-lg font-bold text-deep-accent sm:text-xl">System Features</h2>
        </div>

        <div className="flex flex-col divide-y divide-faint">
          {Object.entries(settings).map(([key, value]) => (
            <div key={key} className="flex items-center gap-3 py-4">
              <span className={`h-1.5 w-1.5 shrink-0 ${value ? 'bg-primary' : 'bg-muted'}`} aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-deep-accent">
                {humanizeKey(key)}
              </span>
              <span className={`shrink-0 text-xs font-bold uppercase tracking-wide ${value ? 'text-primary' : 'text-muted'}`}>
                {value ? 'ON' : 'OFF'}
              </span>
              <button
                type="button"
                onClick={() => handleToggle(key)}
                className="shrink-0 border border-hairline bg-white px-3 py-1 text-xs font-semibold text-deep-accent transition-colors hover:border-primary hover:bg-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                {value ? 'Turn Off' : 'Turn On'}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8 border border-hairline bg-white p-5">
        <div className="mb-4 flex items-center gap-2 border-b border-hairline pb-3">
          <ShieldCheck className="h-4 w-4 text-primary" strokeWidth={1.75} />
          <h2 className="font-serif text-lg font-bold text-deep-accent sm:text-xl">Maintenance Mode</h2>
        </div>
        <p className="text-sm text-body mb-4">
          Enabling maintenance mode will prevent all users from accessing their accounts. Only administrators will be able to log in.
        </p>
        <div className="flex flex-col gap-4">
          <button 
            onClick={handleSave}
            className="inline-flex min-h-[36px] items-center justify-center gap-1.5 bg-primary px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 sm:text-sm w-full sm:w-auto"
          >
            <Save className="h-3.5 w-3.5" strokeWidth={2} /> Save System Settings
          </button>
        </div>
      </section>
    </div>
  );
};

export default AdminSettings;