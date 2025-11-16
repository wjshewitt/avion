-- Create RPC functions powering airport filtering and filter option aggregation
-- Function: filter_airports (performs server-side filtering with pagination)

CREATE OR REPLACE FUNCTION public.filter_airports (
  p_query text DEFAULT NULL,
  p_country text DEFAULT NULL,
  p_region text DEFAULT NULL,
  p_type text DEFAULT NULL,
  p_scheduled_service boolean DEFAULT NULL,
  p_min_runway_length integer DEFAULT NULL,
  p_requires_ils boolean DEFAULT NULL,
  p_requires_lighting boolean DEFAULT NULL,
  p_limit integer DEFAULT 100,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  icao_code text,
  iata_code text,
  core_data jsonb,
  runway_data jsonb,
  capability_data jsonb,
  total_count bigint
)
LANGUAGE sql
STABLE
AS $$
  WITH params AS (
    SELECT
      NULLIF(TRIM(p_query), '') AS query,
      NULLIF(TRIM(p_country), '') AS country,
      NULLIF(TRIM(p_region), '') AS region,
      NULLIF(TRIM(p_type), '') AS airport_type,
      p_scheduled_service AS scheduled_service,
      p_min_runway_length AS min_runway_length,
      p_requires_ils AS requires_ils,
      p_requires_lighting AS requires_lighting,
      LEAST(200, GREATEST(1, COALESCE(p_limit, 100))) AS safe_limit,
      GREATEST(0, COALESCE(p_offset, 0)) AS safe_offset
  ),
  filtered AS (
    SELECT
      ac.icao_code,
      ac.iata_code,
      ac.core_data,
      ac.runway_data,
      ac.capability_data
    FROM airport_cache ac
    CROSS JOIN params
    WHERE ac.core_data IS NOT NULL
      AND ac.core_data->>'name' IS NOT NULL
      AND (
        params.query IS NULL OR
        ac.icao_code ILIKE '%' || params.query || '%' OR
        ac.iata_code ILIKE '%' || params.query || '%' OR
        ac.core_data->>'name' ILIKE '%' || params.query || '%'
      )
      AND (params.country IS NULL OR ac.core_data->'location'->>'country' = params.country)
      AND (params.region IS NULL OR ac.core_data->'location'->>'region' = params.region)
      AND (params.airport_type IS NULL OR ac.core_data->'classification'->>'type' = params.airport_type)
      AND (
        params.scheduled_service IS NULL OR
        (ac.core_data->'classification'->>'scheduled_service')::boolean = params.scheduled_service
      )
      AND (
        params.min_runway_length IS NULL OR
        (ac.runway_data->>'longest_ft')::integer >= params.min_runway_length
      )
      AND (
        params.requires_ils IS NOT TRUE OR
        (ac.runway_data->>'ils_equipped')::boolean = TRUE
      )
      AND (
        params.requires_lighting IS NOT TRUE OR
        (ac.runway_data->>'all_lighted')::boolean = TRUE
      )
  ),
  ordered AS (
    SELECT
      f.*,
      COUNT(*) OVER () AS total_count,
      ROW_NUMBER() OVER (
        ORDER BY
          CASE f.core_data->'classification'->>'type'
            WHEN 'large_airport' THEN 1
            WHEN 'medium_airport' THEN 2
            WHEN 'small_airport' THEN 3
            ELSE 4
          END,
          f.core_data->>'name'
      ) - 1 AS row_index
    FROM filtered f
  )
  SELECT
    o.icao_code,
    o.iata_code,
    o.core_data,
    o.runway_data,
    o.capability_data,
    o.total_count
  FROM ordered o
  CROSS JOIN params
  WHERE o.row_index >= params.safe_offset
    AND o.row_index < params.safe_offset + params.safe_limit
  ORDER BY o.row_index;
$$;

COMMENT ON FUNCTION public.filter_airports IS 'Server-side filtering for airport directory with pagination and performance-sensitive predicates.';

-- Function: airport_filter_dimensions (aggregated filter option metadata)

CREATE OR REPLACE FUNCTION public.airport_filter_dimensions()
RETURNS TABLE (
  country text,
  region text,
  type text,
  airport_count bigint
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    ac.core_data->'location'->>'country' AS country,
    ac.core_data->'location'->>'region' AS region,
    ac.core_data->'classification'->>'type' AS type,
    COUNT(*) AS airport_count
  FROM airport_cache ac
  WHERE ac.core_data IS NOT NULL
    AND ac.core_data->>'name' IS NOT NULL
  GROUP BY 1, 2, 3
  ORDER BY country NULLS LAST, region NULLS LAST;
$$;

COMMENT ON FUNCTION public.airport_filter_dimensions IS 'Aggregated country/region/type metadata for airport filters.';
