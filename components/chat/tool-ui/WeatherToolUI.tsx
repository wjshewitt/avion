"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Cloud, Wind, Eye, Gauge, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { MetarCard } from "./MetarCard";
import { TafCard } from "./TafCard";
import { WeatherData, TafPeriod as TafPeriodDisplay, formatTafValidity } from "./weather-card-components";

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
  // Debug logging
  console.log('🌤️ WeatherToolUI received:', {
    result,
    hasData: !!result.data,
    dataType: typeof result.data,
    isArray: Array.isArray(result.data),
    keys: result.data ? Object.keys(result.data) : null
  });

  // Handle both single airport and multiple airports
  const weatherData = (Array.isArray(result.data) ? result.data : [result.data]).filter((d): d is WeatherData => !!d);

  console.log('🌤️ Processed weatherData:', weatherData);

  if (!weatherData.length) {
    console.error('❌ WeatherToolUI: No valid weather data', { result });
    return (
      <div className="text-sm text-muted-foreground border border-border rounded-lg p-3 max-w-2xl">
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

  console.log('🎯 SmartWeatherCard routing:', {
    icao: data.icao,
    hasMetar,
    hasTaf,
    cardType: hasMetar && !hasTaf ? 'METAR-only' : !hasMetar && hasTaf ? 'TAF-only' : 'Combined'
  });

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
    <div className="text-sm text-muted-foreground border border-border rounded-lg p-3">
      No weather data available for {data.icao?.toUpperCase()}
    </div>
  );
}

/**
 * Combined weather card showing both METAR and TAF
 * This is the original WeatherCard component, now used only when both data types are available
 */
function CombinedWeatherCard({ data, defaultExpanded = false }: { data: WeatherData; defaultExpanded?: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { icao, metar, taf } = data;

  const getFlightCategoryColor = (category?: string) => {
    switch (category) {
      case "VFR":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
      case "MVFR":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
      case "IFR":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
      case "LIFR":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card max-w-2xl">
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 cursor-pointer bg-muted hover:bg-muted/80 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <Cloud className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="font-semibold text-sm text-foreground">
              {icao?.toUpperCase()} Weather Briefing
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Current conditions & forecast
            </div>
            {metar?.flight_category && (
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-sm border font-medium",
                    getFlightCategoryColor(metar.flight_category)
                  )}
                >
                  {metar.flight_category}
                </span>
              </div>
            )}
          </div>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-border p-3 space-y-4 bg-muted/30">
          {/* METAR Section */}
          {metar && (
            <div>
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                <Cloud className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">
                  Current Conditions
                </h3>
              </div>
              
          {/* Current Conditions Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {metar.temperature?.celsius !== undefined && (
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">Temperature</div>
                  <div className="font-semibold">{metar.temperature.celsius}°C</div>
                </div>
              </div>
            )}

            {metar.wind && (
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">Wind</div>
                  <div className="font-semibold">
                    {metar.wind.speed_kts}kt @ {metar.wind.degrees}°
                    {metar.wind.gust_kts && (
                      <span className="text-yellow-600 dark:text-yellow-400 ml-1">
                        G{metar.wind.gust_kts}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {metar.visibility?.miles_float !== undefined && (
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">Visibility</div>
                  <div className="font-semibold">{metar.visibility.miles_float} SM</div>
                </div>
              </div>
            )}

            {metar.barometer?.hg !== undefined && (
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">Altimeter</div>
                  <div className="font-semibold">{metar.barometer.hg.toFixed(2)} inHg</div>
                </div>
              </div>
            )}
          </div>

          {/* Clouds */}
          {metar.clouds && metar.clouds.length > 0 && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Cloud Layers</div>
              <div className="space-y-1">
                {metar.clouds.slice(0, 3).map((cloud, idx) => (
                  <div key={idx} className="text-xs">
                    <span className="font-medium">{cloud.code}</span>
                    {cloud.feet && (
                      <span className="text-muted-foreground ml-2">
                        @ {cloud.feet.toLocaleString()} ft
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw METAR */}
          {metar.raw_text && (
            <details className="group">
              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                Show Raw METAR ▼
              </summary>
              <div className="mt-2 text-xs font-mono bg-muted p-2 rounded border border-border overflow-x-auto">
                {metar.raw_text}
              </div>
            </details>
          )}
            </div>
          )}

          {/* TAF Section */}
          {taf && (
            <div>
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">
                  Terminal Forecast
                </h3>
              </div>

              {/* Validity Period */}
              {taf.timestamp && (
                <div className="bg-muted border border-border rounded p-2 mb-3">
                  <div className="text-xs text-foreground font-medium text-center">
                    Valid: {formatTafValidity(taf.timestamp.from || '', taf.timestamp.to || '')}
                  </div>
                  {taf.timestamp.issued && (
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
              )}

              {/* Forecast Periods */}
              {taf.forecast && taf.forecast.length > 0 && (
                <div className="space-y-2 mb-3">
                  <div className="text-xs font-semibold text-muted-foreground">
                    Forecast Periods ({taf.forecast.length})
                  </div>
                  {taf.forecast.slice(0, 3).map((period, index) => (
                    <TafPeriodDisplay key={index} period={period} index={index} />
                  ))}
                  {taf.forecast.length > 3 && (
                    <div className="text-xs text-center text-muted-foreground py-2">
                      + {taf.forecast.length - 3} more periods (expand to see all)
                    </div>
                  )}
                </div>
              )}
              
              {/* Raw TAF */}
              {taf.raw_text && (
                <details className="group">
                  <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                    Show Raw TAF ▼
                  </summary>
                  <div className="mt-2 text-xs font-mono bg-muted p-2 rounded border border-border overflow-x-auto">
                    {taf.raw_text}
                  </div>
                </details>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
