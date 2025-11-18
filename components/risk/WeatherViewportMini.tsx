"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface WeatherViewportMiniProps {
  condition?: string;
  flightCategory?: string | null;
  temp?: number | null;
  windSpeed?: number | null;
  className?: string;
}

const getFlightCategoryClass = (category?: string | null) => {
  switch (category) {
    case "VFR":
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    case "MVFR":
      return "bg-blue-500/20 text-blue-300 border-blue-500/40";
    case "IFR":
      return "bg-amber-500/20 text-amber-300 border-amber-500/40";
    case "LIFR":
      return "bg-red-500/20 text-red-300 border-red-500/40";
    default:
      return "bg-zinc-700/20 text-zinc-300 border-zinc-600/40";
  }
};

export function WeatherViewportMini({
  condition = "clear",
  flightCategory,
  temp,
  windSpeed,
  className,
}: WeatherViewportMiniProps) {
  // Generate rain particles
  const rainParticles = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        height: 20 + Math.random() * 20,
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: 0.6 + Math.random() * 0.4,
        delay: Math.random() * 2,
      })),
    []
  );

  // Generate snow particles
  const snowParticles = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        size: 2 + Math.random() * 3,
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: 2 + Math.random() * 2,
        delay: Math.random() * 3,
      })),
    []
  );

  const conditionLower = condition.toLowerCase();
  const isRainy = conditionLower.includes("rain") || conditionLower.includes("shower");
  const isSnowy = conditionLower.includes("snow");
  const isCloudy = conditionLower.includes("cloud") || conditionLower.includes("overcast");

  return (
    <div
      className={cn(
        "relative h-[120px] rounded-sm overflow-hidden bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-border",
        className
      )}
    >
      {/* Rain effect */}
      {isRainy && (
        <div className="absolute inset-0 opacity-30">
          {rainParticles.map((particle, i) => (
            <motion.div
              key={`rain-${i}`}
              className="absolute bg-blue-200 w-[1px]"
              style={{
                height: `${particle.height}px`,
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                transform: "rotate(15deg)",
              }}
              animate={{
                y: [0, 120],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
                ease: "linear",
              }}
            />
          ))}
        </div>
      )}

      {/* Snow effect */}
      {isSnowy && (
        <div className="absolute inset-0 opacity-40">
          {snowParticles.map((particle, i) => (
            <motion.div
              key={`snow-${i}`}
              className="absolute bg-white rounded-full"
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                left: `${particle.left}%`,
                top: `${particle.top}%`,
              }}
              animate={{
                y: [0, 120],
                x: [0, 10, -10, 0],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}

      {/* Cloud layers */}
      {isCloudy && !isRainy && !isSnowy && (
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-4 left-0 w-32 h-12 bg-zinc-400/20 rounded-full blur-xl"
            animate={{ x: [0, 20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-8 right-0 w-40 h-16 bg-zinc-400/15 rounded-full blur-xl"
            animate={{ x: [0, -15, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      )}

      {/* Overlay content */}
      <div className="relative z-10 h-full flex flex-col justify-between p-3">
        {/* Flight category badge */}
        {flightCategory && (
          <div className="self-start">
            <div
              className={cn(
                "px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border",
                getFlightCategoryClass(flightCategory)
              )}
            >
              {flightCategory}
            </div>
          </div>
        )}

        {/* Weather info */}
        <div className="flex items-end justify-between">
          <div className="text-sm font-light text-white/90">
            {condition || "Clear"}
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono text-white/70">
            {temp !== null && temp !== undefined && (
              <span>{temp}°C</span>
            )}
            {windSpeed !== null && windSpeed !== undefined && windSpeed > 0 && (
              <span>{windSpeed}kt</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
