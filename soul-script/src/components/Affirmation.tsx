import React, { useState, useEffect } from 'react';
import { X, Heart } from 'lucide-react';
import { useSettingsStore } from '../stores/settingsStore';

interface AffirmationProps {
  onClose: () => void;
}

const affirmations = [
  "Thank you for being honest with yourself today 💜",
  "Your feelings are valid and worthy of acknowledgment 🌟",
  "You showed up for yourself today, and that's beautiful ✨",
  "Every word you wrote matters. You matter 💖",
  "Being vulnerable takes courage. You're so brave 🦋",
  "Your thoughts deserve to be heard, even if only by you 🌸",
  "You're doing better than you think you are 🌈",
  "This moment of reflection is a gift to your future self 💫",
  "Thank you for taking time to understand yourself 🔮",
  "Your journey is uniquely yours, and it's perfect 🌺",
  "You're not alone in what you're feeling 🤝",
  "Your story is still being written, and it's incredible 📖",
];

export const Affirmation: React.FC<AffirmationProps> = ({ onClose }) => {
  const { favoriteColor, favoriteEmoji } = useSettingsStore();
  const [affirmation] = useState(() => affirmations[Math.floor(Math.random() * affirmations.length)]);
  const [showBreathing, setShowBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathCount, setBreathCount] = useState(0);

  useEffect(() => {
    if (showBreathing) {
      const phases: Array<'inhale' | 'hold' | 'exhale'> = ['inhale', 'hold', 'exhale'];
      const durations = { inhale: 4000, hold: 4000, exhale: 4000 };
      let currentPhaseIndex = 0;
      let count = 0;

      const cycleBreath = () => {
        const phase = phases[currentPhaseIndex];
        setBreathPhase(phase);
        
        setTimeout(() => {
          currentPhaseIndex = (currentPhaseIndex + 1) % phases.length;
          if (currentPhaseIndex === 0) {
            count++;
            setBreathCount(count);
          }
          if (count < 3) {
            cycleBreath();
          }
        }, durations[phase]);
      };

      cycleBreath();
    }
  }, [showBreathing]);

  const getBreathText = () => {
    switch (breathPhase) {
      case 'inhale':
        return 'Breathe in...';
      case 'hold':
        return 'Hold...';
      case 'exhale':
        return 'Breathe out...';
    }
  };

  const getBreathScale = () => {
    switch (breathPhase) {
      case 'inhale':
        return 'scale-150';
      case 'hold':
        return 'scale-150';
      case 'exhale':
        return 'scale-100';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        animation: 'fadeIn 0.3s ease-out',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: `linear-gradient(135deg, ${favoriteColor}20, ${favoriteColor}40)`,
          border: `2px solid ${favoriteColor}60`,
          borderRadius: '30px',
          padding: '40px',
          maxWidth: '500px',
          width: '90%',
          boxShadow: `0 0 60px ${favoriteColor}40`,
          animation: 'scaleIn 0.4s ease-out',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <X size={20} color="white" />
        </button>

        {!showBreathing ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div
                style={{
                  fontSize: '60px',
                  marginBottom: '20px',
                  animation: 'float 3s ease-in-out infinite',
                }}
              >
                {favoriteEmoji}
              </div>
              <h2
                style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: 'white',
                  marginBottom: '20px',
                  textShadow: '0 0 20px rgba(255, 255, 255, 0.3)',
                }}
              >
                Entry Saved!
              </h2>
              <p
                style={{
                  fontSize: '18px',
                  color: 'rgba(255, 255, 255, 0.95)',
                  lineHeight: '1.6',
                  fontWeight: '500',
                }}
              >
                {affirmation}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowBreathing(true)}
                style={{
                  padding: '15px 30px',
                  background: `linear-gradient(135deg, ${favoriteColor}, ${favoriteColor}cc)`,
                  border: 'none',
                  borderRadius: '15px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: `0 4px 15px ${favoriteColor}40`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 6px 20px ${favoriteColor}60`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 4px 15px ${favoriteColor}40`;
                }}
              >
                <Heart size={18} />
                Take a Breath
              </button>

              <button
                onClick={onClose}
                style={{
                  padding: '15px 30px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '15px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Continue
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <h2
              style={{
                fontSize: '24px',
                fontWeight: '700',
                color: 'white',
                marginBottom: '40px',
              }}
            >
              {getBreathText()}
            </h2>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '40px',
              }}
            >
              <div
                className={getBreathScale()}
                style={{
                  width: '150px',
                  height: '150px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${favoriteColor}60, ${favoriteColor}20)`,
                  border: `3px solid ${favoriteColor}`,
                  transition: 'transform 4s ease-in-out',
                  boxShadow: `0 0 40px ${favoriteColor}60`,
                }}
              />
            </div>

            <p
              style={{
                fontSize: '16px',
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: '20px',
              }}
            >
              Cycle {breathCount + 1} of 3
            </p>

            {breathCount >= 3 && (
              <button
                onClick={onClose}
                style={{
                  padding: '15px 40px',
                  background: `linear-gradient(135deg, ${favoriteColor}, ${favoriteColor}cc)`,
                  border: 'none',
                  borderRadius: '15px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: `0 4px 15px ${favoriteColor}40`,
                  animation: 'fadeIn 0.5s ease-out',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 6px 20px ${favoriteColor}60`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 4px 15px ${favoriteColor}40`;
                }}
              >
                Done
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
