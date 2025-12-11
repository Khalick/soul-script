# Legacy Mode Database Setup

## To enable Legacy Mode, you need to create the legacy_letters table in Supabase:

### Step 1: Go to your Supabase Dashboard
1. Open https://supabase.com/dashboard
2. Select your project: **hiofxbwylcutjskupbyc**
3. Go to **SQL Editor** (left sidebar)

### Step 2: Run this SQL command:

```sql
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

-- Create indexes for efficient queries
CREATE INDEX idx_legacy_letters_delivery ON public.legacy_letters(delivery_date, is_delivered);
CREATE INDEX idx_legacy_letters_user ON public.legacy_letters(user_id);

-- Enable Row Level Security
ALTER TABLE public.legacy_letters ENABLE ROW LEVEL SECURITY;

-- RLS Policies
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
```

### Step 3: Click "Run" button

### Step 4: Verify the table was created
Go to **Table Editor** in the left sidebar and check if `legacy_letters` table appears.

### Step 5: Test Legacy Mode
1. Go to Settings in the app
2. Click "Activate Premium (Demo)"
3. Click "Legacy" in the navbar
4. Write your first letter to the future!

## That's it! 🎉
