import { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { useSettingsStore } from '../stores/settingsStore';

interface ConstellationsProps {
  posts: any[];
  onConstellationClick: (hashtag: string) => void;
}

interface Constellation {
  name: string;
  emoji: string;
  hashtags: string[];
  postCount: number;
  color: string;
  description: string;
}

export function Constellations({ posts, onConstellationClick }: ConstellationsProps) {
  const { favoriteColor } = useSettingsStore();

  const constellations = useMemo((): Constellation[] => {
    if (posts.length === 0) return [];

    // Define emotion constellation themes
    const constellationMap: Record<string, { emoji: string; keywords: string[]; color: string; description: string }> = {
      'Healing': {
        emoji: '🌱',
        keywords: ['healing', 'growth', 'recovery', 'hope', 'peace', 'better', 'forward'],
        color: '#4ade80',
        description: 'Finding your way back to wholeness'
      },
      'Grief': {
        emoji: '🌧️',
        keywords: ['grief', 'loss', 'missing', 'goodbye', 'remember', 'gone', 'lost'],
        color: '#708090',
        description: 'Honoring what was, accepting what is'
      },
      'Love': {
        emoji: '💖',
        keywords: ['love', 'grateful', 'thankful', 'blessed', 'appreciate', 'cherish', 'adore'],
        color: '#ff6b9d',
        description: 'The warmth that connects us all'
      },
      'Struggle': {
        emoji: '⛰️',
        keywords: ['hard', 'difficult', 'struggle', 'tired', 'exhausted', 'overwhelmed', 'heavy'],
        color: '#696969',
        description: 'Climbing through the difficult terrain'
      },
      'Joy': {
        emoji: '✨',
        keywords: ['happy', 'joy', 'excited', 'amazing', 'wonderful', 'beautiful', 'grateful'],
        color: '#FDB813',
        description: 'Moments that light us up from within'
      },
      'Loneliness': {
        emoji: '🌙',
        keywords: ['lonely', 'alone', 'isolated', 'disconnected', 'empty', 'distant', 'apart'],
        color: '#4B0082',
        description: 'The space between us and others'
      },
      'Anxiety': {
        emoji: '🌪️',
        keywords: ['anxious', 'worried', 'fear', 'scared', 'nervous', 'stress', 'panic'],
        color: '#FF6347',
        description: 'When the mind races ahead of the heart'
      },
      'Peace': {
        emoji: '🕊️',
        keywords: ['calm', 'peaceful', 'serene', 'quiet', 'still', 'content', 'tranquil'],
        color: '#87CEEB',
        description: 'The stillness we all seek'
      },
      'Transformation': {
        emoji: '🦋',
        keywords: ['change', 'transform', 'becoming', 'new', 'different', 'evolving', 'shift'],
        color: '#9370DB',
        description: 'Shedding old skins, growing new wings'
      },
      'Uncertainty': {
        emoji: '🌫️',
        keywords: ['unsure', 'confused', 'uncertain', 'lost', 'question', 'wondering', 'doubt'],
        color: '#778899',
        description: 'Walking through the fog of not-knowing'
      }
    };

    // Count posts per constellation
    const constellationCounts: Record<string, { hashtags: Set<string>; count: number }> = {};

    posts.forEach(post => {
      const content = (post.text_content || '').toLowerCase();
      const tags = post.hashtags || [];

      Object.entries(constellationMap).forEach(([name, config]) => {
        const matches = config.keywords.some(keyword => 
          content.includes(keyword.toLowerCase()) ||
          tags.some((tag: string) => tag.toLowerCase().includes(keyword.toLowerCase()))
        );

        if (matches) {
          if (!constellationCounts[name]) {
            constellationCounts[name] = { hashtags: new Set(), count: 0 };
          }
          constellationCounts[name].count++;
          tags.forEach((tag: string) => constellationCounts[name].hashtags.add(tag));
        }
      });
    });

    // Build constellation objects
    const results: Constellation[] = Object.entries(constellationCounts)
      .filter(([_, data]) => data.count >= 2) // At least 2 posts
      .map(([name, data]) => ({
        name,
        emoji: constellationMap[name].emoji,
        hashtags: Array.from(data.hashtags),
        postCount: data.count,
        color: constellationMap[name].color,
        description: constellationMap[name].description,
      }))
      .sort((a, b) => b.postCount - a.postCount)
      .slice(0, 6); // Top 6 constellations

    return results;
  }, [posts]);

  if (constellations.length === 0) {
    return null;
  }

  return (
    <div
      className="dashboard-card"
      style={{
        marginBottom: '30px',
        animation: 'fadeIn 1s ease-out',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Sparkles size={24} color={favoriteColor} />
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'white', margin: 0 }}>
          Constellations
        </h2>
      </div>
      <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '24px' }}>
        Emotional themes connecting The Quiet
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {constellations.map((constellation) => (
          <div
            key={constellation.name}
            onClick={() => {
              // Click first hashtag to filter
              if (constellation.hashtags.length > 0) {
                onConstellationClick(constellation.hashtags[0].replace('#', ''));
              }
            }}
            style={{
              background: `linear-gradient(135deg, ${constellation.color}30, ${constellation.color}15)`,
              border: `2px solid ${constellation.color}50`,
              borderRadius: '16px',
              padding: '20px',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = `0 8px 25px ${constellation.color}40`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'start', gap: '12px', marginBottom: '12px' }}>
              <span style={{ fontSize: '32px', lineHeight: 1 }}>{constellation.emoji}</span>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'white', margin: 0, marginBottom: '6px' }}>
                  {constellation.name}
                </h3>
                <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', margin: 0, fontStyle: 'italic' }}>
                  {constellation.description}
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '12px',
                borderTop: `1px solid ${constellation.color}30`,
              }}
            >
              <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600' }}>
                {constellation.postCount} {constellation.postCount === 1 ? 'moment' : 'moments'}
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {constellation.hashtags.slice(0, 3).map((tag, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: '11px',
                      color: constellation.color,
                      background: `${constellation.color}20`,
                      padding: '4px 8px',
                      borderRadius: '8px',
                      fontWeight: '600',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
