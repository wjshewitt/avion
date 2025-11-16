"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, MapPin, Plane, Loader2, Compass, TrendingUp, AlertTriangle, ChevronDown } from "lucide-react";
import { useAirport } from "@/lib/tanstack/hooks/useAirports";
import { useAirportFilter, useFilterOptions, type FilteredAirport } from "@/lib/tanstack/hooks/useAirportFilter";
import { useAllAirportsLite } from "@/lib/tanstack/hooks/useAllAirportsLite";
import { getUserFriendlyErrorMessage } from "@/lib/utils/errors";
import type { ProcessedAirportData, ProcessedRunwayData } from "@/types/airportdb";
import type { AirportFilterContext } from "@/types/airport-lite";
import { AirportLocationMap } from "@/components/airports/AirportLocationMap";
import { AirportFilterMap } from "@/components/airports/AirportFilterMap";
import { GrooveSelect } from "@/components/ui/groove-select";
import { AirportFilterErrorBoundary } from "@/components/airports/AirportFilterErrorBoundary";

const DEFAULT_LIMIT = 50;
const MAP_LIMIT = 200;
type SurfaceType = 'ALL' | 'PAVED' | 'UNPAVED';

type FilterState = {
  query: string;
  country: string | null;
  region: string | null;
  type: string | null;
  minRunwayLength: number;
  surfaceType: SurfaceType;
  requiresILS: boolean;
  requiresLighting: boolean;
  scheduledService: boolean;
  limit: number;
  offset: number;
};

const parseFiltersFromParams = (params: ReadonlyURLSearchParams): FilterState => {
  const toNullable = (value: string | null) => (value && value.length ? value : null);
  const parseNumber = (key: string, fallback: number) => {
    const value = params.get(key);
    if (!value) return fallback;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };
  const surfaceRaw = params.get('surface');
  const surface: SurfaceType = surfaceRaw === 'PAVED' || surfaceRaw === 'UNPAVED' ? surfaceRaw : 'ALL';

  const limit = Math.min(200, Math.max(1, parseNumber('limit', DEFAULT_LIMIT)));
  const offset = Math.max(0, parseNumber('offset', 0));

  return {
    query: params.get('query') ?? '',
    country: toNullable(params.get('country')),
    region: toNullable(params.get('region')),
    type: toNullable(params.get('type')),
    minRunwayLength: parseNumber('minRunway', 0),
    surfaceType: surface,
    requiresILS: params.get('ils') === 'true',
    requiresLighting: params.get('lighting') === 'true',
    scheduledService: params.get('scheduled') === 'true',
    limit,
    offset,
  };
};

const filtersEqual = (a: FilterState, b: FilterState) => (
  a.query === b.query &&
  a.country === b.country &&
  a.region === b.region &&
  a.type === b.type &&
  a.minRunwayLength === b.minRunwayLength &&
  a.surfaceType === b.surfaceType &&
  a.requiresILS === b.requiresILS &&
  a.requiresLighting === b.requiresLighting &&
  a.scheduledService === b.scheduledService &&
  a.limit === b.limit &&
  a.offset === b.offset
);

const surfaceOptions = [
  { value: 'ALL', label: 'All Surfaces' },
  { value: 'PAVED', label: 'Paved Only' },
  { value: 'UNPAVED', label: 'Unpaved Only' },
] as const;

function AirportsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<FilterState>(() => parseFiltersFromParams(searchParams));
  const [selectedIcao, setSelectedIcao] = useState<string | null>('KJFK');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [viewMode, setViewMode] = useState<'directory' | 'map'>('directory');
  const listLimitRef = useRef(filters.limit ?? DEFAULT_LIMIT);

  const {
    data: airportLiteData,
    isLoading: isLoadingAllAirports,
  } = useAllAirportsLite(viewMode === 'map');
  const analyticsSignature = useRef<string>('');

  const { data: filterOptionsResponse, isLoading: isLoadingFilterOptions, isError: isFilterOptionsError } = useFilterOptions();
  const filterOptions = filterOptionsResponse?.data;

  useEffect(() => {
    const next = parseFiltersFromParams(searchParams);
    setFilters((prev) => (filtersEqual(prev, next) ? prev : next));
  }, [searchParams]);

  useEffect(() => {
    if (viewMode === 'map') {
      if (filters.limit !== MAP_LIMIT) {
        listLimitRef.current = filters.limit ?? DEFAULT_LIMIT;
        setFilters((prev) => ({ ...prev, limit: MAP_LIMIT, offset: 0 }));
      }
    } else if (filters.limit === MAP_LIMIT) {
      const fallbackLimit = listLimitRef.current || DEFAULT_LIMIT;
      setFilters((prev) => ({ ...prev, limit: fallbackLimit, offset: 0 }));
    }
  }, [filters.limit, viewMode]);

  const syncFiltersToUrl = useCallback((state: FilterState) => {
    const params = new URLSearchParams();
    const trimmedQuery = state.query.trim();
    if (trimmedQuery.length >= 2) params.set('query', trimmedQuery);
    if (state.country) params.set('country', state.country);
    if (state.region) params.set('region', state.region);
    if (state.type) params.set('type', state.type);
    if (state.minRunwayLength > 0) params.set('minRunway', String(state.minRunwayLength));
    if (state.surfaceType !== 'ALL') params.set('surface', state.surfaceType);
    if (state.requiresILS) params.set('ils', 'true');
    if (state.requiresLighting) params.set('lighting', 'true');
    if (state.scheduledService) params.set('scheduled', 'true');
    if (state.limit !== DEFAULT_LIMIT) params.set('limit', String(state.limit));
    if (state.offset > 0) params.set('offset', String(state.offset));
    const nextUrl = params.toString() ? `${pathname}?${params}` : pathname;
    router.push(nextUrl, { scroll: false });
  }, [pathname, router]);

  useEffect(() => {
    const timer = setTimeout(() => syncFiltersToUrl(filters), 500);
    return () => clearTimeout(timer);
  }, [filters, syncFiltersToUrl]);

  const sanitizedFilters = useMemo(() => ({
    query: filters.query.trim().length >= 2 ? filters.query.trim() : undefined,
    country: filters.country ?? undefined,
    region: filters.region ?? undefined,
    type: filters.type ?? undefined,
    minRunwayLength: filters.minRunwayLength > 0 ? filters.minRunwayLength : undefined,
    surfaceType: filters.surfaceType,
    requiresILS: filters.requiresILS ? true : undefined,
    requiresLighting: filters.requiresLighting ? true : undefined,
    scheduledService: filters.scheduledService ? true : undefined,
    limit: filters.limit,
    offset: filters.offset,
  }), [filters]);

  const deckDataset = airportLiteData?.dataset;

  const filterContext = useMemo<AirportFilterContext>(() => ({
    query: filters.query.trim().length >= 2 ? filters.query.trim() : undefined,
    country: filters.country,
    region: filters.region,
    type: filters.type as AirportFilterContext["type"],
    scheduledService: filters.scheduledService,
    minRunwayLength: filters.minRunwayLength || undefined,
    surfaceType: filters.surfaceType,
    requiresILS: filters.requiresILS,
    requiresLighting: filters.requiresLighting,
    selectedIcao,
  }), [filters, selectedIcao]);

  const {
    data: airportListResponse,
    isLoading: isLoadingAirports,
    isFetching: isFetchingAirports,
    isError: isAirportsError,
    error: airportsError,
    refetch: refetchAirports,
  } = useAirportFilter(sanitizedFilters);

  const airportsData = airportListResponse?.data.airports;
  const filteredAirports = useMemo(() => airportsData ?? [], [airportsData]);
  const pagination = airportListResponse?.data.pagination;
  const queryMeta = airportListResponse?.data._meta;

  const {
    data: airportDetail,
    isLoading: isLoadingDetail,
    isError: isDetailError,
    error: detailError,
  } = useAirport(selectedIcao ?? '', { enabled: Boolean(selectedIcao) });

  useEffect(() => {
    if (!filteredAirports.length) {
      setSelectedIcao(null);
      return;
    }
    if (selectedIcao && filteredAirports.some((airport) => airport.icao === selectedIcao)) {
      return;
    }
    setSelectedIcao(filteredAirports[0].icao);
  }, [filteredAirports, selectedIcao]);

  const hasFilterSelections = Boolean(
    filters.country ||
    filters.region ||
    filters.type ||
    filters.minRunwayLength > 0 ||
    filters.surfaceType !== 'ALL' ||
    filters.requiresILS ||
    filters.requiresLighting ||
    filters.scheduledService
  );

  const handleClearFilters = () => {
    setFilters((prev) => ({
      ...prev,
      country: null,
      region: null,
      type: null,
      minRunwayLength: 0,
      surfaceType: 'ALL',
      requiresILS: false,
      requiresLighting: false,
      scheduledService: false,
      offset: 0,
    }));
  };

  const handleLoadMore = () => {
    if (!pagination?.hasMore) return;
    setFilters((prev) => ({ ...prev, offset: prev.offset + prev.limit }));
  };

  const totalShown = filters.offset + filteredAirports.length;
  const totalAvailable = pagination?.total ?? 0;
  const ariaStatus = (isLoadingAirports || isFetchingAirports)
    ? 'Loading airports'
    : `Showing ${totalShown} of ${totalAvailable} airports`;

  const countryOptions = filterOptions?.countries ?? [];
  const regionOptions = filters.country ? filterOptions?.regionsByCountry?.[filters.country] ?? [] : [];
  const typeOptions = filterOptions?.types ?? [];

  const handleQueryChange = (next: string) => {
    setFilters((prev) => ({ ...prev, query: next, offset: 0 }));
  };

  const handleCountryChange = (value: string) => {
    setFilters((prev) => {
      const normalized = value || null;
      return {
        ...prev,
        country: normalized,
        region: normalized && normalized === prev.country ? prev.region : null,
        offset: 0,
      };
    });
  };

  const handleRegionChange = (value: string) => {
    setFilters((prev) => ({ ...prev, region: value || null, offset: 0 }));
  };

  const handleTypeChange = (value: string) => {
    setFilters((prev) => ({ ...prev, type: value || null, offset: 0 }));
  };

  const handleSurfaceChange = (value: SurfaceType) => {
    setFilters((prev) => ({ ...prev, surfaceType: value, offset: 0 }));
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!hasFilterSelections) return;
    if (!filteredAirports.length) return;

    const signature = JSON.stringify({
      country: filters.country,
      region: filters.region,
      type: filters.type,
      minRunwayLength: filters.minRunwayLength,
      surfaceType: filters.surfaceType,
      requiresILS: filters.requiresILS,
      requiresLighting: filters.requiresLighting,
      scheduledService: filters.scheduledService,
      resultCount: filteredAirports.length,
    });

    if (analyticsSignature.current === signature) return;
    analyticsSignature.current = signature;

    try {
      (window as any)?.analytics?.track?.('airport_filters_applied', {
        filters: {
          country: Boolean(filters.country),
          region: Boolean(filters.region),
          type: Boolean(filters.type),
          minRunway: filters.minRunwayLength > 0,
          surface: filters.surfaceType,
          ils: filters.requiresILS,
          lighting: filters.requiresLighting,
          scheduledService: filters.scheduledService,
        },
        resultCount: filteredAirports.length,
      });
    } catch (error) {
      console.warn('[airports] analytics tracking failed', error);
    }
  }, [filteredAirports, filters, hasFilterSelections]);

  const isSidebarLoading = isLoadingAirports || isFetchingAirports;

  return (
    <div className="flex h-full flex-1 overflow-hidden bg-background text-foreground">
      <div className="w-full max-w-sm border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Airport Directory</h1>
        </div>

        <AirportFilterErrorBoundary>
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="flex items-center bg-muted/30 border border-border rounded-sm px-4 py-2.5 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.1)] dark:shadow-[inset_1px_1px_3px_rgba(0,0,0,0.3)] focus-within:border-blue/50 transition-colors">
                <Search size={16} strokeWidth={1.5} className="text-blue/60" />
                <input
                  type="text"
                  value={filters.query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  placeholder="Search by ICAO, IATA, or Name"
                  className="w-full bg-transparent pl-3 border-none text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0"
                  aria-label="Search airports"
                />
              </div>
            </div>

            <div className="px-4 pt-2 pb-3 border-b border-border">
              <div className="rounded-sm border border-border bg-muted/20 p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Filters</span>
                  {hasFilterSelections && (
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="text-[10px] font-mono uppercase tracking-[0.2em] text-blue hover:text-blue/80 focus:outline-none"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Country</div>
                    <GrooveSelect
                      value={filters.country ?? ''}
                      onChange={handleCountryChange}
                      options={[
                        { value: '', label: 'All Countries' },
                        ...countryOptions.map((country) => ({ value: country, label: country })),
                      ]}
                      placeholder={isLoadingFilterOptions ? 'Loading countries...' : 'All countries'}
                      variant="ceramic"
                      aria-label="Filter by country"
                      disabled={isLoadingFilterOptions}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Type</div>
                    <GrooveSelect
                      value={filters.type ?? ''}
                      onChange={handleTypeChange}
                      options={[
                        { value: '', label: 'All Types' },
                        ...typeOptions.map(({ value, label }) => ({ value, label })),
                      ]}
                      placeholder="All types"
                      variant="ceramic"
                      aria-label="Filter by type"
                    />
                  </div>

                  {filters.country && (
                    <div className="space-y-1">
                      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Region</div>
                      <GrooveSelect
                        value={filters.region ?? ''}
                        onChange={handleRegionChange}
                        options={[
                          { value: '', label: 'All Regions' },
                          ...regionOptions.map((region) => ({ value: region, label: region })),
                        ]}
                        placeholder="All regions"
                        variant="ceramic"
                        aria-label="Filter by region"
                        disabled={!regionOptions.length}
                      />
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced((prev) => !prev)}
                    className="flex items-center justify-between w-full text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
                    aria-expanded={showAdvanced}
                  >
                    <span>Advanced</span>
                    <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} strokeWidth={1.5} />
                  </button>
                </div>

                {showAdvanced && (
                  <div className="space-y-3 pt-2">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Min Runway Length</label>
                      <input
                        type="range"
                        min="0"
                        max="15000"
                        step="500"
                        value={filters.minRunwayLength}
                        onChange={(e) => setFilters((prev) => ({ ...prev, minRunwayLength: Number(e.target.value), offset: 0 }))}
                        className="w-full h-2 bg-zinc-200 dark:bg-[#333] rounded-sm appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#F04E30] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg"
                        aria-label="Minimum runway length"
                      />
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-muted-foreground">0 ft</span>
                        <span className="text-foreground font-semibold">
                          {filters.minRunwayLength > 0 ? `${filters.minRunwayLength.toLocaleString()} ft` : 'Any'}
                        </span>
                        <span className="text-muted-foreground">15,000 ft</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Surface</div>
                      <GrooveSelect
                        value={filters.surfaceType}
                        onChange={(value) => handleSurfaceChange(value as SurfaceType)}
                        options={surfaceOptions}
                        variant="ceramic"
                        aria-label="Filter by surface type"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-1">Capabilities</div>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.requiresILS}
                          onChange={(e) => setFilters((prev) => ({ ...prev, requiresILS: e.target.checked, offset: 0 }))}
                          className="w-4 h-4 rounded border-zinc-300 dark:border-[#333] text-[#F04E30] focus:ring-[#F04E30]"
                        />
                        <span className="text-sm text-foreground">ILS Equipped</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.requiresLighting}
                          onChange={(e) => setFilters((prev) => ({ ...prev, requiresLighting: e.target.checked, offset: 0 }))}
                          className="w-4 h-4 rounded border-zinc-300 dark:border-[#333] text-[#F04E30] focus:ring-[#F04E30]"
                        />
                        <span className="text-sm text-foreground">Runway Lighting</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.scheduledService}
                          onChange={(e) => setFilters((prev) => ({ ...prev, scheduledService: e.target.checked, offset: 0 }))}
                          className="w-4 h-4 rounded border-zinc-300 dark:border-[#333] text-[#F04E30] focus:ring-[#F04E30]"
                        />
                        <span className="text-sm text-foreground">Scheduled Service</span>
                      </label>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-border text-xs font-mono text-muted-foreground flex items-center justify-between">
                  <span>Showing {totalShown.toLocaleString()} / {totalAvailable.toLocaleString()}</span>
                  {queryMeta?.queryTime !== undefined && (
                    <span className="text-[10px] uppercase tracking-[0.2em]">{queryMeta.queryTime} ms</span>
                  )}
                </div>

                {isFilterOptionsError && (
                  <p className="text-[11px] text-amber-600">Unable to load filter options. Using cached values.</p>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3" aria-live="polite" aria-busy={isSidebarLoading}>
              {isAirportsError ? (
                <ErrorState error={airportsError} onRetry={refetchAirports} />
              ) : isSidebarLoading && !filteredAirports.length ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <div key={idx} className="animate-pulse rounded-sm border border-border bg-muted/40 p-4 h-16" />
                  ))}
                </div>
              ) : filteredAirports.length === 0 ? (
                <EmptyState onReset={handleClearFilters} />
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2 px-2">
                    <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">Results</div>
                    {hasFilterSelections && (
                      <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-blue/80">Filtered</div>
                    )}
                  </div>
                  {filteredAirports.map((airport) => (
                    <AirportListItem
                      key={airport.icao}
                      airport={airport}
                      isSelected={selectedIcao === airport.icao}
                      onSelect={() => setSelectedIcao(airport.icao)}
                    />
                  ))}
                  {pagination?.hasMore && (
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      className="w-full rounded-sm border border-border bg-muted/30 px-4 py-2 text-[12px] font-mono uppercase tracking-[0.2em] text-muted-foreground hover:bg-muted/50"
                    >
                      Load more
                    </button>
                  )}
                </>
              )}
              <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
                {ariaStatus}
              </div>
            </div>
          </div>
        </AirportFilterErrorBoundary>
      </div>

      <div className="flex-1 bg-muted/20">
        <div className="flex flex-col h-full">
          <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">View Mode</p>
              <h2 className="text-lg font-semibold text-foreground">Airport Intelligence</h2>
            </div>
            <div className="inline-flex overflow-hidden rounded-sm border border-border">
              {(['directory', 'map'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 text-[11px] font-mono uppercase tracking-[0.2em] ${
                    viewMode === mode
                      ? 'bg-[color:var(--accent-primary)]/15 text-foreground'
                      : 'bg-background text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {mode === 'directory' ? 'Directory' : 'Map'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 sm:p-6">
            {viewMode === 'directory' ? (
              !selectedIcao ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                  <Plane className="mb-4 h-12 w-12 text-[color:var(--accent-primary)]/50" strokeWidth={1.5} />
                  <h2 className="text-lg font-semibold text-foreground">Select an Airport</h2>
                  <p className="mt-2 max-w-sm text-sm">Choose an airport from the list to see its detailed information.</p>
                </div>
              ) : isLoadingDetail ? (
                <div className="flex h-full flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-[color:var(--accent-primary)]" strokeWidth={1.5} />
                </div>
              ) : isDetailError ? (
                <ErrorState error={detailError} onRetry={() => {}} />
              ) : airportDetail ? (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <AirportHeader airport={airportDetail} />
                  <RunwayDetails runways={airportDetail.runways} />
                </div>
              ) : null
            ) : (
              <AirportFilterMap
                dataset={deckDataset}
                filteredAirports={filteredAirports}
                filterContext={filterContext}
                selectedIcao={selectedIcao}
                onSelect={(icao) => setSelectedIcao(icao)}
                isDatasetLoading={isLoadingAllAirports}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const AirportListItem = ({ airport, isSelected, onSelect }: { airport: FilteredAirport; isSelected: boolean; onSelect: () => void }) => (
  <button
    onClick={onSelect}
    className={`w-full p-3 text-left rounded-sm transition-colors duration-150 border ${
      isSelected 
        ? 'bg-[color:var(--accent-primary)]/10 border-[color:var(--accent-primary)]/50' 
        : 'border-transparent hover:bg-muted/40'
    }`}
  >
    <div className="flex items-center justify-between">
      <p className="font-mono text-sm font-medium text-foreground tabular-nums">{airport.icao}</p>
      <p className="text-xs text-muted-foreground">{airport.country}</p>
    </div>
    <p className="text-sm font-semibold text-foreground/90 truncate">{airport.name}</p>
  </button>
);

const ErrorState = ({ error, onRetry }: { error: any, onRetry: () => void }) => (
  <div className="bg-card border border-destructive/40 rounded-sm p-6 text-destructive">
    <div className="flex items-center gap-3">
      <AlertTriangle className="h-5 w-5" strokeWidth={1.5} />
      <div>
        <h3 className="font-semibold">Unable to retrieve airport data</h3>
        <p className="text-sm text-destructive/90">{getUserFriendlyErrorMessage(error)}</p>
      </div>
      <button 
        onClick={onRetry} 
        className="ml-auto bg-destructive/20 text-destructive px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wide hover:bg-destructive/30 transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)] focus:ring-offset-2 focus:ring-offset-background"
      >
        Retry
      </button>
    </div>
  </div>
);

const EmptyState = ({ onReset }: { onReset: () => void }) => (
  <div className="flex flex-col items-center justify-center rounded-sm border border-dashed border-border bg-muted/30 px-4 py-10 text-center text-sm text-muted-foreground">
    <p>No airports match your filters.</p>
    <button
      type="button"
      onClick={onReset}
      className="mt-4 rounded-sm border border-border bg-background px-4 py-2 text-[11px] font-mono uppercase tracking-[0.2em] text-blue hover:bg-muted/40"
    >
      Clear filters
    </button>
  </div>
);

const AirportHeader = ({ airport }: { airport: ProcessedAirportData }) => {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const uniqueRunways = useMemo(
    () => getUniqueRunways(airport.runways?.details),
    [airport.runways?.details]
  );
  const runwayCount = uniqueRunways.length || airport.runways.count || 0;

  // Determine airport type color (subtle accent)
  const getTypeColor = (type: string) => {
    if (type.includes('large')) return 'text-blue';
    if (type.includes('medium')) return 'text-amber';
    if (type.includes('small')) return 'text-green';
    return 'text-muted-foreground';
  };

  // Validate coordinates for map display
  const hasValidCoordinates = 
    airport.coordinates.latitude !== 0 && 
    airport.coordinates.longitude !== 0 &&
    !isNaN(airport.coordinates.latitude) &&
    !isNaN(airport.coordinates.longitude) &&
    airport.coordinates.latitude >= -90 &&
    airport.coordinates.latitude <= 90 &&
    airport.coordinates.longitude >= -180 &&
    airport.coordinates.longitude <= 180;

  return (
    <div className="bg-card border border-border rounded-sm p-6 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-blue/70">
            {airport.icao}{airport.iata && ` / ${airport.iata}`}
          </div>
          <h2 className="text-xl font-medium text-foreground mt-2">{airport.name}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {airport.location.municipality}, {airport.location.country}
          </p>
        </div>
        <div className="text-right">
          <div className="font-mono text-sm text-foreground/80 tabular-nums">
            Elev: {airport.coordinates.elevation_ft?.toLocaleString() ?? 'N/A'} ft
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-6 border-t border-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricDisplay 
          icon={MapPin} 
          label="Coordinates" 
          value={`${airport.coordinates.latitude.toFixed(4)}, ${airport.coordinates.longitude.toFixed(4)}`}
          color="blue"
        />
        <MetricDisplay 
          icon={Compass} 
          label="Runways" 
          value={`${runwayCount} runway${runwayCount !== 1 ? 's' : ''}`}
          color="amber"
        />
        <MetricDisplay 
          icon={TrendingUp} 
          label="Type" 
          value={airport.classification.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          color={getTypeColor(airport.classification.type)}
        />
      </div>

      {/* View on Map Button - Only show if coordinates are valid */}
      {hasValidCoordinates && (
        <div className="mt-4 pt-4 border-t border-border">
          <button
            onClick={() => setIsMapOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue/10 border border-blue/30 text-blue hover:bg-blue/20 rounded-sm transition-colors text-sm font-medium"
          >
            <MapPin size={16} strokeWidth={1.5} />
            View on Map
          </button>
        </div>
      )}

      {/* Draggable Map Modal */}
      {hasValidCoordinates && (
        <AirportLocationMap
          latitude={airport.coordinates.latitude}
          longitude={airport.coordinates.longitude}
          icao={airport.icao}
          name={airport.name}
          isOpen={isMapOpen}
          onClose={() => setIsMapOpen(false)}
        />
      )}
    </div>
  );
};

const RunwayDetails = ({ runways }: { runways: ProcessedAirportData['runways'] }) => {
  const runwayDetails = useMemo(
    () => getUniqueRunways(runways?.details),
    [runways?.details]
  );

  if (!runways || runwayDetails.length === 0) {
    return (
      <div className="bg-card border border-dashed border-border rounded-sm p-12 text-center">
        <p className="text-sm text-muted-foreground">No runway data available for this airport.</p>
      </div>
    );
  }

  // Backend already deduplicated by runway ends (le_ident + he_ident)
  // Each runway in details represents one physical runway with both ends

  return (
    <div className="bg-card border border-border rounded-sm p-6 shadow-sm">
      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-4">Runways</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {runwayDetails.map((runway, idx) => (
          <div key={`${runway.airport_ident}-${runway.runway_designation}-${idx}`} className="bg-muted/30 border border-border rounded-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-mono font-semibold text-base text-foreground">
                Runway {runway.runway_designation}
              </h3>
              {runway.lighted && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-amber/10 text-amber text-[10px] font-mono uppercase tracking-wider border border-amber/20">
                  LIT
                </span>
              )}
            </div>
            <div className="space-y-2 text-sm">
              <RunwayMetric 
                label="Length" 
                value={`${runway.length_ft.toLocaleString()} ft / ${Math.round(runway.length_ft * 0.3048).toLocaleString()} m`} 
              />
              <RunwayMetric 
                label="Width" 
                value={`${runway.width_ft.toLocaleString()} ft / ${Math.round(runway.width_ft * 0.3048).toLocaleString()} m`} 
              />
              <RunwayMetric label="Surface" value={runway.surface} />
              <RunwayMetric label="True Heading" value={`${runway.true_heading}°`} />
              {runway.ils_approaches.length > 0 && (
                <div className="mt-3 pt-2 border-t border-border">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-green/10 text-green text-[10px] font-mono uppercase tracking-wider border border-green/20">
                    ILS {runway.ils_approaches.length}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MetricDisplay = ({ icon: Icon, label, value, color = 'muted-foreground' }: { 
  icon: React.ElementType, 
  label: string, 
  value: string,
  color?: string 
}) => (
  <div className="flex items-start gap-3">
    <Icon className={`h-5 w-5 text-${color}/60 mt-0.5`} strokeWidth={1.5} />
    <div>
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="text-base font-mono font-medium text-foreground tabular-nums mt-1">{value}</div>
    </div>
  </div>
);

const RunwayMetric = ({ label, value }: { label: string, value: string }) => (
  <div className="flex justify-between items-center">
    <span className="text-muted-foreground">{label}:</span>
    <span className="font-mono text-foreground tabular-nums">{value}</span>
  </div>
);

function getUniqueRunways(details?: ProcessedRunwayData[]): ProcessedRunwayData[] {
  if (!details || details.length === 0) return [];

  const normalizeIdent = (value?: string | null) =>
    value?.replace(/\s+/g, "").toUpperCase() ?? "";

  const seen = new Map<string, ProcessedRunwayData>();

  details.forEach((runway) => {
    const designationParts = runway.runway_designation
      ? runway.runway_designation.split("/").map((part) => normalizeIdent(part))
      : [normalizeIdent(runway.le_ident), normalizeIdent(runway.he_ident)];

    const endsKey = designationParts
      .filter(Boolean)
      .sort()
      .join("-") || normalizeIdent(runway.runway_designation) || runway.id;

    const key = `${endsKey}:${runway.length_ft}:${runway.width_ft}:${runway.surface}`;

    if (!seen.has(key)) {
      seen.set(key, runway);
    }
  });

  return Array.from(seen.values());
}

// Export wrapped in Suspense for useSearchParams
export default function AirportsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[color:var(--accent-primary)]" strokeWidth={1.5} />
      </div>
    }>
      <AirportsPageContent />
    </Suspense>
  );
}
