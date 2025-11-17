'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Cloud, Wind, Eye, Thermometer, AlertTriangle, Loader2, ArrowLeftRight, MapPin } from 'lucide-react';
import { useCompleteWeather, useMetar } from "@/lib/tanstack/hooks/useWeather";
import { useFlights } from "@/lib/tanstack/hooks/useFlights";
import { useWeatherRisk } from "@/lib/tanstack/hooks/useWeatherRisk";
import type { DecodedMetar, DecodedTaf, TafForecastPeriod, WindData, VisibilityData, CloudLayer } from "@/types/checkwx";
import { getUserFriendlyErrorMessage } from '@/lib/utils/errors';
import { AvionTabs } from '@/components/ui/avion-tabs';
import { WeatherAirportSearchInput } from '@/components/weather/WeatherAirportSearchInput';
import { PinnedAtmosphereCard } from '@/components/weather/PinnedAtmosphereCard';
import { useAppStore } from '@/lib/store';

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
    case 'VFR': return 'bg-emerald-100 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-600/30';
    case 'MVFR': return 'bg-blue-100 dark:bg-blue-600/20 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-600/30';
    case 'IFR': return 'bg-amber-100 dark:bg-amber-600/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-600/30';
    case 'LIFR': return 'bg-red-100 dark:bg-red-600/20 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-600/30';
    default: return 'bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-zinc-300 border border-gray-300 dark:border-zinc-600';
  }
};

const normalizeRiskTier = (tier?: string | null): "LOW" | "MODERATE" | "HIGH" | "CRITICAL" | undefined => {
  if (!tier) return undefined;
  if (tier === "on_track") return "LOW";
  if (tier === "monitor") return "MODERATE";
  if (tier === "high_disruption") return "HIGH";
  if (tier === "LOW" || tier === "MODERATE" || tier === "HIGH" || tier === "CRITICAL") {
    return tier;
  }
  return undefined;
};

const getRiskColor = (tier?: string | null) => {
  const normalized = normalizeRiskTier(tier);
  if (!normalized) return "bg-zinc-700";
  if (normalized === "LOW") return "bg-emerald-600";
  if (normalized === "MODERATE") return "bg-blue-600";
  if (normalized === "HIGH") return "bg-amber-600";
  if (normalized === "CRITICAL") return "bg-red-600";
  return "bg-zinc-700";
};

// --- Main Page Component ---
export default function WeatherPage() {
  const [selectedTab, setSelectedTab] = useState('airport');
  const { pinnedAirports } = useAppStore();

  const tabs = [
    { id: 'airport', label: 'Airport' },
    { id: 'route', label: 'Route' },
    { id: 'location', label: 'Location' },
  ];

  return (
    <div className="flex-1 overflow-auto p-4 sm:p-8 bg-background text-foreground">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2">
            METEOROLOGY
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Weather Intelligence
          </h1>
        </div>
      </div>

      {/* Pinned Locations Section */}
      {pinnedAirports.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
              PINNED LOCATIONS
            </div>
            <div className="text-[10px] font-mono text-muted-foreground">
              {pinnedAirports.length} / 8
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pinnedAirports.map((icao: string) => (
              <PinnedAtmosphereCard key={icao} icao={icao} />
            ))}
          </div>
        </div>
      )}

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
  const router = useRouter();
  const [activeAirportCode, setActiveAirportCode] = useState("KJFK");

  const { metar, taf, station, loading, error, refetch } = useCompleteWeather({
    icao: activeAirportCode.length === 4 ? activeAirportCode : "",
  });

  const { data: allFlights } = useFlights();

  const departingFlights = useMemo(() => {
    if (!allFlights || !activeAirportCode || activeAirportCode.length !== 4) return [] as any[];
    const now = new Date();
    return allFlights
      .filter(
        (flight) =>
          (flight.origin_icao === activeAirportCode || flight.origin === activeAirportCode) &&
          new Date(flight.scheduled_at) >= now
      )
      .slice(0, 5);
  }, [allFlights, activeAirportCode]);

  const { data: riskData, isLoading: riskLoading } = useWeatherRisk(
    { airport: activeAirportCode, mode: "full" },
    { enabled: activeAirportCode.length === 4 }
  );

  return (
    <div className="animate-in fade-in duration-300">
      <div className="bg-card border border-border rounded-sm p-6 mb-8">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-4">AIRPORT SEARCH</div>
        <WeatherAirportSearchInput
          onAirportSelect={(icao) => setActiveAirportCode(icao)}
          placeholder="Search airports by code, city, or name..."
          autoFocus
        />
      </div>

      {loading.any && <LoadingState airportCode={activeAirportCode} />}
      {error.any && !loading.any && <ErrorState error={error} onRetry={() => refetch.all()} />}

      {!loading.any && !error.any && metar && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <MetarDisplay metar={metar} station={station} />
          {taf && <TafDisplay taf={taf} />}
          {departingFlights.length > 0 && <DepartingFlightsDisplay flights={departingFlights} router={router} />}
          {riskData && <RiskAssessmentDisplay riskData={riskData} riskLoading={riskLoading} />}
        </div>
      )}
    </div>
  );
}

