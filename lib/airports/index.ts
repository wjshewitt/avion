// Airport Processing Library - Main Export Index
// Provides unified access to all airport data processing functionality

// Core data processor
export {
  AirportDataProcessorImpl,
  getAirportDataProcessor,
  processAirportData,
  calculateAirportDataCompleteness,
  deriveAirportCapabilities,
  organizeCommunicationFrequencies,
} from "./airport-data-processor";

// Numeric field parsing utilities
export {
  parseNumber,
  parseOptionalNumber,
  parseInteger,
  parseBoolean,
  parseCoordinate,
  parseElevation,
  parseFrequency,
  parseRunwayLength,
  parseRunwayWidth,
  parseHeading,
  parseMagneticVariation,
  parseDistance,
  parseAirportNumericFields,
} from "./numeric-parser";

// Runway analysis engine
export { getRunwayAnalyzer, analyzeRunways } from "./runway-analyzer";

// Communication frequency organizer
export {
  getFrequencyOrganizer,
  organizeFrequencies,
} from "./frequency-organizer";

// Navigation aid categorizer
export { getNavaidCategorizer, categorizeNavaids } from "./navaid-categorizer";

// Client exports
export {
  AirportDBClientImpl,
  getAirportDBClient,
  resetAirportDBClient,
  isAirportDBAvailable,
  validateIcaoFormat,
  normalizeIcao,
} from "./airportdb-client";

// Validation exports
export {
  validateAirportResponse,
  validateBatchResponse,
  validateSearchResponse,
  safeParseNumber,
  safeParseInteger,
  parseStringBoolean,
  convertRunwayData,
  convertFrequencyData,
  convertNavaidData,
  convertAirportData,
  calculateDataCompleteness,
  assessDataQuality,
  AirportDBResponseSchema,
  AirportDBBatchResponseSchema,
  AirportDBSearchResponseSchema,
} from "./validation";

// Cache service exports
export {
  AirportCacheService,
  getServerCacheService,
  getClientCacheService,
} from "./cache-service";

// Store/compatibility layer exports
export {
  getAirportByIcao as getAirportDetailByIcao,
  getAirportByIata as getAirportDetailByIata,
  getAirportCore,
  getAirportsByIcaos as getAirportDetailsByIcaos,
  searchAirports as searchAirportCores,
  searchAirportDetails,
  airportExists,
} from "./store";

export type { AirportCore, AirportDetail } from "./store";

// Database-backed search helpers
export {
  searchAirports as searchAirportsFromDatabase,
  getAirportByIcao,
  getAirportByIata,
  getAirportsByIcaos,
} from "./search-database";

// Conversion helpers
export { convertToIcao } from "./conversion";

// Rate limiting service exports
export {
  RateLimitService,
  rateLimiters,
  getRateLimiter,
  withRateLimit,
} from "./rate-limit-service";

// Comprehensive airport service exports
export { AirportService, getAirportService } from "./airport-service";

// Re-export types for convenience
export type {
  AirportDBResponse,
  AirportDBClientConfig,
  AirportDBSearchOptions,
  AirportDBBatchRequest,
  AirportDBBatchResponse,
  AirportDBException,
  AirportDBClient,
  ProcessedAirportData,
  CachedAirportData,
  RunwayData,
  FrequencyData,
  NavaidData,
  CountryData,
  RegionData,
  WeatherStationData,
  ILSData,
} from "@/types/airportdb";

// Cache service types
export type {
  CacheServiceOptions,
  CacheResult,
  BatchCacheResult,
  CacheValidationResult,
} from "./cache-service";

// Rate limiting types
export type {
  RateLimitResult,
  UsageStats,
  RateLimitConfig,
} from "./rate-limit-service";

// Airport service types
export type {
  AirportServiceOptions,
  AirportLookupResult,
  BatchAirportLookupResult,
} from "./airport-service";
