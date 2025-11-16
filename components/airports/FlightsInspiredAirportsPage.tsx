"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import {
  useAirportSearch,
  useAirport,
  useAirportsBatch,
} from "@/lib/tanstack/hooks/useAirports";
import { getUserFriendlyErrorMessage } from "@/lib/utils/errors";
import type { AirportSearchResult } from "@/types/airports";
import type { ProcessedAirportData } from "@/types/airportdb";
import { AlertCircle, ChevronDown, Search } from "lucide-react";
import { ThinkingIndicator } from "@/components/mission-control/shared/ThinkingIndicator";
import { AirportInstrumentGrid } from "./AirportInstrumentGrid";

const MIN_QUERY_LENGTH = 3;
const FEATURED_AIRPORTS: string[] = [
  "KTEB", "KHPN", "KJFK", "KLAX", "KORD", "KATL", "EGLL", "CYVR",
];

export function FlightsInspiredAirportsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIcao, setSelectedIcao] = useState<string | null>(null);
  const [expandedAirportIcao, setExpandedAirportIcao] = useState<string | null>(null);

  const trimmedQuery = searchQuery.trim();
  const isUsingFeatured = trimmedQuery.length < MIN_QUERY_LENGTH;

  const {
    data: searchResults,
    isLoading: isSearching,
    isError: isSearchError,
    error: searchError,
  } = useAirportSearch(
    { query: trimmedQuery, limit: 50, popularFirst: true },
    { enabled: !isUsingFeatured }
  );

  const {
    data: featuredAirports,
    isLoading: isLoadingFeatured,
  } = useAirportsBatch(FEATURED_AIRPORTS, { enabled: isUsingFeatured });

  const results: AirportSearchResult[] = useMemo(() => {
    if (isUsingFeatured) {
      return (
        featuredAirports?.airports?.map((airport) => ({
          airport,
          score: 1,
          matchType: "featured",
        })) as AirportSearchResult[] | undefined
      ) ?? [];
    }
    return searchResults ?? [];
  }, [featuredAirports?.airports, isUsingFeatured, searchResults]);

  const {
    data: airportDetail,
    isLoading: isLoadingDetail,
    isError: isDetailError,
    error: detailError,
  } = useAirport(expandedAirportIcao ?? "", {
    enabled: Boolean(expandedAirportIcao),
  });

  const handleSelectAirport = (icao: string) => {
    if (expandedAirportIcao === icao) {
      setExpandedAirportIcao(null);
    } else {
      setExpandedAirportIcao(icao);
    }
  };
  
  useEffect(() => {
    if (expandedAirportIcao && !results.some(r => r.airport.icao === expandedAirportIcao)) {
      // setExpandedAirportIcao(null);
    }
  }, [expandedAirportIcao, results]);

  return (
    <div className="flex-1 overflow-auto p-8">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 mb-2">
            AIRPORT INTELLIGENCE
          </div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Global Airport Database
          </h1>
        </div>
        {results.length > 0 && (
          <span className="text-xs font-mono text-zinc-400">
            <span className="text-zinc-200 font-semibold">{results.length}</span> airports found
          </span>
        )}
      </div>

      {isSearchError && (
        <div className="mb-6 rounded border border-red-900/40 bg-red-500/10 p-4 text-sm text-red-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{getUserFriendlyErrorMessage(searchError)}</span>
          </div>
        </div>
      )}

      {/* Filter Panel */}
      <div className="bg-[#F4F4F4] dark:bg-[#2A2A2A] border border-zinc-200 dark:border-[#333] rounded-sm p-6 mb-6">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 mb-4">
          SEARCH DATABASE
        </div>
        <div className="groove-input flex items-center">
          <Search className="ml-3 h-4 w-4 text-zinc-400" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search by ICAO, IATA, name, or city..."
            className="w-full bg-transparent px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-200 dark:placeholder:text-zinc-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Airport List */}
      <div className="space-y-3">
        {(isSearching || isLoadingFeatured) && results.length === 0 ? (
          <div className="flex min-h-[260px] items-center justify-center rounded-sm border border-zinc-200 bg-white px-6 py-6 dark:border-[#333] dark:bg-[#1A1A1A]">
            <ThinkingIndicator material="tungsten" />
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-400">No airports found.</p>
          </div>
        ) : (
          results.map(({ airport }) => {
            const isExpanded = expandedAirportIcao === airport.icao;
            return (
              <div key={airport.icao} className="bg-white dark:bg-[#2A2A2A] border border-zinc-200 dark:border-[#333] rounded-sm overflow-hidden">
                <button
                  onClick={() => handleSelectAirport(airport.icao)}
                  aria-expanded={isExpanded}
                  className="w-full p-5 hover:bg-zinc-50 dark:hover:bg-[#1A1A1A]/50 transition-colors text-left"
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-12 sm:col-span-2">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">
                        IDENT
                      </div>
                      <div className="font-mono text-base font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                        {airport.icao} / {airport.iata}
                      </div>
                    </div>

                    <div className="col-span-12 sm:col-span-4">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">
                        AIRPORT NAME
                      </div>
                      <div className="text-sm text-zinc-800 dark:text-zinc-200">
                        {airport.name}
                      </div>
                    </div>

                    <div className="col-span-12 sm:col-span-4">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">
                        LOCATION
                      </div>
                      <div className="text-sm text-zinc-700 dark:text-zinc-300">
                        {airport.city}, {airport.country}
                      </div>
                    </div>
                    
                    <div className="col-span-12 sm:col-span-2 flex items-center justify-end gap-3">
                       <ChevronDown
                        size={16}
                        strokeWidth={1.5}
                        className={`text-zinc-400 dark:text-zinc-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 border-t border-zinc-200 dark:border-[#333] bg-zinc-50 dark:bg-[#1A1A1A]">
                        <AirportInstrumentGrid
                          airportDetail={airportDetail as ProcessedAirportData | undefined}
                          isLoadingDetail={isLoadingDetail}
                          isDetailError={isDetailError}
                          detailError={detailError}
                          selectedIcao={expandedAirportIcao}
                        />
                      </div>
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
