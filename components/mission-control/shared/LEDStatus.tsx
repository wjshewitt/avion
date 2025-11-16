'use client';

import { motion } from 'framer-motion';

interface LEDStatusProps {
  status: 'ready' | 'thinking' | 'streaming' | 'error';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
  ready: { color: '#10b981', label: 'Ready', animate: false },
  thinking: { color: '#f59e0b', label: 'Thinking', animate: true },
  streaming: { color: '#2563eb', label: 'Streaming', animate: true },
  error: { color: '#F04E30', label: 'Error', animate: false },
};

const sizeConfig = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5',
};

export function LEDStatus({ status, label, size = 'md' }: LEDStatusProps) {
  const config = statusConfig[status];
  const sizeClass = sizeConfig[size];

  return (
    <div className="flex items-center gap-2">
      <motion.div
        className={`${sizeClass} rounded-full`}
        style={{ backgroundColor: config.color }}
        animate={
          config.animate
            ? {
                opacity: [1, 0.4, 1],
              }
            : {}
        }
        transition={
          config.animate
            ? {
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }
            : {}
        }
      />
      {label !== undefined && (
        <span className="text-xs text-zinc-400">
          {label || config.label}
        </span>
      )}
    </div>
  );
}
