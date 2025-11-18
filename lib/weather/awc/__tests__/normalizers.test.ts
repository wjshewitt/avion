import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { normalizeHazardFeature, normalizePirepFeature } from "../normalizers/hazard";
import {
  AwcHazardGeoJsonSchema,
  type AwcHazardFeature,
  type AwcPirepFeature,
} from "../../validation/awc";

describe("AWC normalizers", () => {
  it("normalizes hazard feature geometry and severity", () => {
    const feature: AwcHazardFeature = {
      id: "sig01",
      type: "Feature",
      properties: {
        hazard: "Convective SIGMET",
        severity: "SEV",
        issueTime: "2024-11-17T09:45:00Z",
        validTime: "2024-11-17T10:30:00Z",
        expireTime: "2024-11-17T12:30:00Z",
        validTimeFrom: "2024-11-17T10:00:00Z",
        validTimeTo: "2024-11-17T12:00:00Z",
        rawText: "SEV TS MOV NE",
        flightLevels: { lower: 240, upper: 400 },
        movement: { direction: 45, speed: 40 },
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-101, 33],
            [-100, 34],
            [-99, 33],
            [-101, 33],
          ],
        ],
      },
    };

    const normalized = normalizeHazardFeature(feature, "sigmet");
    expect(normalized.kind).toBe("sigmet");
    expect(normalized.severity).toBe("high");
    expect(normalized.altitude?.upperFt).toBe(400);
    expect(normalized.geometry?.centroid).toBeDefined();
  });

  it("normalizes pirep feature", () => {
    const pirep: AwcPirepFeature = {
      id: "pirep01",
      type: "Feature",
      properties: {
        obs_time: "2024-11-17T11:20:00Z",
        aircraft_ref: "B737",
        altitude_ft_msl: 32000,
        turb: "MOD",
        ice: "LGT",
        raw_text: "PIREP MDT TURB",
      },
      geometry: {
        type: "Point",
        coordinates: [-100.5, 33.2],
      },
    };

    const normalized = normalizePirepFeature(pirep);
    expect(normalized.turbulence).toBe("moderate");
    expect(normalized.icing).toBe("light");
    expect(normalized.altitudeFtMsl).toBe(32000);
  });

  it("parses real-world SIGMET fixture", () => {
    const file = path.join(
      __dirname,
      "..",
      "__fixtures__",
      "sigmet_sample.json"
    );
    const sample = JSON.parse(fs.readFileSync(file, "utf-8"));
    const parsed = AwcHazardGeoJsonSchema.parse(sample);
    const normalized = parsed.features.map((feature) =>
      normalizeHazardFeature(feature, "sigmet")
    );
    expect(normalized[0]?.narrative).toContain("SIGMET");
    expect(normalized[0]?.validFrom).toBeDefined();
  });

  it("generates distinct IDs for hazards sharing ICAO but different times", () => {
    const base: AwcHazardFeature = {
      id: undefined,
      type: "Feature",
      properties: {
        icaoId: "KKCI",
        hazard: "SIGMET",
        severity: "SEV",
        issueTime: "2024-11-17T10:00:00Z",
        validTimeFrom: "2024-11-17T10:00:00Z",
        validTimeTo: "2024-11-17T12:00:00Z",
        validTime: undefined,
        expireTime: undefined,
        flightLevels: undefined,
        rawText: "SIGMET 1",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-101, 33],
            [-100, 34],
            [-99, 33],
            [-101, 33],
          ],
        ],
      },
    };

    const later: AwcHazardFeature = {
      ...base,
      properties: {
        ...base.properties!,
        issueTime: "2024-11-17T12:00:00Z",
        validTimeFrom: "2024-11-17T12:00:00Z",
        validTimeTo: "2024-11-17T14:00:00Z",
        rawText: "SIGMET 2",
      },
    };

    const first = normalizeHazardFeature(base, "sigmet");
    const second = normalizeHazardFeature(later, "sigmet");

    expect(first.id).not.toBe(second.id);
    expect(first.id).toContain("sigmet");
    expect(second.id).toContain("sigmet");
  });
});
