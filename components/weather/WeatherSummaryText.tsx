"use client";

import { useMemo } from "react";
import type { DecodedMetar, DecodedTaf } from "@/types/checkwx";
import type { HazardFeatureNormalized, PilotReport } from "@/types/weather";
import type { AirportTemporalProfile } from "@/lib/time/authority";
import type { AtmosphereVariant } from "@/components/weather/AvionAtmosphereCard";
import { formatCurrentConditions, formatForecastSummary } from "@/lib/weather/natural-language";
import { formatHazardBriefing } from "@/lib/weather/natural-language-hazards";
import { analyzeMetarConcerns, analyzeTafConcerns, generateWeatherSummary } from "@/lib/weather/weatherConcerns";

interface WeatherSummaryTextProps {
  metar?: DecodedMetar;
  taf?: DecodedTaf;
  hazards?: HazardFeatureNormalized[];
  pireps?: PilotReport[];
  atmosphere?: AtmosphereVariant;
  temporalProfile?: AirportTemporalProfile | null;
}

export function WeatherSummaryText({
  metar,
  taf,
  hazards = [],
  pireps = [],
  atmosphere = "sunny",
  temporalProfile,
}: WeatherSummaryTextProps) {
  // Extract airport coordinates from METAR
  const airportCoords = useMemo(() => {
    const coords = metar?.station?.geometry?.coordinates;
    if (!coords || coords.length !== 2) return undefined;
    const [lon, lat] = coords;
    if (typeof lon === "number" && typeof lat === "number") {
      return [lon, lat] as [number, number];
    }
    return undefined;
  }, [metar]);

  // Generate natural language content
  const currentWeather = useMemo(() => {
    if (!metar) return null;
    return formatCurrentConditions(metar, atmosphere, temporalProfile);
  }, [metar, atmosphere, temporalProfile]);

  const forecastSummary = useMemo(() => {
    if (!taf) return null;
    return formatForecastSummary(taf);
  }, [taf]);

  const hazardBriefing = useMemo(() => {
    return formatHazardBriefing(hazards, pireps, airportCoords);
  }, [hazards, pireps, airportCoords]);

  const concerns = useMemo(() => {
    const allConcerns = [
      ...(metar ? analyzeMetarConcerns(metar) : []),
      ...(taf ? analyzeTafConcerns(taf) : []),
    ];
    return allConcerns;
  }, [metar, taf]);

  const riskSummary = useMemo(() => {
    return generateWeatherSummary(concerns);
  }, [concerns]);

  // Don't render if no useful data
  if (!currentWeather && !forecastSummary && hazardBriefing.items.length === 0 && concerns.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 pt-6 border-t border-border/30">
      <div className="space-y-4 text-sm max-w-3xl">
        {/* Current Weather */}
        {currentWeather && (
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
              RIGHT NOW
            </div>
            <p className="text-foreground/90 leading-relaxed">
              {currentWeather}
            </p>
          </div>
        )}

        {/* Forecast */}
        {forecastSummary && (
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
              FORECAST
            </div>
            <p className="text-foreground/90 leading-relaxed">
              {forecastSummary}
            </p>
          </div>
        )}

        {/* Advisories */}
        {hazardBriefing.items.length > 0 && (
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
              ADVISORIES
            </div>
            <ul className="space-y-1">
              {hazardBriefing.items.slice(0, 3).map((item, i) => (
                <li key={i} className="text-foreground/80 flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>{item}</span>
                </li>
              ))}
              {hazardBriefing.items.length > 3 && (
                <li className="text-muted-foreground text-xs">
                  +{hazardBriefing.items.length - 3} more in detailed view below
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Risks */}
        {(riskSummary.severityCounts.extreme > 0 ||
          riskSummary.severityCounts.high > 0 ||
          riskSummary.severityCounts.moderate > 0) && (
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
              RISKS
            </div>
            <p className="text-foreground/70 text-xs">
              {[
                riskSummary.severityCounts.extreme > 0 && `${riskSummary.severityCounts.extreme} extreme`,
                riskSummary.severityCounts.high > 0 && `${riskSummary.severityCounts.high} high`,
                riskSummary.severityCounts.moderate > 0 && `${riskSummary.severityCounts.moderate} moderate`,
              ]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
