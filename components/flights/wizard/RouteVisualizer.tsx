'use client';

import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface RouteVisualizerProps {
  origin?: {
    icao: string;
    iata?: string;
    name: string;
  } | null;
  destination?: {
    icao: string;
    iata?: string;
    name: string;
  } | null;
}

export default function RouteVisualizer({ origin, destination }: RouteVisualizerProps) {
  if (!origin && !destination) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 bg-surface border border-border"
    >
      <div className="flex items-center justify-center gap-4">
        {/* Origin */}
        <div className="text-center">
          {origin ? (
            <>
              <div className="text-2xl font-mono font-bold text-text-primary">
                {origin.icao}
              </div>
              <div className="text-xs text-text-secondary mt-1">
                {origin.iata && `${origin.iata} · `}Origin
              </div>
            </>
          ) : (
            <div className="text-2xl font-mono font-bold text-gray">—</div>
          )}
        </div>

        {/* Arrow */}
        <ArrowRight
          size={32}
          className={origin && destination ? 'text-blue' : 'text-gray'}
        />

        {/* Destination */}
        <div className="text-center">
          {destination ? (
            <>
              <div className="text-2xl font-mono font-bold text-text-primary">
                {destination.icao}
              </div>
              <div className="text-xs text-text-secondary mt-1">
                {destination.iata && `${destination.iata} · `}Destination
              </div>
            </>
          ) : (
            <div className="text-2xl font-mono font-bold text-gray">—</div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
