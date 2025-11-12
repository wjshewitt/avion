'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { useFlights } from '@/lib/tanstack/hooks/useFlights';
import { mockAlerts } from '@/lib/mock-alerts';
import type { Flight } from '@/lib/supabase/types';
import WeatherWidget from '@/components/weather-widget';
import AlertItem from '@/components/alert-item';
import CollapsiblePanel from '@/components/collapsible-panel';
import Map from '@/components/map';
import { Plane, Cloud, Bell, Loader2, ArrowRight, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
 const router = useRouter();
 const { alerts, mapCollapsed, toggleMap } = useAppStore();
 const { data: flights = [], isLoading } = useFlights();

 // Get active flights (first 3 for preview)
 const activeFlights = flights
 .filter((f) => f.status !== 'Cancelled')
 .slice(0, 3);

 // Get key locations for weather (use first 3 active flights if available)
 const locations = activeFlights.length >= 3 ? [
 { code: activeFlights[0].origin, name: activeFlights[0].origin, weather: activeFlights[0].weather_data?.origin },
 { code: activeFlights[1].origin, name: activeFlights[1].origin, weather: activeFlights[1].weather_data?.origin },
 { code: activeFlights[2].origin, name: activeFlights[2].origin, weather: activeFlights[2].weather_data?.origin },
 ] : [];

 // Get active alerts
 const activeAlerts = alerts.length > 0 ? alerts : mockAlerts;

 return (
 <div className="flex-1 overflow-y-auto">
 <div className="max-w-7xl mx-auto p-8 space-y-6">
 {/* Header */}
 <div className="pb-3 border-b border-border">
 <h1 className="text-lg font-semibold text-foreground">Flight Operations</h1>
 </div>

 {/* Active Flights */}
 <section>
 <div className="flex items-center gap-3 mb-4">
 <Plane size={18} className="text-blue" />
 <h2 className="text-base font-semibold text-foreground">Active Flights</h2>
 {activeFlights.length > 0 && (
 <span className="text-xs px-2 py-1 bg-surface border border-border font-medium text-muted-foreground">
 {activeFlights.length}
 </span>
 )}
 </div>
 {isLoading ? (
 <div className="flex items-center justify-center py-12">
 <Loader2 className="h-8 w-8 animate-spin text-blue" />
 </div>
 ) : activeFlights.length > 0 ? (
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {activeFlights.map((flight) => (
 <button
 key={flight.id}
 onClick={() => router.push(`/flights/${flight.id}`)}
 className="w-full bg-card border border-border p-4 hover:shadow-md hover:border-blue transition-all duration-150 text-left"
 >
 <div className="flex items-start justify-between mb-3">
 <div>
 <div className="font-mono text-lg font-semibold text-foreground mb-1">
 {flight.code}
 </div>
 <div className="flex items-center gap-2 text-sm text-muted-foreground">
 <span>{flight.origin}</span>
 <ArrowRight size={14} />
 <span>{flight.destination}</span>
 </div>
 </div>
 {flight.weather_alert_level && (
 <span
 className={`text-xs px-2 py-1 border font-semibold ${
 flight.weather_alert_level === 'red'
 ? 'bg-red/10 text-red border-red/20'
 : flight.weather_alert_level === 'yellow'
 ? 'bg-amber/10 text-amber border-amber/20'
 : 'bg-green/10 text-green border-green/20'
 }`}
 >
 {flight.weather_alert_level.toUpperCase()}
 </span>
 )}
 </div>
 <div className="flex items-center justify-between text-sm">
 <div className="text-muted-foreground">
 {new Date(flight.scheduled_at).toLocaleString(undefined, {
 month: 'short',
 day: 'numeric',
 hour: '2-digit',
 minute: '2-digit',
 })}
 </div>
 <div className={`font-semibold ${
 flight.status === 'On Time' ? 'text-green' :
 flight.status === 'Delayed' ? 'text-amber' :
 'text-red'
 }`}>
 {flight.status}
 </div>
 </div>
 </button>
 ))}
 </div>
 ) : (
 <div className="text-center py-12 text-muted-foreground">
 <p>No active flights. <Link href="/flights" className="text-blue hover:underline">Create your first flight</Link></p>
 </div>
 )}
 </section>

 {/* Map Section */}
 <section>
 <CollapsiblePanel
 title="Route Map"
 defaultExpanded={!mapCollapsed}
 storageKey="dashboard-map"
 >
 <Map />
 </CollapsiblePanel>
 </section>

 {/* Weather Summary */}
 {locations.length > 0 && (
 <section>
 <div className="flex items-center gap-3 mb-4">
 <Cloud size={18} className="text-blue" />
 <h2 className="text-base font-semibold text-foreground">Weather Summary</h2>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {locations.map((location) => (
 <WeatherWidget
 key={location.code}
 location={location.name}
 weather={location.weather}
 icao={location.code}
 />
 ))}
 </div>
 </section>
 )}

 {/* Active Alerts */}
 {activeAlerts.length > 0 && (
 <section data-section="alerts">
 <div className="flex items-center gap-3 mb-4">
 <Bell size={18} className="text-amber" />
 <h2 className="text-base font-semibold text-foreground">Active Alerts</h2>
 <span className="text-xs px-2 py-1 bg-amber-50 border border-amber-200 font-medium text-amber-700">
 {activeAlerts.length}
 </span>
 </div>
 <div className="space-y-3">
 {activeAlerts.map((alert) => (
 <AlertItem key={alert.id} alert={alert} />
 ))}
 </div>
 </section>
 )}
 </div>
 </div>
 );
}
