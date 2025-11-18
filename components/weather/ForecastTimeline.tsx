"use client";

import { useMemo } from "react";
import { Cloud, CloudRain, CloudSnow, CloudFog, Zap } from "lucide-react";
import type { DecodedTaf, TafForecastPeriod } from "@/types/checkwx";
import { format } from "date-fns";

interface TimelinePoint {
  time: string;
  timestamp: string;
  flightCategory: "VFR" | "MVFR" | "IFR" | "LIFR";
  icon?: "rain" | "snow" | "fog" | "thunderstorm" | "cloud";
  summary: string;
  isSignificant: boolean;
}

interface ForecastTimelineProps {
  taf: DecodedTaf;
}

const categoryColors = {
  VFR: "bg-green-500/20 border-green-500/40 text-green-700 dark:text-green-300",
  MVFR: "bg-blue-500/20 border-blue-500/40 text-blue-700 dark:text-blue-300",
  IFR: "bg-amber-500/20 border-amber-500/40 text-amber-700 dark:text-amber-300",
  LIFR: "bg-red-500/20 border-red-500/40 text-red-700 dark:text-red-300",
};

const categoryDotColors = {
  VFR: "bg-green-500",
  MVFR: "bg-blue-500",
  IFR: "bg-amber-500",
  LIFR: "bg-red-500",
};

function getWeatherIcon(period: TafForecastPeriod): "rain" | "snow" | "fog" | "thunderstorm" | "cloud" | undefined {
  // Check raw text for weather phenomena
  const rawText = period.raw_text?.toLowerCase() || "";
  
  if (rawText.includes("ts") || rawText.includes("tsra")) {
    return "thunderstorm";
  }
  if (rawText.includes("sn") || rawText.includes("snow")) {
    return "snow";
  }
  if (rawText.includes("ra") || rawText.includes("rain") || rawText.includes("shra")) {
    return "rain";
  }
  if (rawText.includes("fg") || rawText.includes("br") || rawText.includes("mist")) {
    return "fog";
  }
  
  // Check clouds
  if (period.clouds && period.clouds.length > 0) {
    const hasCeiling = period.clouds.some(c => c.code === "BKN" || c.code === "OVC");
    if (hasCeiling) {
      return "cloud";
    }
  }
  
  return undefined;
}

function getIconComponent(icon?: string) {
  switch (icon) {
    case "rain":
      return CloudRain;
    case "snow":
      return CloudSnow;
    case "fog":
      return CloudFog;
    case "thunderstorm":
      return Zap;
    case "cloud":
      return Cloud;
    default:
      return null;
  }
}

function generateSummary(period: TafForecastPeriod, prevPeriod?: TafForecastPeriod): string {
  const parts: string[] = [];
  
  // Wind changes
  if (period.wind?.speed_kts) {
    const windSpeed = period.wind.speed_kts;
    const prevWind = prevPeriod?.wind?.speed_kts;
    
    if (!prevWind || Math.abs(windSpeed - prevWind) >= 5) {
      parts.push(`Winds ${windSpeed}kt`);
    }
    
    if (period.wind.gust_kts && period.wind.gust_kts > windSpeed + 10) {
      parts.push(`gusting ${period.wind.gust_kts}kt`);
    }
  }
  
  // Visibility changes
  if (period.visibility?.miles_float !== undefined) {
    const vis = period.visibility.miles_float;
    const prevVis = prevPeriod?.visibility?.miles_float;
    
    if (!prevVis || Math.abs(vis - prevVis) >= 2) {
      if (vis < 3) {
        parts.push(`Low visibility ${vis}SM`);
      }
    }
  }
  
  // Ceiling changes
  const ceiling = period.clouds?.find(c => c.code === "BKN" || c.code === "OVC");
  const prevCeiling = prevPeriod?.clouds?.find(c => c.code === "BKN" || c.code === "OVC");
  
  if (ceiling?.feet) {
    if (!prevCeiling || !prevCeiling.feet || Math.abs(ceiling.feet - prevCeiling.feet) >= 1000) {
      if (ceiling.feet < 3000) {
        parts.push(`Ceiling ${(ceiling.feet / 1000).toFixed(1)}k ft`);
      }
    }
  }
  
  // Weather phenomena
  const icon = getWeatherIcon(period);
  if (icon === "thunderstorm") {
    parts.push("Thunderstorms");
  } else if (icon === "rain") {
    parts.push("Rain");
  } else if (icon === "snow") {
    parts.push("Snow");
  } else if (icon === "fog") {
    parts.push("Fog");
  }
  
  return parts.length > 0 ? parts.join(", ") : "Conditions stable";
}

