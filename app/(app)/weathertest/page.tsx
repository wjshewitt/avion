'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Cloud, Wind, Eye, Thermometer, Droplets, AlertTriangle, Loader2, ArrowLeftRight, MapPin, Navigation } from 'lucide-react';
import { useCompleteWeather, useMetar } from "@/lib/tanstack/hooks/useWeather";
import type { DecodedMetar, DecodedTaf, TafForecastPeriod, WindData, VisibilityData, CloudLayer } from "@/types/checkwx";
import { getUserFriendlyErrorMessage } from '@/lib/utils/errors';
import { AvionTabs } from '@/components/ui/avion-tabs';

// --- Helper Functions ---
const normalizeIcao = (value: string) => value.trim().replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 4);

function formatWindCompact(w?: WindData): string {
  if (!w) return "Calm";
  const dir = w.degrees !== undefined ? `${w.degrees.toString().padStart(3, "0")}°` : "VRB";
  const spd = w.speed_kts !== undefined ? `${w.speed_kts} kt` : "0 kt";
  const gst = w.gust_kts ? ` (G${w.gust_kts})` : "";
  return `${dir} @ ${spd}${gst}`;
}

function formatVisibilityCompact(v?: VisibilityData): string {
  if (!v) return "—";
  const miles = v.miles_float ?? (typeof v.miles === "number" ? v.miles : undefined);
  if (miles !== undefined) return `${miles.toFixed(1)} SM`;
  return v.miles_text || v.meters_text || "—";
}

function formatCloudsCompact(clouds?: CloudLayer[]): string {
  if (!clouds || clouds.length === 0) return "Clear";
  return clouds.map(c => `${c.code}${c.base_feet_agl ? ` ${c.base_feet_agl.toLocaleString()}` : ""}`).join(" / ");
}

const getFlightCategoryClass = (category?: string) => {
  switch (category) {
    case 'VFR': return 'bg-green-600/20 text-green-300 border border-green-600/30';
    case 'MVFR': return 'bg-blue-600/20 text-blue-300 border border-blue-600/30';
    case 'IFR': return 'bg-red-600/20 text-red-300 border border-red-600/30';
    case 'LIFR': return 'bg-purple-600/20 text-purple-300 border border-purple-600/30';
    default: return 'bg-zinc-700 text-zinc-300 border border-zinc-600';
  }
};

// --- Main Page Component ---
export default function WeatherTestPage() {
  const [selectedTab, setSelectedTab] = useState('airport');

  const tabs = [
    { id: 'airport', label: 'Airport' },
    { id: 'route', label: 'Route' },
    { id: 'location', label: 'Location' },
  ];

  return (
    <div className="flex-1 overflow-auto p-4 sm:p-8 bg-[#1A1A1A] text-white">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 mb-2">
            METEOROLOGY
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
            Weather Intelligence
          </h1>
        </div>
      </div>

      <AvionTabs tabs={tabs} selectedTab={selectedTab} onSelectTab={setSelectedTab} />

      <div className="mt-8">
        {selectedTab === 'airport' && <AirportWeatherTab />}
        {selectedTab === 'route' && <RouteWeatherTab />}
        {selectedTab === 'location' && <LocationWeatherTab />}
      </div>
    </div>
  );
}

// --- Airport Weather Tab ---
function AirportWeatherTab() {
  const [airportInput, setAirportInput] = useState("KJFK");
  const [activeAirportCode, setActiveAirportCode] = useState(() => normalizeIcao("KJFK"));

  const { metar, taf, station, loading, error, refetch } = useCompleteWeather({
    icao: activeAirportCode.length === 4 ? activeAirportCode : "",
  });

  const handleSearch = () => {
    const code = normalizeIcao(airportInput);
    if (code.length === 4) setActiveAirportCode(code);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') handleSearch();
  };

  return (
    <div className="animate-in fade-in duration-300">
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
          <button onClick={handleSearch} className="bg-[#F04E30] text-white px-5 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wide hover:bg-[#F04E30]/90 transition-colors disabled:bg-zinc-500" disabled={loading.any}>
            {loading.any ? 'Loading...' : 'Search'}
          </button>
        </div>
      </div>

      {loading.any && <LoadingState airportCode={activeAirportCode} />}
      {error.any && !loading.any && <ErrorState error={error} onRetry={() => refetch.all()} />}

      {!loading.any && !error.any && metar && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <MetarDisplay metar={metar} station={station} />
          {taf && <TafDisplay taf={taf} />}
        </div>
      )}
    </div>
  );
}

