// Navigation Aid Categorization and Approach Capability Detection
// Analyzes and categorizes navigation aids (navaids) to determine
// available approach types and navigation capabilities

import { NavaidData, NAVAID_TYPES } from "@/types/airportdb";
import {
  parseFrequency,
  parseOptionalNumber,
  parseMagneticVariation,
} from "./numeric-parser";

/**
 * Navaid category definitions with operational context
 */
export interface NavaidCategory {
  name: string;
  description: string;
  approach_capable: boolean;
  precision_approach: boolean;
  typical_frequency_range: [number, number];
  operational_use: string;
}

export const NAVAID_CATEGORIES: Record<string, NavaidCategory> = {
  VOR: {
    name: "VHF Omnidirectional Range",
    description: "VHF radio beacon providing radial navigation",
    approach_capable: true,
    precision_approach: false,
    typical_frequency_range: [108000, 118000],
    operational_use:
      "En route and terminal area navigation, non-precision approaches",
  },
  NDB: {
    name: "Non-Directional Beacon",
    description: "Low/medium frequency radio beacon",
    approach_capable: true,
    precision_approach: false,
    typical_frequency_range: [190, 1750],
    operational_use: "Basic navigation, non-precision approaches",
  },
  ILS: {
    name: "Instrument Landing System",
    description: "Precision approach system with localizer and glideslope",
    approach_capable: true,
    precision_approach: true,
    typical_frequency_range: [108100, 111950],
    operational_use: "Precision instrument approaches",
  },
  DME: {
    name: "Distance Measuring Equipment",
    description: "UHF transponder providing distance information",
    approach_capable: false,
    precision_approach: false,
    typical_frequency_range: [960000, 1215000],
    operational_use: "Distance measurement to supplement other navaids",
  },
};

/**
 * Approach type definitions
 */
export interface ApproachType {
  name: string;
  category: "precision" | "non-precision" | "visual";
  required_navaids: string[];
  minimum_visibility: number;
  typical_use: string;
}

export const APPROACH_TYPES: Record<string, ApproachType> = {
  ILS: {
    name: "ILS - Instrument Landing System",
    category: "precision",
    required_navaids: ["ILS"],
    minimum_visibility: 0.5,
    typical_use: "Primary precision approach for commercial aviation",
  },
  VOR: {
    name: "VOR - VHF Omnidirectional Range",
    category: "non-precision",
    required_navaids: ["VOR"],
    minimum_visibility: 1.0,
    typical_use: "Standard non-precision approach",
  },
  NDB: {
    name: "NDB - Non-Directional Beacon",
    category: "non-precision",
    required_navaids: ["NDB"],
    minimum_visibility: 1.0,
    typical_use: "Basic non-precision approach, being phased out",
  },
};

/**
 * Categorized navaid data structure
 */
export interface CategorizedNavaids {
  // Navigation capabilities
  navaids_count: number;
  has_ils: boolean;
  has_vor: boolean;
  has_ndb: boolean;
  has_dme: boolean;

  // Approach capabilities
  approach_types: string[];
  precision_approaches: boolean;
  non_precision_approaches: boolean;

  // Navaids organized by type
  navaids_by_type: Record<string, NavaidData[]>;

  // Detailed analysis
  analysis: {
    primary_navigation: string;
    approach_capability: "precision" | "non-precision" | "visual" | "none";
    navigation_redundancy: boolean;
    all_weather_capable: boolean;
    complexity_score: number;
  };
}

/**
 * Navigation aid categorizer class
 */
export class NavaidCategorizer {
  /**
   * Categorize and analyze navigation aids
   */
  categorizeNavaids(navaids: NavaidData[]): CategorizedNavaids {
    if (!navaids.length) {
      return this.createEmptyCategorizaton();
    }

    // Validate and parse navaids
    const validNavaids = this.validateNavaids(navaids);

    // Group navaids by normalized type
    const navaids_by_type = this.groupNavaidsByType(validNavaids);

    // Determine navigation capabilities
    const capabilities = this.determineCapabilities(navaids_by_type);

    // Analyze approach types
    const approach_analysis = this.analyzeApproachTypes(navaids_by_type);

    // Generate detailed analysis
    const analysis = this.analyzeComplexity(
      navaids_by_type,
      capabilities,
      approach_analysis
    );

    return {
      navaids_count: validNavaids.length,
      ...capabilities,
      ...approach_analysis,
      navaids_by_type,
      analysis,
    };
  }

