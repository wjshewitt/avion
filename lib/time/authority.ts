import tzLookup from "tz-lookup";
import { DateTime } from "luxon";
import { getAirportCore, type AirportCore } from "@/lib/airports/store";
import { formatLocalWithTz, formatZulu, describeTimezoneOffsets } from "./format";
import { DaySegment, getSolarTimes, determineDaySegment, isNightTime } from "./solar";

export interface AirportTemporalProfile {
  airport: {
    icao: string;
    name: string | null;
    city: string | null;
    country: string | null;
    latitude: number | null;
    longitude: number | null;
    timezone: string;
    timezoneSource: "database" | "computed";
  };
  offsets: {
    standardOffsetMinutes: number;
    dstOffsetMinutes: number | null;
    usesDst: boolean;
    isDstActive: boolean;
  };
  clock: {
    utcNow: string;
    localTime: string;
    localIso: string;
  };
  sun: {
    sunriseUtc: string;
    sunriseLocal: string;
    sunsetUtc: string;
    sunsetLocal: string;
    dawnLocal: string;
    duskLocal: string;
    isDaylight: boolean;
    segment: DaySegment;
  };
  metadata: {
    cacheKey: string;
    computedAt: string;
    warnings?: string[];
  };
}

interface AirportCacheEntry {
  record: AirportCore;
  fetchedAt: number;
}

const AIRPORT_CACHE = new Map<string, AirportCacheEntry>();
const AIRPORT_TTL_MS = 30 * 60 * 1000; // 30 minutes

const PROFILE_METRICS = {
  cacheHits: 0,
  cacheMisses: 0,
};

async function fetchAirportRow(icao: string): Promise<AirportCore | null> {
  const normalized = icao.trim().toUpperCase();
  const cached = AIRPORT_CACHE.get(normalized);
  if (cached && Date.now() - cached.fetchedAt < AIRPORT_TTL_MS) {
    PROFILE_METRICS.cacheHits += 1;
    return cached.record;
  }

  PROFILE_METRICS.cacheMisses += 1;
  const detail = await getAirportCore(normalized);
  if (detail) {
    AIRPORT_CACHE.set(normalized, { record: detail, fetchedAt: Date.now() });
  }
  return detail;
}

function resolveTimezone(row: AirportCore): { timezone: string; source: "database" | "computed"; warnings?: string[] } {
  const warnings: string[] = [];
  if (row.timezone) {
    return { timezone: row.timezone, source: "database" };
  }
  if (row.latitude == null || row.longitude == null) {
    warnings.push("Timezone missing and coordinates unavailable; defaulting to UTC");
    return { timezone: "UTC", source: "computed", warnings };
  }
  try {
    const tz = tzLookup(row.latitude, row.longitude);
    return { timezone: tz, source: "computed" };
  } catch (error) {
    warnings.push("Failed to compute timezone from coordinates; defaulting to UTC");
    console.warn("tz-lookup failed", { icao: row.icao, error });
    return { timezone: "UTC", source: "computed", warnings };
  }
}

function formatLocalIso(date: Date, timezone: string): string {
  const formatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  return formatter.format(date).replace(" ", "T");
}

export async function getAirportTemporalProfile(icao: string): Promise<AirportTemporalProfile | null> {
  const row = await fetchAirportRow(icao);
  if (!row) {
    return null;
  }

  const { timezone, source, warnings: tzWarnings } = resolveTimezone(row);
  const now = new Date();
  const offsets = describeTimezoneOffsets(timezone);

  const missingCoords = row.latitude == null || row.longitude == null;
  const warnings = tzWarnings?.length ? [...tzWarnings] : [];
  if (missingCoords) {
    warnings.push("Latitude/longitude missing; solar data may be inaccurate");
  }

  const latitude = row.latitude ?? 0;
  const longitude = row.longitude ?? 0;
  const solar = getSolarTimes({ latitude, longitude, timezone, date: now });
  const isDaylight = !isNightTime(now, solar);
  const segment = determineDaySegment(now, solar);

  const metadataWarnings = warnings.length ? warnings : undefined;
  const profile: AirportTemporalProfile = {
    airport: {
      icao: row.icao,
      name: row.name ?? null,
      city: row.city ?? null,
      country: row.country ?? null,
      latitude: row.latitude,
      longitude: row.longitude,
      timezone,
      timezoneSource: source,
    },
    offsets: offsets,
    clock: {
      utcNow: formatZulu(now),
      localTime: formatLocalWithTz(now, timezone),
      localIso: formatLocalIso(now, timezone),
    },
    sun: {
      sunriseUtc: solar.sunriseUtc.toISOString(),
      sunriseLocal: solar.sunriseLocal,
      sunsetUtc: solar.sunsetUtc.toISOString(),
      sunsetLocal: solar.sunsetLocal,
      dawnLocal: solar.dawnLocal,
      duskLocal: solar.duskLocal,
      isDaylight,
      segment,
    },
    metadata: {
      cacheKey: `${timezone}:${DateTime.fromJSDate(now).setZone(timezone).toISODate()}`,
      computedAt: formatZulu(now),
      warnings: metadataWarnings,
    },
  };

  return profile;
}

export function getTimeAuthorityMetrics() {
  return { ...PROFILE_METRICS };
}

export function clearAirportCache() {
  AIRPORT_CACHE.clear();
}
