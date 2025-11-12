-- Add user_id column to flights table for user isolation
ALTER TABLE flights
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for user_id lookups
CREATE INDEX idx_flights_user_id ON flights(user_id);

-- Update existing flights to have a user_id (set to NULL for now, or assign to first user if needed)
-- Note: In production, you'd want to handle existing data more carefully

-- Drop old RLS policies
DROP POLICY IF EXISTS "Authenticated users can read flights" ON flights;
DROP POLICY IF EXISTS "No client writes to flights" ON flights;
DROP POLICY IF EXISTS "No client updates to flights" ON flights;
DROP POLICY IF EXISTS "No client deletes to flights" ON flights;

-- Create new RLS policies with user isolation
-- Users can only see their own flights
CREATE POLICY "Users can view own flights"
  ON flights FOR SELECT
  USING (auth.uid() = user_id);

-- Server actions can insert flights (they'll set the user_id)
CREATE POLICY "Authenticated users can insert own flights"
  ON flights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own flights
CREATE POLICY "Users can update own flights"
  ON flights FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own flights
CREATE POLICY "Users can delete own flights"
  ON flights FOR DELETE
  USING (auth.uid() = user_id);

-- Update flight_events table to also include user isolation if needed
-- (The foreign key cascade will handle deletions)