// --- Route Weather Tab ---
function RouteWeatherTab() {
  const [departureInput, setDepartureInput] = useState("KJFK");
  const [arrivalInput, setArrivalInput] = useState("KLAX");

  const requestedIcaos = useMemo(() => {
    const codes = [normalizeIcao(departureInput), normalizeIcao(arrivalInput)].filter(code => code.length === 4);
    return Array.from(new Set(codes));
  }, [departureInput, arrivalInput]);

  const { data: metars, isLoading, isError, error, refetch } = useMetar({ icaos: requestedIcaos });

  const departureMetar = useMemo(() => metars?.find(m => m.icao === normalizeIcao(departureInput)) || null, [metars, departureInput]);
  const arrivalMetar = useMemo(() => metars?.find(m => m.icao === normalizeIcao(arrivalInput)) || null, [metars, arrivalInput]);

  const handleSwap = () => {
    const oldDep = departureInput;
    setDepartureInput(arrivalInput);
    setArrivalInput(oldDep);
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="bg-[#2A2A2A] border border-[#333] rounded-sm p-6 mb-8">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 mb-4">ROUTE SEARCH</div>
        <div className="flex items-center gap-4">
          <div className="groove-input flex-grow"><input type="text" placeholder="Departure ICAO" className="w-full bg-transparent p-2.5 border-none text-sm font-mono uppercase text-zinc-200 placeholder:text-zinc-500 focus:outline-none text-center" value={departureInput} onChange={e => setDepartureInput(e.target.value)} maxLength={4} /></div>
          <button onClick={handleSwap} className="p-2.5 border border-zinc-700 rounded-sm hover:bg-zinc-700 transition-colors"><ArrowLeftRight size={16} className="text-zinc-400" /></button>
          <div className="groove-input flex-grow"><input type="text" placeholder="Arrival ICAO" className="w-full bg-transparent p-2.5 border-none text-sm font-mono uppercase text-zinc-200 placeholder:text-zinc-500 focus:outline-none text-center" value={arrivalInput} onChange={e => setArrivalInput(e.target.value)} maxLength={4} /></div>
        </div>
      </div>

      {isLoading && <LoadingState />}
      {isError && !isLoading && <ErrorState error={error} onRetry={refetch} />}
      
      {!isLoading && !isError && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
          <RouteMetarCard label="Departure" icao={normalizeIcao(departureInput)} metar={departureMetar} />
          <RouteMetarCard label="Arrival" icao={normalizeIcao(arrivalInput)} metar={arrivalMetar} />
        </div>
      )}
    </div>
  );
}

// --- Location Weather Tab ---
function LocationWeatherTab() {
    return (
        <div className="bg-[#2A2A2A] border border-dashed border-[#333] rounded-sm p-12 text-center animate-in fade-in duration-300">
            <MapPin className="h-10 w-10 mx-auto mb-4 text-zinc-600" />
            <h3 className="font-medium text-zinc-300">Location-Based Search</h3>
            <p className="text-sm text-zinc-500 mt-2">This feature is currently under development.</p>
        </div>
    );
}


// --- UI Components ---
const LoadingState = ({ airportCode }: { airportCode?: string }) => (
  <div className="flex items-center justify-center gap-3 py-16">
    <Loader2 className="h-8 w-8 animate-spin text-[#F04E30]" />
    <span className="text-sm font-mono text-zinc-400">Scanning weather data{airportCode ? ` for ${airportCode}` : ''}...</span>
  </div>
);

const ErrorState = ({ error, onRetry }: { error: any, onRetry: () => void }) => (
  <div className="bg-[#2A2A2A] border border-red-900/40 rounded-sm p-6 text-red-200">
    <div className="flex items-center gap-3">
      <AlertTriangle className="h-5 w-5" />
      <div>
        <h3 className="font-semibold">Unable to retrieve weather data</h3>
        <p className="text-sm text-red-300">{getUserFriendlyErrorMessage(error.metar || error.taf || error.station || error)}</p>
      </div>
      <button onClick={onRetry} className="ml-auto bg-red-500/20 text-white px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wide hover:bg-red-500/40 transition-colors">Retry</button>
    </div>
  </div>
);

const MetarDisplay = ({ metar, station }: { metar: DecodedMetar, station: any }) => (
  <div className="bg-[#2A2A2A] border border-[#333] rounded-sm p-6 relative overflow-hidden">
    <div className="relative z-10">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">LIVE WEATHER AT {metar.icao}</div>
          <h2 className="text-xl font-medium text-zinc-100">{station?.name || '---'}</h2>
        </div>
        <div className={`font-mono text-sm px-2 py-1 rounded-sm ${getFlightCategoryClass(metar.flight_category)}`}>{metar.flight_category || '---'}</div>
      </div>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <MetricDisplay icon={Thermometer} label="Temperature" value={`${metar.temperature?.celsius.toFixed(0) ?? '--'}°C`} detail={`Dewpoint: ${metar.dewpoint?.celsius.toFixed(0) ?? '--'}°C`} />
        <MetricDisplay icon={Wind} label="Wind" value={formatWindCompact(metar.wind)} />
        <MetricDisplay icon={Eye} label="Visibility" value={formatVisibilityCompact(metar.visibility)} />
        <MetricDisplay icon={Cloud} label="Clouds" value={formatCloudsCompact(metar.clouds)} />
      </div>
      <div className="mt-8 pt-4 border-t border-zinc-700">
        <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">RAW METAR</div>
        <p className="font-mono text-sm text-zinc-400">{metar.raw_text}</p>
      </div>
    </div>
  </div>
);

