import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Database Types
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  full_name?: string;
  avatar_url?: string;
  subscription_tier: 'free' | 'premium';
  storage_used: number;
  pin_enabled: boolean;
  biometric_enabled: boolean;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  mood: string;
  intensity: number;
  title?: string;
  text_content?: string;
  tags: string[];
  is_public: boolean;
  is_crisis_moment: boolean;
  is_breakthrough: boolean;
}

export interface MediaAttachment {
  id: string;
  entry_id: string;
  user_id: string;
  type: 'photo' | 'video' | 'audio';
  url: string;
  thumbnail_url?: string;
  duration?: number;
  size_bytes: number;
  created_at: string;
  blur_faces: boolean;
}

export interface EmotionalPattern {
  id: string;
  user_id: string;
  date: string;
  dominant_mood: string;
  average_intensity: number;
  entry_count: number;
  media_count: number;
}

export interface UserSettings {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'auto';
  font_size: 'small' | 'medium' | 'large';
  background_ambience: string;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}
