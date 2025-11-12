"use client";

import React from "react";
import {
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { logErrorWithContext } from "@/lib/utils/errors";
import {
  createMetarQueryOptions,
  createTafQueryOptions,
  createStationQueryOptions,
  createAreaWeatherQueryOptions,
  normalizeIcaos,
} from "../weatherConfig";
import type {
  DecodedMetar,
  DecodedTaf,
  StationData,
  MetarApiResponse,
  TafApiResponse,
  StationApiResponse,
} from "@/types/checkwx";

// ============================================================================
// Error Handling Utilities
// ============================================================================

/**
 * Handles weather API errors with proper logging and user-friendly messages
 */
function handleWeatherError(error: unknown, operation: string, params?: any) {
  logErrorWithContext(error, {
    operation,
    params,
  });

  // Return user-friendly error message based on error type
  if (error instanceof Error) {
    if (error.message.includes("404")) {
      return new Error("Weather data not found for the requested airport(s)");
    }
    if (error.message.includes("429")) {
      return new Error(
        "Weather service temporarily unavailable due to rate limits"
      );
    }
    if (error.message.includes("401")) {
      return new Error("Weather service authentication error");
    }
    if (error.message.includes("fetch")) {
      return new Error("Unable to connect to weather service");
    }
  }

  return new Error("Failed to fetch weather data");
}

/**
 * Fetches data from weather API endpoints with error handling
 */
async function fetchWeatherData<T>(endpoint: string): Promise<T> {
  const response = await fetch(endpoint);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Weather API returned an error");
  }

  return data.data;
}

// ============================================================================
// Individual Weather Data Hooks
// ============================================================================

/**
 * Hook to fetch METAR (current weather) data for multiple airports
 *
 * @param options - Query options including icaos array and TanStack Query options
 * @returns Query result with METAR data, loading state, and error handling
 */
export function useMetar(
  options: {
    icaos: string[];
  } & Omit<UseQueryOptions<DecodedMetar[], Error>, "queryKey" | "queryFn">
) {
  const { icaos, ...queryOptions } = options;
  const normalizedIcaos = normalizeIcaos(icaos);

  return useQuery({
    queryKey: queryKeys.weather.metar(normalizedIcaos),
    queryFn: async (): Promise<DecodedMetar[]> => {
      if (normalizedIcaos.length === 0) {
        return [];
      }

      const endpoint = `/api/weather/metar?icaos=${normalizedIcaos.join(",")}`;
      return fetchWeatherData<DecodedMetar[]>(endpoint);
    },
    enabled: normalizedIcaos.length > 0,
    ...createMetarQueryOptions({
      ...queryOptions,
      meta: {
        onError: (error: Error) =>
          handleWeatherError(error, "useMetar", { icaos: normalizedIcaos }),
        ...queryOptions.meta,
      },
    }),
  });
}

/**
 * Hook to fetch TAF (forecast) data for multiple airports
 *
 * @param options - Query options including icaos array and TanStack Query options
 * @returns Query result with TAF data, loading state, and error handling
 */
export function useTaf(
  options: {
    icaos: string[];
  } & Omit<UseQueryOptions<DecodedTaf[], Error>, "queryKey" | "queryFn">
) {
  const { icaos, ...queryOptions } = options;
  const normalizedIcaos = normalizeIcaos(icaos);

  return useQuery({
    queryKey: queryKeys.weather.taf(normalizedIcaos),
    queryFn: async (): Promise<DecodedTaf[]> => {
      if (normalizedIcaos.length === 0) {
        return [];
      }

      const endpoint = `/api/weather/taf?icaos=${normalizedIcaos.join(",")}`;
      return fetchWeatherData<DecodedTaf[]>(endpoint);
    },
    enabled: normalizedIcaos.length > 0,
    ...createTafQueryOptions({
      ...queryOptions,
      meta: {
        onError: (error: Error) =>
          handleWeatherError(error, "useTaf", { icaos: normalizedIcaos }),
        ...queryOptions.meta,
      },
    }),
  });
}

/**
 * Hook to fetch station information for multiple airports
 * Station data is relatively static, so it's cached for 24 hours
 *
 * @param options - Query options including icaos array and TanStack Query options
 * @returns Query result with station data, loading state, and error handling
 */
