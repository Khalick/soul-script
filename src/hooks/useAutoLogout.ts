import { useEffect, useRef, useCallback } from 'react';

interface UseAutoLogoutOptions {
  timeout: number; // in milliseconds
  onLogout: () => void;
}

export const useAutoLogout = ({ timeout, onLogout }: UseAutoLogoutOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMediaActiveRef = useRef(false);

  const resetTimeout = useCallback(() => {
    // Don't reset if media is being recorded
    if (isMediaActiveRef.current) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      // Double-check media isn't active before logging out
      if (!isMediaActiveRef.current) {
        onLogout();
      }
    }, timeout);
  }, [timeout, onLogout]);

  // Set media recording state (called from components using media)
  const setMediaActive = useCallback((active: boolean) => {
    isMediaActiveRef.current = active;
    
    // If media just stopped, reset the timeout
    if (!active) {
      resetTimeout();
    } else {
      // If media just started, clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  }, [resetTimeout]);

  useEffect(() => {
    // Events that indicate user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    const handleActivity = () => {
      resetTimeout();
    };

    // Set up event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    // Start the initial timeout
    resetTimeout();

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [resetTimeout]);

  return { setMediaActive };
};
