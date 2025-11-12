"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftRight,
  Cloud,
  Eye,
  Thermometer,
  Wind,
  Droplets,
  AlertTriangle,
  ExternalLink,
  MapPin,
  Navigation,
  Plane,
  Gauge,
  Loader2,
} from "lucide-react";
import { ScannerLoader } from "@/components/kokonutui/minimal-loaders";
import { useMetar, useCompleteWeather } from "@/lib/tanstack/hooks/useWeather";
import { useFlights } from "@/lib/tanstack/hooks/useFlights";
import { useWeatherRisk } from "@/lib/tanstack/hooks/useWeatherRisk";
import type { DecodedMetar, DecodedTaf, TafForecastPeriod, WindData, VisibilityData, CloudLayer } from "@/types/checkwx";
import { getUserFriendlyErrorMessage } from "@/lib/utils/errors";
import SmoothTab from "@/components/kokonutui/smooth-tab";
import StatusBadge from "@/components/kokonutui/status-badge";
import CopyButton from "@/components/kokonutui/copy-button";
import { useStore } from "@/store/index";

const categoryClasses: Record<NonNullable<DecodedMetar["flight_category"]>, string> = {
  VFR: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-200",
  MVFR: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200",
  IFR: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200",
  LIFR: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-200",
};

const normalizeIcao = (value: string) => value.trim().replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 4);

