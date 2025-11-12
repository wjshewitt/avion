/**
 * Weather Concern Detection and Advisory System
 * Identifies weather conditions that may impact flight safety
 */

import type {
  DecodedMetar,
  DecodedTaf,
  TafForecastPeriod,
  WeatherConcernType,
  WeatherSeverity,
} from "@/types/checkwx";

// ============================================================================
// Weather Concern Types and Interfaces
// ============================================================================

export interface WeatherConcern {
  type: WeatherConcernType;
  severity: WeatherSeverity;
  description: string;
  airport: string;
  source: "METAR" | "TAF";
  timestamp?: string | { from: string; to: string };
  details?: {
    current_value?: number | string;
    threshold?: number | string;
    unit?: string;
  };
}

// Helper to format TAF period timestamp for display
function formatPeriodTime(timestamp: string | { from: string; to: string } | undefined): string {
  if (!timestamp) return "forecast period";
  if (typeof timestamp === "string") {
    return new Date(timestamp).toLocaleTimeString();
  }
  return new Date(timestamp.from).toLocaleTimeString();
}

export interface WeatherThresholds {
  visibility: {
    low: number; // SM
    moderate: number; // SM
    high: number; // SM
  };
  ceiling: {
    low: number; // feet
    moderate: number; // feet
    high: number; // feet
  };
  wind: {
    moderate: number; // knots
    high: number; // knots
    extreme: number; // knots
  };
  gusts: {
    moderate: number; // knots above steady wind
    high: number; // knots above steady wind
    extreme: number; // knots above steady wind
  };
}

// Default weather thresholds based on common aviation standards
export const DEFAULT_WEATHER_THRESHOLDS: WeatherThresholds = {
  visibility: {
    low: 1, // LIFR
    moderate: 3, // IFR
    high: 5, // MVFR
  },
  ceiling: {
    low: 500, // LIFR
    moderate: 1000, // IFR
    high: 3000, // MVFR
  },
  wind: {
    moderate: 15,
    high: 25,
    extreme: 35,
  },
  gusts: {
    moderate: 10,
    high: 15,
    extreme: 20,
  },
};

// ============================================================================
// Weather Concern Detection Functions
// ============================================================================

/**
 * Analyzes METAR data for weather concerns
 */
