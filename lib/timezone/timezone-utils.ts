/**
 * Timezone utility functions for formatting and converting timezones
 * Uses native JavaScript Date and Intl API (no external dependencies)
 */

export interface TimezoneDisplay {
  timezone: string;
  label: string;
  time: string;
}

/**
 * Map of timezone values to their display labels
 */
export const TIMEZONE_LABELS: Record<string, string> = {
  'UTC': 'UTC',
  'America/New_York': 'EST',
  'America/Chicago': 'CST',
  'America/Denver': 'MST',
  'America/Los_Angeles': 'PST',
  'America/Phoenix': 'MST',
  'America/Anchorage': 'AKST',
  'Pacific/Honolulu': 'HST',
  'Europe/London': 'GMT',
  'Europe/Paris': 'CET',
  'Asia/Dubai': 'GST',
  'Asia/Singapore': 'SGT',
  'Asia/Tokyo': 'JST',
};

/**
 * Format time for a specific timezone
 * @param timezone - IANA timezone identifier (e.g., 'UTC', 'America/New_York')
 * @param date - Date object to format (defaults to current time)
 * @param use24Hour - Whether to use 24-hour format (default: false)
 * @returns Formatted time string (e.g., '14:30' or '2:30 PM')
 */
export function formatTimeForTimezone(
  timezone: string,
  date: Date = new Date(),
  use24Hour: boolean = false
): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: !use24Hour,
    }).format(date);
  } catch (error) {
    console.error(`Error formatting time for timezone ${timezone}:`, error);
    // Fallback to local time
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: !use24Hour,
    });
  }
}

/**
 * Get timezone display information for multiple timezones
 * @param timezones - Array of timezone identifiers
 * @param use24Hour - Whether to use 24-hour format (default: false)
 * @returns Array of timezone display objects with formatted times
 */
export function getTimezoneDisplays(timezones: string[], use24Hour: boolean = false): TimezoneDisplay[] {
  const now = new Date();

  return timezones.map(timezone => ({
    timezone,
    label: TIMEZONE_LABELS[timezone] || timezone,
    time: formatTimeForTimezone(timezone, now, use24Hour),
  }));
}

/**
 * Check if a timezone identifier is valid
 * @param timezone - IANA timezone identifier
 * @returns True if timezone is valid
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get user's detected timezone
 * @returns User's local timezone identifier
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Determine if DST is active for a timezone
 * @param timezone - IANA timezone identifier
 * @param date - Date to check (defaults to current time)
 * @returns True if DST is active
 */
export function isDSTActive(timezone: string, date: Date = new Date()): boolean {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short',
    });

    const parts = formatter.formatToParts(date);
    const timeZoneName = parts.find(part => part.type === 'timeZoneName')?.value || '';

    // Check if timezone name contains 'DT' (Daylight Time) or 'ST' (Standard Time)
    return timeZoneName.includes('DT');
  } catch {
    return false;
  }
}