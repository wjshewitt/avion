import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getAirportTemporalProfile } from "./authority";

// Mock dependencies
vi.mock("@/lib/airports/store", () => ({
  getAirportCore: vi.fn(),
}));

vi.mock("tz-lookup", () => ({
  default: vi.fn(),
}));

import { getAirportCore } from "@/lib/airports/store";
import tzLookup from "tz-lookup";

describe("getAirportTemporalProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("generates cache key with correct month (not 0-indexed)", async () => {
    // Mock airport data
    vi.mocked(getAirportCore).mockResolvedValue({
      icao: "KJFK",
      iata: "JFK",
      name: "John F Kennedy International Airport",
      city: "New York",
      state: "NY",
      country: "United States",
      latitude: 40.6413,
      longitude: -73.7781,
      timezone: "America/New_York",
      elevation_ft: 13,
      updated_at: "2025-11-17T00:00:00Z",
    });

    // Set a fixed date: November 17, 2025 at 21:00 UTC
    const fixedDate = new Date("2025-11-17T21:00:00Z");
    vi.useFakeTimers();
    vi.setSystemTime(fixedDate);

    const profile = await getAirportTemporalProfile("KJFK");

    expect(profile).not.toBeNull();
    expect(profile?.metadata.cacheKey).toMatch(/^America\/New_York:2025-11-\d{2}$/);
    
    // The key insight: November = month 11, not month 10!
    // If the bug existed, it would show "2025-10-17" instead of "2025-11-17"
    expect(profile?.metadata.cacheKey).toContain("2025-11-");
    expect(profile?.metadata.cacheKey).not.toContain("2025-10-");

    vi.useRealTimers();
  });

  it("generates cache key matching the actual date used for solar calculations", async () => {
    vi.mocked(getAirportCore).mockResolvedValue({
      icao: "EGLL",
      iata: "LHR",
      name: "London Heathrow Airport",
      city: "London",
      state: null,
      country: "United Kingdom",
      latitude: 51.4706,
      longitude: -0.461941,
      timezone: "Europe/London",
      elevation_ft: 83,
      updated_at: "2025-11-17T00:00:00Z",
    });

    // December 5, 2025 at 14:30 UTC
    const fixedDate = new Date("2025-12-05T14:30:00Z");
    vi.useFakeTimers();
    vi.setSystemTime(fixedDate);

    const profile = await getAirportTemporalProfile("EGLL");

    expect(profile).not.toBeNull();
    
    // Cache key should show December (12), not November (11)
    expect(profile?.metadata.cacheKey).toBe("Europe/London:2025-12-05");

    // Solar times should be for December 5
    const sunriseDate = new Date(profile!.sun.sunriseUtc);
    expect(sunriseDate.getUTCMonth()).toBe(11); // December = 11 (0-indexed in Date)
    expect(sunriseDate.getUTCDate()).toBe(5);

    vi.useRealTimers();
  });

  it("handles timezone-aware cache keys correctly", async () => {
    vi.mocked(getAirportCore).mockResolvedValue({
      icao: "YSSY",
      iata: "SYD",
      name: "Sydney Airport",
      city: "Sydney",
      state: "NSW",
      country: "Australia",
      latitude: -33.9461,
      longitude: 151.177,
      timezone: "Australia/Sydney",
      elevation_ft: 21,
      updated_at: "2025-11-17T00:00:00Z",
    });

    // November 17, 2025 at 14:00 UTC (November 18 in Sydney at UTC+11)
    const fixedDate = new Date("2025-11-17T14:00:00Z");
    vi.useFakeTimers();
    vi.setSystemTime(fixedDate);

    const profile = await getAirportTemporalProfile("YSSY");

    expect(profile).not.toBeNull();
    
    // Should show November 18 in Sydney time (UTC+11)
    expect(profile?.metadata.cacheKey).toBe("Australia/Sydney:2025-11-18");

    vi.useRealTimers();
  });

  it("handles missing coordinates gracefully", async () => {
    vi.mocked(getAirportCore).mockResolvedValue({
      icao: "TEST",
      iata: null,
      name: "Test Airport",
      city: null,
      state: null,
      country: null,
      latitude: null,
      longitude: null,
      timezone: "UTC",
      elevation_ft: null,
      updated_at: "2025-11-17T00:00:00Z",
    });

    const profile = await getAirportTemporalProfile("TEST");

    expect(profile).not.toBeNull();
    expect(profile?.metadata.warnings).toContain("Latitude/longitude missing; solar data may be inaccurate");
    expect(profile?.airport.latitude).toBeNull();
    expect(profile?.airport.longitude).toBeNull();
  });

  it("returns null for non-existent airports", async () => {
    vi.mocked(getAirportCore).mockResolvedValue(null);

    const profile = await getAirportTemporalProfile("XXXX");

    expect(profile).toBeNull();
  });
});
