import React, { useState, useEffect } from 'react';
import { emotions, quickTags } from '../data/emotions';
import { useJournalStore } from '../stores/journalStore';
import { useSettingsStore } from '../stores/settingsStore';
import { getGradientBackground } from '../lib/colorUtils';

interface EmotionCheckInProps {
  onComplete: () => void;
}

const EmotionCheckIn: React.FC<EmotionCheckInProps> = ({ onComplete }) => {
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [intensity, setIntensity] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { setCurrentEntry } = useJournalStore();
  const { favoriteColor, favoriteEmoji } = useSettingsStore();

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

  const handleMoodSelect = (moodValue: string) => {
    setSelectedMood(moodValue);
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleContinue = () => {
    setCurrentEntry({
      mood: selectedMood,
      intensity,
      tags: selectedTags,
      created_at: new Date().toISOString(),
    });
    onComplete();
  };

  return (
    <div className="dashboard-page" style={{
      background: getGradientBackground(favoriteColor)
    }}>
      <div className="dashboard-orb dashboard-orb1" style={{ background: `${favoriteColor}40` }}></div>
      <div className="dashboard-orb dashboard-orb2" style={{ background: `${favoriteColor}30` }}></div>
      <div className="dashboard-orb dashboard-orb3" style={{ background: `${favoriteColor}50` }}></div>
      <div className="dashboard-content-wrapper">
        <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
          <div className="text-center" style={{ animation: 'fadeIn 1s ease-out' }}>
            <h1 style={{ fontSize: '48px', fontWeight: '700', color: 'white', textShadow: '0 0 40px rgba(255, 255, 255, 0.5)', marginBottom: '10px', animation: 'glow 3s ease-in-out infinite' }}>
              {favoriteEmoji} How are you feeling?
            </h1>
            <p style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.9)' }}>
              ✨ Your safe space to feel everything ✨
            </p>
          </div>
          <div className="dashboard-card" style={{ animationDelay: '0.3s' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '25px', color: 'white' }}>
              💭 Choose your emotion
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '15px' }}>
              {emotions.map((emotion) => (
                <button key={emotion.value} onClick={() => handleMoodSelect(emotion.value)} style={{ background: selectedMood === emotion.value ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: selectedMood === emotion.value ? `3px solid ${emotion.color}` : '2px solid rgba(255, 255, 255, 0.2)', borderRadius: '20px', padding: '20px', cursor: 'pointer', transition: 'all 0.3s', transform: selectedMood === emotion.value ? 'scale(1.1)' : 'scale(1)', boxShadow: selectedMood === emotion.value ? `0 10px 30px ${emotion.color}40` : 'none' }}>
                  <div style={{ fontSize: '48px', marginBottom: '8px' }}>{emotion.emoji}</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.9)' }}>{emotion.name}</div>
                </button>
              ))}
            </div>
          </div>
          {selectedMood && (
            <div className="dashboard-card" style={{ animationDelay: '0.5s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'white' }}>📊 How strong is this feeling?</h2>
                <span style={{ fontSize: '42px', fontWeight: '700', color: 'white', textShadow: '0 0 20px rgba(255, 255, 255, 0.5)' }}>{intensity}</span>
              </div>
              <input type="range" min="1" max="10" value={intensity} onChange={(e) => setIntensity(parseInt(e.target.value))} style={{ width: '100%', height: '12px', borderRadius: '10px', outline: 'none', background: `linear-gradient(to right, #ff6b6b 0%, #ff6b6b ${(intensity - 1) * 11.11}%, rgba(255, 255, 255, 0.2) ${(intensity - 1) * 11.11}%, rgba(255, 255, 255, 0.2) 100%)`, cursor: 'pointer' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
                <span>😌 Mild</span>
                <span>🔥 Intense</span>
              </div>
            </div>
          )}
          {selectedMood && (
            <div className="dashboard-card" style={{ animationDelay: '0.7s' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '20px', color: 'white' }}>🏷️ Quick tags (optional)</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {quickTags.map((tag) => (
                  <button key={tag} onClick={() => handleTagToggle(tag)} style={{ padding: '12px 24px', borderRadius: '25px', fontSize: '15px', fontWeight: '600', border: 'none', cursor: 'pointer', transition: 'all 0.3s', background: selectedTags.includes(tag) ? 'linear-gradient(135deg, #06b6d4, #0e7490)' : 'rgba(255, 255, 255, 0.15)', color: 'white', boxShadow: selectedTags.includes(tag) ? '0 8px 20px rgba(14, 116, 144, 0.4)' : 'none', transform: selectedTags.includes(tag) ? 'scale(1.05)' : 'scale(1)' }}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
          {selectedMood && (
            <div style={{ display: 'flex', justifyContent: 'center', animation: 'fadeIn 1s ease-out 0.9s backwards' }}>
              <button onClick={handleContinue} className="dashboard-new-entry-btn" style={{ fontSize: '18px', padding: '18px 50px' }}>
                <span>Continue to Journal ✍️</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmotionCheckIn;
