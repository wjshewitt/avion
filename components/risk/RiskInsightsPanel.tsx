"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Flight } from "@/lib/supabase/types";
import type { Phase } from "@/lib/weather/risk/types";

interface RiskInsightsPanelProps {
  flights: Flight[];
  className?: string;
}

interface PhaseCount {
  preflight: number;
  planning: number;
  departure: number;
  enroute: number;
  arrival: number;
}

interface RiskBucket {
  low: number;
  moderate: number;
  high: number;
  critical: number;
}

function getRiskLevel(score: number | null): "low" | "moderate" | "high" | "critical" {
  if (score === null || score === undefined) return "low";
  if (score < 25) return "low";
  if (score < 50) return "moderate";
  if (score < 75) return "high";
  return "critical";
}

function getPhase(flight: Flight): Phase {
  const now = Date.now();
  const dep = flight.scheduled_at ? new Date(flight.scheduled_at).getTime() : undefined;
  const arr = flight.arrival_at ? new Date(flight.arrival_at).getTime() : undefined;

  if (!dep) return "preflight";

  const diffHrs = (dep - now) / 3600000;
  if (diffHrs > 24) return "preflight";
  if (diffHrs > 0) return "planning";
  if (diffHrs <= 0 && (!arr || now <= arr)) return "enroute";
  return "arrival";
}

export function RiskInsightsPanel({ flights, className }: RiskInsightsPanelProps) {
  // Calculate phase distribution
  const phaseCounts: PhaseCount = flights.reduce(
    (acc, flight) => {
      const phase = getPhase(flight);
      acc[phase]++;
      return acc;
    },
    { preflight: 0, planning: 0, departure: 0, enroute: 0, arrival: 0 } as PhaseCount
  );

  // Calculate risk distribution
  const riskBuckets: RiskBucket = flights.reduce(
    (acc, flight) => {
      const level = getRiskLevel(flight.weather_risk_score);
      acc[level]++;
      return acc;
    },
    { low: 0, moderate: 0, high: 0, critical: 0 } as RiskBucket
  );

  const maxRisk = Math.max(riskBuckets.low, riskBuckets.moderate, riskBuckets.high, riskBuckets.critical);

  // Identify top risk factors (mock for now - would need actual factor data)
  const topFactors = [
    { name: "Precipitation", count: Math.floor(flights.length * 0.6), icon: "🌧" },
    { name: "Surface Wind", count: Math.floor(flights.length * 0.4), icon: "💨" },
    { name: "Ceiling/Clouds", count: Math.floor(flights.length * 0.3), icon: "☁" },
  ].filter((f) => f.count > 0);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Risk Distribution Histogram */}
      <div className="bg-card border border-border rounded-sm p-6">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-4">
          Risk Distribution
        </div>
        <div className="space-y-3">
          {[
            { label: "Low (0-25)", count: riskBuckets.low, color: "bg-emerald-500" },
            { label: "Moderate (25-50)", count: riskBuckets.moderate, color: "bg-blue-500" },
            { label: "High (50-75)", count: riskBuckets.high, color: "bg-amber-500" },
            { label: "Critical (75-100)", count: riskBuckets.critical, color: "bg-[#F04E30]" },
          ].map((bucket, idx) => {
            const percentage = maxRisk > 0 ? (bucket.count / maxRisk) * 100 : 0;
            return (
              <div key={bucket.label}>
                <div className="flex items-center justify-between mb-1 text-xs">
                  <span className="text-muted-foreground">{bucket.label}</span>
                  <span className="font-mono tabular-nums text-foreground">{bucket.count}</span>
                </div>
                <div className="h-2 bg-muted rounded-sm overflow-hidden">
                  <motion.div
                    className={cn("h-full", bucket.color)}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.1, ease: "easeOut" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Phase Distribution */}
      <div className="bg-card border border-border rounded-sm p-6">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-4">
          Phase Distribution
        </div>
        <div className="space-y-2">
          {[
            { phase: "preflight" as const, label: "Preflight", count: phaseCounts.preflight, color: "text-zinc-400" },
            { phase: "planning" as const, label: "Planning", count: phaseCounts.planning, color: "text-zinc-400" },
            { phase: "departure" as const, label: "Departure", count: phaseCounts.departure, color: "text-amber-500" },
            { phase: "enroute" as const, label: "Enroute", count: phaseCounts.enroute, color: "text-blue-500" },
            { phase: "arrival" as const, label: "Arrival", count: phaseCounts.arrival, color: "text-emerald-500" },
          ]
            .filter((p) => p.count > 0)
            .map((item) => (
              <div
                key={item.phase}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <span className={cn("text-sm", item.color)}>{item.label}</span>
                <span className="font-mono text-sm tabular-nums text-foreground">{item.count}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Weather Factor Hotspots */}
      {topFactors.length > 0 && (
        <div className="bg-card border border-border rounded-sm p-6">
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Weather Factor Hotspots
          </div>
          <div className="space-y-3">
            {topFactors.map((factor, idx) => (
              <motion.div
                key={factor.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-3"
              >
                <span className="text-2xl">{factor.icon}</span>
                <div className="flex-1">
                  <div className="text-sm text-foreground">{factor.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Affecting {factor.count} flight{factor.count !== 1 ? "s" : ""}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="bg-card border border-border rounded-sm p-6">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-4">
          Fleet Summary
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-mono font-bold text-foreground tabular-nums">
              {flights.length}
            </div>
            <div className="text-xs text-muted-foreground">Total Flights</div>
          </div>
          <div>
            <div className="text-2xl font-mono font-bold text-[#F04E30] tabular-nums">
              {riskBuckets.high + riskBuckets.critical}
            </div>
            <div className="text-xs text-muted-foreground">High Risk</div>
          </div>
          <div>
            <div className="text-2xl font-mono font-bold text-amber-500 tabular-nums">
              {phaseCounts.departure}
            </div>
            <div className="text-xs text-muted-foreground">Departing</div>
          </div>
          <div>
            <div className="text-2xl font-mono font-bold text-blue-500 tabular-nums">
              {phaseCounts.enroute}
            </div>
            <div className="text-xs text-muted-foreground">Enroute</div>
          </div>
        </div>
      </div>
    </div>
  );
}
