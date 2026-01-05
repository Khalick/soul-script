import { useEffect, useRef } from 'react';
import { useSecurityStore } from '../stores/securityStore';
import { useAuthStore } from '../stores/authStore';
import { updateLastActivity } from '../lib/pinAuth';

export const useActivityTracker = () => {
  const { updateActivity, isPWA, pinEnabled } = useSecurityStore();
  const { user } = useAuthStore();
  const lastUpdateRef = useRef<number>(0);

  // Create stable throttled handler using ref
  const handleActivity = () => {
    const now = Date.now();
    if (now - lastUpdateRef.current < 1000) {
      return; // Throttle to once per second
    }
    
    lastUpdateRef.current = now;
    
    if (isPWA && pinEnabled) {
      updateActivity();
      // Update server periodically
      if (user) {
        updateLastActivity(user.id);
      }
    }
  };

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
