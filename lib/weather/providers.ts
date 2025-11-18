import { getCheckWXClient } from "@/lib/weather/checkwx-client";
import { getAwcWeatherService } from "@/lib/weather/awc";
import type { DecodedMetar, DecodedTaf } from "@/types/checkwx";
import type { ProviderTaggedMetar, ProviderTaggedTaf } from "@/types/weather";

const US_PREFIXES = ["K", "P", "T", "C", "M"];

function eligibleForAwcFallback(icao: string): boolean {
  return US_PREFIXES.some((prefix) => icao.startsWith(prefix));
}

export interface MetarFallbackResult {
  primary?: DecodedMetar[];
  fallback?: ProviderTaggedMetar[];
  source: "checkwx" | "awc-fallback";
}

export interface TafFallbackResult {
  primary?: DecodedTaf[];
  fallback?: ProviderTaggedTaf[];
  source: "checkwx" | "awc-fallback";
}

export async function fetchMetarWithFallback(
  icaos: string[]
): Promise<MetarFallbackResult> {
  const client = getCheckWXClient();
  try {
    const primary = await client.getMetar(icaos);
    if (primary.length) {
      return { primary, source: "checkwx" };
    }
  } catch (error) {
    console.warn("CheckWX METAR fetch failed, attempting AWC fallback", error);
  }

  const fallbackIcaos = icaos.filter(eligibleForAwcFallback);
  if (!fallbackIcaos.length) {
    return { primary: [], source: "checkwx" };
  }

  const awc = getAwcWeatherService();
  const fallback = await awc.getMetar(fallbackIcaos);
  return { fallback, source: "awc-fallback" };
}

export async function fetchTafWithFallback(
  icaos: string[]
): Promise<TafFallbackResult> {
  const client = getCheckWXClient();
  try {
    const primary = await client.getTaf(icaos);
    if (primary.length) {
      return { primary, source: "checkwx" };
    }
  } catch (error) {
    console.warn("CheckWX TAF fetch failed, attempting AWC fallback", error);
  }

  const fallbackIcaos = icaos.filter(eligibleForAwcFallback);
  if (!fallbackIcaos.length) {
    return { primary: [], source: "checkwx" };
  }

  const awc = getAwcWeatherService();
  const fallback = await awc.getTaf(fallbackIcaos);
  return { fallback, source: "awc-fallback" };
}
