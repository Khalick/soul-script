import { useEffect, useState } from 'react';
import { useJournalStore } from '../stores/journalStore';
import { Clock, Sparkles } from 'lucide-react';

export function OnThisDay() {
  const entries = useJournalStore((state) => state.entries);
  const [pastEntries, setPastEntries] = useState<Array<{ entry: any; yearsAgo: number }>>([]);

  useEffect(() => {
    const today = new Date();
    const todayMonth = today.getMonth();
    const todayDay = today.getDate();

    // Find entries from previous years on this date
    const matches = entries
      .filter((entry) => {
        const entryDate = new Date(entry.created_at);
        return (
          entryDate.getMonth() === todayMonth &&
          entryDate.getDate() === todayDay &&
          entryDate.getFullYear() !== today.getFullYear()
        );
      })
      .map((entry) => {
        const entryDate = new Date(entry.created_at);
        const yearsAgo = today.getFullYear() - entryDate.getFullYear();
        return { entry, yearsAgo };
      })
      .sort((a, b) => b.yearsAgo - a.yearsAgo); // Most recent first

    setPastEntries(matches);
  }, [entries]);

  if (pastEntries.length === 0) return null;

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '24px',
        border: '2px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        marginBottom: '24px',
        animation: 'fadeIn 0.8s ease-out'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <Clock size={24} style={{ color: '#06b6d4' }} />
        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: 'white' }}>
          On This Day
        </h3>
        <Sparkles size={20} style={{ color: '#fbbf24' }} />
      </div>

      {pastEntries.map(({ entry, yearsAgo }) => (
        <div
          key={entry.id}
          style={{
            background: 'rgba(6, 182, 212, 0.1)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '12px',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(6, 182, 212, 0.2)';
            e.currentTarget.style.transform = 'translateX(4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(6, 182, 212, 0.1)';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#06b6d4' }}>
              {yearsAgo} year{yearsAgo !== 1 ? 's' : ''} ago
            </span>
            <span style={{ fontSize: '24px' }}>{getMoodEmoji(entry.mood)}</span>
          </div>

          {entry.title && (
            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: 'white' }}>
              {entry.title}
            </h4>
          )}

          {entry.text_content && (
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: '1.5',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical'
            }}>
              {entry.text_content}
            </p>
          )}

          <div style={{ marginTop: '12px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', fontStyle: 'italic' }}>
            "Look how far you've come..."
          </div>
        </div>
      ))}

      {pastEntries.length > 0 && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: 'rgba(251, 191, 36, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(251, 191, 36, 0.3)',
          textAlign: 'center',
          fontSize: '14px',
          color: '#fbbf24',
          fontWeight: '500'
        }}>
          ✨ You've journaled through {pastEntries.reduce((sum, p) => sum + p.yearsAgo, 0)} years of growth
        </div>
      )}
    </div>
  );
}

function getMoodEmoji(mood: string): string {
  const moodMap: Record<string, string> = {
    joyful: '😊',
    peaceful: '😌',
    excited: '🤩',
    grateful: '🙏',
    hopeful: '🌟',
    content: '😊',
    sad: '😢',
    anxious: '😰',
    angry: '😠',
    overwhelmed: '😫',
    lonely: '😔',
    frustrated: '😤',
    confused: '😕',
    numb: '😶',
    melancholic: '🌧️',
    nostalgic: '🍂',
    restless: '😖',
    vulnerable: '💔',
    empowered: '💪',
    reflective: '🤔'
  };

  return moodMap[mood.toLowerCase()] || '💭';
}
