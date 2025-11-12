"use client";

import { useMemo } from "react";
import { useAirfieldWeather } from "@/lib/tanstack/hooks/useAirfieldWeather";
import {
  analyzeMetarConcerns,
  analyzeTafConcerns,
  DEFAULT_WEATHER_THRESHOLDS,
} from "@/lib/weather/weatherConcerns";
import MetarHorizontalView from "./MetarHorizontalView";
import TafHorizontalView from "./TafHorizontalView";
import WeatherConcernsBanner from "./WeatherConcernsBanner";
import { Loader2, AlertTriangle } from "lucide-react";

interface AirportWeatherBriefingProps {
  icao: string;
}

export default function AirportWeatherBriefing({ icao }: AirportWeatherBriefingProps) {
  const {
    data: weatherData,
    isLoading,
    isError,
    error,
  } = useAirfieldWeather(icao, {
    enabled: Boolean(icao && icao.length === 4),
  });

  const metar = weatherData?.metar;
  const taf = weatherData?.taf;

  // Analyze weather concerns
  const concerns = useMemo(() => {
    const allConcerns = [];

    if (metar) {
      const metarConcerns = analyzeMetarConcerns(metar, DEFAULT_WEATHER_THRESHOLDS);
      allConcerns.push(...metarConcerns);
    }

    if (taf) {
      const tafConcerns = analyzeTafConcerns(taf, DEFAULT_WEATHER_THRESHOLDS);
      allConcerns.push(...tafConcerns);
    }

    // Sort by severity
    const severityOrder = { extreme: 0, high: 1, moderate: 2, low: 3 };
    return allConcerns.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  }, [metar, taf]);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-text-secondary">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-sm">Loading weather data...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="border border-red bg-red/5 p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 flex-shrink-0 text-red" />
          <div>
            <h3 className="text-sm font-semibold text-red">Unable to retrieve weather data</h3>
            <p className="mt-1 text-sm text-text-secondary">
              {error instanceof Error ? error.message : "An unknown error occurred"}
            </p>
            <p className="mt-2 text-xs text-text-secondary">
              Please verify the ICAO code and check your internet connection.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!metar && !taf) {
    return (
      <div className="border border-border bg-surface p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 flex-shrink-0 text-text-secondary" />
          <div>
            <h3 className="text-sm font-semibold text-text-primary">No weather data available</h3>
            <p className="mt-1 text-sm text-text-secondary">
              No METAR or TAF data is currently available for {icao.toUpperCase()}.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Weather Concerns Banner */}
      <WeatherConcernsBanner concerns={concerns} />

      {/* Current Conditions (METAR) */}
      {metar && (
        <div>
          <MetarHorizontalView metar={metar} />
        </div>
      )}

      {/* Terminal Area Forecast (TAF) */}
      {taf && (
        <div>
          <TafHorizontalView taf={taf} />
        </div>
      )}

      {/* Footer */}
      <div className="border border-border bg-surface px-6 py-3 text-xs text-text-secondary">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-semibold">Data Source:</span> CheckWX Aviation Weather API
          </div>
          <div>
            <span className="font-semibold">Generated:</span>{" "}
            {new Date().toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
        <p className="mt-2">
          Weather conditions can change rapidly. Monitor current conditions and forecasts throughout
          your flight planning and execution. This briefing is for planning purposes only and should
          not be used as the sole source of weather information.
        </p>
      </div>
    </div>
  );
}
