import type { DecodedMetar, DecodedTaf } from "@/types/checkwx";
import type { AtmosphereVariant } from "@/components/weather/AvionAtmosphereCard";
import {
  analyzeMetarConcerns,
  analyzeTafConcerns,
  DEFAULT_WEATHER_THRESHOLDS,
} from "@/lib/weather/weatherConcerns";

export interface AtmosphereContext {
  metar?: DecodedMetar | null;
  taf?: DecodedTaf | null;
  isNightOverride?: boolean;
}

export interface AtmosphereSelection {
  variant: AtmosphereVariant;
  isNight: boolean;
  tempC?: number | null;
  visibilitySm?: number | null;
  qnhInHg?: number | null;
}

function getVisibilitySm(metar?: DecodedMetar | null): number | null {
  if (!metar?.visibility) return null;
  if (typeof metar.visibility.miles === "number") return metar.visibility.miles;
  if (metar.visibility.miles_float != null) return metar.visibility.miles_float;
  if (typeof metar.visibility.meters_float === "number") {
    return Math.round((metar.visibility.meters_float / 1609.34) * 10) / 10;
  }
  return null;
}

function isNightFromObserved(metar?: DecodedMetar | null): boolean {
  if (!metar?.observed) return false;
  const d = new Date(metar.observed);
  if (Number.isNaN(d.getTime())) return false;
  const hour = d.getUTCHours();
  return hour < 6 || hour >= 18;
}

export function selectAtmosphereCard({ metar, taf, isNightOverride }: AtmosphereContext): AtmosphereSelection | null {
  if (!metar && !taf) return null;

  const concerns = [
    ...(metar ? analyzeMetarConcerns(metar, DEFAULT_WEATHER_THRESHOLDS) : []),
    ...(taf ? analyzeTafConcerns(taf, DEFAULT_WEATHER_THRESHOLDS) : []),
  ];

  const tempC = metar?.temperature?.celsius ?? null;
  const visibilitySm = getVisibilitySm(metar);
  const qnhInHg = metar?.barometer?.hg ?? null;
  const isNight = typeof isNightOverride === "boolean" ? isNightOverride : isNightFromObserved(metar);

  const metarRaw = metar?.raw_text ?? "";
  const tafRaw = taf?.raw_text ?? "";
  const text = `${metarRaw} ${tafRaw}`;

  const hasCode = (codes: string[]) =>
    codes.some((code) => text.includes(code));

  // 1) Thunderstorm
  if (
    hasCode([" TS ", "TSRA", " TSTORM", "VCTS", "+TS"]) ||
    concerns.some((c) => c.type === "thunderstorms" && (c.severity === "high" || c.severity === "extreme"))
  ) {
    return { variant: "thunderstorm", isNight: true, tempC, visibilitySm, qnhInHg };
  }

  // 2) Low Vis / Fog
  if (
    visibilitySm != null && visibilitySm < 3 ||
    hasCode([" FG", " BR", " HZ", "VV"]) ||
    concerns.some((c) => c.type === "low_visibility" && (c.severity === "moderate" || c.severity === "high" || c.severity === "extreme"))
  ) {
    return { variant: "low-vis-fog", isNight: true, tempC, visibilitySm, qnhInHg };
  }

  // 3) Heavy Rain
  if (
    hasCode(["+RA", " RA", "SHRA"]) && !hasCode(["TSRA"]) &&
    !concerns.some((c) => c.type === "low_visibility" && c.severity === "extreme")
  ) {
    return { variant: "heavy-rain", isNight: isNight, tempC, visibilitySm, qnhInHg };
  }

  // 4) Arctic / Snow
  if (
    tempC != null && tempC <= 0 &&
    hasCode([" SN", "SG", " PL", "SNRA"]) ||
    concerns.some((c) => c.type === "icing_conditions" && (c.severity === "high" || c.severity === "extreme"))
  ) {
    return { variant: "arctic-snow", isNight: false, tempC, visibilitySm, qnhInHg };
  }

  // 5) Clear Night
  if (
    isNight &&
    !hasCode([" RA", " SN", " FG", " BR"]) &&
    visibilitySm != null && visibilitySm >= 6
  ) {
    return { variant: "clear-night", isNight: true, tempC, visibilitySm, qnhInHg };
  }

  // 6) Default Sunny / benign
  return { variant: "sunny", isNight: false, tempC, visibilitySm, qnhInHg };
}
