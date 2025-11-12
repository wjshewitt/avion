import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

export type WeatherDataset =
  | "metar_decoded"
  | "metar_recent"
  | "taf_decoded"
  | "sigmet_active"
  | "gairmet_active";

export type WeatherRequestMode = "full" | "lite";

export interface WeatherCacheKey {
  icao: string;
  dataset: WeatherDataset;
  mode?: WeatherRequestMode;
}

export interface WeatherCacheMetadata {
  observed?: string | null;
  validFrom?: string | null;
  validTo?: string | null;
  retrievedAt: string;
  source: string;
  mode: WeatherRequestMode;
}

export interface WeatherCacheRecord<T = unknown> {
  key: WeatherCacheKey;
  data: T;
  metadata: WeatherCacheMetadata;
  expiresAt: string;
  staleAt: string;
  dataStalenessMinutes: number;
  isStale: boolean;
  needsRefreshAt?: string;
}

export interface WeatherCacheFetchResult<T = unknown> {
  data: T;
  metadata: WeatherCacheMetadata;
  ttlMinutes: number;
  staleMinutes?: number;
  needsRefreshMinutes?: number;
}

export interface WeatherCacheFetchOptions<T = unknown> {
  fetcher: () => Promise<WeatherCacheFetchResult<T>>;
  allowStaleReturn?: boolean;
}

const DEFAULT_RETRY_ATTEMPTS = 2;
const DEFAULT_TIMEOUT_MS = 5000;
const MAX_CONCURRENT_FETCHES = 5;

function toKeyString(key: WeatherCacheKey): string {
  const mode = key.mode ?? "full";
  return `${key.icao.toUpperCase()}::${key.dataset}::${mode}`;
}

function computeDataStaleness(retrievedAt: string | null | undefined): number {
  if (!retrievedAt) {
    return Number.POSITIVE_INFINITY;
  }

  const retrieved = new Date(retrievedAt).getTime();
  if (Number.isNaN(retrieved)) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.max(0, Math.floor((Date.now() - retrieved) / 60000));
}

class SimpleLimiter {
  private queue: Array<() => void> = [];
  private active = 0;

  constructor(private readonly limit: number) {}

  async run<T>(task: () => Promise<T>): Promise<T> {
    if (this.active >= this.limit) {
      await new Promise<void>((resolve) => this.queue.push(resolve));
    }

    this.active += 1;

    try {
      return await task();
    } finally {
      this.active -= 1;
      const next = this.queue.shift();
      if (next) {
        next();
      }
    }
  }
}

const fetchLimiter = new SimpleLimiter(MAX_CONCURRENT_FETCHES);

async function retryWithJitter<T>(fn: () => Promise<T>, attempts = DEFAULT_RETRY_ATTEMPTS): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= attempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === attempts) {
        break;
      }

      const baseDelay = 300 * 2 ** attempt;
      const jitter = Math.random() * 200;
      await new Promise((resolve) => setTimeout(resolve, Math.min(baseDelay + jitter, DEFAULT_TIMEOUT_MS)));
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Failed after retries");
}

type WeatherCacheRow = Database["public"]["Tables"]["weather_cache"]["Row"];

export class WeatherCache {
  private adminClient: ReturnType<typeof createAdminClient> | null;
  private inFlight = new Map<string, Promise<WeatherCacheRecord | null>>();

  constructor() {
    this.adminClient = this.initAdminClient();
  }

