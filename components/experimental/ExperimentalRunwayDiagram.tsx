"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type RunwayId = "09-27" | "18-36";

const runways = {
  "09-27": {
    label: "09/27",
    length: 10000,
    width: 150,
    heading: 90,
    surface: "ASPH",
    condition: "DRY",
    lighting: "HIRL, MALSR, PAPI",
    wind: { speed: 12, direction: 100 }, // Wind from 100°
  },
  "18-36": {
    label: "18/36",
    length: 8400,
    width: 100,
    heading: 180,
    surface: "CONC",
    condition: "WET",
    lighting: "MIRL, REIL",
    wind: { speed: 12, direction: 100 },
  },
} as const;

export function ExperimentalRunwayDiagram() {
  const [selectedRunway, setSelectedRunway] = useState<RunwayId>("09-27");

  const runway = runways[selectedRunway];

  // Calculate crosswind and headwind components
  const windAngleDiff = Math.abs(runway.wind.direction - runway.heading);
  const windAngleRad = (windAngleDiff * Math.PI) / 180;
  const headwind = Math.cos(windAngleRad) * runway.wind.speed;
  const crosswind = Math.sin(windAngleRad) * runway.wind.speed;

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Runway Diagram */}
      <div className="flex-1 rounded-sm bg-[#F4F4F4] p-6 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.1),inset_-1px_-1px_3px_rgba(255,255,255,0.3)]">
        <motion.div
          key={selectedRunway}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full flex items-center justify-center"
        >
          <svg viewBox="0 0 200 100" className="w-full h-full max-w-md">
            {/* Runway Surface */}
            <rect
              x="40"
              y="30"
              width="120"
              height="40"
              fill="#1A1A1A"
              stroke="#F04E30"
              strokeWidth="0.5"
              rx="1"
            />

            {/* Centerline Markings */}
            {Array.from({ length: 12 }).map((_, i) => (
              <rect
                key={i}
                x={45 + i * 10}
                y="48"
                width="6"
                height="4"
                fill="white"
                opacity="0.8"
              />
            ))}

            {/* Threshold Markings (left) */}
            {Array.from({ length: 8 }).map((_, i) => (
              <rect
                key={`left-${i}`}
                x="42"
                y={33 + i * 4}
                width="3"
                height="3"
                fill="white"
              />
            ))}

            {/* Threshold Markings (right) */}
            {Array.from({ length: 8 }).map((_, i) => (
              <rect
                key={`right-${i}`}
                x="155"
                y={33 + i * 4}
                width="3"
                height="3"
                fill="white"
              />
            ))}

            {/* Runway Numbers */}
            <text x="55" y="52" className="fill-white text-[8px] font-mono font-bold">
              {runway.label.split("/")[0]}
            </text>
            <text x="140" y="52" className="fill-white text-[8px] font-mono font-bold">
              {runway.label.split("/")[1]}
            </text>

            {/* Taxiways */}
            <rect x="30" y="45" width="10" height="10" fill="#555" opacity="0.6" />
            <rect x="160" y="45" width="10" height="10" fill="#555" opacity="0.6" />
            <text x="32" y="52" className="fill-white text-[4px] font-mono">A</text>
            <text x="162" y="52" className="fill-white text-[4px] font-mono">B</text>

            {/* Wind Arrow */}
            <g transform={`translate(100, 15) rotate(${runway.wind.direction - runway.heading})`}>
              <line x1="0" y1="0" x2="0" y2="-10" stroke="#2563EB" strokeWidth="1.5" />
              <polygon points="0,-10 -2,-8 2,-8" fill="#2563EB" />
              <text
                x="0"
                y="3"
                textAnchor="middle"
                className="fill-[#2563EB] text-[4px] font-mono font-bold"
                transform="rotate(-90)"
              >
                {runway.wind.speed}KT
              </text>
            </g>

            {/* Compass Rose (small) */}
            <g transform="translate(180, 20)">
              <circle cx="0" cy="0" r="8" fill="none" stroke="#999" strokeWidth="0.3" />
              <line x1="0" y1="-8" x2="0" y2="-6" stroke="#999" strokeWidth="0.5" />
              <text x="0" y="-10" textAnchor="middle" className="fill-[#999] text-[3px] font-mono">
                N
              </text>
            </g>

            {/* Legend */}
            <g transform="translate(10, 85)">
              <rect x="0" y="0" width="4" height="2" fill="#1A1A1A" />
              <text x="6" y="2" className="fill-[#52525B] text-[3px] font-mono">
                {runway.surface}
              </text>
              
              <circle cx="2" cy="7" r="1" fill="#F04E30" />
              <text x="6" y="8" className="fill-[#52525B] text-[3px] font-mono">
                ACTIVE
              </text>
            </g>
          </svg>
        </motion.div>
      </div>

      {/* Runway Data */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-sm border border-[#333] bg-[#2A2A2A] p-3">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA] mb-2">
            DIMENSIONS
          </div>
          <div className="space-y-1 text-xs font-mono text-white">
            <div>
              <span className="text-[#999]">Length:</span> {runway.length.toLocaleString()}'
            </div>
            <div>
              <span className="text-[#999]">Width:</span> {runway.width}'
            </div>
            <div>
              <span className="text-[#999]">Surface:</span> {runway.surface}
            </div>
          </div>
        </div>

        <div className="rounded-sm border border-[#333] bg-[#2A2A2A] p-3">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA] mb-2">
            CONDITIONS
          </div>
          <div className="space-y-1 text-xs font-mono text-white">
            <div>
              <span className="text-[#999]">Surface:</span>{" "}
              <span
                className={cn(
                  runway.condition === "DRY" ? "text-emerald-400" : "text-amber-400",
                )}
              >
                {runway.condition}
              </span>
            </div>
            <div>
              <span className="text-[#999]">Lighting:</span> {runway.lighting}
            </div>
          </div>
        </div>

        <div className="rounded-sm border border-[#333] bg-[#2A2A2A] p-3 col-span-2">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA] mb-2">
            WIND COMPONENTS
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div>
              <span className="text-[#999]">Headwind:</span>{" "}
              <span className={cn(headwind > 0 ? "text-emerald-400" : "text-amber-400")}>
                {headwind.toFixed(0)} KT
              </span>
            </div>
            <div>
              <span className="text-[#999]">Crosswind:</span>{" "}
              <span className={cn(Math.abs(crosswind) < 10 ? "text-white" : "text-amber-400")}>
                {Math.abs(crosswind).toFixed(0)} KT
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Runway Selection */}
      <div className="flex items-center justify-between gap-4 border-t border-[#333] pt-4">
        <div className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA]">
          AVAILABLE RUNWAYS
        </div>
        <div className="flex gap-2">
          {(Object.keys(runways) as RunwayId[]).map((rwy) => (
            <button
              key={rwy}
              type="button"
              onClick={() => setSelectedRunway(rwy)}
              className={cn(
                "px-3 py-1 rounded-sm border border-[#333] text-[10px] font-mono uppercase tracking-widest transition-colors",
                selectedRunway === rwy
                  ? "border-[#F04E30] text-[#F04E30] bg-[#1A1A1A]"
                  : "text-[#A1A1AA] hover:border-[#444]",
              )}
            >
              {runways[rwy].label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
