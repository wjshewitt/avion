import type { RiskInputs, WeatherRiskFactorResult } from "@/lib/weather/risk/types";

export function assessTrendStability(input: RiskInputs): WeatherRiskFactorResult {
  // Basic heuristic: compare METAR flight_category with first TAF segment flight_category if present
  const metCat = input.metar?.flight_category;
  const tafFirst = input.taf?.forecast?.[0]?.flight_category;
  let score = 0;
  const messages: string[] = [];
  const sources: string[] = [];
  let details: WeatherRiskFactorResult["details"];

  if (metCat) sources.push("metar.flight_category");
  if (tafFirst) sources.push("taf.forecast[0].flight_category");

  if (metCat && tafFirst) {
    const order = ["LIFR", "IFR", "MVFR", "VFR"] as const;
    const idxMet = order.indexOf(metCat as any);
    const idxTaf = order.indexOf(tafFirst as any);
    if (idxTaf < 0 || idxMet < 0) {
      // unknown
      messages.push("Insufficient data to assess trend");
    } else if (idxTaf < idxMet) {
      // Deteriorating
      score = 40;
      messages.push("Trend indicates potential deterioration");
      details = {
        actualValue: `${metCat} → ${tafFirst}`,
        threshold: "Deterioration to LIFR/IFR = high risk",
        impact: "Worsening conditions may delay or cancel operations - monitor forecasts closely"
      };
    } else if (idxTaf > idxMet) {
      // Improving
      score = 10;
      messages.push("Trend indicates improvement");
      details = {
        actualValue: `${metCat} → ${tafFirst}`,
        threshold: "Improvement from LIFR/IFR = favorable",
        impact: "Improving conditions favorable for operations - situation expected to improve"
      };
    } else {
      score = 20;
      messages.push("Conditions stable");
      details = {
        actualValue: `${metCat} (stable)`,
        threshold: "Stable VFR/MVFR = low risk | Stable IFR/LIFR = moderate risk",
        impact: "No significant change expected in near-term forecast period"
      };
    }
  } else {
    messages.push("Insufficient data to assess trend");
  }

  const severity = score >= 70 ? "high" : score >= 40 ? "moderate" : "low";
  return {
    name: "trend_stability",
    score,
    confidencePenalty: metCat && tafFirst ? 0 : 0.1,
    severity,
    messages,
    details,
    sources,
  };
}
