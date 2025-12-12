import { useMemo } from 'react';
import { useJournalStore } from '../stores/journalStore';
import { useSettingsStore } from '../stores/settingsStore';
import { TrendingUp, Calendar } from 'lucide-react';

interface Pattern {
  description: string;
  frequency: string;
  insight: string;
}

export function EchoTrails() {
  const { entries } = useJournalStore();
  const { favoriteColor } = useSettingsStore();

  const patterns = useMemo(() => {
    if (entries.length < 5) {
      return [];
    }

    const detectedPatterns: Pattern[] = [];

    // Analyze by day of week
    const dayMoods: Record<string, { moods: string[]; count: number }> = {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    entries.forEach(entry => {
      const day = days[new Date(entry.created_at).getDay()];
      if (!dayMoods[day]) {
        dayMoods[day] = { moods: [], count: 0 };
      }
      dayMoods[day].moods.push(entry.mood);
      dayMoods[day].count++;
    });

    // Find patterns by day
    Object.entries(dayMoods).forEach(([day, data]) => {
      if (data.count >= 3) {
        const moodCounts: Record<string, number> = {};
        data.moods.forEach(mood => {
          moodCounts[mood] = (moodCounts[mood] || 0) + 1;
        });
        const dominantMood = Object.entries(moodCounts)
          .sort((a, b) => b[1] - a[1])[0];
        
        if (dominantMood && dominantMood[1] >= 2) {
          detectedPatterns.push({
            description: `${day}s often carry ${dominantMood[0].toLowerCase()} energy`,
            frequency: `${dominantMood[1]} of your last ${data.count} ${day} entries`,
            insight: getInsightForDayPattern(day, dominantMood[0]),
          });
        }
      }
    });

    // Analyze by time of day
    const timePatterns: Record<string, { moods: string[]; count: number }> = {
      'Morning': { moods: [], count: 0 },
      'Afternoon': { moods: [], count: 0 },
      'Evening': { moods: [], count: 0 },
      'Night': { moods: [], count: 0 },
    };

    entries.forEach(entry => {
      const hour = new Date(entry.created_at).getHours();
      let timeOfDay: string;
      if (hour >= 5 && hour < 12) timeOfDay = 'Morning';
      else if (hour >= 12 && hour < 17) timeOfDay = 'Afternoon';
      else if (hour >= 17 && hour < 21) timeOfDay = 'Evening';
      else timeOfDay = 'Night';

      timePatterns[timeOfDay].moods.push(entry.mood);
      timePatterns[timeOfDay].count++;
    });

    // Find time-based patterns
    Object.entries(timePatterns).forEach(([time, data]) => {
      if (data.count >= 3) {
        const moodCounts: Record<string, number> = {};
        data.moods.forEach(mood => {
          moodCounts[mood] = (moodCounts[mood] || 0) + 1;
        });
        const dominantMood = Object.entries(moodCounts)
          .sort((a, b) => b[1] - a[1])[0];
        
        if (dominantMood && dominantMood[1] >= 2) {
          detectedPatterns.push({
            description: `${time} tends to bring ${dominantMood[0].toLowerCase()} feelings`,
            frequency: `${dominantMood[1]} of ${data.count} entries`,
            insight: getInsightForTimePattern(time, dominantMood[0]),
          });
        }
      }
    });

    // Analyze intensity patterns
    const avgIntensity = entries.reduce((sum, e) => sum + e.intensity, 0) / entries.length;
    if (avgIntensity > 7) {
      detectedPatterns.push({
        description: 'Your emotions run deep and intense',
        frequency: `Average intensity: ${avgIntensity.toFixed(1)}/10`,
        insight: 'You experience life fully. Remember to create space for these big feelings.',
      });
    } else if (avgIntensity < 4) {
      detectedPatterns.push({
        description: 'Your emotional landscape is gentle',
        frequency: `Average intensity: ${avgIntensity.toFixed(1)}/10`,
        insight: 'There\'s wisdom in your calm. Trust the quiet moments.',
      });
    }

    return detectedPatterns.slice(0, 4); // Top 4 patterns
  }, [entries]);

  function getInsightForDayPattern(day: string, mood: string): string {
    const insights: Record<string, string> = {
      'Monday-Anxious': 'The week\'s beginning can feel heavy. Consider a grounding ritual.',
      'Friday-Excited': 'You thrive as the week winds down. That anticipation is beautiful.',
      'Sunday-Peaceful': 'You find rest in reflection. Honor this natural rhythm.',
      'Saturday-Happy': 'Freedom suits you. Make space for what brings joy.',
    };
    return insights[`${day}-${mood}`] || 'Notice this pattern. What does it tell you about your needs?';
  }

  function getInsightForTimePattern(time: string, mood: string): string {
    const insights: Record<string, string> = {
      'Morning-Anxious': 'Your mornings carry worry. What would ease you into the day?',
      'Night-Sad': 'Darkness can amplify loneliness. You\'re not alone in feeling this.',
      'Evening-Peaceful': 'You find yourself as day transitions to night. Beautiful.',
      'Afternoon-Tired': 'The day\'s middle can drain you. Rest isn\'t weakness.',
    };
    return insights[`${time}-${mood}`] || 'This rhythm is part of your story. What does it need?';
  }

  if (patterns.length === 0) {
    return null;
  }

  return (
    <div
      className="dashboard-card"
      style={{
        animationDelay: '0.5s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <TrendingUp size={24} color={favoriteColor} />
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'white', margin: 0 }}>
          Echo Trails
        </h2>
      </div>
      <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '20px' }}>
        Patterns in when and how you feel
      </p>

      <div style={{ display: 'grid', gap: '16px' }}>
        {patterns.map((pattern, index) => (
          <div
            key={index}
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              padding: '20px',
              transition: 'all 0.3s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'start', gap: '12px', marginBottom: '12px' }}>
              <Calendar size={20} color={favoriteColor} style={{ marginTop: '2px', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: 0, marginBottom: '6px' }}>
                  {pattern.description}
                </h3>
                <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', margin: 0 }}>
                  {pattern.frequency}
                </p>
              </div>
            </div>
            <div
              style={{
                padding: '12px',
                background: `${favoriteColor}15`,
                borderRadius: '10px',
                borderLeft: `3px solid ${favoriteColor}`,
              }}
            >
              <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.85)', margin: 0, fontStyle: 'italic' }}>
                💭 {pattern.insight}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
