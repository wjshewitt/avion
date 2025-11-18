"use client";

import { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import { TrackedAircraft } from '@/lib/adsb/types';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useLiveTraffic(bounds: { north: number, south: number, east: number, west: number } | null) {
  const [traffic, setTraffic] = useState<TrackedAircraft[]>([]);

  // Only fetch if bounds are available
  const shouldFetch = bounds ? `/api/tracking/live?bounds=${bounds.north},${bounds.south},${bounds.east},${bounds.west}` : null;

  const { data, error } = useSWR<TrackedAircraft[]>(
    shouldFetch,
    fetcher,
    {
      refreshInterval: 2000, // Poll every 2 seconds
      dedupingInterval: 1000,
      keepPreviousData: true
    }
  );

  useEffect(() => {
    if (data) {
      setTraffic(data);
    }
  }, [data]);

  return {
    traffic,
    isLoading: !data && !error,
    error
  };
}