export function analyzeMetarConcerns(
  metar: DecodedMetar,
  thresholds: WeatherThresholds = DEFAULT_WEATHER_THRESHOLDS
): WeatherConcern[] {
  const concerns: WeatherConcern[] = [];

  // Visibility concerns
  if (metar.visibility?.miles_float !== undefined) {
    const visibility = metar.visibility.miles_float;

    if (visibility <= thresholds.visibility.low) {
      concerns.push({
        type: "low_visibility",
        severity: "extreme",
        description: `Extremely low visibility: ${visibility} SM`,
        airport: metar.icao,
        source: "METAR",
        timestamp: metar.observed,
        details: {
          current_value: visibility,
          threshold: thresholds.visibility.low,
          unit: "SM",
        },
      });
    } else if (visibility <= thresholds.visibility.moderate) {
      concerns.push({
        type: "low_visibility",
        severity: "high",
        description: `Low visibility: ${visibility} SM`,
        airport: metar.icao,
        source: "METAR",
        timestamp: metar.observed,
        details: {
          current_value: visibility,
          threshold: thresholds.visibility.moderate,
          unit: "SM",
        },
      });
    } else if (visibility <= thresholds.visibility.high) {
      concerns.push({
        type: "low_visibility",
        severity: "moderate",
        description: `Reduced visibility: ${visibility} SM`,
        airport: metar.icao,
        source: "METAR",
        timestamp: metar.observed,
        details: {
          current_value: visibility,
          threshold: thresholds.visibility.high,
          unit: "SM",
        },
      });
    }
  }

  // Ceiling concerns (lowest cloud layer with BKN or OVC)
  if (metar.clouds && metar.clouds.length > 0) {
    const ceilingLayer = metar.clouds.find(
      (cloud) => cloud.code === "BKN" || cloud.code === "OVC"
    );

    if (ceilingLayer?.feet !== undefined) {
      const ceiling = ceilingLayer.feet;

      if (ceiling <= thresholds.ceiling.low) {
        concerns.push({
          type: "low_ceiling",
          severity: "extreme",
          description: `Extremely low ceiling: ${ceiling.toLocaleString()} ft ${ceilingLayer.code}`,
          airport: metar.icao,
          source: "METAR",
          timestamp: metar.observed,
          details: {
            current_value: ceiling,
            threshold: thresholds.ceiling.low,
            unit: "ft",
          },
        });
      } else if (ceiling <= thresholds.ceiling.moderate) {
        concerns.push({
          type: "low_ceiling",
          severity: "high",
          description: `Low ceiling: ${ceiling.toLocaleString()} ft ${ceilingLayer.code}`,
          airport: metar.icao,
          source: "METAR",
          timestamp: metar.observed,
          details: {
            current_value: ceiling,
            threshold: thresholds.ceiling.moderate,
            unit: "ft",
          },
        });
      } else if (ceiling <= thresholds.ceiling.high) {
        concerns.push({
          type: "low_ceiling",
          severity: "moderate",
          description: `Reduced ceiling: ${ceiling.toLocaleString()} ft ${ceilingLayer.code}`,
          airport: metar.icao,
          source: "METAR",
          timestamp: metar.observed,
          details: {
            current_value: ceiling,
            threshold: thresholds.ceiling.high,
            unit: "ft",
          },
        });
      }
    }
  }

  // Wind concerns
  if (metar.wind?.speed_kts !== undefined) {
    const windSpeed = metar.wind.speed_kts;

    if (windSpeed >= thresholds.wind.extreme) {
      concerns.push({
        type: "high_winds",
        severity: "extreme",
        description: `Extreme winds: ${windSpeed} kt from ${metar.wind.degrees}°`,
        airport: metar.icao,
        source: "METAR",
        timestamp: metar.observed,
        details: {
          current_value: windSpeed,
          threshold: thresholds.wind.extreme,
          unit: "kt",
        },
      });
    } else if (windSpeed >= thresholds.wind.high) {
      concerns.push({
        type: "high_winds",
        severity: "high",
        description: `High winds: ${windSpeed} kt from ${metar.wind.degrees}°`,
        airport: metar.icao,
        source: "METAR",
        timestamp: metar.observed,
        details: {
          current_value: windSpeed,
          threshold: thresholds.wind.high,
          unit: "kt",
        },
      });
    } else if (windSpeed >= thresholds.wind.moderate) {
      concerns.push({
        type: "high_winds",
        severity: "moderate",
        description: `Moderate winds: ${windSpeed} kt from ${metar.wind.degrees}°`,
        airport: metar.icao,
        source: "METAR",
        timestamp: metar.observed,
        details: {
          current_value: windSpeed,
          threshold: thresholds.wind.moderate,
          unit: "kt",
        },
      });
    }

    // Gust concerns
    if (metar.wind.gust_kts !== undefined) {
      const gustSpeed = metar.wind.gust_kts;
      const gustDifference = gustSpeed - windSpeed;

      if (gustDifference >= thresholds.gusts.extreme) {
        concerns.push({
          type: "gusts",
          severity: "extreme",
          description: `Extreme gusts: ${gustSpeed} kt (${gustDifference} kt above steady wind)`,
          airport: metar.icao,
          source: "METAR",
          timestamp: metar.observed,
          details: {
            current_value: gustDifference,
            threshold: thresholds.gusts.extreme,
            unit: "kt difference",
          },
        });
      } else if (gustDifference >= thresholds.gusts.high) {
        concerns.push({
          type: "gusts",
          severity: "high",
          description: `Strong gusts: ${gustSpeed} kt (${gustDifference} kt above steady wind)`,
          airport: metar.icao,
          source: "METAR",
          timestamp: metar.observed,
          details: {
            current_value: gustDifference,
            threshold: thresholds.gusts.high,
            unit: "kt difference",
          },
        });
      } else if (gustDifference >= thresholds.gusts.moderate) {
        concerns.push({
          type: "gusts",
          severity: "moderate",
          description: `Moderate gusts: ${gustSpeed} kt (${gustDifference} kt above steady wind)`,
          airport: metar.icao,
          source: "METAR",
          timestamp: metar.observed,
          details: {
            current_value: gustDifference,
            threshold: thresholds.gusts.moderate,
            unit: "kt difference",
          },
        });
      }
    }
  }

  return concerns;
}

/**
 * Analyzes TAF forecast periods for weather concerns
 */
