import { useEffect, useMemo } from 'react';
import { useJournalStore } from '../stores/journalStore';
import { useSettingsStore } from '../stores/settingsStore';
import { getGradientBackground } from '../lib/colorUtils';
import { TrendingUp, Heart, Clock, Sparkles } from 'lucide-react';
import { EmotionalThreads } from './EmotionalThreads';
import { InnerWeather } from './InnerWeather';
import { EchoTrails } from './EchoTrails';
import { WordFrequency } from './WordFrequency';

export function Analytics() {
  const entries = useJournalStore((state) => state.entries);
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

  const analytics = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const last30Days = entries.filter(e => new Date(e.created_at) >= thirtyDaysAgo);
    const last7Days = entries.filter(e => new Date(e.created_at) >= sevenDaysAgo);

    // Mood counts
    const moodCounts: Record<string, number> = {};
    last30Days.forEach(e => {
      moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
    });

    const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];

    // Average intensity
    const avgIntensity = last30Days.length > 0
      ? last30Days.reduce((sum, e) => sum + e.intensity, 0) / last30Days.length
      : 0;

    // Most common time
    const hours = last30Days.map(e => new Date(e.created_at).getHours());
    const hourCounts: Record<number, number> = {};
    hours.forEach(h => {
      hourCounts[h] = (hourCounts[h] || 0) + 1;
    });
    const mostCommonHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];

    // Streak calculation
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const dateSet = new Set(
      sortedEntries.map(e => new Date(e.created_at).toDateString())
    );

    // Current streak
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      if (dateSet.has(checkDate.toDateString())) {
        currentStreak++;
      } else if (i > 0) {
        break;
      }
    }

    // Longest streak
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      if (dateSet.has(checkDate.toDateString())) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Weekly mood trend
    const weeklyMoods: Array<{ day: string; mood: string; intensity: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayEntries = entries.filter(e => 
        new Date(e.created_at).toDateString() === date.toDateString()
      );
      if (dayEntries.length > 0) {
        const avgMoodIntensity = dayEntries.reduce((sum, e) => sum + e.intensity, 0) / dayEntries.length;
        const mostCommonMood = dayEntries.sort((a, b) => 
          dayEntries.filter(x => x.mood === b.mood).length - 
          dayEntries.filter(x => x.mood === a.mood).length
        )[0]?.mood || 'neutral';
        
        weeklyMoods.push({
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          mood: mostCommonMood,
          intensity: avgMoodIntensity
        });
      } else {
        weeklyMoods.push({
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          mood: 'none',
          intensity: 0
        });
      }
    }

    return {
      totalEntries: entries.length,
      last30DaysCount: last30Days.length,
      last7DaysCount: last7Days.length,
      dominantMood: dominantMood ? dominantMood[0] : 'No data yet',
      dominantMoodCount: dominantMood ? dominantMood[1] : 0,
      avgIntensity: avgIntensity.toFixed(1),
      mostCommonHour: mostCommonHour ? parseInt(mostCommonHour[0]) : null,
      currentStreak,
      longestStreak,
      weeklyMoods,
    };
  }, [entries]);

  const getMoodEmoji = (mood: string) => {
    const moodEmojis: Record<string, string> = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      anxious: '😰',
      excited: '🤩',
      calm: '😌',
      loved: '🥰',
      grateful: '🙏',
      tired: '😴',
      energetic: '⚡',
      stressed: '😓',
      peaceful: '☮️',
      none: '○'
    };
    return moodEmojis[mood] || '😐';
  };

  const getTimeLabel = (hour: number | null) => {
    if (hour === null) return 'No pattern yet';
    if (hour < 12) return `${hour === 0 ? 12 : hour}:00 AM`;
    return `${hour === 12 ? 12 : hour - 12}:00 PM`;
  };

  return (
    <div className="dashboard-page" style={{
      background: getGradientBackground(favoriteColor)
    }}>
      <div className="dashboard-orb dashboard-orb1" style={{ background: `${favoriteColor}40` }}></div>
      <div className="dashboard-orb dashboard-orb2" style={{ background: `${favoriteColor}30` }}></div>
      <div className="dashboard-orb dashboard-orb3" style={{ background: `${favoriteColor}50` }}></div>

      <div className="dashboard-content-wrapper">
        <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
          <div className="text-center" style={{ animation: 'fadeIn 1s ease-out' }}>
            <h1 style={{ 
              fontSize: '48px', 
              fontWeight: '700', 
              color: 'white', 
              textShadow: '0 0 40px rgba(255, 255, 255, 0.5)', 
              marginBottom: '10px',
              animation: 'glow 3s ease-in-out infinite'
            }}>
              {favoriteEmoji} Your Journey Insights
            </h1>
            <p style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.9)' }}>
              Discover patterns and celebrate your progress
            </p>
          </div>

          {/* Stats Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '20px',
            animation: 'fadeIn 1s ease-out 0.2s backwards'
          }}>
            {/* Total Entries */}
            <div className="dashboard-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>📝</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: 'white', marginBottom: '5px' }}>
                {analytics.totalEntries}
              </div>
              <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>
                Total Entries
              </div>
            </div>

            {/* Current Streak */}
            <div className="dashboard-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔥</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: 'white', marginBottom: '5px' }}>
                {analytics.currentStreak}
              </div>
              <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>
                Day Streak
              </div>
            </div>

            {/* Longest Streak */}
            <div className="dashboard-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>🏆</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: 'white', marginBottom: '5px' }}>
                {analytics.longestStreak}
              </div>
              <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>
                Longest Streak
              </div>
            </div>

            {/* This Month */}
            <div className="dashboard-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>📅</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: 'white', marginBottom: '5px' }}>
                {analytics.last30DaysCount}
              </div>
              <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>
                Last 30 Days
              </div>
            </div>
          </div>

          {/* Weekly Mood Chart */}
          <div className="dashboard-card" style={{ animationDelay: '0.3s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <TrendingUp size={24} color="white" />
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'white', margin: 0 }}>
                Weekly Mood Trend
              </h2>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-around', 
              alignItems: 'flex-end',
              height: '200px',
              padding: '20px 0'
            }}>
              {analytics.weeklyMoods.map((day, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <div style={{
                    height: `${Math.max(day.intensity * 15, 30)}px`,
                    width: '60px',
                    background: day.mood === 'none' 
                      ? 'rgba(255, 255, 255, 0.1)' 
                      : `linear-gradient(135deg, ${favoriteColor}, ${favoriteColor}cc)`,
                    borderRadius: '8px 8px 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    transition: 'all 0.3s',
                    cursor: 'pointer',
                    boxShadow: day.mood !== 'none' ? `0 4px 15px ${favoriteColor}40` : 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  title={`${day.day}: ${day.mood} (${day.intensity.toFixed(1)})`}
                  >
                    {getMoodEmoji(day.mood)}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontWeight: '600'
                  }}>
                    {day.day}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Insights Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '20px',
            animation: 'fadeIn 1s ease-out 0.4s backwards'
          }}>
            {/* Dominant Mood */}
            <div className="dashboard-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <Heart size={24} color="white" />
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'white', margin: 0 }}>
                  Dominant Mood
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ fontSize: '48px' }}>
                  {getMoodEmoji(analytics.dominantMood)}
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: 'white', textTransform: 'capitalize' }}>
                    {analytics.dominantMood}
                  </div>
                  <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>
                    {analytics.dominantMoodCount} times this month
                  </div>
                </div>
              </div>
            </div>

            {/* Most Active Time */}
            <div className="dashboard-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <Clock size={24} color="white" />
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'white', margin: 0 }}>
                  Your Journaling Time
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ fontSize: '48px' }}>🕐</div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: 'white' }}>
                    {getTimeLabel(analytics.mostCommonHour)}
                  </div>
                  <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>
                    You journal most at this time
                  </div>
                </div>
              </div>
            </div>

            {/* Average Intensity */}
            <div className="dashboard-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <Sparkles size={24} color="white" />
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'white', margin: 0 }}>
                  Emotional Intensity
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ fontSize: '48px' }}>💫</div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: 'white' }}>
                    {analytics.avgIntensity}/10
                  </div>
                  <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>
                    Average feeling intensity
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Emotional Threads */}
          <EmotionalThreads />

          {/* Inner Weather */}
          <InnerWeather />

          {/* Echo Trails */}
          <EchoTrails />

          {/* Word Frequency */}
          <WordFrequency />

          {/* Motivational Message */}
          {analytics.currentStreak >= 7 && (
            <div className="dashboard-card" style={{ 
              textAlign: 'center',
              background: `linear-gradient(135deg, ${favoriteColor}30, ${favoriteColor}20)`,
              border: `2px solid ${favoriteColor}60`,
              animationDelay: '0.5s'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>🎉</div>
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'white', marginBottom: '10px' }}>
                Amazing Streak!
              </h3>
              <p style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.9)' }}>
                You have been journaling for {analytics.currentStreak} days in a row. Keep up the incredible work!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
