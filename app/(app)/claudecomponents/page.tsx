"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Cloud,
  Sliders,
  Database,
  Bot,
  Gauge,
  Wind,
  ToggleLeft,
  ClipboardList,
  MessageSquare,
  AlertCircle,
  Users,
  MapPin
} from 'lucide-react';

// Import components
import RiskPrismGauge from '@/components/avion/RiskPrismGauge';
import FuelMonitor from '@/components/avion/FuelMonitor';
import WeatherViewport from '@/components/avion/WeatherViewport';
import MechanicalSwitch from '@/components/avion/MechanicalSwitch';
import Scratchpad from '@/components/avion/Scratchpad';
import FlightManifest from '@/components/avion/FlightManifest';
import TelemetryGrid from '@/components/avion/TelemetryGrid';
import ThinkingIndicator from '@/components/avion/ThinkingIndicator';
import AIMessage from '@/components/avion/AIMessage';
import FlightStatusDashboard from '@/components/avion/FlightStatusDashboard';
import ResourceAllocationGrid from '@/components/avion/ResourceAllocationGrid';
import EnhancedAlertSystem from '@/components/avion/EnhancedAlertSystem';
import EnhancedCommunicationHub from '@/components/avion/EnhancedCommunicationHub';
import EnhancedWeatherViewport from '@/components/avion/EnhancedWeatherViewport';

const tabs = [
  {
    id: 'operations',
    label: 'Operations',
    icon: Activity,
    description: 'Flight operations management and status monitoring'
  },
  {
    id: 'resources',
    label: 'Resources',
    icon: Database,
    description: 'Crew, aircraft, and equipment allocation tracking'
  },
  {
    id: 'alerts',
    label: 'Alert System',
    icon: AlertCircle,
    description: 'Real-time alerts and notifications management'
  },
  {
    id: 'weather',
    label: 'Weather Viewports',
    icon: Cloud,
    description: 'Atmospheric effects and meteorological data visualization'
  },
  {
    id: 'communications',
    label: 'Communications',
    icon: MessageSquare,
    description: 'Team collaboration and message center'
  }
];

