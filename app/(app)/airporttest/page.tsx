'use client';

import { useState } from 'react';
import { Search, MapPin, Compass, TrendingUp, AlertTriangle, Loader2 } from 'lucide-react';
import { useCompleteWeather } from "@/lib/tanstack/hooks/useWeather";
import type { StationData } from "@/types/checkwx";
import { getUserFriendlyErrorMessage } from '@/lib/utils/errors';

// --- Helper Functions ---
const normalizeIcao = (value: string) => value.trim().replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 4);

// --- Main Page Component ---
export default function AirportTestPage() {
  const [airportInput, setAirportInput] = useState("KJFK");
  const [activeAirportCode, setActiveAirportCode] = useState(() => normalizeIcao("KJFK"));

  const { station, loading, error, refetch } = useCompleteWeather({
    icao: activeAirportCode.length === 4 ? activeAirportCode : "",
  });

  const handleSearch = () => {
    const code = normalizeIcao(airportInput);
    if (code.length === 4) {
      setActiveAirportCode(code);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex-1 overflow-auto p-4 sm:p-8 bg-[#1A1A1A] text-white animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 mb-2">
            AERODROMES
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
            Airport Database
          </h1>
        </div>
      </div>

      {/* Search Panel */}
      <div className="bg-[#2A2A2A] border border-[#333] rounded-sm p-6 mb-8">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 mb-4">AIRPORT SEARCH</div>
        <div className="flex items-center gap-4">
          <div className="groove-input flex-grow flex items-center">
            <Search size={16} className="text-zinc-500 ml-4" />
            <input
              type="text"
              placeholder="Enter 4-letter ICAO code..."
              className="w-full bg-transparent pl-3 pr-4 py-2.5 border-none text-sm font-mono uppercase text-zinc-200 placeholder:text-zinc-500 focus:outline-none"
              value={airportInput}
              onChange={(e) => setAirportInput(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={4}
            />
          </div>
          <button onClick={handleSearch} className="bg-[#F04E30] text-white px-5 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wide hover:bg-[#F04E30]/90 transition-colors disabled:bg-zinc-500" disabled={loading.station}>
            {loading.station ? 'Loading...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading.station && <LoadingState airportCode={activeAirportCode} />}
      
      {/* Error State */}
      {error.station && !loading.station && <ErrorState error={error.station} onRetry={() => refetch.station()} />}

      {/* Main Display */}
      {!loading.station && !error.station && station && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <AirportHeader station={station} />
          <RunwayDetails runways={station.runways} />
        </div>
      )}
    </div>
  );
}

// --- UI Components ---

const LoadingState = ({ airportCode }: { airportCode?: string }) => (
  <div className="flex items-center justify-center gap-3 py-16">
    <Loader2 className="h-8 w-8 animate-spin text-[#F04E30]" />
    <span className="text-sm font-mono text-zinc-400">Loading airport data{airportCode ? ` for ${airportCode}` : ''}...</span>
  </div>
);

const ErrorState = ({ error, onRetry }: { error: any, onRetry: () => void }) => (
  <div className="bg-[#2A2A2A] border border-red-900/40 rounded-sm p-6 text-red-200">
    <div className="flex items-center gap-3">
      <AlertTriangle className="h-5 w-5" />
      <div>
        <h3 className="font-semibold">Unable to retrieve airport data</h3>
        <p className="text-sm text-red-300">{getUserFriendlyErrorMessage(error)}</p>
      </div>
      <button onClick={onRetry} className="ml-auto bg-red-500/20 text-white px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wide hover:bg-red-500/40 transition-colors">Retry</button>
    </div>
  </div>
);

const AirportHeader = ({ station }: { station: StationData }) => (
  <div className="bg-[#2A2A2A] border border-[#333] rounded-sm p-6">
    <div className="flex justify-between items-start">
      <div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
          {station.icao} {station.iata && `/ ${station.iata}`}
        </div>
        <h2 className="text-xl font-medium text-zinc-100">{station.name}</h2>
        <p className="text-sm text-zinc-400">{station.location ?? 'Unknown'}, {station.country?.name ?? 'Unknown'}</p>
      </div>
      <div className="text-right">
        <div className="font-mono text-zinc-300 tabular-nums">
          Elev: {station.elevation?.feet ?? 'N/A'} ft / {station.elevation?.meters ?? 'N/A'} m
        </div>
      </div>
    </div>
    <div className="mt-6 pt-6 border-t border-zinc-700 grid grid-cols-1 sm:grid-cols-3 gap-6">
      <MetricDisplay icon={MapPin} label="Coordinates" value={`${station.geometry?.coordinates?.[1]?.toFixed(4) ?? 'N/A'}, ${station.geometry?.coordinates?.[0]?.toFixed(4) ?? 'N/A'}`} />
      <MetricDisplay icon={Compass} label="Runways" value={`${station.runways?.length ?? 0}`} />
      <MetricDisplay icon={TrendingUp} label="Type" value={station.type ?? 'N/A'} />
    </div>
  </div>
);

const RunwayDetails = ({ runways }: { runways?: StationData['runways'] }) => {
  if (!runways || runways.length === 0) {
    return (
      <div className="bg-[#2A2A2A] border border-dashed border-[#333] rounded-sm p-12 text-center">
        <p className="text-sm text-zinc-500">No runway data available for this airport.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#2A2A2A] border border-[#333] rounded-sm p-6">
      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 mb-4">Runways</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {runways.map((runway, idx) => (
          <div key={`${runway.ident1}-${runway.ident2}-${idx}`} className="bg-[#1A1A1A] border border-zinc-800 rounded-sm p-4">
            <h3 className="font-mono font-semibold text-base text-zinc-100 mb-2">
              Runway {runway.ident1}/{runway.ident2}
            </h3>
            <div className="space-y-2 text-sm">
              <RunwayMetric label="Length" value={`${runway.length_ft.toLocaleString()} ft`} />
              <RunwayMetric label="Width" value={`${runway.width_ft.toLocaleString()} ft`} />
              <RunwayMetric label="Surface" value={runway.surface} />
              <RunwayMetric label="Lights" value={runway.lights ? 'Yes' : 'No'} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MetricDisplay = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) => (
  <div className="flex items-start gap-4">
    <Icon className="h-5 w-5 text-zinc-500 mt-1" strokeWidth={1.5} />
    <div>
      <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">{label}</div>
      <div className="text-lg font-mono font-medium text-zinc-100 tabular-nums">{value}</div>
    </div>
  </div>
);

const RunwayMetric = ({ label, value }: { label: string, value: string }) => (
  <div className="flex justify-between items-center">
    <span className="text-zinc-400">{label}:</span>
    <span className="font-mono text-zinc-200">{value}</span>
  </div>
);
