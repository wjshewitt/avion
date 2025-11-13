// Communication Frequency Organization System
// Organizes and categorizes airport communication frequencies by operational type
// and provides structured access to radio communication data

import { FrequencyData, FREQUENCY_TYPES } from "@/types/airportdb";
import { parseFrequency } from "./numeric-parser";

/**
 * Frequency category definitions with operational context
 */
export interface FrequencyCategory {
  name: string;
  description: string;
  operational_use: string;
  priority: number; // Higher number = higher priority for primary frequency selection
  typical_range_mhz: [number, number];
}

export const FREQUENCY_CATEGORIES: Record<string, FrequencyCategory> = {
  TWR: {
    name: "Tower",
    description: "Airport Traffic Control Tower",
    operational_use: "Aircraft movement control in airport vicinity",
    priority: 100,
    typical_range_mhz: [118.0, 136.975],
  },
  GND: {
    name: "Ground Control",
    description: "Ground Movement Control",
    operational_use: "Aircraft and vehicle movement on airport surface",
    priority: 90,
    typical_range_mhz: [121.6, 121.9],
  },
  APP: {
    name: "Approach Control",
    description: "Terminal Approach Control",
    operational_use: "Aircraft approach and departure control",
    priority: 85,
    typical_range_mhz: [118.0, 136.975],
  },
  ATIS: {
    name: "ATIS",
    description: "Automatic Terminal Information Service",
    operational_use: "Automated weather and airport information broadcast",
    priority: 75,
    typical_range_mhz: [118.0, 136.975],
  },
  CLD: {
    name: "Clearance Delivery",
    description: "IFR Clearance Delivery",
    operational_use: "IFR clearance and flight plan coordination",
    priority: 70,
    typical_range_mhz: [121.0, 135.0],
  },
};

/**
 * Organized frequency data structure
 */
export interface OrganizedFrequencies {
  // Operational capabilities
  has_tower: boolean;
  has_ground: boolean;
  has_approach: boolean;
  has_atis: boolean;

  // Primary frequencies for each service
  primary_frequencies: {
    tower?: string;
    ground?: string;
    approach?: string;
    atis?: string;
  };

  // All frequencies organized by type
  frequencies_by_type: Record<string, FrequencyData[]>;

  // Frequency analysis
  analysis: {
    total_frequencies: number;
    controlled_airport: boolean;
    tower_controlled: boolean;
    approach_controlled: boolean;
    full_service: boolean;
    complexity_score: number;
  };
}

/**
 * Communication frequency organizer class
 */
export class FrequencyOrganizer {
  /**
   * Organize frequencies by operational type and priority
   */
  organizeFrequencies(frequencies: FrequencyData[]): OrganizedFrequencies {
    if (!frequencies.length) {
      return this.createEmptyOrganization();
    }

    // Validate and parse frequencies
    const validFrequencies = this.validateFrequencies(frequencies);

    // Group frequencies by normalized type
    const frequencies_by_type = this.groupFrequenciesByType(validFrequencies);

    // Determine operational capabilities
    const capabilities = this.determineCapabilities(frequencies_by_type);

    // Extract primary frequencies
    const primary_frequencies =
      this.extractPrimaryFrequencies(frequencies_by_type);

    // Analyze communication complexity
    const analysis = this.analyzeComplexity(frequencies_by_type, capabilities);

    return {
      ...capabilities,
      primary_frequencies,
      frequencies_by_type,
      analysis,
    };
  }

  /**
   * Validate and parse frequency data - FIXED
   */
  private validateFrequencies(frequencies: FrequencyData[]): FrequencyData[] {
    return frequencies
      .map((freq) => {
        const parsedFreq = parseFrequency(freq.frequency_mhz, "MHz");
        if (parsedFreq === undefined) {
          return null;
        }
        return {
          ...freq,
          frequency_mhz: parsedFreq.toString(),
          type: this.normalizeFrequencyType(freq.type),
        };
      })
      .filter((freq): freq is FrequencyData => freq !== null);
  }

  /**
   * Normalize frequency type to standard categories
   */
  private normalizeFrequencyType(type: string): string {
    const normalized = type.toUpperCase().trim();

    // Direct matches
    if (FREQUENCY_CATEGORIES[normalized]) {
      return normalized;
    }

    // Pattern matching for common variations
    if (normalized.includes("TOWER") || normalized === "TWR") return "TWR";
    if (normalized.includes("GROUND") || normalized === "GND") return "GND";
    if (normalized.includes("APPROACH") || normalized === "APP") return "APP";
    if (normalized.includes("ATIS")) return "ATIS";
    if (
      normalized.includes("CLEARANCE") ||
      normalized.includes("CLNC") ||
      normalized === "CLD"
    )
      return "CLD";

    // Return original if no match found
    return normalized;
  }

  /**
   * Group frequencies by normalized type
   */
  private groupFrequenciesByType(
    frequencies: FrequencyData[]
  ): Record<string, FrequencyData[]> {
    const grouped: Record<string, FrequencyData[]> = {};

    frequencies.forEach((freq) => {
      const type = freq.type;
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(freq);
    });

    return grouped;
  }

