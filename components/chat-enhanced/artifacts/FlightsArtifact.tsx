'use client';

import { Plane, Calendar, Clock, MapPin, Users, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Flight {
  id: string;
  flight_number?: string;
  code?: string;
  origin?: string;
  destination?: string;
  departure_time?: string;
  arrival_time?: string;
  status?: string;
  aircraft_type?: string;
  pilot?: string;
}

interface FlightsArtifactProps {
  data: Flight[] | { flights: Flight[] };
}

export function FlightsArtifact({ data }: FlightsArtifactProps) {
  const flights = Array.isArray(data) ? data : data.flights || [];

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-6 py-6 border-b border-border bg-card/50">
        <h1 className="text-2xl font-mono font-bold tracking-tight text-foreground flex items-center gap-3">
          <Plane className="h-6 w-6" />
          MY FLIGHTS
        </h1>
        <div className="text-sm text-muted-foreground mt-2">
          {flights.length} active flight{flights.length !== 1 ? 's' : ''} found
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {flights.map((flight, i) => (
          <div key={i} className="group border border-border rounded-sm bg-card hover:border-primary/50 transition-colors overflow-hidden">
            {/* Flight Header */}
            <div className="p-4 border-b border-border/50 bg-muted/30 flex items-center justify-between">
              <div className="font-mono font-bold text-lg">
                {flight.code || flight.flight_number || 'UNK'}
              </div>
              <div className={cn(
                "px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider border",
                flight.status === 'Active' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                flight.status === 'Scheduled' ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                "bg-muted text-muted-foreground border-border"
              )}>
                {flight.status || 'Scheduled'}
              </div>
            </div>

            {/* Route Visual */}
            <div className="p-5 flex items-center justify-between gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground mb-1">{flight.origin}</div>
                <div className="text-xs text-muted-foreground font-mono">ORIGIN</div>
              </div>

              <div className="flex-1 flex flex-col items-center px-4 relative">
                <div className="w-full h-px bg-border absolute top-1/2 -translate-y-1/2" />
                <div className="p-1.5 rounded-full bg-background border border-border relative z-10">
                  <Plane size={14} className="text-muted-foreground rotate-90" />
                </div>
                {flight.aircraft_type && (
                  <div className="absolute -bottom-5 text-[10px] font-mono text-muted-foreground uppercase tracking-wider bg-background px-2">
                    {flight.aircraft_type}
                  </div>
                )}
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-foreground mb-1">{flight.destination}</div>
                <div className="text-xs text-muted-foreground font-mono">DEST</div>
              </div>
            </div>

            {/* Details Footer */}
            <div className="px-4 py-3 bg-muted/10 border-t border-border/50 flex items-center justify-between text-sm text-muted-foreground font-mono">
              <div className="flex items-center gap-2">
                <Calendar size={14} />
                <span>{new Date(flight.departure_time || Date.now()).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} />
                <span>{new Date(flight.departure_time || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
