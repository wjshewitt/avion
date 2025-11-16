import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/server/rate-limit';
import { z } from 'zod';

// Request validation schema
const FilterParamsSchema = z.object({
  // Search
  query: z.string().max(100).optional(),
  
  // Location
  country: z.string().max(100).optional(),
  region: z.string().max(100).optional(),
  
  // Classification
  type: z.enum(['large_airport', 'medium_airport', 'small_airport']).optional(),
  scheduledService: z.boolean().optional(),
  
  // Runway requirements
  minRunwayLength: z.number().int().min(0).max(30000).optional(),
  surfaceType: z.enum(['ALL', 'PAVED', 'UNPAVED']).optional(),
  
  // Capabilities
  requiresILS: z.boolean().optional(),
  requiresLighting: z.boolean().optional(),
  
  // Pagination
  limit: z.number().int().min(1).max(200).optional().default(100),
  offset: z.number().int().min(0).optional().default(0),
});

type FilterParams = z.infer<typeof FilterParamsSchema>;

/**
 * POST /api/airports/filter
 * 
 * Filters airports from the cache with server-side database queries.
 * Supports filtering by country, region, type, runway requirements, and capabilities.
 * 
 * Rate limited to 60 requests per minute per IP.
 */
export async function POST(request: NextRequest) {
  const startTime = performance.now();
  
  try {
    // Rate limiting: 60 requests per minute
    await rateLimit(request, { limit: 60, windowMs: 60_000 });

    // Parse and validate request body
    const body = await request.json();
    const validatedParams = FilterParamsSchema.parse(body);

    const supabase = await createServerSupabase();

    // Build SQL query with filters
    let query = supabase
      .from('airport_cache')
      .select('icao_code, iata_code, core_data, runway_data, capability_data', { count: 'exact' });

    // Apply filters using JSONB operators
    
    // Type filter
    if (validatedParams.type) {
      query = query.eq('core_data->classification->>type', validatedParams.type);
    }

    // Country filter
    if (validatedParams.country) {
      query = query.eq('core_data->location->>country', validatedParams.country);
    }

    // Region filter
    if (validatedParams.region) {
      query = query.eq('core_data->location->>region', validatedParams.region);
    }

    // Scheduled service
    if (validatedParams.scheduledService) {
      query = query.eq('core_data->classification->>scheduled_service', 'true');
    }

    // Search query (ICAO, IATA, or name)
    if (validatedParams.query && validatedParams.query.length >= 2) {
      const searchTerm = `%${validatedParams.query}%`;
      query = query.or(
        `icao_code.ilike.${searchTerm},iata_code.ilike.${searchTerm},core_data->>name.ilike.${searchTerm}`
      );
    }

    // Only include valid airports
    query = query.not('core_data', 'is', null);

    // Order by type priority, then name
    query = query.order('core_data->classification->>type', { ascending: true });
    query = query.order('core_data->>name', { ascending: true });

    // Pagination
    const { limit, offset } = validatedParams;
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data: results, error, count } = await query;

    if (error) {
      console.error('[filter] Database error:', error);
      throw error;
    }

    // Post-process for complex filters that can't be done efficiently in SQL
    let filtered: any[] = results || [];

    // Runway length filter
    if (validatedParams.minRunwayLength && validatedParams.minRunwayLength > 0) {
      const minLength = validatedParams.minRunwayLength;
      filtered = filtered.filter((airport: any) => {
        const longest = airport.runway_data?.longest_ft;
        return longest && longest >= minLength;
      });
    }

    // Surface type filter
    if (validatedParams.surfaceType && validatedParams.surfaceType !== 'ALL') {
      filtered = filtered.filter((airport: any) => {
        const surfaces = airport.runway_data?.surface_types || [];
        if (validatedParams.surfaceType === 'PAVED') {
          return surfaces.some((s: string) => ['ASP', 'CON'].includes(s));
        } else {
          return surfaces.some((s: string) => !['ASP', 'CON'].includes(s));
        }
      });
    }

    // ILS requirement
    if (validatedParams.requiresILS) {
      filtered = filtered.filter((airport: any) => 
        airport.runway_data?.ils_equipped === true
      );
    }

    // Lighting requirement
    if (validatedParams.requiresLighting) {
      filtered = filtered.filter((airport: any) => 
        airport.runway_data?.all_lighted === true
      );
    }

    // Convert to airport data format
    const airports = filtered.map((airport: any) => ({
      icao: airport.icao_code,
      iata: airport.iata_code,
      name: airport.core_data?.name,
      city: airport.core_data?.location?.municipality || '',
      state: airport.core_data?.location?.region,
      country: airport.core_data?.location?.country || '',
      latitude: airport.core_data?.coordinates?.latitude || 0,
      longitude: airport.core_data?.coordinates?.longitude || 0,
      elevation_ft: airport.core_data?.coordinates?.elevation_ft,
      timezone: 'UTC',
      is_corporate_hub: airport.core_data?.classification?.scheduled_service || false,
      popularity_score: airport.core_data?.data_quality?.completeness_score || 0,
      runway_count: airport.runway_data?.count || 0,
      longest_runway_ft: airport.runway_data?.longest_ft || 0,
      classification: airport.core_data?.classification,
      runways: airport.runway_data,
    }));

    const queryTime = performance.now() - startTime;

    // Log slow queries
    if (queryTime > 1000) {
      console.warn('[filter] Slow query detected', {
        filters: validatedParams,
        queryTime: Math.round(queryTime),
        resultCount: airports.length,
      });
    }

    const total = count || filtered.length;

    return NextResponse.json({
      success: true,
      data: {
        airports,
        pagination: {
          total,
          offset,
          limit,
          hasMore: offset + airports.length < total,
        },
        appliedFilters: validatedParams,
        _meta: {
          queryTime: Math.round(queryTime),
          cached: false,
        },
      },
    });

  } catch (error) {
    const queryTime = performance.now() - startTime;
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid filter parameters',
        code: 'VALIDATION_ERROR',
        details: error.issues,
      }, { status: 400 });
    }

    console.error('[filter] Query failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      queryTime: Math.round(queryTime),
    });

    return NextResponse.json({
      success: false,
      error: 'Unable to filter airports. Please try again.',
      code: 'QUERY_FAILED',
    }, { status: 500 });
  }
}
