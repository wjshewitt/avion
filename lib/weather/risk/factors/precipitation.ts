import type { RiskInputs, WeatherRiskFactorResult } from "@/lib/weather/risk/types";

// Simple precipitation parser from METAR raw text
function hasWeather(raw?: string, codes: string[] = []): boolean {
  if (!raw) return false;
  return codes.some((c) => raw.includes(c));
}

export function assessPrecipitation(input: RiskInputs): WeatherRiskFactorResult {
  const raw = input.metar?.raw_text;
  const messages: string[] = [];
  const sources: string[] = [];
  let score = 0;
  let details: WeatherRiskFactorResult["details"];
  let weatherCodes: string[] = [];

  if (raw) {
    sources.push("metar.raw_text");
    
    const hasFreezing = hasWeather(raw, ["FZRA", "-FZRA", "PL"]);
    const hasThunderstorms = hasWeather(raw, ["+TSRA", "TSRA", "+RA", "TS"]);
    const hasSnow = hasWeather(raw, ["SN", "+SN", "-SN"]);
    const hasFogMist = hasWeather(raw, ["FG", "BR"]);
    
    if (hasThunderstorms) {
      score = Math.max(score, 70);
      messages.push("Thunderstorms or heavy rain in vicinity");
      weatherCodes.push("Thunderstorms");
    }
    if (hasFreezing) {
      score = Math.max(score, 80);
      messages.push("Freezing precipitation reported");
      weatherCodes.push("Freezing Rain");
    }
    if (hasSnow) {
      score = Math.max(score, 60);
      messages.push("Snow in vicinity");
      weatherCodes.push("Snow");
    }
    if (hasFogMist) {
      score = Math.max(score, 50);
      messages.push("Fog/mist reducing visibility");
      weatherCodes.push("Fog/Mist");
    }
    
    if (score === 0) {
      messages.push("No significant precipitation");
      weatherCodes.push("Clear");
    }

    details = {
      actualValue: weatherCodes.length > 0 ? weatherCodes.join(", ") : "None",
      threshold: "FZRA severe | TS high | SN/FG moderate",
      impact: hasFreezing
        ? "Icing hazard - severe structural risk, may require immediate diversion"
        : hasThunderstorms
        ? "Thunderstorm activity creates turbulence, wind shear, and lightning hazards"
        : hasSnow
        ? "Snow accumulation affects runway braking action and visibility"
        : hasFogMist
        ? "Fog and mist significantly reduce visibility for visual operations"
        : "No precipitation hazards affecting operations"
    };
  } else {
    messages.push("Precipitation data unavailable");
  }

  const severity = score >= 70 ? "high" : score >= 40 ? "moderate" : "low";
  return {
    name: "precipitation",
    score,
    confidencePenalty: raw ? 0 : 0.15,
    severity,
    messages,
    details,
    sources,
  };
}
