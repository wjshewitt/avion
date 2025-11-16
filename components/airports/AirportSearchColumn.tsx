"use client";

import { Loader2, Search } from "lucide-react";
import type { AirportSearchResult } from "@/types/airports";

interface AirportSearchColumnProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  results: AirportSearchResult[];
  selectedIcao: string | null;
  onSelectAirport: (icao: string) => void;
  isSearching: boolean;
  isSearchError: boolean;
  searchError: unknown;
  isUsingFeatured: boolean;
  minQueryLength: number;
}

export function AirportSearchColumn({
  searchQuery,
  onSearchQueryChange,
  results,
  selectedIcao,
  onSelectAirport,
  isSearching,
  isSearchError,
  searchError,
  isUsingFeatured,
  minQueryLength,
}: AirportSearchColumnProps) {
  const trimmed = searchQuery.trim();

  const helperText = isUsingFeatured
    ? "Showing featured airports. Type to search global database."
    : `${results.length} result${results.length === 1 ? "" : "s"} found.`;

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Search module */}
      <div className="rounded-sm border border-zinc-200 bg-[#F4F4F4] p-4 dark:border-[#333] dark:bg-[#2A2A2A]">
        <div className="mb-3 text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
          SEARCH & FILTER
        </div>

        <div className="space-y-2">
          <div className="groove-input flex items-center">
            <Search className="ml-3 h-4 w-4 text-zinc-400" strokeWidth={1.5} />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              placeholder="Search by ICAO, IATA, or airport name..."
              className="w-full bg-transparent px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-200 dark:placeholder:text-zinc-500"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
            <span>{helperText}</span>
            <span className="text-[10px] uppercase tracking-widest">
              MIN {minQueryLength} CHARS
            </span>
          </div>
        </div>
      </div>

      {/* Results list */}
      <div className="flex-1 rounded-sm border border-zinc-200 bg-white dark:border-[#333] dark:bg-[#1A1A1A]">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2 text-[11px] font-mono uppercase tracking-widest text-zinc-500 dark:border-[#333] dark:text-zinc-400">
          <span>Results</span>
          {isSearching && (
            <span className="inline-flex items-center gap-1 text-[10px]">
              <Loader2 className="h-3 w-3 animate-spin" />
              Scanning…
            </span>
          )}
        </div>

        <div className="rail-scroll max-h-[28rem] space-y-2 px-3 py-3">
          {isSearchError && (
            <p className="rounded-sm bg-red-50 px-3 py-2 text-[11px] text-red-700 dark:bg-red-500/10 dark:text-red-300">
              {(searchError as Error | undefined)?.message ?? "Unable to search airports."}
            </p>
          )}

          {!isSearching && results.length === 0 && (
            <p className="px-2 py-4 text-[12px] text-zinc-500 dark:text-zinc-400">
              {trimmed.length < minQueryLength
                ? `Type at least ${minQueryLength} characters to search the global database.`
                : "No airports found for your search."}
            </p>
          )}

          {results.map(({ airport }) => {
            const isSelected = selectedIcao === airport.icao;

            return (
              <button
                key={airport.icao}
                onClick={() => onSelectAirport(airport.icao)}
                className={`w-full rounded-sm border px-3 py-2.5 text-left transition-colors ${
                  isSelected
                    ? "border-[#F04E30] bg-[#F4F4F4] dark:border-[#F04E30] dark:bg-[#27272a]"
                    : "border-zinc-200 hover:border-[#F04E30]/60 hover:bg-zinc-50 dark:border-[#333] dark:hover:bg-[#18181b]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="font-mono text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                      {airport.icao}
                      {airport.iata ? ` / ${airport.iata}` : ""}
                    </span>
                    <span className="mt-0.5 text-[12px] font-medium text-zinc-800 dark:text-zinc-100">
                      {airport.name}
                    </span>
                    <span className="mt-0.5 text-[11px] font-mono uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      {airport.city}
                      {airport.state ? `, ${airport.state}` : ""}
                      {airport.country ? ` · ${airport.country}` : ""}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="rounded-sm border border-zinc-200 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-widest text-zinc-500 dark:border-[#333] dark:text-zinc-400">
                      {airport.is_corporate_hub ? "CORP HUB" : "GLOBAL"}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      RWY {airport.runway_count} · {airport.longest_runway_ft} FT
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}