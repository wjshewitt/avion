"use client";

import { useQuery, useQueries, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
import { queryKeys } from "@/lib/tanstack/queryKeys";
import { isWeatherSsotEnabled } from "@/lib/config/featureFlags";
import type { DecodedMetar, DecodedTaf } from "@/types/checkwx";

export interface AirfieldWeatherData {
  icao: string;
  metar?: DecodedMetar | null;
  taf?: DecodedTaf | null;
  isStale: boolean;
  dataStalenessMinutes: number;
  lastUpdated: string | null;
  expiresAt: string | null;
  ageMinutes?: number;
}

interface ApiResponse {
  success: boolean;
  data: {
    icao: string;
    isStale: boolean;
    dataStalenessMinutes?: number;
    lastUpdated?: string | null;
    expiresAt?: string | null;
    metar?: DecodedMetar | null;
    taf?: DecodedTaf | null;
  };
  error?: string;
}

async function fetchAirfieldWeather(icao: string): Promise<AirfieldWeatherData> {
  const normalized = icao.toUpperCase();
  const response = await fetch(`/api/weather/airfield/${normalized}?dataset=both`);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const body = (await response.json()) as ApiResponse;
  if (!body.success) {
    throw new Error(body.error || "Failed to load airfield weather");
  }

  const data = body.data;
  if (!data) {
    throw new Error("Airfield weather payload missing");
  }

  const ageMinutes = data.lastUpdated
    ? Math.floor((Date.now() - new Date(data.lastUpdated).getTime()) / 60000)
    : undefined;

  return {
    icao: data.icao,
    metar: data.metar ?? null,
    taf: data.taf ?? null,
    isStale: data.isStale,
    dataStalenessMinutes: data.dataStalenessMinutes ?? ageMinutes ?? 0,
    lastUpdated: data.lastUpdated ?? null,
    expiresAt: data.expiresAt ?? null,
    ageMinutes,
  };
}

function resolveRefetchInterval<TData>(
  ssotEnabled: boolean,
  refetchInterval: UseQueryOptions<AirfieldWeatherData, Error, TData>["refetchInterval"]
) {
  if (!ssotEnabled) {
    return false as const;
  }

  if (refetchInterval !== undefined) {
    return refetchInterval;
  }

  return (query: { state: { data?: AirfieldWeatherData } }) => {
    const expiresAt = query.state.data?.expiresAt;
    if (!expiresAt) {
      return 5 * 60 * 1000;
    }
    const msUntilExpiry = new Date(expiresAt).getTime() - Date.now();
    if (Number.isNaN(msUntilExpiry) || msUntilExpiry <= 0) {
      return 60 * 1000;
    }
    return Math.max(60 * 1000, msUntilExpiry);
  };
}

export function useAirfieldWeather<TData = AirfieldWeatherData>(
  icao: string | null | undefined,
  options?: Omit<UseQueryOptions<AirfieldWeatherData, Error, TData>, "queryKey" | "queryFn">
) {
  const normalized = typeof icao === "string" ? icao.trim().toUpperCase() : "";
  const ssotEnabled = isWeatherSsotEnabled();

  const baseEnabled = Boolean(normalized) && ssotEnabled;

  const refetchInterval = resolveRefetchInterval(ssotEnabled, options?.refetchInterval);

  return useQuery({
    queryKey: queryKeys.weather.airfield(normalized),
    queryFn: () => fetchAirfieldWeather(normalized),
    ...options,
    enabled: options?.enabled ?? baseEnabled,
    retry: options?.retry ?? (ssotEnabled ? 2 : 0),
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? ssotEnabled,
    refetchOnReconnect: options?.refetchOnReconnect ?? ssotEnabled,
    refetchInterval,
  });
}

export type AirfieldWeatherQueryMap = Record<string, UseQueryResult<AirfieldWeatherData, Error>>;

export function useAirfieldWeatherBatch(
  icaos: Array<string | null | undefined>,
  options?: Omit<UseQueryOptions<AirfieldWeatherData, Error>, "queryKey" | "queryFn">
): AirfieldWeatherQueryMap {
  const ssotEnabled = isWeatherSsotEnabled();
  const normalized = Array.from(
    new Set(
      icaos
        .map((icao) => (typeof icao === "string" ? icao.trim().toUpperCase() : ""))
        .filter((value): value is string => Boolean(value))
    )
  );

  const refetchInterval = resolveRefetchInterval(ssotEnabled, options?.refetchInterval);
  const enabled = (options?.enabled ?? ssotEnabled) && ssotEnabled;

  const queries = useQueries({
    queries: normalized.map((icao) => ({
      queryKey: queryKeys.weather.airfield(icao),
      queryFn: () => fetchAirfieldWeather(icao),
      enabled,
      retry: options?.retry ?? (ssotEnabled ? 2 : 0),
      refetchOnWindowFocus: options?.refetchOnWindowFocus ?? ssotEnabled,
      refetchOnReconnect: options?.refetchOnReconnect ?? ssotEnabled,
      refetchInterval,
    })),
  }) as UseQueryResult<AirfieldWeatherData, Error>[];

  return normalized.reduce<AirfieldWeatherQueryMap>((acc, icao, index) => {
    acc[icao] = queries[index];
    return acc;
  }, {});
}
