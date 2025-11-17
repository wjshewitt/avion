import { describe, it, expect } from "vitest";
import { getSolarTimes, determineDaySegment, isNightTime } from "./solar";

describe("solar calculations", () => {
  it("computes sunrise and sunset for JFK", () => {
    const solar = getSolarTimes({
      latitude: 40.6413,
      longitude: -73.7781,
      timezone: "America/New_York",
      date: new Date(Date.UTC(2025, 5, 1, 12, 0, 0)),
    });

    expect(solar.sunriseUtc).toBeInstanceOf(Date);
    expect(solar.sunsetUtc).toBeInstanceOf(Date);
  });

  it("detects day segments", () => {
    const solar = getSolarTimes({
      latitude: 51.47,
      longitude: -0.4543,
      timezone: "Europe/London",
      date: new Date(Date.UTC(2025, 6, 1, 12, 0, 0)),
    });

    const dayMoment = new Date(solar.sunriseUtc.getTime() + 60 * 60 * 1000);
    const nightMoment = new Date(solar.sunsetUtc.getTime() + 6 * 60 * 60 * 1000);

    expect(determineDaySegment(dayMoment, solar)).toBe("day");
    expect(isNightTime(nightMoment, solar)).toBe(true);
  });
});