  /**
   * Determine operational capabilities based on available frequencies
   */
  private determineCapabilities(
    frequencies_by_type: Record<string, FrequencyData[]>
  ) {
    return {
      has_tower: this.hasFrequencyType(frequencies_by_type, ["TWR"]),
      has_ground: this.hasFrequencyType(frequencies_by_type, ["GND"]),
      has_approach: this.hasFrequencyType(frequencies_by_type, ["APP"]),
      has_atis: this.hasFrequencyType(frequencies_by_type, ["ATIS"]),
    };
  }

  /**
   * Check if specific frequency types are available
   */
  private hasFrequencyType(
    frequencies_by_type: Record<string, FrequencyData[]>,
    types: string[]
  ): boolean {
    return types.some((type) => frequencies_by_type[type]?.length > 0);
  }

  /**
   * Extract primary frequency for each service type
   */
  private extractPrimaryFrequencies(
    frequencies_by_type: Record<string, FrequencyData[]>
  ) {
    return {
      tower: this.getPrimaryFrequency(frequencies_by_type, ["TWR"]),
      ground: this.getPrimaryFrequency(frequencies_by_type, ["GND"]),
      approach: this.getPrimaryFrequency(frequencies_by_type, ["APP"]),
      atis: this.getPrimaryFrequency(frequencies_by_type, ["ATIS"]),
    };
  }

  /**
   * Get primary frequency for a service type
   */
  private getPrimaryFrequency(
    frequencies_by_type: Record<string, FrequencyData[]>,
    types: string[]
  ): string | undefined {
    for (const type of types) {
      const freqs = frequencies_by_type[type];
      if (freqs?.length > 0) {
        return freqs[0].frequency_mhz;
      }
    }
    return undefined;
  }

  /**
   * Analyze communication complexity and capabilities
   */
  private analyzeComplexity(
    frequencies_by_type: Record<string, FrequencyData[]>,
    capabilities: any
  ) {
    const totalFrequencies = Object.values(frequencies_by_type).reduce(
      (sum, freqs) => sum + freqs.length,
      0
    );

    const controlled_airport = capabilities.has_tower;
    const tower_controlled = capabilities.has_tower;
    const approach_controlled = capabilities.has_approach;

    const full_service =
      capabilities.has_tower &&
      capabilities.has_ground &&
      capabilities.has_approach &&
      capabilities.has_atis;

    // Calculate complexity score (0-100)
    let complexity_score = 0;
    if (totalFrequencies > 0) complexity_score += 10;
    if (capabilities.has_tower) complexity_score += 25;
    if (capabilities.has_ground) complexity_score += 15;
    if (capabilities.has_approach) complexity_score += 20;
    if (capabilities.has_atis) complexity_score += 10;

    return {
      total_frequencies: totalFrequencies,
      controlled_airport,
      tower_controlled,
      approach_controlled,
      full_service,
      complexity_score: Math.min(100, complexity_score),
    };
  }

  /**
   * Create empty organization for airports with no frequencies
   */
  private createEmptyOrganization(): OrganizedFrequencies {
    return {
      has_tower: false,
      has_ground: false,
      has_approach: false,
      has_atis: false,
      primary_frequencies: {},
      frequencies_by_type: {},
      analysis: {
        total_frequencies: 0,
        controlled_airport: false,
        tower_controlled: false,
        approach_controlled: false,
        full_service: false,
        complexity_score: 0,
      },
    };
  }
}

// Singleton instance
let organizerInstance: FrequencyOrganizer | null = null;

export function getFrequencyOrganizer(): FrequencyOrganizer {
  if (!organizerInstance) {
    organizerInstance = new FrequencyOrganizer();
  }
  return organizerInstance;
}

export function organizeFrequencies(
  frequencies: FrequencyData[]
): OrganizedFrequencies {
  const organizer = getFrequencyOrganizer();
  return organizer.organizeFrequencies(frequencies);
}

/**
 * Get frequency category information
 */
export function getFrequencyCategory(
  type: string
): FrequencyCategory | undefined {
  return FREQUENCY_CATEGORIES[type.toUpperCase()];
}

/**
 * Check if a frequency is within the typical aviation range
 */
export function isValidAviationFrequency(frequency_mhz: number): boolean {
  return frequency_mhz >= 108.0 && frequency_mhz <= 137.0;
}

/**
 * Format frequency for display
 */
export function formatFrequency(frequency_mhz: string | number): string {
  const freq =
    typeof frequency_mhz === "string"
      ? parseFloat(frequency_mhz)
      : frequency_mhz;

  if (isNaN(freq)) return "Invalid";

  return freq.toFixed(3);
}

/**
 * Get communication complexity rating
 */
export function getCommunicationComplexity(
  analysis: OrganizedFrequencies["analysis"]
): string {
  if (analysis.complexity_score >= 80) return "Very High";
  if (analysis.complexity_score >= 60) return "High";
  if (analysis.complexity_score >= 40) return "Medium";
  if (analysis.complexity_score >= 20) return "Low";
  return "Very Low";
}
