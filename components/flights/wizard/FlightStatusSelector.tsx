'use client';

import { motion } from 'framer-motion';

interface FlightStatusSelectorProps {
  value: 'On Time' | 'Delayed' | 'Cancelled';
  onChange: (status: 'On Time' | 'Delayed' | 'Cancelled') => void;
}

export default function FlightStatusSelector({ value, onChange }: FlightStatusSelectorProps) {
  const statuses: Array<'On Time' | 'Delayed' | 'Cancelled'> = ['On Time', 'Delayed', 'Cancelled'];
  const colors = {
    'On Time': 'border-emerald-500 text-emerald-500',
    Delayed: 'border-amber-500 text-amber-500',
    Cancelled: 'border-[#F04E30] text-[#F04E30]',
  };

  return (
    <div className="flex flex-col gap-3">
      {statuses.map((status) => (
        <div
          key={status}
          onClick={() => onChange(status)}
          className={`p-3 rounded-sm border cursor-pointer transition-all flex items-center justify-between ${
            value === status
              ? colors[status as keyof typeof colors] + ' bg-white/50'
              : 'border-zinc-200 text-zinc-600 hover:border-zinc-400'
          }`}
        >
          <span className="font-medium text-sm">{status}</span>
          {value === status && (
            <motion.div
              layoutId="status-selector-check"
              className="w-4 h-4 bg-current rounded-full"
            />
          )}
        </div>
      ))}
    </div>
  );
}
