/**
 * Weather Data Utilities
 * Handles inconsistencies between origin/destination and departure/arrival keys
 */

import type { DecodedMetar, DecodedTaf } from "@/types/checkwx";

export interface NormalizedWeatherData {
  icao?: string;
  metar?: DecodedMetar;
  taf?: DecodedTaf;
  lastUpdated?: string;
  expiresAt?: string;
  isStale?: boolean;
}

export interface ExtractedWeatherData {
  origin: NormalizedWeatherData | null;
  destination: NormalizedWeatherData | null;
}

/**
 * Extracts weather data from flight.weather_data JSONB field
 * Handles both origin/destination and departure/arrival key structures
 * 
 * @param weatherData - The weather_data JSONB field from a flight record
 * @returns Normalized weather data with origin and destination keys
 */
const legacyWarningState = { logged: false };

function ensureLegacyWarningLogged() {
  if (!legacyWarningState.logged) {
    console.warn(
      "[Weather] Found deprecated weather_data keys (departure/arrival). Please migrate to origin/destination format."
    );
    legacyWarningState.logged = true;
  }
}

function normalizeSnapshot(raw: any, fallbackIcao?: string | null): NormalizedWeatherData | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const metar = raw.metar ?? raw.current_metar ?? undefined;
  const taf = raw.taf ?? raw.current_taf ?? undefined;
  const lastUpdated = raw.lastUpdated ?? raw.last_updated ?? null;
  const expiresAt = raw.expiresAt ?? raw.expires_at ?? null;
  const isStale = typeof raw.isStale === "boolean"
    ? raw.isStale
    : expiresAt
      ? new Date(expiresAt).getTime() < Date.now()
      : undefined;
  const icao = raw.icao ?? fallbackIcao ?? undefined;

  if (!metar && !taf) {
    return {
      icao,
      lastUpdated: lastUpdated ?? undefined,
      expiresAt: expiresAt ?? undefined,
      isStale,
    };
  }

  return {
    icao,
    metar,
    taf,
    lastUpdated: lastUpdated ?? undefined,
    expiresAt: expiresAt ?? undefined,
    isStale,
  };
}

export function extractWeatherData(weatherData: any): ExtractedWeatherData {
  if (!weatherData || typeof weatherData !== "object") {
    return { origin: null, destination: null };
  }

  const originRaw = weatherData.origin ?? weatherData.origin_weather ?? null;
  const destinationRaw = weatherData.destination ?? weatherData.destination_weather ?? null;

  const hasLegacyKeys = Boolean(weatherData.departure || weatherData.arrival);

  const normalizedOrigin = originRaw
    ?? (hasLegacyKeys ? weatherData.departure : null);
  const normalizedDestination = destinationRaw
    ?? (hasLegacyKeys ? weatherData.arrival : null);

  if (hasLegacyKeys) {
    ensureLegacyWarningLogged();
  }

  return {
    origin: normalizeSnapshot(normalizedOrigin, weatherData.origin_icao ?? weatherData.originCode ?? null),
    destination: normalizeSnapshot(normalizedDestination, weatherData.destination_icao ?? weatherData.destinationCode ?? null),
  };
}

/**
 * Extracts flight category from weather data
 * Checks both origin/destination and departure/arrival structures
 * 
 * @param weatherData - The weather_data JSONB field from a flight record
 * @param location - Which airport to get flight category for
 * @returns Flight category string or null
 */
export function getFlightCategory(
  weatherData: any,
  location: 'origin' | 'destination' = 'origin'
): string | null {
  const { origin, destination } = extractWeatherData(weatherData);
  const data = location === 'origin' ? origin : destination;
  
  return data?.metar?.flight_category || null;
}

/**
 * Checks if weather data exists and is not empty
 * 
 * @param weatherData - The weather_data JSONB field from a flight record
 * @returns True if weather data exists and has at least one airport with data
 */
export function hasWeatherData(weatherData: any): boolean {
  const { origin, destination } = extractWeatherData(weatherData);
  
  const hasOriginData = origin && (origin.metar || origin.taf);
  const hasDestinationData = destination && (destination.metar || destination.taf);
  
  return !!(hasOriginData || hasDestinationData);
}

/**
 * Checks if weather data is stale
 * 
 * @param weatherData - Weather data object with expiresAt field
 * @returns True if data has expired
 */
export function isWeatherStale(weatherData: NormalizedWeatherData | null): boolean {
  if (!weatherData) return false;
  if (typeof weatherData.isStale === "boolean") {
    return weatherData.isStale;
  }
  if (!weatherData.expiresAt) return false;
  return new Date(weatherData.expiresAt).getTime() < Date.now();
}
