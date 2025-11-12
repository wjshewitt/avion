-- Enhance airport search capabilities and prepare database for large seed imports.

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;

-- Ensure we can efficiently filter by IATA code.
CREATE INDEX IF NOT EXISTS idx_airports_iata ON airports (iata) WHERE iata IS NOT NULL;

-- Replace basic name index with trigram-powered search support.
DROP INDEX IF EXISTS idx_airports_name;
CREATE INDEX IF NOT EXISTS idx_airports_name_trgm ON airports USING gin (name gin_trgm_ops);

-- Optional convenience index for municipal searches.
CREATE INDEX IF NOT EXISTS idx_airports_city_trgm ON airports USING gin (city gin_trgm_ops);

-- Provide a fuzzy search RPC friendly to Supabase.
CREATE OR REPLACE FUNCTION search_airports_fuzzy(
  search_query text,
  result_limit integer DEFAULT 10
)
RETURNS TABLE (
  icao text,
  iata text,
  name text,
  city text,
  state text,
  country text,
  latitude double precision,
  longitude double precision
)
LANGUAGE plpgsql
AS $$
DECLARE
  normalized_query text := trim(search_query);
BEGIN
  IF normalized_query IS NULL OR normalized_query = '' THEN
    RETURN QUERY
    SELECT
      a.icao,
      a.iata,
      a.name,
      a.city,
      a.state,
      a.country,
      a.latitude,
      a.longitude
    FROM airports a
    WHERE a.iata IS NOT NULL
    ORDER BY a.updated_at DESC, a.name
    LIMIT LEAST(result_limit, 10);
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    a.icao,
    a.iata,
    a.name,
    a.city,
    a.state,
    a.country,
    a.latitude,
    a.longitude
  FROM airports a
  WHERE
    a.icao ILIKE normalized_query || '%'
    OR a.iata ILIKE normalized_query || '%'
    OR (normalized_query <> '' AND (
      similarity(a.name, normalized_query) > 0.2
      OR similarity(COALESCE(a.city, ''), normalized_query) > 0.2
    ))
  ORDER BY
    CASE
      WHEN a.icao = upper(normalized_query) THEN 1
      WHEN a.iata = upper(normalized_query) THEN 2
      WHEN a.icao ILIKE normalized_query || '%' THEN 3
      WHEN a.iata ILIKE normalized_query || '%' THEN 4
      ELSE 5
    END,
    GREATEST(similarity(a.name, normalized_query), similarity(COALESCE(a.city, ''), normalized_query)) DESC,
    a.name
  LIMIT result_limit;
END;
$$;

COMMENT ON FUNCTION search_airports_fuzzy(text, integer) IS 'Normalized fuzzy search combining ICAO, IATA, and English name proximity.';
