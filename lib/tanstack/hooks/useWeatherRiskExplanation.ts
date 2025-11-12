"use client";

import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { isWeatherRiskExplanationEnabled } from "@/lib/config/featureFlags";
import { logErrorWithContext } from "@/lib/utils/errors";
import type { WeatherRiskExplanationInput } from "@/lib/gemini/weather-risk-explainer";

// ============================================================================
// Types
// ============================================================================

export type WeatherRiskExplanationParams =
  | { flightId: string }
  | { airport: string }
  | { riskData: WeatherRiskExplanationInput };

export interface WeatherRiskExplanationData {
  explanation: string;
  metadata: {
    tokensUsed: number;
    cost: number;
    model: string;
    timestamp: string;
  };
}

export interface WeatherRiskExplanationResponse {
  success: boolean;
  explanation: string;
  metadata: {
    tokensUsed: number;
    cost: number;
    model: string;
    timestamp: string;
  };
  error?: string;
}

// ============================================================================
// Error Handling
// ============================================================================

function handleExplanationError(error: unknown, params: WeatherRiskExplanationParams) {
  logErrorWithContext(error, {
    operation: "useWeatherRiskExplanation",
    params,
  });

  if (error instanceof Error) {
    if (error.message.includes("401")) {
      return new Error("Authentication required to generate explanations");
    }
    if (error.message.includes("503")) {
      return new Error("Weather risk explanation feature is not enabled");
    }
    if (error.message.includes("500")) {
      return new Error("Failed to generate explanation. Please try again.");
    }
    if (error.message.includes("fetch")) {
      return new Error("Unable to connect to explanation service");
    }
  }

  return new Error("Failed to generate weather risk explanation");
}

// ============================================================================
// Query Function
// ============================================================================

async function fetchWeatherRiskExplanation(
  params: WeatherRiskExplanationParams
): Promise<WeatherRiskExplanationData> {
  const res = await fetch("/api/weather/risk/explain", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errorText}`);
  }

  const body: WeatherRiskExplanationResponse = await res.json();

  if (!body.success) {
    throw new Error(body.error || "Explanation API returned an error");
  }

  return {
    explanation: body.explanation,
    metadata: body.metadata,
  };
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to fetch AI-generated explanations for weather risk scores
 * 
 * @param params - Either flightId, airport, or pre-computed riskData
 * @param options - TanStack Query options
 * @returns Query result with explanation text and metadata
 * 
 * @example
 * // Explain flight risk
 * const { data, isLoading } = useWeatherRiskExplanation(
 *   { flightId: "123" },
 *   { enabled: showExplanation }
 * );
 * 
 * @example
 * // Explain airport risk
 * const { data, isLoading } = useWeatherRiskExplanation(
 *   { airport: "KJFK" },
 *   { enabled: true }
 * );
 * 
 * @example
 * // Explain pre-computed risk data
 * const { data, isLoading } = useWeatherRiskExplanation(
 *   { riskData: computedRisk },
 *   { enabled: userClickedExplain }
 * );
 */
export function useWeatherRiskExplanation<TData = WeatherRiskExplanationData>(
  params: WeatherRiskExplanationParams,
  options?: Omit<UseQueryOptions<WeatherRiskExplanationData, Error, TData>, "queryKey" | "queryFn">
) {
  const featureFlagEnabled = isWeatherRiskExplanationEnabled();

  return useQuery({
    queryKey: queryKeys.weather.riskExplanation(params),
    queryFn: () => fetchWeatherRiskExplanation(params),
    enabled: featureFlagEnabled && (options?.enabled ?? false),
    staleTime: 15 * 60 * 1000, // 15 minutes - aligned with weather data refresh
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache
    refetchOnWindowFocus: false, // Don't auto-refetch (costs money)
    refetchOnReconnect: false, // Don't auto-refetch (costs money)
    retry: 1, // Only retry once (AI calls can be expensive)
    retryDelay: 2000,
    meta: {
      onError: (error: Error) => handleExplanationError(error, params),
    },
    ...options,
  });
}
