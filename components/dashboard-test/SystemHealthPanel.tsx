'use client';

import { motion } from 'framer-motion';
import { Zap, Droplet, Cpu } from 'lucide-react';

interface SystemHealthPanelProps {
  systems: Array<{
    name: string;
    status: 'operational' | 'warning' | 'critical';
    value?: number;
  }>;
  fuelRemaining: number;
}

export function SystemHealthPanel({ systems, fuelRemaining }: SystemHealthPanelProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-emerald-500';
      case 'warning':
        return 'bg-amber-500';
      case 'critical':
        return 'bg-[#F04E30]';
      default:
        return 'bg-zinc-400';
    }
  };

  const getStatusGlow = (status: string) => {
    switch (status) {
      case 'operational':
        return '0 0 6px #10b981';
      case 'warning':
        return '0 0 6px #f59e0b';
      case 'critical':
        return '0 0 8px #F04E30';
      default:
        return 'inset 1px 1px 2px rgba(0,0,0,0.2)';
    }
  };

  const systemIcons: Record<string, any> = {
    Engines: Zap,
    Hydraulics: Droplet,
    Avionics: Cpu,
  };

  return (
    <div className="bg-[#f4f4f4] dark:bg-[#2a2a2a] border border-zinc-200 dark:border-zinc-700 p-6 rounded-sm h-full flex flex-col" style={{
      boxShadow: '-2px -2px 5px rgba(255,255,255,0.8), 2px 2px 5px rgba(0,0,0,0.05)'
    }}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-1">
          System Health
        </h3>
        <div className="text-2xl font-light text-zinc-900 dark:text-zinc-50">All Systems</div>
      </div>

      {/* System Status LEDs */}
      <div className="space-y-4 mb-6 flex-1">
        {systems.map((system, index) => {
          const Icon = systemIcons[system.name] || Cpu;
          return (
            <motion.div
              key={system.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Icon size={14} className="text-zinc-400" />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">{system.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {system.value !== undefined && (
                  <span className="text-xs font-mono tabular-nums text-zinc-500 dark:text-zinc-400">
                    {system.value}%
                  </span>
                )}
                <motion.div
                  className={`w-2 h-2 rounded-full ${getStatusColor(system.status)}`}
                  style={{
                    boxShadow: getStatusGlow(system.status),
                  }}
                  animate={
                    system.status === 'warning' || system.status === 'critical'
                      ? { opacity: [1, 0.5, 1] }
                      : {}
                  }
                  transition={
                    system.status === 'warning' || system.status === 'critical'
                      ? { duration: 1, repeat: Infinity }
                      : {}
                  }
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Fuel Gauge */}
      <div className="pt-6 border-t border-zinc-300 dark:border-zinc-700">
        <div className="flex justify-between items-end mb-2">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Fuel Remaining</span>
          <span className="text-2xl font-mono tabular-nums text-zinc-900 dark:text-zinc-50">
            {fuelRemaining.toFixed(1)}
            <span className="text-sm text-zinc-400">%</span>
          </span>
        </div>
        <div className="w-full h-3 bg-zinc-200 dark:bg-zinc-800 rounded-sm overflow-hidden" style={{
          boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.1)'
        }}>
          <motion.div
            className="h-full bg-[#F04E30]"
            initial={{ width: 0 }}
            animate={{ width: `${fuelRemaining}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[10px] font-mono text-zinc-400">
          <span>E</span>
          <span>F</span>
        </div>
      </div>

      {/* Endurance Estimate */}
      <div className="mt-4 pt-4 border-t border-zinc-300 dark:border-zinc-700">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
            Endurance
          </span>
          <span className="text-sm font-mono tabular-nums text-zinc-900 dark:text-zinc-50">
            {Math.floor((fuelRemaining / 100) * 8)}h {Math.floor(((fuelRemaining / 100) * 8 % 1) * 60)}m
          </span>
        </div>
      </div>
    </div>
  );
}
