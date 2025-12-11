-- Anonymous Community Tables

-- Community Posts table (public entries)
CREATE TABLE public.community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  entry_id UUID REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  mood TEXT NOT NULL,
  intensity INTEGER NOT NULL CHECK (intensity >= 1 AND intensity <= 10),
  text_snippet TEXT NOT NULL,
  hashtags TEXT[] DEFAULT '{}',
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'semi-private')),
  echo_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Echo Reactions table (likes/support)
CREATE TABLE public.post_echoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Indexes for performance
CREATE INDEX idx_community_posts_visibility ON public.community_posts(visibility);
CREATE INDEX idx_community_posts_created ON public.community_posts(created_at DESC);
CREATE INDEX idx_community_posts_mood ON public.community_posts(mood);
CREATE INDEX idx_community_posts_hashtags ON public.community_posts USING gin(hashtags);
CREATE INDEX idx_post_echoes_post ON public.post_echoes(post_id);
CREATE INDEX idx_post_echoes_user ON public.post_echoes(user_id);

-- RLS Policies
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_echoes ENABLE ROW LEVEL SECURITY;

-- Community posts policies
CREATE POLICY "Anyone can view public posts"
  ON public.community_posts FOR SELECT
  USING (visibility = 'public');

CREATE POLICY "Users can view own posts"
  ON public.community_posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create posts"
  ON public.community_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON public.community_posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON public.community_posts FOR DELETE
  USING (auth.uid() = user_id);

-- Post echoes policies
CREATE POLICY "Anyone can view echoes"
  ON public.post_echoes FOR SELECT
  USING (true);

CREATE POLICY "Users can echo posts"
  ON public.post_echoes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own echoes"
  ON public.post_echoes FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update echo count
CREATE OR REPLACE FUNCTION update_echo_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts 
    SET echo_count = echo_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts 
    SET echo_count = GREATEST(0, echo_count - 1)
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_echo_count_on_insert 
  AFTER INSERT ON public.post_echoes
  FOR EACH ROW EXECUTE FUNCTION update_echo_count();

CREATE TRIGGER update_echo_count_on_delete 
  AFTER DELETE ON public.post_echoes
  FOR EACH ROW EXECUTE FUNCTION update_echo_count();
