import { getCheckWXClient } from "@/lib/weather/checkwx-client";
import { weatherCache, type WeatherCacheRecord } from "@/lib/weather/cache/index";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database, Flight } from "@/lib/supabase/types";
import { determineFlightPhase, aggregateRisk } from "@/lib/weather/risk/aggregation";
import type { AirportRiskParams, FlightRiskParams, RiskInputs } from "@/lib/weather/risk/types";
import { assessSurfaceWind } from "@/lib/weather/risk/factors/surfaceWind";
import { assessVisibility } from "@/lib/weather/risk/factors/visibility";
import { assessCeilingClouds } from "@/lib/weather/risk/factors/ceilingClouds";
import { assessPrecipitation } from "@/lib/weather/risk/factors/precipitation";
import { assessTrendStability } from "@/lib/weather/risk/factors/trendStability";
import { buildMessaging } from "@/lib/weather/risk/messaging";
import type { DecodedMetar, DecodedTaf } from "@/types/checkwx";

type Mode = "lite" | "full";

function ttlFor(dataset: string, meta: { validTo?: string | null; retrievedAt?: string | null }): { ttlMin: number; staleMin: number } {
  switch (dataset) {
    case "metar_decoded":
      return { ttlMin: 15, staleMin: 20 };
    case "taf_decoded": {
      const minTtl = 30;
      if (meta.validTo) {
        const mins = Math.max(minTtl, Math.round((new Date(meta.validTo).getTime() - Date.now()) / 60000));
        return { ttlMin: mins, staleMin: Math.max(mins + 30, 90) };
      }
      return { ttlMin: minTtl, staleMin: 90 };
    }
    default:
      return { ttlMin: 20, staleMin: 30 };
  }
}

function normalizeDecodedMetar(raw: unknown): DecodedMetar | undefined {
  if (!raw) return undefined;
  if (Array.isArray(raw)) {
    return normalizeDecodedMetar(raw[0]);
  }
  if (typeof raw === "object" && raw !== null) {
    const withData = raw as Record<string, unknown>;
    if (Array.isArray(withData.data)) {
      return normalizeDecodedMetar(withData.data[0]);
    }
    if (typeof withData.data === "object" && withData.data !== null && Array.isArray((withData.data as any).data)) {
      return normalizeDecodedMetar((withData.data as any).data[0]);
    }
  }
  return raw as DecodedMetar;
}

function normalizeDecodedTaf(raw: unknown): DecodedTaf | undefined {
  if (!raw) return undefined;
  if (Array.isArray(raw)) {
    return normalizeDecodedTaf(raw[0]);
  }
  if (typeof raw === "object" && raw !== null) {
    const withData = raw as Record<string, unknown>;
    if (Array.isArray(withData.data)) {
      return normalizeDecodedTaf(withData.data[0]);
    }
    if (typeof withData.data === "object" && withData.data !== null && Array.isArray((withData.data as any).data)) {
      return normalizeDecodedTaf((withData.data as any).data[0]);
    }
  }
  return raw as DecodedTaf;
}

function latestTimestamp(values: Array<string | null | undefined>): string | undefined {
  const timestamps = values
    .filter((value): value is string => typeof value === "string")
    .map((value) => new Date(value).getTime())
    .filter((ms) => !Number.isNaN(ms));

  if (!timestamps.length) {
    return undefined;
  }

  return new Date(Math.max(...timestamps)).toISOString();
}

function earliestTimestamp(values: Array<string | null | undefined>): string | undefined {
  const timestamps = values
    .filter((value): value is string => typeof value === "string")
    .map((value) => new Date(value).getTime())
    .filter((ms) => !Number.isNaN(ms));

  if (!timestamps.length) {
    return undefined;
  }

  return new Date(Math.min(...timestamps)).toISOString();
}

export interface AirfieldWeatherSnapshotResult {
  metar?: DecodedMetar;
  taf?: DecodedTaf;
  metarRecord: WeatherCacheRecord<DecodedMetar> | null;
  tafRecord: WeatherCacheRecord<DecodedTaf> | null;
  weatherData: {
    icao: string;
    metar?: DecodedMetar;
    taf?: DecodedTaf;
    lastUpdated?: string;
    expiresAt?: string;
    isStale: boolean;
  };
  isStale: boolean;
  dataStalenessMinutes: number;
}

