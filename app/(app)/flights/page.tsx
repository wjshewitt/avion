'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useFlights } from '@/lib/tanstack/hooks/useFlights';
import type { Flight } from '@/lib/supabase/types';
import { getUserFriendlyErrorMessage } from '@/lib/utils/errors';
import { ArrowRight, Filter, Download, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

type StatusFilter = 'ALL' | Flight['status'];
type RiskLevel = 'ALL' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

const statusColors: Record<Flight['status'], string> = {
  'On Time': 'text-green',
  Delayed: 'text-amber',
  Cancelled: 'text-red',
};

const riskColors: Record<Exclude<RiskLevel, 'ALL'>, string> = {
  LOW: 'text-green',
  MODERATE: 'text-blue',
  HIGH: 'text-amber',
  CRITICAL: 'text-red',
};

const riskOptions: Exclude<RiskLevel, 'ALL'>[] = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'];

function getRiskLevel(score: number | null): Exclude<RiskLevel, 'ALL'> {
  if (score === null || score === undefined) return 'LOW';
  if (score < 25) return 'LOW';
  if (score < 50) return 'MODERATE';
  if (score < 75) return 'HIGH';
  return 'CRITICAL';
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

export default function FlightsPage() {
  const { data: flights, isLoading, isError, error, refetch } = useFlights();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [riskFilter, setRiskFilter] = useState<RiskLevel>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFlights = useMemo(() => {
    if (!flights) return [] as Flight[];

    const query = searchQuery.trim().toLowerCase();

    return flights.filter((flight) => {
      const matchesStatus =
        statusFilter === 'ALL' || flight.status === statusFilter;

      const flightRisk = getRiskLevel(flight.weather_risk_score);
      const matchesRisk = riskFilter === 'ALL' || flightRisk === riskFilter;

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

      return matchesStatus && matchesRisk && matchesSearch;
    });
  }, [flights, riskFilter, searchQuery, statusFilter]);

  return (
    <div className="flex-1 overflow-auto p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-foreground">Flights</h1>
          {!isLoading && flights && (
            <span className="text-xs px-2 py-1 bg-surface border border-border font-medium text-muted-foreground">
              {filteredFlights.length} of {flights.length}
            </span>
          )}
        </div>
        <Link href="/flights/create">
          <Button className="bg-blue text-white hover:bg-blue/90">
            Create Flight
          </Button>
        </Link>
      </div>

      {isError && (
        <div className="mb-6 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-500/10 dark:text-red-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{getUserFriendlyErrorMessage(error)}</span>
            <Button variant="outline" size="sm" className="ml-auto inline-flex items-center gap-1" onClick={() => refetch()}>
              <RefreshCw className="h-3 w-3" /> Retry
            </Button>
          </div>
        </div>
      )}

      <div className="bg-card border border-border p-6 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <Filter size={18} className="text-text-secondary dark:text-slate-400" />

          <input
            type="text"
            placeholder="Search by flight code or airport..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[180px] px-4 py-2 border border-border text-sm focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue"
          />

          <Select
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as StatusFilter)}
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'On Time', label: 'On Time' },
              { value: 'Delayed', label: 'Delayed' },
              { value: 'Cancelled', label: 'Cancelled' },
            ]}
            aria-label="Filter by flight status"
            className="min-w-[160px]"
          />

          <Select
            value={riskFilter}
            onChange={(value) => setRiskFilter(value as RiskLevel)}
            options={[
              { value: 'ALL', label: 'All Risk Levels' },
              ...riskOptions.map((option) => ({
                value: option,
                label: `${option.charAt(0)}${option.slice(1).toLowerCase()}`,
              })),
            ]}
            aria-label="Filter by risk level"
            className="min-w-[160px]"
          />

          <button className="px-4 py-2 bg-card border border-border text-sm hover:bg-muted transition-colors flex items-center gap-2">
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="bg-card border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary dark:text-slate-400 uppercase">
                Flight
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary dark:text-slate-400 uppercase">
                Route
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary dark:text-slate-400 uppercase">
                Departure
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary dark:text-slate-400 uppercase">
                Arrival
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary dark:text-slate-400 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary dark:text-slate-400 uppercase">
                Risk
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary dark:text-slate-400 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                  Loading flights...
                </td>
              </tr>
            ) : filteredFlights.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center text-muted-foreground">
                  No flights match your filters.
                </td>
              </tr>
            ) : (
              filteredFlights.map((flight) => {
                const riskLevel = getRiskLevel(flight.weather_risk_score);
                return (
                  <tr key={flight.id} className="hover:bg-surface dark:hover:bg-slate-800 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-semibold text-foreground">
                        {flight.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-mono">{flight.origin_icao || flight.origin}</span>
                        <ArrowRight size={14} className="text-muted-foreground" />
                        <span className="font-mono">{flight.destination_icao || flight.destination}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {flight.origin} → {flight.destination}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-mono">{formatDate(flight.scheduled_at)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-mono">{formatDate(flight.arrival_at)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-semibold ${statusColors[flight.status]}`}>
                        {flight.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-semibold ${riskColors[riskLevel]}`}>
                        {riskLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/flights/${flight.id}`} className="text-sm text-blue hover:underline">
                        View Details
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
