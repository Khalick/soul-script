-- Add ephemeral_until column to journal_entries for "Burn After Writing"
ALTER TABLE public.journal_entries 
ADD COLUMN ephemeral_until TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add comment
COMMENT ON COLUMN public.journal_entries.ephemeral_until IS 'If set, entry will auto-delete after this timestamp (Burn After Writing feature)';

-- Create index for efficient cleanup
CREATE INDEX idx_journal_entries_ephemeral ON public.journal_entries(ephemeral_until) 
WHERE ephemeral_until IS NOT NULL;

-- Function to auto-delete ephemeral entries
CREATE OR REPLACE FUNCTION delete_ephemeral_entries()
RETURNS void AS $$
BEGIN
  DELETE FROM public.journal_entries
  WHERE ephemeral_until IS NOT NULL 
    AND ephemeral_until <= NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule to run every hour (you'll need to set this up in Supabase dashboard or use pg_cron)
-- For now, client will handle deletion on load
