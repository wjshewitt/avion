// AirportDB.io API Response Types
// Based on actual API response structure from AirportDB.io

// ============================================================================
// Raw AirportDB.io API Response Types
// ============================================================================

export interface AirportDBResponse {
  // Core identifiers
  ident: string; // ICAO code (primary)
  icao_code: string; // Same as ident
  iata_code?: string; // 3-letter code (LGW)
  gps_code?: string;
  local_code?: string;

  // Basic information
  type: string; // "large_airport", "medium_airport", "small_airport"
  name: string; // "London Gatwick Airport"

  // Geographic data
  latitude_deg: number;
  longitude_deg: number;
  elevation_ft?: string; // Note: API returns as string "202"

  // Administrative location
  continent: string; // "EU", "NA", etc.
  iso_country: string; // "GB", "US", etc.
  iso_region: string; // "GB-ENG", "US-CA", etc.
  municipality: string; // City/town name

  // Operational status
  scheduled_service: string; // "yes" or "no"

  // External links and metadata
  home_link?: string;
  wikipedia_link?: string;
  keywords?: string; // Comma-separated string

  // Rich operational data (can be null for some airports)
  runways: RunwayData[] | null;
  freqs: FrequencyData[] | null; // Note: "freqs" not "frequencies"
  navaids: NavaidData[] | null;

  // Related geographic entities
  country: CountryData;
  region: RegionData;

  // Weather station association
  station?: WeatherStationData;

  // Metadata
  updatedAt?: string; // ISO timestamp (optional)
}

export interface RunwayData {
  id: string;
  airport_ref: string;
  airport_ident: string;
  length_ft: string; // "10879" - comes as string, needs parsing
  width_ft: string; // "147" - comes as string
  surface: string; // "ASP" (asphalt), "CON" (concrete)
  lighted: string; // "1" (yes) or "0" (no)
  closed: string; // "1" (closed) or "0" (open)

  // Low End (LE) runway details
  le_ident: string; // "08L", "08R"
  le_latitude_deg: string;
  le_longitude_deg: string;
  le_elevation_ft: string;
  le_heading_degT: string; // True heading
  le_displaced_threshold_ft?: string;
  le_ils?: ILSData; // ILS approach data

  // High End (HE) runway details
  he_ident: string; // "26R", "26L"
  he_latitude_deg: string;
  he_longitude_deg: string;
  he_elevation_ft: string;
  he_heading_degT: string;
  he_displaced_threshold_ft?: string;
  he_ils?: ILSData;
}

export interface ILSData {
  freq: number; // 110.9 MHz
  course: number; // 258 degrees
}

export interface FrequencyData {
  id: string;
  airport_ref: string;
  airport_ident: string;
  type: string; // "TWR", "GND", "APP", "ATIS", "CLD", "Dir"
  description: string; // "TWR", "GND", "CLNC DEL", "Director"
  frequency_mhz: string; // "124.3" - comes as string
}

export interface NavaidData {
  id: string;
  filename: string;
  ident: string; // "GE", "GY"
  name: string; // "Gatwick"
  type: string; // "NDB", "VOR", "DME"
  frequency_khz?: string; // "338" - comes as string
  latitude_deg: string;
  longitude_deg: string;
  elevation_ft?: string;
  iso_country: string;
  dme_frequency_khz?: string;
  dme_channel?: string;
  dme_latitude_deg?: string;
  dme_longitude_deg?: string;
  dme_elevation_ft?: string;
  slaved_variation_deg?: string;
  magnetic_variation_deg: string; // "-2.126"
  usageType?: string; // "TERMINAL", "ENROUTE"
  power?: string; // "LOW", "MEDIUM", "HIGH"
  associated_airport?: string; // "EGKK"
}

export interface CountryData {
  id: string;
  code: string; // "GB"
  name: string; // "United Kingdom"
  continent: string; // "EU"
  wikipedia_link?: string;
  keywords?: string;
}

export interface RegionData {
  id: string;
  code: string; // "GB-ENG"
  local_code: string; // "ENG"
  name: string; // "England"
  continent: string;
  iso_country: string;
  wikipedia_link?: string;
  keywords?: string;
}

export interface WeatherStationData {
  icao_code?: string; // "EGKK"
  distance?: number; // 0 (km from airport)
}

// ============================================================================
// Processed Airport Data Types (After Transformation)
// ============================================================================

export interface ProcessedAirportData {
  // Core identifiers (normalized)
  icao: string;
  iata?: string;
  name: string;

  // Location (parsed to proper types)
  coordinates: {
    latitude: number;
    longitude: number;
    elevation_ft?: number;
  };

  // Administrative location
  location: {
    municipality: string;
    region: string;
    country: string;
    continent: string;
  };

