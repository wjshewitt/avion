import type { DecodedMetar, CloudLayer, WindData } from "@/types/checkwx";

export type CloudCoverageCategory =
  | "clear"
  | "few"
  | "scattered"
  | "broken"
  | "overcast"
  | "high-thin"
  | "storm";

export type CloudMotion = "calm" | "breezy" | "windy";

export interface CloudLayerState {
  category: CloudCoverageCategory;
  baseFt?: number;
  topFt?: number;
  opacity: number;
  motion: CloudMotion;
}

const CLEAR_CODES = new Set(["CLR", "SKC", "NSC", "NCD"]);

const COVERAGE_RANK: Record<string, number> = {
  FEW: 1,
  SCT: 3,
  BKN: 6,
  OVC: 8,
};

const OPACITY_BY_CATEGORY: Record<CloudCoverageCategory, number> = {
  clear: 0.06,
  "few": 0.12,
  "high-thin": 0.12,
  scattered: 0.18,
  broken: 0.26,
  overcast: 0.34,
  storm: 0.4,
};

function getBaseFeet(clouds?: CloudLayer[]): number | undefined {
  if (!clouds || clouds.length === 0) return undefined;

  let minBase: number | undefined;

  for (const layer of clouds) {
    const candidate = layer.base_feet_agl ?? layer.feet;
    if (typeof candidate === "number") {
      if (minBase === undefined || candidate < minBase) {
        minBase = candidate;
      }
    }
  }

  return minBase;
}

function deriveCoverageCategory(clouds?: CloudLayer[]): {
  category: CloudCoverageCategory;
  baseFt?: number;
} {
  if (!clouds || clouds.length === 0) {
    return { category: "clear" };
  }

  const nonClearLayers = clouds.filter((c) => !CLEAR_CODES.has(c.code));
  if (nonClearLayers.length === 0) {
    return { category: "clear" };
  }

  let maxRank = 0;
  for (const layer of nonClearLayers) {
    const rank = COVERAGE_RANK[layer.code] ?? 0;
    if (rank > maxRank) maxRank = rank;
  }

  const baseFt = getBaseFeet(nonClearLayers);
  const allHigh = baseFt !== undefined && baseFt >= 20000;

  if (allHigh && maxRank <= COVERAGE_RANK.SCT) {
    return { category: "high-thin", baseFt };
  }

  if (maxRank >= COVERAGE_RANK.OVC) {
    return { category: "overcast", baseFt };
  }

  if (maxRank >= COVERAGE_RANK.BKN) {
    return { category: "broken", baseFt };
  }

  if (maxRank >= COVERAGE_RANK.SCT) {
    return { category: "scattered", baseFt };
  }

  // Handle FEW (Rank 1) - previously was clear
  if (maxRank >= COVERAGE_RANK.FEW) {
    return { category: "few", baseFt };
  }

  return { category: "clear", baseFt };
}

function estimateWindSpeedKts(wind?: WindData): number | null {
  if (!wind) return null;

  if (typeof wind.speed_kts === "number") return wind.speed_kts;
  if (typeof wind.speed_mph === "number") return wind.speed_mph / 1.15078;
  if (typeof wind.speed_mps === "number") return wind.speed_mps * 1.94384;
  if (typeof wind.speed_kph === "number") return wind.speed_kph / 1.852;

  return null;
}

function deriveMotion(wind?: WindData): CloudMotion {
  const speedKts = estimateWindSpeedKts(wind);
  if (speedKts == null) return "calm";
  if (speedKts < 8) return "calm";
  if (speedKts < 18) return "breezy";
  return "windy";
}

function hasStormSignatures(rawText: string): boolean {
  if (!rawText) return false;
  const upper = rawText.toUpperCase();
  return (
    upper.includes(" TS ") ||
    upper.includes("TSRA") ||
    upper.includes("VCTS") ||
    upper.includes("+TS") ||
    upper.includes(" CB") ||
    upper.includes("CB ") ||
    upper.includes(" TCU") ||
    upper.includes("TCU ")
  );
}

export function deriveCloudLayerState(metar: DecodedMetar | null | undefined): CloudLayerState {
  const coverage = deriveCoverageCategory(metar?.clouds);
  const motion = deriveMotion(metar?.wind);
  const rawText = metar?.raw_text ?? "";

  let category: CloudCoverageCategory = coverage.category;
  if (hasStormSignatures(rawText)) {
    category = "storm";
  }

  const opacity = OPACITY_BY_CATEGORY[category];

  return {
    category,
    baseFt: coverage.baseFt,
    topFt: undefined,
    opacity,
    motion,
  };
}
