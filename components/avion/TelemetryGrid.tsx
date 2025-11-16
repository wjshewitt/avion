"use client";

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TelemetryData {
  label: string;
  value: string;
  unit: string;
}

interface TelemetryGridProps {
  data: TelemetryData[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export default function TelemetryGrid({ data, columns = 3, className }: TelemetryGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4'
  }[columns];

  return (
    <div className={cn("space-y-2", className)}>
      <div className={cn("grid gap-3", gridCols)}>
        {data.map((item, index) => (
          <motion.div
            key={item.label}
            className="bg-[#1A1A1A] rounded-sm p-3 border border-[#333] transition-all duration-200"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: index * 0.05,
              type: "spring",
              stiffness: 200,
              damping: 20
            }}
            whileHover={{ scale: 1.05, backgroundColor: '#222' }}
          >
            {/* Label */}
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#71717A] mb-1">
              {item.label}
            </div>

            {/* Value and Unit */}
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-mono text-white tabular-nums leading-none">
                {item.value}
              </span>
              {item.unit && (
                <span className="text-xs font-mono text-[#A1A1AA] uppercase tracking-wide ml-2">
                  {item.unit}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Data source indicator */}
      <motion.div
        className="flex items-center justify-center pt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: data.length * 0.05 + 0.3 }}
      >
        <div className="flex items-center space-x-2">
          <motion.div
            className="w-1.5 h-1.5 bg-emerald-500 rounded-full"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-[8px] font-mono uppercase tracking-widest text-[#71717A]">
            Live Data
          </span>
        </div>
      </motion.div>
    </div>
  );
}