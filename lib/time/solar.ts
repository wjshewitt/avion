import { DateTime } from "luxon";
import { getTimes } from "suncalc";
import { formatDateKey, formatLocalWithTz, formatZulu } from "./format";

export type DaySegment = "night" | "dawn" | "day" | "dusk";

export interface SolarTimes {
  sunriseUtc: Date;
  sunsetUtc: Date;
  dawnUtc: Date;
  duskUtc: Date;
  solarNoonUtc: Date;
}

export interface SolarSnapshot extends SolarTimes {
  sunriseLocal: string;
  sunsetLocal: string;
  dawnLocal: string;
  duskLocal: string;
  timezone: string;
  latitude: number;
  longitude: number;
  computedAt: string;
}

const SOLAR_CACHE = new Map<string, { data: SolarSnapshot; expiresAt: number }>();
const SOLAR_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

export function getSolarTimes(args: {
  latitude: number;
  longitude: number;
  timezone: string;
  date?: Date;
}): SolarSnapshot {
  const { latitude, longitude, timezone } = args;
  const targetDate = args.date
    ? DateTime.fromJSDate(args.date).setZone(timezone)
    : DateTime.now().setZone(timezone);
  const localMidday = targetDate.startOf("day").plus({ hours: 12 });
  const cacheKey = formatDateKey(localMidday.toJSDate(), timezone);

  const cached = SOLAR_CACHE.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const baseDate = localMidday.toJSDate();

  const times = getTimes(baseDate, latitude, longitude);
  const snapshot: SolarSnapshot = {
    sunriseUtc: times.sunrise,
    sunsetUtc: times.sunset,
    dawnUtc: times.dawn,
    duskUtc: times.dusk,
    solarNoonUtc: times.solarNoon,
    sunriseLocal: formatLocalWithTz(times.sunrise, timezone),
    sunsetLocal: formatLocalWithTz(times.sunset, timezone),
    dawnLocal: formatLocalWithTz(times.dawn, timezone),
    duskLocal: formatLocalWithTz(times.dusk, timezone),
    timezone,
    latitude,
    longitude,
    computedAt: formatZulu(new Date()),
  };

  SOLAR_CACHE.set(cacheKey, {
    data: snapshot,
    expiresAt: Date.now() + SOLAR_TTL_MS,
  });

  return snapshot;
}

export function determineDaySegment(now: Date, solar: SolarSnapshot): DaySegment {
  const timestamp = now.getTime();
  if (timestamp < solar.dawnUtc.getTime() || timestamp >= solar.duskUtc.getTime()) {
    return "night";
  }
  if (timestamp >= solar.dawnUtc.getTime() && timestamp < solar.sunriseUtc.getTime()) {
    return "dawn";
  }
  if (timestamp >= solar.sunsetUtc.getTime() && timestamp < solar.duskUtc.getTime()) {
    return "dusk";
  }
  return "day";
}

export function isNightTime(now: Date, solar: SolarSnapshot): boolean {
  const segment = determineDaySegment(now, solar);
  return segment === "night";
}

export function getSolarCacheStats() {
  let hits = 0;
  let misses = 0;
  for (const value of SOLAR_CACHE.values()) {
    if (value.expiresAt > Date.now()) {
      hits += 1;
    } else {
      misses += 1;
    }
  }
  return { hits, misses };
}

export function clearSolarCache() {
  SOLAR_CACHE.clear();
}
