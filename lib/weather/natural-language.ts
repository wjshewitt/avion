/**
 * Natural Language Weather Formatter
 * Converts technical weather data into human-readable summaries
 */

import type { DecodedMetar, DecodedTaf, WindData } from "@/types/checkwx";
import type { AtmosphereVariant } from "@/components/weather/AvionAtmosphereCard";
import type { AirportTemporalProfile } from "@/lib/time/authority";
import type { DaySegment } from "@/lib/time/solar";
import { analyzeTafConcerns, type WeatherConcern } from "./weatherConcerns";

export interface NaturalLanguageSummary {
  current: string;
  forecast?: string;
}

/**
 * Describes time of day in natural language
 */
function describeTimeOfDay(segment: DaySegment, hour?: number): string {
  if (segment === "night") return "night";
  if (segment === "dawn") return "early morning";
  if (segment === "dusk") return "evening";
  
  // For day segment, differentiate between morning and afternoon
  if (segment === "day") {
    if (hour !== undefined) {
      return hour < 12 ? "morning" : "afternoon";
    }
    return "day";
  }
  
  return "day";
}

/**
 * Describes weather variant in natural language
 */
function describeWeather(variant: AtmosphereVariant): string {
  switch (variant) {
    case "sunny":
      return "sunny";
    case "cloudy":
      return "cloudy";
    case "heavy-rain":
      return "rainy";
    case "thunderstorm":
      return "stormy";
    case "clear-night":
      return "clear";
    case "arctic-snow":
      return "snowy";
    case "low-vis-fog":
      return "foggy";
    default:
      return "clear";
  }
}

/**
 * Describes wind conditions in natural language
 */
function describeWinds(windData?: WindData): string {
  if (!windData || !windData.speed_kts) {
    return "calm winds";
  }

  const speed = Math.round(windData.speed_kts);
  const gust = windData.gust_kts ? Math.round(windData.gust_kts) : undefined;

  let windDesc = "";
  
  if (speed <= 3) {
    windDesc = "calm winds";
  } else if (speed <= 10) {
    windDesc = `${speed} knots of light wind`;
  } else if (speed <= 20) {
    windDesc = `${speed} knots of wind`;
  } else if (speed <= 30) {
    windDesc = `strong ${speed} knot winds`;
  } else {
    windDesc = `very strong ${speed} knot winds`;
  }

  if (gust && gust > speed + 5) {
    windDesc += `, gusting to ${gust} knots`;
  }

  return windDesc;
}

/**
 * Extracts visibility in statute miles from VisibilityData
 */
function extractVisibilitySm(visibility?: { miles?: string | number; miles_float?: number; meters_float?: number } | null): number | null {
  if (!visibility) return null;
  
  // Try miles_float first
  if (visibility.miles_float !== undefined && visibility.miles_float !== null) {
    return visibility.miles_float;
  }
  
  // Try miles as number
  if (typeof visibility.miles === "number") {
    return visibility.miles;
  }
  
  // Try converting meters to miles
  if (visibility.meters_float !== undefined && visibility.meters_float !== null) {
    return Math.round((visibility.meters_float / 1609.34) * 10) / 10;
  }
  
  return null;
}

/**
 * Describes visibility in natural language
 */
function describeVisibility(visibility?: { miles?: string | number; miles_float?: number; meters_float?: number } | null): string {
  const visibilitySm = extractVisibilitySm(visibility);
  
  if (visibilitySm === null) {
    return "visibility unknown";
  }

  if (visibilitySm >= 10) {
    return "excellent visibility";
  } else if (visibilitySm >= 5) {
    return "good visibility";
  } else if (visibilitySm >= 3) {
    return "reduced visibility";
  } else if (visibilitySm >= 1) {
    return "poor visibility";
  } else {
    return "very poor visibility";
  }
}

/**
 * Formats current weather conditions in natural language
 */
