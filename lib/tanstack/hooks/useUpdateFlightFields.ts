"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateFlight } from "@/app/actions/flights";
import { queryKeys } from "../queryKeys";
import type { Flight } from "@/lib/supabase/types";

type FlightPatch = {
  id: string;
} & Partial<Pick<
  Flight,
  |
    "code" |
    "origin" |
    "destination" |
    "status" |
    "scheduled_at" |
    "arrival_at" |
    "operator" |
    "aircraft" |
    "notes" |
    "passenger_count" |
    "crew_count"
>>;

/**
 * Standardized mutation hook for updating flight fields.
 * Provides optimistic updates for detail and list caches with rollback on error.
 */
export function useUpdateFlightFields() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (patch: FlightPatch) => updateFlight(patch),
    onMutate: async (patch: FlightPatch) => {
      const { id, ...changes } = patch;

      await qc.cancelQueries({ queryKey: queryKeys.flights.detail(id) });
      await qc.cancelQueries({ queryKey: queryKeys.flights.lists() });

      const previousDetail = qc.getQueryData<Flight>(queryKeys.flights.detail(id));
      const previousList = qc.getQueryData<Flight[]>(queryKeys.flights.lists());

      // Optimistically update detail
      if (previousDetail) {
        qc.setQueryData<Flight>(queryKeys.flights.detail(id), {
          ...previousDetail,
          ...changes,
        });
      }

      // Optimistically update list item
      if (previousList) {
        qc.setQueryData<Flight[]>(
          queryKeys.flights.lists(),
          previousList.map((f) => (f.id === id ? { ...f, ...changes } : f))
        );
      }

      return { previousDetail, previousList, id };
    },
    onError: (_err, _vars, ctx) => {
      if (!ctx) return;
      if (ctx.previousDetail) {
        qc.setQueryData(queryKeys.flights.detail(ctx.id), ctx.previousDetail);
      }
      if (ctx.previousList) {
        qc.setQueryData(queryKeys.flights.lists(), ctx.previousList);
      }
    },
    onSuccess: (result) => {
      if (result.success) {
        qc.invalidateQueries({ queryKey: queryKeys.flights.all });
      }
    },
  });
}
