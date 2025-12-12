import { useMemo } from 'react';
import { useJournalStore } from '../stores/journalStore';
import { useSettingsStore } from '../stores/settingsStore';
import { TrendingUp } from 'lucide-react';

interface Thread {
  theme: string;
  count: number;
  recentEntry: string;
  emoji: string;
}

export function EmotionalThreads() {
  const { entries } = useJournalStore();
  const { favoriteColor } = useSettingsStore();

  const threads = useMemo(() => {
    // Extract common themes from entries
    const themeMap: Record<string, { count: number; entries: string[] }> = {};
    
    // Keywords that indicate emotional themes
    const themeKeywords: Record<string, { keywords: string[]; emoji: string }> = {
      'Healing': { keywords: ['heal', 'healing', 'recovery', 'better', 'grow', 'growth'], emoji: '🌱' },
      'Grief': { keywords: ['loss', 'grief', 'miss', 'gone', 'lost', 'mourning'], emoji: '🕊️' },
      'Love': { keywords: ['love', 'cherish', 'adore', 'heart', 'care', 'affection'], emoji: '💜' },
      'Uncertainty': { keywords: ['uncertain', 'unsure', 'confused', 'lost', 'don\'t know'], emoji: '🌫️' },
      'Strength': { keywords: ['strong', 'strength', 'resilient', 'brave', 'courage'], emoji: '💪' },
      'Peace': { keywords: ['peace', 'calm', 'serene', 'quiet', 'tranquil', 'still'], emoji: '🕊️' },
      'Hope': { keywords: ['hope', 'hopeful', 'possible', 'future', 'dream'], emoji: '✨' },
      'Fear': { keywords: ['fear', 'afraid', 'scared', 'worried', 'anxiety', 'anxious'], emoji: '🌊' },
      'Joy': { keywords: ['joy', 'happy', 'happiness', 'delight', 'bliss'], emoji: '🌟' },
      'Loneliness': { keywords: ['lonely', 'alone', 'isolated', 'solitude', 'empty'], emoji: '🌙' },
    };

    entries.forEach(entry => {
      const text = (entry.text_content || '').toLowerCase();
      const title = (entry.title || '').toLowerCase();
      const combined = `${text} ${title}`;

      Object.entries(themeKeywords).forEach(([theme, { keywords }]) => {
        const matches = keywords.some(keyword => combined.includes(keyword));
        if (matches) {
          if (!themeMap[theme]) {
            themeMap[theme] = { count: 0, entries: [] };
          }
          themeMap[theme].count++;
          themeMap[theme].entries.push(entry.text_content?.substring(0, 100) || '');
        }
      });
    });

    // Convert to array and sort by frequency
    const threadArray: Thread[] = Object.entries(themeMap)
      .filter(([_, data]) => data.count >= 2) // Only show themes that appear at least twice
      .map(([theme, data]) => ({
        theme,
        count: data.count,
        recentEntry: data.entries[data.entries.length - 1],
        emoji: themeKeywords[theme]?.emoji || '💭',
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6); // Top 6 threads

    return threadArray;
  }, [entries]);

  if (threads.length === 0) {
    return null;
  }

  return (
    <div
      className="dashboard-card"
      style={{
        animationDelay: '0.4s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <TrendingUp size={24} color={favoriteColor} />
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'white', margin: 0 }}>
          Emotional Threads
        </h2>
      </div>
      <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '20px' }}>
        Recurring themes in your journey
      </p>

      <div style={{ display: 'grid', gap: '16px' }}>
        {threads.map((thread, index) => (
          <div
            key={index}
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              padding: '16px',
              transition: 'all 0.3s',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateX(8px)';
              e.currentTarget.style.borderColor = `${favoriteColor}66`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span style={{ fontSize: '28px' }}>{thread.emoji}</span>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: 0 }}>
                  {thread.theme}
                </h3>
                <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', margin: 0 }}>
                  Appears {thread.count} {thread.count === 1 ? 'time' : 'times'} in your entries
                </p>
              </div>
              <div
                style={{
                  padding: '8px 16px',
                  background: `${favoriteColor}33`,
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: favoriteColor,
                }}
              >
                {thread.count}
              </div>
            </div>
            {thread.recentEntry && (
              <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', marginTop: '8px', fontStyle: 'italic' }}>
                "{thread.recentEntry}..."
              </p>
            )}
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: '20px',
          padding: '16px',
          background: `${favoriteColor}15`,
          borderRadius: '12px',
          borderLeft: `4px solid ${favoriteColor}`,
        }}
      >
        <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>
          💭 <strong>Insight:</strong> These threads show what's been living in your heart. They're not just words—they're the stories you keep returning to.
        </p>
      </div>
    </div>
  );
}
