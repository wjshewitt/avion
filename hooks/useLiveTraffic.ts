"use client";

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrackedAircraft } from '@/lib/adsb/types';
import { useDebounce } from '@/hooks/use-debounce';
import { useTrafficFilterStore } from '@/lib/adsb/filter-store';
import { filterTraffic } from '@/lib/adsb/filter-logic';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch traffic');
  return res.json() as Promise<TrackedAircraft[]>;
};

export function useLiveTraffic(bounds: { north: number, south: number, east: number, west: number } | null) {
  const { filters } = useTrafficFilterStore();
  const [trafficMap, setTrafficMap] = useState<Map<string, TrackedAircraft>>(new Map());
  
  // Debounce the bounds to prevent excessive fetching
  const debouncedBounds = useDebounce(bounds, 500);

  // Construct URL only when bounds are valid
  const url = debouncedBounds 
    ? `/api/tracking/live?bounds=${debouncedBounds.north},${debouncedBounds.south},${debouncedBounds.east},${debouncedBounds.west}` 
    : null;

  const { data, error, isLoading } = useQuery({
    queryKey: ['live-traffic', debouncedBounds],
    queryFn: () => fetcher(url!),
    enabled: !!url,
    refetchInterval: 2000,
    staleTime: 1000,
  });

  // 1. Merge new data into master map (Persistence Layer)
  useEffect(() => {
    if (data) {
      setTrafficMap(prev => {
        const next = new Map(prev);
        const now = Date.now();
        
        // Merge new data
        data.forEach(aircraft => {
          // Normalize timestamp if it looks like seconds (year 1970-2286)
          let lastContact = aircraft.lastContact || now;
          if (lastContact < 10000000000) {
             lastContact *= 1000;
          }

          next.set(aircraft.icao24, {
            ...aircraft,
            // Keep the latest timestamp, ensuring we don't regress
            lastContact: Math.max(lastContact, now) 
          });
        });

        // Cleanup stale aircraft (older than 60 seconds)
        for (const [id, aircraft] of next.entries()) {
          if (now - aircraft.lastContact > 60000) {
            next.delete(id);
          }
        }
        
        return next;
      });
    }
  }, [data]);

  // 2. Apply filters
  const filteredTraffic = useMemo(() => {
     const allTraffic = Array.from(trafficMap.values());
     return filterTraffic(allTraffic, filters);
  }, [trafficMap, filters]);

  return {
    traffic: filteredTraffic,
    isLoading: isLoading && trafficMap.size === 0, // Only show loading if we have no data at all
    error
  };
}
