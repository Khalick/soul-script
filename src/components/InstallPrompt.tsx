import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share2, Plus } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone 
      || document.referrer.includes('android-app://');
    
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // Track user interaction for Chrome engagement heuristic
    const handleInteraction = () => {
      setUserInteracted(true);
    };

    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('scroll', handleInteraction, { once: true });

    // For iOS, show prompt after user interaction + delay
    if (ios) {
      const hasBeenDismissed = localStorage.getItem('installPromptDismissed');
      const dismissedTime = localStorage.getItem('installPromptDismissedTime');
      const now = Date.now();
      
      // Re-show after 7 days
      if (dismissedTime && now - parseInt(dismissedTime) < 7 * 24 * 60 * 60 * 1000) {
        return;
      }
      
      if (!hasBeenDismissed || (dismissedTime && now - parseInt(dismissedTime) > 7 * 24 * 60 * 60 * 1000)) {
        setTimeout(() => {
          if (userInteracted) {
            setShowPrompt(true);
          }
        }, 8000); // 8 seconds after interaction
      }
    }

    // Listen for install prompt (Chrome/Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      
      const hasBeenDismissed = localStorage.getItem('installPromptDismissed');
      const dismissedTime = localStorage.getItem('installPromptDismissedTime');
      const now = Date.now();
      
      // Re-show after 7 days
      if (dismissedTime && now - parseInt(dismissedTime) < 7 * 24 * 60 * 60 * 1000) {
        return;
      }
      
      if (!hasBeenDismissed || (dismissedTime && now - parseInt(dismissedTime) > 7 * 24 * 60 * 60 * 1000)) {
        // Wait for user interaction before showing
        setTimeout(() => {
          if (userInteracted) {
            setShowPrompt(true);
          }
        }, 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('scroll', handleInteraction);
    };
  }, [userInteracted]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
      localStorage.removeItem('installPromptDismissed');
      localStorage.removeItem('installPromptDismissedTime');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('installPromptDismissed', 'true');
    localStorage.setItem('installPromptDismissedTime', Date.now().toString());
  };

  // Don't show if already installed
  if (isInstalled) return null;

  // iOS Install Instructions
  if (isIOS && showPrompt) {
    return (
      <div 
        className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md"
        style={{
          animation: 'slideInUp 0.5s ease-out'
        }}
      >
        <div 
          className="relative rounded-2xl shadow-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)',
          }}
        >
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors z-10"
            style={{ color: 'white' }}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="p-3 rounded-xl backdrop-blur-sm"
                style={{ background: 'rgba(255, 255, 255, 0.2)' }}
              >
                <Smartphone className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-xl">Install Sanctuary</h3>
                <p className="text-sm opacity-90">Add to Home Screen</p>
              </div>
            </div>

            <p className="text-sm opacity-90 mb-5">
              Get the full app experience with offline access and faster loading!
            </p>

            <div className="space-y-4 mb-5">
              <div className="flex items-start gap-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0"
                  style={{ background: 'rgba(255, 255, 255, 0.2)' }}
                >
                  1
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-sm">Tap the Share button</span>
                  <Share2 className="w-5 h-5" />
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0"
                  style={{ background: 'rgba(255, 255, 255, 0.2)' }}
                >
                  2
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-sm">Scroll and tap "Add to Home Screen"</span>
                  <Plus className="w-5 h-5" />
                </div>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="w-full py-3 px-6 rounded-xl font-semibold transition-all"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                color: '#E07A5F',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Android/Desktop Install Button
  if (deferredPrompt && showPrompt) {
    return (
      <div 
        className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md"
        style={{
          animation: 'slideInUp 0.5s ease-out'
        }}
      >
        <div 
          className="relative rounded-2xl shadow-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #E07A5F 0%, #C9624A 100%)',
          }}
        >
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors z-10"
            style={{ color: 'white' }}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="p-3 rounded-xl backdrop-blur-sm"
                style={{ background: 'rgba(255, 255, 255, 0.2)' }}
              >
                <Download className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-xl">Install Sanctuary</h3>
                <p className="text-sm opacity-90">Works offline & faster</p>
              </div>
            </div>

            <p className="text-sm opacity-90 mb-5">
              Install the app for a better experience with offline access, faster loading, and home screen convenience.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleInstallClick}
                className="flex-1 py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  color: '#E07A5F',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <Download className="w-5 h-5" />
                Install Now
              </button>
              
              <button
                onClick={handleDismiss}
                className="py-3 px-6 rounded-xl font-semibold transition-all"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: 'white',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                }}
              >
                Later
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
