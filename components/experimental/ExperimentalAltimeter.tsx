"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type PresetId = "ground" | "climb" | "cruise" | "high";

const presets = [
  { id: "ground", label: "GROUND", value: 0 },
  { id: "climb", label: "5,000", value: 5000 },
  { id: "cruise", label: "10,000", value: 10000 },
  { id: "high", label: "35,000", value: 35000 },
] as const;

export function ExperimentalAltimeter() {
  const [preset, setPreset] = useState<PresetId>("cruise");
  const [altitudeType, setAltitudeType] = useState<"msl" | "agl">("msl");

  const altitude = presets.find((p) => p.id === preset)?.value ?? 10000;

  // Split altitude into individual digits for drum display
  const digits = useMemo(() => {
    const str = altitude.toString().padStart(5, "0");
    return str.split("");
  }, [altitude]);

  return (
    <div className="flex h-full flex-col justify-between gap-6">
      {/* Main Altimeter Display */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        {/* Drum Display */}
        <div className="flex items-center gap-1 rounded-sm bg-[#1A1A1A] px-4 py-3 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.3),inset_-1px_-1px_3px_rgba(255,255,255,0.05)]">
          {digits.map((digit, idx) => (
            <div key={idx} className="relative">
              {/* Add comma separator after second digit */}
              {idx === 2 && (
                <span className="absolute -right-2 top-0 text-2xl font-mono text-[#666] tabular-nums">
                  ,
                </span>
              )}
              <motion.div
                key={`${digit}-${altitude}`}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                  delay: idx * 0.05,
                }}
                className="flex h-12 w-8 items-center justify-center rounded-sm bg-[#0A0A0A] text-3xl font-mono font-bold text-white tabular-nums shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
              >
                {digit}
              </motion.div>
            </div>
          ))}
          <span className="ml-1 text-sm font-mono text-[#999] uppercase">FT</span>
        </div>

        {/* MSL/AGL Toggle */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA]">
            REFERENCE
          </span>
          <div className="flex gap-1 rounded-sm border border-[#333] bg-[#1A1A1A] p-0.5">
            <button
              type="button"
              onClick={() => setAltitudeType("msl")}
              className={cn(
                "px-3 py-1 rounded-sm text-[10px] font-mono uppercase tracking-widest transition-all",
                altitudeType === "msl"
                  ? "bg-[#F04E30] text-white shadow-[0_0_8px_rgba(240,78,48,0.4)]"
                  : "text-[#A1A1AA] hover:text-white",
              )}
            >
              MSL
            </button>
            <button
              type="button"
              onClick={() => setAltitudeType("agl")}
              className={cn(
                "px-3 py-1 rounded-sm text-[10px] font-mono uppercase tracking-widest transition-all",
                altitudeType === "agl"
                  ? "bg-[#F04E30] text-white shadow-[0_0_8px_rgba(240,78,48,0.4)]"
                  : "text-[#A1A1AA] hover:text-white",
              )}
            >
              AGL
            </button>
          </div>
        </div>

        {/* Pressure Setting */}
        <div className="flex flex-col items-center gap-1">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA]">
            ALTIMETER SETTING
          </div>
          <div className="text-lg font-mono tabular-nums text-white">
            29.92<span className="text-sm text-[#999]"> inHg</span>
          </div>
        </div>
      </div>

      {/* Preset Controls */}
      <div className="flex items-center justify-between gap-4 border-t border-[#333] pt-4">
        <div className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA]">
          ALTITUDE PRESETS
        </div>
        <div className="flex gap-2">
          {presets.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPreset(p.id as PresetId)}
              className={cn(
                "px-2 py-1 rounded-sm border border-[#333] text-[10px] font-mono uppercase tracking-widest transition-colors",
                preset === p.id
                  ? "border-[#F04E30] text-[#F04E30] bg-[#1A1A1A]"
                  : "text-[#A1A1AA] hover:border-[#444]",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
