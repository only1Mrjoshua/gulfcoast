// src/components/RestrictedModal.jsx
import React, { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';

const RESTRICTION_SECONDS = 180; // 3 minutes

/**
 * Full-screen, uncancellable modal that locks the app while the
 * account is being restricted. Auto-fires `onExpire()` when the
 * countdown hits 0.
 */
const RestrictedModal = ({ message, onExpire }) => {
  const [secondsLeft, setSecondsLeft] = useState(RESTRICTION_SECONDS);

  // ── Block everything while the modal is up ─────────────────
  useEffect(() => {
    const prevent = (e) => e.preventDefault();
    const preventKey = (e) => {
      const k = e.key?.toLowerCase?.() ?? '';
      if (
        e.key === 'Escape' ||
        e.key === 'F5' ||
        e.key === 'F12' ||
        (e.ctrlKey && ['r', 'w', 't', 'n', 'shift'].includes(k)) ||
        (e.metaKey && ['r', 'w', 't', 'n'].includes(k))
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener('keydown', preventKey, { capture: true });
    document.addEventListener('contextmenu', prevent);
    document.addEventListener('dragstart', prevent);

    const prevOverflow = document.body.style.overflow;
    const prevUserSelect = document.body.style.userSelect;
    document.body.style.overflow = 'hidden';
    document.body.style.userSelect = 'none';

    // Trap any tab / click outside the modal
    const stopFocus = (e) => {
      if (!e.target.closest?.('[data-restricted-modal]')) {
        e.stopPropagation();
        e.preventDefault();
      }
    };
    document.addEventListener('focusin', stopFocus, { capture: true });

    return () => {
      document.removeEventListener('keydown', preventKey, { capture: true });
      document.removeEventListener('contextmenu', prevent);
      document.removeEventListener('dragstart', prevent);
      document.removeEventListener('focusin', stopFocus, { capture: true });
      document.body.style.overflow = prevOverflow;
      document.body.style.userSelect = prevUserSelect;
    };
  }, []);

  // ── Countdown ──────────────────────────────────────────────
  useEffect(() => {
    if (secondsLeft <= 0) {
      onExpire();
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, onExpire]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="restricted-title"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <div
        data-restricted-modal
        className="w-full max-w-md border border-hairline bg-white p-8 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center bg-[#fdecea]">
          <ShieldAlert className="h-9 w-9 text-[#d9534f]" strokeWidth={1.75} />
        </div>

        <h2
          id="restricted-title"
          className="mt-5 font-serif text-2xl font-bold text-deep-accent"
        >
          Account Temporarily Restricted
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-body">
          {message ||
            'Your account has been temporarily restricted. Please visit our physical office at  200 St Charles Ave, New Orleans, LA 70130 to rectify the issue.'}
        </p>

        <div className="mt-6 border-t border-hairline pt-5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted">
            You will be signed out in
          </p>
          <p className="mt-1 font-mono text-3xl font-bold text-deep-accent">
            {mm}:{ss}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RestrictedModal;