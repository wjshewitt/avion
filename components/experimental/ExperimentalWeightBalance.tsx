"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { StatusLED } from "@/components/avion/StatusLED";

type LoadConfig = "light" | "standard" | "heavy" | "forward" | "aft";

const configurations = {
  light: { weight: 18500, cg: 24.5, passengers: 12, cargo: 500 },
  standard: { weight: 24000, cg: 25.8, passengers: 45, cargo: 2000 },
  heavy: { weight: 28500, cg: 26.2, passengers: 68, cargo: 3500 },
  forward: { weight: 22000, cg: 22.5, passengers: 40, cargo: 1800 },
  aft: { weight: 22000, cg: 28.5, passengers: 40, cargo: 1800 },
} as const;

// CG Envelope boundaries (simplified)
const envelopePoints = [
  { weight: 15000, cgMin: 20, cgMax: 29 },
  { weight: 20000, cgMin: 22, cgMax: 29 },
  { weight: 25000, cgMin: 23, cgMax: 28 },
  { weight: 30000, cgMin: 23, cgMax: 27 },
];

export function ExperimentalWeightBalance() {
  const [config, setConfig] = useState<LoadConfig>("standard");

  const data = configurations[config];

  // Determine if CG is within safe limits
  const status = useMemo(() => {
    // Find envelope bounds for current weight (interpolate)
    const lowerBound = envelopePoints.find((p) => p.weight >= data.weight) || envelopePoints[envelopePoints.length - 1];
    const upperBound = envelopePoints.findLast((p) => p.weight <= data.weight) || envelopePoints[0];
    
    const cgMin = lowerBound.cgMin;
    const cgMax = lowerBound.cgMax;

    if (data.cg < cgMin - 1 || data.cg > cgMax + 1) return "critical";
    if (data.cg < cgMin || data.cg > cgMax) return "caution";
    return "nominal";
  }, [data]);

  // Map weights and CG to chart coordinates (0-100 scale)
  const chartScale = {
    weightMin: 15000,
    weightMax: 30000,
    cgMin: 18,
    cgMax: 32,
  };

  const mapToChart = (weight: number, cg: number) => {
    const x = ((cg - chartScale.cgMin) / (chartScale.cgMax - chartScale.cgMin)) * 80 + 10;
    const y = 90 - ((weight - chartScale.weightMin) / (chartScale.weightMax - chartScale.weightMin)) * 70;
    return { x, y };
  };

  const cgPosition = mapToChart(data.weight, data.cg);

  return (
    <div className="flex h-full flex-col gap-4">
      {/* CG Envelope Chart */}
      <div className="flex-1 rounded-sm bg-[#1A1A1A] p-4 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.3),inset_-1px_-1px_3px_rgba(255,255,255,0.05)]">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Grid */}
          {[20, 22, 24, 26, 28, 30].map((cg) => {
            const x = ((cg - chartScale.cgMin) / (chartScale.cgMax - chartScale.cgMin)) * 80 + 10;
            return (
              <g key={cg}>
                <line x1={x} y1="10" x2={x} y2="90" stroke="#333" strokeWidth="0.2" />
                <text x={x} y="95" textAnchor="middle" className="fill-[#A1A1AA] text-[2.5px] font-mono">
                  {cg}
                </text>
              </g>
            );
          })}
          {[15000, 20000, 25000, 30000].map((weight) => {
            const y = 90 - ((weight - chartScale.weightMin) / (chartScale.weightMax - chartScale.weightMin)) * 70;
            return (
              <g key={weight}>
                <line x1="10" y1={y} x2="90" y2={y} stroke="#333" strokeWidth="0.2" />
                <text x="5" y={y + 1} textAnchor="end" className="fill-[#A1A1AA] text-[2.5px] font-mono">
                  {(weight / 1000).toFixed(0)}K
                </text>
              </g>
            );
          })}

          {/* Envelope Boundary */}
          <polygon
            points={envelopePoints
              .flatMap((p, idx) => {
                const min = mapToChart(p.weight, p.cgMin);
                const max = mapToChart(p.weight, p.cgMax);
                return idx === 0 ? [`${min.x},${min.y}`, `${max.x},${max.y}`] : [`${max.x},${max.y}`];
              })
              .concat(
                envelopePoints
                  .slice()
                  .reverse()
                  .map((p) => {
                    const min = mapToChart(p.weight, p.cgMin);
                    return `${min.x},${min.y}`;
                  }),
              )
              .join(" ")}
            fill="rgba(34, 197, 94, 0.1)"
            stroke="#22C55E"
            strokeWidth="0.3"
            strokeDasharray="1,1"
          />

          {/* MTOW Line */}
          <line
            x1="10"
            y1={mapToChart(30000, 20).y}
            x2="90"
            y2={mapToChart(30000, 20).y}
            stroke="#F04E30"
            strokeWidth="0.3"
            strokeDasharray="1.5,1.5"
          />
          <text
            x="92"
            y={mapToChart(30000, 20).y + 1}
            className="fill-[#F04E30] text-[2px] font-mono uppercase"
          >
            MTOW
          </text>

          {/* Current CG Position */}
          <motion.g
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <circle
              cx={cgPosition.x}
              cy={cgPosition.y}
              r="2"
              fill="#F04E30"
              stroke="white"
              strokeWidth="0.4"
              className="drop-shadow-[0_0_3px_rgba(240,78,48,0.8)]"
            />
            <motion.circle
              cx={cgPosition.x}
              cy={cgPosition.y}
              r="2"
              fill="none"
              stroke="#F04E30"
              strokeWidth="0.2"
              initial={{ r: 2, opacity: 1 }}
              animate={{ r: 4, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
            />
          </motion.g>

          {/* Axis Labels */}
          <text x="50" y="99" textAnchor="middle" className="fill-[#A1A1AA] text-[3px] font-mono uppercase">
            Center of Gravity (inches aft of datum)
          </text>
          <text
            x="2"
            y="50"
            textAnchor="middle"
            transform="rotate(-90, 2, 50)"
            className="fill-[#A1A1AA] text-[3px] font-mono uppercase"
          >
            Weight (LBS)
          </text>
        </svg>
      </div>

      {/* Load Info */}
      <div className="grid grid-cols-3 gap-3 rounded-sm border border-[#333] bg-[#2A2A2A] p-3">
        <div className="flex flex-col gap-1">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA]">WEIGHT</div>
          <div className="text-lg font-mono tabular-nums text-white">
            {data.weight.toLocaleString()}<span className="text-xs text-[#999]"> LBS</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA]">CG POSITION</div>
          <div className="text-lg font-mono tabular-nums text-white">
            {data.cg.toFixed(1)}<span className="text-xs text-[#999]"> IN</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA]">STATUS</div>
          <div className="flex items-center gap-2">
            <StatusLED
              variant={status === "nominal" ? "success" : status === "caution" ? "warning" : "danger"}
            />
            <span className="text-sm font-mono uppercase text-white">
              {status === "nominal" ? "SAFE" : status === "caution" ? "MARGINAL" : "LIMITS"}
            </span>
          </div>
        </div>
      </div>

      {/* Configuration Selection */}
      <div className="flex items-center justify-between gap-4 border-t border-[#333] pt-4">
        <div className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA]">
          LOAD CONFIG
        </div>
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(configurations) as LoadConfig[]).map((cfg) => (
            <button
              key={cfg}
              type="button"
              onClick={() => setConfig(cfg)}
              className={cn(
                "px-2 py-1 rounded-sm border border-[#333] text-[10px] font-mono uppercase tracking-widest transition-colors",
                config === cfg
                  ? "border-[#F04E30] text-[#F04E30] bg-[#1A1A1A]"
                  : "text-[#A1A1AA] hover:border-[#444]",
              )}
            >
              {cfg}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
