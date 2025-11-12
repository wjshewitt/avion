// Core type definitions for FlightOps AI Command Console

export type FlightStatus = "On Time" | "Delayed" | "Cancelled";

export interface FlightRecord {
  id: string;
  origin: string;
  destination: string;
  status: FlightStatus;
  schedDep?: string;
  schedArr?: string;
}

export interface RiskScores {
  flightId: string;
  weatherRisk: number;
  operationalRisk: number;
  terrainRisk: number;
  totalRisk: number;
}

export interface CrewBriefing {
  flightId: string;
  weatherSummary: string;
  operationalNotes: string;
  generatedAt: string;
}

export interface AirportCoordinate {
  code: string;
  lat: number;
  lon: number;
  name?: string;
}

// Re-export AirportDB types for easy access
export type {
  AirportDBResponse,
  ProcessedAirportData,
  CachedAirportData,
  AirportDBClient,
  AirportCacheService,
  RateLimitService,
  AirportDBError,
  AirportDBException,
  RunwayData,
  FrequencyData,
  NavaidData,
  RateLimitResult,
  UsageStats,
} from "./airportdb";
