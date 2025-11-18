"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Flight } from "@/lib/supabase/types";
import { StatusLED } from "@/components/flights/StatusLED";
import { WeatherViewportMini } from "./WeatherViewportMini";
import { RiskFactorBar } from "./RiskFactorBar";
import type { Phase, WeatherRiskFactorResult } from "@/lib/weather/risk/types";

interface FlightRiskCardProps {
  flight: Flight;
  phase: Phase;
  riskScore: number;
  riskLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  factors?: WeatherRiskFactorResult[];
  trend?: "improving" | "stable" | "worsening";
  insight?: string;
  className?: string;
}

function getPhaseConfig(phase: Phase) {
  switch (phase) {
    case "departure":
      return { label: "Departure", color: "text-amber-500", bg: "bg-amber-500/15", border: "border-amber-500/40" };
    case "enroute":
      return { label: "Enroute", color: "text-blue-500", bg: "bg-blue-500/15", border: "border-blue-500/40" };
    case "arrival":
      return { label: "Arrival", color: "text-emerald-500", bg: "bg-emerald-500/15", border: "border-emerald-500/40" };
    case "planning":
      return { label: "Planning", color: "text-zinc-400", bg: "bg-zinc-500/15", border: "border-zinc-500/40" };
    default:
      return { label: "Preflight", color: "text-zinc-400", bg: "bg-zinc-500/15", border: "border-zinc-500/40" };
  }
}

function getRiskConfig(level: string) {
  switch (level) {
    case "CRITICAL":
    case "HIGH":
      return {
        action: "Action Required",
        actionClass: "bg-[#F04E30]/15 text-[#F04E30] border-[#F04E30]/40",
        recommendation: "Consider filing alternate or adjusting schedule",
      };
    case "MODERATE":
      return {
        action: "Monitor Closely",
        actionClass: "bg-blue-500/15 text-blue-500 border-blue-500/40",
        recommendation: "Monitor METAR updates and brief crew",
      };
    default:
      return {
        action: "Nominal Operations",
        actionClass: "bg-emerald-500/15 text-emerald-500 border-emerald-500/40",
        recommendation: "Conditions within normal parameters",
      };
  }
}

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