export async function getAirfieldWeatherSnapshot(icao: string, mode: Mode = "full"): Promise<AirfieldWeatherSnapshotResult> {
  const normalizedIcao = icao.toUpperCase();
  const client = getCheckWXClient();

  let metarRecord: WeatherCacheRecord<DecodedMetar> | null = null;
  let tafRecord: WeatherCacheRecord<DecodedTaf> | null = null;

  const metarKey = { icao: normalizedIcao, dataset: "metar_decoded" as const, mode };
  const tafKey = { icao: normalizedIcao, dataset: "taf_decoded" as const, mode };

  try {
    metarRecord = await weatherCache.getOrFetch(metarKey, {
      fetcher: async () => {
        const metars = await client.getMetar([normalizedIcao]);
        const metar = metars[0];
        if (!metar) {
          throw new Error(`No METAR returned for ${normalizedIcao}`);
        }

        const metadata = {
          observed: metar.observed ?? null,
          validFrom: null,
          validTo: null,
          retrievedAt: new Date().toISOString(),
          source: "checkwx",
          mode,
        } as const;
        const { ttlMin, staleMin } = ttlFor("metar_decoded", metadata);

        return {
          data: metar,
          metadata,
          ttlMinutes: ttlMin,
          staleMinutes: staleMin,
        };
      },
    });
  } catch (error) {
    console.error(`[Weather] METAR fetch failed for ${normalizedIcao}`, error);
  }

  if (mode === "full") {
    try {
      tafRecord = await weatherCache.getOrFetch(tafKey, {
        fetcher: async () => {
          const tafs = await client.getTaf([normalizedIcao]);
          const taf = tafs[0];
          if (!taf) {
            console.warn(`No TAF available for ${normalizedIcao} - this is normal for some airports`);
            // Return a cache result with null data and short TTL
            return {
              data: null as any, // TAF not available
              metadata: {
                observed: null,
                validFrom: null,
                validTo: null,
                retrievedAt: new Date().toISOString(),
                source: "checkwx",
                mode,
              } as const,
              ttlMinutes: 30, // Short TTL for rechecking
              staleMinutes: 15,
            };
          }

          const metadata = {
            observed: null,
            validFrom: taf.valid_time_from ?? taf.timestamp?.from ?? null,
            validTo: taf.valid_time_to ?? taf.timestamp?.to ?? null,
            retrievedAt: new Date().toISOString(),
            source: "checkwx",
            mode,
          } as const;
          const { ttlMin, staleMin } = ttlFor("taf_decoded", metadata);

          return {
            data: taf,
            metadata,
            ttlMinutes: ttlMin,
            staleMinutes: staleMin,
          };
        },
      });
    } catch (error) {
      console.error(`[Weather] TAF fetch failed for ${normalizedIcao}`, error);
    }
  }

  const metar = normalizeDecodedMetar(metarRecord?.data);
  const taf = normalizeDecodedTaf(tafRecord?.data);

  const isStale = Boolean(metarRecord?.isStale || tafRecord?.isStale);
  const dataStalenessMinutes = Math.max(metarRecord?.dataStalenessMinutes ?? 0, tafRecord?.dataStalenessMinutes ?? 0);

  const weatherData = {
    icao: normalizedIcao,
    metar: metar ?? undefined,
    taf: taf ?? undefined,
    lastUpdated: latestTimestamp([
      metar?.observed ?? null,
      taf?.issued ?? null,
      metarRecord?.metadata?.retrievedAt ?? null,
      tafRecord?.metadata?.retrievedAt ?? null,
    ]),
    expiresAt: earliestTimestamp([
      metarRecord?.expiresAt ?? null,
      tafRecord?.expiresAt ?? null,
    ]),
    isStale,
  };

  return {
    metar,
    taf,
    metarRecord,
    tafRecord,
    weatherData,
    isStale,
    dataStalenessMinutes,
  };
}

