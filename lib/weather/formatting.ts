import type { WindData, VisibilityData, CloudLayer } from "@/types/checkwx";
import type { SpeedUnit, DistanceUnit } from "@/store";

export interface WeatherFormatOptions {
  mode: "simplified" | "technical";
  speedUnit: SpeedUnit;
  visibilityUnit: DistanceUnit;
}

const KTS_TO_KMH = 1.852;
const KTS_TO_MPH = 1.15078;
const M_TO_KM = 0.001;
const M_TO_MI = 1 / 1609.344;

function formatDegrees(deg?: number): string | undefined {
  if (deg == null || Number.isNaN(deg)) return undefined;
  return `${deg.toString().padStart(3, "0")}°`;
}

function convertSpeed(speedKt: number, unit: SpeedUnit): { value: number; unitLabel: string } {
  if (unit === "kmh") {
    return { value: Math.round(speedKt * KTS_TO_KMH), unitLabel: "km/h" };
  }
  if (unit === "mph") {
    return { value: Math.round(speedKt * KTS_TO_MPH), unitLabel: "mph" };
  }
  return { value: speedKt, unitLabel: "kt" };
}

function extractMiles(visibility?: VisibilityData): number | null {
  if (!visibility) return null;

  if (typeof visibility.miles_float === "number") return visibility.miles_float;
  if (typeof visibility.miles === "number") return visibility.miles;
  if (typeof visibility.meters_float === "number") {
    return visibility.meters_float * M_TO_MI;
  }
  return null;
}

export function formatWindDisplay(
  wind: WindData | undefined,
  opts: WeatherFormatOptions,
): { primary: string; secondary?: string } {
  if (!wind || !wind.speed_kts || wind.speed_kts <= 3) {
    return { primary: "Calm" };
  }

  const { mode, speedUnit } = opts;
  const { value: speed, unitLabel } = convertSpeed(wind.speed_kts, speedUnit);
  const dir = formatDegrees(wind.degrees);

  if (mode === "technical") {
    const baseDir = dir ?? "VRB";
    const gust = wind.gust_kts ? ` (G${wind.gust_kts})` : "";
    return { primary: `${baseDir} @ ${wind.speed_kts} kt${gust}` };
  }

  const dirPart = dir ? ` at ${dir}` : "";
  const primary = `${speed} ${unitLabel}${dirPart}`;

  if (wind.gust_kts && wind.gust_kts > wind.speed_kts + 3) {
    return {
      primary,
      secondary: `${wind.gust_kts} kt gusts`,
    };
  }

  return { primary };
}

export function formatVisibilityDisplay(
  visibility: VisibilityData | undefined,
  opts: WeatherFormatOptions,
): string {
  const miles = extractMiles(visibility);

  if (opts.mode === "technical") {
    if (typeof visibility?.miles_float === "number") {
      const v = visibility.miles_float;
      const decimals = v >= 10 ? 0 : 1;
      return `${v.toFixed(decimals)} SM`;
    }
    if (typeof visibility?.miles === "number") {
      const v = visibility.miles;
      const decimals = v >= 10 ? 0 : 1;
      return `${v.toFixed(decimals)} SM`;
    }
    return visibility?.miles_text || visibility?.meters_text || "—";
  }

  if (miles == null) return "Visibility unknown";

  let value: number;
  let suffix: string;

  if (opts.visibilityUnit === "km") {
    value = miles * 1.609344;
    suffix = "km";
  } else if (opts.visibilityUnit === "sm") {
    value = miles;
    suffix = "SM";
  } else {
    value = miles;
    suffix = "mi";
  }

  const decimals = value >= 10 ? 0 : 1;
  return `${value.toFixed(decimals)} ${suffix}`;
}

function coverageToPhrase(code?: string | null): string {
  if (!code) return "Clouds";
  const upper = code.toUpperCase();
  switch (upper) {
    case "FEW":
      return "Few clouds";
    case "SCT":
      return "Scattered clouds";
    case "BKN":
      return "Broken clouds";
    case "OVC":
      return "Overcast";
    case "SKC":
      return "Scattered clouds";
    default:
      return upper;
  }
}

export function formatCloudsDisplay(
  clouds: CloudLayer[] | undefined,
  opts: WeatherFormatOptions,
): string {
  if (!clouds || clouds.length === 0) {
    return opts.mode === "simplified" ? "Clear skies" : "Clear";
  }

  if (opts.mode === "technical") {
    return clouds
      .map((c) => {
        const base = (c.base_feet_agl ?? (c as any).feet) as number | undefined;
        return `${c.code ?? ""}${base ? ` ${base.toLocaleString()}` : ""}`.trim();
      })
      .join(" / ");
  }

  return clouds
    .map((c) => {
      const phrase = coverageToPhrase(c.code);
      const base = (c.base_feet_agl ?? (c as any).feet) as number | undefined;
      if (!base) return phrase;
      const altitude = base.toLocaleString();
      return `${phrase} at ${altitude} ft`;
    })
    .join(" / ");
}