export function FlightRiskCard({
  flight,
  phase,
  riskScore,
  riskLevel,
  factors = [],
  trend = "stable",
  insight,
  className,
}: FlightRiskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const phaseConfig = getPhaseConfig(phase);
  const riskConfig = getRiskConfig(riskLevel);

  const isHighRisk = riskLevel === "HIGH" || riskLevel === "CRITICAL";

  // Get weather data for the appropriate airport based on phase
  const weatherData = (flight as any).weather_data;
  const relevantAirport =
    phase === "departure" || phase === "planning" || phase === "preflight"
      ? weatherData?.origin
      : weatherData?.destination;

  const metar = relevantAirport?.metar;
  const condition = metar?.weather?.[0]?.description || metar?.clouds?.[0]?.text || "Clear";
  const flightCategory = metar?.flight_category;
  const temp = metar?.temperature?.celsius;
  const windSpeed = metar?.wind?.speed_kts;

  return (
    <motion.div
      id={`flight-card-${flight.id}`}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative bg-card border-2 rounded-sm p-4 transition-all duration-300",
        isHighRisk
          ? "border-[#F04E30]/60 shadow-[0_0_20px_rgba(240,78,48,0.15)]"
          : "border-border hover:border-[--accent-primary]",
        isHighRisk && "animate-pulse-subtle",
        className
      )}
      style={
        isHighRisk
          ? {
              animation: "pulse-border 2s ease-in-out infinite",
            }
          : undefined
      }
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <div className="font-mono text-lg font-bold text-foreground">
              {flight.code}
            </div>
            <StatusLED status={flight.status} />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-mono">{flight.origin_icao || flight.origin}</span>
            <ArrowRight size={14} strokeWidth={1.5} className="text-muted-foreground" />
            <span className="font-mono">{flight.destination_icao || flight.destination}</span>
          </div>
        </div>
        <div
          className={cn(
            "px-2 py-1 rounded-sm text-[10px] font-mono uppercase tracking-wider border",
            phaseConfig.bg,
            phaseConfig.color,
            phaseConfig.border
          )}
        >
          {phaseConfig.label}
        </div>
      </div>

      {/* Mini risk gauge + weather viewport */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Mini gauge */}
        <div className="flex flex-col items-center justify-center bg-muted/50 rounded-sm p-3 border border-border">
          <motion.svg
            viewBox="0 0 100 60"
            className="w-full h-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Background arc */}
            <path
              d="M 10 55 A 40 40 0 0 1 90 55"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              className="text-muted"
            />
            {/* Value arc */}
            <motion.path
              d="M 10 55 A 40 40 0 0 1 90 55"
              fill="none"
              stroke={
                isHighRisk
                  ? "#F04E30"
                  : riskLevel === "MODERATE"
                  ? "#2563EB"
                  : "#10B981"
              }
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="126"
              initial={{ strokeDashoffset: 126 }}
              animate={{
                strokeDashoffset: 126 - (riskScore / 100) * 126,
              }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </motion.svg>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-mono text-xl font-bold text-foreground tabular-nums">
              {riskScore}
            </span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
          <div
            className={cn(
              "text-[10px] font-mono uppercase tracking-wider mt-1",
              isHighRisk ? "text-[#F04E30]" : riskLevel === "MODERATE" ? "text-blue-500" : "text-emerald-500"
            )}
          >
            {riskLevel}
          </div>
        </div>

        {/* Weather viewport */}
        <WeatherViewportMini
          condition={condition}
          flightCategory={flightCategory}
          temp={temp}
          windSpeed={windSpeed}
        />
      </div>

      {/* Insight message */}
      {insight && (
        <div className="flex items-start gap-2 mb-3 text-xs text-muted-foreground">
          {trend === "worsening" && <TrendingUp size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />}
          {trend === "improving" && <TrendingDown size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />}
          {trend === "stable" && <Minus size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />}
          <span>{insight}</span>
        </div>
      )}

      {/* Schedule & validity */}
      <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground mb-3">
        <div>
          <span className="uppercase tracking-wider">Scheduled:</span>
          <span className="ml-1 text-foreground">{formatDateTime(flight.scheduled_at)}</span>
        </div>
      </div>

      {/* Expand button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-center gap-2 py-2 text-[11px] font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors border-t border-border"
      >
        <span>{isExpanded ? "Hide Details" : "Expand Details"}</span>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown size={14} strokeWidth={1.5} />
        </motion.div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-4 border-t border-border mt-3">
              {/* Risk factor breakdown */}
              {factors.length > 0 && (
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-3">
                    Risk Factor Breakdown
                  </div>
                  <div className="space-y-3">
                    {factors.slice(0, 5).map((factor) => (
                      <RiskFactorBar
                        key={factor.name}
                        name={factor.name}
                        score={factor.score}
                        severity={factor.severity}
                        details={factor.details}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Action guidance */}
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
                  Action Guidance
                </div>
                <div
                  className={cn(
                    "px-3 py-2 rounded-sm text-xs border",
                    riskConfig.actionClass
                  )}
                >
                  <div className="font-mono uppercase tracking-wider mb-1">
                    {riskConfig.action}
                  </div>
                  <div className="text-foreground/80">
                    {riskConfig.recommendation}
                  </div>
                </div>
              </div>

              {/* Quick links */}
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/weather/${flight.origin_icao || flight.origin}`}
                  className="text-[10px] font-mono uppercase tracking-wider text-blue-500 hover:text-blue-400 transition-colors"
                >
                  → Origin Weather
                </Link>
                <Link
                  href={`/weather/${flight.destination_icao || flight.destination}`}
                  className="text-[10px] font-mono uppercase tracking-wider text-blue-500 hover:text-blue-400 transition-colors"
                >
                  → Destination Weather
                </Link>
                <Link
                  href={`/flights/${flight.id}`}
                  className="text-[10px] font-mono uppercase tracking-wider text-blue-500 hover:text-blue-400 transition-colors"
                >
                  → Flight Details
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes pulse-border {
          0%,
          100% {
            box-shadow: 0 0 20px rgba(240, 78, 48, 0.15);
          }
          50% {
            box-shadow: 0 0 30px rgba(240, 78, 48, 0.25);
          }
        }
      `}</style>
    </motion.div>
  );
}
