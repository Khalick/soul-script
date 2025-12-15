import { useEffect, useMemo } from 'react';
import { useJournalStore } from '../stores/journalStore';
import { useSettingsStore } from '../stores/settingsStore';
import { getGradientBackground, getCurrentTimeTheme } from '../lib/colorUtils';
import { TodaysInvitation } from './TodaysInvitation';

interface DashboardProps {
  onNavigate?: (view: 'home' | 'checkin' | 'timeline' | 'analytics' | 'community' | 'settings') => void;
  onNewEntry?: () => void;
  onLogout?: () => void;
}

export function Dashboard({ onNavigate, onNewEntry, onLogout }: DashboardProps = {}) {
  const entries = useJournalStore((state) => state.entries);
  const { favoriteColor, favoriteEmoji, dearPrompt } = useSettingsStore();

  // Create floating particles
  useEffect(() => {
    const interval = setInterval(() => {
      const particle = document.createElement('div');
      particle.className = 'dashboard-particle';
      particle.style.left = Math.random() * 100 + '%';
      const size = Math.random() * 5 + 2 + 'px';
      particle.style.width = size;
      particle.style.height = size;
      particle.style.animationDuration = Math.random() * 10 + 10 + 's';
      particle.style.animationDelay = Math.random() * 5 + 's';
      document.body.appendChild(particle);
      
      setTimeout(() => particle.remove(), 20000);
    }, 300);

    return () => clearInterval(interval);
  }, []);

  // Create sparkles on mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (Math.random() > 0.9) {
        const sparkle = document.createElement('div');
        sparkle.className = 'dashboard-sparkle';
        sparkle.style.left = e.pageX + 'px';
        sparkle.style.top = e.pageY + 'px';
        document.body.appendChild(sparkle);
        
        setTimeout(() => sparkle.remove(), 1500);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleNewEntry = () => {
    if (onNewEntry) {
      onNewEntry();
    }
  };

  const handleNavigate = (view: 'home' | 'checkin' | 'timeline' | 'analytics') => {
    if (onNavigate) {
      onNavigate(view);
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const theme = useMemo(() => getCurrentTimeTheme(), []);
  const gradientBackground = useMemo(() => getGradientBackground(favoriteColor), [favoriteColor]);

  return (
    <div className="dashboard-page" style={{
      background: gradientBackground
    }}>
      {/* Floating orbs with time-based colors */}
      <div className="dashboard-orb dashboard-orb1" style={{ background: theme.orbColors[0] }}></div>
      <div className="dashboard-orb dashboard-orb2" style={{ background: theme.orbColors[1] }}></div>
      <div className="dashboard-orb dashboard-orb3" style={{ background: theme.orbColors[2] }}></div>

      <div className="dashboard-content-wrapper">
        {/* Header */}
        <header className="dashboard-header">
          <div className="dashboard-logo" style={{ color: theme.textColor }}>{favoriteEmoji} Sanctuary</div>
          <div className="dashboard-nav-icons">
            <div className="dashboard-nav-icon" style={{ color: theme.textColor }} onClick={() => handleNavigate('home')}>🏠</div>
            <div className="dashboard-nav-icon" style={{ color: theme.textColor }} onClick={() => handleNavigate('timeline')}>📅</div>
            <div className="dashboard-nav-icon" style={{ color: theme.textColor }} onClick={() => handleNavigate('analytics')}>📊</div>
            <div className="dashboard-nav-icon" style={{ color: theme.textColor }} onClick={handleLogout}>↗️</div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="dashboard-hero">
          <h1 style={{ color: theme.textColor }}>{dearPrompt},</h1>
          <p style={{ color: theme.textColor, opacity: 0.8 }}>Ready to remember who you are?</p>
          <button className="dashboard-new-entry-btn" onClick={handleNewEntry} style={{
            background: theme.cardBg,
            boxShadow: `0 10px 30px ${theme.accentColor}40`,
            color: theme.textColor,
            border: `2px solid ${theme.accentColor}40`
          }}>
            <span>✨</span>
            <span>Begin Journaling</span>
          </button>
        </section>

        {/* Time of Day Label */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '20px',
          color: theme.textColor,
          fontSize: '14px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          opacity: 0.7
        }}>
          {theme.name} JOURNALING
        </div>

        {/* A Gentle Nudge */}
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
          <TodaysInvitation />
        </div>

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Timeline Card */}
          <div className="dashboard-card" onClick={() => handleNavigate('timeline')} style={{ 
            background: theme.cardBg,
            borderColor: `${theme.accentColor}30`
          }}>
            <div className="dashboard-card-header">
              <div className="dashboard-card-icon">📅</div>
              <h2 style={{ color: theme.textColor }}>Echo Trails</h2>
            </div>
            <p className="dashboard-card-description" style={{ color: theme.textColor, opacity: 0.7 }}>See your emotional journey over time</p>
            <div className="dashboard-card-stat" style={{ color: theme.accentColor }}>{entries.length}</div>
            <div className="dashboard-card-label" style={{ color: theme.textColor, opacity: 0.6 }}>Moments Captured</div>
          </div>

          {/* Insights Card */}
          <div className="dashboard-card" onClick={() => onNavigate?.('analytics')} style={{ 
            cursor: 'pointer',
            background: theme.cardBg,
            borderColor: `${theme.accentColor}30`
          }}>
            <div className="dashboard-card-header">
              <div className="dashboard-card-icon">☁️</div>
              <h2 style={{ color: theme.textColor }}>Inner Weather</h2>
            </div>
            <p className="dashboard-card-description" style={{ color: theme.textColor, opacity: 0.7 }}>Understand your emotional patterns</p>
            <div className="dashboard-card-stat" style={{ color: theme.accentColor }}>{entries.length > 0 ? '✨' : '💡'}</div>
            <div className="dashboard-card-label" style={{ color: theme.textColor, opacity: 0.6 }}>{entries.length > 0 ? 'View Analytics' : 'Start Journaling'}</div>
          </div>

          {/* Community Card */}
          <div className="dashboard-card" onClick={() => onNavigate?.('community')} style={{ 
            cursor: 'pointer',
            background: theme.cardBg,
            borderColor: `${theme.accentColor}30`
          }}>
            <div className="dashboard-card-header">
              <div className="dashboard-card-icon">👥</div>
              <h2 style={{ color: theme.textColor }}>The Quiet</h2>
            </div>
            <p className="dashboard-card-description" style={{ color: theme.textColor, opacity: 0.7 }}>Share anonymously and support others</p>
            <div className="dashboard-card-stat" style={{ color: theme.accentColor }}>💜</div>
            <div className="dashboard-card-label" style={{ color: theme.textColor, opacity: 0.6 }}>Join The Quiet</div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="dashboard-bottom-nav">
          <button className="dashboard-fab" onClick={handleNewEntry} style={{
            background: theme.cardBg,
            color: theme.textColor,
            border: `2px solid ${theme.accentColor}40`
          }}>➕</button>
        </div>
      </div>
    </div>
  );
}
