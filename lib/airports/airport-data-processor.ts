// Airport Data Processing and Transformation Layer
// Transforms raw AirportDB.io API responses into structured, typed data
// with derived operational capabilities and organized segments

import {
  AirportDBResponse,
  ProcessedAirportData,
  RunwayData,
  FrequencyData,
  AirportDataProcessor,
} from "@/types/airportdb";
import { parseAirportNumericFields } from "./numeric-parser";
import { analyzeRunways, type RunwayAnalysis } from "./runway-analyzer";
import {
  organizeFrequencies,
  type OrganizedFrequencies,
} from "./frequency-organizer";
import {
  categorizeNavaids,
  type CategorizedNavaids,
} from "./navaid-categorizer";

/**
 * Main airport data processor implementation
 */
export class AirportDataProcessorImpl implements AirportDataProcessor {
  /**
   * Transform raw API response into structured format
   */
  processAirportData(apiResponse: AirportDBResponse): ProcessedAirportData {
    // Parse numeric fields first
    const {
      parsed: parsedResponse,
      errors,
      warnings,
    } = parseAirportNumericFields(apiResponse);

    if (errors.length > 0) {
      console.warn("Airport data parsing errors:", errors);
    }

    // Extract core data
    const coreData = this.extractCoreData(parsedResponse);

    // Use specialized processors
    // De-duplicate runways before analysis
    const uniqueRunways = this.deduplicateRunways(parsedResponse.runways || []);
    const runwayAnalysis = analyzeRunways(uniqueRunways);
    const communicationData = organizeFrequencies(parsedResponse.freqs || []);
    const navigationData = categorizeNavaids(parsedResponse.navaids || []);

    // Convert to ProcessedAirportData format
    const runwayData = this.convertRunwayAnalysis(runwayAnalysis);
    const commData = this.convertCommunicationData(communicationData);
    const navData = this.convertNavigationData(navigationData);

    // Derive capabilities
    const capabilities = this.deriveCapabilitiesFromAnalysis(
      runwayAnalysis,
      communicationData,
      navigationData
    );
    const completeness = this.calculateCompleteness(parsedResponse);

    return {
      icao: parsedResponse.ident || parsedResponse.icao_code,
      iata: parsedResponse.iata_code || undefined,
      name: parsedResponse.name,
      coordinates: {
        latitude: parsedResponse.latitude_deg,
        longitude: parsedResponse.longitude_deg,
        elevation_ft: parsedResponse.elevation_ft,
      },
      location: {
        municipality: parsedResponse.municipality || "",
        region: parsedResponse.region?.name || parsedResponse.iso_region || "",
        country:
          parsedResponse.country?.name || parsedResponse.iso_country || "",
        continent: parsedResponse.continent || "",
      },
      classification: {
        type: this.normalizeAirportType(parsedResponse.type),
        scheduled_service: parsedResponse.scheduled_service === "yes",
        size_category: this.determineSizeCategory(
          parsedResponse.type,
          runwayData
        ),
      },
      runways: runwayData,
      communications: commData,
      navigation: navData,
      capabilities,
      external_links: {
        home_url: parsedResponse.home_link || undefined,
        wikipedia_url: parsedResponse.wikipedia_link || undefined,
      },
      weather: {
        station_icao: parsedResponse.station?.icao_code || undefined,
        station_distance_km: parsedResponse.station?.distance || undefined,
        metar_available: !!parsedResponse.station?.icao_code,
      },
      data_quality: {
        completeness_score: completeness,
        last_updated: parsedResponse.updatedAt || new Date().toISOString(),
        source: "airportdb",
      },
    };
  }

