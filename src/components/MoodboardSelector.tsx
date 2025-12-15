import React, { useState } from 'react';
import { Lock } from 'lucide-react';

interface MoodboardSelectorProps {
  onSelect: (moodboard: string, ambience: string) => void;
}

const moodboards = [
  {
    id: 'dawn',
    name: 'DAWN',
    title: 'DAWN JOURNALING',
    subtitle: 'MOODBOARD',
    gradient: 'linear-gradient(135deg, #E8D4D9 0%, #D4B5BD 50%, #9B8A8F 100%)',
    textColor: '#6B5559',
    titleColor: '#8B6F5F',
    themes: [
      { name: 'MIST', image: '/moodboard-dawn.jpeg' },
      { name: 'WHISPER', image: '/moodboard-dawn.jpeg' }
    ],
    icons: ['🕯️', '🌊', '🪶'],
    ambiences: [
      { name: 'Ambient Drones (low)', free: true },
      { name: 'Nature (mist forest)', free: true },
      { name: 'Ethereal Strings', free: true },
      { name: 'CEO Hymn Layer', free: false }
    ]
  },
  {
    id: 'morning',
    name: 'MORNING',
    title: 'MORNING JOURNALING',
    subtitle: 'MOODBOARD',
    gradient: 'linear-gradient(180deg, #0a0e27 0%, #1a1340 25%, #2d1f5a 50%, #8b4513 75%, #cd853f 100%)',
    textColor: '#d4a574',
    titleColor: '#d4a574',
    themes: [
      { name: 'LIGHT BLOOM', image: '/moodboard-morning.jpeg' },
      { name: 'AWAKENED PATH', image: '/moodboard-morning.jpeg' },
      { name: 'AWAKEN PRESENCE', image: '/moodboard-morning.jpeg' }
    ],
    icons: ['☀️', '🏠', '✉️'],
    ambiences: [
      { name: 'Gentle Ethno Strings', free: true },
      { name: 'Morning Beds', free: true },
      { name: 'Soft Piano', free: true }
    ]
  },
  {
    id: 'afternoon',
    name: 'AFTERNOON',
    title: 'AFTERNOON JOURNALING',
    subtitle: 'MOODBOARD',
    gradient: 'linear-gradient(135deg, #87CEEB 0%, #6BA3C9 50%, #4A7BA7 100%)',
    textColor: '#1E3A5F',
    titleColor: '#2C4F6F',
    themes: [
      { name: 'CLEAR SKY', image: '/moodboard-afternoon.jpeg' },
      { name: 'FOCUS', image: '/moodboard-afternoon.jpeg' }
    ],
    icons: ['☁️', '🌅', '📖'],
    ambiences: [
      { name: 'Ocean Waves', free: true },
      { name: 'Wind Chimes', free: true },
      { name: 'Ambient Pads', free: true }
    ]
  },
  {
    id: 'mid-afternoon',
    name: 'MID-AFTERNOON',
    title: 'MID-AFTERNOON JOURNALING',
    subtitle: 'MOODBOARD',
    gradient: 'linear-gradient(135deg, #F0E68C 0%, #DAA520 50%, #B8860B 100%)',
    textColor: '#704214',
    titleColor: '#8B5A13',
    themes: [
      { name: 'GOLDEN HOUR', image: '/moodboard-afternoon.jpeg' }
    ],
    icons: ['🌤️', '☕', '📚'],
    ambiences: [
      { name: 'Café Ambience', free: true },
      { name: 'Light Rain', free: true },
      { name: 'Acoustic Guitar', free: true }
    ]
  },
  {
    id: 'evening',
    name: 'EVENING',
    title: 'EVENING JOURNALING',
    subtitle: 'MOODBOARD',
    gradient: 'linear-gradient(135deg, #2a1810 0%, #3d2416 50%, #52301c 100%)',
    textColor: '#D4A574',
    titleColor: '#D4A574',
    themes: [
      { name: 'DUSK', image: '/moodboard-evening.jpeg' },
      { name: 'GLOW', image: '/moodboard-evening.jpeg' }
    ],
    icons: ['🏮', '🌅', '✉️'],
    ambiences: [
      { name: 'Ambient Drones (low)', free: true },
      { name: 'Nature (dusk forest)', free: true },
      { name: 'Harmonic Strings', free: true },
      { name: 'CEO Hymn Layer', free: false }
    ]
  },
  {
    id: 'night',
    name: 'NIGHT',
    title: 'NIGHT JOURNALING',
    subtitle: 'MOODBOARD',
    gradient: 'linear-gradient(135deg, #0f0a1e 0%, #1a0f2e 50%, #25143d 100%)',
    textColor: '#C8B8D8',
    titleColor: '#C8B8D8',
    themes: [
      { name: 'MOONLIGHT', image: '/moodboard-night.jpeg' },
      { name: 'DREAMS', image: '/moodboard-night.jpeg' }
    ],
    icons: ['🌙', '⭐', '🕯️'],
    ambiences: [
      { name: 'Night Crickets', free: true },
      { name: 'Deep Meditation', free: true },
      { name: 'Tibetan Bowls', free: true }
    ]
  }
];

