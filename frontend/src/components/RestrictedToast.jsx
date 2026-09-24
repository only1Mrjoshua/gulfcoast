// src/components/RestrictedToast.jsx
import React, { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

/**
 * Small top-centered toast that auto-dismisses after `duration` ms.
 * Used on the login screen when a restricted user signs in, or on the
 * landing page after the restriction modal auto-logs them out.
 */
const RestrictedToast = ({ message, onClose, duration = 8000 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  return (
    <div
      className={`fixed left-1/2 top-5 z-[99999] w-[92%] max-w-md -translate-x-1/2 transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
      }`}
      role="alert"
    >
      <div className="flex items-start gap-3 border border-[#f5c6cb] bg-[#fdecea] p-4 shadow-lg">
        <AlertTriangle
          className="mt-0.5 h-5 w-5 shrink-0 text-[#d9534f]"
          strokeWidth={2}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[#721c24]">
            Account Temporarily Restricted
          </p>
          <p className="mt-0.5 text-xs text-[#721c24]">
            {message ||
              'Your account has been temporarily restricted. Please visit our physical office at  200 St Charles Ave, New Orleans, LA 70130 to rectify the issue.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setVisible(false);
            setTimeout(onClose, 300);
          }}
          aria-label="Dismiss"
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center text-[#721c24] transition-opacity hover:opacity-70"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2.25} />
        </button>
      </div>
    </div>
  );
};

export default RestrictedToast;