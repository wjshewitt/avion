import type { Phase, WeatherRiskTier, WeatherRiskFactorResult, AggregatedRiskResult, FlightSchedule, RiskModelConfig, RiskDimension, FlightDisruptionMetrics, RiskFactorName } from "@/lib/weather/risk/types";
import { DEFAULT_RISK_CONFIG } from "./constants";

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

// Legacy fallback weights (v1)
const PHASE_WEIGHTS: Record<Phase, Record<string, number>> = {
  departure: {
    surface_wind: 0.3,
    visibility: 0.22,
    ceiling_clouds: 0.13,
    precipitation: 0.13,
    trend_stability: 0.08,
    temperature: 0.14,
  },
  arrival: {
    ceiling_clouds: 0.28,
    visibility: 0.23,
    surface_wind: 0.18,
    precipitation: 0.13,
    trend_stability: 0.08,
    temperature: 0.1,
  },
  planning: {
    precipitation: 0.23,
    ceiling_clouds: 0.23,
    surface_wind: 0.18,
    visibility: 0.18,
    trend_stability: 0.08,
    temperature: 0.1,
  },
  preflight: {
    visibility: 0.23,
    ceiling_clouds: 0.23,
    surface_wind: 0.18,
    precipitation: 0.18,
    trend_stability: 0.08,
    temperature: 0.1,
  },
  enroute: {
    precipitation: 0.28,
    trend_stability: 0.23,
    surface_wind: 0.18,
    visibility: 0.13,
    ceiling_clouds: 0.08,
    temperature: 0.1,
  },
};

export function aggregateRisk(
  icao: string,
  phase: Phase,
  factors: WeatherRiskFactorResult[],
  datasetsAvailable: number,
  dataAgeHours: number,
  missingInputsPenalty: number,
  hasConflict: boolean,
  config: RiskModelConfig = DEFAULT_RISK_CONFIG // v2 Config Injection
): AggregatedRiskResult {
  
  // --- Step 1: Weighting & Aggregation (v2 Logic) ---
  let totalWeightedScore = 0;
  let totalMaxPossible = 0;
  const dimensionScores: Partial<Record<RiskDimension, number>> = {};
  const dimensionWeights: Partial<Record<RiskDimension, number>> = {};

  // Group factors by dimension to normalize dimension weights later
  const factorsByDimension: Partial<Record<RiskDimension, WeatherRiskFactorResult[]>> = {};

  for (const f of factors) {
    // Assign dimension if missing (default to weather)
    const dim = f.dimension || "weather";
    if (!factorsByDimension[dim]) factorsByDimension[dim] = [];
    factorsByDimension[dim]!.push(f);
  }

  // Process each dimension
  for (const dimKey in factorsByDimension) {
    const dim = dimKey as RiskDimension;
    const dimConfig = config.dimensions[dim];
    
    // Skip disabled dimensions
    if (!dimConfig?.enabled) continue;

    const dimWeight = dimConfig.weight;
    const dimFactors = factorsByDimension[dim]!;
    
    let dimTotalScore = 0;
    let dimTotalWeight = 0;

    for (const f of dimFactors) {
       // Determine Factor Weight
       // Priority: Config > Legacy Phase Weight > Default 0.1
       let factorWeight = config.factors[f.name]?.weight;
       
       // Legacy Fallback if v1 config or factor missing in config
       if (factorWeight === undefined) {
         factorWeight = PHASE_WEIGHTS[phase]?.[f.name] ?? 0.1;
       }

       // Skip disabled factors
       if (config.factors[f.name]?.enabled === false) continue;

       dimTotalScore += f.score * factorWeight;
       dimTotalWeight += factorWeight;
    }

    // Calculate Dimension Score (0-100)
    const dimScore = dimTotalWeight > 0 ? (dimTotalScore / dimTotalWeight) : 0;
    dimensionScores[dim] = Math.round(dimScore);

    // Add to Global Total (Weighted by Dimension)
    totalWeightedScore += dimScore * dimWeight;
    totalMaxPossible += 100 * dimWeight;
    dimensionWeights[dim] = dimWeight;
  }

  // Final Raw Score Calculation
  // Normalize against sum of dimension weights
  const sumDimWeights = Object.values(dimensionWeights).reduce((a, b) => a + b, 0);
  const normalizedScore = sumDimWeights > 0 
    ? Math.round((totalWeightedScore / (sumDimWeights * 100)) * 100)
    : 0;

  // Safety Rail: If any single factor is critical (>85), floor score at 60 (Monitor)
  let finalScore = normalizedScore;
  const hasCriticalFactor = factors.some(f => f.score > 85 && config.factors[f.name]?.enabled !== false);
  if (hasCriticalFactor && finalScore < 60) {
    finalScore = 60; 
  }

  // --- Step 2: Confidence Modeling ---
  // Base confidence from Data Age (Legacy)
  let base = 1.0;
  if (dataAgeHours <= 3) base = 1.0;
  else if (dataAgeHours <= 6) base = 0.95;
  else if (dataAgeHours <= 12) base = 0.85;
  else if (dataAgeHours <= 24) base = 0.7;
  else if (dataAgeHours <= 36) base = 0.5;
  else base = 0.2;

  let confidence = base;
  confidence -= missingInputsPenalty; 
  if (hasConflict) confidence -= 0.1;
  
  // v2: Factor-specific confidence penalties
  // e.g., if "visibility" is missing and it's highly weighted, penalize confidence more
  let factorConfidenceSum = 0;
  let factorWeightSum = 0;
  for (const f of factors) {
      if (config.factors[f.name]?.enabled === false) continue;
      
      const w = config.factors[f.name]?.weight ?? 1.0;
      const pen = f.confidencePenalty * w; // Weighted penalty
      factorConfidenceSum += pen;
      factorWeightSum += w;
  }
  if (factorWeightSum > 0) {
      // Subtract weighted average penalty (scale down impact slightly, * 0.5)
      confidence -= (factorConfidenceSum / factorWeightSum) * 0.5;
  }

  // Clamp
  confidence = Math.max(0, Math.min(1, confidence));

  // --- Step 3: Disruption Metrics (v2) ---
  const tier = mapScoreToTier(finalScore);
  const disruption = computeDisruptionMetrics(finalScore, tier, factors, phase);

  // --- Step 4: Insufficient Data Handling ---
  let status: AggregatedRiskResult["status"] = "ok";
  let scoreResult: number | null = finalScore;
  let tierResult: WeatherRiskTier | null = tier;
  
  if (confidence < 0.15 || datasetsAvailable < 1) {
    status = "insufficient_data";
    scoreResult = null;
    tierResult = null;
  }

  return {
    icao,
    phase,
    score: scoreResult,
    tier: tierResult,
    confidence,
    status,
    factorBreakdown: factors,
    dimensionScores,
    disruption
  };
}

