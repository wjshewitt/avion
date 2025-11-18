import { describe, expect, it } from "vitest";
import { createAirportLiteDeckDataset } from "./airport-lite-utils";
import { buildClusterIndex, type ClusterPointProperties } from "./useAirportClusterer";
import type { AirportLite } from "@/types/airport-lite";

const sampleAirports: AirportLite[] = [
  {
    icao: "AA01",
    iata: "A01",
    name: "Alpha",
    municipality: "Town",
    country: "US",
    region: "US-CA",
    latitude: 34,
    longitude: -118,
    elevation_ft: 100,
    type: "small_airport",
    scheduled_service: false,
    longest_runway_ft: 5000,
    surface_types: ["ASP"],
    ils_equipped: false,
    all_lighted: false,
    popularity_score: 0.2,
  },
  {
    icao: "AA02",
    iata: "A02",
    name: "Bravo",
    municipality: "Town",
    country: "US",
    region: "US-CA",
    latitude: 34.01,
    longitude: -118.01,
    elevation_ft: 120,
    type: "small_airport",
    scheduled_service: false,
    longest_runway_ft: 5200,
    surface_types: ["ASP"],
    ils_equipped: false,
    all_lighted: false,
    popularity_score: 0.1,
  },
];

describe("buildClusterIndex", () => {
  it("returns null for empty dataset", () => {
    expect(buildClusterIndex(undefined)).toBeNull();
  });

  it("clusters airports into a single feature at low zoom", () => {
    const dataset = createAirportLiteDeckDataset(sampleAirports);
    const index = buildClusterIndex(dataset);
    expect(index).not.toBeNull();
    const clusters = index!.getClusters([-180, -90, 180, 90], 0);
    const clusterFeature = clusters.find(
      (feature) => (feature.properties as ClusterPointProperties | undefined)?.cluster
    );
    const clusterProps = clusterFeature?.properties as ClusterPointProperties | undefined;
    expect(clusterProps?.point_count).toBe(2);
  });
});
