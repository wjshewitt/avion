import type { RiskInputs, WeatherRiskFactorResult } from "@/lib/weather/risk/types";

function hasVisibleMoisture(raw?: string): boolean {
  if (!raw) return false;
  return /(RA|DZ|SN|SG|PL|FG|BR)/.test(raw);
}

export function assessTemperature(input: RiskInputs): WeatherRiskFactorResult {
  const metar = input.metar;
  const sources: string[] = [];
  const messages: string[] = [];

  const tempC = metar?.temperature?.celsius ?? null;
  const dewC = metar?.dewpoint?.celsius ?? null;
  const spread = tempC !== null && dewC !== null ? tempC - dewC : null;

  if (tempC !== null) {
    sources.push("metar.temperature");
  }
  if (dewC !== null) {
    sources.push("metar.dewpoint");
  }

  const raw = metar?.raw_text;
  const moistureFromWx = hasVisibleMoisture(raw);
  const hasBknOvcClouds = Boolean(
    metar?.clouds?.some((layer) =>
      layer.code && (layer.code.startsWith("BKN") || layer.code.startsWith("OVC"))
    )
  );

  const nearSaturated = spread !== null && spread <= 2;
  const hasMoisture = moistureFromWx || nearSaturated || hasBknOvcClouds;

  let score = 0;
  let icingFlag = false;

  if (tempC !== null) {
    // Cold-side / icing risk
    if (tempC <= 0 && tempC >= -10 && hasMoisture) {
      score = 80; // classic severe icing envelope
      icingFlag = true;
      messages.push("Temperature well below freezing with moisture – significant icing risk");
    } else if (tempC < -10 && tempC >= -20 && hasMoisture) {
      score = 70; // rime / mixed icing band
      icingFlag = true;
      messages.push("Subfreezing temperature with moisture – icing conditions likely");
    } else if (tempC > 0 && tempC <= 3 && hasMoisture) {
      score = 55; // near-freezing with moisture
      icingFlag = true;
      messages.push("Temperature near freezing with moisture – icing possible");
    } else if (tempC <= 0 && hasMoisture) {
      score = 70;
      icingFlag = true;
      messages.push("Subfreezing temperature with moisture – freezing conditions likely");
    } else if (tempC <= 0 && !hasMoisture && spread !== null && spread <= 3) {
      // Near-saturated cold air (frost/ground icing concerns)
      score = 50;
      messages.push("Subfreezing, near-saturated air – ground icing and frost risk");
    }

    // Cold but dry: still low risk for ground icing/de-icing
    if (score === 0 && tempC <= 0) {
      score = 30;
      messages.push("Subfreezing temperature – ensure appropriate de/anti-icing procedures");
    }

    // Hot-side / density altitude and performance risk
    if (tempC >= 40) {
      score = Math.max(score, 70);
      messages.push(
        "Extreme heat – density altitude and brake energy limits may significantly affect performance"
      );
    } else if (tempC >= 35) {
      score = Math.max(score, 55);
      messages.push(
        "Very hot conditions – density altitude may reduce climb and increase takeoff distance"
      );
    } else if (tempC >= 30) {
      score = Math.max(score, 35);
      messages.push("Hot conditions – performance margin reduced due to higher density altitude");
    }
  }

  if (tempC === null) {
    messages.push("Temperature not reported");
  }

  const severity: WeatherRiskFactorResult["severity"] =
    score >= 70 ? "high" : score >= 40 ? "moderate" : "low";

  let details: WeatherRiskFactorResult["details"];
  if (tempC !== null) {
    details = {
      actualValue:
        dewC !== null
          ? `${tempC.toFixed(1)} °C / dewpoint ${dewC.toFixed(1)} °C`
          : `${tempC.toFixed(1)} °C`,
      threshold: "Icing: +3°C to -20°C with moisture | Heat: ≥30°C performance impact",
      impact: icingFlag
        ? severity === "high"
          ? "Conditions support significant structural icing in clouds/precip; consider routing or altitude changes."
          : "Icing possible; use anti-ice systems and monitor closely in clouds and precipitation."
        : tempC >= 30
        ? "High temperature increases density altitude and may require longer takeoff distances or reduced payload."
        : "Temperature within normal operational range for most corporate operations.",
    };
  }

  const confidencePenalty = tempC !== null ? 0 : 0.2;

  return {
    name: "temperature",
    score,
    confidencePenalty,
    severity,
    messages,
    details,
    sources,
  };
}
