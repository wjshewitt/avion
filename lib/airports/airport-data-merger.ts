// Airport Data Merger Utilities
// Handles merging airport data from multiple sources with conflict resolution

import { ProcessedAirportData } from "@/types/airportdb";

/**
 * Merge airport data from multiple sources
 */
export function mergeAirportData(
  primary: ProcessedAirportData,
  secondary: ProcessedAirportData
): ProcessedAirportData {
  return {
    ...secondary,
    ...primary,
    // Merge coordinates - prefer primary if available
    coordinates: {
      ...secondary.coordinates,
      ...primary.coordinates,
    },
    // Merge location data
    location: {
      ...secondary.location,
      ...primary.location,
    },
    // Merge classification
    classification: {
      ...secondary.classification,
      ...primary.classification,
    },
    // Merge runway data - combine details
    runways: {
      ...secondary.runways,
      ...primary.runways,
      details: [
        ...(secondary.runways.details || []),
        ...(primary.runways.details || []),
      ],
    },
    // Merge communications
    communications: {
      ...secondary.communications,
      ...primary.communications,
      frequencies_by_type: {
        ...secondary.communications.frequencies_by_type,
        ...primary.communications.frequencies_by_type,
      },
      primary_frequencies: {
        ...secondary.communications.primary_frequencies,
        ...primary.communications.primary_frequencies,
      },
    },
    // Merge navigation data
    navigation: {
      ...secondary.navigation,
      ...primary.navigation,
      navaids_by_type: {
        ...secondary.navigation.navaids_by_type,
        ...primary.navigation.navaids_by_type,
      },
    },
    // Merge capabilities - use most permissive
    capabilities: {
      max_aircraft_category:
        primary.capabilities.max_aircraft_category >
        secondary.capabilities.max_aircraft_category
          ? primary.capabilities.max_aircraft_category
          : secondary.capabilities.max_aircraft_category,
      night_operations:
        primary.capabilities.night_operations ||
        secondary.capabilities.night_operations,
      all_weather_operations:
        primary.capabilities.all_weather_operations ||
        secondary.capabilities.all_weather_operations,
      international_capable:
        primary.capabilities.international_capable ||
        secondary.capabilities.international_capable,
      commercial_service:
        primary.capabilities.commercial_service ||
        secondary.capabilities.commercial_service,
    },
    // Use primary data quality info
    data_quality: primary.data_quality,
  };
}

/**
 * Combine airport data from multiple sources
 */
export function combineAirportSources(
  sources: ProcessedAirportData[]
): ProcessedAirportData {
  if (sources.length === 0) {
    throw new Error("No airport data sources provided");
  }

  if (sources.length === 1) {
    return sources[0];
  }

  return sources.reduce((combined, current) =>
    mergeAirportData(combined, current)
  );
}

/**
 * Resolve data conflicts between sources
 */
export function resolveDataConflicts(
  sources: ProcessedAirportData[],
  priorities: string[] = ["airportdb", "faa", "icao"]
): ProcessedAirportData {
  // Sort sources by priority
  const sortedSources = sources.sort((a, b) => {
    const aPriority = priorities.indexOf(a.data_quality.source);
    const bPriority = priorities.indexOf(b.data_quality.source);

    if (aPriority === -1 && bPriority === -1) return 0;
    if (aPriority === -1) return 1;
    if (bPriority === -1) return -1;

    return aPriority - bPriority;
  });

  return combineAirportSources(sortedSources);
}

/**
 * Prioritize data sources
 */
export function prioritizeDataSources(
  sources: ProcessedAirportData[],
  priorityOrder: string[]
): ProcessedAirportData[] {
  return sources.sort((a, b) => {
    const aPriority = priorityOrder.indexOf(a.data_quality.source);
    const bPriority = priorityOrder.indexOf(b.data_quality.source);

    if (aPriority === -1 && bPriority === -1) return 0;
    if (aPriority === -1) return 1;
    if (bPriority === -1) return -1;

    return aPriority - bPriority;
  });
}
