import { useState, useEffect } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { useSubscriptionStore } from '../stores/subscriptionStore';
import { getGradientBackground } from '../lib/colorUtils';
import { Crown, Volume2, Download, Smartphone } from 'lucide-react';

export function Settings() {
  const { theme, favoriteColor, favoriteEmoji, dearPrompt, backgroundAmbience, ambienceVolume, customMusicUrl, setTheme, setFavoriteColor, setFavoriteEmoji, setDearPrompt, setBackgroundAmbience, setAmbienceVolume, setCustomMusicUrl } = useSettingsStore();
  const { checkSubscriptionStatus, setSubscription } = useSubscriptionStore();
  const [tempColor, setTempColor] = useState(favoriteColor);
  const [tempEmoji, setTempEmoji] = useState(favoriteEmoji);
  const [tempPrompt, setTempPrompt] = useState(dearPrompt);
  const [tempMusicUrl, setTempMusicUrl] = useState(customMusicUrl);
  const [saved, setSaved] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  const premiumActive = checkSubscriptionStatus();

  const emojis = ['💖', '🌟', '🦋', '🌸', '🌈', '✨', '💫', '🔮', '🌺', '🍀', '🌙', '☀️'];
  const colors = [
    { name: 'Pink', value: '#ff6b9d' },
    { name: 'Purple', value: '#c084fc' },
    { name: 'Blue', value: '#60a5fa' },
    { name: 'Indigo', value: '#818cf8' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Green', value: '#4ade80' },
    { name: 'Lime', value: '#84cc16' },
    { name: 'Yellow', value: '#facc15' },
    { name: 'Orange', value: '#fb923c' },
    { name: 'Red', value: '#f87171' },
    { name: 'Rose', value: '#fb7185' },
    { name: 'Fuchsia', value: '#e879f9' },
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
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Check if iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
  };

  const handleSave = () => {
    setFavoriteColor(tempColor);
    setFavoriteEmoji(tempEmoji);
    setDearPrompt(tempPrompt);
    setCustomMusicUrl(tempMusicUrl);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="dashboard-page" style={{
      background: getGradientBackground(favoriteColor)
    }}>
      <div className="dashboard-orb dashboard-orb1" style={{ background: `${favoriteColor}40` }}></div>
      <div className="dashboard-orb dashboard-orb2" style={{ background: `${favoriteColor}30` }}></div>
      <div className="dashboard-orb dashboard-orb3" style={{ background: `${favoriteColor}50` }}></div>

      <div className="dashboard-content-wrapper">
        <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
          <div className="text-center" style={{ animation: 'fadeIn 1s ease-out' }}>
            <h1 style={{ fontSize: '48px', fontWeight: '700', color: 'white', textShadow: '0 0 40px rgba(255, 255, 255, 0.5)', marginBottom: '10px', animation: 'glow 3s ease-in-out infinite' }}>
              {favoriteEmoji} Settings
            </h1>
            <p style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.9)' }}>
              Personalize your Soul Script experience
            </p>
          </div>

          {/* Install App Section */}
          {!isInstalled && (
            <div className="dashboard-card" style={{ animationDelay: '0.1s', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3))', border: '2px solid rgba(255, 255, 255, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'start', gap: '20px' }}>
                <div style={{ 
                  padding: '15px', 
                  background: 'rgba(255, 255, 255, 0.2)', 
                  borderRadius: '16px',
                  backdropFilter: 'blur(10px)'
                }}>
                  {isIOS ? <Smartphone size={32} color="white" /> : <Download size={32} color="white" />}
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '10px', color: 'white' }}>
                    📱 Install Soul Script
                  </h2>
                  <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '15px', lineHeight: '1.6' }}>
                    {isIOS 
                      ? 'Add Soul Script to your home screen for the best experience!'
                      : 'Install Soul Script as an app! Works offline, faster loading, and feels like a native app.'
                    }
                  </p>
                  {isIOS ? (
                    <div style={{ 
                      background: 'rgba(255, 255, 255, 0.15)', 
                      padding: '15px', 
                      borderRadius: '12px',
                      fontSize: '13px',
                      lineHeight: '1.8',
                      color: 'white'
                    }}>
                      <p style={{ fontWeight: '600', marginBottom: '8px' }}>📱 How to Install on iOS:</p>
                      <p>1️⃣ Tap the <strong>Share</strong> button (📤) at the bottom</p>
                      <p>2️⃣ Scroll and tap <strong>"Add to Home Screen"</strong></p>
                      <p>3️⃣ Tap <strong>"Add"</strong> in the top right</p>
                    </div>
                  ) : deferredPrompt ? (
                    <button
                      onClick={handleInstall}
                      style={{
                        padding: '12px 24px',
                        background: 'white',
                        color: '#8B5CF6',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 15px rgba(255, 255, 255, 0.3)',
                        transition: 'transform 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <Download size={18} />
                      Install Now
                    </button>
                  ) : (
                    <div style={{ 
                      background: 'rgba(255, 255, 255, 0.15)', 
                      padding: '15px', 
                      borderRadius: '12px',
                      fontSize: '13px',
                      lineHeight: '1.8',
                      color: 'white'
                    }}>
                      <p style={{ fontWeight: '600', marginBottom: '8px' }}>💻 How to Install:</p>
                      <p><strong>Chrome/Edge:</strong> Look for the install icon (➕) in the address bar</p>
                      <p><strong>Desktop:</strong> Click the ⋮ menu → "Install Soul Script"</p>
                      <p><strong>Mobile:</strong> Tap ⋮ menu → "Add to Home screen"</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {isInstalled && (
            <div className="dashboard-card" style={{ animationDelay: '0.1s', background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.3), rgba(34, 197, 94, 0.3))', border: '2px solid rgba(255, 255, 255, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ 
                  padding: '12px', 
                  background: 'rgba(255, 255, 255, 0.2)', 
                  borderRadius: '12px'
                }}>
                  <Smartphone size={24} color="white" />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '5px' }}>
                    ✅ App Installed
                  </h3>
                  <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)' }}>
                    Soul Script is installed on your device!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Customizable Dear Prompt */}
          <div className="dashboard-card" style={{ animationDelay: '0.2s' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '15px', color: 'white' }}>
              📝 Customize Your Greeting
            </h2>
            <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '15px' }}>
              Change who you're writing to (e.g., "Dear Mom", "Dear Future Me", "Dear God")
            </p>
            <input
              type="text"
              value={tempPrompt}
              onChange={(e) => setTempPrompt(e.target.value)}
              placeholder="Dear Diary"
              maxLength={30}
              style={{
                width: '100%',
                padding: '15px 20px',
                background: 'rgba(255, 255, 255, 0.15)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '18px',
                fontWeight: '600',
                outline: 'none',
                transition: 'all 0.3s'
              }}
            />
            <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginTop: '10px' }}>
              Preview: {tempPrompt || 'Dear Diary'},
            </p>
          </div>

          {/* Favorite Emoji */}
          <div className="dashboard-card" style={{ animationDelay: '0.3s' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '20px', color: 'white' }}>
              Choose Your Favorite Emoji
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '15px' }}>
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setTempEmoji(emoji)}
                  style={{
                    fontSize: '48px',
                    padding: '20px',
                    background: tempEmoji === emoji ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                    border: tempEmoji === emoji ? '3px solid white' : '2px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    transform: tempEmoji === emoji ? 'scale(1.1)' : 'scale(1)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = tempEmoji === emoji ? 'scale(1.1)' : 'scale(1)'}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Favorite Color */}
          <div className="dashboard-card" style={{ animationDelay: '0.5s' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '20px', color: 'white' }}>
              Choose Your Favorite Color
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
              {colors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setTempColor(color.value)}
                  style={{
                    padding: '25px',
                    background: tempColor === color.value 
                      ? `linear-gradient(135deg, ${color.value}, ${color.value}cc)` 
                      : `linear-gradient(135deg, ${color.value}88, ${color.value}44)`,
                    border: tempColor === color.value ? '3px solid white' : '2px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '16px',
                    boxShadow: tempColor === color.value ? `0 10px 30px ${color.value}60` : 'none',
                    transform: tempColor === color.value ? 'scale(1.05)' : 'scale(1)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = tempColor === color.value ? 'scale(1.05)' : 'scale(1)'}
                >
                  {color.name}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="dashboard-card" style={{ animationDelay: '0.7s' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '20px', color: 'white' }}>
              Theme Mode
            </h2>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button
                onClick={() => setTheme('light')}
                style={{
                  flex: 1,
                  padding: '20px',
                  background: theme === 'light' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                  border: theme === 'light' ? '3px solid white' : '2px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '15px',
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
                  flex: 1,
                  padding: '20px',
                  background: theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                  border: theme === 'dark' ? '3px solid white' : '2px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '15px',
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
          <div className="dashboard-card" style={{ animationDelay: '0.75s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <Volume2 size={24} color="white" />
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'white' }}>
                Background Ambience
              </h2>
            </div>
            <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '20px' }}>
              Choose calming sounds to play while journaling
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '20px' }}>
              {[
                { name: 'None', value: 'none', emoji: '🔇' },
                { name: 'Rain', value: 'rain', emoji: '🌧️' },
                { name: 'Fire', value: 'fire', emoji: '🔥' },
                { name: 'Waves', value: 'waves', emoji: '🌊' },
                { name: 'Forest', value: 'forest', emoji: '🌲' },
                { name: 'Cafe', value: 'cafe', emoji: '☕' },
                { name: 'White Noise', value: 'whitenoise', emoji: '📻' },
                { name: 'Custom Music', value: 'custom', emoji: '🎵' },
              ].map((ambience) => (
                <button
                  key={ambience.value}
                  onClick={() => setBackgroundAmbience(ambience.value as any)}
                  style={{
                    padding: '15px 20px',
                    background: backgroundAmbience === ambience.value ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                    border: backgroundAmbience === ambience.value ? '3px solid white' : '2px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '15px',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    justifyContent: 'center'
                  }}
                >
                  <span style={{ fontSize: '24px' }}>{ambience.emoji}</span>
                  {ambience.name}
                </button>
              ))}
            </div>
            {backgroundAmbience === 'custom' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '10px', display: 'block' }}>
                  Enter music URL (MP3 link)
                </label>
                <input
                  type="url"
                  value={tempMusicUrl}
                  onChange={(e) => setTempMusicUrl(e.target.value)}
                  placeholder="https://example.com/music.mp3"
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.3s'
                  }}
                />
                <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginTop: '8px' }}>
                  💡 Tip: Use a direct MP3 link from Google Drive, Dropbox, or any audio hosting service
                </p>
              </div>
            )}
            {backgroundAmbience !== 'none' && (
              <div>
                <label style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '10px', display: 'block' }}>
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

          {/* Premium Subscription */}
          <div className="dashboard-card" style={{ 
            animationDelay: '0.8s',
            background: premiumActive 
              ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.2))' 
              : 'rgba(255, 255, 255, 0.1)',
            border: premiumActive ? '2px solid rgba(255, 215, 0, 0.5)' : '2px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
              <Crown size={32} color={premiumActive ? '#FFD700' : 'rgba(255, 255, 255, 0.7)'} />
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'white' }}>
                Premium Subscription
              </h2>
            </div>
            
            {premiumActive ? (
              <div>
                <p style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '15px' }}>
                  🎉 You are a premium member! Enjoy unlimited access to Legacy Mode and all future premium features.
                </p>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to cancel premium? (This is for demo purposes)')) {
                      setSubscription(false);
                    }
                  }}
                  style={{
                    padding: '12px 25px',
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '2px solid rgba(239, 68, 68, 0.5)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel Premium (Demo)
                </button>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '20px' }}>
                  Unlock Legacy Mode and write letters to your future self. Get reminded about your dreams and goals exactly when you need them.
                </p>
                <button
                  onClick={() => {
                    // Demo mode - activate premium immediately
                    const oneYearFromNow = new Date();
                    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
                    setSubscription(true, oneYearFromNow.toISOString());
                    alert('🎉 Premium activated! (Demo mode - normally this would integrate with payment provider)');
                  }}
                  style={{
                    padding: '15px 30px',
                    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#000',
                    fontSize: '18px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 8px 30px rgba(255, 215, 0, 0.4)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <Crown size={20} /> Activate Premium (Demo)
                </button>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div style={{ display: 'flex', justifyContent: 'center', animation: 'fadeIn 1s ease-out 0.9s backwards' }}>
            <button 
              onClick={handleSave}
              className="dashboard-new-entry-btn"
              style={{ 
                fontSize: '18px', 
                padding: '18px 50px',
                background: saved ? 'linear-gradient(135deg, #4ade80, #22c55e)' : undefined,
                boxShadow: saved ? '0 10px 30px rgba(74, 222, 128, 0.5)' : undefined
              }}
            >
              <span>{saved ? '✅ Settings Saved!' : '💾 Save Settings'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