  private deduplicateRunways(runways: RunwayData[]): RunwayData[] {
    if (!runways) {
      return [];
    }
    
    // Deduplicate by normalized runway-end pairs regardless of orientation.
    // AirportDB sometimes lists each physical runway twice (LE/HE swapped),
    // so we sort the identifiers to create a canonical key and drop duplicates.
    const seen = new Map<string, RunwayData>();

    runways.forEach((runway) => {
      if (runway.closed === "1") {
        return;
      }

      const normalizeIdent = (ident?: string | null) =>
        ident?.trim().toUpperCase() ?? "";

      const le = normalizeIdent(runway.le_ident);
      const he = normalizeIdent(runway.he_ident);
      const ends = [le, he].filter(Boolean).sort();
      const key = ends.length ? ends.join("-") : `${runway.id ?? "unknown"}`;

      if (!seen.has(key)) {
        seen.set(key, runway);
      }
    });

    return Array.from(seen.values());
  }

  private convertRunwayAnalysis(
    analysis: RunwayAnalysis
  ): ProcessedAirportData["runways"] {
    return {
      count: analysis.operational_summary.total_runways,
      longest_ft: analysis.operational_summary.longest_runway_ft,
      shortest_ft: analysis.operational_summary.shortest_runway_ft,
      surface_types: analysis.surface_analysis.surface_types,
      all_lighted:
        analysis.operational_summary.lighted_runways ===
        analysis.operational_summary.active_runways,
      ils_equipped: analysis.approach_capabilities.precision_approaches,
      details: analysis.runway_details,
    };
  }

  private convertCommunicationData(
    data: OrganizedFrequencies
  ): ProcessedAirportData["communications"] {
    return {
      has_tower: data.has_tower,
      has_ground: data.has_ground,
      has_approach: data.has_approach,
      has_atis: data.has_atis,
      frequencies_by_type: data.frequencies_by_type,
      primary_frequencies: data.primary_frequencies,
    };
  }

  private convertNavigationData(
    data: CategorizedNavaids
  ): ProcessedAirportData["navigation"] {
    return {
      navaids_count: data.navaids_count,
      has_ils: data.has_ils,
      has_ndb: data.has_ndb,
      has_vor: data.has_vor,
      approach_types: data.approach_types,
      navaids_by_type: data.navaids_by_type,
    };
  }

  private deriveCapabilitiesFromAnalysis(
    runwayAnalysis: RunwayAnalysis,
    communicationData: OrganizedFrequencies,
    navigationData: CategorizedNavaids
  ): ProcessedAirportData["capabilities"] {
    return {
      max_aircraft_category: runwayAnalysis.aircraft_suitability.max_category,
      night_operations:
        runwayAnalysis.operational_capabilities.night_operations,
      all_weather_operations:
        runwayAnalysis.operational_capabilities.all_weather_operations ||
        navigationData.analysis.all_weather_capable,
      international_capable:
        runwayAnalysis.operational_capabilities.international_capable,
      commercial_service:
        runwayAnalysis.operational_capabilities.commercial_operations,
    };
  }

  private extractCoreData(apiResponse: AirportDBResponse) {
    if (!apiResponse.ident && !apiResponse.icao_code) {
      throw new Error("Airport response missing ICAO identifier");
    }
    if (!apiResponse.name) {
      throw new Error("Airport response missing name");
    }
    if (
      typeof apiResponse.latitude_deg !== "number" ||
      typeof apiResponse.longitude_deg !== "number"
    ) {
      throw new Error("Airport response missing valid coordinates");
    }
    return {
      icao: apiResponse.ident || apiResponse.icao_code,
      name: apiResponse.name,
      coordinates: {
        latitude: apiResponse.latitude_deg,
        longitude: apiResponse.longitude_deg,
      },
    };
  }

  calculateCompleteness(data: AirportDBResponse): number {
    let score = 0;
    let maxScore = 100;

    // Core data - 40 points
    if (data.ident || data.icao_code) score += 10;
    if (data.name) score += 10;
    if (typeof data.latitude_deg === "number") score += 10;
    if (typeof data.longitude_deg === "number") score += 10;

    // Basic info - 20 points
    if (data.iata_code) score += 5;
    if (data.type) score += 5;
    if (data.municipality) score += 5;
    if (data.iso_country) score += 5;

    // Operational data - 30 points
    if (data.runways && data.runways.length > 0) score += 15;
    if (data.freqs && data.freqs.length > 0) score += 10;
    if (data.navaids && data.navaids.length > 0) score += 5;

    // Additional data - 10 points
    if (data.elevation_ft) score += 2;
    if (data.scheduled_service) score += 2;
    if (data.home_link) score += 2;
    if (data.station) score += 2;
    if (data.country) score += 2;

    return Math.round(score);
  }

