import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone 
      || document.referrer.includes('android-app://');
    
    if (isStandalone) {
      setIsInstalled(true);
      console.log('✅ App is already installed');
      return;
    }

    // Check if iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);
    console.log('📱 iOS detected:', ios);
    console.log('🌐 User Agent:', navigator.userAgent);

    // For iOS, show prompt after 5 seconds
    if (ios) {
      const hasBeenDismissed = localStorage.getItem('installPromptDismissed');
      if (!hasBeenDismissed) {
        console.log('⏰ Will show iOS install prompt in 5 seconds');
        setTimeout(() => setShowPrompt(true), 5000);
      }
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('🎉 beforeinstallprompt event fired!', e);
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      
      // Show prompt immediately when event fires
      const hasBeenDismissed = localStorage.getItem('installPromptDismissed');
      if (!hasBeenDismissed) {
        console.log('⏰ Showing install prompt immediately');
        setShowPrompt(true);
      } else {
        console.log('ℹ️ Install prompt was previously dismissed');
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Log if event listener is set up
    console.log('👂 Listening for beforeinstallprompt event');
    console.log('🔧 ServiceWorker ready:', 'serviceWorker' in navigator);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log('❌ No deferred prompt available');
      return;
    }

    console.log('🚀 Prompting user to install...');
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    console.log('📊 User choice:', outcome);
    if (outcome === 'accepted') {
      console.log('✅ User accepted install');
      setIsInstalled(true);
    } else {
      console.log('❌ User dismissed install');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('installPromptDismissed', 'true');
    // Clear dismissal after 1 day for testing
    setTimeout(() => {
      localStorage.removeItem('installPromptDismissed');
    }, 24 * 60 * 60 * 1000);
  };

  // Don't show if already installed
  if (isInstalled) return null;

  // iOS Install Instructions
  if (isIOS && showPrompt) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 animate-slideInUp md:left-auto md:right-4 md:max-w-sm">
        <div className="relative bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-2xl overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
          </div>

          <div className="relative p-6 text-white">
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Smartphone className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">Install Soul Script</h3>
                <p className="text-sm text-white/90 mb-4">
                  Add to your home screen for the best experience!
                </p>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center font-bold">1</span>
                    Tap the Share button <span className="inline-block w-5 h-5">📤</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center font-bold">2</span>
                    Select "Add to Home Screen" <span className="inline-block w-5 h-5">➕</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Android/Desktop Install Button
  if (deferredPrompt && showPrompt) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 animate-slideInUp md:left-auto md:right-4 md:max-w-sm">
        <div className="relative bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-2xl overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
          </div>

          <div className="relative p-6 text-white">
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Download className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">Install Soul Script</h3>
                <p className="text-sm text-white/90 mb-4">
                  Get the app experience! Works offline and saves to your home screen.
                </p>
                <button
                  onClick={handleInstallClick}
                  className="w-full bg-white text-purple-600 font-semibold py-3 px-6 rounded-xl hover:bg-opacity-90 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Install App
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