// --- Route Weather Tab ---
function RouteWeatherTab() {
  const router = useRouter();
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
      <div className="bg-card border border-border rounded-sm p-6 mb-8">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-4">ROUTE SEARCH</div>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-start">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Departure</div>
            <WeatherAirportSearchInput
              onAirportSelect={(icao) => setDepartureInput(icao)}
              placeholder="Search departure airport..."
            />
          </div>
          <button 
            onClick={handleSwap} 
            className="mt-7 p-2.5 border border-border rounded-sm hover:bg-accent transition-colors self-start"
            title="Swap departure and arrival"
          >
            <ArrowLeftRight size={16} className="text-muted-foreground" />
          </button>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Arrival</div>
            <WeatherAirportSearchInput
              onAirportSelect={(icao) => setArrivalInput(icao)}
              placeholder="Search arrival airport..."
            />
          </div>
        </div>
      </div>

      {isLoading && <LoadingState />}
      {isError && !isLoading && <ErrorState error={error} onRetry={refetch} />}
      
      {!isLoading && !isError && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
          <RouteMetarCard label="Departure" icao={normalizeIcao(departureInput)} metar={departureMetar} router={router} />
          <RouteMetarCard label="Arrival" icao={normalizeIcao(arrivalInput)} metar={arrivalMetar} router={router} />
        </div>
      )}
    </div>
  );
}

// --- Location Weather Tab ---
function LocationWeatherTab() {
    return (
        <div className="bg-card border border-dashed border-border rounded-sm p-12 text-center animate-in fade-in duration-300">
            <MapPin className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium text-foreground">Location-Based Search</h3>
            <p className="text-sm text-muted-foreground mt-2">This feature is currently under development.</p>
        </div>
    );
}

// --- UI Components ---
const LoadingState = ({ airportCode }: { airportCode?: string }) => (
  <div className="flex items-center justify-center gap-3 py-16">
    <Loader2 className="h-8 w-8 animate-spin text-[--accent-primary]" />
    <span className="text-sm font-mono text-muted-foreground">Scanning weather data{airportCode ? ` for ${airportCode}` : ''}...</span>
  </div>
);

const ErrorState = ({ error, onRetry }: { error: any, onRetry: () => void }) => (
  <div className="bg-card border border-red-900/40 rounded-sm p-6 text-red-400 dark:text-red-300">
    <div className="flex items-center gap-3">
      <AlertTriangle className="h-5 w-5" />
      <div>
        <h3 className="font-semibold">Unable to retrieve weather data</h3>
        <p className="text-sm">{getUserFriendlyErrorMessage(error.metar || error.taf || error.station || error)}</p>
      </div>
      <button 
        onClick={onRetry} 
        className="ml-auto bg-red-500/20 text-red-700 dark:text-red-200 px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wide hover:bg-red-500/40 transition-colors"
      >
        Retry
      </button>
    </div>
  </div>
);

