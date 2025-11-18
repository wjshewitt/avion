import { AwcClient, getAwcClient } from "@/lib/weather/awc/client";
import {
  AwcHazardGeoJsonSchema,
  AwcPirepGeoJsonSchema,
  AwcStationInfoSchema,
  type AwcHazardGeoJson,
  type AwcPirepGeoJson,
  type AwcStationInfoResponse,
} from "@/lib/weather/validation/awc";
import { tagMetarSource } from "@/lib/weather/awc/normalizers/metar";
import { tagTafSource } from "@/lib/weather/awc/normalizers/taf";
import {
  normalizeHazardFeature,
  normalizePirepFeature,
} from "@/lib/weather/awc/normalizers/hazard";
import { normalizeStationInfo } from "@/lib/weather/awc/normalizers/station";
import type {
  HazardFeatureNormalized,
  HazardKind,
  PilotReport,
  ProviderTaggedMetar,
  ProviderTaggedTaf,
  StationInfo,
} from "@/types/weather";
import type { MetarData, TafData } from "@/types/weather";

export interface BoundingBox {
  west: number;
  south: number;
  east: number;
  north: number;
}

export interface HazardQueryOptions {
  bbox?: BoundingBox;
  hours?: number;
}

export class AwcWeatherService {
  constructor(private readonly client: AwcClient = getAwcClient()) {}

  async getMetar(
    icaos: string[],
    hours = 2
  ): Promise<ProviderTaggedMetar[]> {
    if (!icaos.length) return [];

    const data = await this.client.request<{ results: MetarData[] }>(
      "/metar",
      {
        searchParams: {
          ids: icaos.join(","),
          format: "json",
          hours,
        },
        cacheKey: `awc:metar:${icaos.join("|")}:${hours}`,
        cacheTags: ["metar"],
        cacheTtlSeconds: 600,
      }
    );

    return tagMetarSource(data.results ?? [], "awc-fallback");
  }

  async getTaf(icaos: string[], hours = 24): Promise<ProviderTaggedTaf[]> {
    if (!icaos.length) return [];

    const data = await this.client.request<{ results: TafData[] }>("/taf", {
      searchParams: {
        ids: icaos.join(","),
        format: "json",
        hours,
      },
      cacheKey: `awc:taf:${icaos.join("|")}:${hours}`,
      cacheTags: ["taf"],
      cacheTtlSeconds: 900,
    });

    return tagTafSource(data.results ?? [], "awc-fallback");
  }

  async getHazards(
    kind: Exclude<HazardKind, "pirep">,
    options: HazardQueryOptions = {}
  ): Promise<HazardFeatureNormalized[]> {
    const path = `/${kind}`;
    const bboxParam = options.bbox ? this.serializeBbox(options.bbox) : undefined;

    const data = await this.client.request<AwcHazardGeoJson>(path, {
      searchParams: {
        format: "geojson",
        hours: options.hours ?? 4,
        bbox: bboxParam,
      },
      cacheKey: `awc:${kind}:${bboxParam ?? "global"}:${options.hours ?? 4}`,
      cacheTags: ["hazard", `hazard:${kind}`],
      cacheTtlSeconds: 300,
      schema: AwcHazardGeoJsonSchema,
      description: `${kind} hazard feed`,
    });

    return data.features.map((feature) => normalizeHazardFeature(feature, kind));
  }

  async getPireps(options: HazardQueryOptions = {}): Promise<PilotReport[]> {
    const bboxParam = options.bbox ? this.serializeBbox(options.bbox) : undefined;

    const data = await this.client.request<AwcPirepGeoJson>("/pirep", {
      searchParams: {
        format: "geojson",
        hours: options.hours ?? 3,
        bbox: bboxParam,
      },
      cacheKey: `awc:pirep:${bboxParam ?? "global"}:${options.hours ?? 3}`,
      cacheTags: ["hazard", "hazard:pirep"],
      cacheTtlSeconds: 300,
      schema: AwcPirepGeoJsonSchema,
      description: "pirep feed",
    });

    return data.features.map(normalizePirepFeature);
  }

  async getStationInfo(icaos: string[]): Promise<StationInfo[]> {
    if (!icaos.length) return [];

    const data = await this.client.request<AwcStationInfoResponse>(
      "/stationinfo",
      {
        searchParams: {
          ids: icaos.join(","),
          format: "json",
        },
        cacheKey: `awc:stationinfo:${icaos.join("|")}`,
        cacheTags: ["station"],
        cacheTtlSeconds: 3600,
        schema: AwcStationInfoSchema,
        description: "station info",
      }
    );

    return normalizeStationInfo(data);
  }

  private serializeBbox(bbox: BoundingBox): string {
    return `${bbox.west},${bbox.south},${bbox.east},${bbox.north}`;
  }
}

let sharedAwcWeatherService: AwcWeatherService | null = null;

export function getAwcWeatherService(): AwcWeatherService {
  if (!sharedAwcWeatherService) {
    sharedAwcWeatherService = new AwcWeatherService();
  }
  return sharedAwcWeatherService;
}
