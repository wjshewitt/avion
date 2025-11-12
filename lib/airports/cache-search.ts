// Cache-First Airport Search Service
// Searches the airport_cache table with full-text and fuzzy matching
// Primary data source for all airport search operations

import { createAdminClient } from "@/lib/supabase/admin";
import { AirportSearchResult } from "@/types/airports";
import type { ProcessedAirportData } from "@/types/airportdb";

/**
 * Calculate match score for search result ranking
 */
function calculateMatchScore(query: string, airport: ProcessedAirportData): number {
  const q = query.toLowerCase();
  
  // Exact ICAO match
  if (airport.icao?.toLowerCase() === q) return 1.0;
  
  // Exact IATA match
  if (airport.iata?.toLowerCase() === q) return 0.95;
  
  // Name starts with query
  if (airport.name?.toLowerCase().startsWith(q)) return 0.9;
  
  // Name contains query
  if (airport.name?.toLowerCase().includes(q)) return 0.7;
  
  // City starts with query
  if (airport.location?.municipality?.toLowerCase().startsWith(q)) return 0.6;
  
  // City contains query
  if (airport.location?.municipality?.toLowerCase().includes(q)) return 0.5;
  
  // Country contains query
  if (airport.location?.country?.toLowerCase().includes(q)) return 0.4;
  
  // Partial match
  return 0.3;
}

/**
 * Determine the type of match for display
 */
function getMatchType(
  query: string,
  airport: ProcessedAirportData
): "exact" | "iata" | "name" | "city" | "partial" {
  const q = query.toLowerCase();
  
  if (airport.icao?.toLowerCase() === q) return "exact";
  if (airport.iata?.toLowerCase() === q) return "iata";
  if (airport.name?.toLowerCase().includes(q)) return "name";
  if (airport.location?.municipality?.toLowerCase().includes(q)) return "city";
  return "partial";
}

/**
 * Convert cached airport data to search result format
 */
function convertCacheToSearchResult(
  cacheEntry: any,
  query: string
): AirportSearchResult {
  const coreData = cacheEntry.core_data;
  const runwayData = cacheEntry.runway_data;
  const capabilityData = cacheEntry.capability_data;

  const airport: ProcessedAirportData = {
    icao: cacheEntry.icao_code,
    iata: cacheEntry.iata_code,
    name: coreData.name,
    coordinates: coreData.coordinates || { latitude: 0, longitude: 0 },
    location: coreData.location || {
      municipality: "",
      region: "",
      country: "",
      continent: "",
    },
    classification: coreData.classification || {
      type: "small_airport",
      scheduled_service: false,
      size_category: "local",
    },
    runways: runwayData || {
      count: 0,
      longest_ft: 0,
      shortest_ft: 0,
      surface_types: [],
      all_lighted: false,
      ils_equipped: false,
      details: [],
    },
    communications: cacheEntry.communication_data || {
      has_tower: false,
      has_ground: false,
      has_approach: false,
      has_atis: false,
      frequencies_by_type: {},
      primary_frequencies: {},
    },
    navigation: cacheEntry.navigation_data || {
      navaids_count: 0,
      has_ils: false,
      has_ndb: false,
      has_vor: false,
      approach_types: [],
      navaids_by_type: {},
    },
    capabilities: capabilityData || {
      max_aircraft_category: "A",
      night_operations: false,
      all_weather_operations: false,
      international_capable: false,
      commercial_service: false,
    },
    external_links: coreData.external_links || {},
    weather: {
      metar_available: true,
    },
    data_quality: {
      completeness_score: cacheEntry.data_completeness || 0,
      last_updated: cacheEntry.updated_at,
      source: "airportdb",
    },
  };

  return {
    airport: {
      icao: airport.icao,
      iata: airport.iata,
      name: airport.name,
      city: airport.location.municipality || "",
      state: airport.location.region,
      country: airport.location.country || "",
      latitude: airport.coordinates.latitude || 0,
      longitude: airport.coordinates.longitude || 0,
      timezone: "UTC", // TODO: Add timezone to cache
      is_corporate_hub: airport.classification.scheduled_service || false,
      popularity_score: airport.data_quality.completeness_score,
      aircraft_types: [],
      facilities: [],
      runway_count: airport.runways.count,
      longest_runway_ft: airport.runways.longest_ft,
      runways: airport.runways.details,
      frequencies: Object.values(airport.communications.frequencies_by_type || {}).flat(),
      elevation_ft: airport.coordinates.elevation_ft,
      raw: cacheEntry.raw_api_response,
    },
    score: calculateMatchScore(query, airport),
    matchType: getMatchType(query, airport),
  };
}

/**
 * Search airports in airport_cache table with cache-first strategy
 * Uses full-text search indexes and JSONB queries for optimal performance
 */
export async function searchAirportCache(
  query: string,
  limit: number = 20
): Promise<AirportSearchResult[]> {
  const supabase = createAdminClient();
  const q = query.trim().toUpperCase();
  
  try {
    // Build search query using JSONB operators
    // Search across icao_code, iata_code, and core_data fields
    const { data, error } = await supabase
      .from("airport_cache")
      .select("*")
      .or(
        `icao_code.ilike.${q}%,` +
        `iata_code.ilike.${q}%,` +
        `core_data->>name.ilike.%${q}%,` +
        `core_data->location->>municipality.ilike.%${q}%,` +
        `core_data->location->>country.ilike.%${q}%`
      )
      .limit(limit * 2); // Fetch more for better scoring
    
    if (error) {
      console.error("Cache search error:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Convert cache entries to search results
    const results = data.map((row: any) => 
      convertCacheToSearchResult(row, query)
    );
    
    // Sort by score descending
    results.sort((a, b) => b.score - a.score);
    
    // Return top results
    return results.slice(0, limit);
  } catch (error) {
    console.error("Failed to search airport cache:", error);
    throw error;
  }
}

/**
 * Check if an airport exists in the cache by ICAO code
 */
export async function airportExistsInCache(icao: string): Promise<boolean> {
  const supabase = createAdminClient();
  const normalizedIcao = icao.trim().toUpperCase();
  
  try {
    const { data, error } = await supabase
      .from("airport_cache")
      .select("icao_code")
      .eq("icao_code", normalizedIcao)
      .single();
    
    if (error) {
      return false;
    }
    
    return !!data;
  } catch {
    return false;
  }
}

/**
 * Get airport from cache by ICAO code (for search result details)
 */
export async function getAirportFromCache(
  icao: string
): Promise<AirportSearchResult | null> {
  const supabase = createAdminClient();
  const normalizedIcao = icao.trim().toUpperCase();
  
  try {
    const { data, error } = await supabase
      .from("airport_cache")
      .select("*")
      .eq("icao_code", normalizedIcao)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    return convertCacheToSearchResult(data, icao);
  } catch {
    return null;
  }
}
