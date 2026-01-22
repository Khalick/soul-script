import { useState, useEffect, useMemo } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { useSubscriptionStore } from '../stores/subscriptionStore';
import { useJournalStore } from '../stores/journalStore';
import { getGradientBackground } from '../lib/colorUtils';
import { Crown, Download, Trash2, Shield, User, Music } from 'lucide-react';
import { SecuritySettings } from './SecuritySettings';

export function Settings() {
  const { theme, favoriteColor, favoriteEmoji, dearPrompt, backgroundAmbience, ambienceVolume, setTheme, setFavoriteColor, setFavoriteEmoji, setDearPrompt, setBackgroundAmbience, setAmbienceVolume } = useSettingsStore();
  const { checkSubscriptionStatus, setSubscription } = useSubscriptionStore();
  const { entries } = useJournalStore();
  const [tempColor, setTempColor] = useState(favoriteColor);
  const [tempEmoji, setTempEmoji] = useState(favoriteEmoji);
  const [tempPrompt, setTempPrompt] = useState(dearPrompt);
  // const [tempMusicUrl, setTempMusicUrl] = useState(customMusicUrl); // Removed - simplified ambience options
  const [saved, setSaved] = useState(false);
  const [exported, setExported] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  const premiumActive = checkSubscriptionStatus();

  const emojis = ['💖', '🌟', '🦋', '🌸', '🌈', '✨', '💫', '🔮', '🌺', '🍀', '🌙', '☀️'];
  const colors = [
    { name: 'Pink', value: '#ff6b9d' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Blue', value: '#60a5fa' },
    { name: 'Indigo', value: '#818cf8' },
    { name: 'Green', value: '#4ade80' },
    { name: 'Lime', value: '#84cc16' },
    { name: 'Yellow', value: '#facc15' },
    { name: 'Orange', value: '#fb923c' },
    { name: 'Red', value: '#f87171' },
    { name: 'Rose', value: '#fb7185' },
    { name: 'Fuchsia', value: '#e879f9' },
    { name: 'Purple', value: '#a855f7' },
  ];

  // Create particles
  useEffect(() => {
    const interval = setInterval(() => {
      const particle = document.createElement('div');
      particle.className = 'dashboard-particle';
      particle.style.left = Math.random() * 100 + '%';
      const size = Math.random() * 5 + 2 + 'px';
      particle.style.width = size;
      particle.style.height = size;
      particle.style.animationDuration = Math.random() * 10 + 10 + 's';
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 20000);
    }, 300);
    return () => clearInterval(interval);
  }, []);

  // Check PWA install status
  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;

    if (isStandalone || isIOSStandalone) {
      setIsInstalled(true);
      return;
    }

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (ios) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

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
    if (!deferredPrompt) return;
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

  const handleClearCache = async () => {
    if (window.confirm('Are you sure you want to clear the app cache? This will refresh the app and may fix loading issues.')) {
      try {
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            await registration.unregister();
          }
        }
        if ('caches' in window) {
          const keys = await caches.keys();
          for (const key of keys) {
            await caches.delete(key);
          }
        }
        window.location.reload();
      } catch (error) {
        console.error('Error clearing cache:', error);
        alert('Failed to clear cache. Please try manually clearing browser data.');
      }
    }
  };

  const handleSave = () => {
    setFavoriteColor(tempColor);
    setFavoriteEmoji(tempEmoji);
    setDearPrompt(tempPrompt);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const gradientBackground = useMemo(() => getGradientBackground(favoriteColor), [favoriteColor]);

  const handleExport = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      entries: entries.map(entry => ({
        id: entry.id,
        mood: entry.mood,
        intensity: entry.intensity,
        text_content: entry.text_content,
        tags: entry.tags,
        created_at: entry.created_at,
        is_public: entry.is_public,
      })),
      totalEntries: entries.length,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soulscript-journal-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  return (
    <div className="dashboard-page settings-page" style={{ background: gradientBackground }}>
      <div className="dashboard-orb dashboard-orb1" style={{ background: `${favoriteColor}40` }}></div>
      <div className="dashboard-orb dashboard-orb2" style={{ background: `${favoriteColor}30` }}></div>
      <div className="dashboard-orb dashboard-orb3" style={{ background: `${favoriteColor}50` }}></div>

      <div className="dashboard-content-wrapper">
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 16px', paddingBottom: '120px' }}>

          {/* BOUNDARIES Header - Matching Mockup */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: 'white',
              textShadow: '0 2px 20px rgba(255, 255, 255, 0.3)',
              margin: 0,
              letterSpacing: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}>
              BOUNDARIES <span style={{ fontSize: '24px' }}>⚙️</span>
            </h1>
          </div>

          {/* Install App Section - Compact */}
          {!isInstalled && deferredPrompt && (
            <div style={{
              background: 'rgba(224, 122, 95, 0.25)',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '16px',
              border: '1px solid rgba(224, 122, 95, 0.4)',
              textAlign: 'center'
            }}>
              <button
                onClick={handleInstall}
                style={{
                  padding: '14px 32px',
                  background: 'linear-gradient(135deg, #E07A5F, #C9624A)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <Download size={20} />
                Install App
              </button>
            </div>
          )}

          {/* PERSONALIZATION CARD - Input + Emojis on same row, Colors below */}
          <div className="settings-card" style={{
            background: 'rgba(20, 25, 45, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '20px',
            marginBottom: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            {/* Card Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <User size={20} color="#d4a574" />
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: 0 }}>
                Personalization
              </h2>
            </div>

            {/* Input + Emoji Row */}
            <div style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '16px',
              alignItems: 'flex-end'
            }}>
              {/* Your Greeting Input */}
              <div style={{ flex: 1 }}>
                <label style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: 'rgba(255, 255, 255, 0.6)',
                  display: 'block',
                  marginBottom: '6px'
                }}>
                  Your Greeting
                </label>
                <input
                  type="text"
                  value={tempPrompt}
                  onChange={(e) => setTempPrompt(e.target.value)}
                  placeholder="Dear Diary"
                  maxLength={30}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '15px',
                    fontWeight: '500',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Emoji Selection - 4 visible */}
              <div>
                <label style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: 'rgba(255, 255, 255, 0.6)',
                  display: 'block',
                  marginBottom: '6px'
                }}>
                  Emoji
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {emojis.slice(0, 4).map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setTempEmoji(emoji)}
                      style={{
                        fontSize: '22px',
                        padding: '8px',
                        background: tempEmoji === emoji ? 'rgba(212, 165, 116, 0.4)' : 'rgba(255, 255, 255, 0.08)',
                        border: tempEmoji === emoji ? '2px solid #d4a574' : '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        minWidth: '42px',
                        minHeight: '42px'
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* More Emojis Row */}
            <div style={{
              display: 'flex',
              gap: '6px',
              flexWrap: 'wrap',
              marginBottom: '16px',
              justifyContent: 'center'
            }}>
              {emojis.slice(4).map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setTempEmoji(emoji)}
                  style={{
                    fontSize: '20px',
                    padding: '6px',
                    background: tempEmoji === emoji ? 'rgba(212, 165, 116, 0.4)' : 'rgba(255, 255, 255, 0.05)',
                    border: tempEmoji === emoji ? '2px solid #d4a574' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    minWidth: '36px',
                    minHeight: '36px'
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Color Selection - Single Row */}
            <div style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              {colors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setTempColor(color.value)}
                  style={{
                    width: '36px',
                    height: '36px',
                    background: color.value,
                    border: tempColor === color.value ? '3px solid white' : '2px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: tempColor === color.value ? `0 4px 15px ${color.value}80` : 'none',
                    transform: tempColor === color.value ? 'scale(1.15)' : 'scale(1)'
                  }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* THEME & AMBIENCE - Side by Side */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '16px'
          }}>
            {/* Theme Card */}
            <div className="settings-card" style={{
              flex: 1,
              background: 'rgba(20, 25, 45, 0.7)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: 'white',
                margin: '0 0 12px 0',
                textAlign: 'center'
              }}>
                Theme
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => setTheme('light')}
                  style={{
                    padding: '10px 12px',
                    background: theme === 'light' ? 'rgba(212, 165, 116, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                    border: theme === 'light' ? '2px solid #d4a574' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>☀️ Light</span>
                  {theme === 'light' && <span style={{
                    width: '18px',
                    height: '18px',
                    background: '#d4a574',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px'
                  }}>✓</span>}
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  style={{
                    padding: '10px 12px',
                    background: theme === 'dark' ? 'rgba(212, 165, 116, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                    border: theme === 'dark' ? '2px solid #d4a574' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>🌙 Dark</span>
                  {theme === 'dark' && <span style={{
                    width: '18px',
                    height: '18px',
                    background: '#d4a574',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px'
                  }}>✓</span>}
                </button>
              </div>
            </div>

            {/* Ambience Card - Compact Grid */}
            <div className="settings-card" style={{
              flex: 1,
              background: 'rgba(20, 25, 45, 0.7)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: 'white',
                margin: '0 0 12px 0',
                textAlign: 'center'
              }}>
                Ambience
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '6px'
              }}>
                {[
                  { name: 'Rain', value: 'rain', emoji: '🌧️' },
                  { name: 'Fire', value: 'fire', emoji: '🔥' },
                  { name: 'Waves', value: 'waves', emoji: '🌊' },
                  { name: 'Forest', value: 'forest', emoji: '🌲' },
                ].map((ambience) => (
                  <button
                    key={ambience.value}
                    onClick={() => setBackgroundAmbience(ambience.value as any)}
                    style={{
                      padding: '8px',
                      background: backgroundAmbience === ambience.value ? 'rgba(212, 165, 116, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                      border: backgroundAmbience === ambience.value ? '2px solid #d4a574' : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px'
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>{ambience.emoji}</span>
                    <span>{ambience.name}</span>
                  </button>
                ))}
              </div>
              {/* More ambience options */}
              <div style={{ marginTop: '8px', display: 'flex', gap: '6px', justifyContent: 'center' }}>
                {[
                  { name: 'None', value: 'none', emoji: '🔇' },
                  { name: 'Cafe', value: 'cafe', emoji: '☕' },
                ].map((ambience) => (
                  <button
                    key={ambience.value}
                    onClick={() => setBackgroundAmbience(ambience.value as any)}
                    style={{
                      padding: '6px 10px',
                      background: backgroundAmbience === ambience.value ? 'rgba(212, 165, 116, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                      border: backgroundAmbience === ambience.value ? '2px solid #d4a574' : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span style={{ fontSize: '14px' }}>{ambience.emoji}</span>
                    <span>{ambience.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Volume Slider - Only when ambience selected */}
          {backgroundAmbience !== 'none' && (
            <div style={{
              background: 'rgba(20, 25, 45, 0.5)',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Music size={16} color="rgba(255,255,255,0.6)" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={ambienceVolume * 100}
                  onChange={(e) => setAmbienceVolume(parseInt(e.target.value) / 100)}
                  style={{
                    flex: 1,
                    height: '6px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '3px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', minWidth: '32px' }}>
                  {Math.round(ambienceVolume * 100)}%
                </span>
              </div>
            </div>
          )}

          {/* PREMIUM SUBSCRIPTION CARD */}
          <div className="settings-card" style={{
            background: premiumActive
              ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 165, 0, 0.15))'
              : 'rgba(20, 25, 45, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '20px',
            marginBottom: '16px',
            border: premiumActive ? '2px solid rgba(255, 215, 0, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Crown size={22} color={premiumActive ? '#FFD700' : '#d4a574'} />
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: 0 }}>
                Premium Subscription
              </h2>
            </div>

            {premiumActive ? (
              <div>
                <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '12px' }}>
                  🎉 You're a premium member!
                </p>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to cancel premium?')) {
                      setSubscription(false);
                    }
                  }}
                  style={{
                    padding: '10px 20px',
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Cancel Premium
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  const oneYearFromNow = new Date();
                  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
                  setSubscription(true, oneYearFromNow.toISOString());
                  alert('🎉 Premium activated!');
                }}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #d4a574, #c49366)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                Activate Premium <span style={{ fontSize: '18px' }}>›</span>
              </button>
            )}
          </div>

          {/* EXPORT & CLEAR CACHE - Side by Side */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '16px'
          }}>
            {/* Export Data */}
            <div className="settings-card" style={{
              flex: 1,
              background: 'rgba(20, 25, 45, 0.7)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center'
            }}>
              <div style={{
                width: '44px',
                height: '44px',
                background: 'rgba(212, 165, 116, 0.2)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px'
              }}>
                <Download size={22} color="#d4a574" />
              </div>
              <button
                onClick={handleExport}
                disabled={entries.length === 0}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: exported
                    ? 'rgba(74, 222, 128, 0.3)'
                    : 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  color: entries.length === 0 ? 'rgba(255, 255, 255, 0.4)' : 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: entries.length === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                {exported ? '✅ Done!' : 'Export Data'}
              </button>
            </div>

            {/* Clear Cache */}
            <div className="settings-card" style={{
              flex: 1,
              background: 'rgba(20, 25, 45, 0.7)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center'
            }}>
              <div style={{
                width: '44px',
                height: '44px',
                background: 'rgba(212, 165, 116, 0.2)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px'
              }}>
                <Trash2 size={22} color="#d4a574" />
              </div>
              <button
                onClick={handleClearCache}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Clear Cache
              </button>
            </div>
          </div>

          {/* SECURITY SETTINGS - Compact */}
          <div className="settings-card" style={{
            background: 'rgba(20, 25, 45, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '20px',
            marginBottom: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Shield size={20} color="#d4a574" />
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: 0 }}>
                Security
              </h2>
            </div>
            <SecuritySettings />
          </div>

          {/* SET BOUNDARIES BUTTON - Bottom */}
          <div style={{
            position: 'fixed',
            bottom: '90px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 32px)',
            maxWidth: '448px',
            zIndex: 100
          }}>
            <button
              onClick={handleSave}
              style={{
                width: '100%',
                fontSize: '18px',
                fontWeight: '600',
                padding: '16px',
                background: saved
                  ? 'linear-gradient(135deg, #4ade80, #22c55e)'
                  : 'linear-gradient(135deg, rgba(212, 165, 116, 0.9), rgba(196, 147, 102, 0.9))',
                border: 'none',
                borderRadius: '16px',
                color: 'white',
                cursor: 'pointer',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {saved ? '✅ Boundaries Set!' : <>Set Boundaries <span>✓</span></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
