"use client";

import type { DecodedTaf, TafForecastPeriod } from "@/types/checkwx";
import { Calendar } from "lucide-react";

interface TafHorizontalViewProps {
  taf: DecodedTaf;
}

const categoryClasses: Record<string, string> = {
  VFR: "bg-green-100 text-green-700 border-green-500",
  MVFR: "bg-blue-100 text-blue-700 border-blue-500",
  IFR: "bg-amber-100 text-amber-700 border-amber-500",
  LIFR: "bg-red-100 text-red-700 border-red-500",
};

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatTimeRange = (timestamp: string | { from: string; to: string } | undefined) => {
  if (!timestamp) return "—";
  if (typeof timestamp === "string") {
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, { hour: "2-digit", minute: "2-digit" });
  }
  const from = new Date(timestamp.from);
  const to = new Date(timestamp.to);
  return `${from.toLocaleString(undefined, { hour: "2-digit", minute: "2-digit" })} - ${to.toLocaleString(undefined, { hour: "2-digit", minute: "2-digit" })}`;
};

const formatWind = (period: TafForecastPeriod) => {
  if (!period.wind) return "—";
  const direction = period.wind.degrees !== undefined ? `${period.wind.degrees.toString().padStart(3, "0")}°` : "VRB";
  const speed = period.wind.speed_kts !== undefined ? `${period.wind.speed_kts}kt` : "0kt";
  return `${direction} @ ${speed}`;
};

const formatGust = (period: TafForecastPeriod) => {
  if (!period.wind?.gust_kts) return "";
  return `G${period.wind.gust_kts}kt`;
};

const formatVisibility = (period: TafForecastPeriod) => {
  if (!period.visibility?.miles_float) return "—";
  return `${period.visibility.miles_float.toFixed(period.visibility.miles_float >= 10 ? 0 : 1)} SM`;
};

const formatCeiling = (period: TafForecastPeriod) => {
  if (!period.clouds || period.clouds.length === 0) return "—";
  const ceiling = period.clouds.find((c) => c.code === "BKN" || c.code === "OVC");
  if (!ceiling?.feet) return "—";
  return `${ceiling.code} ${ceiling.feet.toLocaleString()}`;
};

const getChangeIndicator = (period: TafForecastPeriod) => {
  if (!period.change?.indicator) return null;
  
  if (typeof period.change.indicator === "string") {
    return period.change.indicator;
  }
  
  if (typeof period.change.indicator === "object" && period.change.indicator.code) {
    return period.change.indicator.code;
  }
  
  return null;
};

export default function TafHorizontalView({ taf }: TafHorizontalViewProps) {
  const validFrom = taf.valid_time_from ? formatTime(taf.valid_time_from) : "—";
  const validTo = taf.valid_time_to ? formatTime(taf.valid_time_to) : "—";

  return (
    <div className="border border-border bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-text-secondary" />
          <h2 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Forecast - TAF {taf.icao}
          </h2>
        </div>
        <span className="font-mono text-xs text-text-secondary">
          Valid: {validFrom} - {validTo}
        </span>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 border-b border-border bg-surface">
        <div className="col-span-3 px-4 py-2">
          <span className="text-xs font-semibold uppercase text-text-secondary">Time Period</span>
        </div>
        <div className="col-span-1 border-l border-border px-4 py-2">
          <span className="text-xs font-semibold uppercase text-text-secondary">Cat</span>
        </div>
        <div className="col-span-2 border-l border-border px-4 py-2">
          <span className="text-xs font-semibold uppercase text-text-secondary">Wind</span>
        </div>
        <div className="col-span-2 border-l border-border px-4 py-2">
          <span className="text-xs font-semibold uppercase text-text-secondary">Visibility</span>
        </div>
        <div className="col-span-2 border-l border-border px-4 py-2">
          <span className="text-xs font-semibold uppercase text-text-secondary">Ceiling</span>
        </div>
        <div className="col-span-2 border-l border-border px-4 py-2">
          <span className="text-xs font-semibold uppercase text-text-secondary">Change</span>
        </div>
      </div>

      {/* Forecast Periods */}
      {taf.forecast && taf.forecast.length > 0 ? (
        <div>
          {taf.forecast.map((period, index) => {
            const category = period.flight_category ?? "VFR";
            const changeIndicator = getChangeIndicator(period);

            return (
              <div
                key={index}
                className={`grid grid-cols-12 border-b border-border last:border-b-0 ${
                  index % 2 === 0 ? "bg-white" : "bg-surface"
                }`}
              >
                {/* Time */}
                <div className="col-span-3 px-4 py-3">
                  <div className="font-mono text-sm text-text-primary">
                    {formatTimeRange(period.timestamp)}
                  </div>
                </div>

                {/* Category */}
                <div className="col-span-1 border-l border-border px-4 py-3">
                  <span
                    className={`inline-block border px-2 py-0.5 text-xs font-bold uppercase ${categoryClasses[category]}`}
                  >
                    {category}
                  </span>
                </div>

                {/* Wind */}
                <div className="col-span-2 border-l border-border px-4 py-3">
                  <div className="font-mono text-sm text-text-primary">{formatWind(period)}</div>
                  {formatGust(period) && (
                    <div className="font-mono text-xs font-semibold text-amber">
                      {formatGust(period)}
                    </div>
                  )}
                </div>

                {/* Visibility */}
                <div className="col-span-2 border-l border-border px-4 py-3">
                  <div className="font-mono text-sm text-text-primary">
                    {formatVisibility(period)}
                  </div>
                </div>

                {/* Ceiling */}
                <div className="col-span-2 border-l border-border px-4 py-3">
                  <div className="font-mono text-sm text-text-primary">{formatCeiling(period)}</div>
                </div>

                {/* Change Indicator */}
                <div className="col-span-2 border-l border-border px-4 py-3">
                  {changeIndicator && (
                    <span className="inline-block border border-blue bg-blue/10 px-2 py-0.5 font-mono text-xs font-semibold text-blue">
                      {changeIndicator}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="px-6 py-8 text-center text-sm text-text-secondary">
          No forecast periods available
        </div>
      )}

      {/* Raw TAF */}
      <div className="border-t border-border px-6 py-3">
        <div className="mb-1 text-xs font-semibold uppercase text-text-secondary">Raw TAF</div>
        <div className="font-mono text-xs text-text-primary">{taf.raw_text}</div>
      </div>
    </div>
  );
}
