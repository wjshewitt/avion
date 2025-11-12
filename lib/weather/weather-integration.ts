// Weather Integration System
// Handles temporal weather intelligence for flights based on flight phase and timing
// Uses database-first pattern: checks cache before calling external APIs

import { getCheckWXClient } from "./checkwx-client";
import { analyzeRouteWeatherConcerns, generateWeatherSummary } from "./weatherConcerns";
import { weatherCache, type WeatherCacheRecord } from "./cache/index";
import type { WeatherDataset } from "./cache/index";
import type { Flight } from "@/lib/supabase/types";
import type { DecodedMetar, DecodedTaf } from "@/types/checkwx";

// ============================================================================
// Weather Focus Strategy Types
// ============================================================================

export interface WeatherFocusStrategy {
  period: 'pre_flight' | 'active_window' | 'in_flight' | 'post_flight';
  dataSources: {
    origin: ('metar' | 'taf')[];
    destination: ('metar' | 'taf')[];
  };
  refreshInterval: number; // minutes
  priority: 'low' | 'medium' | 'high' | 'critical';
  cacheDuration: number; // minutes
}

export interface WeatherData {
  metar?: DecodedMetar;
  taf?: DecodedTaf;
  lastUpdated: Date;
  expiresAt: Date;
}

export interface FlightWeatherData {
  origin: WeatherData;
  destination: WeatherData;
  concerns: any[];
  riskScore: number;
  alertLevel: 'green' | 'yellow' | 'red';
  focus: WeatherFocusStrategy;
  lastUpdated: Date;
}

// ============================================================================
// Weather Focus Determination
// ============================================================================

/**
 * Determines the appropriate weather focus strategy based on flight timing and status
 */
