import { describe, it, expect } from "vitest";
import type { RiskInputs } from "@/lib/weather/risk/types";
import type { DecodedMetar } from "@/types/checkwx";
import { assessTemperature } from "./temperature";

function buildInputs(metar: Partial<DecodedMetar>): RiskInputs {
  return {
    icao: metar.icao ?? "KTEST",
    metar: metar as DecodedMetar,
    taf: undefined,
    now: new Date(),
    hazards: [],
    pireps: [],
  };
}

describe("assessTemperature", () => {
  it("flags near-freezing temperature with moisture as icing possible (moderate)", () => {
    const metar: Partial<DecodedMetar> = {
      icao: "KICE",
      observed: new Date().toISOString(),
      raw_text: "KICE 121200Z 02008KT 4SM RA BKN020 01/00 A2992",
      temperature: { celsius: 1, fahrenheit: 34 },
      dewpoint: { celsius: 0, fahrenheit: 32 },
      clouds: [{ code: "BKN", text: "broken", feet: 2000 } as any],
    };

    const result = assessTemperature(buildInputs(metar));

    expect(result.score).toBeGreaterThanOrEqual(50);
    expect(result.score).toBeLessThanOrEqual(70);
    expect(result.severity === "moderate" || result.severity === "high").toBe(true);
    expect(result.messages.join(" ").toLowerCase()).toContain("icing");
  });

  it("flags subfreezing moist conditions in classic icing band as high risk", () => {
    const metar: Partial<DecodedMetar> = {
      icao: "KFRZ",
      observed: new Date().toISOString(),
      raw_text: "KFRZ 121200Z 01010KT 2SM SN OVC015 M05/M06 A2988",
      temperature: { celsius: -5, fahrenheit: 23 },
      dewpoint: { celsius: -6, fahrenheit: 21 },
      clouds: [{ code: "OVC", text: "overcast", feet: 1500 } as any],
    };

    const result = assessTemperature(buildInputs(metar));

    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(result.severity).toBe("high");
    expect(result.messages.join(" ").toLowerCase()).toContain("icing");
  });

  it("handles subfreezing dry conditions as low but present risk", () => {
    const metar: Partial<DecodedMetar> = {
      icao: "KDRY",
      observed: new Date().toISOString(),
      raw_text: "KDRY 121200Z 00000KT 10SM SKC M03/M15 A3005",
      temperature: { celsius: -3, fahrenheit: 27 },
      dewpoint: { celsius: -15, fahrenheit: 5 },
      clouds: [],
    };

    const result = assessTemperature(buildInputs(metar));

    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThanOrEqual(40);
    expect(result.severity === "low" || result.severity === "moderate").toBe(true);
  });

  it("flags hot-day conditions as performance risk (moderate)", () => {
    const metar: Partial<DecodedMetar> = {
      icao: "KHOT",
      observed: new Date().toISOString(),
      raw_text: "KHOT 121200Z 18006KT 6SM FEW030 36/20 A2990",
      temperature: { celsius: 36, fahrenheit: 97 },
    };

    const result = assessTemperature(buildInputs(metar));

    expect(result.score).toBeGreaterThanOrEqual(50);
    expect(result.severity === "moderate" || result.severity === "high").toBe(true);
    expect(result.messages.join(" ").toLowerCase()).toContain("hot");
  });

  it("flags extreme heat as high risk", () => {
    const metar: Partial<DecodedMetar> = {
      icao: "KEXT",
      observed: new Date().toISOString(),
      raw_text: "KEXT 121200Z 12005KT 5SM HZ 41/20 A2980",
      temperature: { celsius: 41, fahrenheit: 106 },
    };

    const result = assessTemperature(buildInputs(metar));

    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(result.severity).toBe("high");
  });

  it("applies confidence penalty when temperature data is missing", () => {
    const metar: Partial<DecodedMetar> = {
      icao: "KMISS",
      observed: new Date().toISOString(),
      raw_text: "KMISS 121200Z 00000KT 10SM SKC A3000",
    };

    const result = assessTemperature(buildInputs(metar));

    expect(result.score).toBe(0);
    expect(result.confidencePenalty).toBeGreaterThanOrEqual(0.19);
  });
});
