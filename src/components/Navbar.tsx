import { useState, useEffect } from 'react';
import { Menu, X, Download, Home, Calendar, PlusCircle, Users, Settings } from 'lucide-react';
import { useSettingsStore } from '../stores/settingsStore';

interface NavbarProps {
  currentView?: string;
  onNavigate: (view: 'home' | 'timeline' | 'analytics' | 'community' | 'settings' | 'legacy') => void;
  onLogout: () => void;
}

export function Navbar({ currentView, onNavigate, onLogout }: NavbarProps) {
  const { favoriteColor, favoriteEmoji } = useSettingsStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    
    if (isStandalone || isIOSStandalone) {
      setIsInstalled(true);
      return;
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // iOS or already installed - do nothing
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setIsInstalled(true);
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error('Install error:', error);
    }
  };

  const handleNavigation = (view: 'home' | 'timeline' | 'analytics' | 'community' | 'settings' | 'legacy') => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    onLogout();
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(10, 13, 46, 0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
        animation: 'fadeIn 0.6s ease-out'
      }}>
        <div style={{
          fontSize: '20px',
          fontWeight: '700',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textShadow: '0 2px 10px rgba(255, 255, 255, 0.3)'
        }}>
          <span style={{ fontSize: '24px' }}>{favoriteEmoji}</span>
          <span>Soul Script</span>
        </div>
        
        {/* Mobile Actions Container */}
        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center'
        }} className="mobile-actions">
          {/* Install Button - Mobile */}
          {!isInstalled && (
            <button
              onClick={handleInstall}
              style={{
                padding: '10px',
                background: 'linear-gradient(135deg, #06b6d4, #0e7490)',
                border: '2px solid rgba(6, 182, 212, 0.5)',
                borderRadius: '10px',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              <Download size={18} />
              <span className="install-text">Install</span>
            </button>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="mobile-menu-button"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '10px',
              padding: '10px',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Desktop Navigation */}
        <div style={{ 
          display: 'none',
          gap: '15px', 
          alignItems: 'center'
        }} className="desktop-nav">
          <button
            onClick={() => onNavigate('home')}
            style={{
              padding: '12px 20px',
              background: currentView === 'home' 
                ? 'rgba(255, 255, 255, 0.2)'
                : 'rgba(255, 255, 255, 0.05)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: currentView === 'home' ? '0 4px 15px rgba(255, 255, 255, 0.2)' : 'none'
            }}
          >
            🏠 Sanctuary
          </button>
          
          <button
            onClick={() => onNavigate('timeline')}
            style={{
              padding: '12px 20px',
              background: currentView === 'timeline' 
                ? 'rgba(255, 255, 255, 0.2)'
                : 'rgba(255, 255, 255, 0.05)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: currentView === 'timeline' ? '0 4px 15px rgba(255, 255, 255, 0.2)' : 'none'
            }}
          >
            📅 Echo Trails
          </button>
          
          <button
            onClick={() => onNavigate('community')}
            style={{
              padding: '12px 20px',
              background: currentView === 'community' 
                ? `linear-gradient(135deg, ${favoriteColor}, ${favoriteColor}cc)`
                : 'rgba(255, 255, 255, 0.15)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: currentView === 'community' ? `0 4px 15px ${favoriteColor}66` : 'none'
            }}
          >
            👥 The Quiet
          </button>
          
          <button
            onClick={() => onNavigate('legacy')}
            style={{
              padding: '12px 20px',
              background: currentView === 'legacy' 
                ? `linear-gradient(135deg, ${favoriteColor}, ${favoriteColor}cc)`
                : 'rgba(255, 255, 255, 0.15)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: currentView === 'legacy' ? `0 4px 15px ${favoriteColor}66` : 'none'
            }}
          >
            👑 Legacy
          </button>
          
          <button
            onClick={() => onNavigate('settings')}
            style={{
              padding: '12px 20px',
              background: currentView === 'settings' 
                ? `linear-gradient(135deg, ${favoriteColor}, ${favoriteColor}cc)`
                : 'rgba(255, 255, 255, 0.15)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: currentView === 'settings' ? `0 4px 15px ${favoriteColor}66` : 'none'
            }}
          >
            ⚙️ Boundaries
          </button>
          
          {!isInstalled && (
            <button
              onClick={handleInstall}
              style={{
                padding: '12px 20px',
                background: 'linear-gradient(135deg, #06b6d4, #0e7490)',
                border: '2px solid rgba(6, 182, 212, 0.5)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(6, 182, 212, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(6, 182, 212, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(6, 182, 212, 0.4)';
              }}
            >
              <Download size={18} /> Install App
            </button>
          )}
          
          <button
            onClick={onLogout}
            style={{
              padding: '12px 20px',
              background: 'rgba(255, 255, 255, 0.15)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ↗️ Logout
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '70px',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(20px)',
          zIndex: 999,
          padding: '20px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }}>
            <button
              onClick={() => handleNavigation('home')}
              style={{
                padding: '15px 20px',
                background: currentView === 'home' 
                  ? `linear-gradient(135deg, ${favoriteColor}, ${favoriteColor}cc)`
                  : 'rgba(255, 255, 255, 0.15)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '18px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: currentView === 'home' ? `0 4px 15px ${favoriteColor}66` : 'none'
              }}
            >
              🏠 Sanctuary
            </button>
            
            <button
              onClick={() => handleNavigation('timeline')}
              style={{
                padding: '15px 20px',
                background: currentView === 'timeline' 
                  ? `linear-gradient(135deg, ${favoriteColor}, ${favoriteColor}cc)`
                  : 'rgba(255, 255, 255, 0.15)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '18px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: currentView === 'timeline' ? `0 4px 15px ${favoriteColor}66` : 'none'
              }}
            >
              📅 Echo Trails
            </button>
            
            <button
              onClick={() => handleNavigation('community')}
              style={{
                padding: '15px 20px',
                background: currentView === 'community' 
                  ? `linear-gradient(135deg, ${favoriteColor}, ${favoriteColor}cc)`
                  : 'rgba(255, 255, 255, 0.15)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '18px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: currentView === 'community' ? `0 4px 15px ${favoriteColor}66` : 'none'
              }}
            >
              👥 The Quiet
            </button>
            
            <button
              onClick={() => handleNavigation('legacy')}
              style={{
                padding: '15px 20px',
                background: currentView === 'legacy' 
                  ? `linear-gradient(135deg, ${favoriteColor}, ${favoriteColor}cc)`
                  : 'rgba(255, 255, 255, 0.15)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '18px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: currentView === 'legacy' ? `0 4px 15px ${favoriteColor}66` : 'none'
              }}
            >
              👑 Legacy
            </button>
            
            <button
              onClick={() => handleNavigation('settings')}
              style={{
                padding: '15px 20px',
                background: currentView === 'settings' 
                  ? `linear-gradient(135deg, ${favoriteColor}, ${favoriteColor}cc)`
                  : 'rgba(255, 255, 255, 0.15)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '18px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: currentView === 'settings' ? `0 4px 15px ${favoriteColor}66` : 'none'
              }}
            >
              ⚙️ Boundaries
            </button>
            
            <button
              onClick={handleLogout}
              style={{
                padding: '15px 20px',
                background: 'rgba(255, 59, 48, 0.2)',
                border: '2px solid rgba(255, 59, 48, 0.5)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '18px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginTop: '20px'
              }}
            >
              ↗️ Logout
            </button>
          </div>
        </div>
      )}
      
      {/* Bottom Navigation for Mobile/PWA */}
      <nav className="mobile-nav-bottom">
        <button 
          className={`mobile-nav-item ${currentView === 'home' ? 'active' : ''}`}
          onClick={() => handleNavigation('home')}
        >
          <Home />
          <span>Home</span>
        </button>
        
        <button 
          className={`mobile-nav-item ${currentView === 'timeline' ? 'active' : ''}`}
          onClick={() => handleNavigation('timeline')}
        >
          <Calendar />
          <span>Timeline</span>
        </button>
        
        <button 
          className="mobile-nav-item add-button"
          onClick={() => {
            // Trigger new entry - you'll need to handle this in App.tsx
            window.dispatchEvent(new CustomEvent('start-new-entry'));
          }}
        >
          <PlusCircle />
        </button>
        
        <button 
          className={`mobile-nav-item ${currentView === 'community' ? 'active' : ''}`}
          onClick={() => handleNavigation('community')}
        >
          <Users />
          <span>Community</span>
        </button>
        
        <button 
          className={`mobile-nav-item ${currentView === 'settings' ? 'active' : ''}`}
          onClick={() => handleNavigation('settings')}
        >
          <Settings />
          <span>Settings</span>
        </button>
      </nav>
    </>
  );
}
