import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/tanstack/queryKeys";
import type { AirportLiteResponse } from "@/types/airport-lite";
import { createAirportLiteDeckDataset } from "@/lib/airports/airport-lite-utils";

export function useAllAirportsLite(enabled = true) {
  return useQuery({
    queryKey: queryKeys.airports.allLite(),
    enabled,
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    queryFn: async () => {
      const response = await fetch("/api/airports/all-lite", {
        headers: { "Content-Type": "application/json" },
        cache: "force-cache",
      });

      if (!response.ok) {
        throw new Error("Failed to load airport dataset");
      }

      const json = (await response.json()) as AirportLiteResponse;
      const dataset = createAirportLiteDeckDataset(json.data.airports);

      return {
        dataset,
        updatedAt: json.data.updatedAt,
        total: json.data.total,
      };
    },
  });
}
