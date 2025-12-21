import { useMemo, useState, useEffect } from 'react';
import { useJournalStore } from '../stores/journalStore';
import { useSettingsStore } from '../stores/settingsStore';
import { Cloud, Sun, CloudRain, Wind, Zap, MapPin } from 'lucide-react';
import { getMoodEmoji } from '../data/emotions';
import { getCurrentWeather, getUserLocation, analyzeWeatherCorrelation, getWeatherEmoji } from '../lib/weatherApi';

export function InnerWeather() {
  const { entries } = useJournalStore();
  const { favoriteColor } = useSettingsStore();
  const [outerWeather, setOuterWeather] = useState<any>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  // Fetch actual weather on component mount
  useEffect(() => {
    const fetchWeather = async () => {
      const location = await getUserLocation();
      if (location) {
        const weather = await getCurrentWeather(location.lat, location.lon);
        setOuterWeather(weather);
      }
      setLoadingWeather(false);
    };

    fetchWeather();
  }, []);

  const currentWeather = useMemo(() => {
    // Get entries from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentEntries = entries.filter(
      entry => new Date(entry.created_at) >= sevenDaysAgo
    );

    if (recentEntries.length === 0) {
      return {
        condition: 'Clear',
        icon: Sun,
        description: 'Your inner sky awaits your first entry',
        color: '#FDB813',
        mood: null,
      };
    }

    // Calculate average intensity and dominant mood
    const avgIntensity = recentEntries.reduce((sum, e) => sum + e.intensity, 0) / recentEntries.length;
    
    const moodCounts: Record<string, number> = {};
    recentEntries.forEach(e => {
      moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
    });
    
    const dominantMood = Object.entries(moodCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0];

    // Determine weather based on mood patterns
    const weatherMap: Record<string, { condition: string; icon: any; description: string; color: string }> = {
      'Happy': { condition: 'Sunny', icon: Sun, description: 'Bright skies and warm light', color: '#FDB813' },
      'Excited': { condition: 'Sunny', icon: Sun, description: 'Radiant energy filling your days', color: '#FDB813' },
      'Grateful': { condition: 'Clear', icon: Sun, description: 'Calm clarity and gentle warmth', color: '#87CEEB' },
      'Content': { condition: 'Clear', icon: Cloud, description: 'Peaceful and settled', color: '#87CEEB' },
      'Peaceful': { condition: 'Clear', icon: Cloud, description: 'Soft and serene', color: '#B0C4DE' },
      'Calm': { condition: 'Partly Cloudy', icon: Cloud, description: 'Gentle clouds drifting by', color: '#B0C4DE' },
      'Hopeful': { condition: 'Clearing', icon: Cloud, description: 'Light breaking through', color: '#87CEEB' },
      'Sad': { condition: 'Overcast', icon: CloudRain, description: 'Heavy clouds overhead', color: '#708090' },
      'Lonely': { condition: 'Foggy', icon: Wind, description: 'Mist settling in', color: '#778899' },
      'Anxious': { condition: 'Windy', icon: Wind, description: 'Restless air and shifting currents', color: '#696969' },
      'Stressed': { condition: 'Stormy', icon: Zap, description: 'Thunder rumbling within', color: '#4B0082' },
      'Overwhelmed': { condition: 'Stormy', icon: Zap, description: 'Turbulent skies', color: '#4B0082' },
      'Angry': { condition: 'Stormy', icon: Zap, description: 'Lightning and fierce winds', color: '#8B0000' },
      'Confused': { condition: 'Foggy', icon: Wind, description: 'Unclear paths ahead', color: '#696969' },
      'Tired': { condition: 'Overcast', icon: Cloud, description: 'Heaviness in the air', color: '#808080' },
      'Energized': { condition: 'Breezy', icon: Wind, description: 'Fresh winds of vitality', color: '#00CED1' },
    };

    const weather = weatherMap[dominantMood] || {
      condition: 'Variable',
      icon: Cloud,
      description: 'Shifting patterns',
      color: '#B0C4DE',
    };

    return {
      ...weather,
      mood: dominantMood,
      intensity: avgIntensity,
      emoji: getMoodEmoji(dominantMood),
    };
  }, [entries]);

  // Analyze correlation between inner and outer weather
  const correlation = useMemo(() => {
    if (!outerWeather || !currentWeather.mood) return null;
    return analyzeWeatherCorrelation(currentWeather.mood, outerWeather.condition);
  }, [outerWeather, currentWeather]);

  const WeatherIcon = currentWeather.icon;

  return (
    <div
      className="dashboard-card"
      style={{
        animationDelay: '0.2s',
        background: `linear-gradient(135deg, ${currentWeather.color}20, ${currentWeather.color}10)`,
        border: `2px solid ${currentWeather.color}40`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <WeatherIcon size={24} color={currentWeather.color} />
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'white', margin: 0 }}>
          Your Inner Weather
        </h2>
      </div>
      <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '20px' }}>
        The emotional climate of your recent days
      </p>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          padding: '24px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            fontSize: '64px',
            textShadow: `0 0 20px ${currentWeather.color}80`,
          }}
        >
          {currentWeather.mood ? getMoodEmoji(currentWeather.mood) : '☁️'}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '32px', fontWeight: '700', color: 'white', margin: 0, marginBottom: '8px' }}>
            {currentWeather.condition}
          </h3>
          <p style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.8)', fontStyle: 'italic', margin: 0 }}>
            {currentWeather.description}
          </p>
          {currentWeather.mood && (
            <div style={{ marginTop: '12px' }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '6px 16px',
                  background: `${currentWeather.color}33`,
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: currentWeather.color,
                }}
              >
                {currentWeather.mood}
              </span>
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          padding: '16px',
          background: `${favoriteColor}15`,
          borderRadius: '12px',
          borderLeft: `4px solid ${favoriteColor}`,
        }}
      >
        <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>
          💭 <strong>Remember:</strong> All weather passes. This is just where you are right now, not where you'll always be.
        </p>
      </div>

      {/* Weather Correlation */}
      {outerWeather && correlation && (
        <div
          style={{
            marginTop: '20px',
            padding: '20px',
            background: correlation.correlation === 'matches' 
              ? 'rgba(6, 182, 212, 0.1)' 
              : 'rgba(139, 92, 246, 0.1)',
            border: `2px solid ${correlation.correlation === 'matches' ? '#06b6d4' : '#8b5cf6'}40`,
            borderRadius: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <MapPin size={20} color={correlation.correlation === 'matches' ? '#06b6d4' : '#8b5cf6'} />
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: 'white' }}>
              Weather Check
            </h4>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '4px' }}>
                {getWeatherEmoji(outerWeather.condition)}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
                Outside
              </div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>
                {outerWeather.temperature}°C
              </div>
            </div>

            <div style={{ 
              flex: 1, 
              height: '2px', 
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: correlation.correlation === 'matches' ? '#06b6d4' : '#8b5cf6',
                borderRadius: '50%',
                padding: '6px',
                fontSize: '16px'
              }}>
                {correlation.correlation === 'matches' ? '🔗' : '✨'}
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '4px' }}>
                {currentWeather.mood ? getMoodEmoji(currentWeather.mood) : '☁️'}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
                Inside
              </div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>
                {currentWeather.mood || 'Calm'}
              </div>
            </div>
          </div>

          <p style={{ 
            fontSize: '13px', 
            color: 'rgba(255, 255, 255, 0.8)', 
            margin: 0,
            fontStyle: 'italic',
            textAlign: 'center'
          }}>
            {correlation.insight}
          </p>
        </div>
      )}

      {loadingWeather && !outerWeather && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          textAlign: 'center',
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.6)'
        }}>
          ☁️ Checking local weather...
        </div>
      )}
    </div>
  );
}