const TafDisplay = ({ taf }: { taf: DecodedTaf }) => (
  <div className="bg-[#2A2A2A] border border-[#333] rounded-sm p-6">
    <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 mb-1">TERMINAL AERODROME FORECAST</div>
    <div className="font-mono text-xs text-zinc-500 mb-4">Issued: {taf.issued ? new Date(taf.issued).toLocaleString() : 'N/A'}</div>
    <div className="space-y-4">
      {taf.forecast?.map((period, index) => <TafPeriod key={index} period={period} />) ?? <p className="text-sm text-zinc-500">No forecast periods available</p>}
    </div>
    <div className="mt-6 pt-4 border-t border-zinc-700">
      <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">RAW TAF</div>
      <p className="font-mono text-sm text-zinc-400">{taf.raw_text}</p>
    </div>
  </div>
);

const MetricDisplay = ({ icon: Icon, label, value, detail }: { icon: React.ElementType, label: string, value: string, detail?: string }) => (
  <div className="flex items-start gap-4">
    <Icon className="h-5 w-5 text-zinc-500 mt-1" strokeWidth={1.5} />
    <div>
      <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">{label}</div>
      <div className="text-xl font-mono font-medium text-zinc-100 tabular-nums">{value}</div>
      {detail && <div className="text-xs text-zinc-400">{detail}</div>}
    </div>
  </div>
);

const TafPeriod = ({ period }: { period: TafForecastPeriod }) => {
  const timeRange = (() => {
    if (typeof period.timestamp === "string") return new Date(period.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (period.timestamp?.from && period.timestamp?.to) {
      const from = new Date(period.timestamp.from).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const to = new Date(period.timestamp.to).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      return `${from} - ${to}`;
    }
    return "Forecast Period";
  })();

  return (
    <div className="border-l-2 pl-4 border-zinc-700 hover:border-[#F04E30] transition-colors">
      <div className="flex items-center justify-between">
        <div className="text-sm font-mono font-medium text-zinc-300">{timeRange}</div>
        <div className={`font-mono text-xs px-2 py-0.5 rounded ${getFlightCategoryClass(period.flight_category)}`}>{period.flight_category}</div>
      </div>
      <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-sm font-mono text-zinc-400">
        <div><span className="text-zinc-500">Wind:</span> {formatWindCompact(period.wind)}</div>
        {period.visibility && <div><span className="text-zinc-500">Vis:</span> {formatVisibilityCompact(period.visibility)}</div>}
        {period.clouds && period.clouds.length > 0 && <div className="col-span-2 md:col-span-1"><span className="text-zinc-500">Clouds:</span> {formatCloudsCompact(period.clouds)}</div>}
      </div>
    </div>
  );
};

const RouteMetarCard = ({ label, icao, metar }: { label: string, icao: string, metar: DecodedMetar | null }) => {
  if (icao.length !== 4) {
    return (
      <div>
        <h3 className="text-base font-medium text-zinc-300 mb-2">{label}</h3>
        <div className="bg-[#2A2A2A] border border-dashed border-[#333] rounded-sm p-12 text-center">
          <p className="text-sm text-zinc-500">Enter a valid 4-letter ICAO code.</p>
        </div>
      </div>
    );
  }
  
  if (!metar) {
     return (
      <div>
        <h3 className="text-base font-medium text-zinc-300 mb-2">{label}: <span className="font-mono">{icao}</span></h3>
        <div className="bg-[#2A2A2A] border border-dashed border-[#333] rounded-sm p-12 text-center">
          <p className="text-sm text-zinc-500">No METAR available for {icao}.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-base font-medium text-zinc-300">{label}: <span className="font-mono">{icao}</span></h3>
        <div className={`font-mono text-xs px-2 py-0.5 rounded ${getFlightCategoryClass(metar.flight_category)}`}>{metar.flight_category || '---'}</div>
      </div>
      <div className="bg-[#2A2A2A] border border-[#333] rounded-sm p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <MiniMetric label="Temp" value={`${metar.temperature?.celsius.toFixed(0) ?? '--'}°C`} />
          <MiniMetric label="Wind" value={formatWindCompact(metar.wind)} />
          <MiniMetric label="Vis" value={formatVisibilityCompact(metar.visibility)} />
          <MiniMetric label="Clouds" value={formatCloudsCompact(metar.clouds)} />
        </div>
        <div className="border-t border-zinc-700 pt-3">
          <p className="font-mono text-xs text-zinc-400">{metar.raw_text}</p>
        </div>
      </div>
    </div>
  );
};

const MiniMetric = ({ label, value }: { label: string, value: string }) => (
  <div>
    <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">{label}</div>
    <div className="text-sm font-mono font-medium text-zinc-200 tabular-nums">{value}</div>
  </div>
)