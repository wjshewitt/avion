import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/tanstack/queryKeys';

export interface AirportFilterParams {
  query?: string;
  country?: string | null;
  region?: string | null;
  type?: string | null;
  scheduledService?: boolean;
  minRunwayLength?: number;
  surfaceType?: 'ALL' | 'PAVED' | 'UNPAVED';
  requiresILS?: boolean;
  requiresLighting?: boolean;
  limit?: number;
  offset?: number;
}

export interface FilteredAirport {
  icao: string;
  iata: string;
  name: string;
  city: string;
  state?: string;
  country: string;
  latitude: number;
  longitude: number;
  elevation_ft?: number;
  timezone: string;
  is_corporate_hub: boolean;
  popularity_score: number;
  runway_count: number;
  longest_runway_ft: number;
  classification: any;
  runways: any;
}

export interface AirportFilterResponse {
  success: boolean;
  data: {
    airports: FilteredAirport[];
    pagination: {
      total: number;
      offset: number;
      limit: number;
      hasMore: boolean;
    };
    appliedFilters: AirportFilterParams;
    _meta: {
      queryTime: number;
      cached: boolean;
    };
  };
}

export function useAirportFilter(filters: AirportFilterParams) {
  return useQuery({
    queryKey: queryKeys.airports.filtered(filters),
    queryFn: async (): Promise<AirportFilterResponse> => {
      const response = await fetch('/api/airports/filter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to load airports');
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: true,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: true,
  });
}

export interface FilterOptions {
  countries: string[];
  regionsByCountry: Record<string, string[]>;
  types: Array<{
    value: string;
    label: string;
    count: number;
  }>;
  stats: {
    totalAirports: number;
    lastUpdated: string;
  };
}

export interface FilterOptionsResponse {
  success: boolean;
  data: FilterOptions;
}

export function useFilterOptions() {
  return useQuery({
    queryKey: queryKeys.airports.filterOptions(),
    queryFn: async (): Promise<FilterOptionsResponse> => {
      const response = await fetch('/api/airports/filter-options');
      
      if (!response.ok) {
        throw new Error('Failed to load filter options');
      }
      
      return response.json();
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    // This data rarely changes, don't refetch aggressively
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
