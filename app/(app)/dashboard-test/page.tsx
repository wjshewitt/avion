'use client';

import { motion } from 'framer-motion';
import { useFlights } from '@/lib/tanstack/hooks/useFlights';
import { Loader2 } from 'lucide-react';
import { FlightOpsHeader } from '@/components/dashboard-test/FlightOpsHeader';
import { ActiveFlightCard } from '@/components/dashboard-test/ActiveFlightCard';
import { LiveFleetMonitor } from '@/components/dashboard-test/LiveFleetMonitor';
import { WeatherAtmosphereEngine } from '@/components/dashboard-test/WeatherAtmosphereEngine';
import { RiskPrismWidget } from '@/components/dashboard-test/RiskPrismWidget';
import { AirportCapabilityCard } from '@/components/dashboard-test/AirportCapabilityCard';
import { RouteMapWireframe } from '@/components/dashboard-test/RouteMapWireframe';
import { SystemHealthPanel } from '@/components/dashboard-test/SystemHealthPanel';

export default function DashboardTestPage() {
  const { data: flights = [], isLoading } = useFlights();

  // Mock flight data for demonstration
  const mockFlights = [
    {
      id: '1',
      code: 'AVN881',
      origin: 'EGLL',
      destination: 'KTEB',
      scheduled_at: new Date(Date.now() + 3600000).toISOString(),
      status: 'On Time',
      weather_alert_level: 'green',
    },
    {
      id: '2',
      code: 'AVN204',
      origin: 'LFMN',
      destination: 'EGLF',
      scheduled_at: new Date(Date.now() + 7200000).toISOString(),
      status: 'On Time',
      weather_alert_level: 'yellow',
    },
    {
      id: '3',
      code: 'AVN511',
      origin: 'KTEB',
      destination: 'KVNY',
      scheduled_at: new Date(Date.now() + 10800000).toISOString(),
      status: 'Delayed',
      weather_alert_level: 'red',
    },
  ];

  // Get active flights (use mock data if no real flights)
  const activeFlights = flights.length > 0
    ? flights.filter((f) => f.status !== 'Cancelled').slice(0, 3)
    : mockFlights;

  // Primary flight for live monitor
  const primaryFlight = activeFlights[0];

  // Mock data for demonstration
  const mockRiskFactors = [
    { name: 'Geopolitical', value: 15, level: 'low' as const },
    { name: 'Weather', value: 75, level: 'high' as const },
    { name: 'Fatigue', value: 35, level: 'moderate' as const },
  ];

  const mockSystems = [
    { name: 'Engines', status: 'operational' as const, value: 100 },
    { name: 'Hydraulics', status: 'operational' as const, value: 98 },
    { name: 'Avionics', status: 'operational' as const, value: 94 },
  ];

  return (
    <div className="min-h-screen bg-[#e8e8e8] dark:bg-zinc-950">
      {/* Header */}
      <FlightOpsHeader />

      {/* Main Content */}
      <div className="relative">
        {/* Technical Grid Background */}
        <div className="absolute inset-0 tech-grid opacity-40 pointer-events-none" />

        <div className="relative max-w-[1600px] mx-auto px-8 py-8 space-y-8">
          {/* Section: Active Flights */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <h2 className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-400 mb-2">
                Active Operations
              </h2>
              <h3 className="text-2xl font-light tracking-tight text-zinc-900 dark:text-zinc-50">
                Active Flights
              </h3>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeFlights.map((flight, index) => (
                <ActiveFlightCard key={flight.id} flight={flight} index={index} />
              ))}
            </div>
          </section>

          {/* Section: Live Fleet Monitor */}
          <section>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-6"
              >
                <h2 className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-400 mb-2">
                  Real-Time Telemetry
                </h2>
                <h3 className="text-2xl font-light tracking-tight text-zinc-900 dark:text-zinc-50">
                  Live Fleet Monitor
                </h3>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <LiveFleetMonitor
                  flight={{
                    code: primaryFlight.code,
                    origin: primaryFlight.origin,
                    destination: primaryFlight.destination,
                    etaMinutes: 255,
                    altitude: 41000,
                    speed: 0.85,
                    fuel: 92.5,
                  }}
                />
              </motion.div>
            </section>

          {/* Section: Weather, Risk & Airport Data */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-6"
            >
              <h2 className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-400 mb-2">
                Operational Intelligence
              </h2>
              <h3 className="text-2xl font-light tracking-tight text-zinc-900 dark:text-zinc-50">
                Weather & Risk Analysis
              </h3>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <WeatherAtmosphereEngine
                  type="rain"
                  icao="KJFK"
                  metar="KJFK 131251Z 27012KT 10SM FEW250 08/M03 A3012"
                  flightCategory="IFR"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <RiskPrismWidget overallScore={42} factors={mockRiskFactors} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <AirportCapabilityCard
                  icao="KTEB"
                  name="Teterboro"
                  runways={[
                    { ident: '06/24', length: 7000, heading: 60 },
                  ]}
                  windDirection={270}
                  windSpeed={12}
                  elevation={9}
                  frequency="119.5"
                  hasILS={true}
                  hasVOR={true}
                />
              </motion.div>
            </div>
          </section>

          {/* Section: Route Map & System Health */}
          <section>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mb-6"
              >
                <h2 className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-400 mb-2">
                  Navigation & Status
                </h2>
                <h3 className="text-2xl font-light tracking-tight text-zinc-900 dark:text-zinc-50">
                  Flight Path & Systems
                </h3>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="lg:col-span-2"
                >
                  <RouteMapWireframe
                    flightCode={primaryFlight.code}
                    origin={primaryFlight.origin}
                    destination={primaryFlight.destination}
                    altitude={41000}
                    speed={480}
                    eta="08:45"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                >
                  <SystemHealthPanel systems={mockSystems} fuelRemaining={92.5} />
                </motion.div>
              </div>
            </section>

          {/* Footer Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-center py-8 border-t border-zinc-300 dark:border-zinc-700"
          >
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-400 mb-2">
              Avion Design Language v1.2
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Dashboard Test Environment · Ceramic/Tungsten Material System · Live Data Integration
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