export function determineWeatherFocus(flight: Flight): WeatherFocusStrategy {
  const now = new Date();
  const scheduledDep = new Date(flight.scheduled_at);
  const hoursUntilDep = (scheduledDep.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  // In flight (departed but not arrived)
  if (flight.status === "On Time" && hoursUntilDep < 0) {
    return {
      period: 'in_flight',
      dataSources: { origin: ['metar'], destination: ['metar'] },
      refreshInterval: 15,
      priority: 'critical',
      cacheDuration: 15
    };
  }
  
  // Active window (24 hours before departure)
  if (hoursUntilDep <= 24 && hoursUntilDep > 0) {
    return {
      period: 'active_window', 
      dataSources: { origin: ['metar', 'taf'], destination: ['taf'] },
      refreshInterval: 30,
      priority: 'high',
      cacheDuration: 30
    };
  }
  
  // Pre-flight (more than 24 hours before departure)
  return {
    period: 'pre_flight',
    dataSources: { origin: ['taf'], destination: ['taf'] },
    refreshInterval: 120,
    priority: 'medium',
    cacheDuration: 120
  };
}

// ============================================================================
// Flight Airport Helpers
// ============================================================================

function requireIcaoCode(
  code: string | null | undefined,
  label: "origin" | "destination",
  flightId: string
): string {
  const value = (code ?? "").trim().toUpperCase();

  if (!/^[A-Z]{4}$/.test(value)) {
    throw new Error(
      `Flight ${flightId} is missing a valid ${label} ICAO code. ` +
        "Please update the flight to select airports from the unified database."
    );
  }

  return value;
}

// ============================================================================
// Weather Data Fetching with Database-First Pattern
// ============================================================================

/**
 * Check weather cache for fresh data before calling API
 * Cache is shared across all users to minimize API calls
 */
async function checkWeatherCache(
  icao: string,
  dataSources: ('metar' | 'taf')[]
): Promise<{ metar?: DecodedMetar; taf?: DecodedTaf } | null> {
  const result: { metar?: DecodedMetar; taf?: DecodedTaf } = {};
  let hasData = false;
  
  for (const source of dataSources) {
    const dataset: WeatherDataset = source === 'metar' ? 'metar_decoded' : 'taf_decoded';
    const cached = await weatherCache.read({ icao, dataset, mode: 'full' });
    
    if (cached && !cached.isStale) {
      console.log(`[Weather] Cache HIT for ${icao} ${source} (expires ${cached.expiresAt})`);
      const payload: any = cached.data as any;
      // Normalize potential wrapper shapes to the decoded object
      const normalized = Array.isArray(payload)
        ? payload[0]
        : (payload?.data?.[0] ?? payload?.data?.data?.[0] ?? payload);
      result[source] = normalized as any;
      hasData = true;
    } else if (cached) {
      console.log(`[Weather] Cache STALE for ${icao} ${source} (${cached.dataStalenessMinutes} min old)`);
    }
  }
  
  return hasData ? result : null;
}

/**
 * Fetch weather from API and cache it for future use by all users
 */
async function fetchAndCacheAirportWeather(
  icao: string,
  dataSources: ('metar' | 'taf')[]
): Promise<{ metar?: DecodedMetar; taf?: DecodedTaf }> {
  const client = getCheckWXClient();
  const result: { metar?: DecodedMetar; taf?: DecodedTaf } = {};
  
  for (const source of dataSources) {
    try {
      if (source === 'metar') {
        const metarData = await client.getMetar([icao]);
        if (metarData.length > 0) {
          result.metar = metarData[0];
          
          // Cache with 30-minute expiry, 15-minute stale time
          await weatherCache.write({
            key: { icao, dataset: 'metar_decoded', mode: 'full' },
            data: result.metar,
            metadata: {
              observed: result.metar.observed,
              retrievedAt: new Date().toISOString(),
              source: 'checkwx',
              mode: 'full',
            },
            expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
            staleAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
            dataStalenessMinutes: 0,
            isStale: false,
          });
          
          console.log(`[Weather] Fetched & cached METAR for ${icao} (30 min TTL)`);
        }
      }
      
      if (source === 'taf') {
        const tafData = await client.getTaf([icao]);
        if (tafData.length > 0) {
          result.taf = tafData[0];
          
          // TAF valid for ~6 hours, cache accordingly
          const validTo = result.taf.timestamp?.to;
          const ttlMs = validTo 
            ? Math.min(6 * 60 * 60 * 1000, new Date(validTo).getTime() - Date.now())
            : 6 * 60 * 60 * 1000;
          
          await weatherCache.write({
            key: { icao, dataset: 'taf_decoded', mode: 'full' },
            data: result.taf,
            metadata: {
              validFrom: result.taf.timestamp?.from,
              validTo: result.taf.timestamp?.to,
              retrievedAt: new Date().toISOString(),
              source: 'checkwx',
              mode: 'full',
            },
            expiresAt: new Date(Date.now() + ttlMs).toISOString(),
            staleAt: new Date(Date.now() + ttlMs / 2).toISOString(),
            dataStalenessMinutes: 0,
            isStale: false,
          });
          
          console.log(`[Weather] Fetched & cached TAF for ${icao} (${Math.round(ttlMs / 60000)} min TTL)`);
        }
      }
    } catch (error) {
      console.error(`[Weather] Error fetching ${source} for ${icao}:`, error);
    }
  }
  
  return result;
}

/**
 * Fetches weather data for both origin and destination airports
 * Uses database-first pattern: checks flight cache → weather_cache → API
 * @throws Error if airport codes are invalid
 */
export async function fetchFlightWeather(flight: Flight): Promise<FlightWeatherData | null> {
  const originIcao = requireIcaoCode(flight.origin_icao, "origin", flight.id);
  const destinationIcao = requireIcaoCode(
    flight.destination_icao,
    "destination",
    flight.id
  );

  const focus = determineWeatherFocus(flight);

  // STEP 1: Check if flight has fresh weather data cached
  if (flight.weather_data && flight.weather_updated_at && flight.weather_cache_expires) {
    const expiresAt = new Date(flight.weather_cache_expires);
    const now = new Date();
    
    if (now < expiresAt) {
      console.log(`[Weather] Using fresh flight weather cache (expires ${expiresAt.toISOString()})`);
      return {
        origin: flight.weather_data.origin as WeatherData,
        destination: flight.weather_data.destination as WeatherData,
        concerns: [],
        riskScore: flight.weather_risk_score || 0,
        alertLevel: flight.weather_alert_level || 'green',
        focus,
        lastUpdated: new Date(flight.weather_updated_at),
      };
    } else {
      console.log(`[Weather] Flight weather cache expired (${expiresAt.toISOString()}), refreshing`);
    }
  }

  try {
    // STEP 2: Check WeatherCache (shared across all users)
    const [cachedOrigin, cachedDestination] = await Promise.all([
      checkWeatherCache(originIcao, focus.dataSources.origin),
      checkWeatherCache(destinationIcao, focus.dataSources.destination),
    ]);
    
    // STEP 3: Fetch from API only what's missing/stale
    const [originWeather, destinationWeather] = await Promise.all([
      cachedOrigin || fetchAndCacheAirportWeather(originIcao, focus.dataSources.origin),
      cachedDestination || fetchAndCacheAirportWeather(destinationIcao, focus.dataSources.destination),
    ]);
    
    // Analyze weather concerns
    const concerns = analyzeRouteWeatherConcerns(
      originWeather,
      destinationWeather
    );
    
    // Generate weather summary and calculate risk
    const summary = generateWeatherSummary(concerns);
    
    // Determine alert level based on concerns
    let alertLevel: 'green' | 'yellow' | 'red' = 'green';
    if (summary.hasExtremeConditions) {
      alertLevel = 'red';
    } else if (summary.hasHighRiskConditions) {
      alertLevel = 'yellow';
    }
    
    // Calculate risk score (0-100)
    const riskScore = Math.min(100, Math.round(
      (summary.severityCounts.extreme * 25) +
      (summary.severityCounts.high * 15) +
      (summary.severityCounts.moderate * 8) +
      (summary.severityCounts.low * 3)
    ));
    
    const now = new Date();
    
    return {
      origin: {
        ...originWeather,
        lastUpdated: now,
        expiresAt: new Date(now.getTime() + focus.cacheDuration * 60 * 1000)
      },
      destination: {
        ...destinationWeather,
        lastUpdated: now,
        expiresAt: new Date(now.getTime() + focus.cacheDuration * 60 * 1000)
      },
      concerns,
      riskScore,
      alertLevel,
      focus,
      lastUpdated: now
    };
    
  } catch (error) {
    console.error('Error fetching flight weather:', error);
    return null;
  }
}

// ============================================================================
// Batch Weather Processing
// ============================================================================

/**
 * Fetches weather for multiple flights efficiently
 */
export async function fetchBatchFlightWeather(flights: Flight[]): Promise<Map<string, FlightWeatherData>> {
  const results = new Map<string, FlightWeatherData>();
  
  // Group flights by unique airport pairs to optimize API calls
  const airportPairs = new Map<string, Flight[]>();
  
  flights.forEach(flight => {
    const key = `${flight.origin}-${flight.destination}`;
    if (!airportPairs.has(key)) {
      airportPairs.set(key, []);
    }
    airportPairs.get(key)!.push(flight);
  });
  
  // Process each unique airport pair
  airportPairs.forEach((pairFlights, pairKey) => {
    const [origin, destination] = pairKey.split('-');
    
    // Get representative flight for this pair
    const representativeFlight = pairFlights[0];
    
    fetchFlightWeather(representativeFlight).then(weatherData => {
      if (weatherData) {
        // Apply same weather data to all flights in this pair
        pairFlights.forEach((flight: Flight) => {
          results.set(flight.id, weatherData);
        });
      }
    }).catch(error => {
      console.error(`Error processing weather for pair ${pairKey}:`, error);
    });
  });
  
  return results;
}

// ============================================================================
// Weather Alert System
// ============================================================================

export interface WeatherAlert {
  flightId: string;
  alertLevel: 'yellow' | 'red';
  message: string;
  concerns: any[];
  timestamp: Date;
}

/**
 * Generates weather alerts for flights based on current conditions
 */
export function generateWeatherAlerts(
  flightWeatherData: Map<string, FlightWeatherData>
): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  
  flightWeatherData.forEach((weatherData, flightId) => {
    if (weatherData.alertLevel === 'green') return;
    
    const alert: WeatherAlert = {
      flightId,
      alertLevel: weatherData.alertLevel,
      message: weatherData.alertLevel === 'red' 
        ? 'EXTREME WEATHER CONDITIONS DETECTED'
        : 'Weather concerns identified - review conditions',
      concerns: weatherData.concerns.filter((c: any) => 
        c.severity === 'extreme' || c.severity === 'high'
      ),
      timestamp: new Date()
    };
    
    alerts.push(alert);
  });
  
  return alerts;
}