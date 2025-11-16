"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Cloud } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  WeatherData,
  WeatherCardHeader,
  MetarDataGrid,
  CloudLayers,
  RawDataExpander,
  formatTimestamp,
} from "./weather-card-components";

interface MetarCardProps {
  data: WeatherData;
  defaultExpanded?: boolean;
}

/**
 * METAR-only card for current weather observations
 * Shown when user asks for "current conditions", "METAR", or "what's the weather now"
 */
export function MetarCard({ data, defaultExpanded = true }: MetarCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { icao, metar } = data;

  if (!metar) {
    return (
      <div className="text-sm text-muted-foreground border border-border p-3 max-w-2xl">
        No METAR data available
      </div>
    );
  }

  return (
    <div className="border border-border rounded-sm overflow-hidden bg-card max-w-2xl">
      {/* Avion v1.5 groove header */}
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer bg-muted/30 hover:bg-muted/40 transition-colors border-b border-border"
        style={{ boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.06)' }}
        onClick={() => setExpanded(!expanded)}
      >
        <WeatherCardHeader
          icao={icao}
          title="Current Conditions"
          icon={<Cloud className="h-5 w-5 text-muted-foreground" />}
          flightCategory={metar.flight_category}
          subtitle={formatTimestamp(metar.observed)}
          darkHeader={false}
        />
        <ChevronDown 
          size={12} 
          strokeWidth={1.5} 
          className={cn(
            "text-muted-foreground transition-transform",
            expanded && "rotate-180"
          )} 
        />
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-3 py-3 space-y-3 bg-card/50">
          {/* Current Observation Time - Prominent */}
          <div className="bg-muted border border-border p-2 text-center">
            <div className="text-xs text-foreground font-medium">
              Observed {formatTimestamp(metar.observed)}
            </div>
          </div>

          {/* Current Conditions Grid */}
          <MetarDataGrid metar={metar} />

          {/* Weather Conditions */}
          {metar.conditions && metar.conditions.length > 0 && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Conditions</div>
              <div className="flex flex-wrap gap-1">
                {metar.conditions.map((condition, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-0.5 bg-muted border border-border"
                  >
                    {condition.text || condition.code}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Clouds */}
          <CloudLayers clouds={metar.clouds} />

          {/* Raw METAR */}
          {metar.raw_text && (
            <RawDataExpander rawText={metar.raw_text} label="METAR" />
          )}
        </div>
      )}
    </div>
  );
}
