// AirportDB API Response Validation and Type Conversion Utilities
// Provides validation and transformation of raw AirportDB.io API responses

import { z } from "zod";
import {
  AirportDBResponse,
  RunwayData,
  FrequencyData,
  NavaidData,
  CountryData,
  RegionData,
  WeatherStationData,
  ILSData,
  AirportDBException,
} from "@/types/airportdb";

// ============================================================================
// Zod Schemas for Runtime Validation
// ============================================================================

// ILS Data Schema
const ILSDataSchema = z.object({
  freq: z.number(),
  course: z.number(),
});

// Runway Data Schema
const RunwayDataSchema = z.object({
  id: z.string(),
  airport_ref: z.string(),
  airport_ident: z.string(),
  length_ft: z.string(),
  width_ft: z.string(),
  surface: z.string(),
  lighted: z.string(),
  closed: z.string(),
  le_ident: z.string(),
  le_latitude_deg: z.string(),
  le_longitude_deg: z.string(),
  le_elevation_ft: z.string(),
  le_heading_degT: z.string(),
  le_displaced_threshold_ft: z.string().optional(),
  le_ils: ILSDataSchema.optional(),
  he_ident: z.string(),
  he_latitude_deg: z.string(),
  he_longitude_deg: z.string(),
  he_elevation_ft: z.string(),
  he_heading_degT: z.string(),
  he_displaced_threshold_ft: z.string().optional(),
  he_ils: ILSDataSchema.optional(),
});

// Frequency Data Schema
const FrequencyDataSchema = z.object({
  id: z.string(),
  airport_ref: z.string(),
  airport_ident: z.string(),
  type: z.string(),
  description: z.string(),
  frequency_mhz: z.string(),
});

// Navaid Data Schema
const NavaidDataSchema = z.object({
  id: z.string(),
  filename: z.string(),
  ident: z.string(),
  name: z.string(),
  type: z.string(),
  frequency_khz: z.string().optional(),
  latitude_deg: z.string(),
  longitude_deg: z.string(),
  elevation_ft: z.string().optional(),
  iso_country: z.string(),
  dme_frequency_khz: z.string().optional(),
  dme_channel: z.string().optional(),
  dme_latitude_deg: z.string().optional(),
  dme_longitude_deg: z.string().optional(),
  dme_elevation_ft: z.string().optional(),
  slaved_variation_deg: z.string().optional(),
  magnetic_variation_deg: z.string(),
  usageType: z.string().optional(),
  power: z.string().optional(),
  associated_airport: z.string().optional(),
});

// Country Data Schema
const CountryDataSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  continent: z.string(),
  wikipedia_link: z.string().optional(),
  keywords: z.string().optional(),
});

// Region Data Schema
const RegionDataSchema = z.object({
  id: z.string(),
  code: z.string(),
  local_code: z.string(),
  name: z.string(),
  continent: z.string(),
  iso_country: z.string(),
  wikipedia_link: z.string().optional(),
  keywords: z.string().optional(),
});

// Weather Station Data Schema
const WeatherStationDataSchema = z.object({
  icao_code: z.string().optional(),
  distance: z.number().optional(),
});

// Main AirportDB Response Schema
const AirportDBResponseSchema = z.object({
  ident: z.string(),
  icao_code: z.string(),
  iata_code: z.string().optional(),
  gps_code: z.string().optional(),
  local_code: z.string().optional(),
  type: z.string(),
  name: z.string(),
  latitude_deg: z.number(),
  longitude_deg: z.number(),
  elevation_ft: z.string().optional(),
  continent: z.string(),
  iso_country: z.string(),
  iso_region: z.string(),
  municipality: z.string(),
  scheduled_service: z.string(),
  home_link: z.string().optional(),
  wikipedia_link: z.string().optional(),
  keywords: z.string().optional(),
  runways: z.array(RunwayDataSchema).nullable().default([]),
  freqs: z.array(FrequencyDataSchema).nullable().default([]),
  navaids: z.array(NavaidDataSchema).nullable().default([]),
  country: CountryDataSchema,
  region: RegionDataSchema,
  station: WeatherStationDataSchema.optional(),
  updatedAt: z.string().optional(),
});

// Batch Response Schema
const AirportDBBatchResponseSchema = z.object({
  airports: z.array(AirportDBResponseSchema),
  errors: z
    .array(
      z.object({
        icao: z.string(),
        error: z.string(),
      })
    )
    .default([]),
});

// Search Response Schema
const AirportDBSearchResponseSchema = z.object({
  airports: z.array(AirportDBResponseSchema),
});

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate a single airport response from AirportDB.io
 */
