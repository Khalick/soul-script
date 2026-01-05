import { useEffect } from 'react';
import { useSecurityStore } from '../stores/securityStore';

// Detect if app is running as PWA
export const usePlatformDetection = () => {
  const { setIsPWA } = useSecurityStore();

  useEffect(() => {
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                  (window.navigator as any).standalone === true ||
                  document.referrer.includes('android-app://');
    
    setIsPWA(isPWA);
    console.log(`Platform: ${isPWA ? 'PWA' : 'Web Browser'}`);
  }, [setIsPWA]);

  return {
    isPWA: useSecurityStore((state) => state.isPWA),
    isDesktop: window.innerWidth > 768,
  };
};
