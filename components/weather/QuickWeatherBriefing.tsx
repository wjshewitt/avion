"use client";

import { useMemo, useState } from "react";
import { Cloud, AlertTriangle, TrendingUp, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import type { DecodedMetar, DecodedTaf } from "@/types/checkwx";
import type { HazardFeatureNormalized, PilotReport } from "@/types/weather";
import type { AirportTemporalProfile } from "@/lib/time/authority";
import type { AtmosphereVariant } from "@/components/weather/AvionAtmosphereCard";
import { generateWeatherSummary, type WeatherConcern } from "@/lib/weather/weatherConcerns";
import { formatCurrentConditions, formatForecastSummary } from "@/lib/weather/natural-language";
import { formatHazardBriefing } from "@/lib/weather/natural-language-hazards";
import { ForecastTimeline } from "./ForecastTimeline";

interface QuickWeatherBriefingProps {
  icao: string;
  metar?: DecodedMetar;
  taf?: DecodedTaf;
  hazards?: HazardFeatureNormalized[];
  pireps?: PilotReport[];
  concerns?: WeatherConcern[];
  atmosphere?: AtmosphereVariant;
  temporalProfile?: AirportTemporalProfile | null;
  lastUpdated?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const severityBorderColors = {
  none: "border-border",
  low: "border-green-500/40",
  moderate: "border-blue-500/40",
  high: "border-amber-500/40",
  extreme: "border-red-500/40",
};

const severityBackgrounds = {
  none: "",
  low: "bg-green-500/5",
  moderate: "bg-blue-500/5",
  high: "bg-amber-500/5",
  extreme: "bg-red-500/5",
};

export function QuickWeatherBriefing({
  icao,
  metar,
  taf,
  hazards = [],
  pireps = [],
  concerns = [],
  atmosphere = "sunny",
  temporalProfile,
  lastUpdated,
  onRefresh,
  isRefreshing = false,
}: QuickWeatherBriefingProps) {
  const [expandedSections, setExpandedSections] = useState({
    current: true,
    forecast: true,
    advisories: true,
    risks: true,
  });
  
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
    return formatHazardBriefing(hazards, pireps);
  }, [hazards, pireps]);
  
  const riskSummary = useMemo(() => {
    return generateWeatherSummary(concerns);
  }, [concerns]);
  
  // Determine overall severity for border
  const overallSeverity = useMemo(() => {
    const severities = [hazardBriefing.severity];
    
    if (riskSummary.hasExtremeConditions) {
      severities.push("extreme");
    } else if (riskSummary.hasHighRiskConditions) {
      severities.push("high");
    }
    
    const severityOrder = ["extreme", "high", "moderate", "low", "none"];
    return severityOrder.find(s => severities.includes(s as any)) as keyof typeof severityBorderColors || "none";
  }, [hazardBriefing.severity, riskSummary]);
  
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
  
  // Don't render if no data
  if (!metar && !taf) {
    return null;
  }
  
  const hasAdvisories = hazardBriefing.items.length > 0;
  const hasRisks = concerns.length > 0;
  const hasForecast = Boolean(taf);
  
  return (
    <section
      className={`rounded-lg border-2 bg-card shadow-sm ${severityBorderColors[overallSeverity]} ${severityBackgrounds[overallSeverity]}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <Cloud className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">Quick Weather Briefing</h2>
        </div>
        
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Updated {new Date(lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="rounded p-1 hover:bg-muted disabled:opacity-50"
              title="Refresh weather data"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          )}
        </div>
      </div>
      
      <div className="divide-y divide-border">
        {/* Current Conditions */}
        {currentWeather && (
          <div className="px-6 py-4">
            <button
              type="button"
              onClick={() => toggleSection("current")}
              className="flex w-full items-center justify-between text-left"
            >
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Current Conditions
              </h3>
              {expandedSections.current ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            
            {expandedSections.current && (
              <p className="mt-3 text-sm leading-relaxed text-foreground">
                {currentWeather}
              </p>
            )}
          </div>
        )}
        
        {/* Forecast */}
        {hasForecast && (
          <div className="px-6 py-4">
            <button
              type="button"
              onClick={() => toggleSection("forecast")}
              className="flex w-full items-center justify-between text-left"
            >
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Forecast (Next 18-24 Hours)
              </h3>
              {expandedSections.forecast ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            
            {expandedSections.forecast && (
              <div className="mt-3 space-y-4">
                {forecastSummary && (
                  <p className="text-sm leading-relaxed text-foreground">
                    {forecastSummary}
                  </p>
                )}
                
                {taf && <ForecastTimeline taf={taf} />}
              </div>
            )}
          </div>
        )}
        
        {/* Advisories */}
        {hasAdvisories && (
          <div className="px-6 py-4">
            <button
              type="button"
              onClick={() => toggleSection("advisories")}
              className="flex w-full items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Weather Advisories
                </h3>
                {hazardBriefing.severity !== "none" && hazardBriefing.severity !== "low" && (
                  <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
                    {hazardBriefing.items.length}
                  </span>
                )}
              </div>
              {expandedSections.advisories ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            
            {expandedSections.advisories && (
              <div className="mt-3 space-y-2">
                {hazardBriefing.summary && (
                  <div className="mb-3 rounded bg-muted/50 p-3 text-sm font-medium text-foreground">
                    {hazardBriefing.summary}
                  </div>
                )}
                
                <ul className="space-y-2">
                  {hazardBriefing.items.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {/* Risks */}
        {hasRisks && (
          <div className="px-6 py-4">
            <button
              type="button"
              onClick={() => toggleSection("risks")}
              className="flex w-full items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Weather Risks
                </h3>
                {(riskSummary.severityCounts.extreme > 0 || riskSummary.severityCounts.high > 0) && (
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                )}
              </div>
              {expandedSections.risks ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            
            {expandedSections.risks && (
              <div className="mt-3 space-y-3">
                {/* Risk counts */}
                {(riskSummary.severityCounts.extreme > 0 || riskSummary.severityCounts.high > 0 || riskSummary.severityCounts.moderate > 0) && (
                  <div className="flex flex-wrap gap-2">
                    {riskSummary.severityCounts.extreme > 0 && (
                      <span className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-500/10 dark:text-red-300">
                        {riskSummary.severityCounts.extreme} Extreme
                      </span>
                    )}
                    {riskSummary.severityCounts.high > 0 && (
                      <span className="rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                        {riskSummary.severityCounts.high} High
                      </span>
                    )}
                    {riskSummary.severityCounts.moderate > 0 && (
                      <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                        {riskSummary.severityCounts.moderate} Moderate
                      </span>
                    )}
                  </div>
                )}
                
                {/* Top concerns */}
                <ul className="space-y-2">
                  {concerns.slice(0, 5).map((concern, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <TrendingUp className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <div>
                        <span className="font-medium text-foreground">
                          {concern.severity === "extreme" && "⚠️ "}
                          {concern.description}
                        </span>
                        {concern.details && (
                          <span className="ml-1 text-muted-foreground">
                            ({concern.details.current_value} {concern.details.unit})
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {/* No data fallback */}
        {!currentWeather && !hasForecast && !hasAdvisories && !hasRisks && (
          <div className="px-6 py-8 text-center text-sm text-muted-foreground">
            No weather briefing data available for {icao}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="border-t border-border px-6 py-3 text-xs text-muted-foreground">
        This briefing is for planning purposes only. Monitor current conditions and forecasts throughout your flight operations.
      </div>
    </section>
  );
}