const MetarDisplay = ({ metar, station }: { metar: DecodedMetar, station: any }) => (
  <div className="bg-card border border-border rounded-sm p-6 relative overflow-hidden">
    <div className="relative z-10">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">LIVE WEATHER AT {metar.icao}</div>
          <h2 className="text-xl font-medium text-foreground">{station?.name || '---'}</h2>
        </div>
        <div className={`font-mono text-sm px-2 py-1 rounded-sm ${getFlightCategoryClass(metar.flight_category)}`}>
          {metar.flight_category || '---'}
        </div>
      </div>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <MetricDisplay icon={Thermometer} label="Temperature" value={`${metar.temperature?.celsius.toFixed(0) ?? '--'}°C`} detail={`Dewpoint: ${metar.dewpoint?.celsius.toFixed(0) ?? '--'}°C`} />
        <MetricDisplay icon={Wind} label="Wind" value={formatWindCompact(metar.wind)} />
        <MetricDisplay icon={Eye} label="Visibility" value={formatVisibilityCompact(metar.visibility)} />
        <MetricDisplay icon={Cloud} label="Clouds" value={formatCloudsCompact(metar.clouds)} />
      </div>
      <div className="mt-8 pt-4 border-t border-border">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">RAW METAR</div>
        <p className="font-mono text-sm text-muted-foreground">{metar.raw_text}</p>
      </div>
    </div>
  </div>
);

const TafDisplay = ({ taf }: { taf: DecodedTaf }) => (
  <div className="bg-card border border-border rounded-sm p-6">
    <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-1">TERMINAL AERODROME FORECAST</div>
    <div className="font-mono text-xs text-muted-foreground mb-4">Issued: {taf.issued ? new Date(taf.issued).toLocaleString() : 'N/A'}</div>
    <div className="space-y-4">
      {taf.forecast?.map((period, index) => <TafPeriod key={index} period={period} />) ?? <p className="text-sm text-muted-foreground">No forecast periods available</p>}
    </div>
    <div className="mt-6 pt-4 border-t border-border">
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">RAW TAF</div>
      <p className="font-mono text-sm text-muted-foreground">{taf.raw_text}</p>
    </div>
  </div>
);

const MetricDisplay = ({ icon: Icon, label, value, detail }: { icon: React.ElementType, label: string, value: string, detail?: string }) => (
  <div className="flex items-start gap-4">
    <Icon className="h-5 w-5 text-muted-foreground mt-1" strokeWidth={1.5} />
    <div>
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="text-xl font-mono font-medium text-foreground tabular-nums">{value}</div>
      {detail && <div className="text-xs text-muted-foreground">{detail}</div>}
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
    <div className="border-l-2 pl-4 border-border hover:border-[--accent-primary] transition-colors">
      <div className="flex items-center justify-between">
        <div className="text-sm font-mono font-medium text-foreground">{timeRange}</div>
        <div className={`font-mono text-xs px-2 py-0.5 rounded ${getFlightCategoryClass(period.flight_category)}`}>
          {period.flight_category}
        </div>
      </div>
      <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-sm font-mono text-muted-foreground">
        <div><span className="text-muted-foreground">Wind:</span> {formatWindCompact(period.wind)}</div>
        {period.visibility && <div><span className="text-muted-foreground">Vis:</span> {formatVisibilityCompact(period.visibility)}</div>}
        {period.clouds && period.clouds.length > 0 && <div className="col-span-2 md:col-span-1"><span className="text-muted-foreground">Clouds:</span> {formatCloudsCompact(period.clouds)}</div>}
      </div>
    </div>
  );
};

