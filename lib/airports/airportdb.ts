import { assertServerOnly, getAirportDbToken } from "@/lib/config/airports";
import { createServerSupabase } from "@/lib/supabase/server";
import { getServerCacheService } from "@/lib/airports/cache-service";
import type { AirportRow } from "@/lib/supabase/types";
import type { AirportDBResponse } from "@/types/airportdb";
import tzLookup from "tz-lookup";
import { describeTimezoneOffsets } from "@/lib/time/format";

export interface AirportDataNormalized {
  icao: string;
  iata?: string;
  name: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  elevation_ft?: number;
  runways?: any;
  frequencies?: any;
  // Comprehensive fields
  airport_type?: string;
  continent?: string;
  scheduled_service?: boolean;
  keywords?: string;
  home_link?: string;
  wikipedia_link?: string;
  country_details?: any;
  region_details?: any;
  navaids?: any[];
  station?: any;
  timezone_metadata?: {
    timezone: string | null;
    computedAt: string;
    offsets: ReturnType<typeof describeTimezoneOffsets> | null;
  };
}

export async function fetchAirportByIcao(icao: string): Promise<any> {
  assertServerOnly();
  const token = getAirportDbToken();
  const normalized = icao.trim().toUpperCase();
  const url = `https://airportdb.io/api/v1/airport/${normalized}?apiToken=${token}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  const res = await fetch(url, { cache: "no-store", signal: controller.signal });
  clearTimeout(timer);
  if (!res.ok) throw new Error(`AirportDB ${res.status}`);
  return res.json();
}

export function mapAirportDb(a: any): AirportDataNormalized {
  // Map fields defensively; AirportDB returns strings for some numerics
  const num = (v: any) => (v === null || v === undefined ? undefined : Number(v));
  const latitude = typeof a.latitude_deg === "number" ? a.latitude_deg : num(a.latitude_deg);
  const longitude = typeof a.longitude_deg === "number" ? a.longitude_deg : num(a.longitude_deg);
  let timezone: string | undefined = a.timezone || undefined;
  if (!timezone && typeof latitude === "number" && typeof longitude === "number") {
    try {
      timezone = tzLookup(latitude, longitude);
    } catch {
      timezone = undefined;
    }
  }
  const timezone_metadata = timezone
    ? {
        timezone,
        computedAt: new Date().toISOString(),
        offsets: describeTimezoneOffsets(timezone),
      }
    : undefined;

  return {
    icao: a.ident || a.icao_code,
    iata: a.iata_code || undefined,
    name: a.name,
    city: a.municipality || undefined,
    state: a.region?.local_code || a.iso_region || undefined,
    country: a.country?.name || a.iso_country || undefined,
    latitude,
    longitude,
    timezone,
    elevation_ft: typeof a.elevation_ft === "number" ? a.elevation_ft : num(a.elevation_ft),
    runways: a.runways || [],
    frequencies: a.freqs || [],
    airport_type: a.type || undefined,
    continent: a.continent || undefined,
    scheduled_service: a.scheduled_service === "yes",
    keywords: a.keywords || undefined,
    home_link: a.home_link || undefined,
    wikipedia_link: a.wikipedia_link || undefined,
    country_details: a.country || undefined,
    region_details: a.region || undefined,
    navaids: a.navaids || [],
    station: a.station || undefined,
    timezone_metadata,
  };
}

export async function upsertAirport(
  airport: AirportDataNormalized,
  raw: AirportDBResponse
): Promise<AirportRow> {
  assertServerOnly();
  const cacheService = getServerCacheService();
  const enrichedRaw = {
    ...(raw as Record<string, any>),
    airport_type: airport.airport_type,
    continent: airport.continent,
    scheduled_service: airport.scheduled_service,
    keywords: airport.keywords,
    home_link: airport.home_link,
    wikipedia_link: airport.wikipedia_link,
    country_details: airport.country_details,
    region_details: airport.region_details,
    navaids: airport.navaids,
    station: airport.station,
    timezone_metadata:
      airport.timezone_metadata ?? (raw as Record<string, any>)?.timezone_metadata ?? null,
  };

  await cacheService.setCachedAirport(airport.icao, enrichedRaw as any);

  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("airports")
    .select("*")
    .eq("icao", airport.icao)
    .maybeSingle();

  if (error || !data) {
    console.error(`Failed to read airport ${airport.icao} after cache upsert`, error);
    throw error || new Error(`Airport ${airport.icao} not returned after upsert`);
  }

  return data as AirportRow;
}

export async function getOrRefreshAirport(icao: string, maxAgeDays = 7, force = false): Promise<AirportRow> {
  assertServerOnly();
  const supabase = await createServerSupabase();
  const normalized = icao.trim().toUpperCase();

  // Try read
  const { data: existing } = await (supabase as any)
    .from("airports")
    .select("*")
    .eq("icao", normalized)
    .single();

  const isFresh = (row: AirportRow) => {
    const updated = new Date(row.updated_at).getTime();
    const ageMs = Date.now() - updated;
    return ageMs <= maxAgeDays * 24 * 60 * 60 * 1000;
  };

  if (existing && !force && isFresh(existing as AirportRow)) {
    return existing as AirportRow;
  }

  // Fetch from AirportDB and upsert
  const raw = await fetchAirportByIcao(normalized);
  const mapped = mapAirportDb(raw);
  const saved = await upsertAirport(mapped, raw);
  return saved;
}
