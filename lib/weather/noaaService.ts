import type {
  PointsResponse,
  ForecastResponse,
  AlertResponse,
} from "@/types/weather";
import { WeatherCache } from "./weatherCache";

function validateCoordinates(lat: number, lon: number): void {
  if (lat < -90 || lat > 90) throw new Error("Invalid latitude");
  if (lon < -180 || lon > 180) throw new Error("Invalid longitude");
}

export class NoaaService {
  private baseUrl = "https://api.weather.gov";
  private cache: WeatherCache;
  private userAgent = "FlightOps-Weather/1.0 (contact@flightops.ai)";

  constructor() {
    this.cache = new WeatherCache();
  }

  async getPoints(lat: number, lon: number): Promise<PointsResponse | null> {
    const cacheKey = `points:${lat},${lon}`;
    const cached = this.cache.get<PointsResponse>(cacheKey);
    if (cached) return cached;

    try {
      validateCoordinates(lat, lon);

      const response = await fetch(`${this.baseUrl}/points/${lat},${lon}`, {
        headers: { "User-Agent": this.userAgent },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as PointsResponse;
      this.cache.set(cacheKey, data, 30 * 60); // 30 min TTL
      return data;
    } catch (err) {
      console.error("[NOAA] Points lookup failed:", err);
      return null;
    }
  }

  async getForecast(
    gridId: string,
    x: number,
    y: number,
    units: "us" | "si" = "us"
  ): Promise<ForecastResponse | null> {
    const cacheKey = `forecast:${gridId};${x},${y};${units}`;
    const cached = this.cache.get<ForecastResponse>(cacheKey);
    if (cached) return cached;

    try {
      const params = new URLSearchParams({ units });
      const response = await fetch(
        `${this.baseUrl}/gridpoints/${gridId}/${x},${y}/forecast?${params}`,
        {
          headers: { "User-Agent": this.userAgent },
          signal: AbortSignal.timeout(10000),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as ForecastResponse;
      this.cache.set(cacheKey, data, 30 * 60); // 30 min TTL
      return data;
    } catch (err) {
      console.error("[NOAA] Forecast fetch failed:", err);
      return null;
    }
  }

  async getAlerts(
    point: { lat: number; lon: number } | { area: string }
  ): Promise<AlertResponse | null> {
    try {
      let url = `${this.baseUrl}/alerts/active`;

      if ("area" in point) {
        url += `?area=${point.area.toUpperCase()}`;
      } else {
        validateCoordinates(point.lat, point.lon);
        url += `?point=${point.lat},${point.lon}`;
      }

      const cacheKey = `alerts:${url}`;
      const cached = this.cache.get<AlertResponse>(cacheKey);
      if (cached) return cached;

      const response = await fetch(url, {
        headers: { "User-Agent": this.userAgent },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as AlertResponse;
      this.cache.set(cacheKey, data, 5 * 60); // 5 min TTL
      return data;
    } catch (err) {
      console.error("[NOAA] Alerts fetch failed:", err);
      return null;
    }
  }

  async getAllActiveAlerts(): Promise<AlertResponse | null> {
    const cacheKey = "alerts:all";
    const cached = this.cache.get<AlertResponse>(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.baseUrl}/alerts/active`, {
        headers: { "User-Agent": this.userAgent },
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as AlertResponse;
      this.cache.set(cacheKey, data, 5 * 60); // 5 min TTL
      return data;
    } catch (err) {
      console.error("[NOAA] All alerts fetch failed:", err);
      return null;
    }
  }
}
