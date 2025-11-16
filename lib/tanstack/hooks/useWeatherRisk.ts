"use client";

import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { logErrorWithContext } from "@/lib/utils/errors";
import type { DecodedMetar, DecodedTaf } from "@/types/checkwx";

// ============================================================================
// Types
// ============================================================================

export type WeatherRiskParams =
  | { airport: string; mode?: "lite" | "full"; scheduledDeparture?: string; scheduledArrival?: string }
  | { flightId: string };

export interface WeatherRiskFactorDetail {
  factor: string;
  score: number;
  weight: number;
  message: string;
}

export interface WeatherRiskResultDetails {
  score: number;
  confidence: number;
  tier: string;
  factorBreakdown: WeatherRiskFactorDetail[];
}

export interface WeatherRiskMessaging {
  summary: string;
  details: string[];
  recommendations: string[];
}

export interface AirportWeatherSnapshot {
  icao?: string;
  metar?: DecodedMetar;
  taf?: DecodedTaf;
  lastUpdated?: string;
  expiresAt?: string;
  isStale?: boolean;
}

export interface AirportRiskSnapshot {
  icao: string;
  phase: string;
  mode: string;
  score?: number;
  confidence?: number;
  tier?: string;
  isStale: boolean;
  dataStalenessMinutes: number;
  result?: WeatherRiskResultDetails;
  messaging?: WeatherRiskMessaging;
  factorBreakdown?: WeatherRiskFactorDetail[];
  lastUpdated?: string;
  datasetsAvailable?: number;
  weatherData?: AirportWeatherSnapshot;
}

export interface WeatherRiskData extends AirportRiskSnapshot {
  origin?: AirportRiskSnapshot;
  destination?: AirportRiskSnapshot;
  flightId?: string;
}

export interface WeatherRiskResponse {
  success: boolean;
  data: WeatherRiskData;
  timestamp: string;
  error?: string;
}

// ============================================================================
// Error Handling
// ============================================================================

function handleWeatherRiskError(error: unknown, params: WeatherRiskParams) {
  logErrorWithContext(error, {
    operation: "useWeatherRisk",
    params,
  });

  // Return user-friendly error messages
  if (error instanceof Error) {
    if (error.message.includes("401")) {
      return new Error("Authentication required to fetch weather risk data");
    }
    if (error.message.includes("404")) {
      return new Error("Weather risk data not found");
    }
    if (error.message.includes("429")) {
      return new Error("Weather service rate limit exceeded. Please try again shortly.");
    }
    if (error.message.includes("500")) {
      return new Error("Weather risk service error. Using cached data if available.");
    }
    if (error.message.includes("fetch")) {
      return new Error("Unable to connect to weather risk service");
    }
  }

  return new Error("Failed to fetch weather risk data");
}

// ============================================================================
// Query Function
// ============================================================================

async function fetchWeatherRisk(params: WeatherRiskParams): Promise<WeatherRiskData> {
  const qs = new URLSearchParams();
  
  if ("flightId" in params) {
    qs.set("flightId", params.flightId);
  } else {
    qs.set("airport", params.airport.toUpperCase());
    if (params.mode) qs.set("mode", params.mode);
    if (params.scheduledDeparture) qs.set("scheduledDeparture", params.scheduledDeparture);
    if (params.scheduledArrival) qs.set("scheduledArrival", params.scheduledArrival);
  }

  const res = await fetch(`/api/weather/risk?${qs.toString()}`);
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errorText}`);
  }

  const body: WeatherRiskResponse = await res.json();

  if (!body.success) {
    throw new Error(body.error || "Risk API returned an error");
  }

  const data = body.data;

  // Normalize shape: ensure top-level score/tier/confidence are populated from result if present
  if (data && data.result) {
    const { score, confidence, tier, factorBreakdown } = data.result;
    return {
      ...data,
      score: data.score ?? score,
      confidence: data.confidence ?? confidence,
      tier: data.tier ?? tier,
      factorBreakdown: data.factorBreakdown ?? factorBreakdown,
    };
  }

  return data;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to fetch weather risk assessment data
 * 
 * @param params - Either flightId or airport details
 * @param options - TanStack Query options
 * @returns Query result with weather risk data
 * 
 * @example
 * // Fetch risk for a flight
 * const { data, isLoading } = useWeatherRisk({ flightId: "123" });
 * 
 * @example
 * // Fetch risk for an airport
 * const { data, isLoading } = useWeatherRisk({ 
 *   airport: "KJFK", 
 *   mode: "full",
 *   scheduledDeparture: "2025-11-08T10:00:00Z"
 * });
 */
export function useWeatherRisk<TData = WeatherRiskData>(
  params: WeatherRiskParams,
  options?: Omit<UseQueryOptions<WeatherRiskData, Error, TData>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.weather.risk(params),
    queryFn: () => fetchWeatherRisk(params),
    staleTime: 10 * 60 * 1000, // 10 minutes - weather risk changes fairly frequently
    gcTime: 15 * 60 * 1000, // 15 minutes - keep in cache for 15 min
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchOnReconnect: true, // Refetch when network reconnects
    retry: (failureCount, error) => {
      // Don't retry on auth or client errors
      if (
        error instanceof Error &&
        (error.message.includes("401") ||
          error.message.includes("400") ||
          error.message.includes("404"))
      ) {
        return false;
      }
      // Retry network/server errors up to 2 times
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    meta: {
      onError: (error: Error) => handleWeatherRiskError(error, params),
    },
    ...options,
  });
}