const formatObservationTime = (metar?: DecodedMetar) => {
  if (!metar?.observed) return "—";
  const observedDate = new Date(metar.observed);
  if (Number.isNaN(observedDate.getTime())) return metar.observed;
  return observedDate.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatWind = (metar?: DecodedMetar) => {
  if (!metar?.wind) return "Calm";
  const direction = metar.wind.degrees !== undefined ? `${metar.wind.degrees.toString().padStart(3, "0")}°` : "VRB";
  const speed = metar.wind.speed_kts !== undefined ? `${metar.wind.speed_kts} kt` : "0 kt";
  const gust = metar.wind.gust_kts ? ` gusting ${metar.wind.gust_kts} kt` : "";
  return `${direction} • ${speed}${gust}`;
};

const formatVisibility = (metar?: DecodedMetar) => {
  if (!metar?.visibility) return "—";
  if (metar.visibility.miles_float !== undefined) {
    return `${metar.visibility.miles_float.toFixed(1)} SM`;
  }
  if (typeof metar.visibility.miles === "number") {
    return `${metar.visibility.miles.toFixed(1)} SM`;
  }
  return metar.visibility.miles_text ?? "—";
};

const getFlightCategory = (metar?: DecodedMetar) => metar?.flight_category ?? "VFR";

const formatClouds = (metar?: DecodedMetar) => {
  if (!metar?.clouds || metar.clouds.length === 0) return "Clear";
  return metar.clouds
    .map((cloud) => {
      const coverage = cloud.code || "—";
      const altitude = cloud.base_feet_agl ? `${cloud.base_feet_agl} ft` : "—";
      return `${coverage} ${altitude}`;
    })
    .join(", ");
};

const formatPressure = (metar?: DecodedMetar) => {
  if (!metar?.barometer) return "—";
  const hg = metar.barometer.hg ? `${metar.barometer.hg.toFixed(2)} inHg` : "";
  const mb = metar.barometer.mb ? ` (${metar.barometer.mb.toFixed(0)} mb)` : "";
  return hg + mb || "—";
};

const getStatusBadgeType = (status: string): "LOW" | "MODERATE" | "HIGH" | "CRITICAL" | "SCHEDULED" | "EN_ROUTE" | "DELAYED" | "CANCELLED" => {
  if (status === "On Time") return "LOW";
  if (status === "Delayed") return "DELAYED";
  if (status === "Cancelled") return "CANCELLED";
  return "SCHEDULED";
};

const getRiskColor = (tier?: string) => {
  if (!tier) return "bg-gray";
  if (tier === "LOW") return "bg-green";
  if (tier === "MODERATE") return "bg-blue";
  if (tier === "HIGH") return "bg-amber";
  if (tier === "CRITICAL") return "bg-red";
  return "bg-gray";
};

// ----- Helper functions for wide layout -----
function minutesBetween(now: Date, then: Date) {
  return Math.max(0, Math.floor((now.getTime() - then.getTime()) / 60000));
}

function getDataAge(ts?: string | null): number | null {
  if (!ts) return null;
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return null;
  return minutesBetween(new Date(), d);
}

function getNextMetarUpdate(observed?: string | null): number | null {
  if (!observed) return null;
  const obs = new Date(observed);
  if (Number.isNaN(obs.getTime())) return null;
  // Next hour boundary after observation
  const nextHour = new Date(obs);
  nextHour.setMinutes(0, 0, 0);
  nextHour.setHours(nextHour.getHours() + 1);
  const mins = Math.max(0, Math.ceil((nextHour.getTime() - Date.now()) / 60000));
  return mins;
}

function toThreeDeg(dir?: number) {
  return dir !== undefined ? dir.toString().padStart(3, "0") : undefined;
}

function formatWindCompact(w?: WindData): string {
  if (!w) return "Calm";
  const dir = w.degrees !== undefined ? `${toThreeDeg(w.degrees)}°` : "VRB";
  const spd = w.speed_kts !== undefined ? `${w.speed_kts} kt` : "0 kt";
  const gst = w.gust_kts ? ` (G${w.gust_kts})` : "";
  return `${dir} @ ${spd}${gst}`;
}

function formatVisibilityCompact(v?: VisibilityData): string {
  if (!v) return "—";
  const miles = v.miles_float ?? (typeof v.miles === "number" ? v.miles : undefined);
  if (miles !== undefined) {
    const km = miles * 1.609344;
    return `${miles.toFixed(1)} SM (${km.toFixed(0)} km)`;
  }
  return v.miles_text || v.meters_text || "—";
}

function formatCloudsCompact(clouds?: CloudLayer[]): string {
  if (!clouds || clouds.length === 0) return "Clear";
  return clouds
    .map((c) => {
      const base = c.base_feet_agl ?? c.feet;
      return `${c.code}${base ? ` ${base} ft` : ""}`;
    })
    .join(", ");
}

function cToF(c?: number | null): number | null {
  if (c === undefined || c === null) return null;
  return c * 9/5 + 32;
}

function calculateWindChill(tempC?: number | null, windKts?: number | null): number | null {
  if (tempC === undefined || tempC === null || windKts === undefined || windKts === null) return null;
  const vKmh = windKts * 1.852; // kts -> km/h
  if (vKmh < 4.8 || tempC > 10) return null; // outside typical domain
  return 13.12 + 0.6215 * tempC - 11.37 * Math.pow(vKmh, 0.16) + 0.3965 * tempC * Math.pow(vKmh, 0.16);
}

function calculateDensityAltitude(altimeterHg?: number | null, tempC?: number | null, elevFt?: number | null): number | null {
  if (altimeterHg == null || tempC == null || elevFt == null) return null;
  // Pressure altitude approximation
  const pressureAlt = elevFt + (29.92 - altimeterHg) * 1000;
  const isaTemp = 15 - 2 * (elevFt / 1000); // approx lapse rate
  const densityAlt = pressureAlt + 120 * (tempC - isaTemp);
  return Math.round(densityAlt);
}

function angleDiff(a: number, b: number): number {
  let d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

function runwayIdentToHeading(ident: string): number | null {
  const m = ident.match(/^(\d{2})/);
  if (!m) return null;
  const tens = parseInt(m[1], 10);
  return (tens * 10) % 360;
}

function calculateCrosswind(windDir?: number, windKts?: number, runwayHeading?: number): number | null {
  if (windDir == null || windKts == null || runwayHeading == null) return null;
  const diff = angleDiff(windDir, runwayHeading) * (Math.PI / 180);
  return Math.round(Math.abs(Math.sin(diff)) * windKts);
}

function deriveWeatherPhenomena(raw?: string | null): Array<{ code: string; text: string }> {
  if (!raw) return [];
  const map: Record<string, string> = {
    TS: "Thunderstorm",
    RA: "Rain",
    DZ: "Drizzle",
    SN: "Snow",
    SG: "Snow grains",
    PL: "Ice pellets",
    GR: "Hail",
    GS: "Small hail",
    FG: "Fog",
    BR: "Mist",
    HZ: "Haze",
    DU: "Dust",
    SA: "Sand",
  };
  const codes = Object.keys(map).filter((c) => new RegExp(`(^|\s)${c}`).test(raw));
  return codes.map((code) => ({ code, text: map[code] }));
}

// Route Weather Tab Component
function RouteWeatherTab() {
  const router = useRouter();
  const [departureInput, setDepartureInput] = useState("KJFK");
  const [arrivalInput, setArrivalInput] = useState("KLAX");

  const departureCode = normalizeIcao(departureInput);
  const arrivalCode = normalizeIcao(arrivalInput);

  const requestedIcaos = useMemo(() => {
    const codes = [departureCode, arrivalCode].filter((code) => code.length === 4);
    return Array.from(new Set(codes));
  }, [arrivalCode, departureCode]);

  const {
    data: metars,
    isLoading,
    isError,
    error,
    refetch,
  } = useMetar({
    icaos: requestedIcaos,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const departureMetar = useMemo(
    () => metars?.find((metar) => metar.icao?.toUpperCase() === departureCode) ?? null,
    [departureCode, metars]
  );
  const arrivalMetar = useMemo(
    () => metars?.find((metar) => metar.icao?.toUpperCase() === arrivalCode) ?? null,
    [arrivalCode, metars]
  );

  const handleSwap = () => {
    setDepartureInput(arrivalCode);
    setArrivalInput(departureCode);
  };

  const renderMetarCard = (label: string, code: string, metar: DecodedMetar | null) => {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Cloud className="h-4 w-4 text-text-secondary" />
            <h3 className="text-xs font-semibold uppercase text-text-secondary">
              {label}
            </h3>
            <span className="font-mono text-base font-semibold text-text-primary">{code || "—"}</span>
          </div>
          <div className="flex items-center gap-2">
            {metar && (() => {
              const category = getFlightCategory(metar) as NonNullable<DecodedMetar["flight_category"]>;
              const statusMap = { VFR: "LOW", MVFR: "MODERATE", IFR: "HIGH", LIFR: "CRITICAL" } as const;
              return <StatusBadge status={statusMap[category]}>{category}</StatusBadge>;
            })()}
            {code && code.length === 4 && (
              <button
                type="button"
                onClick={() => router.push(`/weather/${code}`)}
                className="inline-flex items-center gap-1 border border-border px-2 py-1 text-xs hover:bg-surface"
                title={`View detailed weather for ${code}`}
              >
                <ExternalLink className="h-3 w-3" />
                Details
              </button>
            )}
          </div>
        </div>

        {!code || code.length !== 4 ? (
          <div className="border border-dashed border-border p-6 text-center text-sm text-text-secondary">
            Enter a valid 4-letter ICAO code
          </div>
        ) : !metar ? (
          <div className="border border-dashed border-border p-6 text-center text-sm text-text-secondary">
            No METAR available for {code}
          </div>
        ) : (
          <div className="space-y-4 border border-border p-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs uppercase font-semibold text-text-secondary">Observed</span>
              <span className="font-mono text-sm text-text-primary">{formatObservationTime(metar)}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Thermometer className="h-4 w-4 text-text-secondary" />
                  <span className="text-xs uppercase font-semibold text-text-secondary">Temperature</span>
                </div>
                <div className="font-mono text-base font-semibold text-text-primary">
                  {metar.temperature ? `${metar.temperature.celsius.toFixed(0)}°C` : "—"}
                  {metar.dewpoint ? ` / ${metar.dewpoint.celsius.toFixed(0)}°C` : ""}
                </div>
              </div>

              <div className="border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wind className="h-4 w-4 text-text-secondary" />
                  <span className="text-xs uppercase font-semibold text-text-secondary">Wind</span>
                </div>
                <div className="font-mono text-sm font-semibold text-text-primary">{formatWind(metar)}</div>
              </div>

              <div className="border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="h-4 w-4 text-text-secondary" />
                  <span className="text-xs uppercase font-semibold text-text-secondary">Visibility</span>
                </div>
                <div className="font-mono text-base font-semibold text-text-primary">{formatVisibility(metar)}</div>
              </div>

              <div className="border border-border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="h-4 w-4 text-text-secondary" />
                  <span className="text-xs uppercase font-semibold text-text-secondary">Humidity</span>
                </div>
                <div className="font-mono text-base font-semibold text-text-primary">
                  {metar.humidity ? `${metar.humidity.percent}%` : "—"}
                </div>
              </div>
            </div>

            <div className="border border-border p-4 bg-surface">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase text-text-secondary">Raw METAR</span>
                <CopyButton text={metar.raw_text} size="sm" />
              </div>
              <div className="font-mono text-xs text-text-primary whitespace-pre-wrap leading-relaxed">{metar.raw_text}</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6">
        <input
          type="text"
          value={departureInput}
          onChange={(event) => setDepartureInput(event.target.value.toUpperCase())}
          placeholder="DEPARTURE"
          maxLength={4}
          className="w-full border border-border px-4 py-3 text-center font-mono text-base uppercase focus:border-blue focus:outline-none bg-white"
        />
        <button
          type="button"
          onClick={handleSwap}
          className="inline-flex h-11 w-11 items-center justify-center border border-border transition-colors hover:bg-surface"
          title="Swap airports"
        >
          <ArrowLeftRight className="h-4 w-4" />
        </button>
        <input
          type="text"
          value={arrivalInput}
          onChange={(event) => setArrivalInput(event.target.value.toUpperCase())}
          placeholder="ARRIVAL"
          maxLength={4}
          className="w-full border border-border px-4 py-3 text-center font-mono text-base uppercase focus:border-blue focus:outline-none bg-white"
        />
      </div>

      {isError && (
        <div className="border border-red-500 bg-red-50 p-4 text-sm mb-6">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <div>
              <p className="font-semibold text-red-700">Unable to retrieve weather data</p>
              <p className="mt-1 text-red-600">{getUserFriendlyErrorMessage(error)}</p>
              <button
                type="button"
                className="mt-3 text-xs font-semibold text-blue hover:underline uppercase"
                onClick={() => refetch()}
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center gap-3 py-16">
          <ScannerLoader size="md" color="text-amber" />
          <span className="text-sm font-mono text-text-secondary">Scanning weather data...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {renderMetarCard("Departure", departureCode, departureMetar)}
          {renderMetarCard("Arrival", arrivalCode, arrivalMetar)}
        </div>
      )}
    </div>
  );
}

// Airport Weather Tab Component
function AirportWeatherTab() {
  const router = useRouter();
  const [airportInput, setAirportInput] = useState("KJFK");
  const airportCode = normalizeIcao(airportInput);

  const { metar, taf, station, loading, error, refetch } = useCompleteWeather({
    icao: airportCode.length === 4 ? airportCode : "",
    metarOptions: { staleTime: 5 * 60 * 1000, retry: 1 },
    tafOptions: { staleTime: 5 * 60 * 1000, retry: 1 },
    stationOptions: { staleTime: 24 * 60 * 60 * 1000 },
  });

  // Fetch all user flights
  const { data: allFlights } = useFlights();

  const departingFlights = useMemo(() => {
    if (!allFlights || !airportCode || airportCode.length !== 4) return [] as any[];
    const now = new Date();
    return allFlights
      .filter(
        (flight) =>
          (flight.origin_icao === airportCode || flight.origin === airportCode) &&
          new Date(flight.scheduled_at) >= now
      )
      .slice(0, 5);
  }, [allFlights, airportCode]);

  // Risk assessment
  const { data: riskData, isLoading: riskLoading } = useWeatherRisk(
    { airport: airportCode, mode: "full" },
    { enabled: airportCode.length === 4 }
  );

  const metarAge = getDataAge(metar?.observed);
  const tafAge = getDataAge((taf as DecodedTaf | undefined)?.issued || (taf as DecodedTaf | undefined)?.valid_time_from);
  const nextUpdate = getNextMetarUpdate(metar?.observed);

  const statusMap = { VFR: "LOW", MVFR: "MODERATE", IFR: "HIGH", LIFR: "CRITICAL" } as const;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <input
          type="text"
          value={airportInput}
          onChange={(event) => setAirportInput(event.target.value.toUpperCase())}
          placeholder="ICAO"
          maxLength={4}
          className="w-32 border border-border px-3 py-2 text-center font-mono text-lg uppercase focus:border-blue focus:outline-none bg-white"
        />
        <div className="flex items-center gap-2">
          {metar?.flight_category && (
            <StatusBadge status={statusMap[(metar.flight_category as NonNullable<DecodedMetar["flight_category"]>)]}>
              {metar.flight_category}
            </StatusBadge>
          )}
          <button
            type="button"
            onClick={() => airportCode.length === 4 && router.push(`/weather/${airportCode}`)}
            className="border border-border px-3 py-2 text-xs"
          >
            Full Details
          </button>
          {metar?.raw_text && <CopyButton text={metar.raw_text} size="sm" />}
        </div>
      </div>

      {/* Errors */}
      {error.any && (
        <div className="border border-red-500 bg-red-50 p-4 text-sm mb-6">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <div>
              <p className="font-semibold text-red-700">Unable to retrieve weather data</p>
              <p className="mt-1 text-red-600">{getUserFriendlyErrorMessage(error.metar || error.taf || error.station)}</p>
              <button
                type="button"
                className="mt-3 text-xs font-semibold text-blue hover:underline uppercase"
                onClick={() => refetch.all()}
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {loading.any ? (
        <div className="flex items-center justify-center gap-3 py-16">
          <ScannerLoader size="md" color="text-amber" />
          <span className="text-sm font-mono text-text-secondary">Scanning weather data...</span>
        </div>
      ) : !airportCode || airportCode.length !== 4 ? (
        <div className="border border-dashed border-border p-12 text-center">
          <Cloud className="h-12 w-12 mx-auto mb-4 text-text-secondary" />
          <p className="text-sm text-text-secondary">Enter a valid ICAO code to view weather</p>
        </div>
      ) : !metar ? (
        <div className="border border-dashed border-border p-12 text-center">
          <Cloud className="h-12 w-12 mx-auto mb-4 text-text-secondary" />
          <p className="text-sm text-text-secondary">No METAR available for {airportCode}</p>
        </div>
      ) : (
        <div className="w-full">
          {/* Raw METAR */}
          <div className="border-b border-border p-3 bg-surface">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-semibold">RAW METAR</span>
              {metar?.raw_text && <CopyButton text={metar.raw_text} size="sm" />}
            </div>
            <div className="font-mono text-xs leading-relaxed">{metar?.raw_text}</div>
          </div>

          {/* Main metrics */}
          <div className="grid grid-cols-6 border-b border-border">
            <MetricCell
              label="Observation"
              value={formatObservationTime(metar)}
              detail={metarAge != null ? `${metarAge} min ago` : undefined}
            />
            <MetricCell
              label="Wind"
              value={formatWindCompact(metar.wind)}
              detail={(() => {
                const wc = calculateWindChill(metar.temperature?.celsius, metar.wind?.speed_kts);
                return wc != null ? `Wind chill ${wc.toFixed(0)}°C` : undefined;
              })()}
            />
            <MetricCell
              label="Visibility"
              value={formatVisibilityCompact(metar.visibility)}
              detail={metar.visibility?.miles_text ? metar.visibility.miles_text : undefined}
            />
            <MetricCell
              label="Temperature"
              value={(() => {
                const tC = metar.temperature?.celsius ?? null;
                const dC = metar.dewpoint?.celsius ?? null;
                const tF = cToF(tC);
                const dF = cToF(dC);
                return [tC != null ? `${tC.toFixed(0)}°C` : "—", dC != null ? `${dC.toFixed(0)}°C` : ""].filter(Boolean).join(" / ") +
                  (tF != null ? ` (${tF.toFixed(0)}°F${dF != null ? ` / ${dF.toFixed(0)}°F` : ""})` : "");
              })()}
              detail={(() => {
                const t = metar.temperature?.celsius ?? null;
                const d = metar.dewpoint?.celsius ?? null;
                if (t == null || d == null) return undefined;
                return `Spread: ${(t - d).toFixed(0)}°C`;
              })()}
            />
            <MetricCell
              label="Pressure"
              value={formatPressure(metar)}
              detail={metar.barometer?.mb ? `QNH ${metar.barometer.mb.toFixed(0)}` : undefined}
            />
            <MetricCell
              label="Clouds"
              value={formatCloudsCompact(metar.clouds)}
              detail={metar.ceiling?.feet ? `Ceiling: ${metar.ceiling.feet} ft` : undefined}
            />
          </div>

          {/* Secondary info */}
          <div className="grid grid-cols-3 p-4">
            <div className="border-r border-border p-3">
              <div className="text-xs uppercase font-semibold text-text-secondary mb-1">Conditions</div>
              <div className="text-xs text-text-secondary space-y-0.5">
                <div>Humidity: {metar.humidity?.percent != null ? `${metar.humidity.percent}%` : "—"}</div>
                <div>
                  Density Altitude:{" "}
                  {(() => {
                    const elevFt = metar.elevation?.feet ?? station?.elevation?.feet ?? null;
                    const da = calculateDensityAltitude(metar.barometer?.hg, metar.temperature?.celsius, elevFt ?? null);
                    return da != null ? `${da.toLocaleString()} ft` : "—";
                  })()}
                </div>
              </div>
            </div>
            <div className="border-r border-border p-3">
              <div className="text-xs uppercase font-semibold text-text-secondary mb-1">Flight Category</div>
              <div className="mt-1">
                {metar.flight_category && (
                  <StatusBadge status={statusMap[metar.flight_category] as any}>{metar.flight_category}</StatusBadge>
                )}
              </div>
            </div>
            <div className="p-3">
              <div className="text-xs uppercase font-semibold text-text-secondary mb-1">Data Age</div>
              <div className="text-xs text-text-secondary">
                <div>METAR: {metarAge != null ? `${metarAge} min old` : "—"}</div>
                <div>TAF: {tafAge != null ? `${tafAge} min old` : "—"}</div>
                <div>Next Update: {nextUpdate != null ? `${nextUpdate} min` : "—"}</div>
              </div>
            </div>
          </div>

          {/* Active Weather Phenomena */}
          {(() => {
            const wx = deriveWeatherPhenomena(metar.raw_text);
            if (!wx.length) return null;
            return (
              <div className="flex items-center gap-2 px-4 py-2 border-t border-border bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-semibold uppercase">Active Weather:</span>
                {wx.map((w) => (
                  <span key={w.code} className="text-xs font-mono">{w.code} ({w.text})</span>
                ))}
              </div>
            );
          })()}

          {/* TAF */}
          {taf && (
            <TafDisplayWide taf={taf} />
          )}

          {/* Departing Flights */}
          {departingFlights.length > 0 && (
            <DepartingFlightsWide flights={departingFlights} />)
          }

          {/* Risk Assessment */}
          {riskData && (
            <RiskAssessmentWide riskData={riskData} riskLoading={riskLoading} />
          )}
        </div>
      )}
    </div>
  );
}

// Standard, more approachable view
function AirportWeatherStandard() {
  const router = useRouter();
  const [airportInput, setAirportInput] = useState("KJFK");
  const airportCode = normalizeIcao(airportInput);

  const { metar, taf, loading, error, refetch } = useCompleteWeather({
    icao: airportCode.length === 4 ? airportCode : "",
    metarOptions: { staleTime: 5 * 60 * 1000, retry: 1 },
    tafOptions: { staleTime: 5 * 60 * 1000, retry: 1 },
  });

  const metarPresent = Boolean(metar);

  return (
    <div>
      <div className="max-w-md mx-auto mb-8">
        <input
          type="text"
          value={airportInput}
          onChange={(event) => setAirportInput(event.target.value.toUpperCase())}
          placeholder="ICAO CODE"
          maxLength={4}
          className="w-full border border-border px-6 py-4 text-center font-mono text-2xl uppercase focus:border-blue focus:outline-none bg-white"
        />
        <p className="text-center text-xs uppercase text-text-secondary mt-2">Enter 4-letter ICAO code</p>
      </div>

      {error.any && (
        <div className="border border-red-500 bg-red-50 p-4 text-sm mb-6">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <div>
              <p className="font-semibold text-red-700">Unable to retrieve weather data</p>
              <p className="mt-1 text-red-600">{getUserFriendlyErrorMessage(error.metar || error.taf || error.station)}</p>
              <button
                type="button"
                className="mt-3 text-xs font-semibold text-blue hover:underline uppercase"
                onClick={() => refetch.all?.()}
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {loading.any ? (
        <div className="flex items-center justify-center gap-3 py-16">
          <ScannerLoader size="md" color="text-amber" />
          <span className="text-sm font-mono text-text-secondary">Scanning weather data...</span>
        </div>
      ) : !airportCode || airportCode.length !== 4 ? (
        <div className="border border-dashed border-border p-12 text-center">
          <Cloud className="h-12 w-12 mx-auto mb-4 text-text-secondary" />
          <p className="text-sm text-text-secondary">Enter a valid ICAO code to view weather</p>
        </div>
      ) : !metarPresent ? (
        <div className="border border-dashed border-border p-12 text-center">
          <Cloud className="h-12 w-12 mx-auto mb-4 text-text-secondary" />
          <p className="text-sm text-text-secondary">No METAR available for {airportCode}</p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <div className="border border-border p-6 mb-6 bg-white">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Cloud className="h-6 w-6 text-text-secondary" />
                <h2 className="font-mono text-3xl font-bold text-text-primary">{airportCode}</h2>
              </div>
              <div className="flex items-center gap-2">
                {metarPresent && (() => {
                  const category = getFlightCategory(metar!) as NonNullable<DecodedMetar["flight_category"]>;
                  const statusMap = { VFR: "LOW", MVFR: "MODERATE", IFR: "HIGH", LIFR: "CRITICAL" } as const;
                  return <StatusBadge status={statusMap[category]}>{category}</StatusBadge>;
                })()}
                <button
                  type="button"
                  onClick={() => router.push(`/weather/${airportCode}`)}
                  className="inline-flex items-center gap-1 border border-border px-3 py-2 text-xs hover:bg-surface"
                >
                  <ExternalLink className="h-3 w-3" />
                  Full Details
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="border border-border p-4">
                <div className="text-xs uppercase font-semibold text-text-secondary">Observation Time</div>
                <div className="font-mono text-sm text-text-primary mt-1">{formatObservationTime(metar!)}</div>
              </div>
              <div className="border border-border p-4">
                <div className="text-xs uppercase font-semibold text-text-secondary">Wind</div>
                <div className="font-mono text-sm font-bold text-text-primary">{formatWind(metar!)}</div>
              </div>
              <div className="border border-border p-4">
                <div className="text-xs uppercase font-semibold text-text-secondary">Temperature</div>
                <div className="font-mono text-base font-bold text-text-primary">
                  {metar!.temperature ? `${metar!.temperature.celsius.toFixed(0)}°C` : "—"}
                  {metar!.dewpoint ? ` / ${metar!.dewpoint.celsius.toFixed(0)}°C` : ""}
                </div>
              </div>
              <div className="border border-border p-4">
                <div className="text-xs uppercase font-semibold text-text-secondary">Visibility</div>
                <div className="font-mono text-base font-bold text-text-primary">{formatVisibility(metar!)}</div>
              </div>
              <div className="border border-border p-4">
                <div className="text-xs uppercase font-semibold text-text-secondary">Clouds</div>
                <div className="font-mono text-sm font-bold text-text-primary">{formatClouds(metar!)}</div>
              </div>
              <div className="border border-border p-4">
                <div className="text-xs uppercase font-semibold text-text-secondary">Pressure</div>
                <div className="font-mono text-sm font-bold text-text-primary">{formatPressure(metar!)}</div>
              </div>
            </div>
          </div>

          <div className="border border-border p-4 bg-surface mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase text-text-secondary">Raw METAR</span>
              {metar?.raw_text && <CopyButton text={metar.raw_text} size="sm" />}
            </div>
            <div className="font-mono text-sm text-text-primary whitespace-pre-wrap leading-relaxed">{metar?.raw_text}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Wide layout building blocks ----
function MetricCell({ label, value, detail }: { label: string; value: React.ReactNode; detail?: React.ReactNode }) {
  return (
    <div className="border-r border-border p-3 last:border-r-0">
      <div className="text-xs uppercase font-semibold text-text-secondary mb-1">{label}</div>
      <div className="font-mono text-sm font-bold text-text-primary">{value}</div>
      {detail ? <div className="text-xs text-text-secondary mt-0.5">{detail}</div> : null}
    </div>
  );
}

function ForecastPeriodCell({ period }: { period: TafForecastPeriod }) {
  const timeRange = (() => {
    if (typeof period.timestamp === "string") return new Date(period.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (period.timestamp?.from && period.timestamp?.to) {
      const from = new Date(period.timestamp.from).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const to = new Date(period.timestamp.to).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      return `${from} - ${to}`;
    }
    return "Forecast Period";
  })();
  return (
    <div className="p-3">
      <div className="text-xs font-semibold text-text-primary mb-2">{timeRange}</div>
      <div className="space-y-1 text-xs">
        <div>Wind: {formatWindCompact(period.wind)}</div>
        {period.visibility && <div>Vis: {formatVisibilityCompact(period.visibility)}</div>}
        {period.clouds && period.clouds.length > 0 && <div>Clouds: {formatCloudsCompact(period.clouds)}</div>}
        {period.flight_category && (
          <div className="mt-2">
            <StatusBadge status={{ VFR: "LOW", MVFR: "MODERATE", IFR: "HIGH", LIFR: "CRITICAL" }[period.flight_category] as any}>
              {period.flight_category}
            </StatusBadge>
          </div>
        )}
      </div>
    </div>
  );
}

function TafDisplayWide({ taf }: { taf: DecodedTaf }) {
  return (
    <div className="border-t border-border">
      <div className="border-b border-border p-3 bg-surface">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase font-semibold">TAF FORECAST</span>
          <span className="text-xs text-text-secondary">
            {taf.valid_time_from && taf.valid_time_to ? (
              <>Valid {new Date(taf.valid_time_from).toLocaleString()} to {new Date(taf.valid_time_to).toLocaleString()}</>
            ) : null}
          </span>
        </div>
        <div className="font-mono text-xs leading-relaxed">{taf.raw_text}</div>
      </div>
      {taf.forecast && taf.forecast.length > 0 && (
        <div className="grid grid-cols-4 divide-x divide-border">
          {taf.forecast.slice(0, 4).map((period, i) => (
            <ForecastPeriodCell key={i} period={period} />
          ))}
        </div>
      )}
    </div>
  );
}

function DepartingFlightsWide({ flights }: { flights: any[] }) {
  const router = useRouter();
  return (
    <div className="border-t border-border">
      <div className="flex items-center gap-2 p-3">
        <Plane className="h-4 w-4 text-text-secondary" />
        <h3 className="text-xs uppercase font-semibold text-text-secondary">Departing Flights</h3>
      </div>
      <div className="divide-y divide-border">
        {flights.map((flight) => (
          <div key={flight.id} className="flex items-center justify-between p-3">
            <div className="flex items-center gap-6">
              <div className="font-mono text-sm font-bold text-text-primary">
                {flight.code} → {flight.destination_icao || flight.destination}
              </div>
              <div className="text-xs text-text-secondary">
                Sched: {new Date(flight.scheduled_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })} UTC
              </div>
              <StatusBadge status={getStatusBadgeType(flight.status)}>{flight.status}</StatusBadge>
            </div>
            <button onClick={() => router.push(`/flights/${flight.id}`)} className="border border-border px-3 py-2 text-xs hover:bg-surface">
              View Flight
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function RiskAssessmentWide({ riskData, riskLoading }: { riskData: any; riskLoading?: boolean }) {
  return (
    <div className="border-t border-border p-3">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="h-4 w-4 text-text-secondary" />
        <h3 className="text-xs uppercase font-semibold text-text-secondary">Risk Assessment</h3>
      </div>
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs uppercase font-semibold text-text-secondary">Overall Risk</span>
          <span className="font-mono text-sm font-bold text-text-primary">{riskData.score ?? 0}/100</span>
        </div>
        <div className="h-2 bg-surface border border-border overflow-hidden">
          <div className={`${getRiskColor(riskData.tier)} h-full`} style={{ width: `${riskData.score ?? 0}%` }} />
        </div>
      </div>
      {riskData.tier && (
        <div className="mb-3">
          <StatusBadge status={riskData.tier as any}>{riskData.tier}</StatusBadge>
        </div>
      )}
      {riskData.result?.factorBreakdown && riskData.result.factorBreakdown.length > 0 && (
        <div className="grid grid-cols-3 gap-3 border-t border-border pt-3">
          {riskData.result.factorBreakdown.map((factor: any, index: number) => (
            <div key={index} className="p-2 border border-border">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-text-primary">{factor.factor}</span>
                <span className="font-mono text-xs text-text-secondary">{factor.score.toFixed(1)}</span>
              </div>
              <div className="text-xs text-text-secondary">{factor.message}</div>
            </div>
          ))}
        </div>
      )}
      {riskData.messaging?.recommendations && riskData.messaging.recommendations.length > 0 && (
        <div className="mt-3">
          <span className="text-xs uppercase font-semibold text-text-secondary mb-2 block">Recommendations</span>
          <ul className="space-y-1">
            {riskData.messaging.recommendations.map((rec: string, i: number) => (
              <li key={i} className="text-xs text-text-secondary">• {rec}</li>
            ))}
          </ul>
        </div>
      )}
      {riskLoading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-blue" />
        </div>
      )}
    </div>
  );
}

// Location Weather Tab Component
function LocationWeatherTab() {
  const [searchMode, setSearchMode] = useState<"coords" | "city">("coords");
  const [latInput, setLatInput] = useState("40.6413");
  const [lonInput, setLonInput] = useState("-73.7781");
  const [cityInput, setCityInput] = useState("New York");

  return (
    <div>
      <div className="max-w-2xl mx-auto">
        <div className="flex gap-0 mb-6 border border-border">
          <button
            onClick={() => setSearchMode("coords")}
            className={`flex-1 px-4 py-3 text-xs uppercase font-semibold border-r border-border ${
              searchMode === "coords" ? "bg-blue text-white" : "bg-white text-text-secondary hover:bg-surface"
            }`}
          >
            <Navigation className="h-4 w-4 mx-auto mb-1" />
            Coordinates
          </button>
          <button
            onClick={() => setSearchMode("city")}
            className={`flex-1 px-4 py-3 text-xs uppercase font-semibold ${
              searchMode === "city" ? "bg-blue text-white" : "bg-white text-text-secondary hover:bg-surface"
            }`}
          >
            <MapPin className="h-4 w-4 mx-auto mb-1" />
            City/Location
          </button>
        </div>

        {searchMode === "coords" ? (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs uppercase font-semibold text-text-secondary mb-2">Latitude</label>
                <input
                  type="text"
                  value={latInput}
                  onChange={(e) => setLatInput(e.target.value)}
                  placeholder="40.6413"
                  className="w-full border border-border px-4 py-3 font-mono text-base focus:border-blue focus:outline-none bg-white"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-semibold text-text-secondary mb-2">Longitude</label>
                <input
                  type="text"
                  value={lonInput}
                  onChange={(e) => setLonInput(e.target.value)}
                  placeholder="-73.7781"
                  className="w-full border border-border px-4 py-3 font-mono text-base focus:border-blue focus:outline-none bg-white"
                />
              </div>
            </div>
            <button className="w-full border border-border px-4 py-3 text-sm font-semibold uppercase hover:bg-blue hover:text-white transition-colors">
              Find Nearest Weather Station
            </button>
          </div>
        ) : (
          <div>
            <label className="block text-xs uppercase font-semibold text-text-secondary mb-2">City or Location Name</label>
            <input
              type="text"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              placeholder="New York"
              className="w-full border border-border px-4 py-3 text-base focus:border-blue focus:outline-none bg-white mb-4"
            />
            <button className="w-full border border-border px-4 py-3 text-sm font-semibold uppercase hover:bg-blue hover:text-white transition-colors">
              Search Weather Stations
            </button>
          </div>
        )}

        <div className="mt-8 border border-dashed border-border p-12 text-center">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-text-secondary" />
          <p className="text-sm text-text-secondary uppercase">Feature coming soon</p>
          <p className="text-xs text-text-secondary mt-2">Location-based weather station lookup will be available in the next update</p>
        </div>
      </div>
    </div>
  );
}

// Main Weather Page Component
export default function WeatherPage() {
  const weatherViewMode = useStore((s) => s.weatherViewMode);
  const tabs = [
    {
      id: "route",
      label: "Route Weather",
      content: <RouteWeatherTab />,
    },
    {
      id: "airport",
      label: "Airport Weather",
      content: weatherViewMode === 'advanced' ? <AirportWeatherTab /> : <AirportWeatherStandard />,
    },
    {
      id: "location",
      label: "Location Weather",
      content: <LocationWeatherTab />,
    },
  ];

  return (
    <div className="flex-1 overflow-auto p-8">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-text-primary">Weather Intelligence</h1>
      </div>

      <SmoothTab tabs={tabs} />
    </div>
  );
}
