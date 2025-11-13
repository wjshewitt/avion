// Airport Cache Service with Supabase Integration
// Implements cache-first lookup strategy with permanent storage
// Provides batch operations and data integrity validation

import { createServerSupabase } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/client";
import type { AirportCache, Database } from "@/lib/supabase/types";
import type {
  ProcessedAirportData,
  AirportDBResponse,
} from "@/types/airportdb";
import { processAirportData } from "./airport-data-processor";

export interface CacheServiceOptions {
  useServerClient?: boolean;
  enableBatching?: boolean;
  maxBatchSize?: number;
}

export interface CacheResult<T> {
  data: T | null;
  cached: boolean;
  timestamp: string;
  source: "cache" | "api";
}

export interface BatchCacheResult {
  cached: ProcessedAirportData[];
  missing: string[];
  errors: Array<{ icao: string; error: string }>;
}

export interface CacheValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  completeness: number;
}

/**
 * Airport Cache Service Implementation
 * Provides permanent caching of airport data with cache-first lookup strategy
 */
export class AirportCacheService {
  private options: Required<CacheServiceOptions>;
  private useInMemoryOnly = false;

  private static inMemoryCache = new Map<string, AirportCache>();
  private static fallbackLogged = false;

  constructor(options: CacheServiceOptions = {}) {
    this.options = {
      useServerClient: options.useServerClient ?? true,
      enableBatching: options.enableBatching ?? true,
      maxBatchSize: options.maxBatchSize ?? 50,
    };
  }

  private enableMemoryFallback(reason: unknown) {
    if (!this.useInMemoryOnly) {
      this.useInMemoryOnly = true;
      if (!AirportCacheService.fallbackLogged) {
        console.warn(
          "AirportCacheService falling back to in-memory cache storage.",
          reason instanceof Error ? reason.message : reason
        );
        AirportCacheService.fallbackLogged = true;
      }
    }
  }

  private getMemoryCacheResult(
    icao: string
  ): CacheResult<ProcessedAirportData> {
    const entry = AirportCacheService.inMemoryCache.get(icao);
    if (!entry) {
      return {
        data: null,
        cached: false,
        timestamp: new Date().toISOString(),
        source: "cache",
      };
    }

    return {
      data: this.convertCacheToProcessedData(entry),
      cached: true,
      timestamp: entry.updated_at,
      source: "cache",
    };
  }

  private convertCacheToProcessedData(
    entry: AirportCache
  ): ProcessedAirportData {
    return deserializeCacheEntry(entry);
  }

  private upsertMemoryEntry(entry: AirportCache): void {
    const existing = AirportCacheService.inMemoryCache.get(entry.icao_code);
    const createdAt = existing?.created_at || entry.created_at;
    AirportCacheService.inMemoryCache.set(entry.icao_code, {
      ...entry,
      created_at: createdAt,
    });
  }

  private removeMemoryEntry(icao: string): void {
    AirportCacheService.inMemoryCache.delete(icao);
  }

  private getMemoryStats() {
    const entries = Array.from(AirportCacheService.inMemoryCache.values());
    if (entries.length === 0) {
      return {
        total_airports: 0,
        total: 0,
        avg_completeness: 0,
        last_updated: new Date().toISOString(),
        storage_size_mb: 0,
      };
    }

    const totalAirports = entries.length;
    const avgCompleteness =
      entries.reduce((sum, entry) => sum + entry.data_completeness, 0) /
      totalAirports;
    const lastUpdated = entries
      .map((entry) => entry.updated_at)
      .sort()
      .at(-1) as string;

    const estimatedSizeMb = totalAirports * 0.05;

    return {
      total_airports: totalAirports,
      total: totalAirports,
      avg_completeness: Math.round(avgCompleteness),
      last_updated: lastUpdated,
      storage_size_mb: Math.round(estimatedSizeMb * 100) / 100,
    };
  }

  private cleanMemoryCache(): number {
    let removed = 0;
    const entries = Array.from(AirportCacheService.inMemoryCache.entries());
    for (const [icao, entry] of entries) {
      if (entry.data_completeness < 10) {
        AirportCacheService.inMemoryCache.delete(icao);
        removed++;
      }
    }
    return removed;
  }

