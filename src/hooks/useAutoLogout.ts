import { useEffect, useRef, useCallback } from 'react';

interface UseAutoLogoutOptions {
  timeout: number; // in milliseconds
  onLogout: () => void;
}

export const useAutoLogout = ({ timeout, onLogout }: UseAutoLogoutOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMediaActiveRef = useRef(false);
  const SESSION_ACTIVITY_KEY = 'soul-script-session-activity';

  const resetTimeout = useCallback(() => {
    // Don't reset if media is being recorded
    if (isMediaActiveRef.current) return;

    // Use sessionStorage (clears on tab close) instead of localStorage
    sessionStorage.setItem(SESSION_ACTIVITY_KEY, Date.now().toString());

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      // Double-check media isn't active before logging out
      if (!isMediaActiveRef.current) {
        console.log('⏰ Auto-logout: Inactivity timeout reached');
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
    // Check if we should logout on page load
    // Using sessionStorage means tab close clears the timestamp automatically
    const lastActivity = sessionStorage.getItem(SESSION_ACTIVITY_KEY);
    if (lastActivity) {
      const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
      if (timeSinceLastActivity > timeout) {
        console.log('⏰ Auto-logout: Session expired after page reload or inactivity');
        // Force logout immediately
        sessionStorage.removeItem(SESSION_ACTIVITY_KEY);
        onLogout();
        return;
      }
    }

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

    // Handle tab visibility change (user switches tabs or minimizes)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab hidden - record timestamp
        sessionStorage.setItem(SESSION_ACTIVITY_KEY, Date.now().toString());
      } else {
        // Tab visible again - check if timeout exceeded
        const lastActivity = sessionStorage.getItem(SESSION_ACTIVITY_KEY);
        if (lastActivity) {
          const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
          if (timeSinceLastActivity > timeout) {
            console.log('⏰ Auto-logout: Session expired while tab was hidden');
            onLogout();
            return;
          }
        }
        resetTimeout();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Handle page unload (tab close/refresh) - clear session
    const handleBeforeUnload = () => {
      sessionStorage.setItem(SESSION_ACTIVITY_KEY, Date.now().toString());
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
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
