'use client';

import { motion } from 'framer-motion';
import DateTimePicker from './DateTimePicker';

interface StepScheduleProps {
  scheduledAt: string;
  arrivalAt: string;
  onScheduledAtChange: (date: string) => void;
  onArrivalAtChange: (date: string) => void;
  errors: {
    scheduledAt?: string;
    arrivalAt?: string;
  };
}

export default function StepSchedule({
  scheduledAt,
  arrivalAt,
  onScheduledAtChange,
  onArrivalAtChange,
  errors,
}: StepScheduleProps) {
  const handleScheduledChange = (isoString: string) => {
    console.log('StepSchedule received scheduledAt:', isoString);
    onScheduledAtChange(isoString);
    
    // Auto-set arrival to 2 hours later if not set
    if (!arrivalAt) {
      const date = new Date(isoString);
      date.setHours(date.getHours() + 2);
      const arrivalIso = date.toISOString();
      console.log('Auto-setting arrivalAt:', arrivalIso);
      onArrivalAtChange(arrivalIso);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto"
    >
      <div className="grid grid-cols-2 gap-6">
        {/* Scheduled Departure */}
        <DateTimePicker
          label="Scheduled Departure"
          value={scheduledAt}
          onChange={handleScheduledChange}
          error={errors.scheduledAt}
          required
        />

        {/* Estimated/Scheduled Arrival */}
        <DateTimePicker
          label="Estimated Arrival"
          value={arrivalAt}
          onChange={onArrivalAtChange}
          error={errors.arrivalAt}
          minDate={scheduledAt ? new Date(scheduledAt) : undefined}
        />

        {/* Flight Duration Display - full width */}
        {scheduledAt && arrivalAt && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-2 p-4 bg-surface border border-border"
          >
            <div className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
              Flight Duration
            </div>
            <div className="text-lg font-mono font-bold text-text-primary">
              {(() => {
                const departure = new Date(scheduledAt);
                const arrival = new Date(arrivalAt);
                const durationMs = arrival.getTime() - departure.getTime();
                const hours = Math.floor(durationMs / (1000 * 60 * 60));
                const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
                return `${hours}h ${minutes}m`;
              })()}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
