import type {
  FlightRecord,
  AirportCoordinate,
  RiskScores,
  CrewBriefing,
} from "@/types";

/**
 * Load flight data from JSON file
 * @returns Promise resolving to array of FlightRecord objects
 * @throws Error if data loading fails
 */
export async function loadFlightData(): Promise<FlightRecord[]> {
  try {
    const response = await fetch("/data/flights.json");

    if (!response.ok) {
      throw new Error(`Failed to load flight data: ${response.statusText}`);
    }

    const data: FlightRecord[] = await response.json();

    // Validate data structure
    if (!Array.isArray(data)) {
      throw new Error("Invalid flight data format: expected array");
    }

    return data;
  } catch (error) {
    console.error("Error loading flight data:", error);
    throw error;
  }
}

/**
 * Load airport coordinate data from JSON file
 * @returns Promise resolving to array of AirportCoordinate objects
 * @throws Error if data loading fails
 */
export async function loadAirportData(): Promise<AirportCoordinate[]> {
  try {
    const response = await fetch("/data/airports.json");

    if (!response.ok) {
      throw new Error(`Failed to load airport data: ${response.statusText}`);
    }

    const data: AirportCoordinate[] = await response.json();

    // Validate data structure
    if (!Array.isArray(data)) {
      throw new Error("Invalid airport data format: expected array");
    }

    return data;
  } catch (error) {
    console.error("Error loading airport data:", error);
    throw error;
  }
}

/**
 * Load risk scores from JSON file
 * @returns Promise resolving to record of RiskScores indexed by flight ID
 * @throws Error if data loading fails
 */
export async function loadRiskScores(): Promise<Record<string, RiskScores>> {
  try {
    const response = await fetch("/data/risk-scores.json");

    if (!response.ok) {
      throw new Error(`Failed to load risk scores: ${response.statusText}`);
    }

    const data: Record<string, RiskScores> = await response.json();

    // Validate data structure
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      throw new Error("Invalid risk scores format: expected object");
    }

    return data;
  } catch (error) {
    console.error("Error loading risk scores:", error);
    throw error;
  }
}

/**
 * Load crew briefings from JSON file
 * @returns Promise resolving to record of CrewBriefing indexed by flight ID
 * @throws Error if data loading fails
 */
export async function loadBriefings(): Promise<Record<string, CrewBriefing>> {
  try {
    const response = await fetch("/data/briefings.json");

    if (!response.ok) {
      throw new Error(`Failed to load briefings: ${response.statusText}`);
    }

    const data: Record<string, CrewBriefing> = await response.json();

    // Validate data structure
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      throw new Error("Invalid briefings format: expected object");
    }

    return data;
  } catch (error) {
    console.error("Error loading briefings:", error);
    throw error;
  }
}

/**
 * Load all application data
 * @returns Promise resolving to object containing all data
 * @throws Error if any data loading fails
 */
export async function loadAllData() {
  try {
    const [flights, airports, riskScores, briefings] = await Promise.all([
      loadFlightData(),
      loadAirportData(),
      loadRiskScores(),
      loadBriefings(),
    ]);

    return {
      flights,
      airports,
      riskScores,
      briefings,
    };
  } catch (error) {
    console.error("Error loading application data:", error);
    throw error;
  }
}
