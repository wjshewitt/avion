"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { Flight } from "@/lib/supabase/types";
import { TrendingUp, AlertTriangle } from "lucide-react";

interface RiskTimelineProps {
  flights: Flight[];
  className?: string;
  onFlightClick?: (flightId: string) => void;
}

interface TimelineEvent {
  time: Date;
  type: "departure" | "arrival" | "risk_spike";
  flightId?: string;
  flightCode?: string;
  riskScore?: number;
  label: string;
}

export function RiskTimeline({ flights, className, onFlightClick }: RiskTimelineProps) {
  const now = new Date();
  const timelineStart = now;
  const timelineEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // Generate timeline events from flights
  const events = useMemo<TimelineEvent[]>(() => {
    const eventList: TimelineEvent[] = [];

    flights.forEach((flight) => {
      if (flight.scheduled_at) {
        const depTime = new Date(flight.scheduled_at);
        if (depTime >= timelineStart && depTime <= timelineEnd) {
          eventList.push({
            time: depTime,
            type: "departure",
            flightId: flight.id,
            flightCode: flight.code,
            riskScore: flight.weather_risk_score || 0,
            label: `${flight.code} DEP`,
          });
        }
      }

      if (flight.arrival_at) {
        const arrTime = new Date(flight.arrival_at);
        if (arrTime >= timelineStart && arrTime <= timelineEnd) {
          eventList.push({
            time: arrTime,
            type: "arrival",
            flightId: flight.id,
            flightCode: flight.code,
            riskScore: flight.weather_risk_score || 0,
            label: `${flight.code} ARR`,
          });
        }
      }

      // Add risk spike events for high-risk flights
      if ((flight.weather_risk_score || 0) >= 60) {
        const eventTime = flight.scheduled_at
          ? new Date(flight.scheduled_at)
          : now;
        if (eventTime >= timelineStart && eventTime <= timelineEnd) {
          eventList.push({
            time: eventTime,
            type: "risk_spike",
            flightId: flight.id,
            flightCode: flight.code,
            riskScore: flight.weather_risk_score || 0,
            label: `${flight.code} HIGH RISK`,
          });
        }
      }
    });

    return eventList.sort((a, b) => a.time.getTime() - b.time.getTime());
  }, [flights, timelineStart, timelineEnd]);

  // Generate risk curve data points
  const riskCurve = useMemo(() => {
    const points: { x: number; y: number; score: number }[] = [];
    const intervals = 24; // 24 hourly points

    for (let i = 0; i <= intervals; i++) {
      const time = new Date(timelineStart.getTime() + (i / intervals) * 24 * 60 * 60 * 1000);
      
      // Calculate max risk score at this time point
      let maxRisk = 0;
      flights.forEach((flight) => {
        const depTime = flight.scheduled_at ? new Date(flight.scheduled_at).getTime() : 0;
        const arrTime = flight.arrival_at ? new Date(flight.arrival_at).getTime() : 0;
        const pointTime = time.getTime();

        // If flight is active at this time, include its risk
        if (depTime <= pointTime && (arrTime >= pointTime || !arrTime)) {
          maxRisk = Math.max(maxRisk, flight.weather_risk_score || 0);
        }
      });

      points.push({
        x: (i / intervals) * 100,
        y: 100 - maxRisk, // Invert for SVG coordinates
        score: maxRisk,
      });
    }

    return points;
  }, [flights, timelineStart]);

  // Create SVG path from risk curve
  const pathData = useMemo(() => {
    if (riskCurve.length === 0) return "";
    
    const commands = riskCurve.map((point, i) => {
      const command = i === 0 ? "M" : "L";
      return `${command} ${point.x} ${point.y}`;
    });
    
    return commands.join(" ");
  }, [riskCurve]);

  const hasHighRiskSpike = riskCurve.some((p) => p.score >= 60);

  return (
    <div className={cn("bg-card border border-border rounded-sm p-6", className)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-1">
            24-Hour Risk Forecast
          </div>
          <p className="text-xs text-muted-foreground">
            Predicted fleet risk evolution and flight events
          </p>
        </div>
        {hasHighRiskSpike && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-[#F04E30]/15 text-[#F04E30] border border-[#F04E30]/40"
          >
            <AlertTriangle size={14} strokeWidth={1.5} />
            <span className="text-[10px] font-mono uppercase tracking-wider">
              Risk Spike Alert
            </span>
          </motion.div>
        )}
      </div>

      {/* Timeline visualization */}
      <div className="relative h-40 mb-6">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full">
            {[0, 25, 50, 75, 100].map((y) => (
              <line
                key={`h-${y}`}
                x1="0"
                y1={`${y}%`}
                x2="100%"
                y2={`${y}%`}
                stroke="currentColor"
                strokeWidth="1"
                className="text-muted-foreground"
              />
            ))}
            {[0, 25, 50, 75, 100].map((x) => (
              <line
                key={`v-${x}`}
                x1={`${x}%`}
                y1="0"
                x2={`${x}%`}
                y2="100%"
                stroke="currentColor"
                strokeWidth="1"
                className="text-muted-foreground"
              />
            ))}
          </svg>
        </div>

        {/* Risk curve */}
        <svg className="absolute inset-0 w-full h-full overflow-visible">
          {/* Area fill under curve */}
          <motion.path
            d={`${pathData} L 100 100 L 0 100 Z`}
            fill="url(#riskGradient)"
            opacity="0.2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            transition={{ duration: 1 }}
          />

          {/* Line */}
          <motion.path
            d={pathData}
            fill="none"
            stroke="#2563EB"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />

          {/* Gradient definition */}
          <defs>
            <linearGradient id="riskGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F04E30" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#2563EB" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Event markers */}
          {events.map((event, idx) => {
            const x =
              ((event.time.getTime() - timelineStart.getTime()) /
                (timelineEnd.getTime() - timelineStart.getTime())) *
              100;
            const y =
              event.type === "risk_spike"
                ? 10
                : event.type === "departure"
                ? 30
                : 50;

            return (
              <g key={`${event.flightId}-${event.type}-${idx}`}>
                <motion.circle
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r="4"
                  fill={
                    event.type === "risk_spike"
                      ? "#F04E30"
                      : event.type === "departure"
                      ? "#F59E0B"
                      : "#2563EB"
                  }
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1 + idx * 0.1, type: "spring" }}
                  className="cursor-pointer hover:scale-125 transition-transform"
                  onClick={() => {
                    if (event.flightId && onFlightClick) {
                      onFlightClick(event.flightId);
                    }
                  }}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Time labels */}
      <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground mb-4">
        <span>NOW</span>
        <span>+6H</span>
        <span>+12H</span>
        <span>+18H</span>
        <span>+24H</span>
      </div>

      {/* Risk scale legend */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-4 text-[10px] font-mono">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">Low</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">Moderate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#F04E30]" />
            <span className="text-muted-foreground">High</span>
          </div>
        </div>
        
        {/* Trend indicator */}
        {riskCurve.length >= 2 && (
          <div className="flex items-center gap-2 text-xs">
            {riskCurve[riskCurve.length - 1].score > riskCurve[0].score ? (
              <>
                <TrendingUp size={14} className="text-amber-500" />
                <span className="text-muted-foreground">Trending Up</span>
              </>
            ) : (
              <>
                <TrendingUp size={14} className="text-emerald-500 rotate-180" />
                <span className="text-muted-foreground">Improving</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
