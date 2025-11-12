"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "../queryKeys";
import { logErrorWithContext } from "@/lib/utils/errors";
import type { Flight } from "@/lib/supabase/types";

/**
 * Hook to fetch all flights for the current authenticated user
 * Ordered by scheduled_at descending
 * RLS policies automatically filter to show only user's own flights
 */
export function useFlights() {
  const supabase = createClient();

  return useQuery({
    queryKey: queryKeys.flights.lists(),
    queryFn: async (): Promise<Flight[]> => {
      const { data, error } = await supabase
        .from("user_flights")
        .select("*")
        .order("scheduled_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    },
    meta: {
      onError: (error: unknown) => {
        logErrorWithContext(error, {
          operation: "useFlights",
          queryKey: [...queryKeys.flights.lists()],
        });
      },
    },
  });
}

/**
 * Hook to fetch a single flight by ID for the current authenticated user
 * RLS policies ensure users can only access their own flights
 * Query is only enabled when id is provided
 */
export function useFlight(id: string | undefined) {
  const supabase = createClient();

  return useQuery({
    queryKey: queryKeys.flights.detail(id || ""),
    queryFn: async (): Promise<Flight> => {
      if (!id) {
        throw new Error("Flight ID is required");
      }

      const { data, error } = await supabase
        .from("user_flights")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    enabled: !!id,
    meta: {
      onError: (error: unknown) => {
        logErrorWithContext(error, {
          operation: "useFlight",
          queryKey: [...queryKeys.flights.detail(id || "")],
          params: { id },
        });
      },
    },
  });
}
