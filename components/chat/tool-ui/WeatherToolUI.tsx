"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Cloud, Wind, Eye, Gauge, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { MetarCard } from "./MetarCard";
import { TafCard } from "./TafCard";
import { 
  WeatherData, 
  TafPeriod as TafPeriodDisplay, 
  formatTafValidity,
  MetarDataGrid,
  CloudLayers,
  RawDataExpander,
  formatTimestamp
} from "./weather-card-components";

interface WeatherToolUIProps {
  result: {
    data?: WeatherData | WeatherData[];
    [key: string]: any;
  };
}

/**
 * Smart weather tool UI that routes to appropriate card type
 * - MetarCard: Shows only current observations (METAR)
 * - TafCard: Shows only forecasts (TAF)
 * - CombinedWeatherCard: Shows both METAR and TAF
 */
export function WeatherToolUI({ result }: WeatherToolUIProps) {
  // Handle both single airport and multiple airports
  const weatherData = (Array.isArray(result.data) ? result.data : [result.data]).filter((d): d is WeatherData => !!d);

  if (!weatherData.length) {
    console.error('❌ WeatherToolUI: No valid weather data', { result });
    return (
      <div className="text-sm text-muted-foreground border border-border p-3 max-w-2xl">
        No weather data available
        <details className="mt-2 text-xs">
          <summary className="cursor-pointer">Debug Info</summary>
          <pre className="mt-1 overflow-auto">{JSON.stringify(result, null, 2)}</pre>
        </details>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-w-2xl">
      {weatherData.map((data, index) => (
        <SmartWeatherCard key={index} data={data} defaultExpanded={weatherData.length === 1} />
      ))}
    </div>
  );
}

/**
 * Smart routing component that selects the appropriate card type
 * based on available data
 */
function SmartWeatherCard({ data, defaultExpanded = false }: { data: WeatherData; defaultExpanded?: boolean }) {
  const hasMetar = !!data.metar;
  const hasTaf = !!data.taf;

  // Only METAR data - show current conditions card
  if (hasMetar && !hasTaf) {
    return <MetarCard data={data} defaultExpanded={defaultExpanded} />;
  }

  // Only TAF data - show forecast card
  if (hasTaf && !hasMetar) {
    return <TafCard data={data} defaultExpanded={defaultExpanded} />;
  }

  // Both METAR and TAF - show combined card
  if (hasMetar && hasTaf) {
    return <CombinedWeatherCard data={data} defaultExpanded={defaultExpanded} />;
  }

  // No data
  return (
    <div className="text-sm text-muted-foreground border border-border p-3">
      No weather data available for {data.icao?.toUpperCase()}
    </div>
  );
}

/**
 * Combined weather card showing both METAR and TAF - Avion v1.5
 * Precision instrument style with tungsten groove aesthetic
 */
function CombinedWeatherCard({ data, defaultExpanded = false }: { data: WeatherData; defaultExpanded?: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { icao, metar, taf } = data;

  // Avion v1.5 LED-style flight category colors
  const getFlightCategoryColor = (category?: string) => {
    switch (category) {
      case "VFR":
        return "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20";
      case "MVFR":
        return "bg-blue-500/10 text-blue-600 border border-blue-500/20";
      case "IFR":
        return "bg-amber-500/10 text-amber-600 border border-amber-500/20";
      case "LIFR":
        return "bg-[#F04E30]/10 text-[#F04E30] border border-[#F04E30]/20";
      default:
        return "bg-muted/50 text-muted-foreground border border-border";
    }
  };

  return (
    <div className="border border-border rounded-sm overflow-hidden bg-card max-w-2xl">
      {/* Avion v1.5 Groove Header */}
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer bg-muted/30 hover:bg-muted/40 transition-colors border-b border-border"
        style={{ boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.06)' }}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-3">
            {/* ICAO - Large mono */}
            <span className="text-[14px] font-mono font-semibold tracking-wider">
              {icao?.toUpperCase()}
            </span>
            
            {/* Flight category LED badge */}
            {metar?.flight_category && (
              <span className={cn("text-[10px] font-mono uppercase px-2 py-0.5 rounded-sm", getFlightCategoryColor(metar.flight_category))}>
                {metar.flight_category}
              </span>
            )}
          </div>
          
          {/* Timestamp */}
          {metar?.observed && (
            <div className="text-[10px] font-mono text-muted-foreground mt-1">
              {formatTimestamp(metar.observed)}
            </div>
          )}
        </div>
        
        <ChevronDown 
          size={12} 
          strokeWidth={1.5} 
          className={cn("text-muted-foreground transition-transform", expanded && "rotate-180")} 
        />
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-3 py-3 space-y-4 bg-card/50">
          {/* METAR Section - Use Avion MetarDataGrid */}
          {metar && (
            <div className="space-y-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                CURRENT CONDITIONS
              </div>
              
              {/* Use the Avion v1.5 MetarDataGrid component */}
              <MetarDataGrid metar={metar} />

              {/* Use the Avion v1.5 CloudLayers component */}
              <CloudLayers clouds={metar.clouds} />

              {/* Raw METAR */}
              {metar.raw_text && (
                <RawDataExpander rawText={metar.raw_text} label="METAR" />
              )}
            </div>
          )}

          {/* TAF Section - Avion v1.5 */}
          {taf && (
            <div className="space-y-3">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                TERMINAL FORECAST
              </div>

              {/* Validity Period */}
              {taf.timestamp && (
                <div className="bg-muted/50 border border-border px-3 py-2 rounded-sm">
                  <div className="text-[11px] font-mono text-foreground text-center">
                    Valid: {formatTafValidity(taf.timestamp.from || '', taf.timestamp.to || '')}
                  </div>
                </div>
              )}

              {/* Forecast Periods */}
              {taf.forecast && taf.forecast.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    Forecast Periods ({taf.forecast.length})
                  </div>
                  {taf.forecast.slice(0, 3).map((period, index) => (
                    <TafPeriodDisplay key={index} period={period} index={index} />
                  ))}
                  {taf.forecast.length > 3 && (
                    <div className="text-[11px] font-mono text-center text-muted-foreground py-2">
                      + {taf.forecast.length - 3} more periods (expand to see all)
                    </div>
                  )}
                </div>
              )}
              
              {/* Raw TAF */}
              {taf.raw_text && (
                <RawDataExpander rawText={taf.raw_text} label="TAF" />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
