'use client';

import { motion } from 'framer-motion';
import AirportSearchInput from './AirportSearchInput';
import RouteVisualizer from './RouteVisualizer';

interface Airport {
  icao: string;
  iata?: string;
  name: string;
  city: string;
  country: string;
}

interface StepRouteProps {
  origin: Airport | null;
  destination: Airport | null;
  onOriginChange: (airport: Airport | null) => void;
  onDestinationChange: (airport: Airport | null) => void;
  errors: {
    origin?: string;
    destination?: string;
  };
}

export default function StepRoute({
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
  errors,
}: StepRouteProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto"
    >
      <div className="grid grid-cols-2 gap-6">
        {/* Origin */}
        <AirportSearchInput
          label="Origin Airport"
          value={origin}
          onChange={onOriginChange}
          error={errors.origin}
          required
          placeholder="Search for departure airport..."
        />

        {/* Destination */}
        <AirportSearchInput
          label="Destination Airport"
          value={destination}
          onChange={onDestinationChange}
          error={errors.destination}
          required
          placeholder="Search for arrival airport..."
        />

        {/* Route Visualizer - full width */}
        <div className="col-span-2">
          <RouteVisualizer origin={origin} destination={destination} />
        </div>
      </div>
    </motion.div>
  );
}
