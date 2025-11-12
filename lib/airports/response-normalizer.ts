/**
 * Response Normalizer for Airport API
 * Ensures backward-compatible API responses when switching between legacy and new cache systems
 * 
 * Legacy system returns: AirportRow (from airports table via getOrRefreshAirport)
 * New system returns: ProcessedAirportData (from airport_cache via AirportService)
 * 
 * This normalizer converts both formats to a consistent shape for API consumers.
 */

import type { ProcessedAirportData } from "@/types/airportdb";
import type { AirportRow } from "@/lib/supabase/types";

/**
 * Normalized API response shape - matches legacy format
 * This is what all API consumers expect
 */
export interface NormalizedAirportResponse {
  // Core identifiers
  icao: string;
  iata: string | null;
  name: string;

  // Location
  city: string | null;
  state: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  elevation_ft: number | null;

  // Operational data
  runways: any[] | null;
  frequencies: any[] | null;

  // Metadata
  updated_at: string;
  raw?: any;

  // Additional fields from new system (optional, for enhanced clients)
  _enhanced?: {
    classification?: ProcessedAirportData["classification"];
    capabilities?: ProcessedAirportData["capabilities"];
    communications?: ProcessedAirportData["communications"];
    navigation?: ProcessedAirportData["navigation"];
    data_quality?: ProcessedAirportData["data_quality"];
  };
}

/**
 * Normalize legacy AirportRow to consistent API response format
 */
export function normalizeLegacyAirport(
  row: AirportRow
): NormalizedAirportResponse {
  return {
    icao: row.icao,
    iata: row.iata || null,
    name: row.name,
    city: row.city || null,
    state: row.state || null,
    country: row.country || null,
    latitude: row.latitude || null,
    longitude: row.longitude || null,
    timezone: row.timezone || null,
    elevation_ft: row.elevation_ft || null,
    runways: row.runways ? (row.runways as any) : null,
    frequencies: row.frequencies ? (row.frequencies as any) : null,
    updated_at: row.updated_at,
    raw: row.raw,
  };
}

/**
 * Normalize new ProcessedAirportData to legacy-compatible API response format
 */
export function normalizeProcessedAirport(
  data: ProcessedAirportData
): NormalizedAirportResponse {
  return {
    icao: data.icao,
    iata: data.iata || null,
    name: data.name,
    city: data.location.municipality || null,
    state: data.location.region || null,
    country: data.location.country || null,
    latitude: data.coordinates.latitude || null,
    longitude: data.coordinates.longitude || null,
    timezone: null, // Not directly available in ProcessedAirportData
    elevation_ft: data.coordinates.elevation_ft || null,
    runways: data.runways.details || null,
    frequencies: extractFrequenciesArray(data.communications) || null,
    updated_at: data.data_quality.last_updated,
    raw: undefined, // Not included in processed data by default

    // Enhanced data available for modern clients
    _enhanced: {
      classification: data.classification,
      capabilities: data.capabilities,
      communications: data.communications,
      navigation: data.navigation,
      data_quality: data.data_quality,
    },
  };
}

/**
 * Convert communications object back to legacy frequencies array format
 */
function extractFrequenciesArray(
  communications: ProcessedAirportData["communications"]
): any[] | null {
  if (!communications || !communications.frequencies_by_type) {
    return null;
  }

  const frequencies: any[] = [];
  Object.entries(communications.frequencies_by_type).forEach(([type, freqs]) => {
    if (Array.isArray(freqs)) {
      frequencies.push(...freqs);
    }
  });

  return frequencies.length > 0 ? frequencies : null;
}

/**
 * Normalize AirportLookupResult to API response format
 */
export function normalizeAirportLookupResult(
  result: {
    data: ProcessedAirportData | null;
    source: "cache" | "api" | "fallback";
    cached: boolean;
    timestamp: string;
    rateLimited: boolean;
  }
): NormalizedAirportResponse | null {
  if (!result.data) {
    return null;
  }

  return normalizeProcessedAirport(result.data);
}

/**
 * Normalize batch airport results to API response format
 */
export function normalizeBatchAirportResults(
  airports: ProcessedAirportData[]
): NormalizedAirportResponse[] {
  return airports.map(normalizeProcessedAirport);
}

/**
 * Type guard to check if response is from legacy system
 */
export function isLegacyAirportRow(data: any): data is AirportRow {
  return (
    data &&
    typeof data === "object" &&
    "icao" in data &&
    "name" in data &&
    "updated_at" in data &&
    // Legacy has 'raw' field but not 'coordinates' object
    "raw" in data &&
    !("coordinates" in data)
  );
}

/**
 * Type guard to check if response is from new system
 */
export function isProcessedAirportData(data: any): data is ProcessedAirportData {
  return (
    data &&
    typeof data === "object" &&
    "icao" in data &&
    "name" in data &&
    "coordinates" in data &&
    "location" in data &&
    "classification" in data &&
    "data_quality" in data
  );
}

/**
 * Universal normalizer - automatically detects source and normalizes
 */
export function normalizeAirportResponse(
  data: AirportRow | ProcessedAirportData | null
): NormalizedAirportResponse | null {
  if (!data) {
    return null;
  }

  if (isLegacyAirportRow(data)) {
    return normalizeLegacyAirport(data);
  }

  if (isProcessedAirportData(data)) {
    return normalizeProcessedAirport(data);
  }

  // Fallback: attempt to normalize as legacy format
  console.warn("Unknown airport data format, attempting legacy normalization");
  return normalizeLegacyAirport(data as AirportRow);
}