  private initAdminClient(): ReturnType<typeof createAdminClient> | null {
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return null;
      }
      return createAdminClient();
    } catch (error) {
      console.error("[WeatherCache] Failed to initialize Supabase admin client", error);
      return null;
    }
  }

  private buildRecord<T>(key: WeatherCacheKey, payload: WeatherCacheFetchResult<T>): WeatherCacheRecord<T> {
    const ttlMinutes = Math.max(1, payload.ttlMinutes);
    const staleMinutes = Math.max(0, payload.staleMinutes ?? Math.floor(ttlMinutes / 2));
    const expiresAt = new Date(Date.now() + ttlMinutes * 60000).toISOString();
    const staleAt = new Date(Date.now() + staleMinutes * 60000).toISOString();
    const needsRefreshAt = payload.needsRefreshMinutes
      ? new Date(Date.now() + payload.needsRefreshMinutes * 60000).toISOString()
      : undefined;

    return {
      key,
      data: payload.data,
      metadata: payload.metadata,
      expiresAt,
      staleAt,
      needsRefreshAt,
      isStale: false,
      dataStalenessMinutes: computeDataStaleness(payload.metadata.retrievedAt),
    };
  }

  private parseRow<T>(key: WeatherCacheKey, row: WeatherCacheRow | null): WeatherCacheRecord<T> | null {
    if (!row) {
      return null;
    }

    const payload = row.weather_data as unknown as WeatherCacheRecord<T> | null;
    if (!payload) {
      return null;
    }

    const expiresAt = row.expires_at ?? payload.expiresAt;
    const staleAt = row.stale_at ?? payload.staleAt;

    return {
      ...payload,
      key,
      expiresAt,
      staleAt,
      needsRefreshAt: row.needs_refresh_at ?? payload.needsRefreshAt,
      isStale: Date.now() >= (staleAt ? new Date(staleAt).getTime() : Date.now()),
      dataStalenessMinutes: computeDataStaleness(payload.metadata?.retrievedAt),
    };
  }

  private async readRow<T>(key: WeatherCacheKey): Promise<WeatherCacheRecord<T> | null> {
    if (!this.adminClient) {
      return null;
    }

    const keyString = toKeyString(key);

    try {
      const { data, error } = await this.adminClient
        .from("weather_cache")
        .select("cache_key, weather_data, expires_at, stale_at, needs_refresh_at")
        .eq("cache_key", keyString)
        .maybeSingle();

      if (error) {
        if (error.code && ["PGRST116", "42703"].includes(error.code)) {
          return this.readLegacyRecord<T>(key);
        }
        console.warn("[WeatherCache] Supabase read error", error);
        return null;
      }

      if (!data) {
        return this.readLegacyRecord<T>(key);
      }

      return this.parseRow<T>(key, data as WeatherCacheRow);
    } catch (error) {
      console.error("[WeatherCache] Failed to read from Supabase", error);
      return null;
    }
  }

  private async readLegacyRecord<T>(key: WeatherCacheKey): Promise<WeatherCacheRecord<T> | null> {
    if (!this.adminClient) {
      return null;
    }

    const { dataset, mode = "full" } = key;
    const compositeIcao = key.icao.toUpperCase();
    const datasetKey = `${dataset}::${mode}`;

    const { data, error } = await this.adminClient
      .from("weather_cache")
      .select("weather_data, expires_at, stale_at, needs_refresh_at")
      .eq("icao_code", compositeIcao)
      .eq("data_type", datasetKey)
      .maybeSingle();

    if (error || !data) {
      if (error) {
        console.warn("[WeatherCache] Legacy read error", error);
      }
      return null;
    }

    return this.parseRow<T>(key, data as WeatherCacheRow);
  }

  async read<T>(key: WeatherCacheKey): Promise<WeatherCacheRecord<T> | null> {
    return this.readRow<T>(key);
  }

  async write<T>(record: WeatherCacheRecord<T>): Promise<void> {
    if (!this.adminClient) {
      return;
    }

    const keyString = toKeyString(record.key);

    const payload: Database["public"]["Tables"]["weather_cache"]["Insert"] = {
      cache_key: keyString,
      icao_code: record.key.icao.toUpperCase(),
      data_type: `${record.key.dataset}::${record.key.mode ?? "full"}`,
      weather_data: record as unknown as Record<string, any>,
      expires_at: record.expiresAt,
      stale_at: record.staleAt,
      needs_refresh_at: record.needsRefreshAt ?? null,
    };

    try {
      const { error } = await (this.adminClient.from("weather_cache") as any)
        .upsert(payload, {
          onConflict: "icao_code,data_type",
        });

      if (error) {
        if (error.code && ["23505", "42703", "42P10"].includes(error.code)) {
          console.warn("[WeatherCache] Known constraint error, attempting legacy write:", error.message);
          await this.writeLegacy(record);
          return;
        }
        console.warn("[WeatherCache] Supabase write error", error);
      }
    } catch (error) {
      console.error("[WeatherCache] Failed to write to Supabase", error);
      await this.writeLegacy(record);
    }
  }

  private async writeLegacy<T>(record: WeatherCacheRecord<T>): Promise<void> {
    if (!this.adminClient) {
      return;
    }

    try {
      const keyString = toKeyString(record.key);
      const legacyPayload: Database["public"]["Tables"]["weather_cache"]["Insert"] = {
        cache_key: keyString,
        icao_code: record.key.icao.toUpperCase(),
        data_type: `${record.key.dataset}::${record.key.mode ?? "full"}`,
        weather_data: record as unknown as Record<string, any>,
        expires_at: record.expiresAt,
        stale_at: record.staleAt,
        needs_refresh_at: record.needsRefreshAt ?? null,
      };

      await (this.adminClient.from("weather_cache") as any)
        .upsert(legacyPayload, {
          onConflict: "icao_code,data_type",
        });
    } catch (error) {
      console.error("[WeatherCache] Legacy write failed", error);
    }
  }

  private async runFetch<T>(key: WeatherCacheKey, options: WeatherCacheFetchOptions<T>): Promise<WeatherCacheRecord<T> | null> {
    const keyString = toKeyString(key);
    const existing = this.inFlight.get(keyString);
    if (existing) {
      return existing as Promise<WeatherCacheRecord<T> | null>;
    }

    const task = fetchLimiter.run(async () => {
      const result = await retryWithJitter(options.fetcher);
      const record = this.buildRecord(key, result);

      try {
        await this.write(record);
      } catch (error) {
        console.error(`[WeatherCache] Failed to persist record for ${keyString}`, error);
      }

      console.log(`[WeatherCache] REFRESH ${keyString} (expires ${record.expiresAt})`);

      return record;
    });

    this.inFlight.set(keyString, task);

    try {
      return await task;
    } finally {
      this.inFlight.delete(keyString);
    }
  }

  private async refreshInBackground<T>(key: WeatherCacheKey, options: WeatherCacheFetchOptions<T>): Promise<void> {
    try {
      await this.runFetch(key, options);
    } catch (error) {
      console.warn(`[WeatherCache] Background refresh failed for ${toKeyString(key)}`, error);
    }
  }

  async getOrFetch<T>(key: WeatherCacheKey, options: WeatherCacheFetchOptions<T>): Promise<WeatherCacheRecord<T> | null> {
    const keyString = toKeyString(key);
    const existing = await this.read<T>(key);
    const now = Date.now();
    const expiresAt = existing?.expiresAt ? new Date(existing.expiresAt).getTime() : 0;

    if (existing && now < expiresAt && !existing.isStale) {
      console.log(`[WeatherCache] HIT ${keyString}`);
      return existing;
    }

    const allowStale = options.allowStaleReturn ?? true;

    if (existing && allowStale) {
      // serve stale and refresh in background
      if (!existing.isStale) {
        console.warn(`[WeatherCache] Serving near-expiry data for ${keyString}; refreshing async`);
      } else {
        console.warn(`[WeatherCache] Serving stale data for ${keyString}; refreshing async`);
      }
      void this.refreshInBackground(key, options);
      return existing;
    }

    return this.runFetch(key, options);
  }

  async markStale(key: WeatherCacheKey): Promise<void> {
    if (!this.adminClient) {
      return;
    }

    const keyString = toKeyString(key);
    try {
      const nowIso = new Date().toISOString();
      const { error } = await (this.adminClient.from("weather_cache") as any)
        .update({ stale_at: nowIso })
        .eq("cache_key", keyString);

      if (error) {
        console.warn(`[WeatherCache] markStale failed for ${keyString}`, error);
      }
    } catch (error) {
      console.error(`[WeatherCache] markStale exception for ${keyString}`, error);
    }
  }
}

export const weatherCache = new WeatherCache();
