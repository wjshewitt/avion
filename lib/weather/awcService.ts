import type {
  MetarData,
  MetarResponse,
  TafData,
  TafResponse,
  SigmetData,
  SigmetResponse,
} from "@/types/weather";
import { WeatherCache } from "./weatherCache";

export class AwcService {
  private baseUrl = "https://aviationweather.gov/api/data";
  private cache: WeatherCache;

  constructor() {
    this.cache = new WeatherCache();
  }

  async getMETAR(
    icaoCodes: string[],
    hours: number = 0
  ): Promise<MetarData[]> {
    const cacheKey = `metar:${icaoCodes.join(",")};${hours}`;
    const cached = this.cache.get<MetarData[]>(cacheKey);
    if (cached) return cached;

    try {
      const params = new URLSearchParams({
        ids: icaoCodes.join(","),
        format: "json",
        hours: String(hours),
      });

      const response = await fetch(`${this.baseUrl}/metar?${params}`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as MetarResponse;
      const results = data.results || [];
      this.cache.set(cacheKey, results, 10 * 60); // 10 min TTL
      return results;
    } catch (err) {
      console.error("[AWC] METAR fetch failed:", err);
      return [];
    }
  }

  async getTAF(icaoCodes: string[], hours: number = 24): Promise<TafData[]> {
    const cacheKey = `taf:${icaoCodes.join(",")};${hours}`;
    const cached = this.cache.get<TafData[]>(cacheKey);
    if (cached) return cached;

    try {
      const params = new URLSearchParams({
        ids: icaoCodes.join(","),
        format: "json",
        hours: String(hours),
      });

      const response = await fetch(`${this.baseUrl}/taf?${params}`, {
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as TafResponse;
      const results = data.results || [];
      this.cache.set(cacheKey, results, 10 * 60);
      return results;
    } catch (err) {
      console.error("[AWC] TAF fetch failed:", err);
      return [];
    }
  }

  async getSIGMET(): Promise<SigmetData[]> {
    const cacheKey = "sigmet:all";
    const cached = this.cache.get<SigmetData[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.baseUrl}/sigmet?format=json`, {
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as SigmetResponse;
      const results = data.results || [];
      this.cache.set(cacheKey, results, 5 * 60); // 5 min TTL
      return results;
    } catch (err) {
      console.error("[AWC] SIGMET fetch failed:", err);
      return [];
    }
  }
}