export async function getAirportRisk(params: AirportRiskParams) {
  const { icao, schedule, mode = "full" } = params;
  const now = params.now ?? new Date();
  const normalizedIcao = icao.toUpperCase();

  try {
    const weatherSnapshot = await getAirfieldWeatherSnapshot(normalizedIcao, mode);
    const { metar, taf, isStale, dataStalenessMinutes, weatherData } = weatherSnapshot;

    const phase = mapPhase(schedule, now);

    const inputs: RiskInputs = { icao: normalizedIcao, metar, taf, now };
    const factors = [
      assessSurfaceWind(inputs),
      assessVisibility(inputs),
      assessCeilingClouds(inputs),
      assessPrecipitation(inputs),
      assessTrendStability(inputs),
    ];

    const datasetsAvailable = [metar, taf].filter(Boolean).length;
    const metarObserved = metar?.observed ? new Date(metar.observed).getTime() : undefined;
    const tafIssued = taf?.issued ? new Date(taf.issued).getTime() : undefined;
    const newestTs = Math.max(metarObserved ?? 0, tafIssued ?? 0);
    const dataAgeHours = newestTs ? (Date.now() - newestTs) / 3600000 : 999;
    const missingInputsPenalty = datasetsAvailable >= 2 ? 0 : 0.15;
    const hasConflict = false; // placeholder for METAR/TAF conflict detection

    const agg = aggregateRisk(normalizedIcao, phase, factors, datasetsAvailable, dataAgeHours, missingInputsPenalty, hasConflict);
    const messaging = buildMessaging(agg);

    return {
      icao: normalizedIcao,
      phase,
      mode,
      isStale,
      dataStalenessMinutes,
      result: agg,
      messaging,
      weatherData,
      datasetsAvailable,
    };
  } catch (error) {
    console.error(`Error in getAirportRisk for ${icao}:`, error);
    throw new Error(`Failed to compute airport risk for ${icao}: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

function mapPhase(schedule: AirportRiskParams["schedule"], now: Date): ReturnType<typeof determineFlightPhase> {
  return determineFlightPhase(
    schedule ? { departureUtc: schedule.departureUtc ?? undefined, arrivalUtc: schedule.arrivalUtc ?? undefined } : undefined,
    now
  );
}

export async function getFlightRisk(params: FlightRiskParams) {
  try {
    const admin = createAdminClient();
    const { accountId, flightId } = params;
    const now = params.now ?? new Date();

    type FlightSelection = Pick<Flight,
      "id" | "origin_icao" | "destination_icao" | "scheduled_at" | "arrival_at" | "weather_data"
    >;

    const { data, error } = await admin
      .from("user_flights")
      .select("id, origin_icao, destination_icao, scheduled_at, arrival_at, weather_data")
      .eq("id", flightId)
      .maybeSingle();

    const flight = data as FlightSelection | null;

    if (error) {
      console.error(`Database error fetching flight ${flightId}:`, error);
      throw new Error(`Database error: ${error.message}`);
    }

    if (!flight) {
      throw new Error(`Flight not found: ${flightId}`);
    }

    const depIcao = (flight.origin_icao ?? "").toUpperCase();
    const arrIcao = (flight.destination_icao ?? "").toUpperCase();
    
    if (!depIcao || depIcao.length !== 4) {
      throw new Error(`Flight ${flightId} is missing a valid origin ICAO code: ${flight.origin_icao}`);
    }
    if (!arrIcao || arrIcao.length !== 4) {
      throw new Error(`Flight ${flightId} is missing a valid destination ICAO code: ${flight.destination_icao}`);
    }

    // Fetch risk for BOTH origin and destination
    let originRisk, destinationRisk;
    try {
      [originRisk, destinationRisk] = await Promise.all([
        getAirportRisk({
          accountId,
          icao: depIcao,
          schedule: { departureUtc: flight.scheduled_at, arrivalUtc: flight.arrival_at },
          mode: "full",
          now,
        }),
        getAirportRisk({
          accountId,
          icao: arrIcao,
          schedule: { departureUtc: flight.scheduled_at, arrivalUtc: flight.arrival_at },
          mode: "full",
          now,
        }),
      ]);
    } catch (riskError) {
      console.error(`Failed to get airport risk:`, riskError);
      throw new Error(`Failed to compute airport risk: ${riskError instanceof Error ? riskError.message : 'Unknown error'}`);
    }

    // Combine origin and destination risk based on flight phase
    const phaseWeights = {
      preflight: { origin: 0.50, destination: 0.50 },
      planning: { origin: 0.60, destination: 0.40 },
      departure: { origin: 0.75, destination: 0.25 },
      enroute: { origin: 0.30, destination: 0.70 },
      arrival: { origin: 0.25, destination: 0.75 },
    };

    const phase = originRisk.phase;
    const weights = phaseWeights[phase] || phaseWeights.preflight;

    // Calculate combined score
    const originScore = originRisk.result.score ?? 0;
    const destScore = destinationRisk.result.score ?? 0;
    const combinedScore = Math.round(
      originScore * weights.origin + destScore * weights.destination
    );

    // Determine combined tier
    const combinedTier = 
      combinedScore <= 30 ? "on_track" :
      combinedScore <= 60 ? "monitor" :
      "high_disruption";

    // Worst-case alert level (if EITHER is bad, show warning)
    const alertLevel = 
      originRisk.result.tier === "high_disruption" || destinationRisk.result.tier === "high_disruption" ? "red" :
      originRisk.result.tier === "monitor" || destinationRisk.result.tier === "monitor" ? "yellow" :
      "green";

    // Combined confidence (weakest link)
    const combinedConfidence = Math.min(
      originRisk.result.confidence,
      destinationRisk.result.confidence
    ) * 0.95; // Slight penalty for combining

    const score = combinedScore;
    const tier = combinedTier;

    const weatherCacheExpires = earliestTimestamp([
      originRisk.weatherData?.expiresAt ?? null,
      destinationRisk.weatherData?.expiresAt ?? null,
    ]) ?? new Date(Date.now() + 15 * 60000).toISOString();

    const riskTimestamp = new Date().toISOString();

    const updatePayload: Partial<Database["public"]["Tables"]["user_flights"]["Update"]> = {
      weather_risk_score: score,
      weather_alert_level: alertLevel as Database["public"]["Tables"]["user_flights"]["Row"]["weather_alert_level"],
      weather_updated_at: riskTimestamp,
      weather_cache_expires: weatherCacheExpires,
      weather_data: {
        origin: originRisk.weatherData ?? null,
        destination: destinationRisk.weatherData ?? null,
        risk: {
          combined: {
            score: combinedScore,
            tier: combinedTier,
            confidence: combinedConfidence,
            phase,
            weights: { origin: weights.origin, destination: weights.destination },
            evaluatedAt: riskTimestamp,
          },
          origin: {
            score: originRisk.result.score,
            tier: originRisk.result.tier,
            confidence: originRisk.result.confidence,
            isStale: originRisk.isStale,
          },
          destination: {
            score: destinationRisk.result.score,
            tier: destinationRisk.result.tier,
            confidence: destinationRisk.result.confidence,
            isStale: destinationRisk.isStale,
          },
          lastUpdated: riskTimestamp,
          expiresAt: weatherCacheExpires,
        },
      },
    };

    console.log(`[RiskEngine] Writing weather snapshot for flight ${flightId}`, {
      originMetar: Boolean(originRisk.weatherData?.metar),
      originTaf: Boolean(originRisk.weatherData?.taf),
      destinationMetar: Boolean(destinationRisk.weatherData?.metar),
      destinationTaf: Boolean(destinationRisk.weatherData?.taf),
      expiresAt: weatherCacheExpires,
    });

    try {
      await (admin.from("user_flights") as any)
        .update(updatePayload)
        .eq("id", flightId);
    } catch (updateError) {
      console.error(`Failed to update flight ${flightId} with risk data:`, updateError);
      // Don't throw - return the risk data even if update fails
    }

    // Return comprehensive data including weather for both airports
    return {
      icao: originRisk.icao,
      phase,
      mode: originRisk.mode,
      isStale: originRisk.isStale || destinationRisk.isStale,
      dataStalenessMinutes: Math.max(originRisk.dataStalenessMinutes, destinationRisk.dataStalenessMinutes),
      result: {
        icao: originRisk.icao,
        phase,
        score: combinedScore,
        tier: combinedTier,
        confidence: combinedConfidence,
        status: "ok" as const,
        factorBreakdown: originRisk.result.factorBreakdown,
      },
      messaging: originRisk.messaging,
      weatherData: originRisk.weatherData,
      datasetsAvailable: originRisk.datasetsAvailable + destinationRisk.datasetsAvailable,
      origin: originRisk,
      destination: destinationRisk,
      flightId,
    };
  } catch (error) {
    console.error(`Error in getFlightRisk for flight ${params.flightId}:`, error);
    throw error; // Re-throw to let caller handle
  }
}
