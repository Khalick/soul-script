import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { useJournalStore, JournalEntry } from '../stores/journalStore';
import { getMoodColor } from '../data/emotions';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useSettingsStore } from '../stores/settingsStore';
import { getGradientBackground } from '../lib/colorUtils';

interface EmotionalTimelineProps {
  onEntryClick?: (entry: JournalEntry) => void;
}

const EmotionalTimeline: React.FC<EmotionalTimelineProps> = ({ onEntryClick }) => {
  const { entries } = useJournalStore();
  const { favoriteColor, favoriteEmoji } = useSettingsStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

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

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEntriesForDay = (day: Date) => {
    return entries.filter((entry) =>
      isSameDay(new Date(entry.created_at), day)
    );
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  return (
    <div className="dashboard-page" style={{
      background: getGradientBackground(favoriteColor)
    }}>
      <div className="dashboard-orb dashboard-orb1" style={{ background: `${favoriteColor}40` }}></div>
      <div className="dashboard-orb dashboard-orb2" style={{ background: `${favoriteColor}30` }}></div>
      <div className="dashboard-orb dashboard-orb3" style={{ background: `${favoriteColor}50` }}></div>
      <div className="dashboard-content-wrapper">
        <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
          <div className="text-center" style={{ animation: 'fadeIn 1s ease-out' }}>
            <h1 style={{ fontSize: '48px', fontWeight: '700', color: 'white', textShadow: '0 0 40px rgba(255, 255, 255, 0.5)', marginBottom: '15px', animation: 'glow 3s ease-in-out infinite' }}>
              {favoriteEmoji} Your Emotional Journey
            </h1>
            <p style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.9)' }}>
              See how you've been feeling over time
            </p>
          </div>

          <div className="dashboard-card" style={{ animationDelay: '0.3s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <button onClick={goToPreviousMonth} style={{ padding: '12px 16px', background: 'rgba(255, 255, 255, 0.15)', border: '2px solid rgba(255, 255, 255, 0.3)', borderRadius: '12px', color: 'white', cursor: 'pointer', transition: 'all 0.3s', display: 'flex', alignItems: 'center' }}>
                <ChevronLeft size={24} />
              </button>
              <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'white' }}>
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <button onClick={goToNextMonth} style={{ padding: '12px 16px', background: 'rgba(255, 255, 255, 0.15)', border: '2px solid rgba(255, 255, 255, 0.3)', borderRadius: '12px', color: 'white', cursor: 'pointer', transition: 'all 0.3s', display: 'flex', alignItems: 'center' }}>
                <ChevronRight size={24} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} style={{ textAlign: 'center', fontSize: '14px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.7)', paddingBottom: '10px' }}>
                  {day}
                </div>
              ))}

              {daysInMonth.map((day) => {
                const dayEntries = getEntriesForDay(day);
                const hasEntries = dayEntries.length > 0;
                const dominantMood = hasEntries ? dayEntries[0].mood : null;
                const moodColor = dominantMood ? getMoodColor(dominantMood) : 'rgba(255, 255, 255, 0.1)';

                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => dayEntries.length > 0 && setSelectedEntry(dayEntries[0])}
                    style={{ aspectRatio: '1', padding: '10px', borderRadius: '12px', border: hasEntries ? `2px solid ${moodColor}` : '2px solid rgba(255, 255, 255, 0.2)', background: hasEntries ? `linear-gradient(135deg, ${moodColor}30, ${moodColor}10)` : 'rgba(255, 255, 255, 0.05)', cursor: hasEntries ? 'pointer' : 'default', transition: 'all 0.3s', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <span style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>
                      {format(day, 'd')}
                    </span>
                    {hasEntries && (
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: moodColor, boxShadow: `0 0 10px ${moodColor}` }} />
                    )}
                    {dayEntries.length > 1 && (
                      <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)' }}>
                        +{dayEntries.length - 1}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {selectedEntry && (
            <div className="dashboard-card" style={{ animationDelay: '0.5s', position: 'relative' }}>
              <button onClick={() => setSelectedEntry(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255, 255, 255, 0.2)', border: 'none', borderRadius: '50%', width: '35px', height: '35px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
                <X size={20} color="white" />
              </button>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>
                  {selectedEntry.title || 'Untitled Entry'}
                </h3>
                <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '10px' }}>
                  {format(new Date(selectedEntry.created_at), 'PPpp')}
                </p>
                <div style={{ display: 'inline-block', padding: '8px 20px', borderRadius: '25px', background: getMoodColor(selectedEntry.mood), color: 'white', fontSize: '14px', fontWeight: '600' }}>
                  {selectedEntry.mood} • Intensity {selectedEntry.intensity}/10
                </div>
              </div>
              {selectedEntry.text_content && (
                <p style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.9)', lineHeight: '1.6', whiteSpace: 'pre-wrap', marginBottom: '20px' }}>
                  {selectedEntry.text_content}
                </p>
              )}
              {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                  {selectedEntry.tags.map((tag, idx) => (
                    <span key={idx} style={{ padding: '6px 15px', background: 'rgba(255, 255, 255, 0.15)', border: '2px solid rgba(255, 255, 255, 0.3)', borderRadius: '20px', fontSize: '14px', color: 'white' }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <button 
                  onClick={() => onEntryClick && onEntryClick(selectedEntry)}
                  style={{
                    padding: '12px 30px',
                    background: `linear-gradient(135deg, ${favoriteColor}, ${favoriteColor}cc)`,
                    border: 'none',
                    borderRadius: '25px',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: `0 8px 20px ${favoriteColor}40`,
                    transition: 'all 0.3s'
                  }}
                >
                  ✏️ Edit Entry
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmotionalTimeline;
