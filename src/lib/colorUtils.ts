// Utility to lighten/darken colors and create gradients based on user's favorite color

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 20, g: 184, b: 166 }; // Default teal
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

export function adjustBrightness(hex: string, percent: number): string {
  const { r, g, b } = hexToRgb(hex);
  const newR = Math.min(255, Math.max(0, r + (r * percent / 100)));
  const newG = Math.min(255, Math.max(0, g + (g * percent / 100)));
  const newB = Math.min(255, Math.max(0, b + (b * percent / 100)));
  return rgbToHex(newR, newG, newB);
}

export function getColorGradient(baseColor: string): string[] {
  const color1 = adjustBrightness(baseColor, -20);
  const color2 = adjustBrightness(baseColor, 10);
  const color3 = adjustBrightness(baseColor, 30);
  const color4 = adjustBrightness(baseColor, -10);
  return [color1, color2, color3, color4];
}

// Time-based theme system matching the moodboard designs
export interface TimeTheme {
  id: string;
  name: string;
  gradient: string;
  textColor: string;
  accentColor: string;
  cardBg: string;
  orbColors: string[];
}

export function getCurrentTimeTheme(): TimeTheme {
  const hour = new Date().getHours();
  
  // Dawn: 5 AM - 7 AM (Soft pink/mauve awakening)
  if (hour >= 5 && hour < 7) {
    return {
      id: 'dawn',
      name: 'DAWN',
      gradient: 'linear-gradient(180deg, #1a1a2e 0%, #2D2A3E 30%, #3D2A35 60%, #8B6F7F 100%)',
      textColor: '#E8C09B',
      accentColor: '#D4A574',
      cardBg: 'rgba(26, 26, 46, 0.85)',
      orbColors: ['#E8C09B30', '#D4A57440', '#8B6F7F50']
    };
  }
  
  // Morning: 7 AM - 12 PM (Navy to warm terracotta - MOODBOARD IMAGE 1)
  if (hour >= 7 && hour < 12) {
    return {
      id: 'morning',
      name: 'MORNING',
      gradient: 'linear-gradient(180deg, #1a1a2e 0%, #2D2A3E 25%, #4a2511 60%, #C67B4E 100%)',
      textColor: '#E8C09B',
      accentColor: '#C67B4E',
      cardBg: 'rgba(26, 26, 46, 0.85)',
      orbColors: ['#E8C09B20', '#C67B4E30', '#4a251140']
    };
  }
  
  // Afternoon: 12 PM - 3 PM (Warm amber/golden light)
  if (hour >= 12 && hour < 15) {
    return {
      id: 'afternoon',
      name: 'AFTERNOON',
      gradient: 'linear-gradient(180deg, #1a1a2e 0%, #2D2A3E 30%, #5C4033 60%, #D4A574 100%)',
      textColor: '#E8C09B',
      accentColor: '#D4A574',
      cardBg: 'rgba(26, 26, 46, 0.85)',
      orbColors: ['#E8C09B40', '#D4A57430', '#5C403350']
    };
  }
  
  // Mid-Afternoon: 3 PM - 5 PM (Deeper amber, pre-sunset)
  if (hour >= 15 && hour < 17) {
    return {
      id: 'mid-afternoon',
      name: 'MID-AFTERNOON',
      gradient: 'linear-gradient(180deg, #1a1a2e 0%, #2D2A3E 35%, #4a3020 65%, #B8860B 100%)',
      textColor: '#E8C09B',
      accentColor: '#B8860B',
      cardBg: 'rgba(26, 26, 46, 0.85)',
      orbColors: ['#E8C09B40', '#B8860B30', '#4a302050']
    };
  }
  
  // Evening: 5 PM - 9 PM (Warm sunset to dusk)
  if (hour >= 17 && hour < 21) {
    return {
      id: 'evening',
      name: 'EVENING',
      gradient: 'linear-gradient(180deg, #1a1a2e 0%, #2D2838 35%, #3D2A25 65%, #8B4513 100%)',
      textColor: '#D4A574',
      accentColor: '#C67B4E',
      cardBg: 'rgba(26, 26, 46, 0.85)',
      orbColors: ['#D4A57440', '#8B451330', '#3D2A2550']
    };
  }
  
  // Mid-Evening: 9 PM - 11 PM (Deep indigo to mauve - MOODBOARD IMAGE 2)
  if (hour >= 21 && hour < 23) {
    return {
      id: 'mid-evening',
      name: 'MID-EVENING',
      gradient: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a3e 30%, #2D2A4E 55%, #8B6F7F 100%)',
      textColor: '#D4A574',
      accentColor: '#C67B4E',
      cardBg: 'rgba(26, 26, 62, 0.85)',
      orbColors: ['#D4A57430', '#8B6F7F40', '#2D2A4E50']
    };
  }
  
  // Night: 11 PM - 5 AM (Deep starfield with subtle warmth)
  return {
    id: 'night',
    name: 'NIGHT',
    gradient: 'linear-gradient(180deg, #0a0a14 0%, #12121D 30%, #1a1a2e 60%, #2D2A3E 100%)',
    textColor: '#D4A574',
    accentColor: '#C67B4E',
    cardBg: 'rgba(18, 18, 29, 0.9)',
    orbColors: ['#D4A57420', '#C67B4E30', '#2D2A3E50']
  };
}

export function getGradientBackground(_favoriteColor?: string): string {
  // Moodboard-style gradient - dark navy to warm terracotta
  const theme = getCurrentTimeTheme();
  return theme.gradient;
}
