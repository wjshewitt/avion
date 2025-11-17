import { assertServerOnly } from "@/lib/config/airports";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  getAirportByIcao as getAirportDetailByIcao,
  getAirportByIata as getAirportDetailByIata,
  getAirportsByIcaos as getAirportDetailsByIcaos,
  searchAirportDetails as searchAirportDetailRecords,
  type AirportDetail,
} from "@/lib/airports/store";
import { getServerCacheService } from "@/lib/airports/cache-service";
import type { AirportDBResponse } from "@/types/airportdb";

export interface AirportSearchRecord {
  icao: string;
  iata: string | null;
  name: string;
  city: string | null;
  state: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
}

function normalizeInput(value: string): string {
  return value.trim();
}

function mapRow(row: AirportDetail): AirportSearchRecord {
  return {
    icao: row.icao,
    iata: row.iata ?? null,
    name: row.name,
    city: row.city ?? null,
    state: row.state ?? null,
    country: row.country ?? null,
    latitude: row.latitude ?? null,
    longitude: row.longitude ?? null,
    timezone: row.timezone ?? null,
  };
}

export async function getAirportByIcao(
  icao: string
): Promise<AirportSearchRecord | null> {
  assertServerOnly();
  const normalized = normalizeInput(icao).toUpperCase();
  if (!/^[A-Z]{4}$/.test(normalized)) {
    return null;
  }

  const supabase = await createServerSupabase();
  const detail = await getAirportDetailByIcao(normalized, { client: supabase });
  return detail ? mapRow(detail) : null;
}

export async function getAirportByIata(
  iata: string
): Promise<AirportSearchRecord | null> {
  assertServerOnly();
  const normalized = normalizeInput(iata).toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalized)) {
    return null;
  }

  const supabase = await createServerSupabase();
  const detail = await getAirportDetailByIata(normalized, { client: supabase });
  return detail ? mapRow(detail) : null;
}

export async function getAirportsByIcaos(
  icaos: string[]
): Promise<AirportSearchRecord[]> {
  assertServerOnly();

  const normalized = icaos
    .map((code) => normalizeInput(code).toUpperCase())
    .filter((code) => /^[A-Z]{4}$/.test(code));

  if (normalized.length === 0) {
    return [];
  }

  const supabase = await createServerSupabase();
  const details = await getAirportDetailsByIcaos(normalized, { client: supabase });

  const order = new Map<string, number>();
  normalized.forEach((code, idx) => order.set(code, idx));

  return details
    .map((detail) => mapRow(detail))
    .sort((a, b) => {
      const indexA = order.get(a.icao) ?? Number.MAX_SAFE_INTEGER;
      const indexB = order.get(b.icao) ?? Number.MAX_SAFE_INTEGER;
      return indexA - indexB;
    });
}

export async function searchAirports(
  query: string,
  limit = 10
): Promise<AirportSearchRecord[]> {
  assertServerOnly();
  const trimmed = normalizeInput(query);
  if (!trimmed) {
    return [];
  }

  const supabase = await createServerSupabase();
  const upper = trimmed.toUpperCase();
  const dedupe = new Map<string, AirportSearchRecord>();

  if (/^[A-Z]{4}$/.test(upper)) {
    const byIcao = await getAirportDetailByIcao(upper, { client: supabase });
    if (byIcao) {
      dedupe.set(byIcao.icao, mapRow(byIcao));
      if (dedupe.size >= limit) {
        return Array.from(dedupe.values());
      }
    }
  }

  if (/^[A-Z]{3}$/.test(upper)) {
    const byIata = await getAirportDetailByIata(upper, { client: supabase });
    if (byIata) {
      dedupe.set(byIata.icao, mapRow(byIata));
      if (dedupe.size >= limit) {
        return Array.from(dedupe.values());
      }
    }
  }

  const results = await searchAirportDetailRecords(trimmed, limit, { client: supabase });

  for (const record of results) {
    const mapped = mapRow(record);
    if (!dedupe.has(mapped.icao)) {
      dedupe.set(mapped.icao, mapped);
    }
    if (dedupe.size >= limit) {
      break;
    }
  }

  return Array.from(dedupe.values());
}

/**
 * Convert AirportDB API response to AirportSearchRecord format
 */
export function convertApiToSearchRecord(
  apiResponse: AirportDBResponse
): AirportSearchRecord {
  return {
    icao: apiResponse.icao_code || apiResponse.ident,
    iata: apiResponse.iata_code || null,
    name: apiResponse.name,
    city: apiResponse.municipality || null,
    state: apiResponse.region?.name || null,
    country: apiResponse.country?.name || null,
    latitude: apiResponse.latitude_deg || null,
    longitude: apiResponse.longitude_deg || null,
    timezone: (apiResponse as any).timezone || null,
  };
}

/**
 * Cache airport from AirportDB API response into local airports table
 * This ensures future searches find the airport immediately
 */
export async function cacheAirportInSearchDB(
  apiResponse: AirportDBResponse
): Promise<void> {
  assertServerOnly();

  try {
    const icao = (apiResponse.icao_code || apiResponse.ident).toUpperCase();
    const cacheService = getServerCacheService();
    await cacheService.setCachedAirport(icao, apiResponse);
    console.log(`Successfully cached airport ${icao} in airport_cache`);
  } catch (error) {
    console.error("Failed to cache airport in search DB:", error);
    // Don't throw - we don't want caching failures to break the search
  }
}
