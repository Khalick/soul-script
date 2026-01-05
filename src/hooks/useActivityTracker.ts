import { useEffect, useCallback } from 'react';
import { useSecurityStore } from '../stores/securityStore';
import { useAuthStore } from '../stores/authStore';
import { updateLastActivity } from '../lib/pinAuth';

// Throttle function to prevent too many updates
const throttle = (func: Function, delay: number) => {
  let lastCall = 0;
  return (...args: any[]) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

export const useActivityTracker = () => {
  const { updateActivity, isPWA, pinEnabled } = useSecurityStore();
  const { user } = useAuthStore();

  const handleActivity = useCallback(
    throttle(() => {
      if (isPWA && pinEnabled) {
        updateActivity();
        // Update server periodically
        if (user) {
          updateLastActivity(user.id);
        }
      }
    }, 1000), // Only fire once per second max
    [isPWA, pinEnabled, user]
  );

  useEffect(() => {
    if (!isPWA || !pinEnabled) {
      return;
    }

    // Track various user activities
    const events = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
      'touchmove',
      'click',
    ];

    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [handleActivity, isPWA, pinEnabled]);

  return { updateActivity };
};
