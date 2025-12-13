import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Settings {
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  backgroundAmbience: 'none' | 'rain' | 'fire' | 'waves' | 'forest' | 'cafe' | 'whitenoise' | 'custom';
  notificationsEnabled: boolean;
  pinEnabled: boolean;
  biometricEnabled: boolean;
  favoriteColor: string;
  favoriteEmoji: string;
  dearPrompt: string;
  ambienceVolume: number;
  customMusicUrl: string;
}

interface SettingsState extends Settings {
  updateSettings: (settings: Partial<Settings>) => void;
  resetSettings: () => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  setFavoriteColor: (color: string) => void;
  setFavoriteEmoji: (emoji: string) => void;
  setDearPrompt: (prompt: string) => void;
  setBackgroundAmbience: (ambience: Settings['backgroundAmbience']) => void;
  setAmbienceVolume: (volume: number) => void;
  setCustomMusicUrl: (url: string) => void;
}

const defaultSettings: Settings = {
  theme: 'auto',
  fontSize: 'medium',
  backgroundAmbience: 'none',
  notificationsEnabled: true,
  pinEnabled: false,
  biometricEnabled: false,
  favoriteColor: '#14b8a6',
  favoriteEmoji: '💖',
  dearPrompt: 'Dear Diary',
  ambienceVolume: 0.5,
  customMusicUrl: '',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      updateSettings: (settings) => set((state) => ({ ...state, ...settings })),
      resetSettings: () => set(defaultSettings),
      setTheme: (theme) => set({ theme }),
      setFavoriteColor: (favoriteColor) => set({ favoriteColor }),
      setFavoriteEmoji: (favoriteEmoji) => set({ favoriteEmoji }),
      setDearPrompt: (dearPrompt) => set({ dearPrompt }),
      setBackgroundAmbience: (backgroundAmbience) => set({ backgroundAmbience }),
      setAmbienceVolume: (ambienceVolume) => set({ ambienceVolume }),
      setCustomMusicUrl: (customMusicUrl) => set({ customMusicUrl }),
    }),
    {
      name: 'soul-script-settings',
    }
  )
);
