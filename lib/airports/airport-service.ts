// Comprehensive Airport Service with Cache-First Strategy
// Integrates cache service, rate limiting, and API client
// Provides unified interface for all airport data operations

import {
  AirportCacheService,
  getServerCacheService,
  type CacheResult,
  type BatchCacheResult,
} from "./cache-service";
import { withRateLimit, getRateLimiter } from "./rate-limit-service";
import { AirportDBClient } from "./airportdb-client";
import type {
  ProcessedAirportData,
  AirportDBResponse,
} from "@/types/airportdb";

export interface AirportServiceOptions {
  useCache?: boolean;
  enableRateLimit?: boolean;
  fallbackToCache?: boolean;
  maxRetries?: number;
}

export interface AirportLookupResult {
  data: ProcessedAirportData | null;
  source: "cache" | "api" | "fallback";
  cached: boolean;
  timestamp: string;
  rateLimited: boolean;
}

export interface BatchAirportLookupResult {
  airports: ProcessedAirportData[];
  sources: Record<string, "cache" | "api" | "fallback">;
  errors: Array<{ icao: string; error: string }>;
  rateLimited: boolean;
  fromCache: number;
  fromApi: number;
}

/**
 * Comprehensive Airport Service
 * Implements cache-first lookup strategy with rate limiting and fallback
 */
export class AirportService {
  private cacheService: AirportCacheService;
  private apiClient: AirportDBClient;
  private options: Required<AirportServiceOptions>;

  constructor(options: AirportServiceOptions = {}) {
    this.options = {
      useCache: options.useCache ?? true,
      enableRateLimit: options.enableRateLimit ?? true,
      fallbackToCache: options.fallbackToCache ?? true,
      maxRetries: options.maxRetries ?? 3,
    };

    this.cacheService = getServerCacheService();
    this.apiClient = new AirportDBClient();
  }

  /**
   * Get airport data with cache-first strategy
   * 1. Check cache first
   * 2. If not cached, fetch from API (with rate limiting)
   * 3. Cache the result for future use
   */
  async getAirport(icao: string): Promise<AirportLookupResult> {
    const normalizedIcao = icao.toUpperCase().trim();

    try {
      // Step 1: Check cache first
      if (this.options.useCache) {
        const cacheResult =
          await this.cacheService.getCachedAirport(normalizedIcao);

        if (cacheResult.data) {
          return {
            data: cacheResult.data,
            source: "cache",
            cached: true,
            timestamp: cacheResult.timestamp,
            rateLimited: false,
          };
        }
      }

      // Step 2: Fetch from API with rate limiting
      let apiData: AirportDBResponse;
      let rateLimited = false;

      if (this.options.enableRateLimit) {
        try {
          apiData = await withRateLimit("airportdb", async () => {
            return await this.apiClient.getAirportByIcao(normalizedIcao);
          });
        } catch (error) {
          if (
            error instanceof Error &&
            error.message.includes("Rate limit exceeded")
          ) {
            rateLimited = true;

            // If rate limited and fallback enabled, try cache again
            if (this.options.fallbackToCache) {
              const fallbackResult =
                await this.cacheService.getCachedAirport(normalizedIcao);
              if (fallbackResult.data) {
                return {
                  data: fallbackResult.data,
                  source: "fallback",
                  cached: true,
                  timestamp: fallbackResult.timestamp,
                  rateLimited: true,
                };
              }
            }

            throw error;
          }
          throw error;
        }
      } else {
        apiData = await this.apiClient.getAirportByIcao(normalizedIcao);
      }

      // Step 3: Cache the result
      if (this.options.useCache) {
        try {
          await this.cacheService.setCachedAirport(normalizedIcao, apiData);
        } catch (cacheError) {
          console.warn(
            `Failed to cache airport ${normalizedIcao}:`,
            cacheError
          );
          // Don't fail the request if caching fails
        }
      }

      // Convert to ProcessedAirportData (this is done in setCachedAirport, but we need it here too)
      const { processAirportData } = await import("./airport-data-processor");
      const processedData = processAirportData(apiData);

      return {
        data: processedData,
        source: "api",
        cached: false,
        timestamp: new Date().toISOString(),
        rateLimited,
      };
    } catch (error) {
      console.error(`Failed to get airport ${normalizedIcao}:`, error);

      // Final fallback to cache if enabled
      if (this.options.fallbackToCache && this.options.useCache) {
        const fallbackResult =
          await this.cacheService.getCachedAirport(normalizedIcao);
        if (fallbackResult.data) {
          return {
            data: fallbackResult.data,
            source: "fallback",
            cached: true,
            timestamp: fallbackResult.timestamp,
            rateLimited: false,
          };
        }
      }

      return {
        data: null,
        source: "api",
        cached: false,
        timestamp: new Date().toISOString(),
        rateLimited: false,
      };
    }
  }

