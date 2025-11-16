import { describe, expect, it } from "vitest";
import type { AirportLite } from "@/types/airport-lite";
import { airportMatchesFilter, createAirportLiteDeckDataset } from "./airport-lite-utils";

const sampleAirport: AirportLite = {
  icao: "TEST",
  iata: "TST",
  name: "Test Airport",
  municipality: "Test City",
  country: "Wonderland",
  region: "WL",
  latitude: 12.34,
  longitude: 56.78,
  elevation_ft: 1000,
  type: "medium_airport",
  scheduled_service: true,
  longest_runway_ft: 8000,
  surface_types: ["ASP"],
  ils_equipped: true,
  all_lighted: true,
  popularity_score: 80,
};

describe("airport-lite utils", () => {
  it("creates deck dataset with typed arrays", () => {
    const dataset = createAirportLiteDeckDataset([sampleAirport]);

    expect(dataset.airports).toHaveLength(1);
    expect(dataset.positions).toHaveLength(2);
    expect(dataset.runwayLengths).toHaveLength(1);
    expect(dataset.popularityScores[0]).toBe(80);
    expect(dataset.positions[0]).toBeCloseTo(56.78);
    expect(dataset.positions[1]).toBeCloseTo(12.34);
  });

  it("evaluates filter context correctly", () => {
    expect(
      airportMatchesFilter(sampleAirport, {
        query: "test",
        country: "Wonderland",
        region: "WL",
        type: "medium_airport",
        minRunwayLength: 7000,
        surfaceType: "PAVED",
        requiresILS: true,
        requiresLighting: true,
        scheduledService: true,
      })
    ).toBe(true);

    expect(
      airportMatchesFilter(sampleAirport, {
        query: "zzz",
      })
    ).toBe(false);
  });
});
