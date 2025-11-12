import type { Phase, WeatherRiskTier, WeatherRiskFactorResult, AggregatedRiskResult, FlightSchedule } from "@/lib/weather/risk/types";

export function determineFlightPhase(schedule?: FlightSchedule, now: Date = new Date()): Phase {
  const n = now.getTime();
  const dep = schedule?.departureUtc ? new Date(schedule.departureUtc).getTime() : undefined;
  const arr = schedule?.arrivalUtc ? new Date(schedule.arrivalUtc).getTime() : undefined;

  if (!dep) return "preflight";

  const diffHrs = (dep - n) / 3600000;
  if (diffHrs > 24) return "preflight";
  if (diffHrs > 0) return "planning";
  if (diffHrs <= 0 && (!arr || n <= arr)) return "enroute";
  return "arrival";
}

const PHASE_WEIGHTS: Record<Phase, Record<string, number>> = {
  departure: { surface_wind: 0.35, visibility: 0.25, ceiling_clouds: 0.15, precipitation: 0.15, trend_stability: 0.1 },
  arrival: { ceiling_clouds: 0.30, visibility: 0.25, surface_wind: 0.20, precipitation: 0.15, trend_stability: 0.1 },
  planning: { precipitation: 0.25, ceiling_clouds: 0.25, surface_wind: 0.20, visibility: 0.20, trend_stability: 0.1 },
  preflight: { visibility: 0.25, ceiling_clouds: 0.25, surface_wind: 0.20, precipitation: 0.20, trend_stability: 0.1 },
  enroute: { precipitation: 0.30, trend_stability: 0.25, surface_wind: 0.20, visibility: 0.15, ceiling_clouds: 0.1 },
};

export function aggregateRisk(
  icao: string,
  phase: Phase,
  factors: WeatherRiskFactorResult[],
  datasetsAvailable: number,
  dataAgeHours: number,
  missingInputsPenalty: number,
  hasConflict: boolean
): AggregatedRiskResult {
  const weights = PHASE_WEIGHTS[phase] || {};
  let weighted = 0;
  let sumWeights = 0;
  for (const f of factors) {
    const w = weights[f.name] ?? 0.1;
    weighted += f.score * w;
    sumWeights += w;
  }
  const rawScore = sumWeights > 0 ? Math.min(100, Math.max(0, Math.round(weighted / sumWeights))) : 0;

  // Confidence modeling
  let base = 1.0;
  if (dataAgeHours <= 3) base = 1.0;
  else if (dataAgeHours <= 6) base = 0.95;
  else if (dataAgeHours <= 12) base = 0.85;
  else if (dataAgeHours <= 24) base = 0.7;
  else if (dataAgeHours <= 36) base = 0.5;
  else base = 0.2;

  let confidence = base;
  confidence -= missingInputsPenalty; // e.g., 0.2 when missing
  if (hasConflict) confidence -= 0.1;

  // Clamp
  confidence = Math.max(0, Math.min(1, confidence));

  // Insufficient data rule
  let status: AggregatedRiskResult["status"] = "ok";
  let score: number | null = rawScore;
  let tier: WeatherRiskTier | null = mapScoreToTier(rawScore);
  if (confidence < 0.15 || datasetsAvailable < 1) {
    status = "insufficient_data";
    score = null;
    tier = null;
  }

  return {
    icao,
    phase,
    score,
    tier,
    confidence,
    status,
    factorBreakdown: factors,
  };
}

export function mapScoreToTier(score: number): WeatherRiskTier {
  if (score <= 30) return "on_track";
  if (score <= 60) return "monitor";
  return "high_disruption";
}