function isSignificantChange(period: TafForecastPeriod, prevPeriod?: TafForecastPeriod): boolean {
  // Flight category change
  if (prevPeriod && period.flight_category !== prevPeriod.flight_category) {
    return true;
  }
  
  // Significant wind change (10+ knots)
  if (prevPeriod && period.wind?.speed_kts && prevPeriod.wind?.speed_kts) {
    if (Math.abs(period.wind.speed_kts - prevPeriod.wind.speed_kts) >= 10) {
      return true;
    }
  }
  
  // Gusts appear/disappear
  if (period.wind?.gust_kts && (!prevPeriod?.wind?.gust_kts || period.wind.gust_kts > 25)) {
    return true;
  }
  
  // Weather phenomena
  const icon = getWeatherIcon(period);
  if (icon === "thunderstorm" || icon === "snow") {
    return true;
  }
  
  // Visibility drops below 3SM
  if (period.visibility?.miles_float !== undefined && period.visibility.miles_float < 3) {
    return true;
  }
  
  // Low ceiling appears (below 1500ft)
  const ceiling = period.clouds?.find(c => c.code === "BKN" || c.code === "OVC");
  if (ceiling?.feet && ceiling.feet < 1500) {
    return true;
  }
  
  return false;
}

function extractTimelinePoints(taf: DecodedTaf): TimelinePoint[] {
  if (!taf.forecast || taf.forecast.length === 0) {
    return [];
  }
  
  const points: TimelinePoint[] = [];
  let lastCategory: string | undefined;
  
  taf.forecast.forEach((period, index) => {
    const prevPeriod = index > 0 ? taf.forecast![index - 1] : undefined;
    const timestamp = typeof period.timestamp === "string" 
      ? period.timestamp 
      : period.timestamp?.from || "";
    
    if (!timestamp) return;
    
    const category = period.flight_category || "VFR";
    const isSignificant = isSignificantChange(period, prevPeriod);
    const isCategoryChange = category !== lastCategory;
    
    // Include first point, category changes, or significant weather changes
    if (index === 0 || isCategoryChange || isSignificant) {
      const date = new Date(timestamp);
      const time = format(date, "HH:mm");
      const summary = generateSummary(period, prevPeriod);
      const icon = getWeatherIcon(period);
      
      points.push({
        time,
        timestamp,
        flightCategory: category as any,
        icon,
        summary,
        isSignificant: isSignificant || isCategoryChange,
      });
      
      lastCategory = category;
    }
  });
  
  // Limit to 6 most significant points
  if (points.length > 6) {
    // Keep first and last, then most significant in between
    const first = points[0];
    const last = points[points.length - 1];
    const middle = points
      .slice(1, -1)
      .sort((a, b) => (b.isSignificant ? 1 : 0) - (a.isSignificant ? 1 : 0))
      .slice(0, 4);
    
    return [first, ...middle, last].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }
  
  return points;
}

export function ForecastTimeline({ taf }: ForecastTimelineProps) {
  const timelinePoints = useMemo(() => extractTimelinePoints(taf), [taf]);
  
  if (timelinePoints.length === 0) {
    return null;
  }
  
  return (
    <div className="relative">
      <div className="flex items-start gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {timelinePoints.map((point, index) => {
          const IconComponent = getIconComponent(point.icon);
          const isLast = index === timelinePoints.length - 1;
          
          return (
            <div key={point.timestamp} className="flex items-start gap-2 min-w-0">
              {/* Point */}
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                {/* Dot */}
                <div className={`w-3 h-3 rounded-full ${categoryDotColors[point.flightCategory]} ring-2 ring-background`} />
                
                {/* Connecting line */}
                {!isLast && (
                  <div className="w-px h-8 bg-border" />
                )}
              </div>
              
              {/* Content */}
              <div className="flex flex-col gap-1 min-w-0 flex-shrink-0" style={{ width: "140px" }}>
                {/* Time */}
                <div className="text-xs font-medium text-foreground">
                  {point.time}
                </div>
                
                {/* Category badge */}
                <div className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold border ${categoryColors[point.flightCategory]} w-fit`}>
                  {IconComponent && <IconComponent className="h-3 w-3" />}
                  {point.flightCategory}
                </div>
                
                {/* Summary */}
                {point.summary && (
                  <div className="text-xs text-muted-foreground leading-tight">
                    {point.summary}
                  </div>
                )}
              </div>
              
              {/* Spacer between points */}
              {!isLast && (
                <div className="w-8 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
