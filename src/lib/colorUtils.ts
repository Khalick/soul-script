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
  
  // Dawn: 5 AM - 7 AM (Pink/mauve misty theme)
  if (hour >= 5 && hour < 7) {
    return {
      id: 'dawn',
      name: 'DAWN',
      gradient: 'linear-gradient(180deg, #E8D4D9 0%, #D4B5BD 30%, #9B8A8F 70%, #6B5559 100%)',
      textColor: '#6B5559',
      accentColor: '#8B6F5F',
      cardBg: 'rgba(107, 85, 89, 0.85)',
      orbColors: ['#E8D4D940', '#D4B5BD30', '#9B8A8F50']
    };
  }
  
  // Morning: 7 AM - 12 PM (Dark navy to warm orange/gold - YOUR IMAGE)
  if (hour >= 7 && hour < 12) {
    return {
      id: 'morning',
      name: 'MORNING',
      gradient: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 20%, #2d1810 50%, #4a2511 75%, #C67B4E 100%)',
      textColor: '#E8C09B',
      accentColor: '#E8C09B',
      cardBg: 'rgba(26, 26, 46, 0.85)',
      orbColors: ['#E8C09B20', '#C67B4E30', '#4a251140']
    };
  }
  
  // Afternoon: 12 PM - 3 PM (Light blue sky)
  if (hour >= 12 && hour < 15) {
    return {
      id: 'afternoon',
      name: 'AFTERNOON',
      gradient: 'linear-gradient(180deg, #87CEEB 0%, #6BA3C9 30%, #4A7BA7 70%, #2C5F85 100%)',
      textColor: '#1E3A5F',
      accentColor: '#2C4F6F',
      cardBg: 'rgba(30, 58, 95, 0.85)',
      orbColors: ['#87CEEB40', '#6BA3C930', '#4A7BA750']
    };
  }
  
  // Mid-Afternoon: 3 PM - 5 PM (Golden hour)
  if (hour >= 15 && hour < 17) {
    return {
      id: 'mid-afternoon',
      name: 'MID-AFTERNOON',
      gradient: 'linear-gradient(180deg, #F0E68C 0%, #DAA520 30%, #B8860B 70%, #8B6914 100%)',
      textColor: '#704214',
      accentColor: '#8B5A13',
      cardBg: 'rgba(112, 66, 20, 0.85)',
      orbColors: ['#F0E68C40', '#DAA52030', '#B8860B50']
    };
  }
  
  // Evening: 5 PM - 9 PM (Warm brown/orange)
  if (hour >= 17 && hour < 21) {
    return {
      id: 'evening',
      name: 'EVENING',
      gradient: 'linear-gradient(180deg, #2a1810 0%, #3d2416 30%, #52301c 60%, #8B4513 100%)',
      textColor: '#D4A574',
      accentColor: '#D4A574',
      cardBg: 'rgba(42, 24, 16, 0.85)',
      orbColors: ['#D4A57440', '#8B451330', '#52301c50']
    };
  }
  
  // Night: 9 PM - 5 AM (Deep purple/indigo)
  return {
    id: 'night',
    name: 'NIGHT',
    gradient: 'linear-gradient(180deg, #0a0a1a 0%, #1a1a3e 30%, #2d2d5a 60%, #3d3d7a 100%)',
    textColor: '#B8A9C9',
    accentColor: '#9B87F5',
    cardBg: 'rgba(26, 26, 62, 0.85)',
    orbColors: ['#9B87F540', '#B8A9C930', '#3d3d7a50']
  };
}

export function getGradientBackground(favoriteColor?: string): string {
  // Always use dark starfield background consistent with the design
  if (favoriteColor) {
    const [color1] = getColorGradient(favoriteColor);
    const rgb = hexToRgb(color1);
    // Add subtle tint of favorite color to the starfield
    return `radial-gradient(ellipse at top, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12) 0%, rgb(10, 13, 46) 50%, rgb(8, 10, 38) 100%)`;
  }
  // Default dark starfield
  return 'radial-gradient(ellipse at top, rgba(15, 20, 60, 0.8) 0%, rgb(10, 13, 46) 50%, rgb(8, 10, 38) 100%)';
}
