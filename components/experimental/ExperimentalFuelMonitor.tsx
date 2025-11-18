"use client";

import { useMemo, useState } from "react";
import FuelMonitor from "../avion/FuelMonitor";
import { cn } from "../../lib/utils";

type PresetId = "balanced" | "arrival";

export function ExperimentalFuelMonitor() {
  const [preset, setPreset] = useState<PresetId>("balanced");

  const state = useMemo(() => {
    if (preset === "arrival") {
      return {
        tanks: { left: 2200, center: 1400, right: 2600 },
        total: 6200,
        endurance: "01:42",
      } as const;
    }
    return {
      tanks: { left: 4800, center: 5200, right: 4700 },
      total: 14700,
      endurance: "04:38",
    } as const;
  }, [preset]);

  return (
    <div className="flex h-full flex-col gap-4">
      <FuelMonitor
        tanks={state.tanks}
        total={state.total}
        endurance={state.endurance}
      />

      <div className="flex items-center justify-between gap-4">
        <div className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA]">
          PROFILE
        </div>
        <div className="flex gap-2 text-[10px] font-mono uppercase tracking-widest">
          <button
            type="button"
            onClick={() => setPreset("balanced")}
            className={cn(
              "px-2 py-1 rounded-sm border border-[#333] transition-colors",
              preset === "balanced"
                ? "border-[#F04E30] text-[#F04E30] bg-[#1A1A1A]"
                : "text-[#A1A1AA] hover:border-[#444]",
            )}
          >
            CRUISE
          </button>
          <button
            type="button"
            onClick={() => setPreset("arrival")}
            className={cn(
              "px-2 py-1 rounded-sm border border-[#333] transition-colors",
              preset === "arrival"
                ? "border-[#F04E30] text-[#F04E30] bg-[#1A1A1A]"
                : "text-[#A1A1AA] hover:border-[#444]",
            )}
          >
            ARRIVAL
          </button>
        </div>
      </div>
    </div>
  );
}
