'use client';

import { motion } from 'framer-motion';

interface StepFlightCodeProps {
  flightCode: string;
  status: 'On Time' | 'Delayed' | 'Cancelled';
  onFlightCodeChange: (code: string) => void;
  onStatusChange: (status: 'On Time' | 'Delayed' | 'Cancelled') => void;
  errors: {
    flightCode?: string;
  };
}

export default function StepFlightCode({
  flightCode,
  status,
  onFlightCodeChange,
  onStatusChange,
  errors,
}: StepFlightCodeProps) {
  const statuses: Array<'On Time' | 'Delayed' | 'Cancelled'> = ['On Time', 'Delayed', 'Cancelled'];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto"
    >
      <div className="grid grid-cols-2 gap-8">
        {/* Flight Code */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
            Flight Code <span className="text-red">*</span>
          </label>
          <input
            type="text"
            value={flightCode}
            onChange={(e) => onFlightCodeChange(e.target.value.toUpperCase())}
            placeholder="e.g., AA123, BAW456"
            maxLength={10}
            className={`w-full h-10 px-4 border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue ${
              errors.flightCode ? 'border-red' : 'border-border'
            }`}
          />
          {errors.flightCode && (
            <p className="mt-1 text-xs text-red">{errors.flightCode}</p>
          )}
          <p className="mt-2 text-xs text-text-secondary">
            Flight number or callsign (3-10 characters)
          </p>
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
            Flight Status <span className="text-red">*</span>
          </label>
          <div className="grid grid-cols-1 gap-2">
            {statuses.map((statusOption) => {
              const isSelected = status === statusOption;
              const colorClasses = {
                'On Time': isSelected 
                  ? 'border-green bg-green/10' 
                  : 'border-border hover:border-green/50',
                'Delayed': isSelected 
                  ? 'border-amber bg-amber/10' 
                  : 'border-border hover:border-amber/50',
                'Cancelled': isSelected 
                  ? 'border-red bg-red/10' 
                  : 'border-border hover:border-red/50',
              };
              
              return (
                <button
                  key={statusOption}
                  onClick={() => onStatusChange(statusOption)}
                  className={`p-3 border-2 transition-all flex items-center gap-3 ${colorClasses[statusOption]}`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      statusOption === 'On Time'
                        ? 'bg-green'
                        : statusOption === 'Delayed'
                        ? 'bg-amber'
                        : 'bg-red'
                    }`}
                  />
                  <div className="text-sm font-semibold text-text-primary">
                    {statusOption}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
