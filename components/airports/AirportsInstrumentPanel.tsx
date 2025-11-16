"use client";

import { useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";
import {
  useAirportSearch,
  useAirport,
  useAirportsBatch,
} from "@/lib/tanstack/hooks/useAirports";
import { getUserFriendlyErrorMessage } from "@/lib/utils/errors";
import type { AirportSearchResult } from "@/types/airports";
import type { ProcessedAirportData } from "@/types/airportdb";
import { AirportSearchColumn } from "./AirportSearchColumn";
import { AirportInstrumentGrid } from "./AirportInstrumentGrid";

const MIN_QUERY_LENGTH = 3;

// Focus on high-signal global and corporate hubs for featured mode
const FEATURED_AIRPORTS: string[] = [
  "KTEB",
  "KHPN",
  "KJFK",
  "KLAX",
  "KORD",
  "KATL",
  "EGLL",
  "CYVR",
];

export function AirportsInstrumentPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIcao, setSelectedIcao] = useState<string | null>(null);

  const trimmedQuery = searchQuery.trim();
  const isUsingFeatured = trimmedQuery.length < MIN_QUERY_LENGTH;

  const {
    data: searchResults,
    isLoading: isSearching,
    isError: isSearchError,
    error: searchError,
  } = useAirportSearch(
    {
      query: trimmedQuery,
      limit: 20,
      popularFirst: true,
    },
    {
      enabled: trimmedQuery.length >= MIN_QUERY_LENGTH,
    }
  );

  const {
    data: featuredAirports,
    isLoading: isLoadingFeatured,
    isError: isFeaturedError,
    error: featuredError,
  } = useAirportsBatch(FEATURED_AIRPORTS, {
    enabled: isUsingFeatured,
  });

  const {
    data: airportDetail,
    isLoading: isLoadingDetail,
    isError: isDetailError,
    error: detailError,
  } = useAirport(selectedIcao ?? "", {
    enabled: Boolean(selectedIcao),
  });

  const results: AirportSearchResult[] = useMemo(() => {
    if (isUsingFeatured) {
      return (
        featuredAirports?.airports?.map((airport) => ({
          airport,
          score: 1,
          matchType: "exact",
        })) as AirportSearchResult[] | undefined
      ) ?? [];
    }
    return searchResults ?? [];
  }, [featuredAirports?.airports, isUsingFeatured, searchResults]);

  const handleSelectAirport = (icao: string) => {
    setSelectedIcao(icao.toUpperCase());
  };

  const totalResults = results.length;

  return (
    <section className="space-y-4">
      {/* Header band matching Flights layout */}
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-2 text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400">
            AIRPORT INTELLIGENCE
          </div>
          <h3 className="text-2xl font-semibold tracking-tight text-foreground">
            Airports
          </h3>
        </div>
        {totalResults > 0 && (
          <div className="hidden text-xs font-mono text-zinc-400 md:block">
            <span className="font-semibold text-zinc-200 dark:text-zinc-100">
              {totalResults}
            </span>{" "}
            results
          </div>
        )}
      </div>

      <div className="mt-2 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)]">
        <AirportSearchColumn
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          results={results}
          selectedIcao={selectedIcao}
          onSelectAirport={handleSelectAirport}
          isSearching={isSearching || isLoadingFeatured}
          isSearchError={isSearchError || isFeaturedError}
          searchError={searchError ?? featuredError}
          isUsingFeatured={isUsingFeatured}
          minQueryLength={MIN_QUERY_LENGTH}
        />

        <div className="space-y-4">
          {isSearchError && (
            <div className="flex items-center gap-2 rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-500/10 dark:text-red-200">
              <AlertCircle className="h-3 w-3" />
              <span>{getUserFriendlyErrorMessage(searchError)}</span>
            </div>
          )}

          <AirportInstrumentGrid
            airportDetail={airportDetail as ProcessedAirportData | undefined}
            isLoadingDetail={isLoadingDetail}
            isDetailError={isDetailError}
            detailError={detailError}
            selectedIcao={selectedIcao}
          />
        </div>
      </div>
    </section>
  );
}

export default AirportsInstrumentPanel;
