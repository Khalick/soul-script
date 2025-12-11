import React from 'react';
import { useSettingsStore } from '../stores/settingsStore';

interface NavbarProps {
  currentView?: string;
  onNavigate: (view: 'home' | 'timeline' | 'analytics' | 'community' | 'settings' | 'legacy') => void;
  onLogout: () => void;
}

export function Navbar({ currentView, onNavigate, onLogout }: NavbarProps) {
  const { favoriteColor, favoriteEmoji } = useSettingsStore();

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      padding: '20px 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)',
      borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
      animation: 'fadeIn 0.6s ease-out'
    }}>
      <div style={{
        fontSize: '24px',
        fontWeight: '700',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
      }}>
        <span style={{ fontSize: '28px' }}>{favoriteEmoji}</span>
        <span>Soul Script</span>
      </div>
      
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        <button
          onClick={() => onNavigate('home')}
          style={{
            padding: '12px 20px',
            background: currentView === 'home' 
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
            boxShadow: currentView === 'home' ? `0 4px 15px ${favoriteColor}66` : 'none'
          }}
        >
          🏠 Home
        </button>
        
        <button
          onClick={() => onNavigate('timeline')}
          style={{
            padding: '12px 20px',
            background: currentView === 'timeline' 
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
            boxShadow: currentView === 'timeline' ? `0 4px 15px ${favoriteColor}66` : 'none'
          }}
        >
          📅 Timeline
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
          👥 Community
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
          ⚙️ Settings
        </button>
        
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
  );
}
