"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFlight } from "@/lib/tanstack/hooks/useFlights";
import { getUserFriendlyErrorMessage } from "@/lib/utils/errors";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  AlertCircle,
  AlertTriangle,
  CalendarClock,
  Info,
  Plane,
  RefreshCw,
  Users,
} from "lucide-react";

type RiskLevel = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";

const statusClasses: Record<string, string> = {
  "On Time": "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-200",
  Delayed: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200",
  Cancelled: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-200",
};

const riskClasses: Record<RiskLevel, string> = {
  LOW: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-200",
  MODERATE: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200",
  HIGH: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200",
  CRITICAL: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-200",
};

function getRiskLevel(score: number | null): RiskLevel {
  if (score === null || score === undefined) return "LOW";
  if (score < 25) return "LOW";
  if (score < 50) return "MODERATE";
  if (score < 75) return "HIGH";
  return "CRITICAL";
}

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function FlightDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const { data: flight, isLoading, isError, error, refetch } = useFlight(id);

  const riskLevel = useMemo(() => getRiskLevel(flight?.weather_risk_score ?? null), [
    flight?.weather_risk_score,
  ]);

  const statusBadge = flight ? statusClasses[flight.status] ?? "bg-gray-100 text-gray-700" : "";
  const riskBadge = riskClasses[riskLevel];

  return (
    <div className="flex-1 overflow-auto p-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary"
          onClick={() => router.push("/flights")}
        >
          <ArrowLeft className="h-4 w-4" /> Back to Flights
        </Button>
      </div>

      {!id && (
        <div className="rounded border border-border bg-white p-8 text-center text-text-secondary dark:bg-slate-900 dark:text-slate-400">
          <p>Missing flight identifier.</p>
        </div>
      )}

      {id && isLoading && (
        <div className="rounded border border-border bg-white p-8 text-center text-text-secondary dark:bg-slate-900 dark:text-slate-400">
          Loading flight details...
        </div>
      )}

      {id && isError && (
        <div className="rounded border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-500/10 dark:text-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5" />
            <div className="flex-1">
              <p className="font-medium">Unable to load flight details</p>
              <p className="mt-1 text-sm">
                {getUserFriendlyErrorMessage(error)}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 inline-flex items-center gap-2"
                onClick={() => refetch()}
              >
                <RefreshCw className="h-3 w-3" /> Retry
              </Button>
            </div>
          </div>
        </div>
      )}

      {id && !isLoading && !isError && !flight && (
        <div className="rounded border border-border bg-white p-8 text-center text-text-secondary dark:bg-slate-900 dark:text-slate-400">
          <p>Flight not found.</p>
        </div>
      )}

      {flight && (
        <div className="space-y-6">
          <div className="bg-white border-b border-border pb-4 dark:bg-slate-900 dark:border-slate-700">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-4">
                <Plane className="h-5 w-5 mt-0.5 text-primary" />
                <div>
                  <h1 className="text-xl font-semibold text-text-primary dark:text-slate-50">
                    {flight.code}
                  </h1>
                  <div className="flex items-center gap-3 text-xs text-text-secondary dark:text-slate-400 mt-1">
                    <span className="font-mono">
                      {flight.origin_icao || flight.origin} → {flight.destination_icao || flight.destination}
                    </span>
                    <span>•</span>
                    <span>{formatDateTime(flight.scheduled_at)}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center rounded px-2 py-1 text-xs font-semibold ${statusBadge}`}>
                  {flight.status}
                </span>
                <span className={`inline-flex items-center rounded px-2 py-1 text-xs font-semibold ${riskBadge}`}>
                  {riskLevel}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <section className="bg-white p-6 shadow-sm dark:bg-slate-900 dark:shadow-none">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary dark:text-slate-50">
                  <CalendarClock className="h-4 w-4" /> Schedule
                </h2>
                <dl className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-text-secondary dark:text-slate-400">Scheduled Departure</dt>
                    <dd className="font-mono text-text-primary dark:text-slate-50">
                      {formatDateTime(flight.scheduled_at)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-text-secondary dark:text-slate-400">Scheduled Arrival</dt>
                    <dd className="font-mono text-text-primary dark:text-slate-50">
                      {formatDateTime(flight.arrival_at)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-text-secondary dark:text-slate-400">Operator</dt>
                    <dd className="text-text-primary dark:text-slate-50">
                      {flight.operator || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-text-secondary dark:text-slate-400">Aircraft</dt>
                    <dd className="text-text-primary dark:text-slate-50">
                      {flight.aircraft || "—"}
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="bg-white p-6 shadow-sm dark:bg-slate-900 dark:shadow-none">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary dark:text-slate-50">
                  <Users className="h-4 w-4" /> Manifest
                </h2>
                <dl className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-text-secondary dark:text-slate-400">Passengers</dt>
                    <dd className="text-text-primary dark:text-slate-50">
                      {flight.passenger_count ?? "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-text-secondary dark:text-slate-400">Crew</dt>
                    <dd className="text-text-primary dark:text-slate-50">
                      {flight.crew_count ?? "—"}
                    </dd>
                  </div>
                </dl>
              </section>
            </div>

            <div className="space-y-6">
              <section className="bg-white p-6 shadow-sm dark:bg-slate-900 dark:shadow-none">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary dark:text-slate-50">
                  <AlertTriangle className="h-4 w-4" /> Weather & Risk
                </h2>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between rounded border border-border bg-surface px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
                    <span className="text-text-secondary dark:text-slate-400">Risk score</span>
                    <span className="font-medium text-text-primary dark:text-slate-50">
                      {flight.weather_risk_score ?? "—"}
                    </span>
                  </div>
                  {flight.weather_focus && (
                    <div className="rounded border border-blue-200 bg-blue-50 px-3 py-2 text-blue-900 dark:border-blue-900/40 dark:bg-blue-500/10 dark:text-blue-200">
                      Focus area: {flight.weather_focus.replace(/_/g, " ")}
                    </div>
                  )}
                  {flight.weather_data ? (
                    <details className="rounded border border-border bg-surface p-3 text-sm dark:border-slate-700 dark:bg-slate-800">
                      <summary className="cursor-pointer font-medium text-text-primary dark:text-slate-50">
                        View weather data
                      </summary>
                      <pre className="mt-3 overflow-auto rounded bg-black/5 p-3 text-xs text-text-secondary dark:bg-white/5 dark:text-slate-300">
                        {JSON.stringify(flight.weather_data, null, 2)}
                      </pre>
                    </details>
                  ) : (
                    <p className="text-text-secondary dark:text-slate-400">No weather data available.</p>
                  )}
                </div>
              </section>

              <section className="bg-white p-6 shadow-sm dark:bg-slate-900 dark:shadow-none">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary dark:text-slate-50">
                  <Info className="h-4 w-4" /> Notes
                </h2>
                <p className="mt-3 whitespace-pre-line text-sm text-text-secondary dark:text-slate-300">
                  {flight.notes || "No notes provided for this flight."}
                </p>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
