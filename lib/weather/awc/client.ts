import { z } from "zod";
import { WeatherCache } from "@/lib/weather/weatherCache";

const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_RETRIES = 2;
const DEFAULT_BASE_URL = "https://aviationweather.gov/api/data";

export interface AwcClientConfig {
  baseUrl?: string;
  userAgent?: string;
  timeoutMs?: number;
  retries?: number;
}

export interface AwcRequestOptions {
  searchParams?: Record<string, string | number | undefined>;
  timeoutMs?: number;
  signal?: AbortSignal;
  cacheKey?: string;
  cacheTtlSeconds?: number;
  cacheTags?: string[];
  retries?: number;
  schema?: z.ZodTypeAny;
  description?: string;
}

export class AwcClient {
  private readonly baseUrl: string;
  private readonly userAgent: string;
  private readonly timeoutMs: number;
  private readonly retries: number;
  private readonly cache: WeatherCache;

  constructor(
    config: AwcClientConfig = {},
    cacheInstance: WeatherCache = new WeatherCache()
  ) {
    this.baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
    this.userAgent =
      config.userAgent ??
      process.env.AWC_USER_AGENT ??
      "FlightChat-Avion/1.0 (+https://flightchat.ai)";
    this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.retries = config.retries ?? DEFAULT_RETRIES;
    this.cache = cacheInstance;
  }

  async request<TOutput>(
    path: string,
    options: AwcRequestOptions = {}
  ): Promise<TOutput> {
    const {
      searchParams,
      timeoutMs,
      signal,
      cacheKey,
      cacheTags,
      cacheTtlSeconds = 300,
      retries = this.retries,
      schema,
      description,
    } = options;

    if (cacheKey) {
      const cached = this.cache.get<TOutput>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const url = this.buildUrl(path, searchParams);

    const data = await this.fetchWithRetry<TOutput>(url, {
      timeoutMs: timeoutMs ?? this.timeoutMs,
      retries,
      signal,
      schema,
      description,
    });

    if (cacheKey) {
      this.cache.set(cacheKey, data, cacheTtlSeconds, cacheTags);
    }

    return data;
  }

  private buildUrl(
    path: string,
    searchParams?: Record<string, string | number | undefined>
  ): URL {
    const url = new URL(`${this.baseUrl}${path}`);
    if (searchParams) {
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        url.searchParams.set(key, String(value));
      });
    }
    return url;
  }

  private async fetchWithRetry<TOutput>(
    url: URL,
    params: {
      timeoutMs: number;
      retries: number;
      signal?: AbortSignal;
      schema?: z.ZodTypeAny;
      description?: string;
    }
  ): Promise<TOutput> {
    const { timeoutMs, retries, signal, schema, description } = params;

    let attempt = 0;
    let lastError: unknown;

    while (attempt <= retries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        if (signal) {
          signal.addEventListener("abort", () => controller.abort(), {
            once: true,
          });
        }

        const response = await fetch(url, {
          headers: {
            Accept: "application/json",
            "User-Agent": this.userAgent,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(
            `AWC request failed (${response.status} ${response.statusText})` +
              (description ? ` - ${description}` : "")
          );
        }

        const json = (await response.json()) as unknown;

        if (schema) {
          const parsed = schema.safeParse(json);
          if (!parsed.success) {
            throw new Error(
              `AWC schema validation failed${
                description ? ` for ${description}` : ""
              }`
            );
          }
          return parsed.data as TOutput;
        }

        return json as TOutput;
      } catch (error) {
        lastError = error;
        attempt += 1;
        if (attempt > retries) {
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, attempt * 200));
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error("AWC request failed");
  }
}

let sharedAwcClient: AwcClient | null = null;

export function getAwcClient(): AwcClient {
  if (!sharedAwcClient) {
    sharedAwcClient = new AwcClient();
  }
  return sharedAwcClient;
}
