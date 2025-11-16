"use client";

import { MapPin, Globe, Ruler, Radio, Plane } from "lucide-react";
import type { ProcessedAirportData, ProcessedRunwayData } from "@/types/airportdb";
import { getUserFriendlyErrorMessage } from "@/lib/utils/errors";
import { ThinkingIndicator } from "@/components/mission-control/shared/ThinkingIndicator";

interface AirportInstrumentGridProps {
  airportDetail?: ProcessedAirportData;
  isLoadingDetail: boolean;
  isDetailError: boolean;
  detailError: unknown;
  selectedIcao: string | null;
}

export function AirportInstrumentGrid({
  airportDetail,
  isLoadingDetail,
  isDetailError,
  detailError,
  selectedIcao,
}: AirportInstrumentGridProps) {
  if (isLoadingDetail && !airportDetail) {
    return (
      <div className="flex min-h-[260px] items-center justify-center rounded-sm border border-zinc-200 bg-white px-6 py-6 dark:border-[#333] dark:bg-[#1A1A1A]">
        <ThinkingIndicator material="tungsten" />
      </div>
    );
  }

  if (isDetailError) {
    return (
      <div className="rounded-sm border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-500/10 dark:text-red-200">
        {getUserFriendlyErrorMessage(detailError)}
      </div>
    );
  }

  const primaryRunway = airportDetail ? selectPrimaryRunway(airportDetail) : undefined;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <AirportIdentityCard airport={airportDetail} selectedIcao={selectedIcao} />
      <RunwayInstrumentCard airport={airportDetail} runway={primaryRunway} />
      <CommsCard airport={airportDetail} />
      <OperationsSnapshotCard airport={airportDetail} />
    </div>
  );
}

function selectPrimaryRunway(airport: ProcessedAirportData): ProcessedRunwayData | undefined {
  if (!airport.runways?.details || airport.runways.details.length === 0) {
    return undefined;
  }

  return [...airport.runways.details].sort((a, b) => b.length_ft - a.length_ft)[0];
}

interface AirportIdentityCardProps {
  airport?: ProcessedAirportData;
  selectedIcao: string | null;
}

function AirportIdentityCard({ airport, selectedIcao }: AirportIdentityCardProps) {
  if (!airport) {
    return (
      <section className="rounded-sm border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-[#111111] dark:text-zinc-400">
        <div className="mb-2 text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400">
          Airport Profile
        </div>
        <p className="text-xs">
          {selectedIcao
            ? `We couldn’t load detailed data for ${selectedIcao}. Try another airport, or refresh and try again.`
            : "Pick an airport on the left to see its profile, coordinates, and runway capability summarised here."}
        </p>
      </section>
    );
  }

  const { icao, iata, name, coordinates, location, classification } = airport;

  return (
    <section className="rounded-sm border border-zinc-200 bg-white p-6 dark:border-[#333] dark:bg-[#2A2A2A]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="mb-1 text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400">
            Airport Profile
          </div>
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
              {icao}
              {iata ? ` / ${iata}` : ""}
            </span>
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              {name}
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {location.municipality || "Unknown"}, {location.region || ""} {location.country}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="rounded-sm bg-blue-50 px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest text-blue-700 dark:bg-blue-500/10 dark:text-blue-200">
            {classification.size_category.toUpperCase()}
          </span>
          <span className="text-[10px] font-mono text-zinc-400">
            {classification.type.replace("_", " ")}
          </span>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div className="flex items-center gap-2">
          <MapPin className="h-3 w-3 text-zinc-400" />
          <div>
            <dt className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
              Coordinates
            </dt>
            <dd className="font-mono text-[13px] tabular-nums text-zinc-800 dark:text-zinc-100">
              {coordinates.latitude.toFixed(3)}, {coordinates.longitude.toFixed(3)}
            </dd>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Globe className="h-3 w-3 text-zinc-400" />
          <div>
            <dt className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
              Elevation
            </dt>
            <dd className="font-mono text-[13px] tabular-nums text-zinc-800 dark:text-zinc-100">
              {coordinates.elevation_ft ? `${coordinates.elevation_ft} FT` : "—"}
            </dd>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Ruler className="h-3 w-3 text-zinc-400" />
          <div>
            <dt className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
              Runways
            </dt>
            <dd className="font-mono text-[13px] tabular-nums text-zinc-800 dark:text-zinc-100">
              {airport.runways.count} total · longest {airport.runways.longest_ft} FT
            </dd>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Plane className="h-3 w-3 text-zinc-400" />
          <div>
            <dt className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
              Service
            </dt>
            <dd className="text-[13px] text-zinc-800 dark:text-zinc-100">
              {classification.scheduled_service ? "Scheduled" : "Non-scheduled"}
            </dd>
          </div>
        </div>
      </dl>
    </section>
  );
}

interface RunwayInstrumentCardProps {
  airport?: ProcessedAirportData;
  runway?: ProcessedRunwayData;
}