  // Airport classification
  classification: {
    type: "large_airport" | "medium_airport" | "small_airport" | "heliport";
    scheduled_service: boolean;
    size_category: "major" | "regional" | "local" | "private";
  };

  // Segmented operational data
  runways: {
    count: number;
    longest_ft: number;
    shortest_ft: number;
    surface_types: string[];
    all_lighted: boolean;
    ils_equipped: boolean;
    details: ProcessedRunwayData[];
  };

  communications: {
    has_tower: boolean;
    has_ground: boolean;
    has_approach: boolean;
    has_atis: boolean;
    frequencies_by_type: Record<string, FrequencyData[]>;
    primary_frequencies: {
      tower?: string;
      ground?: string;
      approach?: string;
      atis?: string;
    };
  };

  navigation: {
    navaids_count: number;
    has_ils: boolean;
    has_ndb: boolean;
    has_vor: boolean;
    approach_types: string[];
    navaids_by_type: Record<string, NavaidData[]>;
  };

  // Operational capabilities (derived)
  capabilities: {
    max_aircraft_category: "A" | "B" | "C" | "D" | "E" | "F";
    night_operations: boolean;
    all_weather_operations: boolean;
    international_capable: boolean;
    commercial_service: boolean;
  };

  // External references
  external_links: {
    home_url?: string;
    wikipedia_url?: string;
  };

  // Weather integration
  weather: {
    station_icao?: string;
    station_distance_km?: number;
    metar_available: boolean;
  };

  // Metadata
  data_quality: {
    completeness_score: number; // 0-100
    last_updated: string;
    source: "airportdb" | "ourairports" | "merged";
  };
}

export interface ProcessedRunwayData {
  id: string;
  airport_ref: string;
  airport_ident: string;

  // Parsed numeric values
  length_ft: number;
  width_ft: number;
  lighted: boolean;
  closed: boolean;
  surface: string;

  // Runway ends
  le_ident: string;
  le_coordinates: {
    latitude: number;
    longitude: number;
    elevation_ft?: number;
  };
  le_heading_degT: number;
  le_displaced_threshold_ft?: number;
  le_ils?: ILSData;

  he_ident: string;
  he_coordinates: {
    latitude: number;
    longitude: number;
    elevation_ft?: number;
  };
  he_heading_degT: number;
  he_displaced_threshold_ft?: number;
  he_ils?: ILSData;

  // Derived properties
  runway_designation: string; // "08L/26R"
  magnetic_heading: number;
  true_heading: number;

  // Approach capabilities
  ils_approaches: ILSData[];
  precision_approaches: boolean;

  // Suitability analysis
  suitable_for: {
    light_aircraft: boolean;
    business_jets: boolean;
    regional_aircraft: boolean;
    narrow_body: boolean;
    wide_body: boolean;
  };
}

// ============================================================================
// Cache Storage Types
// ============================================================================

export interface CachedAirportData {
  id: string;
  icao_code: string;
  iata_code?: string;
  core_data: ProcessedAirportData;
  runway_data?: ProcessedAirportData["runways"];
  communication_data?: ProcessedAirportData["communications"];
  navigation_data?: ProcessedAirportData["navigation"];
  capability_data?: ProcessedAirportData["capabilities"];
  raw_api_response?: AirportDBResponse;
  data_completeness: number;
  processing_version: string;
  created_at: string;
  updated_at: string;
  last_verified_at: string;
}

// ============================================================================
// API Client Types
// ============================================================================

export interface AirportDBClientConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface AirportDBSearchOptions {
  limit?: number;
  type?: "icao" | "iata" | "name" | "all";
  includeRunways?: boolean;
  includeFrequencies?: boolean;
  includeNavaids?: boolean;
}

export interface AirportDBBatchRequest {
  icao_codes: string[];
  include_details?: boolean;
}

export interface AirportDBBatchResponse {
  airports: AirportDBResponse[];
  errors: Array<{
    icao: string;
    error: string;
  }>;
}

// ============================================================================
// Rate Limiting Types
// ============================================================================

export interface RateLimitConfig {
  service: string;
  requests_per_minute: number;
  requests_per_hour: number;
  requests_per_day: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reset_time: Date;
  retry_after?: number;
}

export interface UsageStats {
  service: string;
  current_minute: number;
  current_hour: number;
  current_day: number;
  limits: RateLimitConfig;
  next_reset: Date;
}

// ============================================================================
// Error Types
// ============================================================================

export interface AirportDBError {
  code:
    | "API_ERROR"
    | "RATE_LIMIT"
    | "NOT_FOUND"
    | "INVALID_REQUEST"
    | "NETWORK_ERROR";
  message: string;
  details?: any;
  retry_after?: number;
}

export class AirportDBException extends Error {
  public readonly code: AirportDBError["code"];
  public readonly details?: any;
  public readonly retry_after?: number;

