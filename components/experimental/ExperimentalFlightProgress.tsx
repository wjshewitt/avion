"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Waypoint {
  code: string;
  name: string;
  distance: number; // NM from origin
  eta: string; // Zulu time
  status: "completed" | "current" | "upcoming";
}

type RoutePreset = "short" | "long";

const routes = {
  short: {
    label: "SHORT HAUL",
    waypoints: [
      { code: "KJFK", name: "New York JFK", distance: 0, eta: "14:30Z", status: "completed" },
      { code: "MERIT", name: "Merit", distance: 85, eta: "15:12Z", status: "completed" },
      { code: "KBOS", name: "Boston Logan", distance: 185, eta: "15:55Z", status: "current" },
    ] as Waypoint[],
    totalDistance: 185,
    elapsedTime: "01:25",
    remainingTime: "00:15",
  },
  long: {
    label: "LONG HAUL",
    waypoints: [
      { code: "KLAX", name: "Los Angeles", distance: 0, eta: "22:15Z", status: "completed" },
      { code: "BASET", name: "Baset", distance: 420, eta: "23:42Z", status: "completed" },
      { code: "HIBER", name: "Hiber", distance: 920, eta: "01:08Z", status: "completed" },
      { code: "ETTAL", name: "Ettal", distance: 1450, eta: "02:45Z", status: "current" },
      { code: "DIXXE", name: "Dixxe", distance: 1880, eta: "03:52Z", status: "upcoming" },
      { code: "EGLL", name: "London Heathrow", distance: 2450, eta: "05:20Z", status: "upcoming" },
    ] as Waypoint[],
    totalDistance: 2450,
    elapsedTime: "04:30",
    remainingTime: "02:35",
  },
} as const;

export function ExperimentalFlightProgress() {
  const [route, setRoute] = useState<RoutePreset>("short");

  const data = routes[route];

  // Find current waypoint index
  const currentIndex = useMemo(
    () => data.waypoints.findIndex((wp) => wp.status === "current"),
    [data.waypoints],
  );

  // Calculate progress to next waypoint
  const progressToNext = currentIndex >= 0 ? 65 : 0; // Simulated 65% progress

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Overall Stats */}
      <div className="grid grid-cols-3 gap-3 rounded-sm border border-[#333] bg-[#2A2A2A] p-3">
        <div className="flex flex-col gap-1">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA]">
            TOTAL DIST
          </div>
          <div className="text-lg font-mono tabular-nums text-white">
            {data.totalDistance}<span className="text-xs text-[#999]"> NM</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA]">
            ELAPSED
          </div>
          <div className="text-lg font-mono tabular-nums text-white">{data.elapsedTime}</div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA]">
            REMAINING
          </div>
          <div className="text-lg font-mono tabular-nums text-white">{data.remainingTime}</div>
        </div>
      </div>

      {/* Waypoint Track */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto">
        {data.waypoints.map((waypoint, idx) => {
          const isCurrent = waypoint.status === "current";
          const isCompleted = waypoint.status === "completed";
          const isUpcoming = waypoint.status === "upcoming";

          return (
            <motion.div
              key={waypoint.code}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex gap-4"
            >
              {/* Node */}
              <div className="flex flex-col items-center">
                {/* Node Circle */}
                <motion.div
                  className={cn(
                    "relative flex items-center justify-center rounded-full border-2 z-10",
                    isCompleted && "w-6 h-6 border-emerald-500 bg-emerald-500",
                    isCurrent && "w-8 h-8 border-[#F04E30] bg-[#F04E30]",
                    isUpcoming && "w-6 h-6 border-[#666] bg-transparent",
                  )}
                  animate={
                    isCurrent
                      ? {
                          boxShadow: [
                            "0 0 0 0 rgba(240, 78, 48, 0.4)",
                            "0 0 0 8px rgba(240, 78, 48, 0)",
                          ],
                        }
                      : {}
                  }
                  transition={
                    isCurrent ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } : {}
                  }
                >
                  {isCompleted && (
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="white">
                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                    </svg>
                  )}
                  {isCurrent && (
                    <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                  )}
                </motion.div>

                {/* Connecting Line */}
                {idx < data.waypoints.length - 1 && (
                  <div
                    className={cn(
                      "w-0.5 h-16 mt-2",
                      isCompleted ? "bg-emerald-500" : "bg-[#333]",
                    )}
                  />
                )}
              </div>

              {/* Waypoint Info */}
              <div className="flex-1 pb-4">
                <div
                  className={cn(
                    "rounded-sm border p-3 transition-all",
                    isCurrent && "border-[#F04E30] bg-[#1A1A1A]",
                    isCompleted && "border-emerald-500/50 bg-[#1A1A1A]",
                    isUpcoming && "border-[#333] bg-[#2A2A2A]",
                  )}
                >
                  {/* Waypoint Code */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-bold text-white">
                        {waypoint.code}
                      </span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-widest bg-[#F04E30] text-white">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono tabular-nums text-[#999]">
                      {waypoint.eta}
                    </span>
                  </div>

                  {/* Waypoint Name */}
                  <div className="text-xs text-[#A1A1AA] mb-2">{waypoint.name}</div>

                  {/* Distance */}
                  <div className="text-xs font-mono text-[#999]">
                    {waypoint.distance} NM from origin
                  </div>

                  {/* Progress Bar (only for current waypoint) */}
                  {isCurrent && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1 text-[10px] font-mono text-[#A1A1AA]">
                        <span>PROGRESS TO NEXT</span>
                        <span>{progressToNext}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#333] overflow-hidden">
                        <motion.div
                          className="h-full bg-[#F04E30]"
                          initial={{ width: 0 }}
                          animate={{ width: `${progressToNext}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Route Selection */}
      <div className="flex items-center justify-between gap-4 border-t border-[#333] pt-4">
        <div className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA]">
          ROUTE TYPE
        </div>
        <div className="flex gap-2">
          {(Object.keys(routes) as RoutePreset[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoute(r)}
              className={cn(
                "px-2 py-1 rounded-sm border border-[#333] text-[10px] font-mono uppercase tracking-widest transition-colors",
                route === r
                  ? "border-[#F04E30] text-[#F04E30] bg-[#1A1A1A]"
                  : "text-[#A1A1AA] hover:border-[#444]",
              )}
            >
              {routes[r].label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