  /**
   * Batch airport lookup with intelligent caching
   * Optimizes API calls by checking cache first and only fetching missing airports
   */
  async getAirportsBatch(
    icaoCodes: string[]
  ): Promise<BatchAirportLookupResult> {
    const normalizedIcaos = icaoCodes.map((icao) => icao.toUpperCase().trim());
    const result: BatchAirportLookupResult = {
      airports: [],
      sources: {},
      errors: [],
      rateLimited: false,
      fromCache: 0,
      fromApi: 0,
    };

    try {
      // Step 1: Batch check cache
      let missing = normalizedIcaos;

      if (this.options.useCache) {
        const cacheResult =
          await this.cacheService.getCachedAirportsBatch(normalizedIcaos);

        // Add cached airports to result
        cacheResult.cached.forEach((airport) => {
          result.airports.push(airport);
          result.sources[airport.icao] = "cache";
          result.fromCache++;
        });

        missing = cacheResult.missing;
      }

      // Step 2: Fetch missing airports from API
      if (missing.length > 0) {
        const apiResults: Array<{ icao: string; data: AirportDBResponse }> = [];

        for (const icao of missing) {
          try {
            let apiData: AirportDBResponse;

            if (this.options.enableRateLimit) {
              try {
                apiData = await withRateLimit("airportdb", async () => {
                  return await this.apiClient.getAirportByIcao(icao);
                });
              } catch (error) {
                if (
                  error instanceof Error &&
                  error.message.includes("Rate limit exceeded")
                ) {
                  result.rateLimited = true;

                  // Try fallback to cache for this specific airport
                  if (this.options.fallbackToCache) {
                    const fallbackResult =
                      await this.cacheService.getCachedAirport(icao);
                    if (fallbackResult.data) {
                      result.airports.push(fallbackResult.data);
                      result.sources[icao] = "fallback";
                      result.fromCache++;
                      continue;
                    }
                  }

                  result.errors.push({ icao, error: "Rate limit exceeded" });
                  continue;
                }
                throw error;
              }
            } else {
              apiData = await this.apiClient.getAirportByIcao(icao);
            }

            apiResults.push({ icao, data: apiData });
            result.fromApi++;
          } catch (error) {
            result.errors.push({
              icao,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        }

        // Step 3: Process and cache API results
        if (apiResults.length > 0) {
          // Cache the batch results
          if (this.options.useCache) {
            try {
              await this.cacheService.setCachedAirportsBatch(apiResults);
            } catch (cacheError) {
              console.warn("Failed to batch cache airports:", cacheError);
            }
          }

          // Process and add to results
          const { processAirportData } = await import(
            "./airport-data-processor"
          );

          apiResults.forEach(({ icao, data }) => {
            try {
              const processedData = processAirportData(data);
              result.airports.push(processedData);
              result.sources[icao] = "api";
            } catch (processError) {
              result.errors.push({
                icao,
                error: `Processing failed: ${processError instanceof Error ? processError.message : "Unknown error"}`,
              });
            }
          });
        }
      }

      return result;
    } catch (error) {
      console.error("Batch airport lookup failed:", error);

      // Final fallback - try to get whatever we can from cache
      if (this.options.fallbackToCache && this.options.useCache) {
        try {
          const fallbackResult =
            await this.cacheService.getCachedAirportsBatch(normalizedIcaos);
          fallbackResult.cached.forEach((airport) => {
            if (!result.sources[airport.icao]) {
              result.airports.push(airport);
              result.sources[airport.icao] = "fallback";
              result.fromCache++;
            }
          });
        } catch (fallbackError) {
          console.error("Fallback cache lookup failed:", fallbackError);
        }
      }

      return result;
    }
  }

  /**
   * Search airports with caching
   * Note: Search results are not cached due to variability of queries
   */
  async searchAirports(
    query: string,
    options?: { limit?: number; type?: "icao" | "iata" | "name" | "all" }
  ): Promise<ProcessedAirportData[]> {
    try {
      let searchResults: AirportDBResponse[];

      if (this.options.enableRateLimit) {
        searchResults = await withRateLimit("airportdb", async () => {
          return await this.apiClient.searchAirports(query, options);
        });
      } else {
        searchResults = await this.apiClient.searchAirports(query, options);
      }

      // Process results
      const { processAirportData } = await import("./airport-data-processor");
      const processedResults = searchResults.map((data) =>
        processAirportData(data)
      );

      // Opportunistically cache search results
      if (this.options.useCache && searchResults.length > 0) {
        try {
          const cacheData = searchResults.map((data) => ({
            icao: data.ident || data.icao_code,
            data,
          }));
          await this.cacheService.setCachedAirportsBatch(cacheData);
        } catch (cacheError) {
          console.warn("Failed to cache search results:", cacheError);
        }
      }

      return processedResults;
    } catch (error) {
      console.error("Airport search failed:", error);
      return [];
    }
  }

  /**
   * Validate airport data integrity
   */
  async validateAirport(icao: string) {
    return await this.cacheService.validateCachedAirport(icao);
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    return await this.cacheService.getCacheStats();
  }

  /**
   * Get rate limit usage statistics
   */
  async getRateLimitStats() {
    const rateLimiter = getRateLimiter("airportdb");
    return await rateLimiter.getUsageStats();
  }

  /**
   * Health check for the airport service
   */
  async healthCheck(): Promise<{
    cache: boolean;
    api: boolean;
    rateLimit: boolean;
    overall: boolean;
  }> {
    const health = {
      cache: false,
      api: false,
      rateLimit: false,
      overall: false,
    };

    try {
      // Test cache
      await this.cacheService.getCacheStats();
      health.cache = true;
    } catch (error) {
      console.error("Cache health check failed:", error);
    }

    try {
      // Test API (with a simple health check if available)
      await this.apiClient.checkHealth();
      health.api = true;
    } catch (error) {
      console.error("API health check failed:", error);
    }

    try {
      // Test rate limiting
      const rateLimiter = getRateLimiter("airportdb");
      await rateLimiter.getUsageStats();
      health.rateLimit = true;
    } catch (error) {
      console.error("Rate limit health check failed:", error);
    }

    health.overall = health.cache && health.api && health.rateLimit;
    return health;
  }

  /**
   * Force refresh airport data (bypass cache)
   */
  async refreshAirport(icao: string): Promise<AirportLookupResult> {
    const normalizedIcao = icao.toUpperCase().trim();

    try {
      // Invalidate cache first
      if (this.options.useCache) {
        await this.cacheService.invalidateAirport(normalizedIcao);
      }

      // Fetch fresh data
      return await this.getAirport(normalizedIcao);
    } catch (error) {
      console.error(`Failed to refresh airport ${normalizedIcao}:`, error);
      throw error;
    }
  }
}

// Singleton instance
let airportServiceInstance: AirportService | null = null;

/**
 * Get singleton airport service instance
 */
export function getAirportService(
  options?: AirportServiceOptions
): AirportService {
  if (!airportServiceInstance) {
    airportServiceInstance = new AirportService(options);
  }
  return airportServiceInstance;
}

// (types are exported via their interface declarations above)
