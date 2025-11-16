
'use client';

import { motion } from 'framer-motion';
import { useCallback } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { FlightFormValues } from '@/lib/validation/flight';
import SchedulePicker from './SchedulePicker';

export default function StepSchedule() {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<FlightFormValues>();

  const scheduledAt = useWatch({ control, name: 'scheduledAt' }) || '';
  const arrivalAt = useWatch({ control, name: 'arrivalAt' }) || '';

  const handleScheduledChange = useCallback((isoString: string) => {
    const newDepartureDate = new Date(isoString);
    if (Number.isNaN(newDepartureDate.getTime())) return;

    const currentDepartureDate = scheduledAt ? new Date(scheduledAt) : null;
    if (currentDepartureDate && newDepartureDate.getTime() === currentDepartureDate.getTime()) {
      return;
    }

    setValue('scheduledAt', isoString, { shouldDirty: true, shouldValidate: true });

    const arrivalDate = arrivalAt ? new Date(arrivalAt) : null;

    if (!arrivalDate || arrivalDate < newDepartureDate) {
      const newArrivalDate = new Date(newDepartureDate.getTime() + 2 * 60 * 60 * 1000);
      setValue('arrivalAt', newArrivalDate.toISOString(), { shouldDirty: true, shouldValidate: true });
    }
  }, [arrivalAt, scheduledAt, setValue]);

  const handleArrivalChange = useCallback((isoString: string) => {
    const newArrivalDate = new Date(isoString);
    if (Number.isNaN(newArrivalDate.getTime())) return;

    const currentArrivalDate = arrivalAt ? new Date(arrivalAt) : null;
    if (currentArrivalDate && newArrivalDate.getTime() === currentArrivalDate.getTime()) {
      return;
    }

    setValue('arrivalAt', isoString, { shouldDirty: true, shouldValidate: true });
  }, [arrivalAt, setValue]);

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
          SCHEDULE
        </p>
        <h2 className="text-2xl font-light tracking-tight text-foreground mb-2">
          Schedule
        </h2>
        <p className="text-sm text-muted-foreground">
          Select a date from the calendar, then specify departure and arrival times.
        </p>
      </div>

      <SchedulePicker
        scheduledAt={scheduledAt}
        arrivalAt={arrivalAt}
        onScheduledAtChange={handleScheduledChange}
        onArrivalAtChange={handleArrivalChange}
        errors={{
          scheduledAt: errors.scheduledAt?.message as string | undefined,
          arrivalAt: errors.arrivalAt?.message as string | undefined,
        }}
      />

      {scheduledAt && arrivalAt && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-white/50 dark:bg-black/20 border border-zinc-200/80 dark:border-zinc-800/50 rounded-sm"
        >
          <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-1">
            Total Flight Time
          </div>
          <div className="text-xl font-mono tabular-nums font-semibold text-zinc-800 dark:text-zinc-200">
            {(() => {
              try {
                const departure = new Date(scheduledAt);
                const arrival = new Date(arrivalAt);
                if (isNaN(departure.getTime()) || isNaN(arrival.getTime()) || arrival < departure) {
                  return '--h --m';
                }
                const durationMs = arrival.getTime() - departure.getTime();
                const hours = Math.floor(durationMs / (1000 * 60 * 60));
                const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
                return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
              } catch (e) {
                return '--h --m';
              }
            })()}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
