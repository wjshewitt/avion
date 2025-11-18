import type { DecodedMetar, DecodedTaf } from "@/types/checkwx";
import type { HazardFeatureNormalized, PilotReport } from "@/types/weather";

export type Phase = "preflight" | "planning" | "departure" | "enroute" | "arrival";

export type WeatherRiskTier = "on_track" | "monitor" | "high_disruption";

export type RiskDimension = "weather" | "schedule" | "runway" | "compliance" | "traffic";

export type RiskProfile = "standard" | "conservative" | "aggressive" | "custom";

export type RiskFactorName = 
  | "surface_wind" 
  | "visibility" 
  | "ceiling_clouds" 
  | "precipitation" 
  | "trend_stability" 
  | "hazard_advisories" 
  | "temperature"
  // Future / Non-weather factors
  | "runway_performance"
  | "airport_capability"
  | "schedule_buffer"
  | "compliance_gap"
  | "traffic_anomaly";

export interface RiskDimensionConfig {
  enabled: boolean;
  weight: number; // Multiplier, e.g. 1.0
}

export interface RiskFactorConfig {
  enabled: boolean;
  weight: number;
}

export interface RiskModelConfig {
  version: "v2";
  profile: RiskProfile;
  dimensions: Partial<Record<RiskDimension, RiskDimensionConfig>>;
  factors: Partial<Record<RiskFactorName, RiskFactorConfig>>;
}

export interface FlightDisruptionMetrics {
  delayProbability: number; // 0-1
  cancellationProbability: number; // 0-1
  expectedDelayMinutes: number | null; // null if no significant delay expected
  notes: string[]; // Human readable explanation of the metrics
}

export interface RiskInputs {
  icao: string;
  metar?: DecodedMetar;
  taf?: DecodedTaf;
  now: Date;
  hazards?: HazardFeatureNormalized[];
  pireps?: PilotReport[];
}

export interface WeatherRiskFactorResult {
  name: RiskFactorName;
  dimension?: RiskDimension;
  score: number; // 0-100 contribution
  confidencePenalty: number; // 0-1 reduction applied later
  severity: "low" | "moderate" | "high";
  messages: string[];
  details?: {
    actualValue?: string | number;
    threshold?: string;
    impact?: string;
  };
  timeframe?: { from?: string; to?: string };
  sources: string[];
}

export interface AggregatedRiskResult {
  icao: string;
  phase: Phase;
  score: number | null; // null when insufficient data
  tier: WeatherRiskTier | null;
  confidence: number; // 0-1
  status: "ok" | "insufficient_data";
  factorBreakdown: WeatherRiskFactorResult[];
  disruption?: FlightDisruptionMetrics;
  dimensionScores?: Partial<Record<RiskDimension, number>>;
}

export interface FlightSchedule {
  departureUtc?: string | null;
  arrivalUtc?: string | null;
}

export interface AirportRiskParams {
  accountId: string;
  icao: string;
  schedule?: FlightSchedule;
  mode?: "lite" | "full";
  now?: Date;
}

export interface FlightRiskParams {
  accountId: string;
  flightId: string;
  now?: Date;
}