  /**
   * Get Supabase client based on configuration
   */
  private async getSupabaseClient() {
    if (this.useInMemoryOnly) {
      throw new Error(
        "Supabase client disabled: AirportCacheService is using in-memory fallback"
      );
    }

    if (this.options.useServerClient) {
      return await createServerSupabase();
    }
    return createClient();
  }

  /**
   * Get cached airport data by ICAO code
   * Returns null if not found in cache
   */
  async getCachedAirport(
    icao: string
  ): Promise<CacheResult<ProcessedAirportData>> {
    const normalizedIcao = icao.toUpperCase().trim();

    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from("airport_cache")
        .select("*")
        .eq("icao_code", normalizedIcao)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No rows returned - not an error, just cache miss
          return {
            data: null,
            cached: false,
            timestamp: new Date().toISOString(),
            source: "cache",
          };
        }
        throw error;
      }

      // Explicitly type as AirportCache for legacy table
      const cachedEntry = data as AirportCache;

      // Convert cached data back to ProcessedAirportData format
      const processedData = deserializeCacheEntry(cachedEntry);

      this.upsertMemoryEntry(cachedEntry);

      return {
        data: processedData,
        cached: true,
        timestamp: cachedEntry.updated_at,
        source: "cache",
      };
    } catch (error) {
      console.error(`Failed to get cached airport ${icao}:`, error);
      this.enableMemoryFallback(error);
      return this.getMemoryCacheResult(normalizedIcao);
    }
  }

  /**
   * Store airport data in cache permanently
   * Processes raw API response and stores segmented data
   */
  async setCachedAirport(
    icao: string,
    apiResponse: AirportDBResponse,
    ttl?: number // Ignored - we cache permanently
  ): Promise<void> {
    try {
      const supabase = await this.getSupabaseClient();
      const normalizedIcao = icao.toUpperCase().trim();

      // Process the raw API response
      const processedData = processAirportData(apiResponse);

      // Convert to cache format
      const cacheData = serializeProcessedAirport(
        processedData,
        apiResponse
      );

      // Prepare the cache entry payload
      const cacheEntry: Database["public"]["Tables"]["airport_cache"]["Insert"] = {
        icao_code: normalizedIcao,
        iata_code: processedData.iata || null,
        core_data: cacheData.core_data,
        runway_data: cacheData.runway_data,
        communication_data: cacheData.communication_data,
        navigation_data: cacheData.navigation_data,
        capability_data: cacheData.capability_data,
        raw_api_response: cacheData.raw_api_response,
        data_completeness: processedData.data_quality.completeness_score,
        processing_version: "1.0",
        last_verified_at: new Date().toISOString(),
      };

      const timestamp = cacheEntry.last_verified_at;
      const previousEntry = AirportCacheService.inMemoryCache.get(
        normalizedIcao
      );
      const memoryEntry: AirportCache = {
        id: previousEntry?.id ?? normalizedIcao,
        icao_code: normalizedIcao,
        iata_code: processedData.iata || null,
        core_data: cacheData.core_data,
        runway_data: cacheData.runway_data,
        communication_data: cacheData.communication_data,
        navigation_data: cacheData.navigation_data,
        capability_data: cacheData.capability_data,
        raw_api_response: cacheData.raw_api_response,
        data_completeness: processedData.data_quality.completeness_score,
        processing_version: "1.0",
        created_at: previousEntry?.created_at || timestamp,
        updated_at: timestamp,
        last_verified_at: timestamp,
      };

      // Upsert the data (insert or update if exists)
      const { error } = await supabase.from("airport_cache").upsert(
        cacheEntry as any,
        {
          onConflict: "icao_code",
        }
      );

      if (error) {
        throw error;
      }

      console.log(`Successfully cached airport data for ${normalizedIcao}`);
      this.upsertMemoryEntry(memoryEntry);
    } catch (error) {
      console.error(`Failed to cache airport ${icao}:`, error);
      const normalizedIcao = icao.toUpperCase().trim();

      try {
        const processedData = processAirportData(apiResponse);
        const cacheData = serializeProcessedAirport(
          processedData,
          apiResponse
        );
        const timestamp = new Date().toISOString();
        const previousEntry = AirportCacheService.inMemoryCache.get(
          normalizedIcao
        );
        const memoryEntry: AirportCache = {
          id: previousEntry?.id ?? normalizedIcao,
          icao_code: normalizedIcao,
          iata_code: processedData.iata || null,
          core_data: cacheData.core_data,
          runway_data: cacheData.runway_data,
          communication_data: cacheData.communication_data,
          navigation_data: cacheData.navigation_data,
          capability_data: cacheData.capability_data,
          raw_api_response: cacheData.raw_api_response,
          data_completeness: processedData.data_quality.completeness_score,
          processing_version: "1.0",
          created_at: previousEntry?.created_at || timestamp,
          updated_at: timestamp,
          last_verified_at: timestamp,
        };
        this.upsertMemoryEntry(memoryEntry);
        this.enableMemoryFallback(error);
      } catch (fallbackError) {
        console.error(
          `Failed to cache airport ${icao} in fallback store:`,
          fallbackError
        );
        throw error;
      }
    }
  }

  /**
   * Batch lookup for multiple airports
   * Returns cached data and list of missing airports
   */
  async getCachedAirportsBatch(icaoCodes: string[]): Promise<BatchCacheResult> {
    if (!this.options.enableBatching) {
      throw new Error("Batching is disabled");
    }

    if (icaoCodes.length > this.options.maxBatchSize) {
      throw new Error(
        `Batch size ${icaoCodes.length} exceeds maximum ${this.options.maxBatchSize}`
      );
    }

    const normalizedIcaos = icaoCodes.map((icao) => icao.toUpperCase().trim());

    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from("airport_cache")
        .select("*")
        .in("icao_code", normalizedIcaos);

      if (error) {
        throw error;
      }

      // Explicitly type as AirportCache[] for legacy table
      const cacheEntries = data as AirportCache[];

      // Convert cached data to ProcessedAirportData format
      const cached = cacheEntries.map((cacheEntry) =>
        deserializeCacheEntry(cacheEntry)
      );

      cacheEntries.forEach((entry) => this.upsertMemoryEntry(entry));

      // Find missing airports
      const cachedIcaos = new Set(cacheEntries.map((entry) => entry.icao_code));
      const missing = normalizedIcaos.filter((icao) => !cachedIcaos.has(icao));

      return {
        cached,
        missing,
        errors: [],
      };
    } catch (error) {
      console.error("Failed to batch lookup cached airports:", error);
      this.enableMemoryFallback(error);

      const cached: ProcessedAirportData[] = [];
      const missing: string[] = [];

      for (const code of normalizedIcaos) {
        const entry = AirportCacheService.inMemoryCache.get(code);
        if (entry) {
          cached.push(deserializeCacheEntry(entry));
        } else {
          missing.push(code);
        }
      }

      return {
        cached,
        missing,
        errors: [],
      };
    }
  }

  /**
   * Batch store multiple airports
   * Processes and stores multiple airport API responses
   */
  async setCachedAirportsBatch(
    airports: Array<{ icao: string; data: AirportDBResponse }>
  ): Promise<void> {
    if (!this.options.enableBatching) {
      throw new Error("Batching is disabled");
    }

    if (airports.length > this.options.maxBatchSize) {
      throw new Error(
        `Batch size ${airports.length} exceeds maximum ${this.options.maxBatchSize}`
      );
    }

    try {
      const supabase = await this.getSupabaseClient();
      const timestamp = new Date().toISOString();

      // Process all airports and convert to cache format
      const cacheEntries: Database["public"]["Tables"]["airport_cache"]["Insert"][] = [];
      const memoryEntries: AirportCache[] = [];

      for (const { icao, data } of airports) {
        const normalizedIcao = icao.toUpperCase().trim();
        const processedData = processAirportData(data);
        const cacheData = serializeProcessedAirport(processedData, data);
        const previousEntry = AirportCacheService.inMemoryCache.get(
          normalizedIcao
        );

        cacheEntries.push({
          icao_code: normalizedIcao,
          iata_code: processedData.iata || null,
          core_data: cacheData.core_data,
          runway_data: cacheData.runway_data,
          communication_data: cacheData.communication_data,
          navigation_data: cacheData.navigation_data,
          capability_data: cacheData.capability_data,
          raw_api_response: cacheData.raw_api_response,
          data_completeness: processedData.data_quality.completeness_score,
          processing_version: "1.0",
          last_verified_at: timestamp,
        });

        memoryEntries.push({
          id: previousEntry?.id ?? normalizedIcao,
          icao_code: normalizedIcao,
          iata_code: processedData.iata || null,
          core_data: cacheData.core_data,
          runway_data: cacheData.runway_data,
          communication_data: cacheData.communication_data,
          navigation_data: cacheData.navigation_data,
          capability_data: cacheData.capability_data,
          raw_api_response: cacheData.raw_api_response,
          data_completeness: processedData.data_quality.completeness_score,
          processing_version: "1.0",
          created_at: previousEntry?.created_at || timestamp,
          updated_at: timestamp,
          last_verified_at: timestamp,
        });
      }

      // Batch upsert
      const { error } = await supabase
        .from("airport_cache")
        .upsert(cacheEntries as any, {
          onConflict: "icao_code",
        });

      if (error) {
        throw error;
      }

      console.log(`Successfully batch cached ${airports.length} airports`);
      memoryEntries.forEach((entry) => this.upsertMemoryEntry(entry));
    } catch (error) {
      console.error("Failed to batch cache airports:", error);
      this.enableMemoryFallback(error);

      try {
        for (const { icao, data } of airports) {
          const normalizedIcao = icao.toUpperCase().trim();
          const processedData = processAirportData(data);
          const cacheData = serializeProcessedAirport(processedData, data);
          const previousEntry = AirportCacheService.inMemoryCache.get(
            normalizedIcao
          );
          const timestamp = new Date().toISOString();
          const memoryEntry: AirportCache = {
            id: previousEntry?.id ?? normalizedIcao,
            icao_code: normalizedIcao,
            iata_code: processedData.iata || null,
            core_data: cacheData.core_data,
            runway_data: cacheData.runway_data,
            communication_data: cacheData.communication_data,
            navigation_data: cacheData.navigation_data,
            capability_data: cacheData.capability_data,
            raw_api_response: cacheData.raw_api_response,
            data_completeness: processedData.data_quality.completeness_score,
            processing_version: "1.0",
            created_at: previousEntry?.created_at || timestamp,
            updated_at: timestamp,
            last_verified_at: timestamp,
          };
          this.upsertMemoryEntry(memoryEntry);
        }
      } catch (fallbackError) {
        console.error(
          "Failed to cache airports in fallback store:",
          fallbackError
        );
        throw error;
      }
    }
  }

  /**
   * Validate cached airport data integrity
   * Checks data structure and completeness
   */
  async validateCachedAirport(icao: string): Promise<CacheValidationResult> {
    try {
      const result = await this.getCachedAirport(icao);

      if (!result.data) {
        return {
          valid: false,
          errors: ["Airport not found in cache"],
          warnings: [],
          completeness: 0,
        };
      }

      const errors: string[] = [];
      const warnings: string[] = [];
      const data = result.data;

      // Validate core data
      if (!data.icao) errors.push("Missing ICAO code");
      if (!data.name) errors.push("Missing airport name");
      if (!data.coordinates.latitude || !data.coordinates.longitude) {
        errors.push("Missing coordinates");
      }

      // Validate data structure
      if (!data.runways) warnings.push("Missing runway data");
      if (!data.communications) warnings.push("Missing communication data");
      if (!data.navigation) warnings.push("Missing navigation data");

      // Check data completeness
      const completeness = data.data_quality?.completeness_score || 0;
      if (completeness < 50) {
        warnings.push(`Low data completeness: ${completeness}%`);
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
        completeness,
      };
    } catch (error) {
      return {
        valid: false,
        errors: [
          `Validation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        ],
        warnings: [],
        completeness: 0,
      };
    }
  }

  /**
   * Invalidate cached airport data
   * Removes airport from cache (rarely needed due to permanent caching strategy)
   */
  async invalidateAirport(icao: string): Promise<void> {
    try {
      const supabase = await this.getSupabaseClient();
      const normalizedIcao = icao.toUpperCase().trim();

      const { error } = await supabase
        .from("airport_cache")
        .delete()
        .eq("icao_code", normalizedIcao);

      if (error) {
        throw error;
      }

      console.log(
        `Successfully invalidated cache for airport ${normalizedIcao}`
      );
      this.removeMemoryEntry(normalizedIcao);
    } catch (error) {
      console.error(`Failed to invalidate airport ${icao}:`, error);
      const normalizedIcao = icao.toUpperCase().trim();
      this.enableMemoryFallback(error);
      this.removeMemoryEntry(normalizedIcao);
    }
  }

  /**
   * Clean expired cache entries
   * Since we use permanent caching, this mainly removes corrupted entries
   */
  async cleanExpiredCache(): Promise<number> {
    try {
      const supabase = await this.getSupabaseClient();

      // Remove entries with invalid data (completeness < 10%)
      const { data, error } = await supabase
        .from("airport_cache")
        .delete()
        .lt("data_completeness", 10)
        .select("icao_code");

      if (error) {
        throw error;
      }

      const cleanedCount = data?.length || 0;
      if (cleanedCount > 0) {
        console.log(`Cleaned ${cleanedCount} corrupted cache entries`);
        for (const row of data as Array<{ icao_code: string }>) {
          if (row?.icao_code) {
            this.removeMemoryEntry(row.icao_code);
          }
        }
      }

      return cleanedCount;
    } catch (error) {
      console.error("Failed to clean expired cache:", error);
      this.enableMemoryFallback(error);
      return this.cleanMemoryCache();
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    total_airports: number;
    avg_completeness: number;
    last_updated: string;
    storage_size_mb: number;
  }> {
    try {
      const supabase = await this.getSupabaseClient();

      const { data, error } = await supabase
        .from("airport_cache")
        .select("data_completeness, updated_at")
        .order("updated_at", { ascending: false });

      if (error) {
        throw error;
      }

      // Explicitly type for legacy table
      const cacheStats = data as Pick<AirportCache, "data_completeness" | "updated_at">[];

      const totalAirports = cacheStats.length;
      const avgCompleteness =
        totalAirports > 0
          ? cacheStats.reduce((sum, entry) => sum + entry.data_completeness, 0) /
            totalAirports
          : 0;
      const lastUpdated = cacheStats[0]?.updated_at || new Date().toISOString();

      // Rough estimate of storage size (actual size would require database-specific queries)
      const estimatedSizeMb = totalAirports * 0.05; // ~50KB per airport estimate

      return {
        total_airports: totalAirports,
        avg_completeness: Math.round(avgCompleteness),
        last_updated: lastUpdated,
        storage_size_mb: Math.round(estimatedSizeMb * 100) / 100,
      };
    } catch (error) {
      console.error("Failed to get cache stats:", error);
      this.enableMemoryFallback(error);
      return this.getMemoryStats();
    }
  }

}

export function serializeProcessedAirport(
  processedData: ProcessedAirportData,
  rawResponse?: AirportDBResponse | null
): Omit<
  AirportCache,
  | "id"
  | "icao_code"
  | "iata_code"
  | "created_at"
  | "updated_at"
  | "data_completeness"
  | "processing_version"
  | "last_verified_at"
> {
  return {
    core_data: {
      icao: processedData.icao,
      iata: processedData.iata,
      name: processedData.name,
      coordinates: processedData.coordinates,
      location: processedData.location,
      classification: processedData.classification,
      external_links: processedData.external_links,
      weather: processedData.weather,
      data_source: processedData.data_quality.source,
    },
    runway_data: processedData.runways,
    communication_data: processedData.communications,
    navigation_data: processedData.navigation,
    capability_data: processedData.capabilities,
    raw_api_response: rawResponse ?? null,
  };
}

export function deserializeCacheEntry(
  cacheEntry: AirportCache
): ProcessedAirportData {
  const coreData = cacheEntry.core_data as any;

  return {
    icao: cacheEntry.icao_code,
    iata: cacheEntry.iata_code || undefined,
    name: coreData.name,
    coordinates: coreData.coordinates,
    location: coreData.location,
    classification: coreData.classification,
    runways: cacheEntry.runway_data as any,
    communications: cacheEntry.communication_data as any,
    navigation: cacheEntry.navigation_data as any,
    capabilities: cacheEntry.capability_data as any,
    external_links: coreData.external_links,
    weather: coreData.weather,
    data_quality: {
      completeness_score: cacheEntry.data_completeness,
      last_updated: cacheEntry.updated_at,
      source:
        (coreData?.data_source as ProcessedAirportData["data_quality"]["source"]) ||
        "airportdb",
    },
  };
}

// Singleton instance for server-side usage
let serverCacheService: AirportCacheService | null = null;

/**
 * Get server-side cache service instance
 */
export function getServerCacheService(): AirportCacheService {
  if (!serverCacheService) {
    serverCacheService = new AirportCacheService({ useServerClient: true });
  }
  return serverCacheService;
}

/**
 * Get client-side cache service instance
 */
export function getClientCacheService(): AirportCacheService {
  return new AirportCacheService({ useServerClient: false });
}