export default function ClaudeComponentsPage() {
  const [activeTab, setActiveTab] = useState('operations');

  return (
    <div className="min-h-screen bg-tungsten text-[#E5E5E5]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-[#333] bg-[#1A1A1A] px-6 py-8"
      >
        <div className="max-w-7xl mx-auto">
          <motion.h1
            className="font-heading text-5xl font-bold text-white mb-2 tracking-tight"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            AVION COMPONENTS
          </motion.h1>
          <motion.p
            className="text-[#A1A1AA] text-lg font-mono uppercase tracking-widest text-sm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            Flight OS Design Language v1.5 — Precision Instrumentation
          </motion.p>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="bg-[#2A2A2A] border-b border-[#333] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8 overflow-x-auto py-0">
            {tabs.map((tab, index) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative py-4 px-1 transition-colors whitespace-nowrap ${
                  activeTab === tab.id ? 'text-white' : 'text-[#71717A] hover:text-[#A1A1AA]'
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
              >
                <div className="flex items-center space-x-2">
                  <tab.icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </div>
                {activeTab === tab.id && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F04E30]"
                    layoutId="activeTab"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Operations Tab */}
            {activeTab === 'operations' && (
              <div className="space-y-8">
                <FlightStatusDashboard
                  flights={[
                    {
                      id: '1',
                      flightNumber: 'AVN-881',
                      route: 'KJFK → EGLL',
                      status: 'boarding',
                      gate: 'B12',
                      departure: '14:30',
                      arrival: '02:15',
                      aircraft: 'B789',
                      passengers: 287
                    },
                    {
                      id: '2',
                      flightNumber: 'AVN-342',
                      route: 'KLAX → KORD',
                      status: 'delayed',
                      gate: 'A5',
                      departure: '16:45',
                      arrival: '22:30',
                      aircraft: 'A321',
                      passengers: 182,
                      delay: 25
                    },
                    {
                      id: '3',
                      flightNumber: 'AVN-215',
                      route: 'EHAM → Dubai',
                      status: 'on-time',
                      gate: 'C8',
                      departure: '18:00',
                      arrival: '02:30',
                      aircraft: 'B77W',
                      passengers: 327
                    }
                  ]}
                />
              </div>
            )}

            {/* Resources Tab */}
            {activeTab === 'resources' && (
              <div className="space-y-8">
                <ResourceAllocationGrid
                  resources={[
                    {
                      id: 'crew-1',
                      name: 'Captain Stevens',
                      type: 'crew',
                      status: 'available',
                      location: 'Operations',
                      efficiency: 95,
                      nextAvailable: '14:00'
                    },
                    {
                      id: 'ac-1',
                      name: 'N881AV',
                      type: 'aircraft',
                      status: 'assigned',
                      location: 'Gate B12',
                      cost: 3500,
                      utilization: 78,
                      currentAssignment: 'AVN-881'
                    },
                    {
                      id: 'gate-1',
                      name: 'B12',
                      type: 'gate',
                      status: 'assigned',
                      location: 'Terminal B',
                      currentAssignment: 'AVN-881'
                    }
                  ]}
                />
              </div>
            )}

            {/* Alerts Tab */}
            {activeTab === 'alerts' && (
              <div className="space-y-8">
                <EnhancedAlertSystem
                  alerts={[
                    {
                      id: 'alert-1',
                      type: 'critical',
                      category: 'weather',
                      title: 'Severe Weather Warning',
                      message: 'Thunderstorms detected along flight path AVN-342. Consider rerouting.',
                      timestamp: new Date(Date.now() - 5 * 60000),
                      flightId: 'AVN-342',
                      location: 'KLAX-KORD Corridor',
                      severity: 5,
                      acknowledged: false,
                      resolved: false,
                      source: 'NWS',
                      metadata: { windSpeed: '45KT', visibility: '2SM' },
                      actions: [
                        { label: 'Reroute', action: () => {}, primary: true },
                        { label: 'Delay', action: () => {} }
                      ],
                      timeline: [
                        { time: new Date(Date.now() - 30 * 60000), event: 'Alert generated', type: 'update' },
                        { time: new Date(Date.now() - 5 * 60000), event: 'System notification sent', type: 'action' }
                      ]
                    },
                    {
                      id: 'alert-2',
                      type: 'warning',
                      category: 'operational',
                      title: 'Gate Change Required',
                      message: 'Gate A5 maintenance scheduled. Aircraft needs repositioning.',
                      timestamp: new Date(Date.now() - 15 * 60000),
                      flightId: 'AVN-342',
                      severity: 3,
                      acknowledged: true,
                      resolved: false,
                      source: 'OPS',
                      actions: [
                        { label: 'Reassign Gate', action: () => {}, primary: true },
                        { label: 'View Schedule', action: () => {} }
                      ]
                    },
                    {
                      id: 'alert-3',
                      type: 'system',
                      category: 'system',
                      title: 'System Update',
                      message: 'Flight planning system update completed successfully.',
                      timestamp: new Date(Date.now() - 60 * 60000),
                      severity: 1,
                      acknowledged: true,
                      resolved: true,
                      source: 'SYSTEM'
                    }
                  ]}
                />
              </div>
            )}

            {/* Weather Viewports Tab */}
            {activeTab === 'weather' && (
              <div className="space-y-8">
                <motion.div
                  className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ staggerChildren: 0.1 }}
                >
                  <motion.div
                    className="bg-[#2A2A2A] rounded-sm overflow-hidden border border-[#333]"
                    whileHover={{ scale: 1.02 }}
                  >
                    <WeatherViewport
                      icao="KJFK"
                      condition="heavy-rain"
                      temperature="12°C"
                      wind="270/15"
                      visibility="5SM"
                    />
                  </motion.div>

                  <motion.div
                    className="bg-[#2A2A2A] rounded-sm overflow-hidden border border-[#333]"
                    whileHover={{ scale: 1.02 }}
                  >
                    <WeatherViewport
                      icao="EHAM"
                      condition="snow"
                      temperature="-2°C"
                      wind="210/25"
                      visibility="2500M"
                    />
                  </motion.div>

                  <motion.div
                    className="bg-[#2A2A2A] rounded-sm overflow-hidden border border-[#333]"
                    whileHover={{ scale: 1.02 }}
                  >
                    <WeatherViewport
                      icao="LFPG"
                      condition="fog"
                      temperature="8°C"
                      wind="VRB05"
                      visibility="200M"
                    />
                  </motion.div>
                </motion.div>
              </div>
            )}

            {/* Communications Tab */}
            {activeTab === 'communications' && (
              <div className="h-[600px]">
                <EnhancedCommunicationHub
                  channels={[
                    {
                      id: 'ops',
                      name: 'Operations Team',
                      type: 'department',
                      members: 12,
                      isActive: true,
                      priority: true,
                      description: 'Primary operations coordination',
                      tags: ['operations', 'critical']
                    },
                    {
                      id: 'avn-881',
                      name: 'Flight AVN-881',
                      type: 'flight',
                      members: 5,
                      lastMessage: 'Boarding completed, ready for pushback',
                      lastActivity: new Date(Date.now() - 5 * 60000),
                      priority: true
                    },
                    {
                      id: 'weather-alert',
                      name: 'Weather Alert Channel',
                      type: 'emergency',
                      members: 8,
                      lastMessage: 'Thunderstorm warning for route AVN-342',
                      lastActivity: new Date(Date.now() - 2 * 60000),
                      priority: true
                    },
                    {
                      id: 'crew-cheng',
                      name: 'Captain Chen',
                      type: 'direct',
                      lastMessage: 'Weather report received',
                      lastActivity: new Date(Date.now() - 20 * 60000)
                    }
                  ]}
                  messages={[]}
                  currentUserId="user-1"
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-16 border-t border-[#333] bg-[#1A1A1A] px-6 py-6"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="text-[#71717A] text-sm font-mono">
            AVION FLIGHT OS · Design Language v1.5
          </p>
          <p className="text-[#71717A] text-sm font-mono">
            Flight Management Components
          </p>
        </div>
      </motion.div>
    </div>
  );
}