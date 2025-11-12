import type { RiskInputs, WeatherRiskFactorResult } from "@/lib/weather/risk/types";

export function assessCeilingClouds(input: RiskInputs): WeatherRiskFactorResult {
  const clouds = input.metar?.clouds ?? [];
  let lowest: number | undefined;
  for (const layer of clouds) {
    if (layer.code && ["BKN", "OVC"].some(k => layer.code.startsWith(k))) {
      const feet = layer.base_feet_agl ?? layer.feet;
      if (typeof feet === "number") {
        lowest = typeof lowest === "number" ? Math.min(lowest, feet) : feet;
      }
    }
  }

  let score = 0;
  let messages: string[] = [];
  const sources: string[] = [];
  let details: WeatherRiskFactorResult["details"];
  
  if (typeof lowest === "number") {
    sources.push("metar.clouds");
    if (lowest < 500) score = 90;
    else if (lowest < 1000) score = 75;
    else if (lowest < 2000) score = 55;
    else if (lowest < 3000) score = 30;
    
    if (lowest < 500) messages.push(`Very low ceiling ${lowest} ft AGL`);
    else if (score > 0) messages.push(`Low ceiling ${lowest} ft AGL`);
    else messages.push(`Ceiling ${lowest} ft AGL`);

    details = {
      actualValue: `${lowest} ft AGL`,
      threshold: "500ft severe | 1000ft high | 2000ft moderate",
      impact: lowest < 500
        ? "Critical ceiling - severely restricts operations, IFR approach required"
        : lowest < 1000
        ? "Low ceiling requires instrument approach and may prevent VFR traffic pattern work"
        : lowest < 2000
        ? "Marginal ceiling affects VFR operations and traffic pattern altitude"
        : "Ceiling adequate for normal operations"
    };
  } else if (input.metar?.flight_category) {
    // Fallback to flight_category when detailed ceiling data is unavailable
    sources.push("metar.flight_category");
    const cat = input.metar.flight_category;
    switch (cat) {
      case "LIFR":
        score = 85;
        messages.push("LIFR: Ceiling severely restricted");
        details = {
          actualValue: "LIFR",
          threshold: "Based on flight category",
          impact: "Very low visibility or ceiling - IFR operations required"
        };
        break;
      case "IFR":
        score = 70;
        messages.push("IFR: Ceiling reduced");
        details = {
          actualValue: "IFR",
          threshold: "Based on flight category",
          impact: "Reduced visibility or ceiling - instrument operations required"
        };
        break;
      case "MVFR":
        score = 45;
        messages.push("MVFR: Marginal ceiling");
        details = {
          actualValue: "MVFR",
          threshold: "Based on flight category",
          impact: "Marginal visibility or ceiling - caution advised"
        };
        break;
      case "VFR":
        score = 10;
        messages.push("VFR: Good ceiling");
        details = {
          actualValue: "VFR",
          threshold: "Based on flight category",
          impact: "Ceiling adequate for normal operations"
        };
        break;
    }
  } else {
    messages.push("Ceiling not reported");
  }

  const severity = score >= 70 ? "high" : score >= 40 ? "moderate" : "low";
  
  // Confidence penalty: none for detailed data, minor for flight_category fallback, higher for no data
  let confidencePenalty = 0;
  if (typeof lowest === "number") {
    confidencePenalty = 0;
  } else if (input.metar?.flight_category) {
    confidencePenalty = 0.05; // Small penalty for using category instead of precise data
  } else {
    confidencePenalty = 0.2; // Larger penalty for missing data
  }
  
  return {
    name: "ceiling_clouds",
    score,
    confidencePenalty,
    severity,
    messages,
    details,
    sources,
  };
}
