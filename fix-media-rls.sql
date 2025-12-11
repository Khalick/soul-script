-- Fix RLS Policies for Media Attachments
-- Run this in your Supabase SQL Editor if you're getting RLS errors

-- First, check if the table exists and has RLS enabled
ALTER TABLE public.media_attachments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own media" ON public.media_attachments;
DROP POLICY IF EXISTS "Users can insert own media" ON public.media_attachments;
DROP POLICY IF EXISTS "Users can delete own media" ON public.media_attachments;
DROP POLICY IF EXISTS "Users can update own media" ON public.media_attachments;

-- Recreate policies with correct permissions
CREATE POLICY "Users can view own media" ON public.media_attachments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own media" ON public.media_attachments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own media" ON public.media_attachments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own media" ON public.media_attachments
  FOR DELETE USING (auth.uid() = user_id);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'media_attachments';
