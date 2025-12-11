-- Soul Script Database Schema
-- This schema is optimized for 100,000+ users

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
  storage_used BIGINT DEFAULT 0,
  pin_enabled BOOLEAN DEFAULT false,
  biometric_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Journal Entries table
CREATE TABLE public.journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  mood TEXT NOT NULL,
  intensity INTEGER NOT NULL CHECK (intensity >= 1 AND intensity <= 10),
  title TEXT,
  text_content TEXT,
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  is_crisis_moment BOOLEAN DEFAULT false,
  is_breakthrough BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Media Attachments table
CREATE TABLE public.media_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_id UUID NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('photo', 'video', 'audio')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER,
  size_bytes BIGINT NOT NULL,
  blur_faces BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emotional Patterns table (for analytics)
CREATE TABLE public.emotional_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  dominant_mood TEXT NOT NULL,
  average_intensity DECIMAL(3,2),
  entry_count INTEGER DEFAULT 0,
  media_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- User Settings table
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'auto' CHECK (theme IN ('light', 'dark', 'auto')),
  font_size TEXT DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large')),
  background_ambience TEXT DEFAULT 'none',
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance (crucial for 100k+ users)
CREATE INDEX idx_journal_entries_user_id ON public.journal_entries(user_id);
CREATE INDEX idx_journal_entries_created_at ON public.journal_entries(created_at DESC);
CREATE INDEX idx_journal_entries_mood ON public.journal_entries(mood);
CREATE INDEX idx_journal_entries_user_created ON public.journal_entries(user_id, created_at DESC);

CREATE INDEX idx_media_attachments_entry_id ON public.media_attachments(entry_id);
CREATE INDEX idx_media_attachments_user_id ON public.media_attachments(user_id);

CREATE INDEX idx_emotional_patterns_user_date ON public.emotional_patterns(user_id, date DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotional_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Journal entries policies
CREATE POLICY "Users can view own entries" ON public.journal_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public entries" ON public.journal_entries
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert own entries" ON public.journal_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries" ON public.journal_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries" ON public.journal_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Media attachments policies
CREATE POLICY "Users can view own media" ON public.media_attachments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own media" ON public.media_attachments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own media" ON public.media_attachments
  FOR DELETE USING (auth.uid() = user_id);

-- Emotional patterns policies
CREATE POLICY "Users can view own patterns" ON public.emotional_patterns
  FOR SELECT USING (auth.uid() = user_id);

-- User settings policies
CREATE POLICY "Users can view own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON public.user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Functions
-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update storage usage
CREATE OR REPLACE FUNCTION update_user_storage()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.users 
    SET storage_used = storage_used + NEW.size_bytes
    WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.users 
    SET storage_used = GREATEST(0, storage_used - OLD.size_bytes)
    WHERE id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_storage_on_media_insert 
  AFTER INSERT ON public.media_attachments
  FOR EACH ROW EXECUTE FUNCTION update_user_storage();

CREATE TRIGGER update_storage_on_media_delete 
  AFTER DELETE ON public.media_attachments
  FOR EACH ROW EXECUTE FUNCTION update_user_storage();

-- Legacy Letters table (Premium feature)
CREATE TABLE public.legacy_letters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  delivery_date DATE NOT NULL,
  is_delivered BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient delivery date queries
CREATE INDEX idx_legacy_letters_delivery ON public.legacy_letters(delivery_date, is_delivered);
CREATE INDEX idx_legacy_letters_user ON public.legacy_letters(user_id);

-- RLS for Legacy Letters
ALTER TABLE public.legacy_letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own legacy letters"
  ON public.legacy_letters FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own legacy letters"
  ON public.legacy_letters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own legacy letters"
  ON public.legacy_letters FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own legacy letters"
  ON public.legacy_letters FOR DELETE
  USING (auth.uid() = user_id);

-- Function to create user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage buckets (execute these in Supabase dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('journal-media', 'journal-media', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage policies
-- CREATE POLICY "Users can upload own media" ON storage.objects FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can view own media" ON storage.objects FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can delete own media" ON storage.objects FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);
