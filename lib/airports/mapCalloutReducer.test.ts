import { describe, expect, it } from "vitest";
import { mapCalloutReducer, type MapCalloutState } from "./mapCalloutReducer";
import type { AirportLite } from "@/types/airport-lite";

const mockAirport: AirportLite = {
  icao: "KJFK",
  iata: "JFK",
  name: "John F Kennedy International",
  municipality: "New York",
  country: "US",
  region: "US-NY",
  latitude: 40.6413,
  longitude: -73.7781,
  elevation_ft: 13,
  type: "large_airport",
  scheduled_service: true,
  longest_runway_ft: 14572,
  surface_types: ["ASP"],
  ils_equipped: true,
  all_lighted: true,
  popularity_score: 1,
};

describe("mapCalloutReducer", () => {
  it("opens a callout", () => {
    const next = mapCalloutReducer(null, { type: "open", airport: mockAirport, position: { x: 10, y: 20 } });
    expect(next).toMatchObject({ airport: mockAirport, position: { x: 10, y: 20 } });
  });

  it("moves an existing callout", () => {
    const state: MapCalloutState = { airport: mockAirport, position: { x: 0, y: 0 } };
    const next = mapCalloutReducer(state, { type: "move", position: { x: 5, y: 5 } });
    expect(next?.position).toEqual({ x: 5, y: 5 });
  });

  it("ignores move when state is null", () => {
    const next = mapCalloutReducer(null, { type: "move", position: { x: 1, y: 1 } });
    expect(next).toBeNull();
  });

  it("closes the callout", () => {
    const next = mapCalloutReducer({ airport: mockAirport, position: { x: 1, y: 1 } }, { type: "close" });
    expect(next).toBeNull();
  });
});
