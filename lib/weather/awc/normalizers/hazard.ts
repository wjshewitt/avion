import { randomUUID } from "crypto";
import {
  AwcHazardFeature,
  AwcPirepFeature,
} from "@/lib/weather/validation/awc";
import {
  HazardFeatureNormalized,
  HazardGeometry,
  HazardKind,
  HazardSeverity,
  PilotReport,
  PirepSeverity,
} from "@/types/weather";

function coerceIso(value?: string | null): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

function normalizeFlightLevels(feature: AwcHazardFeature) {
  const levels = feature.properties?.flightLevels as
    | { lower?: number | null; upper?: number | null }
    | undefined;
  if (!levels) {
    return undefined;
  }
  const lower = typeof levels.lower === "number" ? levels.lower : undefined;
  const upper = typeof levels.upper === "number" ? levels.upper : undefined;
  if (lower === undefined && upper === undefined) return undefined;
  return { lower, upper };
}

const hazardSeverityMap: Record<string, HazardSeverity> = {
  EXT: "extreme",
  SEV: "high",
  HIGH: "high",
  MOD: "moderate",
  MDT: "moderate",
  LGT: "low",
  LOW: "low",
};

const pirepSeverityMap: Record<string, PirepSeverity> = {
  SEV: "severe",
  "SEV-MOD": "severe",
  MOD: "moderate",
  MDT: "moderate",
  "MOD-LGT": "moderate",
  LGT: "light",
};

function deriveSeverity(value?: string | number | null): HazardSeverity {
  if (!value) return "unknown";
  const normalized = String(value).trim().toUpperCase();
  return hazardSeverityMap[normalized] ?? "unknown";
}

function derivePirepSeverity(value?: string | null): PirepSeverity {
  if (!value) return "unknown";
  const normalized = value.trim().toUpperCase();
  return pirepSeverityMap[normalized] ?? "unknown";
}

function computeCentroid(coords: number[][][]): [number, number] {
  let x = 0;
  let y = 0;
  let count = 0;
  for (const ring of coords) {
    for (const point of ring) {
      x += point[0];
      y += point[1];
      count += 1;
    }
  }
  return count ? [x / count, y / count] : [0, 0];
}

function normalizeGeometry(
  geometry: AwcHazardFeature["geometry"]
): HazardGeometry | undefined {
  if (!geometry) return undefined;

  if (geometry.type === "Point") {
    return {
      type: "Point",
      coordinates: geometry.coordinates,
      centroid: geometry.coordinates as [number, number],
    };
  }

  if (geometry.type === "Polygon") {
    return {
      type: "Polygon",
      coordinates: geometry.coordinates,
      centroid: computeCentroid(geometry.coordinates),
    };
  }

  if (geometry.type === "MultiPolygon") {
    const first = geometry.coordinates[0] ?? [];
    return {
      type: "MultiPolygon",
      coordinates: geometry.coordinates,
      centroid: first.length ? computeCentroid(first) : undefined,
    };
  }

  return undefined;
}

export function normalizeHazardFeature(
  feature: AwcHazardFeature,
  kind: HazardKind
): HazardFeatureNormalized {
  const properties = feature.properties ?? {};
  const flightLevels = normalizeFlightLevels(feature);

  const timeParts = [
    properties.issueTime,
    properties.validTimeFrom,
    properties.validTimeTo,
    properties.validTime,
    properties.expireTime,
  ].filter(Boolean) as string[];

  const compositeId = [
    kind,
    properties.advisoryId,
    properties.icaoId,
    ...timeParts,
  ]
    .filter(Boolean)
    .join("-");

  return {
    id:
      (feature.id ? String(feature.id) : undefined) ||
      (properties.advisoryId
        ? String(properties.advisoryId)
        : undefined) ||
      compositeId ||
      `${kind}-${properties.icaoId || "unknown"}`,
    kind,
    name: properties.hazard ?? properties.phenomenon ?? undefined,
    severity: deriveSeverity(properties.severity),
    narrative: properties.rawText ?? properties.rawAirSigmet ?? undefined,
    validFrom:
      coerceIso(properties.validTimeFrom) ||
      coerceIso(properties.validTime) ||
      coerceIso(properties.issueTime),
    validTo: coerceIso(properties.validTimeTo) || coerceIso(properties.expireTime),
    issuedAt: coerceIso(properties.issueTime),
    region: properties.region ?? undefined,
    altitude: {
      lowerFt:
        flightLevels?.lower ?? properties.altitude?.min_ft_msl ?? undefined,
      upperFt:
        flightLevels?.upper ?? properties.altitude?.max_ft_msl ?? undefined,
    },
    movement: properties.movement
      ? {
          direction: properties.movement.direction ?? undefined,
          speedKt: properties.movement.speed ?? undefined,
        }
      : undefined,
    geometry: normalizeGeometry(feature.geometry ?? undefined),
    rawText: properties.rawText ?? undefined,
  };
}

export function normalizePirepFeature(feature: AwcPirepFeature): PilotReport {
  const props = feature.properties ?? {};
  return {
    id:
      (feature.id ? String(feature.id) : undefined) ||
      props.id ||
      props.station_id ||
      randomUUID(),
    observedAt: props.obs_time || undefined,
    aircraftRef: props.aircraft_ref || undefined,
    altitudeFtMsl: props.altitude_ft_msl ?? undefined,
    latitude: props.latitude ?? undefined,
    longitude: props.longitude ?? undefined,
    turbulence: derivePirepSeverity(props.turb),
    icing: derivePirepSeverity(props.ice),
    weather: props.wx ?? null,
    skyCondition: props.sky ?? null,
    temperatureC: props.temp_c ?? undefined,
    rawText: props.raw_text ?? null,
  };
}
