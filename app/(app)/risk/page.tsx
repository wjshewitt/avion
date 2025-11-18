"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useFlights } from "@/lib/tanstack/hooks/useFlights";
import type { Flight } from "@/lib/supabase/types";
import { getUserFriendlyErrorMessage } from "@/lib/utils/errors";
import { GrooveSelect } from "@/components/ui/groove-select";
import { Button } from "@/components/ui/button";
import { FleetRiskPrism } from "@/components/risk/FleetRiskPrism";
import { RiskTimeline } from "@/components/risk/RiskTimeline";
import { FlightRiskCard } from "@/components/risk/FlightRiskCard";
import { RiskInsightsPanel } from "@/components/risk/RiskInsightsPanel";
import type { Phase } from "@/lib/weather/risk/types";

type StatusFilter = "ALL" | Flight["status"];
type RiskLevel = "ALL" | "LOW" | "MODERATE" | "HIGH" | "CRITICAL";

function mapScoreToRiskLevel(score: number | null | undefined): Exclude<RiskLevel, "ALL"> {
  if (score == null) return "LOW";
  if (score < 25) return "LOW";
  if (score < 50) return "MODERATE";
  if (score < 75) return "HIGH";
  return "CRITICAL";
}

function getPhase(flight: Flight): Phase {
  const now = Date.now();
  const dep = flight.scheduled_at ? new Date(flight.scheduled_at).getTime() : undefined;
  const arr = flight.arrival_at ? new Date(flight.arrival_at).getTime() : undefined;

  if (!dep) return "preflight";

  const diffHrs = (dep - now) / 3600000;
  if (diffHrs > 24) return "preflight";
  if (diffHrs > 0) return "planning";
  if (diffHrs <= 0 && (!arr || now <= arr)) return "enroute";
  return "arrival";
}

