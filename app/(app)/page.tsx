'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { useFlights } from '@/lib/tanstack/hooks/useFlights';
import { useFlightAlerts } from '@/lib/tanstack/hooks/useFlightAlerts';
import { DashboardAtmosphereCard } from '@/components/weather/DashboardAtmosphereCard';
import type { WeatherCondition } from '@/components/weather/atmospheric/SkyEngine';
import { adaptMetarToWeather } from '@/lib/weather/weather-adapter';
import { RouteMap } from '@/components/map';
import { ArrowRight, Plus, ChevronDown } from 'lucide-react';
import FlightAlerts from '@/components/flights/FlightAlerts';
import type { Weather } from '@/lib/types';

// Helper functions
function formatDate(date: string): string {
  return new Date(date).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function mapWeatherToCondition(weather: Weather): WeatherCondition {
  // Map from flight category/risks to SkyEngine condition
  const risks = weather.risks.join(' ').toLowerCase();
  
  if (risks.includes('thunderstorm')) return 'storm';
  if (risks.includes('snow')) return 'snow';
  if (risks.includes('rain')) return 'rain';
  if (risks.includes('fog') || risks.includes('reduced visibility')) return 'fog';
  
  // Fallback to flight category mapping
  switch (weather.condition) {
    case 'LIFR': return 'fog'; // Often fog
    case 'IFR': return 'cloudy'; 
    case 'MVFR': return 'cloudy';
    case 'VFR': return 'clear';
    default: return 'clear';
  }
}

function getBadgeColors(level?: string | null) {
  switch (level) {
    case 'red':
      return 'bg-[#F04E30]/10 text-[#F04E30] border-[#F04E30]/20';
    case 'yellow':
      return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    case 'green':
    default:
      return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
  }
}

function getStatusColor(status: string) {
  if (status === 'On Time') return 'text-emerald-600';
  if (status === 'Delayed') return 'text-amber-600';
  return 'text-[#F04E30]';
}

export default function DashboardPage() {
  const router = useRouter();
  const { mapCollapsed } = useAppStore();
  const { data: flights = [], isLoading } = useFlights();
  const { data: liveAlerts = [], isLoading: alertsLoading } = useFlightAlerts({
    severity: ['moderate', 'high', 'critical'],
  });
  const [selectedFlightId, setSelectedFlightId] = useState<string | undefined>();
  const [mapExpanded, setMapExpanded] = useState(!mapCollapsed);

  // Get active flights (first 3 for preview)
  const activeFlights = flights
    .filter((f) => f.status !== 'Cancelled')
    .slice(0, 3);

  // Get unique key locations for weather from active flights
  const uniqueLocations = new Map();
  
  activeFlights.forEach((flight) => {
    const airportCode = flight.origin;
    const weatherData = flight.weather_data?.origin;
    
    if (!uniqueLocations.has(airportCode)) {
      try {
        if (weatherData?.metar) {
          const adaptedWeather = adaptMetarToWeather(weatherData.metar);
          if (adaptedWeather) {
            uniqueLocations.set(airportCode, {
              code: airportCode,
              name: airportCode,
              weather: adaptedWeather,
            });
          }
        }
      } catch (error) {
        console.warn(`Failed to adapt weather data for ${airportCode}:`, error);
      }
    }
  });

  const locations = Array.from(uniqueLocations.values()).slice(0, 3);
  const activeAlerts = liveAlerts;

  return (
    <div className="flex-1 overflow-auto p-8">
      {/* Page Header */}
      <div className="mb-6">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2">
          OPERATIONS CENTER
        </div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          Flight Operations
        </h1>
      </div>

      {/* Active Flights Section */}
      <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground">Active Flights</h2>
            {activeFlights.length > 0 && (
              <span className="text-xs font-mono text-zinc-400">
                <span className="text-foreground font-semibold">{activeFlights.length}</span> total
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-border border-t-[#F04E30] rounded-full animate-spin" />
            </div>
          ) : activeFlights.length > 0 ? (
            <div className="space-y-3">
              {activeFlights.map((flight) => (
                <button
                  key={flight.id}
                  onClick={() => router.push(`/flights/${flight.id}`)}
                  className="w-full bg-card border border-border hover:border-[#F04E30] p-4 rounded-sm text-left transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
                          Flight
                        </div>
                        <div className="font-mono text-lg font-semibold text-foreground">
                          {flight.code}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
                          Route
                        </div>
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <span>{flight.origin}</span>
                          <ArrowRight size={14} strokeWidth={1.5} className="text-muted-foreground" />
                          <span>{flight.destination}</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
                          Departure
                        </div>
                        <div className="text-sm font-mono tabular-nums text-foreground">
                          {formatDate(flight.scheduled_at)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {flight.weather_alert_level && (
                        <span className={`text-[10px] px-2 py-1 border rounded-sm font-mono uppercase ${getBadgeColors(flight.weather_alert_level)}`}>
                          {flight.weather_alert_level}
                        </span>
                      )}
                      <span className={`text-sm font-semibold ${getStatusColor(flight.status)}`}>
                        {flight.status}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground border border-border rounded-sm">
              <p>No active flights. <Link href="/flights/create" className="text-[#F04E30] hover:underline">Create your first flight</Link></p>
            </div>
          )}
        </section>

      {/* Map Section */}
      {activeFlights.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground mb-1">
                Navigation & Status
              </div>
              <h2 className="text-base font-semibold text-foreground tracking-tight">
                Route Map
              </h2>
            </div>

            <button
              onClick={() => setMapExpanded(!mapExpanded)}
              className="inline-flex items-center gap-1 px-2 py-1 border border-border rounded-sm text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
            >
              <span>{mapExpanded ? 'Collapse' : 'Expand'}</span>
              <ChevronDown
                size={12}
                strokeWidth={1.5}
                className={`transition-transform ${mapExpanded ? 'rotate-180' : ''}`}
              />
            </button>
          </div>

          <AnimatePresence>
            {mapExpanded && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                {/* Tungsten Material Container with Neumorphic Groove */}
                <div 
                  className="bg-[#2A2A2A] border border-[#333] rounded-sm overflow-hidden"
                  style={{
                    boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.3), inset -1px -1px 3px rgba(255,255,255,0.05), 0 10px 20px rgba(0,0,0,0.2)'
                  }}
                >
                  {/* Map Viewport - Machined Inset */}
                  <div 
                    className="relative bg-[#1A1A1A]"
                    style={{
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4), inset 0 -1px 2px rgba(255,255,255,0.03)'
                    }}
                  >
                    <RouteMap
                      flights={activeFlights}
                      selectedFlightId={selectedFlightId}
                      onFlightSelect={(id) => {
                        setSelectedFlightId(id);
                        router.push(`/flights/${id}`);
                      }}
                      className="h-[400px] w-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      )}

      {/* Weather Summary Section */}
      {locations.length > 0 && (
        <section className="mb-6">
            <h2 className="text-base font-semibold text-foreground mb-4">Weather Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {locations.map((location) => (
                <div 
                  key={location.code} 
                  onClick={() => router.push(`/weather?icao=${location.code}`)}
                  className="cursor-pointer"
                >
                  <DashboardAtmosphereCard
                    icao={location.code}
                    stationName={location.name}
                    weather={location.weather}
                    mapCondition={mapWeatherToCondition}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

      {/* No Weather Data */}
      {!isLoading && locations.length === 0 && activeFlights.length === 0 && (
        <section className="mb-6">
            <h2 className="text-base font-semibold text-foreground mb-4">Weather Summary</h2>
            <div className="text-center py-8 text-muted-foreground border border-border rounded-sm">
              <p className="mb-2">No weather data available</p>
              <p className="text-sm">Weather will appear here once you create flights.</p>
            </div>
          </section>
        )}

      {/* Active Alerts */}
      <FlightAlerts alerts={activeAlerts} isLoading={alertsLoading} />
    </div>
  );
}
