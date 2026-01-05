import { useEffect } from 'react';
import { useSecurityStore } from '../stores/securityStore';

export const useAutoLock = () => {
  const { lockApp, isPWA, pinEnabled, isLocked, lastActivity, autoLockTimeout } = useSecurityStore();

  useEffect(() => {
    if (!isPWA || !pinEnabled) {
      return;
    }

    // Check immediately on mount if we should be locked (handles page reload)
    const checkLock = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;
      const timeoutMs = autoLockTimeout * 60 * 1000;
      
      if (timeSinceLastActivity > timeoutMs && !isLocked) {
        console.log(`⏰ Auto-lock: ${Math.round(timeSinceLastActivity / 1000)}s since last activity (timeout: ${autoLockTimeout}min)`);
        lockApp();
        return true;
      }
      return false;
    };

    // Check immediately (important for page reload)
    if (checkLock()) {
      return; // Already locked, don't set up interval
    }

    // Check every 10 seconds (more responsive than 30s)
    const interval = setInterval(() => {
      checkLock();
    }, 10000);

    return () => clearInterval(interval);
  }, [isPWA, pinEnabled, isLocked, lastActivity, autoLockTimeout, lockApp]);
};
