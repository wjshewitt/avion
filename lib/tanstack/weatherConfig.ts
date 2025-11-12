/**
 * Weather-specific TanStack Query configuration
 * Defines cache strategies and query options optimized for weather data
 */

import type { UseQueryOptions } from "@tanstack/react-query";
import type { DecodedMetar, DecodedTaf, StationData } from "@/types/checkwx";

// ============================================================================
// Cache Duration Constants
// ============================================================================

/**
 * Cache durations for different types of weather data
 * Based on update frequency and data volatility
 */
export const WEATHER_CACHE_CONFIG = {
  // METAR data - current weather conditions (updates every 30-60 minutes)
  METAR: {
    staleTime: 10 * 60 * 1000, // 10 minutes - consider stale after 10 min
    gcTime: 15 * 60 * 1000, // 15 minutes - garbage collect after 15 min
    refetchInterval: false, // No automatic polling - use manual refresh
    refetchOnWindowFocus: true, // Refetch when user returns to app
    refetchOnReconnect: true, // Refetch when network reconnects
  },

  // TAF data - terminal forecasts (updates every 6 hours, valid for 24-30 hours)
  TAF: {
    staleTime: 10 * 60 * 1000, // 10 minutes - same as METAR for consistency
    gcTime: 15 * 60 * 1000, // 15 minutes - garbage collect after 15 min
    refetchInterval: false, // No automatic polling
    refetchOnWindowFocus: true, // Refetch when user returns to app
    refetchOnReconnect: true, // Refetch when network reconnects
  },

  // Station data - airport information (static data, rarely changes)
  STATION: {
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - static data
    gcTime: 24 * 60 * 60 * 1000, // 24 hours - keep in cache for full day
    refetchInterval: false, // Never auto-refresh static data
    refetchOnWindowFocus: false, // Don't refetch on focus - data is static
    refetchOnReconnect: false, // Don't refetch on reconnect - data is static
  },

  // Area weather searches - METAR data within radius
  AREA_WEATHER: {
    staleTime: 10 * 60 * 1000, // 10 minutes - same as METAR
    gcTime: 15 * 60 * 1000, // 15 minutes - garbage collect after 15 min
    refetchInterval: false, // No automatic polling
    refetchOnWindowFocus: true, // Refetch when user returns to app
    refetchOnReconnect: true, // Refetch when network reconnects
  },
} as const;

// ============================================================================
// Query Option Factories
// ============================================================================

/**
 * Creates optimized query options for METAR data
 */
export function createMetarQueryOptions<T = DecodedMetar[]>(
  overrides?: Partial<UseQueryOptions<T, Error>>
): Partial<UseQueryOptions<T, Error>> {
  return {
    ...WEATHER_CACHE_CONFIG.METAR,
    retry: (failureCount, error) => {
      // Don't retry on client errors (4xx)
      if (
        error instanceof Error &&
        (error.message.includes("404") ||
          error.message.includes("400") ||
          error.message.includes("401"))
      ) {
        return false;
      }
      // Retry network errors up to 2 times
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    ...overrides,
  };
}

/**
 * Creates optimized query options for TAF data
 */
export function createTafQueryOptions<T = DecodedTaf[]>(
  overrides?: Partial<UseQueryOptions<T, Error>>
): Partial<UseQueryOptions<T, Error>> {
  return {
    ...WEATHER_CACHE_CONFIG.TAF,
    retry: (failureCount, error) => {
      // Don't retry on client errors (4xx)
      if (
        error instanceof Error &&
        (error.message.includes("404") ||
          error.message.includes("400") ||
          error.message.includes("401"))
      ) {
        return false;
      }
      // Retry network errors up to 2 times
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    ...overrides,
  };
}

/**
 * Creates optimized query options for station data
 */
export function createStationQueryOptions<T = StationData[]>(
  overrides?: Partial<UseQueryOptions<T, Error>>
): Partial<UseQueryOptions<T, Error>> {
  return {
    ...WEATHER_CACHE_CONFIG.STATION,
    retry: (failureCount, error) => {
      // Don't retry on client errors (4xx)
      if (
        error instanceof Error &&
        (error.message.includes("404") ||
          error.message.includes("400") ||
          error.message.includes("401"))
      ) {
        return false;
      }
      // Retry network errors up to 1 time for static data
      return failureCount < 1;
    },
    retryDelay: (attemptIndex) => Math.min(2000 * 2 ** attemptIndex, 15000),
    ...overrides,
  };
}

/**
 * Creates optimized query options for area weather searches
 */
export function createAreaWeatherQueryOptions<T = DecodedMetar[]>(
  overrides?: Partial<UseQueryOptions<T, Error>>
): Partial<UseQueryOptions<T, Error>> {
  return {
    ...WEATHER_CACHE_CONFIG.AREA_WEATHER,
    retry: (failureCount, error) => {
      // Don't retry on client errors (4xx)
      if (
        error instanceof Error &&
        (error.message.includes("404") ||
          error.message.includes("400") ||
          error.message.includes("401"))
      ) {
        return false;
      }
      // Retry network errors up to 2 times
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    ...overrides,
  };
}

// ============================================================================
// Cache Key Utilities
// ============================================================================

/**
 * Normalizes ICAO codes for consistent cache keys
 * Ensures uppercase and sorted order for predictable caching
 */
export function normalizeIcaos(icaos: string[]): string[] {
  return icaos
    .map((icao) => icao.toUpperCase().trim())
    .filter((icao) => icao.length === 4)
    .sort();
}

/**
 * Creates a cache key suffix for query variations
 * Useful for distinguishing between different query parameters
 */
export function createCacheKeySuffix(params: Record<string, any>): string {
  const sortedKeys = Object.keys(params).sort();
  return sortedKeys.map((key) => `${key}:${params[key]}`).join("|");
}

// ============================================================================
// Background Refresh Configuration
// ============================================================================

/**
 * Configuration for background refresh behavior
 */
export const BACKGROUND_REFRESH_CONFIG = {
  // Minimum interval between background refreshes (prevents excessive API calls)
  MIN_REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutes

  // Default refresh interval for active weather monitoring
  DEFAULT_REFRESH_INTERVAL: 10 * 60 * 1000, // 10 minutes

  // Maximum refresh interval for less critical updates
  MAX_REFRESH_INTERVAL: 30 * 60 * 1000, // 30 minutes

  // Refresh intervals based on flight category (more frequent for worse weather)
  FLIGHT_CATEGORY_INTERVALS: {
    VFR: 15 * 60 * 1000, // 15 minutes - good weather, less frequent updates
    MVFR: 10 * 60 * 1000, // 10 minutes - marginal weather, moderate updates
    IFR: 5 * 60 * 1000, // 5 minutes - poor weather, frequent updates
    LIFR: 5 * 60 * 1000, // 5 minutes - very poor weather, frequent updates
  },
} as const;

/**
 * Determines optimal refresh interval based on weather conditions
 */
export function getOptimalRefreshInterval(weatherData?: {
  flight_category?: string;
}): number {
  if (!weatherData?.flight_category) {
    return BACKGROUND_REFRESH_CONFIG.DEFAULT_REFRESH_INTERVAL;
  }

  const category =
    weatherData.flight_category as keyof typeof BACKGROUND_REFRESH_CONFIG.FLIGHT_CATEGORY_INTERVALS;
  return (
    BACKGROUND_REFRESH_CONFIG.FLIGHT_CATEGORY_INTERVALS[category] ||
    BACKGROUND_REFRESH_CONFIG.DEFAULT_REFRESH_INTERVAL
  );
}