  /**
   * Validate and parse navaid data - FIXED
   */
  private validateNavaids(navaids: NavaidData[]): NavaidData[] {
    return navaids
      .map((navaid) => {
        // Parse all numeric fields properly - handle strings
        const parsedFreqKhz = navaid.frequency_khz
          ? parseFrequency(navaid.frequency_khz, "kHz")
          : undefined;
        const parsedLat = parseOptionalNumber(navaid.latitude_deg);
        const parsedLon = parseOptionalNumber(navaid.longitude_deg);
        const parsedElev = navaid.elevation_ft
          ? parseOptionalNumber(navaid.elevation_ft)
          : undefined;
        const parsedMagVar = navaid.magnetic_variation_deg
          ? parseMagneticVariation(navaid.magnetic_variation_deg)
          : undefined;

        return {
          ...navaid,
          type: this.normalizeNavaidType(navaid.type),
          frequency_khz: parsedFreqKhz?.toString() || navaid.frequency_khz,
          latitude_deg: parsedLat?.toString() || navaid.latitude_deg,
          longitude_deg: parsedLon?.toString() || navaid.longitude_deg,
          elevation_ft: parsedElev?.toString() || navaid.elevation_ft,
          magnetic_variation_deg:
            parsedMagVar?.toString() || navaid.magnetic_variation_deg,
        };
      })
      .filter((navaid) => {
        // Filter out invalid navaids - FIXED: Better validation
        if (!navaid.ident || !navaid.name || !navaid.type) {
          console.warn(
            `Invalid navaid missing required fields: ${JSON.stringify({
              ident: navaid.ident,
              name: navaid.name,
              type: navaid.type,
            })}`
          );
          return false;
        }

        // Validate coordinates if present
        if (navaid.latitude_deg && navaid.longitude_deg) {
          const lat = parseFloat(navaid.latitude_deg);
          const lon = parseFloat(navaid.longitude_deg);
          if (
            isNaN(lat) ||
            isNaN(lon) ||
            lat < -90 ||
            lat > 90 ||
            lon < -180 ||
            lon > 180
          ) {
            console.warn(
              `Invalid navaid coordinates: ${navaid.ident} at ${lat}, ${lon}`
            );
            // Still include it - coordinates might not be critical for all navaids
          }
        }

        return true;
      });
  }

  /**
   * Normalize navaid type to standard categories
   */
  private normalizeNavaidType(type: string): string {
    const normalized = type.toUpperCase().trim();

    if (NAVAID_CATEGORIES[normalized]) {
      return normalized;
    }

    // Pattern matching for common variations
    if (normalized.includes("VOR")) return "VOR";
    if (normalized.includes("NDB")) return "NDB";
    if (normalized.includes("DME")) return "DME";
    if (normalized.includes("ILS")) return "ILS";

    return normalized;
  }

  /**
   * Group navaids by normalized type
   */
  private groupNavaidsByType(
    navaids: NavaidData[]
  ): Record<string, NavaidData[]> {
    const grouped: Record<string, NavaidData[]> = {};

    navaids.forEach((navaid) => {
      const type = navaid.type;
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(navaid);
    });

    return grouped;
  }

  /**
   * Determine navigation capabilities
   */
  private determineCapabilities(navaids_by_type: Record<string, NavaidData[]>) {
    return {
      has_ils: this.hasNavaidType(navaids_by_type, ["ILS"]),
      has_vor: this.hasNavaidType(navaids_by_type, ["VOR"]),
      has_ndb: this.hasNavaidType(navaids_by_type, ["NDB"]),
      has_dme: this.hasNavaidType(navaids_by_type, ["DME"]),
    };
  }

