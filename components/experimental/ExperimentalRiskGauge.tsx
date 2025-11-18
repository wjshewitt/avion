"use client";

import { useState } from "react";
import RiskPrismGauge from "../avion/RiskPrismGauge";
import { cn } from "../../lib/utils";

const presets = [
  { id: "low", label: "LOW", value: 15 },
  { id: "moderate", label: "MODERATE", value: 45 },
  { id: "high", label: "HIGH", value: 75 },
] as const;

export function ExperimentalRiskGauge() {
  const [active, setActive] = useState<(typeof presets)[number]["id"]>("moderate");

  const current = presets.find((p) => p.id === active) ?? presets[1];

  return (
    <div className="flex h-full flex-col justify-between gap-4">
      <div className="flex-1">
        <RiskPrismGauge value={current.value} />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA]">
          RISK PRESETS
        </div>
        <div className="flex gap-2">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setActive(preset.id)}
              className={cn(
                "px-2 py-1 rounded-sm border border-[#333] text-[10px] font-mono uppercase tracking-widest transition-colors",
                active === preset.id
                  ? "border-[#F04E30] text-[#F04E30] bg-[#1A1A1A]"
                  : "text-[#A1A1AA] hover:border-[#444]",
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
