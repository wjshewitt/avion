"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AirportData,
  AirportSearchResult,
  AirportSearchQuery,
  SelectedAirport,
} from "@/types/airports";
import type { ProcessedAirportData } from "@/types/airportdb";

// ============================================================================
// Query Keys
// ============================================================================

export const airportKeys = {
  all: ["airports"] as const,
  search: (query: string) => [...airportKeys.all, "search", query] as const,
  detail: (icao: string) => [...airportKeys.all, "detail", icao] as const,
  batch: (icaoCodes: string[]) =>
    [...airportKeys.all, "batch", icaoCodes.sort().join(",")] as const,
  popular: (limit: number) => [...airportKeys.all, "popular", limit] as const,
};

// ============================================================================
// API Functions
// ============================================================================

async function searchAirportsAPI(
  query: AirportSearchQuery
): Promise<AirportSearchResult[]> {
  const params = new URLSearchParams({
    q: query.query,
    limit: query.limit.toString(),
    popularFirst: query.popularFirst.toString(),
  });

  const response = await fetch(`/api/airports/search?${params}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to search airports");
  }

  const result = await response.json();
  return result.data;
}

async function getAirportByIcaoAPI(icao: string): Promise<ProcessedAirportData> {
  const response = await fetch(`/api/airports/${icao.toUpperCase()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch airport");
  }

  const result = await response.json();
  return result.data as ProcessedAirportData;
}

async function getAirportsBatchAPI(icaoCodes: string[]): Promise<{
  airports: AirportData[];
  errors: Array<{ icao: string; error: string }>;
  total_requested: number;
  total_found: number;
  total_errors: number;
}> {
  const response = await fetch("/api/airports/batch", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      icao_codes: icaoCodes,
      include_details: true,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch airports");
  }

  const result = await response.json();
  return result.data;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook for searching airports with debounced queries
 */
export function useAirportSearch(
  query: AirportSearchQuery,
  options?: {
    enabled?: boolean;
    staleTime?: number;
  }
) {
  return useQuery({
    queryKey: airportKeys.search(query.query),
    queryFn: () => searchAirportsAPI(query),
    enabled: options?.enabled !== false && query.query.length > 0,
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook for getting a single airport by ICAO code
 */
export function useAirport(
  icao: string,
  options?: {
    enabled?: boolean;
    staleTime?: number;
  }
) {
  return useQuery({
    queryKey: airportKeys.detail(icao),
    queryFn: () => getAirportByIcaoAPI(icao),
    enabled: options?.enabled !== false && icao.length === 4,
    staleTime: options?.staleTime || 30 * 60 * 1000, // 30 minutes (airport data rarely changes)
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook for getting multiple airports by ICAO codes
 */
export function useAirportsBatch(
  icaoCodes: string[],
  options?: {
    enabled?: boolean;
    staleTime?: number;
  }
) {
  return useQuery({
    queryKey: airportKeys.batch(icaoCodes),
    queryFn: () => getAirportsBatchAPI(icaoCodes),
    enabled: options?.enabled !== false && icaoCodes.length > 0,
    staleTime: options?.staleTime || 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook for prefetching airport data (useful for flight creation)
 */
export function usePrefetchAirport() {
  const queryClient = useQueryClient();

  return {
    prefetchAirport: (icao: string) => {
      return queryClient.prefetchQuery({
        queryKey: airportKeys.detail(icao),
        queryFn: () => getAirportByIcaoAPI(icao),
        staleTime: 30 * 60 * 1000, // 30 minutes
      });
    },
    prefetchAirportSearch: (query: AirportSearchQuery) => {
      return queryClient.prefetchQuery({
        queryKey: airportKeys.search(query.query),
        queryFn: () => searchAirportsAPI(query),
        staleTime: 5 * 60 * 1000, // 5 minutes
      });
    },
  };
}

/**
 * Hook for managing airport favorites (client-side only for now)
 */
export function useAirportFavorites() {
  const queryClient = useQueryClient();

  const getFavorites = (): SelectedAirport[] => {
    try {
      const stored = localStorage.getItem("airport-favorites");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const setFavorites = (favorites: SelectedAirport[]) => {
    try {
      localStorage.setItem("airport-favorites", JSON.stringify(favorites));
      // Invalidate any queries that might depend on favorites
      queryClient.invalidateQueries({ queryKey: airportKeys.all });
    } catch (error) {
      console.error("Failed to save favorites:", error);
    }
  };

  const addFavorite = (airport: SelectedAirport) => {
    const current = getFavorites();
    const exists = current.some((fav) => fav.icao === airport.icao);

    if (!exists) {
      setFavorites([...current, airport]);
    }
  };

  const removeFavorite = (icao: string) => {
    const current = getFavorites();
    setFavorites(current.filter((fav) => fav.icao !== icao));
  };

  const isFavorite = (icao: string): boolean => {
    const favorites = getFavorites();
    return favorites.some((fav) => fav.icao === icao);
  };

  return {
    favorites: getFavorites(),
    addFavorite,
    removeFavorite,
    isFavorite,
    clearFavorites: () => setFavorites([]),
  };
}

/**
 * Hook for managing recent airport searches (client-side only)
 */
export function useRecentAirports() {
  const queryClient = useQueryClient();

  const getRecent = (): SelectedAirport[] => {
    try {
      const stored = localStorage.getItem("recent-airports");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const addRecent = (airport: SelectedAirport) => {
    const current = getRecent();
    // Remove if already exists
    const filtered = current.filter((recent) => recent.icao !== airport.icao);
    // Add to beginning and limit to 10
    const updated = [airport, ...filtered].slice(0, 10);

    try {
      localStorage.setItem("recent-airports", JSON.stringify(updated));
      queryClient.invalidateQueries({ queryKey: airportKeys.all });
    } catch (error) {
      console.error("Failed to save recent airports:", error);
    }
  };

  const clearRecent = () => {
    try {
      localStorage.removeItem("recent-airports");
      queryClient.invalidateQueries({ queryKey: airportKeys.all });
    } catch (error) {
      console.error("Failed to clear recent airports:", error);
    }
  };

  return {
    recent: getRecent(),
    addRecent,
    clearRecent,
  };
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Hook for invalidating airport cache (useful for admin operations)
 */
export function useInvalidateAirports() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () =>
      queryClient.invalidateQueries({ queryKey: airportKeys.all }),
    invalidateSearch: (query: string) =>
      queryClient.invalidateQueries({ queryKey: airportKeys.search(query) }),
    invalidateAirport: (icao: string) =>
      queryClient.invalidateQueries({ queryKey: airportKeys.detail(icao) }),
    invalidateBatch: (icaoCodes: string[]) =>
      queryClient.invalidateQueries({ queryKey: airportKeys.batch(icaoCodes) }),
  };
}
