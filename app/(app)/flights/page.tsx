'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useFlights } from '@/lib/tanstack/hooks/useFlights';
import type { Flight } from '@/lib/supabase/types';
import { getUserFriendlyErrorMessage } from '@/lib/utils/errors';
import { ArrowRight, AlertCircle, RefreshCw, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GrooveSelect } from '@/components/ui/groove-select';
import { StatusLED } from '@/components/flights/StatusLED';
import { LoadingState } from '@/components/flights/LoadingState';
import { EmptyState } from '@/components/flights/EmptyState';
import { FlightDetailPanel } from '@/components/flights/FlightDetailPanel';

type StatusFilter = 'ALL' | Flight['status'];
type RiskLevel = 'ALL' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

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
  const [expandedFlightId, setExpandedFlightId] = useState<string | null>(null);

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

  useEffect(() => {
    if (expandedFlightId && !filteredFlights.some((f) => f.id === expandedFlightId)) {
      setExpandedFlightId(null);
    }
  }, [expandedFlightId, filteredFlights]);

  return (
    <div className="flex-1 overflow-auto p-8">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 mb-2">
            FLIGHT LOG
          </div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Flights
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {!isLoading && flights && (
            <span className="text-xs font-mono text-zinc-400">
              <span className="text-zinc-200 font-semibold">{flights.length}</span> total flights
            </span>
          )}
          <Link href="/flights/create">
            <button className="bg-[#F04E30] text-white px-5 py-2 rounded-sm text-xs font-bold uppercase tracking-wide hover:bg-[#F04E30]/90 transition-colors">
              NEW FLIGHT
            </button>
          </Link>
        </div>
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

      {/* Filter Panel */}
      <div className="bg-[#F4F4F4] dark:bg-[#2A2A2A] border border-zinc-200 dark:border-[#333] rounded-sm p-6 mb-6">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 mb-4">
          SEARCH & FILTER
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search input */}
          <div className="md:col-span-2">
            <div className="groove-input">
              <input
                type="text"
                placeholder="Search by flight code or airport..."
                className="w-full bg-transparent px-4 py-2.5 border-none text-sm text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Status filter */}
          <GrooveSelect
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as StatusFilter)}
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'On Time', label: 'On Time' },
              { value: 'Delayed', label: 'Delayed' },
              { value: 'Cancelled', label: 'Cancelled' },
            ]}
            aria-label="Filter by flight status"
          />

          {/* Risk filter */}
          <GrooveSelect
            value={riskFilter}
            onChange={(value) => setRiskFilter(value as RiskLevel)}
            options={[
              { value: 'ALL', label: 'All Risk Levels' },
              { value: 'LOW', label: 'Low' },
              { value: 'MODERATE', label: 'Moderate' },
              { value: 'HIGH', label: 'High' },
              { value: 'CRITICAL', label: 'Critical' },
            ]}
            aria-label="Filter by risk level"
          />
        </div>

        {/* Results count */}
        {!isLoading && flights && (
          <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-[#333] flex justify-between items-center">
            <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
              Showing <span className="text-zinc-900 dark:text-zinc-200 font-semibold">{filteredFlights.length}</span> of{' '}
              <span className="text-zinc-900 dark:text-zinc-200 font-semibold">{flights.length}</span> flights
            </span>
            {(statusFilter !== 'ALL' || riskFilter !== 'ALL' || searchQuery) && (
              <button
                onClick={() => {
                  setStatusFilter('ALL');
                  setRiskFilter('ALL');
                  setSearchQuery('');
                }}
                className="text-xs font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Flight List */}
      <div className="space-y-3">
        {isLoading ? (
          <LoadingState />
        ) : filteredFlights.length === 0 ? (
          <EmptyState hasFilters={searchQuery !== '' || statusFilter !== 'ALL' || riskFilter !== 'ALL'} />
        ) : (
          filteredFlights.map((flight) => {
            const isExpanded = expandedFlightId === flight.id;
            const riskLevel = getRiskLevel(flight.weather_risk_score);

            return (
              <div key={flight.id} className="bg-white dark:bg-[#2A2A2A] border border-zinc-200 dark:border-[#333] rounded-sm overflow-hidden">
                {/* Flight summary row */}
                <button
                  onClick={() => setExpandedFlightId(isExpanded ? null : flight.id)}
                  aria-expanded={isExpanded}
                  aria-label={isExpanded ? `Collapse flight details for ${flight.code}` : `Expand flight details for ${flight.code}`}
                  className="w-full p-5 hover:bg-zinc-50 dark:hover:bg-[#1A1A1A]/50 transition-colors text-left"
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Flight code */}
                    <div className="col-span-12 sm:col-span-2">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">
                        FLIGHT
                      </div>
                      <div className="font-mono text-base font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                        {flight.code}
                      </div>
                    </div>

                    {/* Route */}
                    <div className="col-span-12 sm:col-span-3">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">
                        ROUTE
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-mono text-zinc-700 dark:text-zinc-200 tabular-nums">
                          {flight.origin_icao || flight.origin}
                        </span>
                        <ArrowRight size={14} strokeWidth={1.5} className="text-zinc-400 dark:text-zinc-500" />
                        <span className="font-mono text-zinc-700 dark:text-zinc-200 tabular-nums">
                          {flight.destination_icao || flight.destination}
                        </span>
                      </div>
                    </div>

                    {/* Departure time */}
                    <div className="col-span-12 sm:col-span-3">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">
                        DEPARTURE
                      </div>
                      <div className="font-mono text-sm text-zinc-700 dark:text-zinc-200 tabular-nums">
                        {formatDate(flight.scheduled_at)}
                      </div>
                    </div>

                    {/* Arrival time */}
                    <div className="col-span-6 sm:col-span-2">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">
                        ARRIVAL
                      </div>
                      <div className="font-mono text-sm text-zinc-700 dark:text-zinc-200 tabular-nums">
                        {formatDate(flight.arrival_at)}
                      </div>
                    </div>

                    {/* Status & expand indicator */}
                    <div className="col-span-6 sm:col-span-2 flex items-center justify-end gap-3">
                      <StatusLED status={flight.status} />
                      <ChevronDown
                        size={16}
                        strokeWidth={1.5}
                        className={`text-zinc-400 dark:text-zinc-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </div>
                </button>

                {/* Expandable detail panel */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      <FlightDetailPanel flight={flight} riskLevel={riskLevel} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
