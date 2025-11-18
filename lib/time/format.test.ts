import { describe, it, expect } from "vitest";
import { formatZulu, formatLocalWithTz, describeTimezoneOffsets } from "./format";

describe("time formatting", () => {
  it("formats zulu time with trailing Z", () => {
    const fixed = new Date(Date.UTC(2025, 0, 1, 9, 5, 0));
    expect(formatZulu(fixed)).toBe("09:05 Z");
  });

  it("includes timezone abbreviation in local formatting", () => {
    const fixed = new Date(Date.UTC(2025, 5, 1, 12, 0, 0));
    const local = formatLocalWithTz(fixed, "America/New_York");
    expect(local).toMatch(/\d{2}:\d{2}.*(EDT|EST)/);
  });

  it("produces accurate local time for JFK november sample", () => {
    const sample = new Date(Date.UTC(2025, 10, 18, 0, 51, 0));
    expect(formatLocalWithTz(sample, "America/New_York")).toBe("19:51 EST");
  });

  it("describes offsets and dst usage", () => {
    const offsets = describeTimezoneOffsets("America/New_York");
    expect(typeof offsets.standardOffsetMinutes).toBe("number");
    expect(typeof offsets.usesDst).toBe("boolean");
  });
});