  constructor(error: AirportDBError) {
    super(error.message);
    this.name = "AirportDBException";
    this.code = error.code;
    this.details = error.details;
    this.retry_after = error.retry_after;
  }
}

// ============================================================================
// Service Interface Types
// ============================================================================

export interface AirportDBClient {
  // Single airport lookup by ICAO
  getAirportByIcao(
    icao: string,
    options?: AirportDBSearchOptions
  ): Promise<AirportDBResponse>;

  // Search airports by query
  searchAirports(
    query: string,
    options?: AirportDBSearchOptions
  ): Promise<AirportDBResponse[]>;

  // Batch lookup for multiple airports
  getAirportsBatch(
    request: AirportDBBatchRequest
  ): Promise<AirportDBBatchResponse>;

  // Health check
  checkHealth(): Promise<boolean>;
}

export interface AirportCacheService {
  // Get cached airport data
  getCachedAirport(icao: string): Promise<CachedAirportData | null>;

  // Store airport data in cache
  setCachedAirport(
    icao: string,
    data: ProcessedAirportData,
    rawResponse?: AirportDBResponse
  ): Promise<void>;

  // Batch operations
  getCachedAirportsBatch(icaoCodes: string[]): Promise<CachedAirportData[]>;
  setCachedAirportsBatch(airports: ProcessedAirportData[]): Promise<void>;

  // Cache management
  invalidateAirport(icao: string): Promise<void>;
  cleanExpiredCache(): Promise<number>;
  getStats(): Promise<{
    total_airports: number;
    avg_completeness: number;
    last_updated: string;
  }>;
}

export interface RateLimitService {
  // Check if request is allowed
  checkRateLimit(service: string): Promise<RateLimitResult>;

  // Record API usage
  recordRequest(service: string): Promise<void>;

  // Get current usage stats
  getUsageStats(service: string): Promise<UsageStats>;

  // Reset rate limit window
  resetWindow(service: string): Promise<void>;
}

// ============================================================================
// Data Processing Types
// ============================================================================

export interface AirportDataProcessor {
  // Transform raw API response into segmented structure
  processAirportData(apiResponse: AirportDBResponse): ProcessedAirportData;

  // Extract operational capabilities from runway data
  deriveCapabilities(
    runways: RunwayData[]
  ): ProcessedAirportData["capabilities"];

  // Organize communication frequencies by type
  organizeCommunications(
    frequencies: FrequencyData[]
  ): ProcessedAirportData["communications"];

  // Calculate data completeness score
  calculateCompleteness(data: AirportDBResponse): number;

  // Parse numeric fields from string values
  parseNumericFields(data: AirportDBResponse): void;
}

// ============================================================================
// Constants and Enums
// ============================================================================

export const AIRPORTDB_ENDPOINTS = {
  AIRPORT_BY_ICAO: "/airport/{icao}",
  SEARCH: "/airport/search",
  BATCH: "/airport/batch",
  HEALTH: "/health",
} as const;

export const RUNWAY_SURFACE_TYPES = {
  ASP: "Asphalt",
  CON: "Concrete",
  GRS: "Grass",
  GRV: "Gravel",
  DIRT: "Dirt",
  SAND: "Sand",
  WATER: "Water",
} as const;

export const FREQUENCY_TYPES = {
  TWR: "Tower",
  GND: "Ground",
  APP: "Approach",
  DEP: "Departure",
  ATIS: "ATIS",
  CLD: "Clearance Delivery",
  Dir: "Director",
  RDO: "Radio",
  RMP: "Ramp",
  CTAF: "CTAF",
} as const;

export const NAVAID_TYPES = {
  VOR: "VOR",
  NDB: "NDB",
  DME: "DME",
  TACAN: "TACAN",
  VORTAC: "VORTAC",
  ILS: "ILS",
  LOC: "Localizer",
  GS: "Glideslope",
} as const;

export const AIRCRAFT_CATEGORIES = {
  A: {
    name: "Category A",
    approach_speed: "< 91 kts",
    typical: "Light aircraft",
  },
  B: {
    name: "Category B",
    approach_speed: "91-120 kts",
    typical: "Small turboprops",
  },
  C: {
    name: "Category C",
    approach_speed: "121-140 kts",
    typical: "Regional jets",
  },
  D: {
    name: "Category D",
    approach_speed: "141-165 kts",
    typical: "Large jets",
  },
  E: {
    name: "Category E",
    approach_speed: "> 165 kts",
    typical: "High-speed aircraft",
  },
  F: {
    name: "Category F",
    approach_speed: "Variable",
    typical: "Military/Special",
  },
} as const;

// Default rate limits for AirportDB.io (adjust based on actual API limits)
export const DEFAULT_RATE_LIMITS: RateLimitConfig = {
  service: "airportdb",
  requests_per_minute: 60,
  requests_per_hour: 1000,
  requests_per_day: 10000,
};
