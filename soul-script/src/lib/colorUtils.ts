// Utility to lighten/darken colors and create gradients based on user's favorite color

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 192, g: 132, b: 252 }; // Default purple
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

export function getGradientBackground(favoriteColor: string): string {
  const colors = getColorGradient(favoriteColor);
  return `linear-gradient(-45deg, ${colors[0]}, ${colors[1]}, ${colors[2]}, ${colors[3]})`;
}
