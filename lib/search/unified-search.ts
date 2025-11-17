// Unified Search Engine for Header Search
// Provides fast, client-side search across airports and flights

import type { Flight } from '@/lib/supabase/types';
import type { AirportSearchResult } from '@/types/airports';
import type { AirfieldWeatherData } from '@/lib/tanstack/hooks/useAirfieldWeather';

// ============================================================================
// Types
// ============================================================================

export interface AirportSearchMatch {
  type: 'airport';
  icao: string;
  iata?: string;
  name: string;
  city: string;
  country: string;
  score: number;
  matchType: 'exact' | 'iata' | 'name' | 'city' | 'partial';
  weather?: AirfieldWeatherData | null;
  airportInfo?: any; // ProcessedAirportData
}

export interface FlightSearchMatch {
  type: 'flight';
  id: string;
  code: string;
  origin: string;
  destination: string;
  status: string;
  scheduledAt: string;
  score: number;
  matchType: 'exact' | 'partial' | 'route';
}

export type SearchMatch = AirportSearchMatch | FlightSearchMatch;

export interface SearchResults {
  airports: AirportSearchMatch[];
  flights: FlightSearchMatch[];
  total: number;
  query: string;
}

export interface RecentSearch {
  type: 'airport' | 'flight';
  id: string;
  label: string;
  sublabel: string;
  timestamp: number;
}

// ============================================================================
// Constants
// ============================================================================

const DEBOUNCE_DELAY = 300;
const MAX_RESULTS_PER_CATEGORY = 5;
const RECENT_SEARCHES_KEY = 'header-recent-searches';
const MAX_RECENT_SEARCHES = 5;
const WEATHER_PREFETCH_COUNT = 3; // Prefetch weather for top 3 results

// ============================================================================
// Flight Search Scoring
// ============================================================================

function scoreFlightMatch(flight: Flight, query: string): number {
  const q = query.toLowerCase().trim();
  const code = flight.code.toLowerCase();
  const origin = flight.origin.toLowerCase();
  const destination = flight.destination.toLowerCase();

  // Exact flight code match
  if (code === q) return 100;

  // Partial flight code match
  if (code.includes(q)) return 80;

  // Origin or destination match
  if (origin === q || destination === q) return 70;
  if (origin.includes(q) || destination.includes(q)) return 60;

  // Route match (e.g., "KJFK KLAX")
  const route = `${origin} ${destination}`;
  if (route.includes(q)) return 50;

  return 0;
}

function getFlightMatchType(flight: Flight, query: string): FlightSearchMatch['matchType'] {
  const q = query.toLowerCase().trim();
  const code = flight.code.toLowerCase();
  
  if (code === q) return 'exact';
  if (code.includes(q)) return 'partial';
  
  const origin = flight.origin.toLowerCase();
  const destination = flight.destination.toLowerCase();
  if (origin.includes(q) || destination.includes(q)) return 'route';
  
  return 'partial';
}

// ============================================================================
// Search Functions
// ============================================================================

/**
 * Search flights from in-memory data
 */
export function searchFlights(flights: Flight[], query: string): FlightSearchMatch[] {
  if (!query.trim() || query.length < 2) return [];
  if (!flights || !Array.isArray(flights)) return [];

  const matches: FlightSearchMatch[] = [];

  for (const flight of flights) {
    const score = scoreFlightMatch(flight, query);
    if (score === 0) continue;

    matches.push({
      type: 'flight' as const,
      id: flight.id,
      code: flight.code,
      origin: flight.origin,
      destination: flight.destination,
      status: flight.status,
      scheduledAt: flight.scheduled_at,
      score,
      matchType: getFlightMatchType(flight, query),
    });
  }

  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS_PER_CATEGORY);
}

/**
 * Search airports via API
 */
export async function searchAirports(
  query: string,
  signal?: AbortSignal
): Promise<AirportSearchMatch[]> {
  if (!query.trim() || query.length < 2) return [];

  try {
    const params = new URLSearchParams({
      q: query.trim(),
      limit: MAX_RESULTS_PER_CATEGORY.toString(),
      popularFirst: 'true',
    });

    const response = await fetch(`/api/airports/search?${params}`, {
      signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('Airport search failed:', response.statusText);
      return [];
    }

    const result = await response.json();
    const airportResults: AirportSearchResult[] = result.data || [];

    return airportResults.map(result => ({
      type: 'airport' as const,
      icao: result.airport.icao,
      iata: result.airport.iata,
      name: result.airport.name,
      city: result.airport.city,
      country: result.airport.country,
      score: result.score,
      matchType: result.matchType,
      airportInfo: {
        coordinates: {
          elevation_ft: result.airport.elevation_ft,
        },
        runways: {
          count: result.airport.runway_count,
          longest_ft: result.airport.longest_runway_ft,
        },
        communications: {
          primary_frequencies: {
            tower: result.airport.frequencies?.find((f: any) => f.type === 'TWR')?.frequency,
            ground: result.airport.frequencies?.find((f: any) => f.type === 'GND')?.frequency,
          },
        },
        location: {
          region: result.airport.state,
        },
      },
    }));
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      // Request was cancelled, ignore
      return [];
    }
    console.error('Airport search error:', error);
    return [];
  }
}

