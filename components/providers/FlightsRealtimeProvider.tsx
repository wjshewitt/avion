"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/tanstack/queryKeys";
import type { Flight } from "@/lib/supabase/types";

/**
 * Subscribes to Supabase realtime changes for the current user's flights
 * and keeps TanStack Query caches (list + detail) in sync across the app.
 */
export function FlightsRealtimeProvider() {
  const qc = useQueryClient();

  useEffect(() => {
    const sb = createClient();
    let isMounted = true;

    const subscribe = async () => {
      const { data: auth } = await sb.auth.getUser();
      const userId = auth.user?.id;

      // If no user, skip subscribing
      if (!userId || !isMounted) return;

      const channel = sb
        .channel("realtime:user_flights")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "user_flights",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const row = (payload.new || payload.old) as Flight | undefined;
            if (!row?.id) return;

            // Update detail cache opportunistically
            qc.setQueryData(queryKeys.flights.detail(row.id), (prev: Flight | undefined) => {
              if (payload.eventType === "DELETE") return undefined;
              return { ...(prev || {} as Flight), ...(payload.new as Flight) } as Flight;
            });

            // Update list cache opportunistically
            qc.setQueryData(queryKeys.flights.lists(), (prev: Flight[] | undefined) => {
              if (!prev) return prev;
              if (payload.eventType === "DELETE") {
                return prev.filter((f) => f.id !== row.id);
              }
              const exists = prev.some((f) => f.id === row.id);
              if (exists) return prev.map((f) => (f.id === row.id ? ({ ...f, ...(payload.new as Flight) }) : f));
              return [payload.new as Flight, ...prev];
            });

            // Ensure eventual consistency
            qc.invalidateQueries({ queryKey: queryKeys.flights.all });
          }
        )
        .subscribe();

      return () => {
        sb.removeChannel(channel);
      };
    };

    const unsubPromise = subscribe();
    return () => {
      isMounted = false;
      void unsubPromise?.then((cleanup) => {
        cleanup?.();
      });
    };
  }, [qc]);

  return null;
}