function RunwayInstrumentCard({ airport, runway }: RunwayInstrumentCardProps) {
  const heading = runway?.true_heading ?? runway?.magnetic_heading ?? 0;
  const designation = runway?.runway_designation ?? "—";

  return (
    <section className="rounded-sm border border-zinc-200 bg-white p-6 dark:border-[#333] dark:bg-[#2A2A2A]">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400">
          Runway Vector
        </div>
        <div className="text-[10px] font-mono text-zinc-500">
          {airport?.icao ?? "—"}
        </div>
      </div>

      <div className="relative mb-4 flex h-32 items-center justify-center">
        <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-zinc-300 dark:border-zinc-600">
          <div className="absolute inset-2 rounded-full border border-dashed border-zinc-300 dark:border-zinc-600" />

          <div
            className="absolute h-24 w-[3px] rounded-sm bg-zinc-900 dark:bg-zinc-100"
            style={{ transform: `rotate(${heading}deg)` }}
          />

          <div className="absolute -top-1 flex -translate-y-1/2 flex-col items-center text-[9px] font-mono text-zinc-500">
            <span>{runway?.le_ident}</span>
          </div>
          <div className="absolute -bottom-1 flex translate-y-1/2 flex-col items-center text-[9px] font-mono text-zinc-500">
            <span>{runway?.he_ident}</span>
          </div>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <dt className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
            Runway
          </dt>
          <dd className="font-mono text-[13px] tabular-nums text-zinc-800 dark:text-zinc-100">
            {designation}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
            Length / Width
          </dt>
          <dd className="font-mono text-[13px] tabular-nums text-zinc-800 dark:text-zinc-100">
            {runway ? `${runway.length_ft} × ${runway.width_ft} FT` : "Choose an airport to see runway length and width."}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
            Surface
          </dt>
          <dd className="text-[13px] text-zinc-800 dark:text-zinc-100">
            {runway?.surface ?? "Waiting for airport selection"}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
            Lighting / ILS
          </dt>
          <dd className="text-[13px] text-zinc-800 dark:text-zinc-100">
            {runway
              ? `${runway.lighted ? "Lighted" : "Unlighted"} · ${
                  runway.ils_approaches.length > 0 ? "ILS Available" : "No ILS"
                }`
              : "Lighting and ILS details will appear after you pick an airport."}
          </dd>
        </div>
      </dl>
    </section>
  );
}

interface CommsCardProps {
  airport?: ProcessedAirportData;
}

function CommsCard({ airport }: CommsCardProps) {
  const entries = airport
    ? Object.entries(airport.communications.frequencies_by_type || {})
    : [];

  return (
    <section className="rounded-sm border border-zinc-200 bg-white p-6 dark:border-[#333] dark:bg-[#2A2A2A]">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400">
          Communications
        </div>
        <Radio className="h-4 w-4 text-zinc-400" />
      </div>

      {entries.length === 0 ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Select an airport to view tower, ground, ATIS, and other operational frequencies here.
        </p>
      ) : (
        <div className="space-y-3 text-xs">
          {entries.map(([type, freqs]) => (
            <div key={type}>
              <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                {type}
              </div>
              <div className="mt-1 flex flex-wrap gap-2">
                {(freqs || []).map((freq) => (
                  <span
                    key={freq.id}
                    className="rounded-sm bg-zinc-100 px-2 py-0.5 text-[11px] font-mono text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                  >
                    {freq.description || freq.type}: {freq.frequency_mhz} MHz
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

interface OperationsSnapshotCardProps {
  airport?: ProcessedAirportData;
}

function OperationsSnapshotCard({ airport }: OperationsSnapshotCardProps) {
  const runwayCount = airport?.runways.count ?? 0;
  const surfaceTypes = airport?.runways.surface_types ?? [];
  const navaidsCount = airport?.navigation.navaids_count ?? 0;
  const dataQuality = airport?.data_quality.completeness_score ?? 0;

  const qualityLabel =
    dataQuality >= 90 ? "Nominal" : dataQuality >= 70 ? "Good" : "Limited";
  const qualityColor =
    dataQuality >= 90
      ? "bg-emerald-500"
      : dataQuality >= 70
        ? "bg-amber-500"
        : "bg-[#F04E30]";

  return (
    <section className="rounded-sm border border-zinc-200 bg-white p-6 dark:border-[#333] dark:bg-[#2A2A2A]">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400">
          Operations Snapshot
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
          <span className={`inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[10px] text-white ${qualityColor}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            {qualityLabel}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-xs">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
            Runways
          </div>
          <div className="font-mono text-[13px] tabular-nums text-zinc-900 dark:text-zinc-100">
            {runwayCount}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
            Surface Mix
          </div>
          <div className="text-[11px] text-zinc-700 dark:text-zinc-200">
            {surfaceTypes.length > 0 ? surfaceTypes.join(" · ") : "—"}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
            Navaids
          </div>
          <div className="font-mono text-[13px] tabular-nums text-zinc-900 dark:text-zinc-100">
            {navaidsCount}
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-between text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
        <span>
          Source: {airport ? airport.data_quality.source.toUpperCase() : "—"}
        </span>
        <span>Updated: {airport ? airport.data_quality.last_updated : "—"}</span>
      </div>
    </section>
  );
}