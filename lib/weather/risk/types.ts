import type { DecodedMetar, DecodedTaf } from "@/types/checkwx";
import type { HazardFeatureNormalized, PilotReport } from "@/types/weather";

export type Phase = "preflight" | "planning" | "departure" | "enroute" | "arrival";

export type WeatherRiskTier = "on_track" | "monitor" | "high_disruption";

export interface RiskInputs {
  icao: string;
  metar?: DecodedMetar;
  taf?: DecodedTaf;
  now: Date;
  hazards?: HazardFeatureNormalized[];
  pireps?: PilotReport[];
}

export interface WeatherRiskFactorResult {
  name: string;
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
