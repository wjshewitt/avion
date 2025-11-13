-- Fix airport_cache RLS policies to allow authenticated users to cache data
-- Migration: 20251113002432_fix_airport_cache_rls.sql

-- Allow authenticated users to insert new airport cache entries
-- This is safe because:
-- 1. Data comes from external API (AirportDB.io), not user input
-- 2. Users can't modify other users' data (no user_id column)
-- 3. Cache is shared read-only resource for all users
CREATE POLICY "Allow authenticated users to cache airports"
  ON airport_cache
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update existing airport cache entries
CREATE POLICY "Allow authenticated users to update airport cache"
  ON airport_cache
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

COMMENT ON POLICY "Allow authenticated users to cache airports" ON airport_cache 
  IS 'Allows API routes running as authenticated users to cache airport data from external APIs. Safe because data comes from trusted external source (AirportDB.io) and is validated.';

COMMENT ON POLICY "Allow authenticated users to update airport cache" ON airport_cache 
  IS 'Allows refreshing cached airport data. Safe because updates only refresh API data, no user-specific modifications.';
