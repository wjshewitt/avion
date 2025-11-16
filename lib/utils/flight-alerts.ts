import type { Flight } from "@/lib/supabase/types";

export type FlightAlertSeverity = "info" | "low" | "moderate" | "high" | "critical";

export type FlightAlertCategory =
  | "weather"
  | "operations"
  | "schedule"
  | "system";

export interface FlightAlert {
  id: string;
  flightId: string;
  flightCode: string;
  origin: string;
  destination: string;
  title: string;
  reason: string;
  severity: FlightAlertSeverity;
  category: FlightAlertCategory;
  createdAt: string;
}

export function deriveFlightAlerts(flight: Flight, now: Date = new Date()): FlightAlert[] {
  const alerts: FlightAlert[] = [];

  const base = {
    flightId: flight.id,
    flightCode: flight.code,
    origin: flight.origin,
    destination: flight.destination,
  } as const;

  const createdAt = now.toISOString();

  if (flight.weather_alert_level === "red") {
    alerts.push({
      id: `${flight.id}-weather-critical`,
      ...base,
      title: "Severe weather risk along route",
      reason:
        "Weather systems along the planned route exceed operational thresholds. Review convective activity, icing, and turbulence before departure.",
      severity: "critical",
      category: "weather",
      createdAt,
    });
  } else if (flight.weather_alert_level === "yellow") {
    alerts.push({
      id: `${flight.id}-weather-moderate`,
      ...base,
      title: "Weather degradation on route",
      reason:
        "Conditions at departure, enroute, or destination are degraded. Monitor ceilings, visibility, and wind closely.",
      severity: "moderate",
      category: "weather",
      createdAt,
    });
  }

  const scheduledDeparture = new Date(flight.scheduled_at);
  const departureGraceMinutes = 20;
  const departureThreshold = new Date(
    scheduledDeparture.getTime() + departureGraceMinutes * 60 * 1000,
  );

  if (
    flight.status !== "Cancelled" &&
    flight.status !== "On Time" &&
    flight.status !== "Delayed" &&
    now > departureThreshold
  ) {
    alerts.push({
      id: `${flight.id}-schedule-high`,
      ...base,
      title: "Departure window exceeded",
      reason:
        "Scheduled departure time has passed without an updated status. Confirm crew, aircraft, and slot times.",
      severity: "high",
      category: "schedule",
      createdAt,
    });
  }

  if (flight.status === "Delayed") {
    alerts.push({
      id: `${flight.id}-ops-delayed`,
      ...base,
      title: "Flight delayed",
      reason:
        "This flight is marked as delayed. Review upstream constraints and update downstream legs as required.",
      severity: "moderate",
      category: "operations",
      createdAt,
    });
  }

  if (flight.status === "Cancelled") {
    alerts.push({
      id: `${flight.id}-ops-cancelled`,
      ...base,
      title: "Flight cancelled",
      reason:
        "This flight has been cancelled. Ensure passengers, crew, and downstream schedules are updated.",
      severity: "critical",
      category: "operations",
      createdAt,
    });
  }

  return alerts;
}