export function useStation(
  options: {
    icaos: string[];
  } & Omit<UseQueryOptions<StationData[], Error>, "queryKey" | "queryFn">
) {
  const { icaos, ...queryOptions } = options;
  const normalizedIcaos = normalizeIcaos(icaos);

  return useQuery({
    queryKey: queryKeys.weather.station(normalizedIcaos),
    queryFn: async (): Promise<StationData[]> => {
      if (normalizedIcaos.length === 0) {
        return [];
      }

      const endpoint = `/api/weather/station?icaos=${normalizedIcaos.join(",")}`;
      return fetchWeatherData<StationData[]>(endpoint);
    },
    enabled: normalizedIcaos.length > 0,
    ...createStationQueryOptions({
      ...queryOptions,
      meta: {
        onError: (error: Error) =>
          handleWeatherError(error, "useStation", { icaos: normalizedIcaos }),
        ...queryOptions.meta,
      },
    }),
  });
}

/**
 * Hook to fetch METAR data for airports within a radius of a center point
 *
 * @param options - Query options including center icao, radius in miles, and TanStack Query options
 * @returns Query result with area METAR data, loading state, and error handling
 */
export function useMetarRadius(
  options: {
    icao: string;
    radiusMiles: number;
  } & Omit<UseQueryOptions<DecodedMetar[], Error>, "queryKey" | "queryFn">
) {
  const { icao, radiusMiles, ...queryOptions } = options;
  const normalizedIcao = icao.toUpperCase().trim();

  return useQuery({
    queryKey: queryKeys.weather.metarRadius(normalizedIcao, radiusMiles),
    queryFn: async (): Promise<DecodedMetar[]> => {
      const endpoint = `/api/weather/metar/radius?icao=${normalizedIcao}&miles=${radiusMiles}`;
      return fetchWeatherData<DecodedMetar[]>(endpoint);
    },
    enabled: !!normalizedIcao && radiusMiles > 0 && radiusMiles <= 250,
    ...createAreaWeatherQueryOptions({
      ...queryOptions,
      meta: {
        onError: (error: Error) =>
          handleWeatherError(error, "useMetarRadius", {
            icao: normalizedIcao,
            radiusMiles,
          }),
        ...queryOptions.meta,
      },
    }),
  });
}

// ============================================================================
// Combined Weather Data Hooks
// ============================================================================

/**
 * Combined weather data for a single airport
 */
export interface CompleteWeatherData {
  icao: string;
  metar?: DecodedMetar;
  taf?: DecodedTaf;
  station?: StationData;
  loading: {
    metar: boolean;
    taf: boolean;
    station: boolean;
    any: boolean;
    all: boolean;
  };
  error: {
    metar?: Error;
    taf?: Error;
    station?: Error;
    any: boolean;
  };
  refetch: {
    metar: () => void;
    taf: () => void;
    station: () => void;
    all: () => void;
  };
}

/**
 * Hook to fetch complete weather data (METAR, TAF, and station) for a single airport
 * Combines multiple queries and provides unified loading states and error handling
 *
 * @param options - Query options including icao and individual query options
 * @returns Combined weather data with unified loading states and error handling
 */
