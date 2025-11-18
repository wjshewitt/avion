import type { RiskModelConfig, RiskProfile } from "./types";

export const DEFAULT_RISK_CONFIG: RiskModelConfig = {
  version: "v2",
  profile: "standard",
  dimensions: {
    weather: { enabled: true, weight: 0.65 },
    schedule: { enabled: true, weight: 0.15 },
    runway: { enabled: true, weight: 0.15 },
    compliance: { enabled: true, weight: 0.05 },
    traffic: { enabled: false, weight: 0 }, // Not yet implemented
  },
  factors: {
    // Weather Factors
    surface_wind: { enabled: true, weight: 1.0 },
    visibility: { enabled: true, weight: 1.0 },
    ceiling_clouds: { enabled: true, weight: 1.0 },
    precipitation: { enabled: true, weight: 1.0 },
    trend_stability: { enabled: true, weight: 0.8 },
    hazard_advisories: { enabled: true, weight: 1.2 }, // High importance
    temperature: { enabled: true, weight: 0.7 },
    
    // Non-weather Factors (Defaults)
    runway_performance: { enabled: true, weight: 1.0 },
    airport_capability: { enabled: true, weight: 1.0 },
    schedule_buffer: { enabled: true, weight: 1.0 },
    compliance_gap: { enabled: true, weight: 1.0 },
    traffic_anomaly: { enabled: true, weight: 1.0 },
  },
};

// Profile Presets
export const RISK_PROFILES: Record<RiskProfile, Partial<RiskModelConfig>> = {
  standard: {}, // Uses defaults
  conservative: {
    profile: "conservative",
    dimensions: {
      weather: { enabled: true, weight: 0.75 },
      schedule: { enabled: true, weight: 0.10 },
      runway: { enabled: true, weight: 0.10 },
      compliance: { enabled: true, weight: 0.05 },
      traffic: { enabled: false, weight: 0 },
    },
    factors: {
      ...DEFAULT_RISK_CONFIG.factors,
      precipitation: { enabled: true, weight: 1.4 }, // Heavily penalize precip
      ceiling_clouds: { enabled: true, weight: 1.3 },
      hazard_advisories: { enabled: true, weight: 1.5 },
    }
  },
  aggressive: {
    profile: "aggressive",
    dimensions: {
      weather: { enabled: true, weight: 0.55 },
      schedule: { enabled: true, weight: 0.25 }, // More sensitive to schedule pressure
      runway: { enabled: true, weight: 0.15 },
      compliance: { enabled: true, weight: 0.05 },
      traffic: { enabled: false, weight: 0 },
    },
    factors: {
      ...DEFAULT_RISK_CONFIG.factors,
      visibility: { enabled: true, weight: 0.8 }, // More tolerant of low vis
      ceiling_clouds: { enabled: true, weight: 0.8 },
      trend_stability: { enabled: true, weight: 1.2 }, // But watch trends closely
    }
  },
  custom: {}, // Placeholder for custom logical
};
