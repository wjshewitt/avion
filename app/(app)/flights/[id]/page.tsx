"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFlight } from "@/lib/tanstack/hooks/useFlights";
import { getUserFriendlyErrorMessage } from "@/lib/utils/errors";
import { Button } from "@/components/ui/button";
import { RadialGauge } from "@/components/avion/RadialGauge";
import { ConsoleTabs } from "@/components/avion/ConsoleTabs";
import { StatusLED } from "@/components/avion/StatusLED";
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
  "On Time": "border-emerald-400/30 text-emerald-400 dark:border-emerald-500/40 dark:text-emerald-400",
  Delayed: "border-amber-400/30 text-amber-400 dark:border-amber-500/40 dark:text-amber-400",
  Cancelled: "border-destructive/30 text-destructive dark:border-destructive/40 dark:text-destructive",
};

const riskClasses: Record<RiskLevel, string> = {
  LOW: "border-emerald-400/30 text-emerald-400 dark:border-emerald-500/40 dark:text-emerald-400",
  MODERATE: "border-primary/30 text-primary dark:border-primary/40 dark:text-primary",
  HIGH: "border-amber-400/30 text-amber-400 dark:border-amber-500/40 dark:text-amber-400",
  CRITICAL: "border-destructive/30 text-destructive dark:border-destructive/40 dark:text-destructive",
};

const riskGaugeColors: Record<RiskLevel, string> = {
  LOW: "#10b981",
  MODERATE: "var(--primary)",
  HIGH: "#f59e0b",
  CRITICAL: "#F04E30",
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
  const [weatherTab, setWeatherTab] = useState(0);

  return (
    <div className="flex-1 overflow-auto p-8 bg-background text-foreground">
      <div className="mb-6">
        <button
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          onClick={() => router.push("/flights")}
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          <span className="font-mono text-sm">Back to Flights</span>
        </button>
      </div>

      {(!id || (id && !isLoading && !isError && !flight)) && (
        <div 
          className="bg-[#2A2A2A] border border-zinc-700 rounded-sm p-8 text-center text-zinc-500"
          style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5), 0 10px 20px rgba(0,0,0,0.2)' }}
        >
          <p>{!id ? "Missing flight identifier." : "Flight not found."}</p>
        </div>
      )}

      {id && isLoading && (
        <div 
          className="bg-[#2A2A2A] border border-zinc-700 rounded-sm p-8 text-center text-zinc-500"
          style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5), 0 10px 20px rgba(0,0,0,0.2)' }}
        >
          Loading flight details...
        </div>
      )}

      {id && isError && (
        <div 
          className="bg-[#2A2A2A] border border-[#F04E30]/30 rounded-sm p-6 text-red-300"
          style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5), 0 10px 20px rgba(0,0,0,0.2)' }}
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-[#F04E30]" />
            <div className="flex-1">
              <p className="font-medium text-zinc-100">Unable to load flight details</p>
              <p className="mt-1 text-sm">
                {getUserFriendlyErrorMessage(error)}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 inline-flex items-center gap-2 border-border hover:border-primary/50 hover:text-primary"
                onClick={() => refetch()}
              >
                <RefreshCw className="h-3 w-3" /> Retry
              </Button>
            </div>
          </div>
        </div>
      )}



      {flight && (
        <div className="space-y-6">
          <div 
            className="bg-card border border-border rounded-sm p-6"
            style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5), 0 10px 20px rgba(0,0,0,0.2)' }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">FLIGHT</div>
                <h1 className="text-3xl font-medium font-mono text-foreground">
                  {flight.code}
                </h1>
                <div className="font-mono text-muted-foreground mt-1">
                  {flight.origin_icao || flight.origin} → {flight.destination_icao || flight.destination}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  <StatusLED variant={flight.status === 'On Time' ? 'success' : flight.status === 'Delayed' ? 'warning' : 'danger'} />
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-mono uppercase ${statusBadge}`}>
                    {flight.status}
                  </span>
                </div>
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-mono uppercase ${riskBadge}`}>
                  {riskLevel} Risk
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <div 
                className="bg-[#2A2A2A] border border-zinc-700 rounded-sm p-6"
                style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5), 0 10px 20px rgba(0,0,0,0.2)' }}
              >
                <h2 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-4">
                  Schedule
                </h2>
                <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Departure</dt>
                    <dd className="font-mono text-foreground">
                      {formatDateTime(flight.scheduled_at)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Arrival</dt>
                    <dd className="font-mono text-foreground">
                      {formatDateTime(flight.arrival_at)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Operator</dt>
                    <dd className="font-mono text-foreground">
                      {flight.operator || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Aircraft</dt>
                    <dd className="font-mono text-foreground">
                      {flight.aircraft || "—"}
                    </dd>
                  </div>
                </dl>
              </div>

              <div 
                className="bg-[#2A2A2A] border border-zinc-700 rounded-sm p-6"
                style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5), 0 10px 20px rgba(0,0,0,0.2)' }}
              >
                <h2 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-4">
                  Manifest
                </h2>
                <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Passengers</dt>
                    <dd className="font-mono text-foreground">
                      {flight.passenger_count ?? "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Crew</dt>
                    <dd className="font-mono text-foreground">
                      {flight.crew_count ?? "—"}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="space-y-6">
              <div 
                className="bg-[#2A2A2A] border border-zinc-700 rounded-sm p-6"
                style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5), 0 10px 20px rgba(0,0,0,0.2)' }}
              >
                <h2 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-4">
                  Weather & Risk
                </h2>
                <ConsoleTabs tabs={['Risk Analysis', 'Raw Data']} onTabChange={setWeatherTab} />
                <div className="mt-4">
                  {weatherTab === 0 && (
                    <div className="flex flex-col items-center pt-4">
                      <RadialGauge value={flight.weather_risk_score ?? 0} label="Weather Risk" unit="%" color={riskGaugeColors[riskLevel]} />
                      {flight.weather_focus && (
                        <div className="mt-6 w-full border-t border-border pt-4">
                          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground text-center mb-1">WEATHER FOCUS</div>
                          <div className="text-center font-mono text-lg text-primary">
                            {flight.weather_focus.replace(/_/g, " ")}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {weatherTab === 1 && (
                    <div>
                      {flight.weather_data ? (
                        <pre className="mt-3 overflow-auto rounded bg-muted p-3 text-xs text-foreground">
                          {JSON.stringify(flight.weather_data, null, 2)}
                        </pre>
                      ) : (
                        <p className="text-zinc-400 text-center py-4">No weather data available.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div 
                className="bg-[#2A2A2A] border border-zinc-700 rounded-sm p-6"
                style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5), 0 10px 20px rgba(0,0,0,0.2)' }}
              >
                <h2 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-4">
                  Notes
                </h2>
                <p className="mt-3 whitespace-pre-line text-sm text-foreground">
                  {flight.notes || "No notes provided for this flight."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
