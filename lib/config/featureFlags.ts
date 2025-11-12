const BOOLEAN_TRUE_VALUES = new Set(["1", "true", "yes", "on"]);

function normalizeFlagValue(value: string | undefined | null): string | null {
  if (!value) return null;
  return value.trim().toLowerCase();
}

export function isWeatherSsotEnabled(): boolean {
  const clientFlag = normalizeFlagValue(process.env.NEXT_PUBLIC_WEATHER_SSOT_ENABLED);
  const serverFlag = normalizeFlagValue(process.env.WEATHER_SSOT_ENABLED);

  const effective = clientFlag ?? serverFlag;

  if (effective === null) {
    return false;
  }

  if (BOOLEAN_TRUE_VALUES.has(effective)) {
    return true;
  }

  return false;
}

export function getWeatherSsotFlag(): "enabled" | "disabled" {
  return isWeatherSsotEnabled() ? "enabled" : "disabled";
}

export function isWeatherRiskExplanationEnabled(): boolean {
  const clientFlag = normalizeFlagValue(process.env.NEXT_PUBLIC_WEATHER_RISK_EXPLANATION_ENABLED);
  const serverFlag = normalizeFlagValue(process.env.WEATHER_RISK_EXPLANATION_ENABLED);

  const effective = clientFlag ?? serverFlag;

  if (effective === null) {
    return false;
  }

  if (BOOLEAN_TRUE_VALUES.has(effective)) {
    return true;
  }

  return false;
}
