import type { RiskInputs, WeatherRiskFactorResult } from "@/lib/weather/risk/types";

export function assessSurfaceWind(input: RiskInputs): WeatherRiskFactorResult {
  const sources: string[] = [];
  let score = 0;
  let messages: string[] = [];
  let details: WeatherRiskFactorResult["details"];

  const wind = input.metar?.wind;
  if (wind) {
    sources.push("metar.wind");
    const spd = wind.speed_kts ?? 0;
    const gst = wind.gust_kts ?? 0;
    const eff = Math.max(spd, gst);
    if (eff >= 35) score = 80;
    else if (eff >= 25) score = 55;
    else if (eff >= 15) score = 30;
    if (gst - spd >= 10) score = Math.min(100, score + 15);

    if (eff >= 25) messages.push(`Strong surface winds ${eff}kt${gst ? ` (gusts ${gst}kt)` : ""}`);
    else if (eff >= 15) messages.push(`Moderate surface winds ${eff}kt${gst ? ` (gusts ${gst}kt)` : ""}`);
    else if (eff > 0) messages.push(`Surface winds ${eff}kt${gst ? ` (gusts ${gst}kt)` : ""}`);

    details = {
      actualValue: `${spd}kt${gst > spd ? ` (gusts ${gst}kt)` : ""}`,
      threshold: "15kt moderate | 25kt high | 35kt severe",
      impact: gst - spd >= 10 
        ? "Gusty conditions increase landing difficulty and may require special crosswind procedures"
        : eff >= 25
        ? "Strong sustained winds may exceed crosswind limits for smaller aircraft"
        : eff >= 15
        ? "Moderate winds may affect approach stability and ground operations"
        : "Wind conditions within normal operational limits"
    };
  }

  if (!wind) {
    messages.push("Surface wind data unavailable");
  }

  const severity = score >= 70 ? "high" : score >= 40 ? "moderate" : "low";
  return {
    name: "surface_wind",
    score,
    confidencePenalty: wind ? 0 : 0.2,
    severity,
    messages,
    details,
    sources,
  };
}
