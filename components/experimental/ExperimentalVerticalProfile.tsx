"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

type RoutePreset = "coastal" | "mountain";

const routes = {
  coastal: {
    label: "COASTAL",
    waypoints: [
      { code: "KJFK", distance: 0, altitude: 0 },
      { code: "WPT1", distance: 120, altitude: 15000 },
      { code: "WPT2", distance: 280, altitude: 35000 },
      { code: "WPT3", distance: 450, altitude: 35000 },
      { code: "WPT4", distance: 580, altitude: 12000 },
      { code: "KLAX", distance: 700, altitude: 0 },
    ],
    terrain: [0, 200, 500, 800, 600, 300, 0],
    hazards: [
      { start: 200, end: 350, type: "turbulence", altitude: 28000 },
    ],
  },
  mountain: {
    label: "MOUNTAIN",
    waypoints: [
      { code: "KDEN", distance: 0, altitude: 0 },
      { code: "WPT1", distance: 80, altitude: 18000 },
      { code: "WPT2", distance: 180, altitude: 37000 },
      { code: "WPT3", distance: 320, altitude: 37000 },
      { code: "KSLC", distance: 400, altitude: 0 },
    ],
    terrain: [5300, 8000, 12000, 9500, 7200, 4300],
    hazards: [
      { start: 100, end: 250, type: "icing", altitude: 15000 },
    ],
  },
} as const;

export function ExperimentalVerticalProfile() {
  const [route, setRoute] = useState<RoutePreset>("coastal");
  const [hoverPoint, setHoverPoint] = useState<{ distance: number; altitude: number } | null>(null);

  const data = routes[route];
  const maxDistance = data.waypoints[data.waypoints.length - 1].distance;
  const maxAltitude = 40000;

  // Generate flight path SVG points
  const flightPathPoints = useMemo(() => {
    return data.waypoints
      .map((wp) => {
        const x = (wp.distance / maxDistance) * 100;
        const y = 100 - (wp.altitude / maxAltitude) * 80; // 80% of height for altitude
        return `${x},${y}`;
      })
      .join(" ");
  }, [data.waypoints, maxDistance]);

  // Generate terrain profile
  const terrainPathPoints = useMemo(() => {
    const points = data.terrain
      .map((alt, idx) => {
        const x = (idx / (data.terrain.length - 1)) * 100;
        const y = 100 - (alt / maxAltitude) * 80;
        return `${x},${y}`;
      })
      .join(" ");
    return `0,100 ${points} 100,100`;
  }, [data.terrain]);

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Chart Area */}
      <div className="flex-1 rounded-sm bg-[#F4F4F4] p-4 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.1),inset_-1px_-1px_3px_rgba(255,255,255,0.3)]">
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          {/* Terrain Fill */}
          <polygon
            points={terrainPathPoints}
            fill="url(#terrainGradient)"
            stroke="none"
          />
          
          {/* Hazard Zones */}
          {data.hazards.map((hazard, idx) => {
            const x1 = (hazard.start / maxDistance) * 100;
            const x2 = (hazard.end / maxDistance) * 100;
            const y = 100 - (hazard.altitude / maxAltitude) * 80;
            return (
              <rect
                key={idx}
                x={x1}
                y={y - 5}
                width={x2 - x1}
                height="10"
                fill={hazard.type === "turbulence" ? "rgba(240, 78, 48, 0.2)" : "rgba(59, 130, 246, 0.2)"}
                stroke={hazard.type === "turbulence" ? "#F04E30" : "#3B82F6"}
                strokeWidth="0.2"
                strokeDasharray="1,1"
              />
            );
          })}

          {/* Flight Path */}
          <polyline
            points={flightPathPoints}
            fill="none"
            stroke="#F04E30"
            strokeWidth="0.5"
            strokeLinejoin="round"
          />

          {/* Waypoint Markers */}
          {data.waypoints.map((wp) => {
            const x = (wp.distance / maxDistance) * 100;
            const y = 100 - (wp.altitude / maxAltitude) * 80;
            return (
              <g key={wp.code}>
                <circle cx={x} cy={y} r="1" fill="#F04E30" stroke="white" strokeWidth="0.3" />
                <text
                  x={x}
                  y="97"
                  textAnchor="middle"
                  className="fill-[#52525B] text-[2px] font-mono uppercase"
                >
                  {wp.code}
                </text>
              </g>
            );
          })}

          {/* Grid Lines */}
          {[0, 10000, 20000, 30000, 40000].map((alt) => {
            const y = 100 - (alt / maxAltitude) * 80;
            return (
              <g key={alt}>
                <line
                  x1="0"
                  y1={y}
                  x2="100"
                  y2={y}
                  stroke="#D4D4D8"
                  strokeWidth="0.1"
                  strokeDasharray="0.5,0.5"
                />
                <text
                  x="1"
                  y={y - 0.5}
                  className="fill-[#71717A] text-[2px] font-mono"
                >
                  FL{(alt / 100).toString().padStart(3, "0")}
                </text>
              </g>
            );
          })}

          {/* Gradients */}
          <defs>
            <linearGradient id="terrainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#92400E" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#92400E" stopOpacity="0.8" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Hover Info (if implemented) */}
      {hoverPoint && (
        <div className="absolute rounded-sm bg-[#1A1A1A] px-2 py-1 text-xs font-mono text-white">
          {hoverPoint.distance} NM · {hoverPoint.altitude} FT
        </div>
      )}

      {/* Route Selection */}
      <div className="flex items-center justify-between gap-4 border-t border-[#333] pt-4">
        <div className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA]">
          ROUTE PROFILE
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
