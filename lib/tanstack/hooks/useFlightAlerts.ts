"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import type { FlightAlert, FlightAlertSeverity } from "@/lib/utils/flight-alerts";

interface UseFlightAlertsOptions {
  severity?: FlightAlertSeverity[];
  enabled?: boolean;
}

export function useFlightAlerts(options?: UseFlightAlertsOptions) {
  const params = new URLSearchParams();

  if (options?.severity?.length) {
    params.set("severity", options.severity.join(","));
  }

  return useQuery<FlightAlert[]>({
    queryKey: queryKeys.flightAlerts.list({ severity: options?.severity }),
    queryFn: async () => {
      const res = await fetch(`/api/flights/alerts?${params.toString()}`, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to load flight alerts");
      }

      const json = await res.json();
      return (json.alerts ?? []) as FlightAlert[];
    },
    enabled: options?.enabled ?? true,
  });
}
