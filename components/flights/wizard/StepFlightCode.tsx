'use client';

import { motion } from 'framer-motion';
import { useFormContext } from 'react-hook-form';
import { FLIGHT_STATUS_OPTIONS, type FlightFormValues } from '@/lib/validation/flight';
import FlightStatusSelector from './FlightStatusSelector';

export default function StepFlightCode() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<FlightFormValues>();

  const flightCode = watch('flightCode') || '';
  const status = watch('status');
  const flightCodeField = register('flightCode');

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto space-y-8"
    >
      <div>
        <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground mb-1">
          IDENTIFICATION
        </p>
        <h2 className="text-xl font-light tracking-tight text-foreground mb-4">
          Flight code &amp; status
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Flight Code */}
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-1">
            Flight Code <span className="text-red">*</span>
          </label>
          <div className="groove-input rounded-sm px-3 py-2 flex items-center gap-2">
            <input
              type="text"
              {...flightCodeField}
              value={flightCode}
              onChange={(event) => {
                const uppercase = event.target.value.toUpperCase();
                setValue('flightCode', uppercase, { shouldDirty: true, shouldValidate: true });
              }}
              placeholder="e.g., AA123, BAW456"
              maxLength={10}
              className="w-full bg-transparent text-sm font-mono tabular-nums uppercase text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          {errors.flightCode && (
            <p className="mt-1 text-xs text-red">{errors.flightCode.message}</p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            Flight number or callsign (3-10 characters)
          </p>
        </div>

        {/* Status */}
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-1">
            Flight Status <span className="text-red">*</span>
          </label>
          <FlightStatusSelector 
            value={status} 
            onChange={(newStatus) => setValue('status', newStatus, { shouldDirty: true, shouldValidate: true })}
          />
        </div>
      </div>
    </motion.div>
  );
}
