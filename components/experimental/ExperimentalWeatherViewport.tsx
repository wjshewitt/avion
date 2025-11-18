"use client";

import { useState } from "react";
import WeatherViewport from "../avion/WeatherViewport";
import { cn } from "../../lib/utils";

const weatherModes = [
  { id: "clear", label: "CLEAR" },
  { id: "rain", label: "RAIN" },
  { id: "heavy-rain", label: "HEAVY" },
  { id: "snow", label: "SNOW" },
  { id: "fog", label: "FOG" },
] as const;

export function ExperimentalWeatherViewport() {
  const [mode, setMode] = useState<(typeof weatherModes)[number]["id"]>("heavy-rain");

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="relative flex-1 overflow-hidden rounded-sm border border-[#333] bg-[#1A1A1A]">
        <WeatherViewport
          icao="KJFK"
          condition={mode}
          temperature="12°C"
          wind="090/18KT"
          visibility="3200"
        />
      </div>

      <div className="flex items-center justify-between gap-4 text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA]">
        <span>ATMOSPHERE ENGINE</span>
        <div className="flex items-center gap-2">
          {weatherModes.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={cn(
                "px-2 py-1 border border-[#333] rounded-sm transition-colors",
                mode === m.id
                  ? "border-[#F04E30] text-[#F04E30] bg-[#1A1A1A]"
                  : "text-[#A1A1AA] hover:border-[#444]",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
