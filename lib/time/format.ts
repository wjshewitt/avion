const TZ_LABEL_CACHE = new Map<string, string>();

export function formatZulu(date: Date = new Date()): string {
  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes} Z`;
}

export function formatLocalTime(
  date: Date,
  timezone: string,
  options: Intl.DateTimeFormatOptions = {},
): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    ...options,
  });
  return formatter.format(date);
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

export function calculateOffsetMinutes(date: Date, timezone: string): number {
  const localeDate = new Date(date.toLocaleString("en-US", { timeZone: timezone }));
  return (localeDate.getTime() - date.getTime()) / 60000;
}

export function describeTimezoneOffsets(timezone: string) {
  const now = new Date();
  const jan = new Date(Date.UTC(now.getUTCFullYear(), 0, 1, 12, 0, 0));
  const jul = new Date(Date.UTC(now.getUTCFullYear(), 6, 1, 12, 0, 0));

  const janOffset = calculateOffsetMinutes(jan, timezone);
  const julOffset = calculateOffsetMinutes(jul, timezone);
  const usesDst = janOffset !== julOffset;

  const offsets = [janOffset, julOffset];
  const standardOffsetMinutes = usesDst
    ? Math.min(...offsets)
    : janOffset;
  const dstOffsetMinutes = usesDst
    ? Math.max(...offsets)
    : null;

  const currentOffset = calculateOffsetMinutes(now, timezone);
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
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return `${timezone}:${formatter.format(date)}`;
}
