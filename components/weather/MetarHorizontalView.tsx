"use client";

import type { DecodedMetar } from "@/types/checkwx";
import { Thermometer, Wind, Eye, Cloud, Gauge, Droplets } from "lucide-react";

interface MetarHorizontalViewProps {
  metar: DecodedMetar;
}

const categoryClasses: Record<NonNullable<DecodedMetar["flight_category"]>, string> = {
  VFR: "bg-green-100 text-green-700 border-green-500",
  MVFR: "bg-blue-100 text-blue-700 border-blue-500",
  IFR: "bg-amber-100 text-amber-700 border-amber-500",
  LIFR: "bg-red-100 text-red-700 border-red-500",
};

const formatObservationTime = (metar: DecodedMetar) => {
  if (!metar?.observed) return "—";
  const observedDate = new Date(metar.observed);
  if (Number.isNaN(observedDate.getTime())) return metar.observed;
  return observedDate.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
};

const formatCeiling = (metar: DecodedMetar) => {
  if (!metar.clouds || metar.clouds.length === 0) return "—";
  const ceilingLayer = metar.clouds.find((c) => c.code === "BKN" || c.code === "OVC");
  if (!ceilingLayer?.feet) return "—";
  return `${ceilingLayer.code} ${ceilingLayer.feet.toLocaleString()} ft`;
};

export default function MetarHorizontalView({ metar }: MetarHorizontalViewProps) {
  const category = metar.flight_category ?? "VFR";

  return (
    <div className="border border-border bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Current Conditions - {metar.icao}
          </h2>
          <span className={`border px-3 py-1 text-xs font-bold uppercase ${categoryClasses[category]}`}>
            {category}
          </span>
        </div>
        <span className="font-mono text-xs text-text-secondary">
          Obs: {formatObservationTime(metar)}
        </span>
      </div>

      {/* Data Grid */}
      <div className="grid grid-cols-6 border-b border-border">
        {/* Temperature */}
        <div className="border-r border-border px-4 py-4">
          <div className="mb-2 flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-text-secondary" />
            <span className="text-xs font-semibold uppercase text-text-secondary">Temp</span>
          </div>
          <div className="font-mono text-base font-semibold text-text-primary">
            {metar.temperature?.celsius !== undefined
              ? `${metar.temperature.celsius.toFixed(0)}°C`
              : "—"}
          </div>
          {metar.temperature?.fahrenheit !== undefined && (
            <div className="font-mono text-xs text-text-secondary">
              {metar.temperature.fahrenheit.toFixed(0)}°F
            </div>
          )}
        </div>

        {/* Dewpoint */}
        <div className="border-r border-border px-4 py-4">
          <div className="mb-2 flex items-center gap-2">
            <Droplets className="h-4 w-4 text-text-secondary" />
            <span className="text-xs font-semibold uppercase text-text-secondary">Dewpt</span>
          </div>
          <div className="font-mono text-base font-semibold text-text-primary">
            {metar.dewpoint?.celsius !== undefined
              ? `${metar.dewpoint.celsius.toFixed(0)}°C`
              : "—"}
          </div>
          {metar.dewpoint?.fahrenheit !== undefined && (
            <div className="font-mono text-xs text-text-secondary">
              {metar.dewpoint.fahrenheit.toFixed(0)}°F
            </div>
          )}
        </div>

        {/* Wind */}
        <div className="border-r border-border px-4 py-4">
          <div className="mb-2 flex items-center gap-2">
            <Wind className="h-4 w-4 text-text-secondary" />
            <span className="text-xs font-semibold uppercase text-text-secondary">Wind</span>
          </div>
          <div className="font-mono text-base font-semibold text-text-primary">
            {metar.wind?.degrees !== undefined
              ? `${metar.wind.degrees.toString().padStart(3, "0")}°`
              : "VRB"}
            {metar.wind?.speed_kts !== undefined ? ` @ ${metar.wind.speed_kts}kt` : " Calm"}
          </div>
          {metar.wind?.gust_kts && (
            <div className="font-mono text-xs font-semibold text-amber">
              G{metar.wind.gust_kts}kt
            </div>
          )}
        </div>

        {/* Visibility */}
        <div className="border-r border-border px-4 py-4">
          <div className="mb-2 flex items-center gap-2">
            <Eye className="h-4 w-4 text-text-secondary" />
            <span className="text-xs font-semibold uppercase text-text-secondary">Visibility</span>
          </div>
          <div className="font-mono text-base font-semibold text-text-primary">
            {metar.visibility?.miles_float !== undefined
              ? `${metar.visibility.miles_float.toFixed(metar.visibility.miles_float >= 10 ? 0 : 1)} SM`
              : "—"}
          </div>
          {metar.visibility?.meters_float !== undefined && (
            <div className="font-mono text-xs text-text-secondary">
              {(metar.visibility.meters_float / 1000).toFixed(1)} km
            </div>
          )}
        </div>

        {/* Ceiling */}
        <div className="border-r border-border px-4 py-4">
          <div className="mb-2 flex items-center gap-2">
            <Cloud className="h-4 w-4 text-text-secondary" />
            <span className="text-xs font-semibold uppercase text-text-secondary">Ceiling</span>
          </div>
          <div className="font-mono text-base font-semibold text-text-primary">
            {formatCeiling(metar)}
          </div>
        </div>

        {/* Pressure */}
        <div className="px-4 py-4">
          <div className="mb-2 flex items-center gap-2">
            <Gauge className="h-4 w-4 text-text-secondary" />
            <span className="text-xs font-semibold uppercase text-text-secondary">Pressure</span>
          </div>
          <div className="font-mono text-base font-semibold text-text-primary">
            {metar.barometer?.hg !== undefined ? `${metar.barometer.hg.toFixed(2)} inHg` : "—"}
          </div>
          {metar.barometer?.mb !== undefined && (
            <div className="font-mono text-xs text-text-secondary">
              {metar.barometer.mb.toFixed(0)} mb
            </div>
          )}
        </div>
      </div>

      {/* Raw METAR */}
      <div className="px-6 py-3">
        <div className="mb-1 text-xs font-semibold uppercase text-text-secondary">Raw METAR</div>
        <div className="font-mono text-xs text-text-primary">{metar.raw_text}</div>
      </div>
    </div>
  );
}
