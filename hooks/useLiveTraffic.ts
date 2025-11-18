"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import useSWR from 'swr';
import { TrackedAircraft } from '@/lib/adsb/types';
import { debounce } from 'lodash';
import { useTrafficFilterStore } from '@/lib/adsb/filter-store';
import { filterTraffic } from '@/lib/adsb/filter-logic';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useLiveTraffic(bounds: { north: number, south: number, east: number, west: number } | null) {
  const { filters } = useTrafficFilterStore();
  const [trafficMap, setTrafficMap] = useState<Map<string, TrackedAircraft>>(new Map());
  const [filteredTraffic, setFilteredTraffic] = useState<TrackedAircraft[]>([]);
  const [debouncedBounds, setDebouncedBounds] = useState(bounds);
  
  // Debounce the bounds update to prevent excessive fetching during pan/zoom
  const updateBounds = useCallback(
    debounce((newBounds) => {
      setDebouncedBounds(newBounds);
    }, 500), 
    []
  );

  useEffect(() => {
    if (bounds) updateBounds(bounds);
  }, [bounds, updateBounds]);

  // Only fetch if bounds are available
  const shouldFetch = debouncedBounds 
    ? `/api/tracking/live?bounds=${debouncedBounds.north},${debouncedBounds.south},${debouncedBounds.east},${debouncedBounds.west}` 
    : null;

  const { data, error } = useSWR<TrackedAircraft[]>(
    shouldFetch,
    fetcher,
    {
      refreshInterval: 2000, // Poll every 2 seconds
      dedupingInterval: 1000,
      keepPreviousData: true,
      revalidateOnFocus: false
    }
  );

  // 1. Merge new data into master map (Persistence Layer)
  useEffect(() => {
    if (data) {
      setTrafficMap(prev => {
        const next = new Map(prev);
        const now = Date.now();
        
        // Merge new data
        data.forEach(aircraft => {
          // Preserve existing data if needed, or overwrite
          // We can also smooth data here if we wanted to lerp
          next.set(aircraft.icao24, {
            ...aircraft,
            // Ensure we keep the latest timestamp
            lastContact: Math.max(aircraft.lastContact || 0, now) 
          });
        });

        // Cleanup stale aircraft (older than 60 seconds)
        for (const [id, aircraft] of next.entries()) {
          // lastContact from API is usually epoch seconds or ms
          // Let's assume the API returns consistent time. 
          // If it's missing, we use 'now' from when we received it.
          const lastSeen = aircraft.lastContact || now;
          // 60s timeout
          if (now - lastSeen > 60000) {
            next.delete(id);
          }
        }
        
        return next;
      });
    }
  }, [data]);

  // 2. Apply filters to the master map (Presentation Layer)
  useEffect(() => {
    const allTraffic = Array.from(trafficMap.values());
    const filtered = filterTraffic(allTraffic, filters);
    setFilteredTraffic(filtered);
  }, [trafficMap, filters]);

  return {
    traffic: filteredTraffic,
    isLoading: !data && !error,
    error
  };
}
