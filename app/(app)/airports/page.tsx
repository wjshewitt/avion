"use client";

import { useMemo, useState } from "react";
import { Search, MapPin, Plane, Radio, Ruler, Globe, Loader2 } from "lucide-react";
import { useAirportSearch, useAirport, useAirportsBatch } from "@/lib/tanstack/hooks/useAirports";
import { getUserFriendlyErrorMessage } from "@/lib/utils/errors";
import type { AirportSearchResult } from "@/types/airports";

const MIN_QUERY_LENGTH = 3;
const FEATURED_AIRPORTS = ["KJFK", "KLAX", "KORD", "EGLL", "KATL", "CYVR"];

export default function AirportsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIcao, setSelectedIcao] = useState<string | null>(null);

  const {
    data: searchResults,
    isLoading: isSearching,
    isError: isSearchError,
    error: searchError,
  } = useAirportSearch(
    {
      query: searchQuery.trim(),
      limit: 20,
      popularFirst: true,
    },
    {
      enabled: searchQuery.trim().length >= MIN_QUERY_LENGTH,
    }
  );

  const { data: featuredAirports } = useAirportsBatch(FEATURED_AIRPORTS, {
    enabled: searchQuery.trim().length < MIN_QUERY_LENGTH,
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
    if (searchQuery.trim().length < MIN_QUERY_LENGTH) {
      return (
        featuredAirports?.airports?.map((airport) => ({
          airport,
          score: 1,
          matchType: "exact",
        })) as AirportSearchResult[] | undefined
      ) ?? [];
    }
    return searchResults ?? [];
  }, [featuredAirports?.airports, searchQuery, searchResults]);

  const handleSelectAirport = (icao: string) => {
    setSelectedIcao(icao.toUpperCase());
  };

  const renderSearchStatus = () => {
    if (isSearching) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="mt-3">Searching airports…</span>
        </div>
      );
    }

    if (isSearchError) {
      return (
        <div className="p-8 text-center text-sm text-red-600 dark:text-red-300">
          {getUserFriendlyErrorMessage(searchError)}
        </div>
      );
    }

    if (results.length === 0) {
      return (
        <div className="p-8 text-center text-sm text-muted-foreground">
          {searchQuery.trim().length < MIN_QUERY_LENGTH
            ? "Type at least 3 characters to search. Showing featured airports."
            : "No airports found for your search."}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex h-full flex-1 overflow-hidden">
      <div className="w-full max-w-md border-r border-border bg-card  ">
        <div className="border-b border-border px-6 py-4 ">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-foreground">Airports</h1>
            {results.length > 0 && (
              <span className="text-xs px-2 py-1 bg-surface border border-border font-medium text-muted-foreground">
                {results.length} results
              </span>
            )}
          </div>
        </div>

        <div className="border-b border-border px-6 py-4 ">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
              }}
              placeholder="Search by ICAO, IATA, or airport name"
              className="w-full rounded-sm border border-border bg-card py-2 pl-10 pr-4 text-sm text-foreground focus:border-blue focus:outline-none focus:ring-1 focus:ring-blue"
            />
          </div>
          <p className="mt-2 text-xs text-text-secondary ">
            {searchQuery.trim().length < MIN_QUERY_LENGTH
              ? "Showing featured airports. Enter at least 3 characters to search."
              : `${results.length} result${results.length === 1 ? "" : "s"} found.`}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {renderSearchStatus()}

          <div className="space-y-2 px-4 py-4">
            {results.map(({ airport }) => (
              <button
                key={airport.icao}
                onClick={() => handleSelectAirport(airport.icao)}
                className={`w-full rounded border px-4 py-3 text-left transition-colors hover:border-blue hover:bg-blue/5   ${
                  selectedIcao === airport.icao ? "border-blue bg-blue/10 dark:border-blue-500/40" : "border-border"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-semibold text-foreground">
                    {airport.icao}
                    {airport.iata ? ` / ${airport.iata}` : ""}
                  </span>
                  <span className="text-xs uppercase text-muted-foreground">
                    {airport.country}
                  </span>
                </div>
                <div className="mt-1 text-sm font-semibold text-foreground">
                  {airport.name}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {airport.city}
                  {airport.state ? `, ${airport.state}` : ""}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="hidden flex-1 overflow-y-auto bg-background p-8 lg:block">
        {!selectedIcao && (
          <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
            <Plane className="mb-4 h-12 w-12 text-blue" />
            <h2 className="text-lg font-semibold text-foreground">Select an airport</h2>
            <p className="mt-2 max-w-sm text-sm">
              Choose an airport from the list to see detailed runway, communication, and operational intelligence.
            </p>
          </div>
        )}

        {selectedIcao && isLoadingDetail && (
          <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="mt-3 text-sm">Loading airport data…</span>
          </div>
        )}

        {selectedIcao && isDetailError && (
          <div className="rounded border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-500/10 dark:text-red-200">
            {getUserFriendlyErrorMessage(detailError)}
          </div>
        )}

        {selectedIcao && airportDetail && (
          <div className="space-y-6">
            <section className="rounded border border-border bg-card p-6 shadow-sm  ">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">
                    {airportDetail.name}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {airportDetail.location?.municipality || "Unknown"}, {airportDetail.location?.region || "Unknown"}, {airportDetail.location?.country || "Unknown"}
                  </p>
                </div>
                {airportDetail.classification?.type && (
                  <div className="rounded bg-blue-50 px-3 py-1 text-xs font-semibold uppercase text-blue-700 dark:bg-blue-500/10 dark:text-blue-200">
                    {airportDetail.classification.type.replace("_", " ")}
                  </div>
                )}
              </div>
              <dl className="mt-6 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-text-secondary" />
                  <div>
                    <dt className="text-xs uppercase text-text-secondary">Coordinates</dt>
                    <dd className="font-mono text-foreground">
                      {airportDetail.coordinates?.latitude?.toFixed(3) || "—"}, {airportDetail.coordinates?.longitude?.toFixed(3) || "—"}
                    </dd>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-text-secondary" />
                  <div>
                    <dt className="text-xs uppercase text-text-secondary">Elevation</dt>
                    <dd className="text-foreground">
                      {airportDetail.coordinates?.elevation_ft ? `${airportDetail.coordinates.elevation_ft} ft` : "—"}
                    </dd>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-text-secondary" />
                  <div>
                    <dt className="text-xs uppercase text-text-secondary">Runways</dt>
                    <dd className="text-foreground">
                      {airportDetail.runways?.count || 0} total • Longest {airportDetail.runways?.longest_ft || 0} ft
                    </dd>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-text-secondary" />
                  <div>
                    <dt className="text-xs uppercase text-text-secondary">Primary frequencies</dt>
                    <dd className="text-foreground">
                      {airportDetail.communications?.primary_frequencies?.tower
                        ? `TWR ${airportDetail.communications.primary_frequencies.tower} MHz`
                        : "Tower n/a"}
                      {airportDetail.communications?.primary_frequencies?.ground
                        ? ` • GND ${airportDetail.communications.primary_frequencies.ground} MHz`
                        : ""}
                    </dd>
                  </div>
                </div>
              </dl>
            </section>

            <section className="rounded border border-border bg-card p-6 shadow-sm  ">
              <h3 className="text-lg font-semibold text-foreground">Runway Details</h3>
              {!airportDetail.runways?.details || airportDetail.runways.details.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">Runway data unavailable for this airport.</p>
              ) : (
                <div className="mt-4 space-y-4">
                  {airportDetail.runways.details.slice(0, 3).map((runway) => (
                    <div key={`${runway.le_ident}-${runway.he_ident}`} className="rounded border border-border p-4 text-sm ">
                      <div className="flex flex-wrap items-center gap-2 text-foreground">
                        <span className="font-mono text-sm font-semibold">
                          {runway.le_ident} / {runway.he_ident}
                        </span>
                        <span className="rounded bg-muted px-2 py-0.5 text-xs uppercase text-muted-foreground">
                          {runway.surface}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {runway.length_ft} x {runway.width_ft} ft
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                        <div>Lighting: {runway.lighted ? "Yes" : "No"}</div>
                        <div>ILS Equipped: {runway.ils_approaches.length > 0 ? "Yes" : "No"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded border border-border bg-card p-6 shadow-sm  ">
              <h3 className="text-lg font-semibold text-foreground">Communications</h3>
              {!airportDetail.communications?.frequencies_by_type || Object.entries(airportDetail.communications.frequencies_by_type).length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  No communication frequencies available.
                </p>
              ) : (
                <div className="mt-4 space-y-3 text-sm">
                  {Object.entries(airportDetail.communications.frequencies_by_type).map(([type, freqs]) => (
                    <div key={type}>
                      <div className="text-xs uppercase text-muted-foreground">
                        {type}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-2 text-foreground">
                        {freqs.map((freq) => (
                          <span key={freq.id} className="rounded bg-muted px-2 py-0.5 text-xs font-medium">
                            {freq.description || freq.type}: {freq.frequency_mhz} MHz
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
