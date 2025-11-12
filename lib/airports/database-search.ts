// Database Airport Search Service
// Searches the Supabase airports table with fuzzy matching
//
// ⚠️ DEPRECATED: This module is deprecated in favor of cache-search.ts
// which searches the airport_cache table (production architecture).
// This file is kept for backward compatibility during migration period only.
// Use searchAirportCache() from lib/airports/cache-search.ts instead.

import { createAdminClient } from "@/lib/supabase/admin";
import { AirportSearchResult } from "@/types/airports";

/**
 * Calculate match score for search result ranking
 */
function calculateMatchScore(query: string, row: any): number {
  const q = query.toLowerCase();
  
  // Exact ICAO match
  if (row.icao?.toLowerCase() === q) return 1.0;
  
  // Exact IATA match
  if (row.iata?.toLowerCase() === q) return 0.95;
  
  // Name starts with query
  if (row.name?.toLowerCase().startsWith(q)) return 0.9;
  
  // Name contains query
  if (row.name?.toLowerCase().includes(q)) return 0.7;
  
  // City starts with query
  if (row.city?.toLowerCase().startsWith(q)) return 0.6;
  
  // City contains query
  if (row.city?.toLowerCase().includes(q)) return 0.5;
  
  // Partial match
  return 0.3;
}

/**
 * Determine the type of match for display
 */
function getMatchType(
  query: string,
  row: any
): "exact" | "iata" | "name" | "city" | "partial" {
  const q = query.toLowerCase();
  
  if (row.icao?.toLowerCase() === q) return "exact";
  if (row.iata?.toLowerCase() === q) return "iata";
  if (row.name?.toLowerCase().includes(q)) return "name";
  if (row.city?.toLowerCase().includes(q)) return "city";
  return "partial";
}

/**
 * Search airports in Supabase database
 * Uses pattern matching on ICAO, IATA, name, and city
 */
export async function searchAirportsInDB(
  query: string,
  limit: number = 20
): Promise<AirportSearchResult[]> {
  const supabase = createAdminClient();
  const q = query.trim().toUpperCase();
  
  // Search with OR condition on multiple fields - select ALL fields for detailed info
  const { data, error } = await supabase
    .from("airports")
    .select("*")
    .or(`icao.ilike.${q}%,iata.ilike.${q}%,name.ilike.%${q}%,city.ilike.%${q}%`)
    .limit(limit);
  
  if (error) {
    console.error("Database search error:", error);
    throw error;
  }
  
  if (!data || data.length === 0) {
    return [];
  }
  
  // Map database results to AirportSearchResult format with full data
  const results = data.map((row: any) => {
    // Calculate runway info from the runways data
    const runways = row.runways || [];
    const runwayCount = Array.isArray(runways) ? runways.length : 0;
    const longestRunway = Array.isArray(runways) && runways.length > 0
      ? Math.max(...runways.map((r: any) => parseInt(r.length_ft) || 0))
      : 5000;

    return {
      airport: {
        icao: row.icao,
        iata: row.iata || undefined,
        name: row.name,
        city: row.city || "",
        state: row.state || undefined,
        country: row.country || "",
        latitude: row.latitude || 0,
        longitude: row.longitude || 0,
        timezone: row.timezone || "UTC",
        is_corporate_hub: false,
        popularity_score: 50,
        aircraft_types: [],
        facilities: [],
        runway_count: runwayCount,
        longest_runway_ft: longestRunway,
        // Include detailed data from database
        runways: row.runways,
        frequencies: row.frequencies,
        elevation_ft: row.elevation_ft,
        raw: row.raw, // Full API response
      },
      score: calculateMatchScore(query, row),
      matchType: getMatchType(query, row),
    };
  });
  
  // Sort by score descending
  results.sort((a, b) => b.score - a.score);
  
  return results;
}

/**
 * Check if an airport exists in the database by ICAO code
 */
export async function airportExistsInDB(icao: string): Promise<boolean> {
  const supabase = createAdminClient();
  const normalizedIcao = icao.trim().toUpperCase();
  
  const { data, error } = await supabase
    .from("airports")
    .select("icao")
    .eq("icao", normalizedIcao)
    .single();
  
  if (error) {
    return false;
  }
  
  return !!data;
}
