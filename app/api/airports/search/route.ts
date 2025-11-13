import { NextRequest, NextResponse } from "next/server";
import { AirportSearchQuerySchema } from "@/types/airports";
import { searchAirportCache } from "@/lib/airports/cache-search";
import { getAirportService } from "@/lib/airports/airport-service";
import { rateLimit } from "@/lib/server/rate-limit";
import { searchFallbackAirports } from "@/lib/airports/local-airportdb-fallback";

export async function GET(request: NextRequest) {
  try {
    await rateLimit(request);
    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters
    const queryData = {
      query: searchParams.get("q") || "",
      limit: parseInt(searchParams.get("limit") || "20"),
      popularFirst: searchParams.get("popularFirst") !== "false",
    };

    // Validate the search query
    const validatedQuery = AirportSearchQuerySchema.parse(queryData);
    const q = validatedQuery.query.trim();

    // Minimum 3 characters for search (rate limit protection)
    if (q.length < 3) {
      return NextResponse.json({
        success: true,
        data: [],
        query: validatedQuery,
        source: "none",
        message: "Minimum 3 characters required",
      });
    }

    // STEP 1: Search airport_cache first (primary data source)
    let results = await searchAirportCache(q, validatedQuery.limit);

    // STEP 2: If no results and query looks like ICAO, fetch from API and cache
    const isIcaoCode = /^[A-Z][A-Z0-9]{3}$/i.test(q);
    
    if (results.length === 0 && isIcaoCode) {
      try {
        // Use AirportService for cache-first API lookup
        const service = getAirportService();
        const icaoUpper = q.toUpperCase();
        const lookupResult = await service.getAirport(icaoUpper);

        if (lookupResult.data) {
          // Convert ProcessedAirportData to search result format
          const airport = lookupResult.data;
          results = [{
            airport: {
              icao: airport.icao,
              iata: airport.iata,
              name: airport.name,
              city: airport.location.municipality || "",
              state: airport.location.region,
              country: airport.location.country || "",
              latitude: airport.coordinates.latitude || 0,
              longitude: airport.coordinates.longitude || 0,
              timezone: "UTC",
              is_corporate_hub: airport.classification.scheduled_service || false,
              popularity_score: airport.data_quality.completeness_score,
              aircraft_types: [],
              facilities: [],
              runway_count: airport.runways.count,
              longest_runway_ft: airport.runways.longest_ft,
              runways: airport.runways.details,
              frequencies: Object.values(airport.communications.frequencies_by_type || {}).flat(),
              elevation_ft: airport.coordinates.elevation_ft,
            },
            score: 1.0, // Exact ICAO match
            matchType: "exact" as const,
          }];

          return NextResponse.json({
            success: true,
            data: results,
            query: validatedQuery,
            source: lookupResult.source === "cache" ? "cache" : "api_cached",
          });
        }

        // Airport not found in API
        return NextResponse.json({
          success: true,
          data: [],
          query: validatedQuery,
          source: "api_not_found",
          message: `Airport ${icaoUpper} not found`,
        });
      } catch (apiError) {
        console.error("AirportService error:", apiError);
        
        // For ICAO lookups, empty result means airport not found
        return NextResponse.json({
          success: true,
          data: [],
          query: validatedQuery,
          source: "api_error",
          message: `Failed to fetch airport ${q.toUpperCase()}`,
        });
      }
    }

    // STEP 3: If still no results, use seed data as fallback
    if (results.length === 0) {
      const fallbackAirports = searchFallbackAirports(q, validatedQuery.limit);
      const localResults = fallbackAirports.map(airport => ({
        airport: {
          icao: airport.icao_code || airport.ident,
          iata: airport.iata_code,
          name: airport.name,
          city: airport.municipality || "",
          state: airport.region?.name,
          country: airport.country?.name || "",
          latitude: airport.latitude_deg || 0,
          longitude: airport.longitude_deg || 0,
          timezone: "UTC",
          is_corporate_hub: airport.scheduled_service === "yes",
          popularity_score: 50,
          aircraft_types: [],
          facilities: [],
          runway_count: airport.runways?.length || 0,
          longest_runway_ft: 0,
          runways: [],
          frequencies: [],
          elevation_ft: airport.elevation_ft ? parseInt(airport.elevation_ft) : undefined,
        },
        score: 0.7,
        matchType: "partial" as const,
      }));
      return NextResponse.json({
        success: true,
        data: localResults,
        query: validatedQuery,
        source: "local_fallback",
      });
    }

    return NextResponse.json({
      success: true,
      data: results,
      query: validatedQuery,
      source: "cache",
    });
  } catch (error) {
    console.error("Airport search error:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid search parameters",
          details: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
