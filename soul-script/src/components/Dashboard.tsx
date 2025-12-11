import { useEffect } from 'react';
import { useJournalStore } from '../stores/journalStore';
import { useSettingsStore } from '../stores/settingsStore';
import { getGradientBackground } from '../lib/colorUtils';

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

  return (
    <div className="dashboard-page" style={{
      background: getGradientBackground(favoriteColor)
    }}>
      {/* Floating orbs with dynamic color */}
      <div className="dashboard-orb dashboard-orb1" style={{ background: `${favoriteColor}40` }}></div>
      <div className="dashboard-orb dashboard-orb2" style={{ background: `${favoriteColor}30` }}></div>
      <div className="dashboard-orb dashboard-orb3" style={{ background: `${favoriteColor}50` }}></div>

      <div className="dashboard-content-wrapper">
        {/* Header */}
        <header className="dashboard-header">
          <div className="dashboard-logo">{favoriteEmoji} Soul Script</div>
          <div className="dashboard-nav-icons">
            <div className="dashboard-nav-icon" onClick={() => handleNavigate('home')}>🏠</div>
            <div className="dashboard-nav-icon" onClick={() => handleNavigate('timeline')}>📅</div>
            <div className="dashboard-nav-icon" onClick={() => handleNavigate('analytics')}>📊</div>
            <div className="dashboard-nav-icon" onClick={handleLogout}>↗️</div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="dashboard-hero">
          <h1>{dearPrompt},</h1>
          <p>How are you holding up today?</p>
          <button className="dashboard-new-entry-btn" onClick={handleNewEntry} style={{
            background: `linear-gradient(135deg, ${favoriteColor}, ${favoriteColor}cc)`,
            boxShadow: `0 10px 30px ${favoriteColor}40`
          }}>
            <span>➕</span>
            <span>New Entry</span>
          </button>
        </section>

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Timeline Card */}
          <div className="dashboard-card" onClick={() => handleNavigate('timeline')}>
            <div className="dashboard-card-header">
              <div className="dashboard-card-icon">📅</div>
              <h2>Your Timeline</h2>
            </div>
            <p className="dashboard-card-description">See your emotional journey over time</p>
            <div className="dashboard-card-stat">{entries.length}</div>
            <div className="dashboard-card-label">Total Entries</div>
          </div>

          {/* Insights Card */}
          <div className="dashboard-card" onClick={() => onNavigate?.('analytics')} style={{ cursor: 'pointer' }}>
            <div className="dashboard-card-header">
              <div className="dashboard-card-icon">📊</div>
              <h2>Insights</h2>
            </div>
            <p className="dashboard-card-description">Understand your emotional patterns</p>
            <div className="dashboard-card-stat">{entries.length > 0 ? '✨' : '💡'}</div>
            <div className="dashboard-card-label">{entries.length > 0 ? 'View Analytics' : 'Start Journaling'}</div>
          </div>

          {/* Community Card */}
          <div className="dashboard-card" onClick={() => onNavigate?.('community')} style={{ cursor: 'pointer' }}>
            <div className="dashboard-card-header">
              <div className="dashboard-card-icon">👥</div>
              <h2>Community</h2>
            </div>
            <p className="dashboard-card-description">Share anonymously and support others</p>
            <div className="dashboard-card-stat">💜</div>
            <div className="dashboard-card-label">Join Community</div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="dashboard-bottom-nav">
          <button className="dashboard-fab" onClick={handleNewEntry}>➕</button>
        </div>
      </div>
    </div>
  );
}