export function validateAirportResponse(data: unknown): AirportDBResponse {
  try {
    return AirportDBResponseSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map((issue) => {
        const path = issue.path.join(".");
        return `${path}: ${issue.message}`;
      });

      throw new AirportDBException({
        code: "API_ERROR",
        message: `Invalid airport data format: ${issues.join(", ")}`,
        details: { zodError: error.issues, originalData: data },
      });
    }
    throw error;
  }
}

/**
 * Validate a batch response from AirportDB.io
 */
export function validateBatchResponse(data: unknown) {
  try {
    return AirportDBBatchResponseSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map((issue) => {
        const path = issue.path.join(".");
        return `${path}: ${issue.message}`;
      });

      throw new AirportDBException({
        code: "API_ERROR",
        message: `Invalid batch response format: ${issues.join(", ")}`,
        details: { zodError: error.issues, originalData: data },
      });
    }
    throw error;
  }
}

/**
 * Validate a search response from AirportDB.io
 */
export function validateSearchResponse(data: unknown): AirportDBResponse[] {
  try {
    const result = AirportDBSearchResponseSchema.parse(data);
    return result.airports;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map((issue) => {
        const path = issue.path.join(".");
        return `${path}: ${issue.message}`;
      });

      throw new AirportDBException({
        code: "API_ERROR",
        message: `Invalid search response format: ${issues.join(", ")}`,
        details: { zodError: error.issues, originalData: data },
      });
    }
    throw error;
  }
}

// ============================================================================
// Type Conversion Utilities
// ============================================================================

/**
 * Safely parse a string to number, returning undefined if invalid
 */
export function safeParseNumber(value: string | undefined): number | undefined {
  if (!value || value.trim() === "") {
    return undefined;
  }

  const parsed = parseFloat(value);
  return isNaN(parsed) ? undefined : parsed;
}

/**
 * Safely parse a string to integer, returning undefined if invalid
 */
export function safeParseInteger(
  value: string | undefined
): number | undefined {
  if (!value || value.trim() === "") {
    return undefined;
  }

  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? undefined : parsed;
}

/**
 * Parse string boolean values ("1", "0", "yes", "no", "true", "false")
 */
export function parseStringBoolean(value: string | undefined): boolean {
  if (!value) return false;

  const normalized = value.toLowerCase().trim();
  return normalized === "1" || normalized === "yes" || normalized === "true";
}

/**
 * Convert runway data string fields to appropriate types
 */
export function convertRunwayData(runway: RunwayData): {
  length_ft: number | undefined;
  width_ft: number | undefined;
  lighted: boolean;
  closed: boolean;
  le_latitude: number | undefined;
  le_longitude: number | undefined;
  le_elevation_ft: number | undefined;
  le_heading_degT: number | undefined;
  le_displaced_threshold_ft: number | undefined;
  he_latitude: number | undefined;
  he_longitude: number | undefined;
  he_elevation_ft: number | undefined;
  he_heading_degT: number | undefined;
  he_displaced_threshold_ft: number | undefined;
} {
  return {
    length_ft: safeParseNumber(runway.length_ft),
    width_ft: safeParseNumber(runway.width_ft),
    lighted: parseStringBoolean(runway.lighted),
    closed: parseStringBoolean(runway.closed),
    le_latitude: safeParseNumber(runway.le_latitude_deg),
    le_longitude: safeParseNumber(runway.le_longitude_deg),
    le_elevation_ft: safeParseNumber(runway.le_elevation_ft),
    le_heading_degT: safeParseNumber(runway.le_heading_degT),
    le_displaced_threshold_ft: safeParseNumber(
      runway.le_displaced_threshold_ft
    ),
    he_latitude: safeParseNumber(runway.he_latitude_deg),
    he_longitude: safeParseNumber(runway.he_longitude_deg),
    he_elevation_ft: safeParseNumber(runway.he_elevation_ft),
    he_heading_degT: safeParseNumber(runway.he_heading_degT),
    he_displaced_threshold_ft: safeParseNumber(
      runway.he_displaced_threshold_ft
    ),
  };
}

/**
 * Convert frequency data string fields to appropriate types
 */
export function convertFrequencyData(frequency: FrequencyData): {
  frequency_mhz: number | undefined;
} {
  return {
    frequency_mhz: safeParseNumber(frequency.frequency_mhz),
  };
}

/**
 * Convert navaid data string fields to appropriate types
 */
