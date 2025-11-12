"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Calendar } from "lucide-react";
import {
  WeatherData,
  WeatherCardHeader,
  TafPeriod,
  RawDataExpander,
  formatTafValidity,
} from "./weather-card-components";

interface TafCardProps {
  data: WeatherData;
  defaultExpanded?: boolean;
}

/**
 * TAF-only card for terminal area forecasts
 * Shown when user asks for "forecast", "TAF", or "what's forecasted"
 */
export function TafCard({ data, defaultExpanded = true }: TafCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showAllPeriods, setShowAllPeriods] = useState(false);
  const { icao, taf } = data;

  if (!taf) {
    return (
      <div className="text-sm text-muted-foreground border border-border p-3 max-w-2xl">
        No TAF data available
      </div>
    );
  }

  const validityPeriod = taf.timestamp
    ? formatTafValidity(taf.timestamp.from || '', taf.timestamp.to || '')
    : 'Unknown validity';

  const forecastPeriods = taf.forecast || [];
  const displayedPeriods = showAllPeriods ? forecastPeriods : forecastPeriods.slice(0, 3);
  const hasMorePeriods = forecastPeriods.length > 3;

  return (
    <div className="border border-border overflow-hidden bg-card max-w-2xl">
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 cursor-pointer bg-muted hover:bg-muted/80 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <WeatherCardHeader
          icao={icao}
          title="Terminal Forecast"
          icon={<Calendar className="h-5 w-5 text-muted-foreground" />}
          subtitle={`Valid: ${validityPeriod}`}
          darkHeader={false}
        />
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-border p-3 space-y-3 bg-muted/30">
          {/* Validity Period - Prominent */}
          <div className="bg-muted border border-border p-2">
            <div className="text-xs text-foreground font-medium text-center">
              Valid: {validityPeriod}
            </div>
            {taf.timestamp?.issued && (
              <div className="text-xs text-muted-foreground text-center mt-1">
                Issued: {new Date(taf.timestamp.issued).toLocaleTimeString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                })}
              </div>
            )}
          </div>

          {/* Forecast Periods */}
          {forecastPeriods.length > 0 ? (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground">
                Forecast Periods ({forecastPeriods.length})
              </div>
              
              {displayedPeriods.map((period, index) => (
                <TafPeriod key={index} period={period} index={index} />
              ))}

              {/* Show More/Less Button */}
              {hasMorePeriods && (
                <button
                  onClick={() => setShowAllPeriods(!showAllPeriods)}
                  className="w-full text-xs text-blue-600 dark:text-blue-400 hover:underline py-2 border border-border hover:bg-muted/50 transition-colors"
                >
                  {showAllPeriods
                    ? '▲ Show Less'
                    : `▼ Show ${forecastPeriods.length - 3} More Periods`}
                </button>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center py-4">
              No forecast periods available
            </div>
          )}

          {/* Raw TAF */}
          {taf.raw_text && (
            <RawDataExpander rawText={taf.raw_text} label="TAF" />
          )}
        </div>
      )}
    </div>
  );
}
