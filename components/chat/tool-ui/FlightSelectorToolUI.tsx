"use client";

import { useState } from "react";
import { Plane, Calendar, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { useChatStore } from "@/lib/chat-store";
import { cn } from "@/lib/utils";

interface Flight {
  id: string;
  code?: string;
  route?: string;
  origin_icao?: string;
  destination_icao?: string;
  scheduled_at?: string;
  aircraft?: string;
  status?: string;
  weather_risk_score?: number;
  weather_alert_level?: string;
}

interface FlightSelectorToolUIProps {
  result: {
    data?: {
      flights?: Flight[];
      count?: number;
    };
    flights?: Flight[];
    [key: string]: any;
  };
}

export function FlightSelectorToolUI({ result }: FlightSelectorToolUIProps) {
  const [expanded, setExpanded] = useState(true);
  const { setContext } = useChatStore();

  const flights = result.data?.flights || result.flights || [];
  const count = result.data?.count || flights.length;

  if (!flights.length) {
    return (
      <div className="text-sm text-muted-foreground border border-border p-3">
        No flights found
      </div>
    );
  }

  const handleFlightSelect = (flightId: string) => {
    setContext({
      type: 'flight',
      flightIds: [flightId],
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "On Time":
        return "bg-green-500/20 text-green-700 dark:text-green-400";
      case "Delayed":
        return "bg-amber-500/20 text-amber-700 dark:text-amber-400";
      case "Cancelled":
        return "bg-red-500/20 text-red-700 dark:text-red-400";
      default:
        return "bg-gray-500/20 text-gray-700 dark:text-gray-400";
    }
  };

  const getRiskColor = (score?: number) => {
    if (!score) return "";
    if (score >= 7) return "text-red-600 dark:text-red-400";
    if (score >= 5) return "text-amber-600 dark:text-amber-400";
    return "text-green-600 dark:text-green-400";
  };

  return (
    <div className="border border-border overflow-hidden bg-background max-w-2xl">
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors border-b border-border"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <Plane className="h-5 w-5 text-blue-500" />
          <div>
            <div className="font-semibold text-sm">Available Flights</div>
            <div className="text-xs text-muted-foreground">{count} flight{count !== 1 ? 's' : ''} found</div>
          </div>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </div>

      {/* Flight List */}
      {expanded && (
        <div className="max-h-96 overflow-y-auto">
          {flights.map((flight) => (
            <div
              key={flight.id}
              onClick={() => handleFlightSelect(flight.id)}
              className="p-3 border-b border-border last:border-b-0 hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {/* Route */}
                  <div className="flex items-center gap-2 font-semibold text-sm mb-1">
                    <span>{flight.origin_icao || "???"}</span>
                    <Plane className="h-3 w-3 text-muted-foreground" />
                    <span>{flight.destination_icao || "???"}</span>
                    {flight.code && (
                      <span className="text-muted-foreground font-normal">• {flight.code}</span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-2">
                    {flight.scheduled_at && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(flight.scheduled_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                        {" "}
                        {new Date(flight.scheduled_at).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </div>
                    )}
                    {flight.aircraft && <span>• {flight.aircraft}</span>}
                  </div>

                  {/* Status & Risk */}
                  <div className="flex gap-2">
                    {flight.status && (
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 font-medium",
                          getStatusColor(flight.status)
                        )}
                      >
                        {flight.status}
                      </span>
                    )}
                    {flight.weather_risk_score !== null && flight.weather_risk_score !== undefined && flight.weather_risk_score >= 5 && (
                      <span className="flex items-center gap-1 text-xs">
                        <AlertTriangle className={cn("h-3 w-3", getRiskColor(flight.weather_risk_score))} />
                        <span className={getRiskColor(flight.weather_risk_score)}>
                          Risk {flight.weather_risk_score}/10
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
