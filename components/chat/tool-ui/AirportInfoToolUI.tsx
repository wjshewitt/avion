"use client";

import { useState } from "react";
import { MapPin, Radio, Ruler, Plane, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Airport {
  icao?: string;
  iata?: string;
  name?: string;
  location?: {
    municipality?: string;
    region?: string;
    country?: string;
  };
  coordinates?: {
    latitude?: number;
    longitude?: number;
    elevation_ft?: number;
  };
  runways?: {
    count?: number;
    longest_ft?: number;
    details?: Array<{
      le_ident?: string;
      he_ident?: string;
      length_ft?: number;
      surface?: string;
    }>;
  };
  communications?: {
    primary_frequencies?: {
      tower?: string;
      ground?: string;
      approach?: string;
    };
  };
  classification?: {
    type?: string;
    size_category?: string;
  };
}

interface AirportInfoToolUIProps {
  result: {
    data?: Airport | Airport[];
    airports?: Airport[];
    [key: string]: any;
  };
}

export function AirportInfoToolUI({ result }: AirportInfoToolUIProps) {
  // Handle both single airport and multiple airports
  const airports = Array.isArray(result.data)
    ? result.data
    : result.airports
    ? result.airports
    : result.data
    ? [result.data]
    : [];

  if (!airports.length) {
    return (
      <div className="text-sm text-muted-foreground border border-border rounded-lg p-3">
        No airport data available
      </div>
    );
  }

  return (
    <div className="space-y-2 max-w-2xl">
      {airports.map((airport, index) => (
        <AirportCard key={index} airport={airport} defaultExpanded={airports.length === 1} />
      ))}
    </div>
  );
}

function AirportCard({ airport, defaultExpanded = false }: { airport: Airport; defaultExpanded?: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-background">
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-blue-500" />
          <div>
            <div className="font-semibold text-sm">
              {airport.icao?.toUpperCase()}
              {airport.iata && ` / ${airport.iata.toUpperCase()}`}
            </div>
            <div className="text-xs text-muted-foreground">
              {airport.name || "Airport Information"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {airport.classification?.type && (
            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-700 dark:text-blue-400">
              {airport.classification.type.replace("_", " ")}
            </span>
          )}
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-border p-3 space-y-3 bg-muted/20">
          {/* Location */}
          {airport.location && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Location</div>
              <div className="text-sm">
                {[
                  airport.location.municipality,
                  airport.location.region,
                  airport.location.country,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {/* Coordinates */}
            {airport.coordinates && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-xs text-muted-foreground">Coordinates</div>
                  <div className="font-mono text-xs">
                    {airport.coordinates.latitude?.toFixed(3)}, {airport.coordinates.longitude?.toFixed(3)}
                  </div>
                  {airport.coordinates.elevation_ft !== undefined && (
                    <div className="text-xs text-muted-foreground">
                      Elev: {airport.coordinates.elevation_ft} ft
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Runways */}
            {airport.runways && (
              <div className="flex items-start gap-2">
                <Ruler className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-xs text-muted-foreground">Runways</div>
                  <div className="font-semibold">
                    {airport.runways.count || 0} total
                  </div>
                  {airport.runways.longest_ft && (
                    <div className="text-xs text-muted-foreground">
                      Longest: {airport.runways.longest_ft.toLocaleString()} ft
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Communications */}
            {airport.communications?.primary_frequencies && (
              <div className="flex items-start gap-2 col-span-2">
                <Radio className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-1">Frequencies</div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {airport.communications.primary_frequencies.tower && (
                      <span className="font-mono">
                        TWR: {airport.communications.primary_frequencies.tower}
                      </span>
                    )}
                    {airport.communications.primary_frequencies.ground && (
                      <span className="font-mono">
                        GND: {airport.communications.primary_frequencies.ground}
                      </span>
                    )}
                    {airport.communications.primary_frequencies.approach && (
                      <span className="font-mono">
                        APP: {airport.communications.primary_frequencies.approach}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Runway Details */}
          {airport.runways?.details && airport.runways.details.length > 0 && (
            <div>
              <div className="text-xs text-muted-foreground mb-2">Runway Details</div>
              <div className="space-y-1">
                {airport.runways.details.slice(0, 3).map((runway, idx) => (
                  <div key={idx} className="text-xs flex items-center gap-2">
                    <span className="font-semibold">
                      {runway.le_ident}/{runway.he_ident}
                    </span>
                    <span className="text-muted-foreground">
                      {runway.length_ft?.toLocaleString()} ft • {runway.surface}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
