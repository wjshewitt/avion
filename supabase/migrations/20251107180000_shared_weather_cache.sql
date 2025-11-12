-- Shared Weather Cache Migration
-- Remove user-scoping from weather_cache to enable efficient multi-tenant caching
-- Weather data is public and should be shared across all users to minimize API calls

-- ============================================================================
-- Background
-- ============================================================================
-- Previously, weather cache keys included accountId, creating duplicate cache
-- entries per user for the same weather data (e.g., 10 users viewing KJFK would
-- create 10 identical METAR cache entries). This wastes:
-- - API quota (10x redundant CheckWX calls)
-- - Database storage (10x duplicate records)
-- - Performance (slower cache hits due to user-scoped lookups)
--
-- Solution: Remove accountId from cache keys, share weather across all users

-- ============================================================================
-- Step 1: Update RLS Policies to Allow Shared Access
-- ============================================================================

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Users can view weather cache" ON weather_cache;

-- Create new policy allowing all authenticated users to read ALL weather data
CREATE POLICY "Authenticated users can read shared weather cache" 
  ON weather_cache
  FOR SELECT 
  TO authenticated
  USING (true);  -- All authenticated users can access all weather data

-- Service role retains full management access
DROP POLICY IF EXISTS "Service role can manage weather cache" ON weather_cache;
CREATE POLICY "Service role can manage weather cache" 
  ON weather_cache
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- Step 2: Clean Up Old User-Scoped Cache Entries (Optional)
-- ============================================================================

-- This migration is backward compatible - old entries with accountId-prefixed
-- icao_code will still work but won't be matched by new cache keys.
-- They will naturally expire and be replaced by shared entries.

-- To force immediate cleanup (optional, uncomment if desired):
-- DELETE FROM weather_cache WHERE icao_code LIKE '%::%::%';

-- ============================================================================
-- Step 3: Update Table Comments
-- ============================================================================

COMMENT ON TABLE weather_cache IS 'Shared weather cache across all users. Weather data is public and reusable to minimize API calls and improve performance. Cache keys are scoped by ICAO + dataset + mode only (no user isolation).';

COMMENT ON COLUMN weather_cache.icao_code IS 'ICAO airport code (no longer prefixed with accountId). Shared across all users.';

COMMENT ON COLUMN weather_cache.cache_key IS 'Composite cache key: ICAO::dataset::mode (e.g., KJFK::metar_decoded::full). Shared globally.';

-- ============================================================================
-- Verification Query
-- ============================================================================

-- After migration, verify cache is being shared:
-- SELECT icao_code, data_type, COUNT(*) as users_cached, expires_at
-- FROM weather_cache
-- WHERE cache_key NOT LIKE '%::%::%::%'  -- New format (3 segments)
-- GROUP BY icao_code, data_type, expires_at
-- ORDER BY users_cached DESC;

-- Expected: Each ICAO+dataset combo should have 1 entry (shared), not N entries (per-user)