export default function RiskPage() {
  const { data: flights, isLoading, isError, error, refetch } = useFlights();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [riskFilter, setRiskFilter] = useState<RiskLevel>("ALL");
  const [phaseFilter, setPhaseFilter] = useState<"ALL" | Phase>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const monitoredFlights = useMemo(() => flights ?? ([] as Flight[]), [flights]);

  const filteredFlights = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return monitoredFlights.filter((flight) => {
      const matchesStatus =
        statusFilter === "ALL" || flight.status === statusFilter;

      const level = mapScoreToRiskLevel(flight.weather_risk_score);
      const matchesRisk =
        riskFilter === "ALL" || riskFilter === level;

      const phase = getPhase(flight);
      const matchesPhase =
        phaseFilter === "ALL" || phaseFilter === phase;

      const matchesSearch = !query
        ? true
        : [
            flight.code,
            flight.origin,
            flight.destination,
            flight.origin_icao,
            flight.destination_icao,
          ]
            .filter(Boolean)
            .some((value) => value!.toLowerCase().includes(query));

      return matchesStatus && matchesRisk && matchesPhase && matchesSearch;
    })
    .sort((a, b) => (b.weather_risk_score ?? 0) - (a.weather_risk_score ?? 0));
  }, [monitoredFlights, riskFilter, searchQuery, statusFilter, phaseFilter]);

  const overallRiskScore = useMemo(() => {
    if (!monitoredFlights.length) return 0;
    return monitoredFlights.reduce((max, flight) => {
      const score = flight.weather_risk_score ?? 0;
      return score > max ? score : max;
    }, 0);
  }, [monitoredFlights]);

  // Calculate fleet composition by phase
  const flightCounts = useMemo(() => {
    const counts = {
      total: monitoredFlights.length,
      preflight: 0,
      planning: 0,
      departure: 0,
      enroute: 0,
      arrival: 0,
    };

    monitoredFlights.forEach((flight) => {
      const phase = getPhase(flight);
      counts[phase]++;
    });

    return counts;
  }, [monitoredFlights]);

  // Calculate confidence (simplified - would use actual data in production)
  const overallConfidence = useMemo(() => {
    if (!monitoredFlights.length) return 1;
    const avgConfidence = monitoredFlights.reduce((sum, flight) => {
      const weatherData = (flight as any).weather_data?.risk?.combined;
      return sum + (weatherData?.confidence || 0.8);
    }, 0) / monitoredFlights.length;
    return avgConfidence;
  }, [monitoredFlights]);

  return (
    <div className="flex-1 overflow-auto p-4 sm:p-8 bg-background text-foreground">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2">
            RISK COMMAND CENTER
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Fleet Risk
          </h1>
        </div>
        <Link href="/flights">
          <button className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
            View All Flights →
          </button>
        </Link>
      </div>

      {/* Error state */}
      {isError && (
        <div className="mb-6 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-500/10 dark:text-red-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{getUserFriendlyErrorMessage(error)}</span>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto inline-flex items-center gap-1"
              onClick={() => refetch()}
            >
              <RefreshCw className="h-3 w-3" /> Retry
            </Button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="text-sm text-muted-foreground font-mono">Loading fleet data...</div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && monitoredFlights.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-center max-w-md">
            <h2 className="text-xl font-semibold mb-2">No Flights to Monitor</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Create your first flight to start monitoring risk across your fleet.
            </p>
            <Link href="/flights/create">
              <button className="bg-[#F04E30] text-white px-6 py-3 rounded-sm text-sm font-bold uppercase tracking-wide hover:bg-[#F04E30]/90 transition-colors">
                Create Flight
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Main content */}
      {!isLoading && monitoredFlights.length > 0 && (
        <div className="space-y-8">
          {/* Hero: Fleet Risk Prism */}
          <FleetRiskPrism
            score={overallRiskScore}
            confidence={overallConfidence}
            flightCounts={flightCounts}
            nextUpdate={new Date(Date.now() + 15 * 60 * 1000)}
          />

          {/* Risk Timeline */}
          <RiskTimeline
            flights={monitoredFlights}
            onFlightClick={(id) => {
              // Scroll to the flight card
              const element = document.getElementById(`flight-card-${id}`);
              if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            }}
          />

          {/* Filters */}
          <div className="bg-card border border-border rounded-sm p-6">
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Filter Flights
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2 groove-input">
                <input
                  type="text"
                  placeholder="Search flight code or airport..."
                  className="w-full bg-transparent px-3 py-2.5 border-none text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <GrooveSelect
                value={statusFilter}
                onChange={(value) => setStatusFilter(value as StatusFilter)}
                options={[
                  { value: "ALL", label: "All Statuses" },
                  { value: "On Time", label: "On Time" },
                  { value: "Delayed", label: "Delayed" },
                  { value: "Cancelled", label: "Cancelled" },
                ]}
                aria-label="Filter by status"
              />
              <GrooveSelect
                value={riskFilter}
                onChange={(value) => setRiskFilter(value as RiskLevel)}
                options={[
                  { value: "ALL", label: "All Risk" },
                  { value: "LOW", label: "Low" },
                  { value: "MODERATE", label: "Moderate" },
                  { value: "HIGH", label: "High" },
                  { value: "CRITICAL", label: "Critical" },
                ]}
                aria-label="Filter by risk"
              />
              <GrooveSelect
                value={phaseFilter}
                onChange={(value) => setPhaseFilter(value as "ALL" | Phase)}
                options={[
                  { value: "ALL", label: "All Phases" },
                  { value: "preflight", label: "Preflight" },
                  { value: "planning", label: "Planning" },
                  { value: "departure", label: "Departure" },
                  { value: "enroute", label: "Enroute" },
                  { value: "arrival", label: "Arrival" },
                ]}
                aria-label="Filter by phase"
              />
            </div>
            {(statusFilter !== "ALL" || riskFilter !== "ALL" || phaseFilter !== "ALL" || searchQuery) && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  Showing <span className="text-foreground font-semibold">{filteredFlights.length}</span> of{" "}
                  <span className="text-foreground font-semibold">{monitoredFlights.length}</span> flights
                </div>
                <button
                  onClick={() => {
                    setStatusFilter("ALL");
                    setRiskFilter("ALL");
                    setPhaseFilter("ALL");
                    setSearchQuery("");
                  }}
                  className="text-[11px] font-mono uppercase tracking-widest text-blue-500 hover:text-blue-400"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>

          {/* Flight cards grid + Insights panel */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
            {/* Flight cards */}
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Flight Risk Details
              </div>
              {filteredFlights.length === 0 ? (
                <div className="bg-card border border-border rounded-sm p-12 text-center">
                  <p className="text-sm text-muted-foreground">
                    No flights match the current filters
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredFlights.map((flight) => {
                    const phase = getPhase(flight);
                    const riskScore = flight.weather_risk_score || 0;
                    const riskLevel = mapScoreToRiskLevel(riskScore);
                    
                    // Get factors from weather_data if available
                    const weatherData = (flight as any).weather_data;
                    const factors = weatherData?.risk?.origin?.factorBreakdown || [];
                    
                    // Generate insight based on risk level and phase
                    let insight = "";
                    if (riskLevel === "HIGH" || riskLevel === "CRITICAL") {
                      insight = phase === "departure" 
                        ? "Weather risk increasing at departure - consider alternatives"
                        : "Weather risk increasing at arrival - monitor conditions";
                    } else if (riskLevel === "MODERATE") {
                      insight = "Conditions within acceptable limits - continue monitoring";
                    }

                    return (
                      <FlightRiskCard
                        key={flight.id}
                        flight={flight}
                        phase={phase}
                        riskScore={riskScore}
                        riskLevel={riskLevel}
                        factors={factors}
                        trend="stable"
                        insight={insight}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Insights panel */}
            <RiskInsightsPanel flights={monitoredFlights} />
          </div>
        </div>
      )}
    </div>
  );
}
