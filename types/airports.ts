// Enhanced Airport Types with Zod Validation
import { z } from "zod";

// ============================================================================
// Base Airport Data Types
// ============================================================================

// Timezone information
export const TimezoneDataSchema = z.string();

// Aircraft types supported at airport
export const AircraftTypeSchema = z.enum([
  "business_jet",
  "turboprop", 
  "helicopter",
  "commercial",
  "regional"
]);

// Airport facilities
export const AirportFacilitySchema = z.enum([
  "fbo",
  "customs", 
  "charter",
  "maintenance",
  "fuel",
  "hangar"
]);

// Enhanced airport data structure
export const AirportDataSchema = z.object({
  // Airport identifiers
  icao: z.string().length(4, "ICAO code must be exactly 4 characters"),
  iata: z.string().length(3, "IATA code must be exactly 3 characters").optional(),
  
  // Location information
  name: z.string().min(1, "Airport name is required"),
  city: z.string(),
  state: z.string().optional(),
  country: z.string(),
  
  // Geographic coordinates
  latitude: z.number().min(-90).max(90, "Latitude must be between -90 and 90"),
  longitude: z.number().min(-180).max(180, "Longitude must be between -180 and 180"),
  
  // Timezone information
  timezone: TimezoneDataSchema,
  
  // Corporate aviation specific data
  is_corporate_hub: z.boolean().default(false),
  popularity_score: z.number().min(0).max(100).default(50),
  
  // Airport capabilities
  aircraft_types: z.array(AircraftTypeSchema).default([]),
  facilities: z.array(AirportFacilitySchema).default([]),
  
  // Runway information
  runway_count: z.number().min(1).max(10).default(1),
  longest_runway_ft: z.number().min(1000).max(20000).default(5000),
  
  // Detailed data from AirportDB (optional)
  runways: z.any().optional(),
  frequencies: z.any().optional(),
  elevation_ft: z.number().optional(),
  raw: z.any().optional(),
});

// Export types from schemas
export type AirportData = z.infer<typeof AirportDataSchema>;
export type TimezoneData = z.infer<typeof TimezoneDataSchema>;
export type AircraftType = z.infer<typeof AircraftTypeSchema>;
export type AirportFacility = z.infer<typeof AirportFacilitySchema>;

// ============================================================================
// Search and Fuzzy Matching Types
// ============================================================================

// Search result with fuzzy match score
export const AirportSearchResultSchema = z.object({
  airport: AirportDataSchema,
  score: z.number().min(0).max(1),
  matchType: z.enum(["exact", "iata", "name", "city", "partial"]),
});

export type AirportSearchResult = z.infer<typeof AirportSearchResultSchema>;

// Search query parameters
export const AirportSearchQuerySchema = z.object({
  query: z.string().min(1, "Search query is required"),
  limit: z.number().min(1).max(20).default(5),
  popularFirst: z.boolean().default(true),
});

export type AirportSearchQuery = z.infer<typeof AirportSearchQuerySchema>;

// ============================================================================
// Database and Cache Types
// ============================================================================

// Airport database interface
export interface AirportDatabase {
  getAll(): Promise<AirportData[]>;
  findByIcao(icao: string): Promise<AirportData | null>;
  findByIata(iata: string): Promise<AirportData | null>;
  search(query: AirportSearchQuery): Promise<AirportSearchResult[]>;
  getPopular(limit?: number): Promise<AirportData[]>;
}

// Airport cache interface
export interface AirportCache {
  get(key: string): AirportSearchResult[] | null;
  set(key: string, results: AirportSearchResult[]): void;
  clear(): void;
  size(): number;
}

// ============================================================================
// Selection and Component Props Types
// ============================================================================

// Selected airport value type
export const SelectedAirportSchema = z.object({
  icao: z.string(),
  iata: z.string().optional(),
  name: z.string(),
  city: z.string(),
  country: z.string(),
});

export type SelectedAirport = z.infer<typeof SelectedAirportSchema>;

// Airport select component props verification schema (for component prop parsing)
export const AirportSelectPropsSchema = z.object({
  value: z.union([z.string(), SelectedAirportSchema, z.null()]),
  onChange: z.function(),
  placeholder: z.string().optional(),
  disabled: z.boolean().optional(),
  maxLength: z.number().optional(),
  showIata: z.boolean().optional(),
  showPopular: z.boolean().optional(),
  popularLimit: z.number().optional(),
  onBlur: z.function().optional(),
  onFocus: z.function().optional(),
  className: z.string().optional(),
  inputClassName: z.string().optional(),
});

// Airport select component props
export interface AirportSelectProps {
  // Basic props
  value: string | SelectedAirport | null;
  onChange: (airport: SelectedAirport | null) => void;
  
  // UI props
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  
  // Search props
  showIata?: boolean;
  showPopular?: boolean;
  popularLimit?: number;
  
  // Event handlers
  onBlur?: () => void;
  onFocus?: () => void;
  
  // Custom styling
  className?: string;
  inputClassName?: string;
}

