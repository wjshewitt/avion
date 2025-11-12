// Numeric Field Parsing Utilities - FIXED VERSION
// Handles conversion of string-based numeric fields from AirportDB.io API
// to proper TypeScript number types with validation and error handling

/**
 * Parse a string or number value to a number with fallback - FIXED
 */
export function parseNumber(
  value: string | number | undefined | null,
  fallback: number = 0
): number {
  // Handle null/undefined
  if (value == null) return fallback;

  // Already a number
  if (typeof value === "number") {
    return isNaN(value) ? fallback : value;
  }

  // Parse string - FIXED: Better string handling
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return fallback;

    const parsed = parseFloat(trimmed);
    return isNaN(parsed) ? fallback : parsed;
  }

  return fallback;
}

/**
 * Parse an optional numeric field that may be undefined - FIXED
 */
export function parseOptionalNumber(
  value: string | number | undefined | null
): number | undefined {
  // Handle null/undefined
  if (value == null) return undefined;

  // Already a number
  if (typeof value === "number") {
    return isNaN(value) ? undefined : value;
  }

  // Parse string - FIXED: Proper string-to-number conversion
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return undefined;

    const parsed = parseFloat(trimmed);
    return isNaN(parsed) ? undefined : parsed;
  }

  return undefined;
}

/**
 * Parse integer values specifically (for counts, flags, etc.)
 */
export function parseInteger(
  value: string | number | undefined | null,
  fallback: number = 0
): number {
  const parsed = parseNumber(value, fallback);
  return Math.floor(parsed);
}

/**
 * Parse boolean values from string representations - FIXED
 */
export function parseBoolean(
  value: string | number | boolean | undefined | null,
  fallback: boolean = false
): boolean {
  // Handle null/undefined
  if (value == null) return fallback;

  // Already a boolean
  if (typeof value === "boolean") return value;

  // Handle numbers (1 = true, 0 = false) - FIXED: Proper number handling
  if (typeof value === "number") {
    return value !== 0;
  }

  // Handle strings - FIXED: Better string parsing
  if (typeof value === "string") {
    const trimmed = value.trim().toLowerCase();

    // Common true values
    if (["1", "true", "yes", "y", "on", "enabled"].includes(trimmed)) {
      return true;
    }

    // Common false values
    if (["0", "false", "no", "n", "off", "disabled", ""].includes(trimmed)) {
      return false;
    }

    // Try parsing as number
    const numValue = parseFloat(trimmed);
    if (!isNaN(numValue)) {
      return numValue !== 0;
    }
  }

  return fallback;
}

/**
 * Parse coordinate values with validation
 */
export function parseCoordinate(
  value: string | number | undefined | null,
  type: "latitude" | "longitude"
): number {
  const parsed = parseNumber(value, 0);

  // Validate coordinate ranges
  if (type === "latitude") {
    if (parsed < -90 || parsed > 90) {
      throw new Error(
        `Invalid latitude value: ${parsed}. Must be between -90 and 90.`
      );
    }
  } else if (type === "longitude") {
    if (parsed < -180 || parsed > 180) {
      throw new Error(
        `Invalid longitude value: ${parsed}. Must be between -180 and 180.`
      );
    }
  }

  return parsed;
}

/**
 * Parse elevation values with validation - FIXED: Handle string elevations
 */
export function parseElevation(
  value: string | number | undefined | null
): number | undefined {
  const parsed = parseOptionalNumber(value); // FIXED: Now handles strings properly

  if (parsed !== undefined) {
    // Validate reasonable elevation range (-1000ft to 30000ft)
    if (parsed < -1000 || parsed > 30000) {
      console.warn(
        `Unusual elevation value: ${parsed}ft. Expected range: -1000 to 30000ft.`
      );
    }
  }

  return parsed;
}

/**
 * Parse frequency values (MHz or kHz) with validation
 */
export function parseFrequency(
  value: string | number | undefined | null,
  unit: "MHz" | "kHz" = "MHz"
): number | undefined {
  const parsed = parseOptionalNumber(value);

  if (parsed !== undefined) {
    // Validate frequency ranges
    if (unit === "MHz") {
      // Aviation radio frequencies typically 108-137 MHz
      if (parsed < 100 || parsed > 400) {
        console.warn(
          `Unusual MHz frequency: ${parsed}. Expected aviation range: 108-137 MHz.`
        );
      }
    } else if (unit === "kHz") {
      // NDB frequencies typically 190-1750 kHz
      if (parsed < 100 || parsed > 2000) {
        console.warn(
          `Unusual kHz frequency: ${parsed}. Expected NDB range: 190-1750 kHz.`
        );
      }
    }
  }

  return parsed;
}

/**
 * Parse runway length with validation - FIXED
 */
export function parseRunwayLength(
  value: string | number | undefined | null
): number {
  const parsed = parseNumber(value, 0); // FIXED: Now handles strings

  // Validate reasonable runway length (100ft to 20000ft)
  if (parsed > 0 && (parsed < 100 || parsed > 20000)) {
    console.warn(
      `Unusual runway length: ${parsed}ft. Expected range: 100-20000ft.`
    );
  }

  return Math.max(0, parsed);
}

/**
 * Parse runway width with validation - FIXED
 */
export function parseRunwayWidth(
  value: string | number | undefined | null
): number {
  const parsed = parseNumber(value, 0); // FIXED: Now handles strings

  // Validate reasonable runway width (10ft to 500ft)
  if (parsed > 0 && (parsed < 10 || parsed > 500)) {
    console.warn(
      `Unusual runway width: ${parsed}ft. Expected range: 10-500ft.`
    );
  }

  return Math.max(0, parsed);
}