export function useCompleteWeather(options: {
  icao: string;
  metarOptions?: Omit<
    UseQueryOptions<DecodedMetar[], Error>,
    "queryKey" | "queryFn"
  >;
  tafOptions?: Omit<
    UseQueryOptions<DecodedTaf[], Error>,
    "queryKey" | "queryFn"
  >;
  stationOptions?: Omit<
    UseQueryOptions<StationData[], Error>,
    "queryKey" | "queryFn"
  >;
}): CompleteWeatherData {
  const { icao, metarOptions, tafOptions, stationOptions } = options;

  // Fetch individual data types
  const metarQuery = useMetar({
    icaos: icao ? [icao] : [],
    ...metarOptions,
  });

  const tafQuery = useTaf({
    icaos: icao ? [icao] : [],
    ...tafOptions,
  });

  const stationQuery = useStation({
    icaos: icao ? [icao] : [],
    ...stationOptions,
  });

  // Extract individual data items (first item since we're querying single ICAO)
  const metar = metarQuery.data?.[0];
  const taf = tafQuery.data?.[0];
  const station = stationQuery.data?.[0];

  // Aggregate loading states
  const loading = {
    metar: metarQuery.isLoading,
    taf: tafQuery.isLoading,
    station: stationQuery.isLoading,
    any: metarQuery.isLoading || tafQuery.isLoading || stationQuery.isLoading,
    all: metarQuery.isLoading && tafQuery.isLoading && stationQuery.isLoading,
  };

  // Aggregate error states
  const error = {
    metar: metarQuery.error || undefined,
    taf: tafQuery.error || undefined,
    station: stationQuery.error || undefined,
    any: !!(metarQuery.error || tafQuery.error || stationQuery.error),
  };

  // Aggregate refetch functions
  const refetch = {
    metar: () => metarQuery.refetch(),
    taf: () => tafQuery.refetch(),
    station: () => stationQuery.refetch(),
    all: () => {
      metarQuery.refetch();
      tafQuery.refetch();
      stationQuery.refetch();
    },
  };

  return {
    icao,
    metar,
    taf,
    station,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook to fetch complete weather data for multiple airports
 * Returns an array of CompleteWeatherData objects
 *
 * @param options - Query options including icaos array and individual query options
 * @returns Array of complete weather data for each airport
 */
export function useMultipleCompleteWeather(options: {
  icaos: string[];
  metarOptions?: Omit<
    UseQueryOptions<DecodedMetar[], Error>,
    "queryKey" | "queryFn"
  >;
  tafOptions?: Omit<
    UseQueryOptions<DecodedTaf[], Error>,
    "queryKey" | "queryFn"
  >;
  stationOptions?: Omit<
    UseQueryOptions<StationData[], Error>,
    "queryKey" | "queryFn"
  >;
}): CompleteWeatherData[] {
  const { icaos, metarOptions, tafOptions, stationOptions } = options;

  // Fetch all data types for all airports
  const metarQuery = useMetar({
    icaos,
    ...metarOptions,
  });

  const tafQuery = useTaf({
    icaos,
    ...tafOptions,
  });

  const stationQuery = useStation({
    icaos,
    ...stationOptions,
  });

  // Create a map for quick lookups
  const metarMap = new Map(metarQuery.data?.map((m) => [m.icao, m]) || []);
  const tafMap = new Map(tafQuery.data?.map((t) => [t.icao, t]) || []);
  const stationMap = new Map(stationQuery.data?.map((s) => [s.icao, s]) || []);

  // Build complete weather data for each ICAO
  return icaos.map((icao) => {
    const metar = metarMap.get(icao);
    const taf = tafMap.get(icao);
    const station = stationMap.get(icao);

    const loading = {
      metar: metarQuery.isLoading,
      taf: tafQuery.isLoading,
      station: stationQuery.isLoading,
      any: metarQuery.isLoading || tafQuery.isLoading || stationQuery.isLoading,
      all: metarQuery.isLoading && tafQuery.isLoading && stationQuery.isLoading,
    };

    const error = {
      metar: metarQuery.error || undefined,
      taf: tafQuery.error || undefined,
      station: stationQuery.error || undefined,
      any: !!(metarQuery.error || tafQuery.error || stationQuery.error),
    };

    const refetch = {
      metar: () => metarQuery.refetch(),
      taf: () => tafQuery.refetch(),
      station: () => stationQuery.refetch(),
      all: () => {
        metarQuery.refetch();
        tafQuery.refetch();
        stationQuery.refetch();
      },
    };

    return {
      icao,
      metar,
      taf,
      station,
      loading,
      error,
      refetch,
    };
  });
}
// ============================================================================
// Cache Management and Query Utilities
// ============================================================================

/**
 * Hook for managing weather data cache operations
 * Provides utilities for cache invalidation, prefetching, and manual cache updates
 */
export function useWeatherCache() {
  const queryClient = useQueryClient();

  return {
    /**
     * Invalidate all weather data for specific airports
     * Triggers refetch of METAR, TAF, and station data
     */
    invalidateWeatherData: (icaos: string[]) => {
      icaos.forEach((icao) => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.weather.metar([icao]),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.weather.taf([icao]),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.weather.station([icao]),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.weather.complete(icao),
        });
      });
    },

    /**
     * Invalidate all weather cache data
     * Useful for global refresh or when switching between different data sources
     */
    invalidateAllWeatherData: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.weather.all,
      });
    },

    /**
     * Prefetch weather data for airports
     * Useful for preloading data before user navigation
     */
    prefetchWeatherData: async (icaos: string[]) => {
      const promises = [
        queryClient.prefetchQuery({
          queryKey: queryKeys.weather.metar(icaos),
          queryFn: async () => {
            if (icaos.length === 0) return [];
            const endpoint = `/api/weather/metar?icaos=${icaos.join(",")}`;
            return fetchWeatherData<DecodedMetar[]>(endpoint);
          },
          staleTime: 10 * 60 * 1000,
        }),
        queryClient.prefetchQuery({
          queryKey: queryKeys.weather.taf(icaos),
          queryFn: async () => {
            if (icaos.length === 0) return [];
            const endpoint = `/api/weather/taf?icaos=${icaos.join(",")}`;
            return fetchWeatherData<DecodedTaf[]>(endpoint);
          },
          staleTime: 10 * 60 * 1000,
        }),
        queryClient.prefetchQuery({
          queryKey: queryKeys.weather.station(icaos),
          queryFn: async () => {
            if (icaos.length === 0) return [];
            const endpoint = `/api/weather/station?icaos=${icaos.join(",")}`;
            return fetchWeatherData<StationData[]>(endpoint);
          },
          staleTime: 24 * 60 * 60 * 1000,
        }),
      ];

      await Promise.allSettled(promises);
    },

    /**
     * Get cached weather data without triggering a fetch
     * Returns undefined if data is not in cache
     */
    getCachedWeatherData: (icao: string) => {
      const metarData = queryClient.getQueryData<DecodedMetar[]>(
        queryKeys.weather.metar([icao])
      );
      const tafData = queryClient.getQueryData<DecodedTaf[]>(
        queryKeys.weather.taf([icao])
      );
      const stationData = queryClient.getQueryData<StationData[]>(
        queryKeys.weather.station([icao])
      );

      return {
        metar: metarData?.[0],
        taf: tafData?.[0],
        station: stationData?.[0],
      };
    },

    /**
     * Manually set weather data in cache
     * Useful for optimistic updates or when receiving data from other sources
     */
    setWeatherData: (
      icao: string,
      data: {
        metar?: DecodedMetar;
        taf?: DecodedTaf;
        station?: StationData;
      }
    ) => {
      if (data.metar) {
        queryClient.setQueryData(queryKeys.weather.metar([icao]), [data.metar]);
      }
      if (data.taf) {
        queryClient.setQueryData(queryKeys.weather.taf([icao]), [data.taf]);
      }
      if (data.station) {
        queryClient.setQueryData(queryKeys.weather.station([icao]), [
          data.station,
        ]);
      }
    },

    /**
     * Remove weather data from cache
     * Useful for cleanup or when data becomes invalid
     */
    removeWeatherData: (icaos: string[]) => {
      icaos.forEach((icao) => {
        queryClient.removeQueries({
          queryKey: queryKeys.weather.metar([icao]),
        });
        queryClient.removeQueries({
          queryKey: queryKeys.weather.taf([icao]),
        });
        queryClient.removeQueries({
          queryKey: queryKeys.weather.station([icao]),
        });
      });
    },

    /**
     * Get cache statistics for monitoring and debugging
     */
    getCacheStats: () => {
      const cache = queryClient.getQueryCache();
      const weatherQueries = cache
        .getAll()
        .filter((query) => query.queryKey[0] === "weather");

      return {
        totalWeatherQueries: weatherQueries.length,
        activeQueries: weatherQueries.filter((q) => q.getObserversCount() > 0)
          .length,
        staleQueries: weatherQueries.filter((q) => q.isStale()).length,
        errorQueries: weatherQueries.filter((q) => q.state.status === "error")
          .length,
        loadingQueries: weatherQueries.filter(
          (q) => q.state.status === "pending"
        ).length,
      };
    },
  };
}

