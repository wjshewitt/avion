'use client';

import { motion } from 'framer-motion';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import type { FlightFormValues } from '@/lib/validation/flight';
import AirportSearchInput from './AirportSearchInput';
import RouteVisualizer from './RouteVisualizer';

export default function StepRoute() {
  const {
    control,
    formState: { errors },
  } = useFormContext<FlightFormValues>();

  const origin = useWatch({ control, name: 'origin' }) || null;
  const destination = useWatch({ control, name: 'destination' }) || null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div>
        <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground mb-1">
          ROUTING
        </p>
        <h2 className="text-xl font-light tracking-tight text-foreground mb-4">
          Select origin &amp; destination
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Origin */}
        <Controller
          name="origin"
          control={control}
          render={({ field }) => (
            <AirportSearchInput
              label="Origin Airport"
              value={field.value || null}
              onChange={(airport) => field.onChange(airport)}
              error={errors.origin?.message as string | undefined}
              required
              placeholder="Search for departure airport..."
            />
          )}
        />

        {/* Destination */}
        <Controller
          name="destination"
          control={control}
          render={({ field }) => (
            <AirportSearchInput
              label="Destination Airport"
              value={field.value || null}
              onChange={(airport) => field.onChange(airport)}
              error={errors.destination?.message as string | undefined}
              required
              placeholder="Search for arrival airport..."
            />
          )}
        />

        <div className="md:col-span-2">
          <RouteVisualizer origin={origin} destination={destination} />
        </div>
      </div>
    </motion.div>
  );
}
