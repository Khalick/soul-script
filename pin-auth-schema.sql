-- PIN and Biometric Authentication Schema
-- Run this in your Supabase SQL Editor

-- Add security columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS pin_hash TEXT,
ADD COLUMN IF NOT EXISTS pin_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS biometric_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS biometric_credential_id TEXT,
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS trusted_devices JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS auto_lock_timeout INTEGER DEFAULT 20; -- minutes

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_pin_enabled ON users(pin_enabled);
CREATE INDEX IF NOT EXISTS idx_users_last_activity ON users(last_activity_at);

-- Function to verify PIN (server-side)
CREATE OR REPLACE FUNCTION verify_user_pin(user_id_input UUID, pin_hash_input TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  stored_hash TEXT;
BEGIN
  SELECT pin_hash INTO stored_hash
  FROM users
  WHERE id = user_id_input AND pin_enabled = TRUE;
  
  IF stored_hash IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN stored_hash = pin_hash_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update last activity
CREATE OR REPLACE FUNCTION update_last_activity(user_id_input UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET last_activity_at = NOW()
  WHERE id = user_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add trusted device
CREATE OR REPLACE FUNCTION add_trusted_device(
  user_id_input UUID,
  device_fingerprint TEXT,
  device_name TEXT DEFAULT 'Unknown Device'
)
RETURNS VOID AS $$
DECLARE
  new_device JSONB;
BEGIN
  new_device := jsonb_build_object(
    'fingerprint', device_fingerprint,
    'name', device_name,
    'added_at', NOW()
  );
  
  UPDATE users
  SET trusted_devices = COALESCE(trusted_devices, '[]'::jsonb) || new_device
  WHERE id = user_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove trusted device
CREATE OR REPLACE FUNCTION remove_trusted_device(
  user_id_input UUID,
  device_fingerprint TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET trusted_devices = (
    SELECT jsonb_agg(device)
    FROM jsonb_array_elements(trusted_devices) device
    WHERE device->>'fingerprint' != device_fingerprint
  )
  WHERE id = user_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS policies for security functions
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then recreate
DROP POLICY IF EXISTS "Users can update own security settings" ON users;
DROP POLICY IF EXISTS "Users can read own security settings" ON users;

-- Policy: Users can only update their own security settings
CREATE POLICY "Users can update own security settings"
ON users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy: Users can only read their own security settings
CREATE POLICY "Users can read own security settings"
ON users FOR SELECT
USING (auth.uid() = id);

COMMENT ON COLUMN users.pin_hash IS 'Bcrypt hashed PIN for quick unlock';
COMMENT ON COLUMN users.pin_enabled IS 'Whether user has enabled PIN authentication';
COMMENT ON COLUMN users.biometric_enabled IS 'Whether user has enabled biometric authentication';
COMMENT ON COLUMN users.biometric_credential_id IS 'WebAuthn credential ID for biometric auth';
COMMENT ON COLUMN users.last_activity_at IS 'Timestamp of last user activity for auto-lock';
COMMENT ON COLUMN users.trusted_devices IS 'Array of trusted device fingerprints';
COMMENT ON COLUMN users.auto_lock_timeout IS 'Auto-lock timeout in minutes (default 20)';
