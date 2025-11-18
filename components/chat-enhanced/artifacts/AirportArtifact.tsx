'use client';

import { useState } from 'react';
import { 
  MapPin, Ruler, Radio, Building, Navigation, 
  ArrowUpRight, Plane, Mountain, Globe 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
      width_ft?: number;
      surface?: string;
    }>;
  };
  communications?: {
    primary_frequencies?: {
      tower?: string;
      ground?: string;
      approach?: string;
    };
    frequencies?: Array<{
      type?: string;
      frequency?: string;
      name?: string;
    }>;
  };
  classification?: {
    type?: string;
    size_category?: string;
  };
}

interface AirportArtifactProps {
  data: Airport | Airport[] | { airports?: Airport[], data?: Airport | Airport[] };
}

export function AirportArtifact({ data }: AirportArtifactProps) {
  // Normalize data to array of airports
  const airports = Array.isArray(data) 
    ? data 
    : 'airports' in data && Array.isArray(data.airports) 
      ? data.airports 
      : 'data' in data && (Array.isArray(data.data) || typeof data.data === 'object')
        ? (Array.isArray(data.data) ? data.data : [data.data])
        : [data as Airport];
  
  const airport = airports[0] || {};

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-6 py-6 border-b border-border bg-card/50">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-baseline gap-3">
              <h1 className="text-4xl font-mono font-bold tracking-tighter text-foreground">
                {airport.icao?.toUpperCase()}
              </h1>
              {airport.iata && (
                <span className="text-2xl font-mono text-muted-foreground">
                  / {airport.iata.toUpperCase()}
                </span>
              )}
            </div>
            <div className="text-sm font-medium text-muted-foreground mt-1 flex items-center gap-2">
              <MapPin size={14} />
              {[airport.location?.municipality, airport.location?.country].filter(Boolean).join(', ')}
            </div>
          </div>
          
          {airport.classification?.type && (
            <div className="px-3 py-1 rounded-sm border bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs font-bold uppercase tracking-wider">
              {airport.classification.type.replace(/_/g, ' ')}
            </div>
          )}
        </div>

        <div className="flex gap-6 mt-6 text-sm text-muted-foreground">
          {airport.coordinates?.elevation_ft && (
            <div className="flex items-center gap-2">
              <Mountain size={16} />
              <span className="font-mono">{airport.coordinates.elevation_ft.toLocaleString()} ft MSL</span>
            </div>
          )}
          {airport.coordinates?.latitude && (
            <div className="flex items-center gap-2">
              <Globe size={16} />
              <span className="font-mono">
                {airport.coordinates.latitude.toFixed(4)}, {airport.coordinates.longitude?.toFixed(4)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="runways" className="w-full">
          <div className="px-6 pt-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b-0 rounded-none gap-6">
              <TabItem value="runways" label="Runways" icon={<Ruler size={14} />} />
              <TabItem value="comms" label="Frequencies" icon={<Radio size={14} />} />
              <TabItem value="procedures" label="Procedures" icon={<Navigation size={14} />} />
            </TabsList>
          </div>

          <div className="p-6">
            <TabsContent value="runways" className="mt-0 space-y-6">
              {airport.runways?.details?.map((runway, i) => (
                <div key={i} className="group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="px-2 py-1 bg-foreground text-background font-mono font-bold rounded-sm text-sm">
                        {runway.le_ident}
                      </div>
                      <div className="h-px w-8 bg-border" />
                      <div className="px-2 py-1 bg-muted text-muted-foreground font-mono font-bold rounded-sm text-sm">
                        {runway.he_ident}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-medium">
                        {runway.length_ft?.toLocaleString()} x {runway.width_ft} ft
                      </div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">
                        {runway.surface || 'Unknown Surface'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Runway Visual Bar */}
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden relative">
                    <div 
                      className="h-full bg-primary/80 group-hover:bg-primary transition-colors"
                      style={{ width: `${Math.min(100, (runway.length_ft || 0) / 120)}%` }} // visual scale
                    />
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="comms" className="mt-0">
              <div className="grid grid-cols-1 gap-4">
                {/* Primary Frequencies */}
                {airport.communications?.primary_frequencies && (
                  <div className="space-y-2 mb-6">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Primary</h3>
                    {Object.entries(airport.communications.primary_frequencies).map(([type, freq]) => (
                      <FrequencyRow 
                        key={type} 
                        name={type.charAt(0).toUpperCase() + type.slice(1)} 
                        freq={freq} 
                        primary 
                      />
                    ))}
                  </div>
                )}

                {/* All Frequencies */}
                {airport.communications?.frequencies && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">All Frequencies</h3>
                    {airport.communications.frequencies.map((freq, i) => (
                      <FrequencyRow 
                        key={i} 
                        name={freq.type || freq.name || 'Unknown'} 
                        freq={freq.frequency || ''} 
                      />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="procedures" className="mt-0">
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Building size={48} strokeWidth={1} className="mb-4 opacity-50" />
                <p>Procedure charts not available</p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

function TabItem({ value, label, icon }: { value: string, label: string, icon: React.ReactNode }) {
  return (
    <TabsTrigger 
      value={value}
      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-0 py-3 bg-transparent hover:text-foreground transition-none"
    >
      <div className="flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </div>
    </TabsTrigger>
  );
}

function FrequencyRow({ name, freq, primary = false }: { name: string, freq: string, primary?: boolean }) {
  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-sm border",
      primary ? "bg-primary/5 border-primary/20" : "bg-card border-border"
    )}>
      <div className="font-medium text-sm">{name}</div>
      <div className="font-mono text-lg tracking-wide font-semibold">{freq}</div>
    </div>
  );
}