/**
 * Hook for background weather data updates
 * Provides utilities for setting up automatic refresh intervals and background sync
 */
export function useWeatherBackgroundSync(options: {
  icaos: string[];
  enableAutoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}) {
  const {
    icaos,
    enableAutoRefresh = false,
    refreshInterval = 10 * 60 * 1000,
  } = options;
  const queryClient = useQueryClient();

  // Set up background refetch for weather data
  React.useEffect(() => {
    if (!enableAutoRefresh || icaos.length === 0) {
      return;
    }

    const interval = setInterval(() => {
      // Only refetch if queries have active observers
      const metarQuery = queryClient.getQueryCache().find({
        queryKey: queryKeys.weather.metar(icaos),
      });
      const tafQuery = queryClient.getQueryCache().find({
        queryKey: queryKeys.weather.taf(icaos),
      });

      if (metarQuery && metarQuery.getObserversCount() > 0) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.weather.metar(icaos),
        });
      }

      if (tafQuery && tafQuery.getObserversCount() > 0) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.weather.taf(icaos),
        });
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [icaos, enableAutoRefresh, refreshInterval, queryClient]);

  return {
    /**
     * Manually trigger background sync for current airports
     */
    triggerSync: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.weather.metar(icaos),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.weather.taf(icaos),
      });
    },

    /**
     * Check if background sync is active
     */
    isSyncActive: enableAutoRefresh && icaos.length > 0,
  };
}
