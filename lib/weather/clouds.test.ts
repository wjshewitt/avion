import { describe, expect, it } from "vitest";
import type { DecodedMetar } from "@/types/checkwx";
import { deriveCloudLayerState } from "./clouds";

function createMetar(partial: Partial<DecodedMetar>): DecodedMetar {
  return {
    icao: "TEST",
    observed: new Date("2024-01-01T12:00:00Z").toISOString(),
    raw_text: "TEST METAR",
    ...partial,
  } as DecodedMetar;
}

describe("deriveCloudLayerState", () => {
  it("returns clear state when no clouds are present", () => {
    const state = deriveCloudLayerState(createMetar({ clouds: [] }));
    expect(state.category).toBe("clear");
    expect(state.opacity).toBeGreaterThan(0);
  });

  it("detects scattered clouds from SCT layers", () => {
    const state = deriveCloudLayerState(
      createMetar({
        clouds: [
          { code: "SCT", text: "scattered", base_feet_agl: 4000 },
        ],
      })
    );

    expect(state.category).toBe("scattered");
    expect(state.baseFt).toBe(4000);
  });

  it("detects broken and overcast coverage", () => {
    const broken = deriveCloudLayerState(
      createMetar({
        clouds: [
          { code: "BKN", text: "broken", base_feet_agl: 2500 },
        ],
      })
    );

    const overcast = deriveCloudLayerState(
      createMetar({
        clouds: [
          { code: "OVC", text: "overcast", base_feet_agl: 900 },
        ],
      })
    );

    expect(broken.category).toBe("broken");
    expect(overcast.category).toBe("overcast");
    expect(overcast.baseFt).toBe(900);
  });

  it("classifies high, thin clouds when bases are very high", () => {
    const state = deriveCloudLayerState(
      createMetar({
        clouds: [
          { code: "SCT", text: "scattered high", base_feet_agl: 22000 },
        ],
      })
    );

    expect(state.category).toBe("high-thin");
    expect(state.baseFt).toBe(22000);
  });

  it("promotes to storm when thunderstorm signatures are present", () => {
    const state = deriveCloudLayerState(
      createMetar({
        raw_text: "TEST 101200Z 22015KT 2SM TSRA BKN020CB OVC040 18/16 A2992",
        clouds: [
          { code: "BKN", text: "broken CB", base_feet_agl: 2000 },
        ],
      })
    );

    expect(state.category).toBe("storm");
  });

  it("derives motion buckets from wind speed", () => {
    const calm = deriveCloudLayerState(
      createMetar({
        wind: { speed_kts: 3 },
      })
    );

    const breezy = deriveCloudLayerState(
      createMetar({
        wind: { speed_kts: 12 },
      })
    );

    const windy = deriveCloudLayerState(
      createMetar({
        wind: { speed_kts: 25 },
      })
    );

    expect(calm.motion).toBe("calm");
    expect(breezy.motion).toBe("breezy");
    expect(windy.motion).toBe("windy");
  });
});
