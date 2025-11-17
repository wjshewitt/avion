import type { SupabaseClient } from "@supabase/supabase-js";

import { createServerSupabase } from "@/lib/supabase/server";
import type { AirportRow, Database } from "@/lib/supabase/types";

type DbClient = SupabaseClient<Database>;

export interface AirportStoreOptions {
  client?: DbClient;
}

export type AirportCore = {
  icao: string;
  iata: string | null;
  name: string;
  city: string | null;
  state: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  elevation_ft: number | null;
  updated_at: string | null;
};

export type AirportDetail = AirportCore & {
  runways: any[] | Record<string, any> | null;
  frequencies: any[] | Record<string, any> | null;
  raw: Record<string, any> | null;
  fbo_overview: string | null;
  intel_updated_at: string | null;
};

const SELECT_COLUMNS =
  "icao, iata, name, city, state, country, latitude, longitude, timezone, elevation_ft, runways, frequencies, raw, fbo_overview, intel_updated_at, updated_at";

const ICAO_REGEX = /^[A-Z0-9]{4}$/;
const IATA_REGEX = /^[A-Z0-9]{3}$/;

async function resolveClient(options?: AirportStoreOptions): Promise<DbClient> {
  if (options?.client) {
    return options.client;
  }
  return createServerSupabase();
}

function mapRowToDetail(row: AirportRow): AirportDetail {
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
    elevation_ft: row.elevation_ft ?? null,
    runways: (row.runways as any) ?? null,
    frequencies: (row.frequencies as any) ?? null,
    raw: (row.raw as Record<string, any> | null) ?? null,
    fbo_overview: row.fbo_overview ?? null,
    intel_updated_at: row.intel_updated_at ?? null,
    updated_at: row.updated_at ?? null,
  };
}

function toCore(detail: AirportDetail): AirportCore {
  return {
    icao: detail.icao,
    iata: detail.iata,
    name: detail.name,
    city: detail.city,
    state: detail.state,
    country: detail.country,
    latitude: detail.latitude,
    longitude: detail.longitude,
    timezone: detail.timezone,
    elevation_ft: detail.elevation_ft,
    updated_at: detail.updated_at,
  };
}

function normalizeIcao(value: string): string {
  return value.trim().toUpperCase();
}

function normalizeIata(value: string): string {
  return value.trim().toUpperCase();
}

export async function getAirportByIcao(
  icao: string,
  options?: AirportStoreOptions
): Promise<AirportDetail | null> {
  const normalized = normalizeIcao(icao);
  if (!ICAO_REGEX.test(normalized)) {
    return null;
  }

  const supabase = await resolveClient(options);
  const { data, error } = await supabase
    .from("airports")
    .select(SELECT_COLUMNS)
    .eq("icao", normalized)
    .maybeSingle();

  if (error) {
    console.error("AirportStore: failed to fetch ICAO", { icao: normalized, error });
    return null;
  }

  return data ? mapRowToDetail(data as AirportRow) : null;
}

export async function getAirportCore(
  icao: string,
  options?: AirportStoreOptions
): Promise<AirportCore | null> {
  const detail = await getAirportByIcao(icao, options);
  return detail ? toCore(detail) : null;
}

export async function getAirportByIata(
  iata: string,
  options?: AirportStoreOptions
): Promise<AirportDetail | null> {
  const normalized = normalizeIata(iata);
  if (!IATA_REGEX.test(normalized)) {
    return null;
  }

  const supabase = await resolveClient(options);
  const { data, error } = await supabase
    .from("airports")
    .select(SELECT_COLUMNS)
    .eq("iata", normalized)
    .maybeSingle();

  if (error) {
    console.error("AirportStore: failed to fetch IATA", { iata: normalized, error });
    return null;
  }

  return data ? mapRowToDetail(data as AirportRow) : null;
}

export async function getAirportsByIcaos(
  icaos: string[],
  options?: AirportStoreOptions
): Promise<AirportDetail[]> {
  const normalized = Array.from(
    new Set(
      icaos
        .map((code) => normalizeIcao(code))
        .filter((code) => ICAO_REGEX.test(code))
    )
  );

  if (normalized.length === 0) {
    return [];
  }

  const supabase = await resolveClient(options);
  const { data, error } = await supabase
    .from("airports")
    .select(SELECT_COLUMNS)
    .in("icao", normalized);

  if (error || !data) {
    if (error) {
      console.error("AirportStore: failed to fetch ICAO batch", error);
    }
    return [];
  }

  const ordering = new Map<string, number>();
  normalized.forEach((code, idx) => ordering.set(code, idx));

  return (data as AirportRow[])
    .map(mapRowToDetail)
    .sort((a, b) => {
      const indexA = ordering.get(a.icao) ?? Number.MAX_SAFE_INTEGER;
      const indexB = ordering.get(b.icao) ?? Number.MAX_SAFE_INTEGER;
      return indexA - indexB;
    });
}

export async function searchAirportDetails(
  query: string,
  limit = 20,
  options?: AirportStoreOptions
): Promise<AirportDetail[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const supabase = await resolveClient(options);
  const normalized = trimmed.toUpperCase();
  const { data, error } = await supabase
    .from("airports")
    .select(SELECT_COLUMNS)
    .or(
      `icao.ilike.${normalized}%,iata.ilike.${normalized}%,name.ilike.%${normalized}%,city.ilike.%${normalized}%`
    )
    .limit(limit);

  if (error || !data) {
    if (error) {
      console.error("AirportStore: search failed", { query, error });
    }
    return [];
  }

  return (data as AirportRow[]).map(mapRowToDetail);
}

export async function searchAirports(
  query: string,
  limit = 20,
  options?: AirportStoreOptions
): Promise<AirportCore[]> {
  const details = await searchAirportDetails(query, limit, options);
  return details.map(toCore);
}

export async function airportExists(
  icao: string,
  options?: AirportStoreOptions
): Promise<boolean> {
  const normalized = normalizeIcao(icao);
  if (!ICAO_REGEX.test(normalized)) {
    return false;
  }

  const supabase = await resolveClient(options);
  const { data } = await supabase
    .from("airports")
    .select("icao")
    .eq("icao", normalized)
    .maybeSingle();

  return !!data;
}
