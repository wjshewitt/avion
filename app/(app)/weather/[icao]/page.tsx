"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import {
  ArrowLeft,
  Cloud,
  Eye,
  Thermometer,
  Wind,
  Droplets,
  AlertTriangle,
  RefreshCw,
  Download,
  Printer,
  FileText,
  ChevronDown,
  ChevronUp,
  Zap,
} from "lucide-react";
import { ScannerLoader } from "@/components/kokonutui/minimal-loaders";
import { useAirfieldWeather } from "@/lib/tanstack/hooks/useAirfieldWeather";
import {
  analyzeMetarConcerns,
  analyzeTafConcerns,
  generateWeatherSummary,
  getSeverityColor,
  type WeatherConcern,
  DEFAULT_WEATHER_THRESHOLDS,
} from "@/lib/weather/weatherConcerns";
import type { DecodedMetar, TafForecastPeriod } from "@/types/checkwx";
import { getUserFriendlyErrorMessage } from "@/lib/utils/errors";
import { toast } from "sonner";

const categoryClasses: Record<NonNullable<DecodedMetar["flight_category"]>, string> = {
  VFR: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-200",
  MVFR: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200",
  IFR: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200",
  LIFR: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-200",
};

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

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString([], {
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

const getDataAge = (timestamp: string) => {
  const now = new Date();
  const observed = new Date(timestamp);
  return Math.floor((now.getTime() - observed.getTime()) / (1000 * 60));
};

const getConcernIconComponent = (type: string) => {
  switch (type) {
    case "low_visibility":
      return Eye;
    case "low_ceiling":
      return Cloud;
    case "high_winds":
      return Wind;
    case "gusts":
      return Zap;
    default:
      return AlertTriangle;
  }
};

export default function IndividualWeatherPage() {
  const params = useParams<{ icao: string }>();
  const router = useRouter();
  const icao = params?.icao?.toUpperCase() || "";

  const [showRawData, setShowRawData] = useState(false);
  const [expandedTaf, setExpandedTaf] = useState(false);
  const [showBriefing] = useState(true);

  const {
    data: weatherData,
    isLoading,
    isError,
    error,
    refetch,
  } = useAirfieldWeather(icao, {
    enabled: Boolean(icao && icao.length === 4),
  });

  const metar = weatherData?.metar;
  const taf = weatherData?.taf;

  // Analyze weather concerns
  const concerns = useMemo(() => {
    const allConcerns: WeatherConcern[] = [];

    if (metar) {
      const metarConcerns = analyzeMetarConcerns(metar, DEFAULT_WEATHER_THRESHOLDS);
      allConcerns.push(...metarConcerns);
    }

    if (taf) {
      const tafConcerns = analyzeTafConcerns(taf, DEFAULT_WEATHER_THRESHOLDS);
      allConcerns.push(...tafConcerns);
    }

    return allConcerns;
  }, [metar, taf]);

  const weatherSummary = generateWeatherSummary(concerns);

  // Sort concerns by severity
  const sortedConcerns = useMemo(() => {
    const severityOrder = { extreme: 0, high: 1, moderate: 2, low: 3 };
    return [...concerns].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  }, [concerns]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const lines: string[] = [];
    lines.push("AVIATION WEATHER BRIEFING");
    lines.push("=".repeat(50));
    lines.push("");
    lines.push(`Airport: ${icao}`);
    lines.push(`Briefing Time: ${new Date().toLocaleString()}`);
    lines.push("");
    lines.push("WEATHER SUMMARY");
    lines.push("-".repeat(30));
    lines.push(weatherSummary.summary);
    lines.push("");

    if (concerns.length > 0) {
      lines.push("WEATHER CONCERNS");
      lines.push("-".repeat(30));
      concerns.forEach((concern, index) => {
        lines.push(`${index + 1}. [${concern.severity.toUpperCase()}] ${concern.description}`);
        lines.push(`   Source: ${concern.source}`);
        lines.push("");
      });
    }

    if (metar) {
      lines.push(`METAR (${icao})`);
      lines.push("-".repeat(30));
      lines.push(metar.raw_text);
      lines.push("");
    }

    if (taf) {
      lines.push(`TAF (${icao})`);
      lines.push("-".repeat(30));
      lines.push(taf.raw_text);
      lines.push("");
    }

    lines.push("Data Source: CheckWX Aviation Weather API");
    lines.push(`Generated at ${new Date().toLocaleString()}`);

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `weather-briefing-${icao}-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Weather briefing downloaded");
  };

  if (!icao || icao.length !== 4) {
    return (
      <div className="flex-1 overflow-auto p-8">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => router.push("/weather")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Weather
          </button>
        </div>
        <div className="rounded border border-border bg-card p-6 shadow-sm  ">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-6 w-6" />
            <div>
              <p className="font-semibold">Invalid ICAO Code</p>
              <p className="text-sm">Please provide a valid 4-letter ICAO airport code.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-8">
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/weather")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Weather
        </button>

        <div className="flex items-center gap-2 print:hidden">
          <button
            type="button"
            onClick={() => router.push(`/weather/briefing/${icao.toLowerCase()}`)}
            className="inline-flex items-center gap-2 rounded border border-blue bg-blue px-3 py-1.5 text-sm text-white hover:bg-blue/90"
            title="View professional briefing"
          >
            <FileText className="h-4 w-4" />
            Professional Briefing
          </button>
          <div className="h-6 w-px bg-border" />
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded border border-border px-3 py-1.5 text-sm hover:bg-muted"
            title="Refresh weather data"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded border border-border px-3 py-1.5 text-sm hover:bg-muted"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-2 rounded border border-border px-3 py-1.5 text-sm hover:bg-muted"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="mb-6 pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-foreground">{icao}</h1>
          {metar?.flight_category && (() => {
            const category = getFlightCategory(metar) as NonNullable<DecodedMetar["flight_category"]>;
            return (
              <span className={`rounded px-2 py-1 text-xs font-semibold uppercase ${categoryClasses[category]}`}>
                {category}
              </span>
            );
          })()}
          {metar?.observed && (
            <span className="text-xs text-muted-foreground">
              {formatObservationTime(metar)}
            </span>
          )}
        </div>
      </div>

      {isError && (
        <div className="mb-6 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-500/10 dark:text-red-200">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4" />
            <div>
              <p className="font-semibold">Unable to retrieve weather data.</p>
              <p className="mt-1">{getUserFriendlyErrorMessage(error)}</p>
              <button
                type="button"
                className="mt-3 text-xs font-medium text-blue hover:underline"
                onClick={() => refetch()}
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center gap-3 py-16 text-muted-foreground">
          <ScannerLoader size="md" color="text-amber" />
          <span className="text-sm font-mono">Scanning weather data...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Weather Summary Card */}
          {concerns.length > 0 && showBriefing && (
            <section className="rounded border bg-card p-6 shadow-sm  "
              style={{
                borderColor: weatherSummary.hasExtremeConditions
                  ? "#ef4444"
                  : weatherSummary.hasHighRiskConditions
                    ? "#f59e0b"
                    : "#10b981",
                borderWidth: "2px",
              }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <FileText className="h-5 w-5" />
                  Weather Summary
                </h2>
              </div>
              <div className="mb-4 flex items-start gap-3">
                {weatherSummary.hasExtremeConditions ? (
                  <AlertTriangle className="h-6 w-6 flex-shrink-0 text-red-600 dark:text-red-400" />
                ) : weatherSummary.hasHighRiskConditions ? (
                  <AlertTriangle className="h-6 w-6 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                ) : (
                  <Cloud className="h-6 w-6 flex-shrink-0 text-green-600 dark:text-green-400" />
                )}
                <div className="flex-1">
                  <p className="text-foreground">{weatherSummary.summary}</p>
                  {concerns.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {weatherSummary.severityCounts.extreme > 0 && (
                        <span className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-500/10 dark:text-red-300">
                          {weatherSummary.severityCounts.extreme} Extreme
                        </span>
                      )}
                      {weatherSummary.severityCounts.high > 0 && (
                        <span className="rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                          {weatherSummary.severityCounts.high} High
                        </span>
                      )}
                      {weatherSummary.severityCounts.moderate > 0 && (
                        <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                          {weatherSummary.severityCounts.moderate} Moderate
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Weather Concerns */}
          {sortedConcerns.length > 0 && showBriefing && (
            <section className="rounded border border-border bg-card p-6 shadow-sm  ">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                <AlertTriangle className="h-5 w-5" />
                Weather Concerns
              </h2>
              <div className="space-y-3">
                {sortedConcerns.map((concern, index) => {
                  const IconComponent = getConcernIconComponent(concern.type);
                  return (
                    <div
                      key={index}
                      className={`rounded border p-4 ${getSeverityColor(concern.severity)}`}
                    >
                      <div className="flex items-start gap-3">
                        <IconComponent className="h-5 w-5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <span className="rounded px-2 py-0.5 text-xs font-semibold uppercase">
                              {concern.severity}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {concern.source}
                            </span>
                            {concern.timestamp && (
                              <span className="text-xs text-muted-foreground">
                                {typeof concern.timestamp === "string"
                                  ? formatTime(concern.timestamp)
                                  : `${formatTime(concern.timestamp.from)} - ${formatTime(concern.timestamp.to)}`}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-foreground">
                            {concern.description}
                          </p>
                          {concern.details && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              Current: {concern.details.current_value} {concern.details.unit}
                              {concern.details.threshold && (
                                <>
                                  {" "}• Threshold: {concern.details.threshold} {concern.details.unit}
                                </>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Current Conditions (METAR) */}
          {metar && (
            <section className="rounded border border-border bg-card p-6 shadow-sm  ">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                  Current Conditions
                </h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{formatObservationTime(metar)}</span>
                  {(() => {
                    const age = getDataAge(metar.observed);
                    return age > 20 ? (
                      <span className="text-yellow-600 dark:text-yellow-400">({age}m old)</span>
                    ) : null;
                  })()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
                <div className="flex items-start gap-3 rounded bg-surface p-4 dark:bg-slate-800">
                  <Thermometer className="h-5 w-5 text-text-secondary" />
                  <div>
                    <div className="text-xs uppercase text-text-secondary">Temperature / Dew point</div>
                    <div className="mt-1 font-semibold text-foreground">
                      {metar.temperature ? `${metar.temperature.celsius.toFixed(0)}°C` : "—"}
                      {metar.dewpoint ? ` / ${metar.dewpoint.celsius.toFixed(0)}°C` : ""}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded bg-surface p-4 dark:bg-slate-800">
                  <Wind className="h-5 w-5 text-text-secondary" />
                  <div>
                    <div className="text-xs uppercase text-text-secondary">Wind</div>
                    <div className="mt-1 font-semibold text-foreground">{formatWind(metar)}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded bg-surface p-4 dark:bg-slate-800">
                  <Eye className="h-5 w-5 text-text-secondary" />
                  <div>
                    <div className="text-xs uppercase text-text-secondary">Visibility</div>
                    <div className="mt-1 font-semibold text-foreground">{formatVisibility(metar)}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded bg-surface p-4 dark:bg-slate-800">
                  <Droplets className="h-5 w-5 text-text-secondary" />
                  <div>
                    <div className="text-xs uppercase text-text-secondary">Humidity</div>
                    <div className="mt-1 font-semibold text-foreground">
                      {metar.humidity ? `${metar.humidity.percent}%` : "—"}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded bg-surface p-4 dark:bg-slate-800">
                  <div>
                    <div className="text-xs uppercase text-text-secondary">Altimeter</div>
                    <div className="mt-1 font-semibold text-foreground">
                      {metar.barometer?.hg !== undefined ? `${metar.barometer.hg.toFixed(2)} inHg` : "—"}
                    </div>
                  </div>
                </div>
              </div>

              {metar.clouds && metar.clouds.length > 0 && (
                <div className="mt-4">
                  <div className="mb-2 text-xs uppercase text-text-secondary">Cloud Layers</div>
                  <div className="space-y-1">
                    {metar.clouds.map((cloud, index) => (
                      <div key={index} className="text-sm text-foreground">
                        <span className="font-medium">{cloud.code}</span>
                        {cloud.feet && (
                          <span className="text-muted-foreground">
                            {" "}at {cloud.feet.toLocaleString()} ft
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Terminal Area Forecast (TAF) */}
          {taf && (
            <section className="rounded border border-border bg-card p-6 shadow-sm  ">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                  Terminal Area Forecast
                </h2>
                <button
                  type="button"
                  onClick={() => setExpandedTaf(!expandedTaf)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  {expandedTaf ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Collapse
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Expand All
                    </>
                  )}
                </button>
              </div>

              {taf.valid_time_from && taf.valid_time_to && (
                <div className="mb-4 text-xs text-muted-foreground">
                  Valid: {formatObservationTime({ observed: taf.valid_time_from } as DecodedMetar)} -{" "}
                  {formatObservationTime({ observed: taf.valid_time_to } as DecodedMetar)}
                </div>
              )}

              {taf.forecast && taf.forecast.length > 0 && (
                <div className="space-y-2">
                  {(expandedTaf ? taf.forecast : taf.forecast.slice(0, 4)).map((period: TafForecastPeriod, index: number) => (
                    <div
                      key={index}
                      className="rounded border border-border/50 bg-surface p-3  dark:bg-slate-800"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-medium text-foreground">
                          {typeof period.timestamp === "string"
                            ? formatTime(period.timestamp)
                            : period.timestamp
                              ? `${formatTime(period.timestamp.from)} - ${formatTime(period.timestamp.to)}`
                              : "Forecast Period"}
                        </span>
                        {period.flight_category && (
                          <span className={`rounded px-2 py-0.5 text-xs font-semibold ${categoryClasses[period.flight_category as keyof typeof categoryClasses]}`}>
                            {period.flight_category}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
                        {period.wind && (
                          <div>
                            <span className="text-muted-foreground">Wind: </span>
                            <span className="text-foreground">
                              {period.wind.speed_kts}kt @ {period.wind.degrees}°
                              {period.wind.gust_kts && (
                                <span className="text-yellow-600 dark:text-yellow-400">
                                  {" "}G{period.wind.gust_kts}
                                </span>
                              )}
                            </span>
                          </div>
                        )}

                        {period.visibility && (
                          <div>
                            <span className="text-muted-foreground">Vis: </span>
                            <span className="text-foreground">
                              {period.visibility.miles_float} SM
                            </span>
                          </div>
                        )}

                        {period.clouds && period.clouds.length > 0 && (
                          <div className="col-span-2">
                            <span className="text-muted-foreground">Clouds: </span>
                            <span className="text-foreground">
                              {period.clouds[0].code}
                              {period.clouds[0].feet && (
                                <span className="text-muted-foreground">
                                  {" "}@ {period.clouds[0].feet}ft
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {!expandedTaf && taf.forecast.length > 4 && (
                    <p className="text-center text-xs text-muted-foreground">
                      {taf.forecast.length - 4} more forecast periods available
                    </p>
                  )}
                </div>
              )}
            </section>
          )}

          {/* Raw Weather Data */}
          <section className="rounded border border-border bg-card p-6 shadow-sm  ">
            <button
              type="button"
              onClick={() => setShowRawData(!showRawData)}
              className="mb-3 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              {showRawData ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Hide Raw Text
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Show Raw Text
                </>
              )}
            </button>

            {showRawData && (
              <div className="space-y-3">
                {metar && (
                  <div className="rounded bg-muted p-4">
                    <div className="mb-2 text-xs font-semibold uppercase text-text-secondary">Raw METAR</div>
                    <div className="whitespace-pre-wrap break-all font-mono text-sm text-foreground">
                      {metar.raw_text}
                    </div>
                  </div>
                )}

                {taf && (
                  <div className="rounded bg-muted p-4">
                    <div className="mb-2 text-xs font-semibold uppercase text-text-secondary">Raw TAF</div>
                    <div className="whitespace-pre-wrap break-all font-mono text-sm text-foreground">
                      {taf.raw_text}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* No Data Message */}
          {!metar && !taf && !isLoading && (
            <div className="rounded border border-border bg-card p-8 text-center shadow-sm  ">
              <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-text-secondary " />
              <p className="text-muted-foreground">
                No weather data available for {icao}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="rounded border border-border bg-surface p-4 text-sm text-muted-foreground">
            <p className="mb-2">
              <strong>Data Source:</strong> CheckWX Aviation Weather API
            </p>
            <p>
              Weather conditions can change rapidly. Monitor current conditions and forecasts throughout your
              flight planning and execution. This briefing is for planning purposes only.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
