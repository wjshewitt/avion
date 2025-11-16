import type { AirportLite, AirportFilterContext } from "@/types/airport-lite";

const PAVED_SURFACE_CODES = new Set(["ASP", "CON", "PEM", "PSP", "BIT"]);

export interface AirportLiteDeckDataset {
  airports: AirportLite[];
  positions: Float32Array;
  runwayLengths: Float32Array;
  popularityScores: Float32Array;
}

export function createAirportLiteDeckDataset(airports: AirportLite[]): AirportLiteDeckDataset {
  const positions = new Float32Array(airports.length * 2);
  const runwayLengths = new Float32Array(airports.length);
  const popularityScores = new Float32Array(airports.length);

  airports.forEach((airport, index) => {
    positions[index * 2] = airport.longitude ?? 0;
    positions[index * 2 + 1] = airport.latitude ?? 0;
    runwayLengths[index] = airport.longest_runway_ft ?? 0;
    popularityScores[index] = airport.popularity_score ?? 0;
  });

  return {
    airports,
    positions,
    runwayLengths,
    popularityScores,
  };
}

export function airportMatchesFilter(airport: AirportLite, ctx: AirportFilterContext): boolean {
  if (!ctx) return true;

  const { query, country, region, type, scheduledService, minRunwayLength, surfaceType, requiresILS, requiresLighting } = ctx;

  if (query && query.trim().length >= 2) {
    const upper = query.trim().toUpperCase();
    const haystack = [airport.icao, airport.iata, airport.name, airport.municipality]
      .filter(Boolean)
      .map((value) => value!.toUpperCase());
    const matchesQuery = haystack.some((value) => value.includes(upper));
    if (!matchesQuery) return false;
  }

  if (country && airport.country && airport.country !== country) return false;
  if (region && airport.region && airport.region !== region) return false;
  if (type && airport.type && airport.type !== type) return false;
  if (scheduledService && !airport.scheduled_service) return false;
  if (minRunwayLength && airport.longest_runway_ft < minRunwayLength) return false;

  if (surfaceType && surfaceType !== "ALL") {
    const hasPavedSurface = airport.surface_types?.some((surface) => PAVED_SURFACE_CODES.has(surface));
    if (surfaceType === "PAVED" && !hasPavedSurface) return false;
    if (surfaceType === "UNPAVED" && hasPavedSurface) return false;
  }

  if (requiresILS && !airport.ils_equipped) return false;
  if (requiresLighting && !airport.all_lighted) return false;

  return true;
}

export function buildMatchingIcaoSet(dataset: AirportLite[], ctx: AirportFilterContext): Set<string> {
  if (!dataset.length) return new Set();
  return dataset.reduce((acc, airport) => {
    if (airportMatchesFilter(airport, ctx)) {
      acc.add(airport.icao);
    }
    return acc;
  }, new Set<string>());
}
