"use client";

import type { WeatherConcern } from "@/lib/weather/weatherConcerns";
import { generateWeatherSummary, getSeverityColor } from "@/lib/weather/weatherConcerns";
import { AlertTriangle, Cloud, Eye, Wind, Zap, Snowflake, CloudLightning, Waves } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface WeatherConcernsBannerProps {
  concerns: WeatherConcern[];
}

const getConcernIcon = (type: string): LucideIcon => {
  switch (type) {
    case "low_visibility":
      return Eye;
    case "low_ceiling":
      return Cloud;
    case "high_winds":
      return Wind;
    case "gusts":
      return Zap;
    case "icing_conditions":
      return Snowflake;
    case "thunderstorms":
      return CloudLightning;
    case "turbulence":
      return Waves;
    default:
      return AlertTriangle;
  }
};

const getSeverityLabel = (severity: string): string => {
  return severity.toUpperCase();
};

const getSeverityBgColor = (severity: string): string => {
  switch (severity) {
    case "extreme":
      return "bg-red-500";
    case "high":
      return "bg-amber-500";
    case "moderate":
      return "bg-blue-500";
    case "low":
      return "bg-gray-500";
    default:
      return "bg-gray-500";
  }
};

const formatTimestamp = (timestamp?: string | { from: string; to: string }) => {
  if (!timestamp) return "";
  
  if (typeof timestamp === "string") {
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, { hour: "2-digit", minute: "2-digit" });
  }
  
  const from = new Date(timestamp.from);
  const to = new Date(timestamp.to);
  return `${from.toLocaleString(undefined, { hour: "2-digit", minute: "2-digit" })} - ${to.toLocaleString(undefined, { hour: "2-digit", minute: "2-digit" })}`;
};

export default function WeatherConcernsBanner({ concerns }: WeatherConcernsBannerProps) {
  if (concerns.length === 0) {
    return (
      <div className="border border-green bg-green/5 px-6 py-4">
        <div className="flex items-center gap-3">
          <Cloud className="h-5 w-5 text-green" />
          <div>
            <div className="text-sm font-semibold text-green">No Significant Weather Concerns</div>
            <div className="text-xs text-text-secondary">
              Current and forecast conditions are within acceptable operational limits
            </div>
          </div>
        </div>
      </div>
    );
  }

  const summary = generateWeatherSummary(concerns);
  
  // Determine border color based on severity
  const borderColor = summary.hasExtremeConditions
    ? "border-red"
    : summary.hasHighRiskConditions
    ? "border-amber"
    : "border-blue";
  
  const bgColor = summary.hasExtremeConditions
    ? "bg-red/5"
    : summary.hasHighRiskConditions
    ? "bg-amber/5"
    : "bg-blue/5";

  return (
    <div className={`border-2 ${borderColor} ${bgColor}`}>
      {/* Header */}
      <div className="border-b border-border px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className={`h-5 w-5 ${summary.hasExtremeConditions ? "text-red" : summary.hasHighRiskConditions ? "text-amber" : "text-blue"}`} />
            <h2 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Weather Concerns
            </h2>
            <div className="flex gap-2">
              {summary.severityCounts.extreme > 0 && (
                <span className="border border-red bg-red px-2 py-0.5 text-xs font-bold text-text-inverse">
                  {summary.severityCounts.extreme} EXTREME
                </span>
              )}
              {summary.severityCounts.high > 0 && (
                <span className="border border-amber bg-amber px-2 py-0.5 text-xs font-bold text-text-inverse">
                  {summary.severityCounts.high} HIGH
                </span>
              )}
              {summary.severityCounts.moderate > 0 && (
                <span className="border border-blue bg-blue px-2 py-0.5 text-xs font-bold text-text-inverse">
                  {summary.severityCounts.moderate} MODERATE
                </span>
              )}
            </div>
          </div>
        </div>
        <p className="mt-2 text-sm text-text-primary">{summary.summary}</p>
      </div>

      {/* Concerns List */}
      <div className="divide-y divide-border">
        {concerns.map((concern, index) => {
          const IconComponent = getConcernIcon(concern.type);
          
          return (
            <div key={index} className="px-6 py-3">
              <div className="flex items-start gap-3">
                {/* Severity Badge */}
                <div
                  className={`mt-0.5 flex-shrink-0 border px-2 py-1 text-xs font-bold text-white ${getSeverityBgColor(concern.severity)}`}
                >
                  {getSeverityLabel(concern.severity)}
                </div>

                {/* Icon */}
                <IconComponent className="mt-1 h-4 w-4 flex-shrink-0 text-text-secondary" />

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-text-primary">
                      {concern.description}
                    </span>
                    {concern.timestamp && (
                      <span className="font-mono text-xs text-text-secondary">
                        {formatTimestamp(concern.timestamp)}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-text-secondary">
                    <span className="font-semibold uppercase">{concern.source}</span>
                    {concern.details && (
                      <span className="font-mono">
                        Current: {concern.details.current_value} {concern.details.unit}
                        {concern.details.threshold && (
                          <> • Threshold: {concern.details.threshold} {concern.details.unit}</>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
