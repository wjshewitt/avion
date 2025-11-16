import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

export const revalidate = 3600; // Cache for 1 hour

/**
 * GET /api/airports/filter-options
 * 
 * Returns all available filter options from the airport cache.
 * Used to populate dropdowns with countries, regions, and types.
 * 
 * Response is heavily cached (1 hour) as this data changes infrequently.
 */
export async function GET() {
  try {
    const supabase = await createServerSupabase();

    // Query all distinct countries, regions, and types
    const { data: airports, error } = await supabase
      .from('airport_cache')
      .select('core_data, runway_data')
      .not('core_data', 'is', null);

    if (error) {
      console.error('[filter-options] Database error:', error);
      throw error;
    }

    // Process results to extract unique values
    const countries = new Set<string>();
    const regionsByCountry: Record<string, Set<string>> = {};
    const typeCounts: Record<string, number> = {
      large_airport: 0,
      medium_airport: 0,
      small_airport: 0,
    };

    for (const airport of (airports as any[]) || []) {
      const coreData = airport.core_data as any;
      
      // Extract country
      const country = coreData?.location?.country;
      if (country) {
        countries.add(country);
        
        // Extract region for this country
        const region = coreData?.location?.region;
        if (region) {
          if (!regionsByCountry[country]) {
            regionsByCountry[country] = new Set();
          }
          regionsByCountry[country].add(region);
        }
      }

      // Count types
      const type = coreData?.classification?.type;
      if (type && type in typeCounts) {
        typeCounts[type]++;
      }
    }

    // Convert sets to sorted arrays
    const sortedCountries = Array.from(countries).sort((a, b) => 
      a.localeCompare(b)
    );

    const sortedRegionsByCountry: Record<string, string[]> = {};
    for (const [country, regions] of Object.entries(regionsByCountry)) {
      sortedRegionsByCountry[country] = Array.from(regions).sort((a, b) => 
        a.localeCompare(b)
      );
    }

    const types = [
      { 
        value: 'large_airport', 
        label: 'Large Airport', 
        count: typeCounts.large_airport 
      },
      { 
        value: 'medium_airport', 
        label: 'Medium Airport', 
        count: typeCounts.medium_airport 
      },
      { 
        value: 'small_airport', 
        label: 'Small Airport', 
        count: typeCounts.small_airport 
      },
    ];

    const totalAirports = airports?.length || 0;

    return NextResponse.json({
      success: true,
      data: {
        countries: sortedCountries,
        regionsByCountry: sortedRegionsByCountry,
        types,
        stats: {
          totalAirports,
          lastUpdated: new Date().toISOString(),
        },
      },
    }, {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200',
      },
    });

  } catch (error) {
    console.error('[filter-options] Error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to load filter options',
      code: 'OPTIONS_LOAD_FAILED',
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  }
}
