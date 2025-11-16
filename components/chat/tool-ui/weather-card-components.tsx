"use client";

import { useState } from "react";
import { Wind, Eye, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shared components for weather cards (METAR, TAF, Combined)
 */

export interface WeatherData {
  icao?: string;
  metar?: {
    flight_category?: string;
    temperature?: { celsius?: number; fahrenheit?: number };
    dewpoint?: { celsius?: number };
    wind?: { speed_kts?: number; degrees?: number; gust_kts?: number };
    visibility?: { miles_float?: number; miles?: string };
    barometer?: { hg?: number; mb?: number };
    clouds?: Array<{ code?: string; feet?: number; text?: string }>;
    raw_text?: string;
    observed?: string;
    conditions?: Array<{ code?: string; text?: string }>;
  };
  taf?: {
    raw_text?: string;
    timestamp?: {
      from?: string;
      to?: string;
      issued?: string;
    };
    forecast?: Array<{
      timestamp?: string | { from: string; to: string };
      wind?: { speed_kts?: number; degrees?: number; gust_kts?: number };
      visibility?: { miles_float?: number; meters?: number };
      flight_category?: string;
      clouds?: Array<{ code?: string; feet?: number }>;
      conditions?: Array<{ code?: string; text?: string }>;
      change?: {
        indicator?: {
          code?: string;
          text?: string;
        };
      };
      probability?: number;
    }>;
  };
}

/**
 * Avion v1.5 flight category LED badges
 * - VFR: Emerald (nominal)
 * - MVFR: Info Blue
 * - IFR: Amber (caution)
 * - LIFR: Safety Orange (critical)
 */
export function getFlightCategoryColor(category?: string) {
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
}

export function formatTimestamp(isoString?: string): string {
  if (!isoString) return 'Unknown';
  
  const date = new Date(isoString);
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffMinutes < 60) {
    return `${diffMinutes} minutes ago`;
  } else if (diffMinutes < 1440) {
    const hours = Math.floor(diffMinutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Format date/time for TAF periods with relative dates
 * Returns "Today 18:00", "Tomorrow 14:00", or "Nov 13 09:00"
 */
export function formatTafDateTime(timestamp: string | Date): string {
  const date = new Date(timestamp);
  const now = new Date();
  
  // Strip time from dates for comparison
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowOnly = new Date(todayOnly);
  tomorrowOnly.setDate(tomorrowOnly.getDate() + 1);
  
  const time = date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
  
  if (dateOnly.getTime() === todayOnly.getTime()) {
    return `Today ${time}`;
  } else if (dateOnly.getTime() === tomorrowOnly.getTime()) {
    return `Tomorrow ${time}`;
  } else {
    const monthDay = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    return `${monthDay} ${time}`;
  }
}

/**
 * Format TAF validity period range
 */
export function formatTafValidity(from: string | Date, to: string | Date): string {
  return `${formatTafDateTime(from)} - ${formatTafDateTime(to)}`;
}

interface WeatherCardHeaderProps {
  icao?: string;
  title: string;
  icon: React.ReactNode;
  flightCategory?: string;
  subtitle?: string;
  darkHeader?: boolean;
}

/**
 * Avion v1.5 weather card header with instrument aesthetic
 * - ICAO in large mono
 * - LED-style flight category badge
 * - Timestamp in small mono
 */
export function WeatherCardHeader({
  icao,
  title,
  icon,
  flightCategory,
  subtitle,
  darkHeader = false,
}: WeatherCardHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          {/* ICAO code - Large mono */}
          <span className="text-[14px] font-mono font-semibold tracking-wider">
            {icao?.toUpperCase()}
          </span>
          
          {/* Flight category - LED style instrument badge */}
          {flightCategory && (
            <span
              className={cn(
                "text-[10px] font-mono uppercase px-2 py-0.5 rounded-sm",
                getFlightCategoryColor(flightCategory)
              )}
            >
              {flightCategory}
            </span>
          )}
        </div>
        
        {/* Timestamp - Small mono muted */}
        {subtitle && (
          <div className="text-[10px] font-mono text-muted-foreground mt-1">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

interface MetarDataGridProps {
  metar: NonNullable<WeatherData['metar']>;
}

/**
 * Avion v1.5 METAR data grid with precision instrument layout
 * - 10px mono uppercase labels
 * - 13px tabular mono data values
 * - No decorative icons
 */
export function MetarDataGrid({ metar }: MetarDataGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Temperature */}
      {metar.temperature?.celsius !== undefined && (
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-0.5">
            TEMP/DEW
          </div>
          <div className="text-[13px] font-mono tabular-nums text-foreground">
            {metar.temperature.celsius}°C / {metar.dewpoint?.celsius || '--'}°C
          </div>
        </div>
      )}

      {/* Wind */}
      {metar.wind && (
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-0.5">
            WIND
          </div>
          <div className="text-[13px] font-mono tabular-nums text-foreground">
            {metar.wind.degrees?.toString().padStart(3, '0')}° @ {metar.wind.speed_kts}kt
            {metar.wind.gust_kts && (
              <span className="text-amber-600 ml-1">
                G{metar.wind.gust_kts}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Visibility */}
      {metar.visibility?.miles_float !== undefined && (
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-0.5">
            VISIBILITY
          </div>
          <div className="text-[13px] font-mono tabular-nums text-foreground">
            {metar.visibility.miles_float >= 10 ? '10+' : metar.visibility.miles_float} SM
          </div>
        </div>
      )}

      {/* Altimeter */}
      {metar.barometer?.hg !== undefined && (
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-0.5">
            ALTIMETER
          </div>
          <div className="text-[13px] font-mono tabular-nums text-foreground">
            {metar.barometer.hg.toFixed(2)} inHg
          </div>
        </div>
      )}
    </div>
  );
}

interface CloudLayersProps {
  clouds: NonNullable<WeatherData['metar']>['clouds'];
}

/**
 * Avion v1.5 cloud layers display
 */
export function CloudLayers({ clouds }: CloudLayersProps) {
  if (!clouds || clouds.length === 0) return null;

  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
        CEILING
      </div>
      <div className="space-y-1">
        {clouds.slice(0, 3).map((cloud, idx) => (
          <div key={idx} className="text-[12px] font-mono text-foreground">
            <span>{cloud.code}</span>
            {cloud.feet && (
              <span className="text-muted-foreground ml-2">
                {cloud.feet.toLocaleString()}ft
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface RawDataExpanderProps {
  rawText: string;
  label: string;
}

export function RawDataExpander({ rawText, label }: RawDataExpanderProps) {
  return (
    <details className="group">
      <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
        Show Raw {label} ▼
      </summary>
      <div className="mt-2 text-xs font-mono bg-muted p-2 border border-border overflow-x-auto">
        {rawText}
      </div>
    </details>
  );
}

interface TafPeriodProps {
  period: NonNullable<NonNullable<WeatherData['taf']>['forecast']>[number];
  index: number;
}

export function TafPeriod({ period, index }: TafPeriodProps) {
  const [expanded, setExpanded] = useState(false);
  
  const getTimestampString = () => {
    if (!period.timestamp) return 'Unknown period';
    
    if (typeof period.timestamp === 'string') {
      return formatTafDateTime(period.timestamp);
    }
    
    return formatTafValidity(period.timestamp.from, period.timestamp.to);
  };

  const changeIndicator = period.change?.indicator;
  const probability = period.probability;

  return (
    <div className="border border-border p-2 bg-card">
      {/* Period Header - Clickable to expand */}
      <button
        className="w-full flex items-center justify-between cursor-pointer hover:bg-muted transition-colors p-1 -m-1"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">Period {index + 1}</span>
            {changeIndicator && (
              <span className="text-xs px-1.5 py-0.5 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 font-medium">
                {changeIndicator.code || changeIndicator.text}
              </span>
            )}
            {probability && (
              <span className="text-xs px-1.5 py-0.5 bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-500/20 font-medium">
                PROB{probability}
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {getTimestampString()}
          </div>
        </div>
        <span className="text-muted-foreground ml-2 text-sm">{expanded ? '▲' : '▼'}</span>
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-2 pt-2 border-t border-border">

      <div className="space-y-1 text-xs mt-2">
        {period.wind && (
          <div>
            <span className="text-muted-foreground">Wind:</span>{' '}
            <span className="font-medium">
              {period.wind.degrees}° @ {period.wind.speed_kts}kt
              {period.wind.gust_kts && (
                <span className="text-yellow-600 dark:text-yellow-400 ml-1">
                  G{period.wind.gust_kts}
                </span>
              )}
            </span>
          </div>
        )}

        {period.visibility && (
          <div>
            <span className="text-muted-foreground">Visibility:</span>{' '}
            <span className="font-medium">
              {period.visibility.miles_float 
                ? `${period.visibility.miles_float >= 10 ? '10+' : period.visibility.miles_float} SM`
                : `${Math.round((period.visibility.meters || 0) * 0.000621371 * 100) / 100} SM`
              }
            </span>
          </div>
        )}

        {period.flight_category && (
          <div>
            <span className="text-muted-foreground">Category:</span>{' '}
            <span className={cn(
              "font-medium px-1.5 py-0.5 text-xs",
              getFlightCategoryColor(period.flight_category)
            )}>
              {period.flight_category}
            </span>
          </div>
        )}

        {period.clouds && period.clouds.length > 0 && (
          <div>
            <span className="text-muted-foreground">Clouds:</span>{' '}
            <span className="font-medium">
              {period.clouds.map(c => `${c.code}${c.feet ? ` ${c.feet}ft` : ''}`).join(', ')}
            </span>
          </div>
        )}

        {period.conditions && period.conditions.length > 0 && (
          <div>
            <span className="text-muted-foreground">Conditions:</span>{' '}
            <span className="font-medium">
              {period.conditions.map(c => c.text || c.code).join(', ')}
            </span>
          </div>
        )}
      </div>
        </div>
      )}
    </div>
  );
}
