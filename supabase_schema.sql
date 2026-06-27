-- Run this in Supabase → SQL Editor → New query → Run
-- This replaces the old schema with a simple user-data sync approach.

-- Single table stores all app data per user as a JSON blob.
-- Fast to sync, simple to maintain.
CREATE TABLE IF NOT EXISTS user_data (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  data    jsonb   NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Row-level security: each user can only access their own row
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users own their data" ON user_data;
CREATE POLICY "users own their data"
  ON user_data FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Auto-update updated_at on change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS user_data_updated_at ON user_data;
CREATE TRIGGER user_data_updated_at
  BEFORE UPDATE ON user_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