const RouteMetarCard = ({ label, icao, metar, router }: { label: string, icao: string, metar: DecodedMetar | null, router: any }) => {
  if (icao.length !== 4) {
    return (
      <div>
        <h3 className="text-base font-medium text-foreground mb-2">{label}</h3>
        <div className="bg-card border border-dashed border-border rounded-sm p-12 text-center">
          <p className="text-sm text-muted-foreground">Enter a valid 4-letter ICAO code.</p>
        </div>
      </div>
    );
  }
  
  if (!metar) {
     return (
      <div>
        <h3 className="text-base font-medium text-foreground mb-2">{label}: <span className="font-mono">{icao}</span></h3>
        <div className="bg-card border border-dashed border-border rounded-sm p-12 text-center">
          <p className="text-sm text-muted-foreground">No METAR available for {icao}.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-base font-medium text-foreground">{label}: <span className="font-mono">{icao}</span></h3>
        <div className={`font-mono text-xs px-2 py-0.5 rounded ${getFlightCategoryClass(metar.flight_category)}`}>
          {metar.flight_category || '---'}
        </div>
      </div>
      <div className="bg-card border border-border rounded-sm p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <MiniMetric label="Temp" value={`${metar.temperature?.celsius.toFixed(0) ?? '--'}°C`} />
          <MiniMetric label="Wind" value={formatWindCompact(metar.wind)} />
          <MiniMetric label="Vis" value={formatVisibilityCompact(metar.visibility)} />
          <MiniMetric label="Clouds" value={formatCloudsCompact(metar.clouds)} />
        </div>
        <div className="border-t border-border pt-3">
          <p className="font-mono text-xs text-muted-foreground">{metar.raw_text}</p>
        </div>
        <button
          onClick={() => router.push(`/weather/${icao}`)}
          className="w-full border border-border px-3 py-2 text-xs text-foreground hover:bg-accent transition-colors rounded-sm"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

const MiniMetric = ({ label, value }: { label: string, value: string }) => (
  <div>
    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</div>
    <div className="text-sm font-mono font-medium text-foreground tabular-nums">{value}</div>
  </div>
);

const DepartingFlightsDisplay = ({ flights, router }: { flights: any[], router: any }) => (
  <div className="bg-card border border-border rounded-sm p-6">
    <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-4">DEPARTING FLIGHTS</div>
    <div className="space-y-3">
      {flights.map((flight) => (
        <div key={flight.id} className="flex items-center justify-between p-3 border border-border rounded-sm hover:border-[--accent-primary] transition-colors">
          <div className="flex items-center gap-6">
            <div className="font-mono text-sm font-bold text-foreground">
              {flight.code} → {flight.destination_icao || flight.destination}
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(flight.scheduled_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })} UTC
            </div>
            <LEDIndicator status={flight.status} />
          </div>
          <button 
            onClick={() => router.push(`/flights/${flight.id}`)} 
            className="border border-border px-3 py-1 text-xs text-foreground hover:bg-accent transition-colors rounded-sm"
          >
            View
          </button>
        </div>
      ))}
    </div>
  </div>
);

const RiskAssessmentDisplay = ({ riskData, riskLoading }: { riskData: any, riskLoading?: boolean }) => {
  const score = riskData?.score ?? riskData?.result?.score ?? 0;
  const tier = riskData?.tier ?? riskData?.result?.tier ?? null;
  const normalizedTier = normalizeRiskTier(tier);

  return (
    <div className="bg-card border border-border rounded-sm p-6">
      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-4">RISK ASSESSMENT</div>
      
      {riskLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-[--accent-primary]" />
        </div>
      ) : (
        <>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Overall Risk Score</span>
              <span className="font-mono text-lg font-bold text-foreground tabular-nums">{score}/100</span>
            </div>
            <div className="h-3 bg-muted border border-border overflow-hidden rounded-sm">
              <div className={`${getRiskColor(tier)} h-full transition-all duration-500`} style={{ width: `${score}%` }} />
            </div>
            {normalizedTier && (
              <div className="mt-2 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getRiskColor(tier)}`} />
                <span className="text-xs font-mono uppercase text-muted-foreground">{normalizedTier}</span>
              </div>
            )}
          </div>

          {riskData.result?.factorBreakdown && riskData.result.factorBreakdown.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-mono uppercase text-muted-foreground">Factor Breakdown</div>
              {riskData.result.factorBreakdown.map((factor: any, index: number) => (
                <div key={index} className="p-3 border border-border rounded-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{factor.factor}</span>
                    <span className="font-mono text-xs text-muted-foreground tabular-nums">{factor.score.toFixed(1)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{factor.message}</div>
                </div>
              ))}
            </div>
          )}

          {riskData.messaging?.recommendations && riskData.messaging.recommendations.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border">
              <div className="text-xs font-mono uppercase text-muted-foreground mb-3">Recommendations</div>
              <ul className="space-y-2">
                {riskData.messaging.recommendations.map((rec: string, i: number) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-[--accent-primary] mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const LEDIndicator = ({ status }: { status: string }) => {
  const getStatusColor = () => {
    if (status === "On Time") return "bg-emerald-500";
    if (status === "Delayed") return "bg-amber-500";
    if (status === "Cancelled") return "bg-red-500";
    return "bg-muted-foreground";
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
      <span className="text-xs font-mono text-muted-foreground">{status}</span>
    </div>
  );
};