/**
 * Parse heading values (0-360 degrees) with validation
 */
export function parseHeading(
  value: string | number | undefined | null
): number {
  const parsed = parseNumber(value, 0);

  // Normalize to 0-360 range
  let normalized = parsed % 360;
  if (normalized < 0) normalized += 360;

  return normalized;
}

/**
 * Parse magnetic variation with validation
 */
export function parseMagneticVariation(
  value: string | number | undefined | null
): number | undefined {
  const parsed = parseOptionalNumber(value);

  if (parsed !== undefined) {
    // Validate reasonable magnetic variation range (-180 to +180 degrees)
    if (parsed < -180 || parsed > 180) {
      console.warn(
        `Unusual magnetic variation: ${parsed}°. Expected range: -180 to +180°.`
      );
    }
  }

  return parsed;
}

/**
 * Parse distance values with validation - FIXED
 */
export function parseDistance(
  value: string | number | undefined | null,
  unit: "ft" | "km" | "nm" = "ft"
): number | undefined {
  const parsed = parseOptionalNumber(value); // FIXED: Now handles strings

  if (parsed !== undefined && parsed < 0) {
    console.warn(
      `Negative distance value: ${parsed}${unit}. Using absolute value.`
    );
    return Math.abs(parsed);
  }

  return parsed;
}

/**
 * Validate and parse all numeric fields in an airport response - FIXED VERSION
 */
export function parseAirportNumericFields(data: any): {
  parsed: any;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const parsed = { ...data };

  try {
    // Parse core coordinates
    if (data.latitude_deg !== undefined) {
      parsed.latitude_deg = parseCoordinate(data.latitude_deg, "latitude");
    }
    if (data.longitude_deg !== undefined) {
      parsed.longitude_deg = parseCoordinate(data.longitude_deg, "longitude");
    }
    if (data.elevation_ft !== undefined) {
      parsed.elevation_ft = parseElevation(data.elevation_ft); // FIXED: Now handles strings
    }

    // Parse runway data - FIXED: Proper string handling
    if (data.runways && Array.isArray(data.runways)) {
      parsed.runways = data.runways.map((runway: any) => ({
        ...runway,
        length_ft: parseRunwayLength(runway.length_ft), // FIXED: Handles strings
        width_ft: parseRunwayWidth(runway.width_ft), // FIXED: Handles strings
        lighted: parseBoolean(runway.lighted), // FIXED: Handles "1"/"0" strings
        closed: parseBoolean(runway.closed), // FIXED: Handles "1"/"0" strings
        le_latitude_deg: parseOptionalNumber(runway.le_latitude_deg), // FIXED: Handles strings
        le_longitude_deg: parseOptionalNumber(runway.le_longitude_deg), // FIXED: Handles strings
        le_elevation_ft: parseElevation(runway.le_elevation_ft), // FIXED: Handles strings
        le_heading_degT: parseHeading(runway.le_heading_degT), // FIXED: Handles strings
        le_displaced_threshold_ft: parseDistance(
          runway.le_displaced_threshold_ft
        ), // FIXED: Handles strings
        he_latitude_deg: parseOptionalNumber(runway.he_latitude_deg), // FIXED: Handles strings
        he_longitude_deg: parseOptionalNumber(runway.he_longitude_deg), // FIXED: Handles strings
        he_elevation_ft: parseElevation(runway.he_elevation_ft), // FIXED: Handles strings
        he_heading_degT: parseHeading(runway.he_heading_degT), // FIXED: Handles strings
        he_displaced_threshold_ft: parseDistance(
          runway.he_displaced_threshold_ft
        ), // FIXED: Handles strings
      }));
    }

    // Parse frequency data - FIXED
    if (data.freqs && Array.isArray(data.freqs)) {
      parsed.freqs = data.freqs.map((freq: any) => ({
        ...freq,
        frequency_mhz: parseFrequency(freq.frequency_mhz, "MHz"), // FIXED: Handles strings
      }));
    }

    // Parse navaid data - FIXED
    if (data.navaids && Array.isArray(data.navaids)) {
      parsed.navaids = data.navaids.map((navaid: any) => ({
        ...navaid,
        frequency_khz: parseFrequency(navaid.frequency_khz, "kHz"), // FIXED: Handles strings
        latitude_deg: parseOptionalNumber(navaid.latitude_deg), // FIXED: Handles strings
        longitude_deg: parseOptionalNumber(navaid.longitude_deg), // FIXED: Handles strings
        elevation_ft: parseElevation(navaid.elevation_ft), // FIXED: Handles strings
        dme_frequency_khz: parseFrequency(navaid.dme_frequency_khz, "kHz"), // FIXED: Handles strings
        dme_latitude_deg: parseOptionalNumber(navaid.dme_latitude_deg), // FIXED: Handles strings
        dme_longitude_deg: parseOptionalNumber(navaid.dme_longitude_deg), // FIXED: Handles strings
        dme_elevation_ft: parseElevation(navaid.dme_elevation_ft), // FIXED: Handles strings
        slaved_variation_deg: parseMagneticVariation(
          navaid.slaved_variation_deg
        ), // FIXED: Handles strings
        magnetic_variation_deg: parseMagneticVariation(
          navaid.magnetic_variation_deg
        ), // FIXED: Handles strings
      }));
    }

    // Parse weather station data - FIXED
    if (data.station) {
      parsed.station = {
        ...data.station,
        distance: parseDistance(data.station.distance, "km"), // FIXED: Handles strings
      };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(`Error parsing airport numeric fields: ${message}`);
  }

  return { parsed, errors, warnings };
}
