"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type VSIPreset = "level" | "climb" | "descent" | "rapid";

const presets = [
  { id: "level", label: "LEVEL", value: 0 },
  { id: "climb", label: "CLIMB", value: 500 },
  { id: "descent", label: "DESCENT", value: -700 },
  { id: "rapid", label: "RAPID", value: -1500 },
] as const;

export function ExperimentalVerticalSpeed() {
  const [preset, setPreset] = useState<VSIPreset>("level");

  const vsi = presets.find((p) => p.id === preset)?.value ?? 0;

  // Tape range: -2000 to +2000 fpm
  const tapeRange = { min: -2000, max: 2000 };
  const majorTicks = [-2000, -1500, -1000, -500, 0, 500, 1000, 1500, 2000];

  // Calculate indicator position (0-100% where 50% is zero)
  const indicatorPosition = 50 - (vsi / tapeRange.max) * 45; // 45% range each direction

  return (
    <div className="flex h-full flex-col gap-4">
      {/* VSI Tape */}
      <div className="flex-1 flex gap-4">
        {/* Vertical Tape */}
        <div className="relative w-16 flex-shrink-0 rounded-sm bg-[#1A1A1A] shadow-[inset_1px_1px_3px_rgba(0,0,0,0.3),inset_-1px_-1px_3px_rgba(255,255,255,0.05)]">
          {/* Tape Markings */}
          <motion.div
            className="absolute inset-0 flex flex-col items-end justify-start px-2 py-2"
            animate={{ y: `${vsi * 0.045}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          >
            {majorTicks.map((tick) => {
              const position = 50 - (tick / tapeRange.max) * 45;
              const isZero = tick === 0;
              
              return (
                <div
                  key={tick}
                  className="absolute right-2"
                  style={{ top: `${position}%`, transform: "translateY(-50%)" }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-xs font-mono tabular-nums",
                        isZero ? "text-white font-bold" : "text-[#999]",
                      )}
                    >
                      {Math.abs(tick / 100)}
                    </span>
                    <div
                      className={cn(
                        "h-0.5",
                        isZero ? "w-8 bg-white" : tick % 1000 === 0 ? "w-6 bg-[#666]" : "w-4 bg-[#444]",
                      )}
                    />
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* Zero Line Emphasis */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-[#F04E30] pointer-events-none" />

          {/* Indicator Arrow */}
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-1 pointer-events-none">
            <motion.div
              initial={{ x: -5, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[12px] border-l-[#F04E30]" />
            </motion.div>
          </div>
        </div>

        {/* Digital Readout & Trend */}
        <div className="flex flex-col justify-between flex-1">
          {/* Current VSI */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA]">
              VERTICAL SPEED
            </div>
            <motion.div
              key={vsi}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="flex items-baseline gap-1 rounded-sm border border-[#333] bg-[#2A2A2A] px-4 py-3"
            >
              <span className="text-3xl font-mono font-bold tabular-nums text-white">
                {vsi > 0 ? "+" : ""}
                {vsi}
              </span>
              <span className="text-sm font-mono text-[#999] uppercase">fpm</span>
            </motion.div>
          </div>

          {/* Trend Indicator (simulated) */}
          <div className="flex flex-col gap-2 rounded-sm border border-[#333] bg-[#1A1A1A] p-3">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA]">
              TREND
            </div>
            <div className="relative h-16 flex items-center justify-center">
              <svg viewBox="0 0 100 60" className="w-full h-full">
                {/* Trend Line (simple simulation) */}
                <motion.polyline
                  points={
                    vsi > 0
                      ? "10,50 40,40 70,25 90,15"
                      : vsi < 0
                        ? "10,20 40,30 70,40 90,48"
                        : "10,30 40,30 70,30 90,30"
                  }
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="1.5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
                {/* Center line */}
                <line x1="0" y1="30" x2="100" y2="30" stroke="#333" strokeWidth="0.5" />
              </svg>
            </div>
            <div className="text-xs font-mono text-[#999] text-center">
              {vsi > 0 ? "Climb established" : vsi < 0 ? "Descent established" : "Level flight"}
            </div>
          </div>
        </div>
      </div>

      {/* Preset Controls */}
      <div className="flex items-center justify-between gap-4 border-t border-[#333] pt-4">
        <div className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA]">
          VSI PRESETS
        </div>
        <div className="flex gap-2">
          {presets.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPreset(p.id as VSIPreset)}
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
