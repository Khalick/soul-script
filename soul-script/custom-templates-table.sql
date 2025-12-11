-- Custom Templates table (optional - for syncing templates across devices)
CREATE TABLE public.custom_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  description TEXT,
  structure TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, template_id)
);

-- Index for efficient queries
CREATE INDEX idx_custom_templates_user ON public.custom_templates(user_id);

-- RLS for Custom Templates
ALTER TABLE public.custom_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own templates"
  ON public.custom_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own templates"
  ON public.custom_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates"
  ON public.custom_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates"
  ON public.custom_templates FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_custom_templates_updated_at 
  BEFORE UPDATE ON public.custom_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
