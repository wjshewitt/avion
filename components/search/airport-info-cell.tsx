import { DataRow } from './data-row';
import type { AirportSearchMatch } from '@/lib/search/unified-search';

interface AirportInfoCellProps {
  airport: AirportSearchMatch & {
    airportInfo?: {
      coordinates?: {
        elevation_ft?: number;
      };
      runways?: {
        count?: number;
        longest_ft?: number;
      };
      communications?: {
        primary_frequencies?: {
          tower?: string;
          ground?: string;
        };
      };
      location?: {
        region?: string;
      };
    };
  };
}

export function AirportInfoCell({ airport }: AirportInfoCellProps) {
  const info = airport.airportInfo;
  const hasData = info && (
    info.coordinates?.elevation_ft ||
    info.runways ||
    info.communications?.primary_frequencies
  );

  return (
    <div className="p-3 space-y-2">
      {/* Header */}
      <div className="text-[11px] uppercase font-mono text-text-secondary tracking-wider">
        AIRPORT
      </div>

      {/* Location */}
      <div className="text-[12px] font-mono text-text-primary">
        {airport.city}
        {info?.location?.region && `, ${info.location.region}`}
      </div>

      {/* Data Grid */}
      {hasData ? (
        <div className="space-y-1.5">
          {info.coordinates?.elevation_ft !== undefined && (
            <DataRow label="Elevation" value={`${info.coordinates.elevation_ft} ft`} />
          )}
          
          {info.runways && (
            <>
              {info.runways.count !== undefined && (
                <DataRow label="Runways" value={String(info.runways.count)} />
              )}
              {info.runways.longest_ft !== undefined && (
                <DataRow 
                  label="Longest" 
                  value={`${info.runways.longest_ft.toLocaleString()} ft`} 
                />
              )}
            </>
          )}
          
          {info.communications?.primary_frequencies && (
            <>
              {info.communications.primary_frequencies.tower && (
                <DataRow 
                  label="Tower" 
                  value={info.communications.primary_frequencies.tower} 
                />
              )}
              {info.communications.primary_frequencies.ground && (
                <DataRow 
                  label="Ground" 
                  value={info.communications.primary_frequencies.ground} 
                />
              )}
            </>
          )}
        </div>
      ) : (
        <div className="text-[10px] text-text-secondary italic">
          Basic info only
        </div>
      )}
    </div>
  );
}
