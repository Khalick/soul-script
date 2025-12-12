import { useMemo } from 'react';
import { useJournalStore } from '../stores/journalStore';
import { useSettingsStore } from '../stores/settingsStore';
import { Hash } from 'lucide-react';

export function WordFrequency() {
  const { entries } = useJournalStore();
  const { favoriteColor } = useSettingsStore();

  const topWords = useMemo(() => {
    if (entries.length === 0) {
      return [];
    }

    // Common words to exclude
    const stopWords = new Set([
      'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for',
      'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by',
      'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all',
      'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get',
      'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him',
      'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them',
      'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over',
      'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first',
      'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day',
      'most', 'us', 'is', 'was', 'am', 'are', 'been', 'being', 'had', 'has', 'did',
      'does', 'doing', 'done', 'very', 'much', 'more', 'really', 'still', 'today',
      'yesterday', 'tomorrow', 'im', 'ive', 'dont', 'cant', 'wont', 'didnt', 'doesnt'
    ]);

    const wordCounts: Record<string, number> = {};

    entries.forEach(entry => {
      if (!entry.text_content) return;

      // Extract words (remove punctuation, convert to lowercase)
      const words = entry.text_content
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3 && !stopWords.has(word));

      words.forEach(word => {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      });
    });

    // Get top 15 words
    const sortedWords = Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([word, count], index) => ({
        word,
        count,
        color: getWordColor(index),
      }));

    return sortedWords;
  }, [entries]);

  function getWordColor(index: number): string {
    const colors = [
      '#FF6B9D', '#C44569', '#FFA07A', '#FFD700', '#87CEEB',
      '#98D8C8', '#6C5CE7', '#A29BFE', '#FD79A8', '#FDCB6E',
      '#74B9FF', '#A29BFE', '#55EFC4', '#FF7675', '#DFE6E9'
    ];
    return colors[index % colors.length];
  }

  if (topWords.length === 0) {
    return null;
  }

  return (
    <div
      className="dashboard-card"
      style={{
        animationDelay: '0.6s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Hash size={24} color={favoriteColor} />
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'white', margin: 0 }}>
          Words That Echo
        </h2>
      </div>
      <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '20px' }}>
        The language of your inner world
      </p>

      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '12px',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        {topWords.map((item) => {
          const maxCount = topWords[0].count;
          const minSize = 14;
          const maxSize = 32;
          const fontSize = minSize + ((item.count / maxCount) * (maxSize - minSize));

          return (
            <div
              key={item.word}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: `${item.color}20`,
                border: `2px solid ${item.color}40`,
                borderRadius: '20px',
                transition: 'all 0.3s',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.background = `${item.color}30`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = `${item.color}20`;
              }}
            >
              <span
                style={{
                  fontSize: `${fontSize}px`,
                  fontWeight: '700',
                  color: item.color,
                  textShadow: `0 0 10px ${item.color}40`,
                }}
              >
                {item.word}
              </span>
              <span
                style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: '600',
                }}
              >
                {item.count}
              </span>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: '24px',
          padding: '16px',
          background: `${favoriteColor}15`,
          borderRadius: '12px',
          borderLeft: `3px solid ${favoriteColor}`,
        }}
      >
        <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.85)', margin: 0, fontStyle: 'italic' }}>
          💭 These are the words you return to, the themes that shape your inner narrative.
        </p>
      </div>
    </div>
  );
}