  /**
   * Check if specific navaid types are available
   */
  private hasNavaidType(
    navaids_by_type: Record<string, NavaidData[]>,
    types: string[]
  ): boolean {
    return types.some((type) => navaids_by_type[type]?.length > 0);
  }

  /**
   * Analyze available approach types
   */
  private analyzeApproachTypes(navaids_by_type: Record<string, NavaidData[]>) {
    const approach_types: string[] = [];
    let precision_approaches = false;
    let non_precision_approaches = false;

    // Check for each approach type
    Object.entries(APPROACH_TYPES).forEach(([approachType, config]) => {
      const hasRequired = config.required_navaids.every((navaidType) =>
        this.hasNavaidType(navaids_by_type, [navaidType])
      );

      if (hasRequired) {
        approach_types.push(approachType);

        if (config.category === "precision") {
          precision_approaches = true;
        } else if (config.category === "non-precision") {
          non_precision_approaches = true;
        }
      }
    });

    return {
      approach_types,
      precision_approaches,
      non_precision_approaches,
    };
  }

  /**
   * Analyze navigation complexity and capabilities
   */
  private analyzeComplexity(
    navaids_by_type: Record<string, NavaidData[]>,
    capabilities: any,
    approach_analysis: any
  ) {
    const totalNavaids = Object.values(navaids_by_type).reduce(
      (sum, navaids) => sum + navaids.length,
      0
    );

    // Determine primary navigation capability
    let primary_navigation = "Visual";
    if (capabilities.has_ils) primary_navigation = "ILS";
    else if (capabilities.has_vor) primary_navigation = "VOR";
    else if (capabilities.has_ndb) primary_navigation = "NDB";

    // Determine approach capability
    let approach_capability: "precision" | "non-precision" | "visual" | "none" =
      "none";
    if (approach_analysis.precision_approaches)
      approach_capability = "precision";
    else if (approach_analysis.non_precision_approaches)
      approach_capability = "non-precision";
    else if (totalNavaids > 0) approach_capability = "visual";

    // Check for navigation redundancy
    const navigation_redundancy = Object.values(navaids_by_type).some(
      (navaids) => navaids.length > 1
    );

    // All-weather capability requires precision approaches
    const all_weather_capable = approach_analysis.precision_approaches;

    // Calculate complexity score
    let complexity_score = 0;
    if (totalNavaids > 0) complexity_score += 10;
    if (capabilities.has_ndb) complexity_score += 15;
    if (capabilities.has_vor) complexity_score += 25;
    if (capabilities.has_dme) complexity_score += 10;
    if (capabilities.has_ils) complexity_score += 30;
    if (navigation_redundancy) complexity_score += 10;

    return {
      primary_navigation,
      approach_capability,
      navigation_redundancy,
      all_weather_capable,
      complexity_score: Math.min(100, complexity_score),
    };
  }

  /**
   * Create empty categorization for airports with no navaids
   */
  private createEmptyCategorizaton(): CategorizedNavaids {
    return {
      navaids_count: 0,
      has_ils: false,
      has_vor: false,
      has_ndb: false,
      has_dme: false,
      approach_types: [],
      precision_approaches: false,
      non_precision_approaches: false,
      navaids_by_type: {},
      analysis: {
        primary_navigation: "Visual",
        approach_capability: "visual",
        navigation_redundancy: false,
        all_weather_capable: false,
        complexity_score: 0,
      },
    };
  }
}

// Singleton instance
let categorizerInstance: NavaidCategorizer | null = null;

export function getNavaidCategorizer(): NavaidCategorizer {
  if (!categorizerInstance) {
    categorizerInstance = new NavaidCategorizer();
  }
  return categorizerInstance;
}

export function categorizeNavaids(navaids: NavaidData[]): CategorizedNavaids {
  const categorizer = getNavaidCategorizer();
  return categorizer.categorizeNavaids(navaids);
}
