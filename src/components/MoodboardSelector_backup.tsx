import React, { useState } from 'react';
import { Lock } from 'lucide-react';

interface MoodboardSelectorProps {
  onSelect: (moodboard: string, ambience: string) => void;
}

const moodboards = [
  {
    id: 'dawn',
    name: 'Dawn',
    time: 'DAWN',
    subtitle: 'Begin your day with gentle reflection',
    gradient: 'linear-gradient(135deg, #E8D4D9 0%, #D4B5BD 50%, #9B8A8F 100%)',
    textColor: '#6B5559',
    icon: '🕯️',
    iconSvg: 'lantern',
    themes: ['MIST', 'WHISPER'],
    themeImages: [
      { name: 'MIST', image: '/moodboard-dawn.jpeg' },
      { name: 'WHISPER', image: '/moodboard-dawn.jpeg' }
    ],
    ambiences: [
      { name: 'Ambient Drones (low)', icon: '○', free: true },
      { name: 'Nature (mist forest)', icon: '○', free: true },
      { name: 'Ethereal Strings', icon: '○', free: true },
      { name: 'CEO Hymn Layer', icon: '🔒', free: false }
    ]
  },
  {
    id: 'morning',
    name: 'Morning',
    time: 'MORNING',
    subtitle: 'Fresh perspectives for a new day',
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #2d1810 50%, #4a2511 100%)',
    textColor: '#E8C09B',
    icon: '☀️',
    iconSvg: 'sun',
    themes: ['LIGHT BLOOM', 'AWAKENED PATH', 'AWAKEN PRESENCE'],
    themeImages: [
      { name: 'LIGHT BLOOM', image: '/moodboard-morning.jpeg' },
      { name: 'AWAKENED PATH', image: '/moodboard-morning.jpeg' },
      { name: 'AWAKEN PRESENCE', image: '/moodboard-morning.jpeg' }
    ],
    ambiences: [
      { name: 'Gentle Ethno Strings', icon: '○', free: true },
      { name: 'Morning Beds', icon: '○', free: true },
      { name: 'Soft Piano', icon: '○', free: true }
    ]
  },
  {
    id: 'afternoon',
    name: 'Afternoon',
    time: 'AFTERNOON',
    subtitle: 'Midday pause and presence',
    gradient: 'linear-gradient(135deg, #87CEEB 0%, #4682B4 50%, #1E3A5F 100%)',
    textColor: '#E8C09B',
    icon: '🌤️',
    iconSvg: 'cloud',
    themes: ['Balance', 'Reflection'],
    themeImages: [
      { name: 'Balance', image: '/moodboard-afternoon.jpeg' },
      { name: 'Reflection', image: '/moodboard-afternoon.jpeg' }
    ],
    ambiences: [
      { name: 'Ocean Waves', icon: '○', free: true },
      { name: 'Wind Chimes', icon: '○', free: true },
      { name: 'Ambient Pads', icon: '○', free: true },
      { name: 'Soft Vocals', icon: '🔒', free: false }
    ]
  },
  {
    id: 'mid-afternoon',
    name: 'Mid-Afternoon',
    time: 'MID-AFTERNOON',
    subtitle: 'Sustaining momentum with grace',
    gradient: 'linear-gradient(135deg, #F0E68C 0%, #DAA520 50%, #B8860B 100%)',
    textColor: '#704214',
    icon: '🌅',
    iconSvg: 'sunset',
    themes: ['Focus', 'Renewal'],
    themeImages: [
      { name: 'Focus', image: '/moodboard-afternoon.jpeg' },
      { name: 'Renewal', image: '/moodboard-afternoon.jpeg' }
    ],
    ambiences: [
      { name: 'Café Ambience', icon: '○', free: true },
      { name: 'Light Rain', icon: '○', free: true },
      { name: 'Acoustic Guitar', icon: '○', free: true },
      { name: 'Warm Pads', icon: '🔒', free: false }
    ]
  },
  {
    id: 'evening',
    name: 'Evening',
    time: 'EVENING',
    subtitle: 'Reflect on the day with warmth',
    gradient: 'linear-gradient(135deg, #2a1810 0%, #3d2416 50%, #52301c 100%)',
    textColor: '#D4A574',
    icon: '🏮',
    iconSvg: 'lantern',
    themes: ['DUSK', 'GLOW'],
    themeImages: [
      { name: 'DUSK', image: '/moodboard-evening.jpeg' },
      { name: 'GLOW', image: '/moodboard-evening.jpeg' }
    ],
    ambiences: [
      { name: 'Ambient Drones (low)', icon: '○', free: true },
      { name: 'Nature (dusk forest)', icon: '○', free: true },
      { name: 'Harmonic Strings', icon: '○', free: true },
      { name: 'CEO Hymn Layer', icon: '🔒', free: false }
    ]
  },
  {
    id: 'night',
    name: 'Night',
    time: 'NIGHT',
    subtitle: 'Deep rest and restoration',
    gradient: 'linear-gradient(135deg, #0f0a1e 0%, #1a0f2e 50%, #25143d 100%)',
    textColor: '#C8B8D8',
    icon: '🌙',
    iconSvg: 'moon',
    themes: ['Silence', 'Dreams'],
    themeImages: [
      { name: 'Silence', image: '/moodboard-night.jpeg' },
      { name: 'Dreams', image: '/moodboard-night.jpeg' }
    ],
    ambiences: [
      { name: 'Night Crickets', icon: '○', free: true },
      { name: 'Deep Meditation', icon: '○', free: true },
      { name: 'Tibetan Bowls', icon: '○', free: true },
      { name: 'Sleep Frequencies', icon: '🔒', free: false }
    ]
  }
];

