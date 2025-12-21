// Weather API integration for correlating mood with actual weather
// Using OpenWeather API (free tier allows 1000 calls/day)

interface WeatherData {
  condition: string;
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  pressure: number;
}

interface WeatherCorrelation {
  innerWeather: string;
  outerWeather: string;
  correlation: 'matches' | 'contrasts' | 'neutral';
  insight: string;
}

// Store API key in environment variable
const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || '';

/**
 * Get current weather for user's location
 */
export async function getCurrentWeather(lat: number, lon: number): Promise<WeatherData | null> {
  if (!OPENWEATHER_API_KEY) {
    console.warn('OpenWeather API key not configured');
    return null;
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );

    if (!response.ok) {
      throw new Error('Weather API request failed');
    }

    const data = await response.json();

    return {
      condition: data.weather[0].main,
      temperature: Math.round(data.main.temp),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
}

/**
 * Get user's geolocation
 */
export function getUserLocation(): Promise<{ lat: number; lon: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported');
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        console.warn('Geolocation permission denied:', error);
        resolve(null);
      }
    );
  });
}

/**
 * Analyze correlation between inner weather and outer weather
 */
export function analyzeWeatherCorrelation(
  innerMood: string,
  outerCondition: string
): WeatherCorrelation {
  const moodToWeatherMap: Record<string, string[]> = {
    'Happy': ['Clear', 'Clouds'],
    'Sad': ['Rain', 'Drizzle', 'Thunderstorm'],
    'Anxious': ['Clouds', 'Mist', 'Fog'],
    'Peaceful': ['Clear', 'Clouds'],
    'Energized': ['Clear', 'Clouds'],
    'Tired': ['Rain', 'Clouds'],
    'Stressed': ['Thunderstorm', 'Rain', 'Clouds'],
  };

  const matchingConditions = moodToWeatherMap[innerMood] || [];
  const matches = matchingConditions.includes(outerCondition);

  const insights = {
    matches: [
      'Your inner weather mirrors the world outside',
      'External conditions may be influencing your mood',
      'You tend to feel {mood} when it\'s {weather} outside',
    ],
    contrasts: [
      'Your inner world contrasts with the outer weather',
      'You\'re creating your own emotional climate',
      'Despite the {weather}, you\'re feeling {mood}',
    ],
    neutral: [
      'No clear pattern between mood and weather today',
      'Your emotions seem independent of the weather',
    ],
  };

  const correlation = matches ? 'matches' : outerCondition === 'Clear' ? 'neutral' : 'contrasts';
  const insightTemplates = insights[correlation];
  const insight = insightTemplates[Math.floor(Math.random() * insightTemplates.length)]
    .replace('{mood}', innerMood.toLowerCase())
    .replace('{weather}', outerCondition.toLowerCase());

  return {
    innerWeather: innerMood,
    outerWeather: outerCondition,
    correlation,
    insight,
  };
}

/**
 * Map OpenWeather condition to emoji
 */
export function getWeatherEmoji(condition: string): string {
  const emojiMap: Record<string, string> = {
    'Clear': '☀️',
    'Clouds': '☁️',
    'Rain': '🌧️',
    'Drizzle': '🌦️',
    'Thunderstorm': '⛈️',
    'Snow': '❄️',
    'Mist': '🌫️',
    'Fog': '🌫️',
    'Haze': '🌫️',
  };

  return emojiMap[condition] || '🌤️';
}
