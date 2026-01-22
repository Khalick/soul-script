import { useState, useEffect, useMemo } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { useSubscriptionStore } from '../stores/subscriptionStore';
import { useJournalStore } from '../stores/journalStore';
import { getGradientBackground } from '../lib/colorUtils';
import { Crown, Download, Smartphone, Package, Trash2, Shield, Palette, User, Music } from 'lucide-react';
import { SecuritySettings } from './SecuritySettings';

export function Settings() {
  const { theme, favoriteColor, favoriteEmoji, dearPrompt, backgroundAmbience, ambienceVolume, customMusicUrl, setTheme, setFavoriteColor, setFavoriteEmoji, setDearPrompt, setBackgroundAmbience, setAmbienceVolume, setCustomMusicUrl } = useSettingsStore();
  const { checkSubscriptionStatus, setSubscription } = useSubscriptionStore();
  const { entries } = useJournalStore();
  const [tempColor, setTempColor] = useState(favoriteColor);
  const [tempEmoji, setTempEmoji] = useState(favoriteEmoji);
  const [tempPrompt, setTempPrompt] = useState(dearPrompt);
  const [tempMusicUrl, setTempMusicUrl] = useState(customMusicUrl);
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
    setCustomMusicUrl(tempMusicUrl);
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
    <div className="dashboard-page" style={{ background: gradientBackground }}>
      <div className="dashboard-orb dashboard-orb1" style={{ background: `${favoriteColor}40` }}></div>
      <div className="dashboard-orb dashboard-orb2" style={{ background: `${favoriteColor}30` }}></div>
      <div className="dashboard-orb dashboard-orb3" style={{ background: `${favoriteColor}50` }}></div>

      <div className="dashboard-content-wrapper">
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>

          {/* Header - Bigger & Bolder */}
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h1 style={{
              fontSize: '64px',
              fontWeight: '800',
              color: 'white',
              textShadow: '0 4px 40px rgba(255, 255, 255, 0.4)',
              margin: 0,
              marginBottom: '12px',
              letterSpacing: '2px'
            }}>
              {favoriteEmoji} BOUNDARIES
            </h1>
            <p style={{
              fontSize: '22px',
              color: 'rgba(255, 255, 255, 0.9)',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              fontWeight: '500'
            }}>
              Personalize Your Sanctuary
            </p>
          </div>

          {/* Install App Section */}
          {!isInstalled && deferredPrompt && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(224, 122, 95, 0.4), rgba(201, 98, 74, 0.4))',
              borderRadius: '20px',
              padding: '30px',
              marginBottom: '30px',
              border: '2px solid rgba(224, 122, 95, 0.5)',
              textAlign: 'center'
            }}>
              <button
                onClick={handleInstall}
                style={{
                  padding: '20px 50px',
                  background: 'linear-gradient(135deg, #E07A5F, #C9624A)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '16px',
                  fontSize: '20px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '14px',
                  boxShadow: '0 10px 40px rgba(224, 122, 95, 0.5)',
                  transition: 'all 0.3s'
                }}
              >
                <Download size={28} />
                Install Sanctuary
              </button>
            </div>
          )}

          {isInstalled && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.3), rgba(34, 197, 94, 0.3))',
              borderRadius: '20px',
              padding: '25px 30px',
              marginBottom: '30px',
              border: '2px solid rgba(74, 222, 128, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '20px'
            }}>
              <div style={{ padding: '14px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '14px' }}>
                <Smartphone size={28} color="white" />
              </div>
              <div>
                <h3 style={{ fontSize: '22px', fontWeight: '700', color: 'white', margin: 0, marginBottom: '4px' }}>
                  ✅ App Installed
                </h3>
                <p style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.9)', margin: 0 }}>
                  Soul Script is installed on your device!
                </p>
              </div>
            </div>
          )}

          {/* CARD 1: Personalization (Greeting + Emoji + Color) */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '35px',
            marginBottom: '25px',
            border: '2px solid rgba(255, 255, 255, 0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '30px' }}>
              <div style={{ padding: '14px', background: 'rgba(255, 255, 255, 0.15)', borderRadius: '14px' }}>
                <User size={28} color="white" />
              </div>
              <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'white', margin: 0 }}>
                Personalization
              </h2>
            </div>

            {/* Greeting Input */}
            <div style={{ marginBottom: '35px' }}>
              <label style={{
                fontSize: '18px',
                fontWeight: '600',
                color: 'white',
                display: 'block',
                marginBottom: '12px'
              }}>
                📝 Your Greeting
              </label>
              <input
                type="text"
                value={tempPrompt}
                onChange={(e) => setTempPrompt(e.target.value)}
                placeholder="Dear Diary"
                maxLength={30}
                style={{
                  width: '100%',
                  padding: '18px 24px',
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '2px solid rgba(255, 255, 255, 0.25)',
                  borderRadius: '14px',
                  color: 'white',
                  fontSize: '20px',
                  fontWeight: '600',
                  outline: 'none',
                  transition: 'all 0.3s'
                }}
              />
              <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', marginTop: '10px' }}>
                Preview: <span style={{ fontWeight: '600' }}>{tempPrompt || 'Dear Diary'},</span>
              </p>
            </div>

            {/* Emoji Selection */}
            <div style={{ marginBottom: '35px' }}>
              <label style={{
                fontSize: '18px',
                fontWeight: '600',
                color: 'white',
                display: 'block',
                marginBottom: '15px'
              }}>
                Your Favorite Emoji
              </label>
              <div style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}>
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setTempEmoji(emoji)}
                    style={{
                      fontSize: '36px',
                      padding: '14px',
                      background: tempEmoji === emoji ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                      border: tempEmoji === emoji ? '3px solid white' : '2px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      transform: tempEmoji === emoji ? 'scale(1.15)' : 'scale(1)'
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <label style={{
                fontSize: '18px',
                fontWeight: '600',
                color: 'white',
                display: 'block',
                marginBottom: '15px'
              }}>
                Your Favorite Color
              </label>
              <div style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}>
                {colors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setTempColor(color.value)}
                    style={{
                      width: '60px',
                      height: '60px',
                      background: `linear-gradient(135deg, ${color.value}, ${color.value}cc)`,
                      border: tempColor === color.value ? '4px solid white' : '2px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      boxShadow: tempColor === color.value ? `0 8px 25px ${color.value}70` : 'none',
                      transform: tempColor === color.value ? 'scale(1.1)' : 'scale(1)'
                    }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* CARD 2: Theme & Ambience (2-column flex - stacks on mobile) */}
          <div className="settings-flex-row" style={{
            display: 'flex',
            gap: '20px',
            marginBottom: '25px',
            flexWrap: 'wrap'
          }}>
            {/* Theme Mode */}
            <div style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '30px',
              border: '2px solid rgba(255, 255, 255, 0.15)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
                <Palette size={24} color="white" />
                <h3 style={{ fontSize: '22px', fontWeight: '700', color: 'white', margin: 0 }}>
                  Theme
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={() => setTheme('light')}
                  style={{
                    padding: '18px',
                    background: theme === 'light' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                    border: theme === 'light' ? '3px solid white' : '2px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '14px',
                    color: 'white',
                    fontSize: '18px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  ☀️ Light
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  style={{
                    padding: '18px',
                    background: theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                    border: theme === 'dark' ? '3px solid white' : '2px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '14px',
                    color: 'white',
                    fontSize: '18px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  🌙 Dark
                </button>
              </div>
            </div>

            {/* Background Ambience */}
            <div style={{
              flex: 2,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '30px',
              border: '2px solid rgba(255, 255, 255, 0.15)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <Music size={24} color="white" />
                <h3 style={{ fontSize: '22px', fontWeight: '700', color: 'white', margin: 0 }}>
                  Background Ambience
                </h3>
              </div>
              <div style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap'
              }}>
                {[
                  { name: 'None', value: 'none', emoji: '🔇' },
                  { name: 'Rain', value: 'rain', emoji: '🌧️' },
                  { name: 'Fire', value: 'fire', emoji: '🔥' },
                  { name: 'Waves', value: 'waves', emoji: '🌊' },
                  { name: 'Forest', value: 'forest', emoji: '🌲' },
                  { name: 'Cafe', value: 'cafe', emoji: '☕' },
                  { name: 'White Noise', value: 'whitenoise', emoji: '📻' },
                  { name: 'Custom', value: 'custom', emoji: '🎵' },
                ].map((ambience) => (
                  <button
                    key={ambience.value}
                    onClick={() => setBackgroundAmbience(ambience.value as any)}
                    style={{
                      padding: '12px 18px',
                      background: backgroundAmbience === ambience.value ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                      border: backgroundAmbience === ambience.value ? '2px solid white' : '2px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>{ambience.emoji}</span>
                    {ambience.name}
                  </button>
                ))}
              </div>

              {backgroundAmbience === 'custom' && (
                <div style={{ marginTop: '20px' }}>
                  <input
                    type="url"
                    value={tempMusicUrl}
                    onChange={(e) => setTempMusicUrl(e.target.value)}
                    placeholder="https://example.com/music.mp3"
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      background: 'rgba(255, 255, 255, 0.12)',
                      border: '2px solid rgba(255, 255, 255, 0.25)',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '15px',
                      outline: 'none'
                    }}
                  />
                </div>
              )}

              {backgroundAmbience !== 'none' && (
                <div style={{ marginTop: '20px' }}>
                  <label style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '10px', display: 'block' }}>
                    Volume: {Math.round(ambienceVolume * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={ambienceVolume * 100}
                    onChange={(e) => setAmbienceVolume(parseInt(e.target.value) / 100)}
                    style={{
                      width: '100%',
                      height: '8px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '4px',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* CARD 3: Premium Subscription - Prominent Design */}
          <div style={{
            background: premiumActive
              ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.25), rgba(255, 165, 0, 0.25))'
              : 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 165, 0, 0.1))',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '35px',
            marginBottom: '25px',
            border: premiumActive ? '3px solid rgba(255, 215, 0, 0.6)' : '2px solid rgba(255, 215, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <Crown size={36} color={premiumActive ? '#FFD700' : 'rgba(255, 215, 0, 0.8)'} />
              <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'white', margin: 0 }}>
                Premium Subscription
              </h2>
            </div>

            {premiumActive ? (
              <div>
                <p style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '20px' }}>
                  🎉 You are a premium member! Enjoy unlimited access to Legacy Mode and all future premium features.
                </p>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to cancel premium?')) {
                      setSubscription(false);
                    }
                  }}
                  style={{
                    padding: '14px 28px',
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '2px solid rgba(239, 68, 68, 0.5)',
                    borderRadius: '14px',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel Premium (Demo)
                </button>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '25px' }}>
                  Unlock Legacy Mode and write letters to your future self. Get reminded about your dreams exactly when you need them.
                </p>
                <button
                  onClick={() => {
                    const oneYearFromNow = new Date();
                    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
                    setSubscription(true, oneYearFromNow.toISOString());
                    alert('🎉 Premium activated!');
                  }}
                  style={{
                    padding: '20px 40px',
                    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                    border: 'none',
                    borderRadius: '16px',
                    color: '#000',
                    fontSize: '20px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 10px 40px rgba(255, 215, 0, 0.5)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <Crown size={24} /> Activate Premium
                </button>
              </div>
            )}
          </div>

          {/* CARD 4: Data & Maintenance (2-column flex - stacks on mobile) */}
          <div className="settings-flex-row" style={{
            display: 'flex',
            gap: '20px',
            marginBottom: '25px',
            flexWrap: 'wrap'
          }}>
            {/* Export Data */}
            <div style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '30px',
              border: '2px solid rgba(255, 255, 255, 0.15)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.15)', borderRadius: '12px' }}>
                  <Package size={24} color="white" />
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'white', margin: 0, marginBottom: '4px' }}>
                    Carry With Me
                  </h3>
                  <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>
                    Export your journal
                  </p>
                </div>
              </div>
              <button
                onClick={handleExport}
                disabled={entries.length === 0}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: entries.length === 0
                    ? 'rgba(255, 255, 255, 0.08)'
                    : exported
                      ? 'linear-gradient(135deg, #4ade80, #22c55e)'
                      : 'linear-gradient(135deg, #60a5fa, #3b82f6)',
                  border: 'none',
                  borderRadius: '14px',
                  color: entries.length === 0 ? 'rgba(255, 255, 255, 0.4)' : 'white',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: entries.length === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
              >
                {exported ? '✅ Exported!' : <><Download size={20} /> Export {entries.length} Entries</>}
              </button>
            </div>

            {/* Clear Cache */}
            <div style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '30px',
              border: '2px solid rgba(255, 255, 255, 0.15)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.15)', borderRadius: '12px' }}>
                  <Trash2 size={24} color="white" />
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'white', margin: 0, marginBottom: '4px' }}>
                    Clear Cache
                  </h3>
                  <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>
                    Fix loading issues
                  </p>
                </div>
              </div>
              <button
                onClick={handleClearCache}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '14px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'all 0.3s'
                }}
              >
                <Trash2 size={20} /> Clear Cache
              </button>
            </div>
          </div>

          {/* CARD 5: Security Settings */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '35px',
            marginBottom: '40px',
            border: '2px solid rgba(255, 255, 255, 0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '25px' }}>
              <div style={{ padding: '14px', background: 'rgba(255, 255, 255, 0.15)', borderRadius: '14px' }}>
                <Shield size={28} color="white" />
              </div>
              <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'white', margin: 0 }}>
                Security
              </h2>
            </div>
            <SecuritySettings />
          </div>

          {/* Save Button - Big & Prominent */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={handleSave}
              style={{
                fontSize: '22px',
                fontWeight: '700',
                padding: '22px 60px',
                background: saved
                  ? 'linear-gradient(135deg, #4ade80, #22c55e)'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.15))',
                border: '3px solid rgba(255,255,255,0.4)',
                borderRadius: '20px',
                color: 'white',
                cursor: 'pointer',
                boxShadow: saved ? '0 12px 40px rgba(74, 222, 128, 0.5)' : '0 8px 30px rgba(0,0,0,0.3)',
                transition: 'all 0.3s',
                letterSpacing: '1px'
              }}
            >
              {saved ? '✅ Boundaries Set!' : '💾 Set Boundaries'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
