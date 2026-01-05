import { useEffect } from 'react';
import { useSecurityStore } from '../stores/securityStore';

export const useAutoLock = () => {
  const { lockApp, shouldAutoLock, isPWA, pinEnabled, isLocked } = useSecurityStore();

  useEffect(() => {
    if (!isPWA || !pinEnabled || isLocked) {
      return;
    }

    // Check every 30 seconds if we should auto-lock
    const interval = setInterval(() => {
      if (shouldAutoLock()) {
        console.log('⏰ Auto-lock timeout reached');
        lockApp();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [isPWA, pinEnabled, isLocked, lockApp, shouldAutoLock]);
};
