import type { TafData, TafForecast } from "@/types/weather";

export interface TafSummary {
  worst_condition: "VFR" | "MVFR" | "IFR" | "LIFR";
  worst_time: string;
  trend: "improving" | "stable" | "deteriorating";
  trend_description: string;
}

/**
 * Calculate how old weather data is in minutes
 */
export function calculateDataAge(obsTime: string): number {
  const obs = new Date(obsTime);
  const now = new Date();
  return Math.floor((now.getTime() - obs.getTime()) / 60000);
}

/**
 * Calculate dewpoint depression (temperature - dewpoint)
 */
export function calculateDewpointDepression(
  temp_c: number | null,
  dewpoint_c: number | null
): number | null {
  if (temp_c === null || dewpoint_c === null) return null;
  return temp_c - dewpoint_c;
}

/**
 * Determine icing risk based on dewpoint depression
 * < 2°C = high risk, < 5°C = moderate risk, >= 5°C = low risk
 */
export function determineIcingRisk(
  dewpoint_depression: number | null
): "low" | "moderate" | "high" | null {
  if (dewpoint_depression === null) return null;
  if (dewpoint_depression < 2) return "high";
  if (dewpoint_depression < 5) return "moderate";
  return "low";
}

/**
 * Determine flight category based on ceiling and visibility
 */
export function determineFlightCategory(
  visibility_sm: number | null,
  ceiling_ft_agl: number | null
): "VFR" | "MVFR" | "IFR" | "LIFR" {
  const vis = visibility_sm || 10;
  const ceiling = ceiling_ft_agl || 10000;

  if (ceiling < 500 || vis < 1) return "LIFR";
  if (ceiling < 1000 || vis < 3) return "IFR";
  if (ceiling < 3000 || vis < 5) return "MVFR";
  return "VFR";
}

/**
 * Analyze TAF forecast trend
 */
export function analyzeTafTrend(taf: TafData): TafSummary | null {
  if (!taf.forecast || taf.forecast.length === 0) return null;

  // Determine flight category for each period
  const categories = taf.forecast.map((period) => {
    const ceiling = period.ceiling_ft_agl || 10000;
    const vis = period.vis_statute_mi || 10;

    if (ceiling < 500 || vis < 1) return "LIFR";
    if (ceiling < 1000 || vis < 3) return "IFR";
    if (ceiling < 3000 || vis < 5) return "MVFR";
    return "VFR";
  });

  // Find worst condition
  const categoryOrder = { LIFR: 0, IFR: 1, MVFR: 2, VFR: 3 };
  const worst = categories.reduce((worst, curr) =>
    categoryOrder[curr] < categoryOrder[worst] ? curr : worst
  );

  const worstIndex = categories.indexOf(worst);

  // Determine trend (compare first 3 periods vs last 3)
  const firstThree = categories.slice(0, Math.min(3, categories.length));
  const lastThree = categories.slice(-Math.min(3, categories.length));

  const firstAvg =
    firstThree.reduce((sum, cat) => sum + categoryOrder[cat], 0) /
    firstThree.length;
  const lastAvg =
    lastThree.reduce((sum, cat) => sum + categoryOrder[cat], 0) /
    lastThree.length;

  let trend: "improving" | "stable" | "deteriorating";
  if (lastAvg > firstAvg + 0.5) trend = "improving";
  else if (lastAvg < firstAvg - 0.5) trend = "deteriorating";
  else trend = "stable";

  return {
    worst_condition: worst,
    worst_time: taf.forecast[worstIndex]?.fcstTime || "",
    trend,
    trend_description: `Conditions ${trend} over forecast period`,
  };
}

/**
 * Parse altitude range from SIGMET raw text
 */
export function parseAltitudeRange(
  rawText: string
): { low: number; high: number } | null {
  // Look for FL notation (FL250, FL350)
  const flMatch = rawText.match(/FL(\d{3})/g);
  if (flMatch && flMatch.length > 0) {
    const altitudes = flMatch.map((fl) => parseInt(fl.replace("FL", "")) * 100);
    return {
      low: Math.min(...altitudes),
      high: Math.max(...altitudes),
    };
  }

  // Look for feet notation (15000FT, 35000FT)
  const ftMatch = rawText.match(/(\d{4,5})\s*FT/gi);
  if (ftMatch && ftMatch.length > 0) {
    const altitudes = ftMatch.map((ft) => parseInt(ft.replace(/\D/g, "")));
    return {
      low: Math.min(...altitudes),
      high: Math.max(...altitudes),
    };
  }

  return null;
}

/**
 * Parse hazard type from SIGMET text
 */
export function parseHazardType(
  hazard: string
):
  | "turbulence"
  | "icing"
  | "thunderstorm"
  | "volcanic_ash"
  | "wind_shear"
  | "other" {
  const hazardLower = hazard.toLowerCase();

  if (hazardLower.includes("turb")) return "turbulence";
  if (hazardLower.includes("ice") || hazardLower.includes("icing"))
    return "icing";
  if (hazardLower.includes("thunder") || hazardLower.includes("ts"))
    return "thunderstorm";
  if (hazardLower.includes("volcanic")) return "volcanic_ash";
  if (hazardLower.includes("wind") && hazardLower.includes("shear"))
    return "wind_shear";

  return "other";
}

/**
 * Get hazard icon emoji based on type
 */
export function getHazardIcon(hazard: string): string | null {
  const type = parseHazardType(hazard);

  switch (type) {
    case "turbulence":
      return "🌀";
    case "icing":
      return "❄️";
    case "thunderstorm":
      return "⛈️";
    case "volcanic_ash":
      return "🌋";
    case "wind_shear":
      return "💨";
    default:
      return null;
  }
}

/**
 * Get color class for icing risk level
 */
export function getIcingRiskColor(
  risk: "low" | "moderate" | "high"
): { bg: string; text: string } {
  switch (risk) {
    case "high":
      return { bg: "#ef444420", text: "#ef4444" };
    case "moderate":
      return { bg: "#f59e0b20", text: "#f59e0b" };
    case "low":
      return { bg: "#10b98120", text: "#10b981" };
  }
}
