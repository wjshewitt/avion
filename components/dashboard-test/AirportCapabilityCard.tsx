'use client';

import { motion } from 'framer-motion';
import { Radio, Antenna } from 'lucide-react';

interface AirportCapabilityCardProps {
  icao: string;
  name: string;
  runways: Array<{
    ident: string;
    length: number;
    heading: number;
  }>;
  windDirection?: number;
  windSpeed?: number;
  elevation: number;
  frequency?: string;
  hasILS: boolean;
  hasVOR: boolean;
}

export function AirportCapabilityCard({
  icao,
  name,
  runways,
  windDirection = 270,
  windSpeed = 12,
  elevation,
  frequency = '118.3',
  hasILS,
  hasVOR,
}: AirportCapabilityCardProps) {
  // Use the first runway for display
  const primaryRunway = runways[0] || { ident: 'N/A', length: 0, heading: 0 };

  return (
    <div className="bg-[#f4f4f4] dark:bg-[#2a2a2a] border border-zinc-200 dark:border-zinc-700 p-6 rounded-sm h-full" style={{
      boxShadow: '-2px -2px 5px rgba(255,255,255,0.8), 2px 2px 5px rgba(0,0,0,0.05)'
    }}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-1">
          Airport Profile
        </h3>
        <div className="flex items-baseline gap-3">
          <div className="text-2xl font-mono font-bold text-zinc-900 dark:text-zinc-50">
            {icao}
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">{name}</div>
        </div>
      </div>

      {/* Runway Diagram */}
      <div className="relative bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 h-40 mb-6 rounded-sm overflow-hidden" style={{
        boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.1), inset -1px -1px 3px rgba(255,255,255,0.1)'
      }}>
        {/* Runway */}
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute top-1/2 left-1/2 bg-zinc-700 dark:bg-zinc-300"
          style={{
            width: '4px',
            height: '80%',
            transform: `translate(-50%, -50%) rotate(${primaryRunway.heading}deg)`,
            transformOrigin: 'center',
          }}
        />
        {/* Runway Label */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-mono text-zinc-600 dark:text-zinc-400">
          RWY {primaryRunway.ident}
        </div>

        {/* Wind Arrow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute top-1/2 left-1/2"
          style={{
            transform: `translate(-50%, -50%) rotate(${windDirection}deg)`,
            transformOrigin: 'center',
          }}
        >
          <div className="relative">
            <div className="w-12 h-[2px] bg-blue-500" />
            <div
              className="absolute right-0 top-1/2 -translate-y-1/2"
              style={{
                width: 0,
                height: 0,
                borderLeft: '6px solid #3b82f6',
                borderTop: '4px solid transparent',
                borderBottom: '4px solid transparent',
              }}
            />
          </div>
        </motion.div>

        {/* Wind Info */}
        <div className="absolute bottom-2 right-2 text-[10px] font-mono text-blue-600 dark:text-blue-400">
          {windDirection}° @ {windSpeed}kt
        </div>
      </div>

      {/* Airport Data */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-1">
            Length
          </div>
          <div className="text-lg font-mono tabular-nums text-zinc-900 dark:text-zinc-50">
            {primaryRunway.length.toLocaleString()} ft
          </div>
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-1">
            Elevation
          </div>
          <div className="text-lg font-mono tabular-nums text-zinc-900 dark:text-zinc-50">
            {elevation} ft
          </div>
        </div>
      </div>

      {/* Capabilities */}
      <div className="space-y-2 pt-4 border-t border-zinc-300 dark:border-zinc-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio size={12} className="text-zinc-400" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              ILS Approach
            </span>
          </div>
          <motion.div
            className={`w-2 h-2 rounded-full ${hasILS ? 'bg-emerald-500' : 'bg-zinc-400'}`}
            style={{
              boxShadow: hasILS ? '0 0 6px #10b981' : 'inset 1px 1px 2px rgba(0,0,0,0.2)',
            }}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Antenna size={12} className="text-zinc-400" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              VOR/DME
            </span>
          </div>
          <motion.div
            className={`w-2 h-2 rounded-full ${hasVOR ? 'bg-emerald-500' : 'bg-zinc-400'}`}
            style={{
              boxShadow: hasVOR ? '0 0 6px #10b981' : 'inset 1px 1px 2px rgba(0,0,0,0.2)',
            }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Tower Freq
          </span>
          <span className="text-xs font-mono tabular-nums text-zinc-900 dark:text-zinc-50">
            {frequency}
          </span>
        </div>
      </div>
    </div>
  );
}