export function formatCurrentConditions(
  metar: DecodedMetar,
  variant: AtmosphereVariant,
  temporalProfile?: AirportTemporalProfile | null
): string {
  const time = temporalProfile?.clock.localTime?.split(" ")[0] || "now";
  const segment = temporalProfile?.sun.segment || "day";
  
  // Get hour from temporal profile for morning/afternoon distinction
  const hour = temporalProfile?.clock.localIso 
    ? new Date(temporalProfile.clock.localIso).getHours() 
    : undefined;
  
  const timeOfDay = describeTimeOfDay(segment, hour);
  const weather = describeWeather(variant);
  const winds = describeWinds(metar.wind);
  const visibility = describeVisibility(metar.visibility);

  // Build natural sentence
  const parts: string[] = [];
  
  // Time and weather
  parts.push(`${time} and a ${weather} ${timeOfDay}.`);
  
  // Wind and visibility
  parts.push(`${capitalizeFirst(winds)}, and ${visibility}.`);

  return parts.join(" ");
}

/**
 * Analyzes TAF for significant forecast changes
 */
function describeForecastChange(
  taf: DecodedTaf,
  concerns: WeatherConcern[]
): string | undefined {
  if (!taf.forecast || taf.forecast.length === 0) {
    return undefined;
  }

  // Group concerns by type
  const windConcerns = concerns.filter(c => c.type === "high_winds" || c.type === "gusts");
  const visConcerns = concerns.filter(c => c.type === "low_visibility");
  const weatherConcerns = concerns.filter(c => c.type === "thunderstorms" || c.type === "icing_conditions");

  // Look for significant changes
  const changes: string[] = [];
  let timeframe = "later";

  // Determine timeframe from first concern
  if (concerns.length > 0 && concerns[0].timestamp) {
    const timestamp = typeof concerns[0].timestamp === "string" 
      ? concerns[0].timestamp 
      : concerns[0].timestamp.from;
    
    const forecastTime = new Date(timestamp);
    const now = new Date();
    const hoursAway = (forecastTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursAway < 6) {
      timeframe = "this evening";
    } else if (hoursAway < 12) {
      timeframe = "tonight";
    } else if (hoursAway < 24) {
      timeframe = "tomorrow morning";
    } else {
      timeframe = "tomorrow";
    }
  }

  // Describe wind changes
  if (windConcerns.length > 0) {
    const highestWind = windConcerns.reduce((max, c) => {
      const val = c.details?.current_value;
      const maxVal = max.details?.current_value;
      if (typeof val === "number" && typeof maxVal === "number") {
        return val > maxVal ? c : max;
      }
      return max;
    }, windConcerns[0]);

    if (highestWind.severity === "extreme" || highestWind.severity === "high") {
      const windSpeed = highestWind.details?.current_value;
      if (typeof windSpeed === "number") {
        changes.push(`winds increasing to ${Math.round(windSpeed)} knots`);
      } else {
        changes.push("significantly stronger winds");
      }
    }
  }

  // Describe visibility changes
  if (visConcerns.length > 0) {
    const worstVis = visConcerns.find(c => c.severity === "extreme") || visConcerns[0];
    if (worstVis.severity === "extreme") {
      changes.push("visibility dropping to very poor");
    } else if (worstVis.severity === "high") {
      changes.push("reduced visibility");
    }
  }

  // Describe ceiling changes
  const ceilingConcerns = concerns.filter(c => c.type === "low_ceiling");
  if (ceilingConcerns.length > 0) {
    const worstCeiling = ceilingConcerns.find(c => c.severity === "extreme") || ceilingConcerns[0];
    const ceilingValue = worstCeiling.details?.current_value;
    
    if (worstCeiling.severity === "extreme") {
      if (typeof ceilingValue === "number") {
        changes.push(`ceiling dropping to ${Math.round(ceilingValue)} feet`);
      } else {
        changes.push("very low ceilings");
      }
    } else if (worstCeiling.severity === "high") {
      changes.push("lowering ceilings");
    }
  }

  // Describe weather phenomena
  if (weatherConcerns.length > 0) {
    const hasThunderstorms = weatherConcerns.some(c => c.type === "thunderstorms");
    const hasIcing = weatherConcerns.some(c => c.type === "icing_conditions");
    
    if (hasThunderstorms) {
      changes.push("thunderstorms developing");
    } else if (hasIcing) {
      changes.push("icing conditions");
    }
  }

  // Describe turbulence
  const turbulenceConcerns = concerns.filter(c => c.type === "turbulence");
  if (turbulenceConcerns.length > 0) {
    const worstTurbulence = turbulenceConcerns.find(c => c.severity === "extreme" || c.severity === "high");
    if (worstTurbulence) {
      if (worstTurbulence.severity === "extreme") {
        changes.push("severe turbulence");
      } else if (worstTurbulence.severity === "high") {
        changes.push("moderate to severe turbulence");
      }
    }
  }

  // Check raw TAF text for precipitation indicators
  const tafText = taf.raw_text?.toLowerCase() || "";
  
  // Rain detection - only add if not already mentioned
  if (!changes.some(c => c.includes("rain") || c.includes("storm"))) {
    if (tafText.includes("+ra") || tafText.includes("tsra")) {
      changes.push("heavy rain");
    } else if (tafText.includes("-ra")) {
      changes.push("light rain");
    } else if (tafText.includes(" ra") || tafText.includes("shra")) {
      changes.push("moderate rain");
    }
  }

  // Snow detection - only add if not already mentioned
  if (!changes.some(c => c.includes("snow") || c.includes("icing"))) {
    if (tafText.includes("+sn")) {
      changes.push("heavy snow");
    } else if (tafText.includes("-sn")) {
      changes.push("light snow");
    } else if (tafText.includes(" sn")) {
      changes.push("snow");
    }
  }

  // Fallback for any unhandled significant concerns
  if (changes.length === 0 && concerns.length > 0) {
    const highSeverityConcerns = concerns.filter(c => c.severity === "high" || c.severity === "extreme");
    if (highSeverityConcerns.length > 0) {
      return "Conditions forecast to deteriorate. Check TAF for details.";
    }
    return "Forecast shows some changes. Review TAF for specifics.";
  }

  if (changes.length === 0) {
    return undefined;
  }

  // Build natural language list with proper grammar
  let changeDescription: string;
  if (changes.length === 1) {
    changeDescription = changes[0];
  } else if (changes.length === 2) {
    changeDescription = `${changes[0]} and ${changes[1]}`;
  } else {
    // Oxford comma for 3+ items
    const lastChange = changes[changes.length - 1];
    const otherChanges = changes.slice(0, -1).join(", ");
    changeDescription = `${otherChanges}, and ${lastChange}`;
  }

  const verb = concerns.some(c => c.severity === "high" || c.severity === "extreme")
    ? "worsen"
    : "change";

  return `Weather forecast to ${verb} by ${timeframe}, with ${changeDescription}.`;
}

/**
 * Formats forecast summary in natural language
 */
export function formatForecastSummary(
  taf?: DecodedTaf | null
): string | undefined {
  if (!taf || !taf.forecast || taf.forecast.length === 0) {
    return undefined;
  }

  // Analyze TAF for concerns
  const concerns = analyzeTafConcerns(taf);
  
  // Filter for moderate to extreme concerns only
  const significantConcerns = concerns.filter(
    c => c.severity === "moderate" || c.severity === "high" || c.severity === "extreme"
  );

  if (significantConcerns.length === 0) {
    return "Conditions forecast to remain stable.";
  }

  return describeForecastChange(taf, significantConcerns);
}

/**
 * Generates complete natural language weather summary
 */
export function generateWeatherSummary(
  metar: DecodedMetar,
  variant: AtmosphereVariant,
  temporalProfile?: AirportTemporalProfile | null,
  taf?: DecodedTaf | null
): NaturalLanguageSummary {
  const current = formatCurrentConditions(metar, variant, temporalProfile);
  const forecast = formatForecastSummary(taf);

  return {
    current,
    forecast,
  };
}

/**
 * Helper to capitalize first letter
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
