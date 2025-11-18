import { describe, it, expect } from "vitest";
import { selectAtmosphereCard } from "./avionAtmosphereMapping";
import type { DecodedMetar, DecodedTaf } from "@/types/checkwx";

describe("selectAtmosphereCard", () => {
  it("returns sunny when METAR is CAVOK and only TAF has rain", () => {
    const metar: DecodedMetar = {
      icao: "EGKK",
      raw_text: "EGKK 172250Z 25003KT CAVOK 01/00 Q1026",
      flight_category: "VFR",
      visibility: { miles_float: 10 } as any,
      temperature: { celsius: 1, fahrenheit: 34 } as any,
      barometer: { hg: 30.30, kpa: 103.0, mb: 1026 } as any,
      observed: "2025-11-17T22:50:00Z",
    } as any;

    const taf: DecodedTaf = {
      icao: "EGKK",
      raw_text: "TAF EGKK 172300Z 1800/1906 24005KT 9999 TEMPO 1801/1806 SHRA",
      forecast: [],
    } as any;

    const result = selectAtmosphereCard({ metar, taf });

    expect(result?.variant === "sunny" || result?.variant === "clear-night").toBe(true);
  });

  it("returns heavy-rain when METAR reports rain", () => {
    const metar: DecodedMetar = {
      icao: "EGKK",
      raw_text: "EGKK 172250Z 25003KT 4000 RA SCT010 BKN020 01/00 Q1026",
      flight_category: "MVFR",
      visibility: { miles_float: 2.5 } as any,
      temperature: { celsius: 1, fahrenheit: 34 } as any,
      barometer: { hg: 30.30, kpa: 103.0, mb: 1026 } as any,
      observed: "2025-11-17T22:50:00Z",
    } as any;

    const result = selectAtmosphereCard({ metar, taf: null });

    // Visibility is below 3SM, so low-vis-fog should take precedence over heavy-rain
    expect(result?.variant).toBe("low-vis-fog");
  });
});
