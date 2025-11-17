"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { queryKeys } from "@/lib/tanstack/queryKeys";
import type { AirportTemporalProfile } from "@/lib/time/authority";

async function fetchTemporalProfile(icao: string): Promise<AirportTemporalProfile | null> {
  const response = await fetch(`/api/time/airport?icao=${icao}`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Failed to fetch temporal profile for ${icao}`);
  }
  return response.json();
}

export function useAirportTemporalProfile(
  icao: string,
  options?: Omit<UseQueryOptions<AirportTemporalProfile | null, Error>, "queryKey" | "queryFn">
) {
  const normalized = icao?.toUpperCase?.() ?? "";
  return useQuery({
    queryKey: queryKeys.time.airport(normalized),
    queryFn: () => fetchTemporalProfile(normalized),
    enabled: Boolean(normalized && normalized.length === 4 && (options?.enabled ?? true)),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    ...options,
  });
}
