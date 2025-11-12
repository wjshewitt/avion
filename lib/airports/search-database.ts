import { assertServerOnly } from "@/lib/config/airports";
import { createServerSupabase } from "@/lib/supabase/server";
import type { AirportRow } from "@/lib/supabase/types";
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
}

type AirportRowSubset = Pick<
  AirportRow,
  "icao" | "iata" | "name" | "city" | "state" | "country" | "latitude" | "longitude"
>;

function normalizeInput(value: string): string {
  return value.trim();
}

function mapRow(row: AirportRowSubset): AirportSearchRecord {
  return {
    icao: row.icao,
    iata: row.iata ?? null,
    name: row.name,
    city: row.city ?? null,
    state: row.state ?? null,
    country: row.country ?? null,
    latitude: row.latitude ?? null,
    longitude: row.longitude ?? null,
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
  const { data, error } = await supabase
    .from("airports")
    .select("icao, iata, name, city, state, country, latitude, longitude")
    .eq("icao", normalized)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch airport by ICAO", error);
    return null;
  }

  return data ? mapRow(data as AirportRowSubset) : null;
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
  const { data, error } = await supabase
    .from("airports")
    .select("icao, iata, name, city, state, country, latitude, longitude")
    .eq("iata", normalized)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch airport by IATA", error);
    return null;
  }

  return data ? mapRow(data as AirportRowSubset) : null;
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
  const { data, error } = await supabase
    .from("airports")
    .select("icao, iata, name, city, state, country, latitude, longitude")
    .in("icao", normalized);

  if (error) {
    console.error("Failed to fetch airports by ICAO list", error);
    return [];
  }

  const order = new Map<string, number>();
  normalized.forEach((code, idx) => order.set(code, idx));

  return (data as AirportRowSubset[])
    .map((row) => mapRow(row))
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
    const byIcao = await getAirportByIcao(upper);
    if (byIcao) {
      dedupe.set(byIcao.icao, byIcao);
      if (dedupe.size >= limit) {
        return Array.from(dedupe.values());
      }
    }
  }

  if (/^[A-Z]{3}$/.test(upper)) {
    const byIata = await getAirportByIata(upper);
    if (byIata) {
      dedupe.set(byIata.icao, byIata);
      if (dedupe.size >= limit) {
        return Array.from(dedupe.values());
      }
    }
  }

  const { data, error } = await (supabase.rpc as any)("search_airports_fuzzy", {
    search_query: trimmed,
    result_limit: limit,
  });

  if (error) {
    console.error("search_airports_fuzzy RPC failed", error);
    return Array.from(dedupe.values());
  }

  for (const row of data ?? []) {
    const record = mapRow(row as AirportRowSubset);
    if (!dedupe.has(record.icao)) {
      dedupe.set(record.icao, record);
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
    const supabase = await createServerSupabase();
    const icao = (apiResponse.icao_code || apiResponse.ident).toUpperCase();

    // Convert API response to airports table format
    const airportRow: Omit<AirportRow, "updated_at"> = {
      icao,
      iata: apiResponse.iata_code || null,
      name: apiResponse.name,
      city: apiResponse.municipality || null,
      state: apiResponse.region?.name || null,
      country: apiResponse.country?.name || null,
      latitude: apiResponse.latitude_deg || null,
      longitude: apiResponse.longitude_deg || null,
      timezone: null, // AirportDB doesn't provide timezone
      elevation_ft: apiResponse.elevation_ft
        ? parseInt(apiResponse.elevation_ft)
        : null,
      runways: apiResponse.runways
        ? apiResponse.runways.reduce((acc, runway) => {
            acc[runway.le_ident] = {
              length_ft: parseInt(runway.length_ft || "0"),
              width_ft: parseInt(runway.width_ft || "0"),
              surface: runway.surface,
              lighted: runway.lighted === "1",
            };
            return acc;
          }, {} as Record<string, any>)
        : null,
      frequencies: apiResponse.freqs
        ? apiResponse.freqs.reduce((acc, freq) => {
            if (!acc[freq.type]) {
              acc[freq.type] = [];
            }
            acc[freq.type].push({
              description: freq.description,
              frequency_mhz: parseFloat(freq.frequency_mhz),
            });
            return acc;
          }, {} as Record<string, any>)
        : null,
      raw: apiResponse,
    };

    // Upsert into airports table (insert or update if exists)
    const { error } = await supabase
      .from("airports")
      .upsert(airportRow as any, { onConflict: "icao" });

    if (error) {
      console.error(`Failed to cache airport ${icao}:`, error);
      throw error;
    }

    console.log(`Successfully cached airport ${icao} in search database`);
  } catch (error) {
    console.error("Failed to cache airport in search DB:", error);
    // Don't throw - we don't want caching failures to break the search
  }
}
