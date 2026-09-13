// src/hooks/usePolling.js
import { useCallback, useEffect, useRef } from 'react';

/**
 * Polls `fn` every `intervalMs`, pausing when the tab is hidden.
 * Immediately re-fires when the tab becomes visible again.
 * Returns { pollNow } so callers can trigger an on-demand poll
 * (e.g. right after sending a message).
 */
export const usePolling = (fn, { intervalMs = 4000, enabled = true } = {}) => {
  const saved = useRef(fn);
  const handleRef = useRef(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    saved.current = fn;
  }, [fn]);

  const runNow = useCallback(async () => {
    if (cancelledRef.current) return;
    try {
      if (document.visibilityState === 'visible') {
        await saved.current();
      }
    } catch (err) {
      console.warn('polling error:', err?.message);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    cancelledRef.current = false;

    const tick = async () => {
      await runNow();
      if (cancelledRef.current) return;
      handleRef.current = setTimeout(tick, intervalMs);
    };

    handleRef.current = setTimeout(tick, 0);

    const onVis = () => {
      if (document.visibilityState === 'visible' && !cancelledRef.current) {
        clearTimeout(handleRef.current);
        handleRef.current = setTimeout(tick, 0);
      }
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      cancelledRef.current = true;
      clearTimeout(handleRef.current);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [intervalMs, enabled, runNow]);

  return { pollNow: runNow };
};