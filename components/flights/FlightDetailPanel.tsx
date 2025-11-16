"use client";

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Flight } from '@/lib/supabase/types';
import { useWeatherRisk } from '@/lib/tanstack/hooks/useWeatherRisk';

type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

interface FlightDetailPanelProps {
  flight: Flight;
  riskLevel: RiskLevel;
}

interface DataRowProps {
  label: string;
  value: string;
  mono?: boolean;
  valueClassName?: string;
}

const riskColors: Record<RiskLevel, string> = {
  LOW: 'text-emerald-500',
  MODERATE: 'text-[#2563EB]',
  HIGH: 'text-amber-500',
  CRITICAL: 'text-[#F04E30]',
};

function DataRow({ label, value, mono = false, valueClassName = 'text-zinc-700 dark:text-zinc-200' }: DataRowProps) {
  return (
    <div className="flex justify-between items-baseline gap-4">
      <span className="text-xs text-zinc-400 dark:text-zinc-500">{label}</span>
      <span className={`text-sm text-right ${mono ? 'font-mono tabular-nums' : ''} ${valueClassName}`}>
        {value}
      </span>
    </div>
  );
}

function calculateDuration(start: string | null, end: string | null): string {
  if (!start || !end) return '—';
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function FlightDetailPanel({ flight, riskLevel }: FlightDetailPanelProps) {
  const { data: riskData, isLoading: riskLoading } = useWeatherRisk(
    { flightId: flight.id },
    { enabled: Boolean(flight.id) }
  );

  const computedScore = (riskData?.result?.score ?? riskData?.score ?? flight.weather_risk_score) ?? null;
  const computedAlert = flight.weather_alert_level
    ? flight.weather_alert_level.toUpperCase()
    : undefined;

   const displayRiskLevel: RiskLevel = (() => {
    const tier = (riskData?.tier ?? riskData?.result?.tier) as string | undefined;
    if (tier === 'on_track') return 'LOW';
    if (tier === 'monitor') return 'MODERATE';
    if (tier === 'high_disruption') return 'HIGH';
    return riskLevel;
  })();

  return (
    <div className="border-t border-zinc-200 dark:border-[#333] bg-zinc-50 dark:bg-[#1A1A1A] p-6">
      {/* Instrument modules grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* SCHEDULE module */}
        <div className="bg-white dark:bg-[#2A2A2A] border border-zinc-200 dark:border-[#333] rounded-sm p-4">
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mb-4">
            SCHEDULE
          </div>
          <div className="space-y-3">
            <DataRow label="Departure" value={formatDate(flight.scheduled_at)} mono />
            <DataRow label="Arrival" value={formatDate(flight.arrival_at)} mono />
            {flight.scheduled_at && flight.arrival_at && (
              <DataRow
                label="Duration"
                value={calculateDuration(flight.scheduled_at, flight.arrival_at)}
                mono
              />
            )}
          </div>
        </div>

        {/* WEATHER RISK module */}
        <div className="bg-white dark:bg-[#2A2A2A] border border-zinc-200 dark:border-[#333] rounded-sm p-4">
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mb-4">
            WEATHER RISK
          </div>
          <div className="space-y-3">
            <DataRow
              label="Risk score"
              value={computedScore !== null ? computedScore.toString() : '—'}
              mono
            />
            <DataRow
              label="Level"
              value={displayRiskLevel}
              valueClassName={riskColors[displayRiskLevel]}
            />
            {computedAlert && (
              <DataRow
                label="Alert"
                value={computedAlert}
                valueClassName="text-[#F04E30]"
              />
            )}
            {riskLoading && (
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                Updating risk
              </div>
            )}
          </div>
        </div>

        {/* OPERATIONS module */}
        <div className="bg-white dark:bg-[#2A2A2A] border border-zinc-200 dark:border-[#333] rounded-sm p-4">
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mb-4">
            OPERATIONS
          </div>
          <div className="space-y-3">
            {flight.operator && <DataRow label="Operator" value={flight.operator} />}
            {flight.aircraft && <DataRow label="Aircraft" value={flight.aircraft} />}
            {flight.passenger_count !== null && (
              <DataRow label="Passengers" value={flight.passenger_count.toString()} mono />
            )}
            {flight.crew_count !== null && (
              <DataRow label="Crew" value={flight.crew_count.toString()} mono />
            )}
          </div>
        </div>
      </div>

      {/* Notes section (full width if present) */}
      {flight.notes && (
        <div className="bg-white dark:bg-[#2A2A2A] border border-zinc-200 dark:border-[#333] rounded-sm p-4 mb-4">
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mb-3">
            NOTES
          </div>
          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">{flight.notes}</p>
        </div>
      )}

      {/* Action footer */}
      <div className="flex items-center justify-end">
        <Link
          href={`/flights/${flight.id}`}
          className="text-xs font-mono uppercase tracking-wider text-[#2563EB] hover:text-[#2563EB]/80 transition-colors flex items-center gap-1.5"
        >
          <span>View full details</span>
          <ArrowRight size={14} strokeWidth={1.5} />
        </Link>
      </div>
    </div>
  );
}