// ============================================================================
// Validation and Error Types
// ============================================================================

// Airport validation errors
export const AirportValidationErrorSchema = z.object({
  code: z.enum(["INVALID_ICAO", "INVALID_IATA", "NOT_FOUND", "INVALID_FORMAT"]),
  message: z.string(),
  field: z.enum(["icao", "iata", "query"]).optional(),
  input: z.string(),
});

export type AirportValidationError = z.infer<typeof AirportValidationErrorSchema>;

// Custom validation error class
export class AirportValidationException extends Error {
  public readonly code: AirportValidationError["code"];
  public readonly field?: AirportValidationError["field"];
  public readonly input: string;

  constructor(validationError: AirportValidationError) {
    super(validationError.message);
    this.name = "AirportValidationError";
    this.code = validationError.code;
    this.field = validationError.field;
    this.input = validationError.input;
  }
}

// ============================================================================
// Default Constants
// ============================================================================

// Popular airports for quick selection (Enhanced with corporate focus)
export const POPULAR_AIRPORTS = [
  // Top Corporate Aviation Hubs (US)
  "KTEB", // Teterboro, NJ - #1 private jet hub
  "KHPN", // Westchester County, NY
  "KADS", // Addison, TX - Dallas area
  "KRYY", // Cobb County, GA - Atlanta area
  "KBUR", // Burbank, CA - Los Angeles area
  "KSNA", // John Wayne, CA - Orange County
  "KPDK", // DeKalb-Peachtree, GA - Atlanta
  "KFXE", // Fort Lauderdale Executive, FL
  "KOPF", // Opa-locka Executive, FL
  "KMDW", // Chicago Midway, IL
  "KDAL", // Dallas Love Field, TX
  "KHOU", // Houston Hobby, TX
  
  // Major Commercial Hubs with strong corporate traffic
  "KJFK", // New York JFK
  "KLAX", // Los Angeles
  "KORD", // Chicago O'Hare
  "KATL", // Atlanta
  "KDFW", // Dallas/Fort Worth
  "KBOS", // Boston Logan
  "KSFO", // San Francisco
  "KMIA", // Miami International
  "KLAS", // Las Vegas
  "KDEN", // Denver
  "KBWI", // Baltimore/Washington
  "KDCA", // Washington Reagan
  "KIAD", // Washington Dulles
  "KPHX", // Phoenix
  "KCLT", // Charlotte
  "KMCO", // Orlando
  "KTPA", // Tampa
  "KPBI", // Palm Beach
  "KFLL", // Fort Lauderdale
  "KSJC", // San Jose
  "KOAK", // Oakland
  
  // International Corporate Hubs
  "EGLL", // London Heathrow
  "EGLF", // Farnborough, UK
  "EGLB", // London Biggin Hill
  "LFPG", // Paris Charles de Gaulle
  "LFPB", // Paris Le Bourget
  "EDDF", // Frankfurt
  "EHAM", // Amsterdam Schiphol
  "LSZH", // Zurich
  "LIRF", // Rome Fiumicino
  "LEMD", // Madrid
  "LEBL", // Barcelona
  "OMDB", // Dubai
  "OTBD", // Doha
  "WSSS", // Singapore Changi
  "RJTT", // Tokyo Narita
  "RJAA", // Tokyo Haneda
  "RKSI", // Seoul Incheon
  "RCTP", // Taipei Taoyuan
  "YSSY", // Sydney
  "YMML", // Melbourne
  "CYYZ", // Toronto Pearson
  "CYVR", // Vancouver
  "CYUL", // Montreal
  "MMMX", // Mexico City
] as const;

// Search limits
export const MAX_SEARCH_RESULTS = 20;
export const DEFAULT_SEARCH_LIMIT = 8;

// Fuzzy match score thresholds
export const FUZZY_THRESHOLDS = {
  EXACT: 1.0,
  VERY_HIGH: 0.9,
  HIGH: 0.8,
  MEDIUM: 0.6,
  LOW: 0.4,
  VERY_LOW: 0.2,
} as const;

// Default airport used when no selection is made
export const DEFAULT_AIRPORT = "KJFK" as const;

// Export all validation functions for use in components
export const validateAirportData = (data: unknown): AirportData => {
  return AirportDataSchema.parse(data);
};

export const validateSearchQuery = (query: unknown): AirportSearchQuery => {
  return AirportSearchQuerySchema.parse(query);
};

export const validateSelectedAirport = (airport: unknown): SelectedAirport => {
  return SelectedAirportSchema.parse(airport);
};

// Utility type checkers
export const isValidIcaoCode = (code: string): boolean => {
  return /^[A-Z]{4}$/.test(code.toUpperCase());
};

export const isValidIataCode = (code: string): boolean => {
  return /^[A-Z]{3}$/.test(code.toUpperCase());
};

export const sanitizeIcaoCode = (code: string): string => {
  return code.trim().toUpperCase();
};

export const sanitizeIataCode = (code: string): string => {
  return code.trim().toUpperCase();
};