export function convertNavaidData(navaid: NavaidData): {
  frequency_khz: number | undefined;
  latitude: number | undefined;
  longitude: number | undefined;
  elevation_ft: number | undefined;
  dme_frequency_khz: number | undefined;
  dme_latitude: number | undefined;
  dme_longitude: number | undefined;
  dme_elevation_ft: number | undefined;
  slaved_variation_deg: number | undefined;
  magnetic_variation_deg: number | undefined;
} {
  return {
    frequency_khz: safeParseNumber(navaid.frequency_khz),
    latitude: safeParseNumber(navaid.latitude_deg),
    longitude: safeParseNumber(navaid.longitude_deg),
    elevation_ft: safeParseNumber(navaid.elevation_ft),
    dme_frequency_khz: safeParseNumber(navaid.dme_frequency_khz),
    dme_latitude: safeParseNumber(navaid.dme_latitude_deg),
    dme_longitude: safeParseNumber(navaid.dme_longitude_deg),
    dme_elevation_ft: safeParseNumber(navaid.dme_elevation_ft),
    slaved_variation_deg: safeParseNumber(navaid.slaved_variation_deg),
    magnetic_variation_deg: safeParseNumber(navaid.magnetic_variation_deg),
  };
}

/**
 * Convert airport response elevation and scheduled service fields
 */
export function convertAirportData(airport: AirportDBResponse): {
  elevation_ft: number | undefined;
  scheduled_service: boolean;
} {
  return {
    elevation_ft: safeParseNumber(airport.elevation_ft),
    scheduled_service: parseStringBoolean(airport.scheduled_service),
  };
}

// ============================================================================
// Data Quality Assessment
// ============================================================================

/**
 * Calculate data completeness score for an airport (0-100)
 */
export function calculateDataCompleteness(airport: AirportDBResponse): number {
  let score = 0;
  let maxScore = 0;

  // Core data (required) - 40 points
  maxScore += 40;
  if (
    airport.ident &&
    airport.name &&
    airport.latitude_deg &&
    airport.longitude_deg
  ) {
    score += 40;
  }

  // IATA code - 5 points
  maxScore += 5;
  if (airport.iata_code) {
    score += 5;
  }

  // Elevation - 5 points
  maxScore += 5;
  if (airport.elevation_ft) {
    score += 5;
  }

  // Runway data - 20 points
  maxScore += 20;
  if (airport.runways && airport.runways.length > 0) {
    score += 10; // Base points for having runways

    // Additional points for runway detail completeness
    const runwayCompleteness = airport.runways.reduce((acc, runway) => {
      let runwayScore = 0;
      if (runway.length_ft) runwayScore += 1;
      if (runway.width_ft) runwayScore += 1;
      if (runway.surface) runwayScore += 1;
      return acc + runwayScore;
    }, 0);

    score += Math.min(10, runwayCompleteness * 2); // Up to 10 additional points
  }

  // Communication frequencies - 15 points
  maxScore += 15;
  if (airport.freqs && airport.freqs.length > 0) {
    score += Math.min(15, airport.freqs.length * 3); // 3 points per frequency, max 15
  }

  // Navigation aids - 10 points
  maxScore += 10;
  if (airport.navaids && airport.navaids.length > 0) {
    score += Math.min(10, airport.navaids.length * 2); // 2 points per navaid, max 10
  }

  // Weather station - 5 points
  maxScore += 5;
  if (airport.station && airport.station.icao_code) {
    score += 5;
  }

  return Math.round((score / maxScore) * 100);
}

/**
 * Assess data quality issues in an airport response
 */
export function assessDataQuality(airport: AirportDBResponse): {
  score: number;
  issues: string[];
  warnings: string[];
} {
  const issues: string[] = [];
  const warnings: string[] = [];

  // Check for critical missing data
  if (!airport.ident) {
    issues.push("Missing ICAO code");
  }

  if (!airport.name) {
    issues.push("Missing airport name");
  }

  if (!airport.latitude_deg || !airport.longitude_deg) {
    issues.push("Missing coordinates");
  }

  // Check for important missing data
  if (!airport.iata_code) {
    warnings.push("Missing IATA code");
  }

  if (!airport.elevation_ft) {
    warnings.push("Missing elevation data");
  }

  if (!airport.runways || airport.runways.length === 0) {
    warnings.push("No runway data available");
  } else {
    // Check runway data quality
    const runwaysWithoutLength = airport.runways.filter(
      (r) => !r.length_ft
    ).length;
    if (runwaysWithoutLength > 0) {
      warnings.push(`${runwaysWithoutLength} runways missing length data`);
    }
  }

  if (!airport.freqs || airport.freqs.length === 0) {
    warnings.push("No communication frequencies available");
  }

  if (!airport.station || !airport.station.icao_code) {
    warnings.push("No weather station association");
  }

  const score = calculateDataCompleteness(airport);

  return { score, issues, warnings };
}

// ============================================================================
// Export Schemas for External Use
// ============================================================================

export {
  AirportDBResponseSchema,
  AirportDBBatchResponseSchema,
  AirportDBSearchResponseSchema,
  RunwayDataSchema,
  FrequencyDataSchema,
  NavaidDataSchema,
};