  deriveCapabilities(
    runways: RunwayData[]
  ): ProcessedAirportData["capabilities"] {
    const analysis = analyzeRunways(runways);
    return {
      max_aircraft_category: analysis.aircraft_suitability.max_category,
      night_operations: analysis.operational_capabilities.night_operations,
      all_weather_operations:
        analysis.operational_capabilities.all_weather_operations,
      international_capable:
        analysis.operational_capabilities.international_capable,
      commercial_service:
        analysis.operational_capabilities.commercial_operations,
    };
  }

  organizeCommunications(
    frequencies: FrequencyData[]
  ): ProcessedAirportData["communications"] {
    const organized = organizeFrequencies(frequencies);
    return this.convertCommunicationData(organized);
  }

  parseNumericFields(data: AirportDBResponse): void {
    // Handled by parseAirportNumericFields function
  }

  private normalizeAirportType(
    type: string
  ): ProcessedAirportData["classification"]["type"] {
    const normalized = type.toLowerCase();
    if (normalized.includes("large")) return "large_airport";
    if (normalized.includes("medium")) return "medium_airport";
    if (normalized.includes("small")) return "small_airport";
    if (normalized.includes("heliport")) return "heliport";
    return "small_airport";
  }

  private determineSizeCategory(
    type: string,
    runwayData: ProcessedAirportData["runways"]
  ): ProcessedAirportData["classification"]["size_category"] {
    const normalized = type.toLowerCase();
    if (normalized.includes("large") || runwayData.longest_ft >= 8000)
      return "major";
    if (normalized.includes("medium") || runwayData.longest_ft >= 4000)
      return "regional";
    if (runwayData.longest_ft >= 2000) return "local";
    return "private";
  }
}

// Singleton instance
let processorInstance: AirportDataProcessorImpl | null = null;

export function getAirportDataProcessor(): AirportDataProcessorImpl {
  if (!processorInstance) {
    processorInstance = new AirportDataProcessorImpl();
  }
  return processorInstance;
}

export function processAirportData(
  apiResponse: AirportDBResponse
): ProcessedAirportData {
  const processor = getAirportDataProcessor();
  return processor.processAirportData(apiResponse);
}

export function calculateAirportDataCompleteness(
  data: AirportDBResponse
): number {
  const processor = getAirportDataProcessor();
  return processor.calculateCompleteness(data);
}

export function deriveAirportCapabilities(
  runways: RunwayData[]
): ProcessedAirportData["capabilities"] {
  // Use the runway analyzer to derive capabilities
  const analysis = analyzeRunways(runways);
  return {
    max_aircraft_category: analysis.aircraft_suitability.max_category,
    night_operations: analysis.operational_capabilities.night_operations,
    all_weather_operations:
      analysis.operational_capabilities.all_weather_operations,
    international_capable:
      analysis.operational_capabilities.international_capable,
    commercial_service: analysis.operational_capabilities.commercial_operations,
  };
}

export function organizeCommunicationFrequencies(
  frequencies: FrequencyData[]
): ProcessedAirportData["communications"] {
  // Use the frequency organizer
  const organized = organizeFrequencies(frequencies);
  return {
    has_tower: organized.has_tower,
    has_ground: organized.has_ground,
    has_approach: organized.has_approach,
    has_atis: organized.has_atis,
    frequencies_by_type: organized.frequencies_by_type,
    primary_frequencies: organized.primary_frequencies,
  };
}

// Export types for external use
export type { AirportDataProcessor };