/**
 * Prefetch weather for top airport results
 */
async function prefetchWeather(
  airports: AirportSearchMatch[],
  signal?: AbortSignal
): Promise<Record<string, AirfieldWeatherData>> {
  const topAirports = airports.slice(0, WEATHER_PREFETCH_COUNT);
  const weatherData: Record<string, AirfieldWeatherData> = {};

  if (topAirports.length === 0) return weatherData;

  const weatherPromises = topAirports.map(async (airport) => {
    try {
      const response = await fetch(
        `/api/weather/airfield/${airport.icao}?dataset=metar`,
        { signal }
      );

      if (!response.ok) {
        return { icao: airport.icao, data: null };
      }

      const result = await response.json();
      return { icao: airport.icao, data: result.data };
    } catch (error) {
      // Silently fail for weather prefetch (not critical)
      if (error instanceof Error && error.name !== 'AbortError') {
        console.warn(`Weather prefetch failed for ${airport.icao}:`, error);
      }
      return { icao: airport.icao, data: null };
    }
  });

  const settled = await Promise.allSettled(weatherPromises);

  settled.forEach((result) => {
    if (result.status === 'fulfilled' && result.value.data) {
      weatherData[result.value.icao] = result.value.data;
    }
  });

  return weatherData;
}

/**
 * Unified search across airports and flights with weather prefetch
 */
export async function unifiedSearch(
  query: string,
  flights: Flight[] = [],
  signal?: AbortSignal
): Promise<SearchResults> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery || trimmedQuery.length < 2) {
    return {
      airports: [],
      flights: [],
      total: 0,
      query: trimmedQuery,
    };
  }

  // Step 1: Search both in parallel
  const [airportMatches, flightMatches] = await Promise.all([
    searchAirports(trimmedQuery, signal),
    Promise.resolve(searchFlights(flights, trimmedQuery)),
  ]);

  // Step 2: Prefetch weather for top 3 airports
  const weatherData = await prefetchWeather(airportMatches, signal);

  // Step 3: Enhance airport results with weather data
  const enhancedAirports = airportMatches.map((airport) => ({
    ...airport,
    weather: weatherData[airport.icao] || null,
  }));

  return {
    airports: enhancedAirports,
    flights: flightMatches,
    total: enhancedAirports.length + flightMatches.length,
    query: trimmedQuery,
  };
}

// ============================================================================
// Debounced Search
// ============================================================================

let searchTimeout: NodeJS.Timeout | null = null;
let currentAbortController: AbortController | null = null;

/**
 * Debounced unified search with automatic cancellation
 */
export function debouncedSearch(
  query: string,
  flights: Flight[],
  callback: (results: SearchResults) => void
): void {
  // Clear existing timeout
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  // Cancel any in-flight request
  if (currentAbortController) {
    currentAbortController.abort();
  }

  // If query is too short, return empty results immediately
  if (!query.trim() || query.length < 2) {
    callback({
      airports: [],
      flights: [],
      total: 0,
      query: query.trim(),
    });
    return;
  }

  // Set new timeout
  searchTimeout = setTimeout(async () => {
    currentAbortController = new AbortController();
    
    try {
      const results = await unifiedSearch(query, flights, currentAbortController.signal);
      callback(results);
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Search error:', error);
        callback({
          airports: [],
          flights: [],
          total: 0,
          query: query.trim(),
        });
      }
    }
  }, DEBOUNCE_DELAY);
}

/**
 * Cancel any pending search
 */
export function cancelSearch(): void {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
    searchTimeout = null;
  }
  if (currentAbortController) {
    currentAbortController.abort();
    currentAbortController = null;
  }
}

// ============================================================================
// Recent Searches Management
// ============================================================================

/**
 * Get recent searches from localStorage
 */
export function getRecentSearches(): RecentSearch[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return parsed;
  } catch (error) {
    console.error('Failed to get recent searches:', error);
    return [];
  }
}

/**
 * Add a search to recent searches
 */
export function addRecentSearch(search: Omit<RecentSearch, 'timestamp'>): void {
  if (typeof window === 'undefined') return;

  try {
    const recent = getRecentSearches();
    
    // Remove if already exists (to move to top)
    const filtered = recent.filter(item => item.id !== search.id);
    
    // Add to beginning with timestamp
    const updated: RecentSearch[] = [
      { ...search, timestamp: Date.now() },
      ...filtered,
    ].slice(0, MAX_RECENT_SEARCHES);

    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save recent search:', error);
  }
}

/**
 * Clear all recent searches
 */
export function clearRecentSearches(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch (error) {
    console.error('Failed to clear recent searches:', error);
  }
}
