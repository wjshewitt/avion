"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type HeadingPreset = "north" | "east" | "south" | "west";

const presets = [
  { id: "north", label: "N", value: 360 },
  { id: "east", label: "E", value: 90 },
  { id: "south", label: "S", value: 180 },
  { id: "west", label: "W", value: 270 },
] as const;

export function ExperimentalHeadingIndicator() {
  const [preset, setPreset] = useState<HeadingPreset>("north");
  const [magTrue, setMagTrue] = useState<"mag" | "true">("mag");

  const heading = presets.find((p) => p.id === preset)?.value ?? 360;

  // Compass rose markings
  const cardinalPoints = [
    { deg: 0, label: "N" },
    { deg: 30, label: "3" },
    { deg: 60, label: "6" },
    { deg: 90, label: "E" },
    { deg: 120, label: "12" },
    { deg: 150, label: "15" },
    { deg: 180, label: "S" },
    { deg: 210, label: "21" },
    { deg: 240, label: "24" },
    { deg: 270, label: "W" },
    { deg: 300, label: "30" },
    { deg: 330, label: "33" },
  ];

  return (
    <div className="flex h-full flex-col justify-between gap-6">
      {/* Compass Rose */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-48 h-48">
          {/* Outer Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-[#333] bg-[#1A1A1A] shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)]" />

          {/* Rotating Compass Card */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: -heading }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          >
            {/* Cardinal Markings */}
            {cardinalPoints.map((point) => {
              const radian = (point.deg * Math.PI) / 180;
              const radius = 80;
              const x = Math.sin(radian) * radius;
              const y = -Math.cos(radian) * radius;
              const isCardinal = ["N", "E", "S", "W"].includes(point.label);

              return (
                <div
                  key={point.deg}
                  className="absolute"
                  style={{
                    transform: `translate(${x}px, ${y}px) rotate(${heading}deg)`,
                  }}
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "h-3 w-0.5",
                        isCardinal ? "bg-white" : "bg-[#666]",
                      )}
                    />
                    <span
                      className={cn(
                        "mt-1 font-mono text-xs",
                        isCardinal ? "text-white font-semibold" : "text-[#999]",
                      )}
                    >
                      {point.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* Center Aircraft Symbol (Fixed) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 40 40" className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {/* Aircraft triangle */}
              <polygon points="20,5 5,35 20,28 35,35" fill="#F04E30" stroke="white" strokeWidth="1" />
              <circle cx="20" cy="20" r="2" fill="white" />
            </svg>
          </div>

          {/* Heading Bug (Orange) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2">
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-[#F04E30]" />
          </div>
        </div>
      </div>

      {/* Digital Heading Readout */}
      <div className="flex flex-col items-center gap-3">
        <div className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA]">
          HEADING
        </div>
        <motion.div
          key={heading}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="flex items-baseline gap-1 rounded-sm border border-[#333] bg-[#1A1A1A] px-4 py-2 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]"
        >
          <span className="text-4xl font-mono font-bold tabular-nums text-white">
            {heading.toString().padStart(3, "0")}
          </span>
          <span className="text-lg font-mono text-[#999]">°</span>
        </motion.div>

        {/* Mag/True Toggle */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA]">
            REFERENCE
          </span>
          <div className="flex gap-1 rounded-sm border border-[#333] bg-[#1A1A1A] p-0.5">
            <button
              type="button"
              onClick={() => setMagTrue("mag")}
              className={cn(
                "px-3 py-1 rounded-sm text-[10px] font-mono uppercase tracking-widest transition-all",
                magTrue === "mag"
                  ? "bg-[#F04E30] text-white shadow-[0_0_8px_rgba(240,78,48,0.4)]"
                  : "text-[#A1A1AA] hover:text-white",
              )}
            >
              MAG
            </button>
            <button
              type="button"
              onClick={() => setMagTrue("true")}
              className={cn(
                "px-3 py-1 rounded-sm text-[10px] font-mono uppercase tracking-widest transition-all",
                magTrue === "true"
                  ? "bg-[#F04E30] text-white shadow-[0_0_8px_rgba(240,78,48,0.4)]"
                  : "text-[#A1A1AA] hover:text-white",
              )}
            >
              TRUE
            </button>
          </div>
        </div>

        {/* Wind Correction Info */}
        <div className="text-xs font-mono text-[#999]">
          Wind Correction: <span className="text-white">+5°</span>
        </div>
      </div>

      {/* Preset Controls */}
      <div className="flex items-center justify-between gap-4 border-t border-[#333] pt-4">
        <div className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA]">
          QUICK HEADINGS
        </div>
        <div className="flex gap-2">
          {presets.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPreset(p.id as HeadingPreset)}
              className={cn(
                "px-3 py-1 rounded-sm border border-[#333] text-[10px] font-mono uppercase tracking-widest transition-colors",
                preset === p.id
                  ? "border-[#F04E30] text-[#F04E30] bg-[#1A1A1A]"
                  : "text-[#A1A1AA] hover:border-[#444]",
              )}
            >
              {p.value.toString().padStart(3, "0")}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
