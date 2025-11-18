import { DateTime, type DateTimeFormatOptions } from "luxon";

const TZ_LABEL_CACHE = new Map<string, string>();

export function formatZulu(date: Date = new Date()): string {
  return DateTime.fromJSDate(date, { zone: "utc" }).toFormat("HH:mm 'Z'");
}

export function formatLocalTime(
  date: Date,
  timezone: string,
  options: Intl.DateTimeFormatOptions = {},
): string {
  const dt = DateTime.fromJSDate(date).setZone(timezone, { keepLocalTime: false });
  const resolved: DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    ...(options as DateTimeFormatOptions),
  };
  return dt.toLocaleString(resolved);
}

export function getTimezoneAbbreviation(timezone: string, date: Date = new Date()): string {
  const cacheKey = `${timezone}-${date.getUTCFullYear()}-${date.getUTCMonth()}`;
  const cached = TZ_LABEL_CACHE.get(cacheKey);
  if (cached) return cached;

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "short",
  });
  const parts = formatter.formatToParts(date);
  const abbrev = parts.find((part) => part.type === "timeZoneName")?.value ?? timezone;
  TZ_LABEL_CACHE.set(cacheKey, abbrev);
  return abbrev;
}

export function formatLocalWithTz(
  date: Date,
  timezone: string,
): string {
  const time = formatLocalTime(date, timezone);
  const abbr = getTimezoneAbbreviation(timezone, date);
  return `${time} ${abbr}`;
}

export function describeTimezoneOffsets(timezone: string) {
  const now = DateTime.now().setZone(timezone);
  const jan = DateTime.utc(now.year, 1, 1, 12, 0, 0).setZone(timezone);
  const jul = DateTime.utc(now.year, 7, 1, 12, 0, 0).setZone(timezone);

  const janOffset = jan.offset;
  const julOffset = jul.offset;
  const usesDst = janOffset !== julOffset;

  const offsets = [janOffset, julOffset];
  const standardOffsetMinutes = usesDst ? Math.min(...offsets) : janOffset;
  const dstOffsetMinutes = usesDst ? Math.max(...offsets) : null;

  const currentOffset = now.offset;
  const isDstActive = usesDst && dstOffsetMinutes != null
    ? currentOffset === dstOffsetMinutes
    : false;

  return {
    standardOffsetMinutes,
    dstOffsetMinutes,
    usesDst,
    isDstActive,
  } as const;
}

export function formatDateKey(date: Date, timezone: string): string {
  const dt = DateTime.fromJSDate(date).setZone(timezone, { keepLocalTime: false });
  const isoDate = dt.toISODate() ?? dt.toISO()?.split("T")[0] ?? dt.toFormat("yyyy-LL-dd");
  return `${timezone}:${isoDate}`;
}
