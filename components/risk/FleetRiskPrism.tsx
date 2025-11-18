"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CornerBrackets } from "./CornerBrackets";
import type { Phase } from "@/lib/weather/risk/types";

interface FleetRiskPrismProps {
  score: number;
  confidence: number;
  phase?: Phase;
  flightCounts?: {
    total: number;
    preflight: number;
    planning: number;
    departure: number;
    enroute: number;
    arrival: number;
  };
  nextUpdate?: Date;
  className?: string;
}

function getRiskLevel(score: number) {
  if (score < 30) return { level: "LOW", color: "text-emerald-500", arcColor: "#10b981" };
  if (score < 60) return { level: "MODERATE", color: "text-blue-500", arcColor: "#2563EB" };
  return { level: "HIGH", color: "text-[#F04E30]", arcColor: "#F04E30" };
}

export function FleetRiskPrism({
  score,
  confidence,
  flightCounts,
  nextUpdate,
  className,
}: FleetRiskPrismProps) {
  const risk = getRiskLevel(score);
  const angle = (score / 100) * 180 - 90;
  const radius = 100;
  const strokeWidth = 16;

  // Arc path calculations
  const startAngle = -90;
  const endAngle = angle;
  const x1 = 150 + radius * Math.cos((startAngle * Math.PI) / 180);
  const y1 = 150 + radius * Math.sin((startAngle * Math.PI) / 180);
  const x2 = 150 + radius * Math.cos((endAngle * Math.PI) / 180);
  const y2 = 150 + radius * Math.sin((endAngle * Math.PI) / 180);

  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
  const pathData = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;

  const minutesToNext = nextUpdate
    ? Math.round((nextUpdate.getTime() - Date.now()) / 60000)
    : 15;

  return (
    <div className={cn("relative bg-card border border-border rounded-sm overflow-hidden", className)}>
      {/* Radar sweep background animation */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <motion.div
          className="w-full h-full"
          style={{
            background: "conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(37, 99, 235, 0.3) 60deg, transparent 120deg)",
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Scanline effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(37, 99, 235, 0.1) 50%, transparent 100%)",
        }}
        animate={{ x: ["-100%", "200%"] }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <CornerBrackets active={true}>
        <div className="flex flex-col items-center justify-center py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground mb-2">
              Fleet Risk Index
            </div>
            <div className="flex items-center justify-center gap-2">
              <motion.div
                className="w-2 h-2 rounded-full bg-blue-500"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-xs font-mono text-blue-500 uppercase tracking-wider">
                Live Monitoring
              </span>
            </div>
          </div>

          {/* Large Gauge */}
          <div className="relative">
            <svg viewBox="0 0 300 200" className="w-full max-w-[400px] h-auto">
              {/* Background arc segments (colored zones) */}
              <defs>
                <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.6" />
                </linearGradient>
                <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.6" />
                </linearGradient>
                <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#F04E30" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#F04E30" stopOpacity="0.6" />
                </linearGradient>
              </defs>

              {/* Low zone (0-30) - Emerald */}
              <path
                d="M 50 150 A 100 100 0 0 1 110 66"
                fill="none"
                stroke="url(#emeraldGrad)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                opacity="0.4"
              />

              {/* Moderate zone (30-60) - Blue */}
              <path
                d="M 110 66 A 100 100 0 0 1 190 66"
                fill="none"
                stroke="url(#blueGrad)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                opacity="0.4"
              />

              {/* High zone (60-100) - Orange */}
              <path
                d="M 190 66 A 100 100 0 0 1 250 150"
                fill="none"
                stroke="url(#orangeGrad)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                opacity="0.4"
              />

              {/* Active value arc */}
              <motion.path
                d={pathData}
                fill="none"
                stroke={risk.arcColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />

              {/* Center circle */}
              <circle cx="150" cy="150" r="8" fill="currentColor" className="text-muted-foreground" />

              {/* Needle */}
              <motion.g
                animate={{ rotate: score * 1.8 - 90 }}
                style={{ transformOrigin: "150px 150px" }}
                transition={{ 
                  type: "spring",
                  stiffness: 700,
                  damping: 30,
                  duration: 1.5
                }}
              >
                <line
                  x1="150"
                  y1="150"
                  x2="150"
                  y2="60"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-foreground"
                />
                <polygon
                  points="150,55 145,65 155,65"
                  fill="currentColor"
                  className="text-foreground"
                />
              </motion.g>

              {/* Confidence ring (outer) */}
              <motion.circle
                cx="150"
                cy="150"
                r="115"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={`${confidence * 722} 722`}
                className="text-muted-foreground opacity-30"
                initial={{ strokeDasharray: "0 722" }}
                animate={{ strokeDasharray: `${confidence * 722} 722` }}
                transition={{ duration: 2, ease: "easeOut" }}
              />
            </svg>

            {/* Center score display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ top: "40%" }}>
              <motion.div
                className="font-mono text-6xl font-bold text-foreground tabular-nums"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                {score}
              </motion.div>
              <div className="text-xs font-mono text-muted-foreground mt-1">/ 100</div>
            </div>
          </div>

          {/* Risk level badge */}
          <motion.div
            className={cn(
              "mt-6 px-4 py-2 rounded-sm text-sm font-mono uppercase tracking-widest border",
              risk.level === "HIGH" && "bg-[#F04E30]/15 text-[#F04E30] border-[#F04E30]/40",
              risk.level === "MODERATE" && "bg-blue-500/15 text-blue-500 border-blue-500/40",
              risk.level === "LOW" && "bg-emerald-500/15 text-emerald-500 border-emerald-500/40"
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            {risk.level}
          </motion.div>

          {/* Fleet composition */}
          {flightCounts && flightCounts.total > 0 && (
            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              <div className="text-xs text-muted-foreground mb-2">
                Tracking <span className="text-foreground font-semibold">{flightCounts.total}</span> flights
              </div>
              <div className="flex items-center justify-center gap-3 text-[10px] font-mono text-muted-foreground">
                {flightCounts.departure > 0 && (
                  <span className="text-amber-500">{flightCounts.departure} departing</span>
                )}
                {flightCounts.enroute > 0 && (
                  <span className="text-blue-500">{flightCounts.enroute} enroute</span>
                )}
                {flightCounts.arrival > 0 && (
                  <span className="text-emerald-500">{flightCounts.arrival} arriving</span>
                )}
              </div>
            </motion.div>
          )}

          {/* Confidence & next update */}
          <div className="mt-6 pt-6 border-t border-border w-full max-w-md">
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="text-muted-foreground font-mono uppercase tracking-wider">Confidence</span>
                <span className="ml-2 text-foreground font-mono tabular-nums">{Math.round(confidence * 100)}%</span>
              </div>
              <div>
                <span className="text-muted-foreground font-mono uppercase tracking-wider">Next Update</span>
                <span className="ml-2 text-foreground font-mono tabular-nums">{minutesToNext}m</span>
              </div>
            </div>
          </div>
        </div>
      </CornerBrackets>
    </div>
  );
}