export function analyzeTafConcerns(
  taf: DecodedTaf,
  thresholds: WeatherThresholds = DEFAULT_WEATHER_THRESHOLDS
): WeatherConcern[] {
  const concerns: WeatherConcern[] = [];

  if (!taf.forecast || taf.forecast.length === 0) {
    return concerns;
  }

  // Analyze each forecast period
  taf.forecast.forEach((period: TafForecastPeriod) => {
    // Visibility concerns in forecast
    if (period.visibility?.miles_float !== undefined) {
      const visibility = period.visibility.miles_float;

      if (visibility <= thresholds.visibility.low) {
        concerns.push({
          type: "low_visibility",
          severity: "extreme",
          description: `Forecast extremely low visibility: ${visibility} SM at ${formatPeriodTime(period.timestamp)}`,
          airport: taf.icao,
          source: "TAF",
          timestamp: period.timestamp,
          details: {
            current_value: visibility,
            threshold: thresholds.visibility.low,
            unit: "SM",
          },
        });
      } else if (visibility <= thresholds.visibility.moderate) {
        concerns.push({
          type: "low_visibility",
          severity: "high",
          description: `Forecast low visibility: ${visibility} SM at ${formatPeriodTime(period.timestamp)}`,
          airport: taf.icao,
          source: "TAF",
          timestamp: period.timestamp,
          details: {
            current_value: visibility,
            threshold: thresholds.visibility.moderate,
            unit: "SM",
          },
        });
      }
    }

    // Ceiling concerns in forecast
    if (period.clouds && period.clouds.length > 0) {
      const ceilingLayer = period.clouds.find(
        (cloud) => cloud.code === "BKN" || cloud.code === "OVC"
      );

      if (ceilingLayer?.feet !== undefined) {
        const ceiling = ceilingLayer.feet;

        if (ceiling <= thresholds.ceiling.low) {
          concerns.push({
            type: "low_ceiling",
            severity: "extreme",
            description: `Forecast extremely low ceiling: ${ceiling.toLocaleString()} ft ${ceilingLayer.code} at ${formatPeriodTime(period.timestamp)}`,
            airport: taf.icao,
            source: "TAF",
            timestamp: period.timestamp,
            details: {
              current_value: ceiling,
              threshold: thresholds.ceiling.low,
              unit: "ft",
            },
          });
        } else if (ceiling <= thresholds.ceiling.moderate) {
          concerns.push({
            type: "low_ceiling",
            severity: "high",
            description: `Forecast low ceiling: ${ceiling.toLocaleString()} ft ${ceilingLayer.code} at ${formatPeriodTime(period.timestamp)}`,
            airport: taf.icao,
            source: "TAF",
            timestamp: period.timestamp,
            details: {
              current_value: ceiling,
              threshold: thresholds.ceiling.moderate,
              unit: "ft",
            },
          });
        }
      }
    }

    // Wind concerns in forecast
    if (period.wind?.speed_kts !== undefined) {
      const windSpeed = period.wind.speed_kts;

      if (windSpeed >= thresholds.wind.extreme) {
        concerns.push({
          type: "high_winds",
          severity: "extreme",
          description: `Forecast extreme winds: ${windSpeed} kt from ${period.wind.degrees}° at ${formatPeriodTime(period.timestamp)}`,
          airport: taf.icao,
          source: "TAF",
          timestamp: period.timestamp,
          details: {
            current_value: windSpeed,
            threshold: thresholds.wind.extreme,
            unit: "kt",
          },
        });
      } else if (windSpeed >= thresholds.wind.high) {
        concerns.push({
          type: "high_winds",
          severity: "high",
          description: `Forecast high winds: ${windSpeed} kt from ${period.wind.degrees}° at ${formatPeriodTime(period.timestamp)}`,
          airport: taf.icao,
          source: "TAF",
          timestamp: period.timestamp,
          details: {
            current_value: windSpeed,
            threshold: thresholds.wind.high,
            unit: "kt",
          },
        });
      }

      // Forecast gust concerns
      if (period.wind.gust_kts !== undefined) {
        const gustSpeed = period.wind.gust_kts;
        const gustDifference = gustSpeed - windSpeed;

        if (gustDifference >= thresholds.gusts.extreme) {
          concerns.push({
            type: "gusts",
            severity: "extreme",
            description: `Forecast extreme gusts: ${gustSpeed} kt at ${formatPeriodTime(period.timestamp)}`,
            airport: taf.icao,
            source: "TAF",
            timestamp: period.timestamp,
            details: {
              current_value: gustDifference,
              threshold: thresholds.gusts.extreme,
              unit: "kt difference",
            },
          });
        } else if (gustDifference >= thresholds.gusts.high) {
          concerns.push({
            type: "gusts",
            severity: "high",
            description: `Forecast strong gusts: ${gustSpeed} kt at ${formatPeriodTime(period.timestamp)}`,
            airport: taf.icao,
            source: "TAF",
            timestamp: period.timestamp,
            details: {
              current_value: gustDifference,
              threshold: thresholds.gusts.high,
              unit: "kt difference",
            },
          });
        }
      }
    }
  });

  return concerns;
}