// Function to get current time-based moodboard
const getCurrentTimeBasedMoodboard = (): string => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 7) return 'dawn';           // 5 AM - 7 AM
  if (hour >= 7 && hour < 12) return 'morning';       // 7 AM - 12 PM
  if (hour >= 12 && hour < 15) return 'afternoon';    // 12 PM - 3 PM
  if (hour >= 15 && hour < 17) return 'mid-afternoon'; // 3 PM - 5 PM
  if (hour >= 17 && hour < 21) return 'evening';      // 5 PM - 9 PM
  return 'night';                                      // 9 PM - 5 AM
};

export const MoodboardSelector: React.FC<MoodboardSelectorProps> = ({ onSelect }) => {
  const [selectedMoodboard, setSelectedMoodboard] = useState<string>(getCurrentTimeBasedMoodboard());
  const [selectedAmbience, setSelectedAmbience] = useState<string | null>(null);

  const selectedBoard = moodboards.find(m => m.id === selectedMoodboard) || moodboards[1];

  const handleSelectAmbience = (ambienceName: string, isFree: boolean) => {
    if (!isFree) {
      alert('🔒 Premium feature - Upgrade to unlock');
      return;
    }
    setSelectedAmbience(ambienceName);
  };

  const handleBeginJournaling = () => {
    if (selectedMoodboard && selectedAmbience) {
      onSelect(selectedMoodboard, selectedAmbience);
    } else {
      alert('Please select an ambience first');
    }
  };

  return (
    <div 
      style={{
        minHeight: '100vh',
        background: selectedBoard.gradient,
        padding: '40px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transition: 'background 0.5s ease'
      }}
    >
      {/* Curved Time Navigation */}
      <div style={{ 
        width: '100%', 
        maxWidth: '700px',
        marginBottom: '40px',
        position: 'relative'
      }}>
        <svg viewBox="0 0 700 120" style={{ width: '100%', height: 'auto' }}>
          {/* Curve line */}
          <path
            d="M 50 100 Q 350 10, 650 100"
            fill="none"
            stroke={selectedBoard.textColor}
            strokeWidth="2"
            opacity="0.4"
          />
          
          {/* Time points */}
          {moodboards.map((board, index) => {
            const totalBoards = moodboards.length;
            const angle = (index / (totalBoards - 1)) * Math.PI;
            const x = 50 + Math.cos(Math.PI - angle) * 300;
            const y = 100 - Math.sin(angle) * 70;
            const isSelected = selectedMoodboard === board.id;
            
            return (
              <g key={board.id}>
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? "8" : "5"}
                  fill={isSelected ? selectedBoard.textColor : 'rgba(255,255,255,0.4)'}
                  style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                  onClick={() => {
                    setSelectedMoodboard(board.id);
                    setSelectedAmbience(null);
                  }}
                />
                <text
                  x={x}
                  y={y - 20}
                  textAnchor="middle"
                  fill={selectedBoard.textColor}
                  fontSize={isSelected ? "14" : "11"}
                  fontWeight={isSelected ? "700" : "400"}
                  style={{ 
                    cursor: 'pointer', 
                    userSelect: 'none',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}
                  onClick={() => {
                    setSelectedMoodboard(board.id);
                    setSelectedAmbience(null);
                  }}
                >
                  {board.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Title Section */}
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <div style={{ 
          fontSize: '14px', 
          fontWeight: '500',
          color: selectedBoard.textColor,
          letterSpacing: '3px',
          marginBottom: '15px',
          opacity: 0.8
        }}>
          {selectedBoard.name}
        </div>
        <h1 style={{ 
          fontSize: '56px', 
          fontWeight: '700', 
          color: selectedBoard.titleColor,
          margin: 0,
          marginBottom: '5px',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          textShadow: '0 2px 20px rgba(0,0,0,0.2)'
        }}>
          {selectedBoard.name}
        </h1>
        <h1 style={{ 
          fontSize: '56px', 
          fontWeight: '700', 
          color: selectedBoard.titleColor,
          margin: 0,
          marginBottom: '15px',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          textShadow: '0 2px 20px rgba(0,0,0,0.2)'
        }}>
          JOURNALING
        </h1>
        <div style={{ 
          fontSize: '18px', 
          fontWeight: '400',
          color: selectedBoard.textColor,
          letterSpacing: '4px',
          opacity: 0.9
        }}>
          {selectedBoard.subtitle}
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '30px',
        maxWidth: '900px',
        width: '100%',
        marginBottom: '40px'
      }}>
        {/* Left Column - Default Ambience */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.4)',
          borderRadius: '12px',
          padding: '40px 30px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '30px',
          backdropFilter: 'blur(10px)'
        }}>
          {/* Icons */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '30px',
            alignItems: 'center'
          }}>
            {selectedBoard.icons.map((icon, idx) => (
              <div key={idx} style={{ 
                fontSize: '60px',
                filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))',
                opacity: 0.8
              }}>
                {icon}
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ 
            width: '80%', 
            height: '2px', 
            background: selectedBoard.textColor,
            opacity: 0.3,
            margin: '10px 0'
          }}></div>

          {/* Default Ambience Text */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: '600',
              color: selectedBoard.textColor,
              letterSpacing: '2px',
              marginBottom: '20px',
              textTransform: 'uppercase'
            }}>
              DEFAULT AMBIENCE
            </div>

            {/* Ambience List */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px',
              alignItems: 'flex-start',
              width: '100%'
            }}>
              {selectedBoard.ambiences.map((ambience, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleSelectAmbience(ambience.name, ambience.free)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '14px',
                    color: selectedBoard.textColor,
                    cursor: 'pointer',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    width: '100%',
                    background: selectedAmbience === ambience.name 
                      ? 'rgba(255,255,255,0.15)' 
                      : 'transparent',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    if (ambience.free) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = selectedAmbience === ambience.name 
                      ? 'rgba(255,255,255,0.15)' 
                      : 'transparent';
                  }}
                >
                  <span style={{ fontSize: '10px' }}>○</span>
                  <span>{ambience.name}</span>
                  {!ambience.free && (
                    <Lock size={14} style={{ marginLeft: 'auto' }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Theme Images */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {selectedBoard.themes.map((theme, idx) => (
            <div 
              key={idx}
              style={{
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                height: selectedBoard.themes.length === 2 ? '220px' : '150px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                cursor: 'pointer',
                transition: 'transform 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <img 
                src={theme.image} 
                alt={theme.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '20px',
                background: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(5px)',
                color: selectedBoard.textColor,
                fontSize: '15px',
                fontWeight: '600',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                textAlign: 'center'
              }}>
                {theme.name}
              </div>
            </div>
          ))}

          {/* CEO Hymn Layer (if available) */}
          {selectedBoard.ambiences.some(a => a.name.includes('CEO Hymn')) && (
            <div style={{
              background: 'rgba(0, 0, 0, 0.6)',
              borderRadius: '12px',
              padding: '25px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              color: selectedBoard.textColor,
              fontSize: '16px',
              fontWeight: '600',
              letterSpacing: '1px',
              backdropFilter: 'blur(10px)',
              flex: 1
            }}>
              <Lock size={20} />
              <span>CEO Hymn Layer</span>
            </div>
          )}
        </div>
      </div>

      {/* Begin Journaling Button */}
      <button
        onClick={handleBeginJournaling}
        disabled={!selectedAmbience}
        style={{
          padding: '20px 60px',
          fontSize: '18px',
          fontWeight: '700',
          color: 'white',
          background: selectedAmbience 
            ? `linear-gradient(135deg, ${selectedBoard.textColor}, ${selectedBoard.titleColor})` 
            : 'rgba(0,0,0,0.3)',
          border: 'none',
          borderRadius: '50px',
          cursor: selectedAmbience ? 'pointer' : 'not-allowed',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          boxShadow: selectedAmbience ? '0 8px 30px rgba(0,0,0,0.3)' : 'none',
          transition: 'all 0.3s',
          opacity: selectedAmbience ? 1 : 0.5
        }}
        onMouseEnter={(e) => {
          if (selectedAmbience) {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = selectedAmbience ? '0 8px 30px rgba(0,0,0,0.3)' : 'none';
        }}
      >
        BEGIN JOURNALING
      </button>

      <style>{`
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: '1fr 1fr'"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MoodboardSelector;
