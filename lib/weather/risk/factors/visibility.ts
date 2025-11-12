import type { RiskInputs, WeatherRiskFactorResult } from "@/lib/weather/risk/types";

export function assessVisibility(input: RiskInputs): WeatherRiskFactorResult {
  const vis = input.metar?.visibility;
  let miles = vis?.miles_float ?? (typeof vis?.miles === "number" ? vis?.miles : undefined);
  const sources: string[] = [];
  let score = 0;
  let messages: string[] = [];
  let details: WeatherRiskFactorResult["details"];

  if (typeof miles === "number") {
    sources.push("metar.visibility");
    if (miles < 1) score = 90;
    else if (miles < 3) score = 70;
    else if (miles < 5) score = 45;
    else if (miles < 7) score = 25;
    
    if (miles < 1) messages.push(`Very low visibility ${miles.toFixed(1)} SM`);
    else if (score > 0) messages.push(`Reduced visibility ${miles.toFixed(1)} SM`);
    else messages.push(`Visibility ${miles.toFixed(1)} SM`);

    details = {
      actualValue: `${miles.toFixed(1)} SM`,
      threshold: "1 SM severe | 3 SM high | 5 SM moderate",
      impact: miles < 1
        ? "IFR operations required - significant visual restriction affecting all phases"
        : miles < 3
        ? "Marginal VFR/IFR conditions - visual navigation and pattern work restricted"
        : miles < 5
        ? "Reduced visibility affects visual navigation and approach procedures"
        : "Visibility within acceptable limits for visual operations"
    };
  } else if (input.metar?.flight_category) {
    // Fallback to flight_category when detailed visibility data is unavailable
    sources.push("metar.flight_category");
    const cat = input.metar.flight_category;
    switch (cat) {
      case "LIFR":
        score = 85;
        messages.push("LIFR: Visibility severely restricted");
        details = {
          actualValue: "LIFR",
          threshold: "Based on flight category",
          impact: "Very low visibility or ceiling - IFR operations required"
        };
        break;
      case "IFR":
        score = 65;
        messages.push("IFR: Visibility reduced");
        details = {
          actualValue: "IFR",
          threshold: "Based on flight category",
          impact: "Reduced visibility or ceiling - instrument operations required"
        };
        break;
      case "MVFR":
        score = 40;
        messages.push("MVFR: Marginal visibility");
        details = {
          actualValue: "MVFR",
          threshold: "Based on flight category",
          impact: "Marginal visibility or ceiling - caution advised"
        };
        break;
      case "VFR":
        score = 10;
        messages.push("VFR: Good visibility");
        details = {
          actualValue: "VFR",
          threshold: "Based on flight category",
          impact: "Visibility within acceptable limits"
        };
        break;
    }
  } else {
    messages.push("Visibility not reported");
  }

  const severity = score >= 70 ? "high" : score >= 40 ? "moderate" : "low";
  
  // Confidence penalty: none for detailed data, minor for flight_category fallback, higher for no data
  let confidencePenalty = 0;
  if (typeof miles === "number") {
    confidencePenalty = 0;
  } else if (input.metar?.flight_category) {
    confidencePenalty = 0.05; // Small penalty for using category instead of precise data
  } else {
    confidencePenalty = 0.2; // Larger penalty for missing data
  }
  
  return {
    name: "visibility",
    score,
    confidencePenalty,
    severity,
    messages,
    details,
    sources,
  };
}