export function mapScoreToTier(score: number): WeatherRiskTier {
  if (score <= 30) return "on_track";
  if (score <= 60) return "monitor";
  return "high_disruption";
}

/**
 * v2 Rule-based Disruption Modeling
 */
function computeDisruptionMetrics(
    score: number, 
    tier: WeatherRiskTier, 
    factors: WeatherRiskFactorResult[],
    phase: Phase
): FlightDisruptionMetrics {
    
    let delayProb = 0.05;
    let cancelProb = 0.00;
    let notes: string[] = [];

    // Base probability from Score
    if (score <= 20) { delayProb = 0.05; cancelProb = 0.01; }
    else if (score <= 40) { delayProb = 0.15; cancelProb = 0.02; }
    else if (score <= 60) { delayProb = 0.35; cancelProb = 0.05; }
    else if (score <= 80) { delayProb = 0.65; cancelProb = 0.15; }
    else { delayProb = 0.90; cancelProb = 0.40; }

    // Factor-specific Modifiers
    const precip = factors.find(f => f.name === "precipitation");
    const ceiling = factors.find(f => f.name === "ceiling_clouds");
    const vis = factors.find(f => f.name === "visibility");
    const wind = factors.find(f => f.name === "surface_wind");
    const hazards = factors.find(f => f.name === "hazard_advisories");

    // 1. Freezing Precipitation = High Cancel Risk
    if (precip?.score && precip.score > 60 && precip.messages.some(m => m.includes("Freezing") || m.includes("Snow"))) {
        cancelProb = Math.max(cancelProb, 0.50);
        delayProb = Math.max(delayProb, 0.80);
        notes.push("High probability of de-icing delays or cancellation due to frozen precipitation.");
    }

    // 2. TSRA (Thunderstorms) = High Delay Risk
    if (precip?.score && precip.score > 70 && precip.messages.some(m => m.includes("Thunderstorm"))) {
        delayProb = Math.max(delayProb, 0.75);
        // TSRA usually causes delays/holds rather than outright cancels unless prolonged
        notes.push("Convective activity likely to cause ground stops or reroutes.");
    }

    // 3. Low Ceiling/Vis at Arrival = High Divert/Cancel Risk
    if (phase === "arrival" || phase === "planning") {
        if (ceiling && ceiling.score > 80 && vis && vis.score > 80) {
            cancelProb = Math.max(cancelProb, 0.35);
            notes.push("LIFR conditions at destination significantly increase diversion risk.");
        }
    }

    // 4. High Winds = Crosswind Delays
    if (wind && wind.score > 80) {
        delayProb = Math.max(delayProb, 0.60);
        notes.push("Severe crosswinds may limit runway availability.");
    }

    // 5. Hazards (Icing/Turb) = Enroute deviations
    if (hazards && hazards.score > 70) {
        delayProb = Math.max(delayProb, 0.40); 
        // Less impact on cancellation usually, unless severe icing + non-FIKI aircraft (not modeled yet)
        notes.push("Enroute hazards may require extensive rerouting.");
    }

    // Calculate Expected Delay
    let expectedDelayMinutes: number | null = null;
    if (delayProb > 0.3) expectedDelayMinutes = 15;
    if (delayProb > 0.6) expectedDelayMinutes = 45;
    if (delayProb > 0.85) expectedDelayMinutes = 90;

    return {
        delayProbability: parseFloat(delayProb.toFixed(2)),
        cancellationProbability: parseFloat(cancelProb.toFixed(2)),
        expectedDelayMinutes,
        notes
    };
}