/**
 * Analyzes complete weather data for both airports and returns all concerns
 */
export function analyzeRouteWeatherConcerns(
  departureData: { metar?: DecodedMetar; taf?: DecodedTaf },
  arrivalData: { metar?: DecodedMetar; taf?: DecodedTaf },
  thresholds: WeatherThresholds = DEFAULT_WEATHER_THRESHOLDS
): WeatherConcern[] {
  const concerns: WeatherConcern[] = [];

  // Analyze departure airport
  if (departureData.metar) {
    concerns.push(...analyzeMetarConcerns(departureData.metar, thresholds));
  }
  if (departureData.taf) {
    concerns.push(...analyzeTafConcerns(departureData.taf, thresholds));
  }

  // Analyze arrival airport
  if (arrivalData.metar) {
    concerns.push(...analyzeMetarConcerns(arrivalData.metar, thresholds));
  }
  if (arrivalData.taf) {
    concerns.push(...analyzeTafConcerns(arrivalData.taf, thresholds));
  }

  // Sort concerns by severity (extreme first)
  const severityOrder: Record<WeatherSeverity, number> = {
    extreme: 0,
    high: 1,
    moderate: 2,
    low: 3,
  };

  return concerns.sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
  );
}

/**
 * Gets the color class for a weather concern severity
 */
export function getSeverityColor(severity: WeatherSeverity): string {
  switch (severity) {
    case "extreme":
      return "text-red-400 border-red-500/30 bg-red-500/10";
    case "high":
      return "text-orange-400 border-orange-500/30 bg-orange-500/10";
    case "moderate":
      return "text-yellow-400 border-yellow-500/30 bg-yellow-500/10";
    case "low":
      return "text-blue-400 border-blue-500/30 bg-blue-500/10";
    default:
      return "text-gray-400 border-gray-500/30 bg-gray-500/10";
  }
}

/**
 * Gets the icon name for a weather concern type
 */
export function getConcernIcon(type: WeatherConcernType): string {
  switch (type) {
    case "low_visibility":
      return "Eye";
    case "low_ceiling":
      return "Cloud";
    case "high_winds":
      return "Wind";
    case "gusts":
      return "Zap";
    case "icing_conditions":
      return "Snowflake";
    case "thunderstorms":
      return "CloudLightning";
    case "turbulence":
      return "Waves";
    default:
      return "AlertTriangle";
  }
}

/**
 * Generates a summary of weather concerns for briefing
 */
export function generateWeatherSummary(concerns: WeatherConcern[]): {
  totalConcerns: number;
  severityCounts: Record<WeatherSeverity, number>;
  typeCounts: Record<WeatherConcernType, number>;
  hasExtremeConditions: boolean;
  hasHighRiskConditions: boolean;
  summary: string;
} {
  const severityCounts: Record<WeatherSeverity, number> = {
    extreme: 0,
    high: 0,
    moderate: 0,
    low: 0,
  };

  const typeCounts: Record<WeatherConcernType, number> = {
    low_visibility: 0,
    low_ceiling: 0,
    high_winds: 0,
    gusts: 0,
    icing_conditions: 0,
    thunderstorms: 0,
    turbulence: 0,
  };

  concerns.forEach((concern) => {
    severityCounts[concern.severity]++;
    typeCounts[concern.type]++;
  });

  const hasExtremeConditions = severityCounts.extreme > 0;
  const hasHighRiskConditions =
    severityCounts.extreme > 0 || severityCounts.high > 0;

  let summary = "";
  if (concerns.length === 0) {
    summary = "No significant weather concerns identified for this route.";
  } else if (hasExtremeConditions) {
    summary = `EXTREME WEATHER CONDITIONS DETECTED. ${severityCounts.extreme} extreme and ${severityCounts.high} high-severity concerns identified. Exercise extreme caution.`;
  } else if (hasHighRiskConditions) {
    summary = `High-risk weather conditions present. ${severityCounts.high} high-severity concerns identified. Review conditions carefully before departure.`;
  } else {
    summary = `${concerns.length} weather concern(s) identified. Conditions are generally acceptable but monitor weather updates.`;
  }

  return {
    totalConcerns: concerns.length,
    severityCounts,
    typeCounts,
    hasExtremeConditions,
    hasHighRiskConditions,
    summary,
  };
}
