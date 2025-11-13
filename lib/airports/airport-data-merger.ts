// Airport Data Merger Utilities
// Handles merging airport data from multiple sources with conflict resolution

import { ProcessedAirportData } from "@/types/airportdb";

function emptyRunways(): ProcessedAirportData["runways"] {
  return {
    count: 0,
    longest_ft: 0,
    shortest_ft: 0,
    surface_types: [],
    all_lighted: false,
    ils_equipped: false,
    details: [],
  };
}

function emptyCommunications(): ProcessedAirportData["communications"] {
  return {
    has_tower: false,
    has_ground: false,
    has_approach: false,
    has_atis: false,
    frequencies_by_type: {},
    primary_frequencies: {},
  };
}

function emptyNavigation(): ProcessedAirportData["navigation"] {
  return {
    navaids_count: 0,
    has_ils: false,
    has_ndb: false,
    has_vor: false,
    approach_types: [],
    navaids_by_type: {},
  };
}

function emptyCapabilities(): ProcessedAirportData["capabilities"] {
  return {
    max_aircraft_category: "A",
    night_operations: false,
    all_weather_operations: false,
    international_capable: false,
    commercial_service: false,
  };
}

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
    runways: (() => {
      const secondaryRunways = secondary.runways ?? emptyRunways();
      const primaryRunways = primary.runways ?? emptyRunways();
      return {
        ...secondaryRunways,
        ...primaryRunways,
        details: [
          ...(secondaryRunways.details || []),
          ...(primaryRunways.details || []),
        ],
      };
    })(),
    // Merge communications
    communications: (() => {
      const secondaryComms = secondary.communications ?? emptyCommunications();
      const primaryComms = primary.communications ?? emptyCommunications();
      return {
        ...secondaryComms,
        ...primaryComms,
        frequencies_by_type: {
          ...secondaryComms.frequencies_by_type,
          ...primaryComms.frequencies_by_type,
        },
        primary_frequencies: {
          ...secondaryComms.primary_frequencies,
          ...primaryComms.primary_frequencies,
        },
      };
    })(),
    // Merge navigation data
    navigation: (() => {
      const secondaryNav = secondary.navigation ?? emptyNavigation();
      const primaryNav = primary.navigation ?? emptyNavigation();
      return {
        ...secondaryNav,
        ...primaryNav,
        navaids_by_type: {
          ...secondaryNav.navaids_by_type,
          ...primaryNav.navaids_by_type,
        },
      };
    })(),
    // Merge capabilities - use most permissive
    capabilities: (() => {
      const secondaryCap = secondary.capabilities ?? emptyCapabilities();
      const primaryCap = primary.capabilities ?? emptyCapabilities();
      return {
        max_aircraft_category:
          primaryCap.max_aircraft_category > secondaryCap.max_aircraft_category
            ? primaryCap.max_aircraft_category
            : secondaryCap.max_aircraft_category,
        night_operations: primaryCap.night_operations || secondaryCap.night_operations,
        all_weather_operations:
          primaryCap.all_weather_operations || secondaryCap.all_weather_operations,
        international_capable:
          primaryCap.international_capable || secondaryCap.international_capable,
        commercial_service:
          primaryCap.commercial_service || secondaryCap.commercial_service,
      };
    })(),
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