export const MoodboardSelector: React.FC<MoodboardSelectorProps> = ({ onSelect }) => {
  const [selectedMoodboard, setSelectedMoodboard] = useState<string | null>(null);
  const [selectedAmbience, setSelectedAmbience] = useState<string | null>(null);

  const handleSelectMoodboard = (moodboardId: string) => {
    setSelectedMoodboard(moodboardId);
    setSelectedAmbience(null);
  };

  const handleSelectAmbience = (ambienceName: string, isFree: boolean) => {
    if (!isFree) {
      alert('🔒 Premium feature - Upgrade to unlock all ambient sounds');
      return;
    }
    setSelectedAmbience(ambienceName);
  };

  const handleBeginJournaling = () => {
    if (selectedMoodboard && selectedAmbience) {
      onSelect(selectedMoodboard, selectedAmbience);
    }
  };

  const selectedBoard = moodboards.find(m => m.id === selectedMoodboard);

  return (
    <div 
      style={{
        minHeight: '100vh',
        background: selectedBoard?.gradient || 'linear-gradient(-45deg, #06b6d4, #0e7490, #14b8a6, #22d3ee)',
        backgroundSize: '400% 400%',
        animation: 'gradient 15s ease infinite',
        padding: '40px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      {/* Time Selector Arc */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ 
          position: 'relative', 
          width: '100%', 
          maxWidth: '600px',
          margin: '0 auto 30px'
        }}>
          <svg viewBox="0 0 600 100" style={{ width: '100%', height: 'auto' }}>
            <path
              d="M 50 80 Q 300 -20, 550 80"
              fill="none"
              stroke={selectedBoard?.textColor || 'white'}
              strokeWidth="2"
              opacity="0.3"
            />
            {moodboards.map((board, index) => {
              const angle = (index / (moodboards.length - 1)) * Math.PI;
              const x = 50 + Math.cos(Math.PI - angle) * 250;
              const y = 80 - Math.sin(angle) * 60;
              
              return (
                <g key={board.id}>
                  <circle
                    cx={x}
                    cy={y}
                    r="20"
                    fill={selectedMoodboard === board.id ? (selectedBoard?.textColor || 'white') : 'rgba(255,255,255,0.3)'}
                    style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                    onClick={() => handleSelectMoodboard(board.id)}
                  />
                  <text
                    x={x}
                    y={y - 30}
                    textAnchor="middle"
                    fill={selectedBoard?.textColor || 'white'}
                    fontSize="12"
                    fontWeight={selectedMoodboard === board.id ? '700' : '400'}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSelectMoodboard(board.id)}
                  >
                    {board.time}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <h1 style={{ 
          fontSize: '48px', 
          fontWeight: '700', 
          color: selectedBoard?.textColor || 'white',
          marginBottom: '10px',
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          {selectedBoard?.time || 'Choose Your Time'}
        </h1>
        <h2 style={{ 
          fontSize: '32px', 
          fontWeight: '600', 
          color: selectedBoard?.textColor || 'white',
          opacity: 0.9
        }}>
          {selectedBoard?.name || ''} Journaling
        </h2>
        <p style={{ 
          fontSize: '18px', 
          color: selectedBoard?.textColor || 'white',
          opacity: 0.8,
          marginTop: '10px'
        }}>
          {selectedBoard?.subtitle || 'Select a time of day to begin'}
        </p>
      </div>

      {/* Moodboard Grid */}
      {!selectedMoodboard ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '30px',
          maxWidth: '1200px',
          width: '100%'
        }}>
          {moodboards.map(board => (
            <div
              key={board.id}
              onClick={() => handleSelectMoodboard(board.id)}
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '20px',
                padding: '30px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
              }}
            >
              <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '15px' }}>
                {board.icon}
              </div>
              <h3 style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                color: board.textColor,
                textAlign: 'center',
                marginBottom: '10px'
              }}>
                {board.time}
              </h3>
              <p style={{ 
                fontSize: '14px', 
                color: '#666',
                textAlign: 'center'
              }}>
                {board.subtitle}
              </p>
            </div>
          ))}
        </div>
      ) : selectedBoard ? (
        <div style={{
          maxWidth: '800px',
          width: '100%',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}>
          <h3 style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: selectedBoard.textColor,
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            Choose Your Ambience
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {selectedBoard.ambiences.map(ambience => (
              <div
                key={ambience.name}
                onClick={() => handleSelectAmbience(ambience.name, ambience.free)}
                style={{
                  padding: '20px',
                  borderRadius: '12px',
                  background: selectedAmbience === ambience.name 
                    ? selectedBoard.gradient 
                    : 'rgba(0, 0, 0, 0.05)',
                  border: selectedAmbience === ambience.name
                    ? `2px solid ${selectedBoard.textColor}`
                    : '2px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = selectedAmbience === ambience.name
                    ? selectedBoard.gradient
                    : 'rgba(0, 0, 0, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = selectedAmbience === ambience.name
                    ? selectedBoard.gradient
                    : 'rgba(0, 0, 0, 0.05)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ fontSize: '24px' }}>{ambience.icon}</span>
                  <span style={{ 
                    fontSize: '16px', 
                    fontWeight: '600',
                    color: selectedAmbience === ambience.name ? 'white' : selectedBoard.textColor
                  }}>
                    {ambience.name}
                  </span>
                </div>
                {!ambience.free && (
                  <Lock size={20} color={selectedAmbience === ambience.name ? 'white' : '#999'} />
                )}
              </div>
            ))}
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '15px', 
            marginTop: '30px',
            justifyContent: 'center'
          }}>
            <button
              onClick={() => setSelectedMoodboard(null)}
              style={{
                padding: '15px 30px',
                background: '#e5e7eb',
                color: '#374151',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              ← Back
            </button>
            <button
              onClick={handleBeginJournaling}
              disabled={!selectedAmbience}
              style={{
                padding: '15px 40px',
                background: selectedAmbience ? selectedBoard.gradient : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: selectedAmbience ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s',
                opacity: selectedAmbience ? 1 : 0.5
              }}
            >
              Begin Journaling
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
