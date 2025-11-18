'use client';

import { motion } from 'framer-motion';
import type { CrewDutyStatus } from '@/types/compliance';
import { cn } from '@/lib/utils';

interface DutyTimelineProps {
  crew: CrewDutyStatus;
}

export function DutyTimeline({ crew }: DutyTimelineProps) {
  const percentage = (crew.currentDutyHours / crew.maxDutyHours) * 100;
  
  // Avion Signal Colors
  const getBarColor = () => {
    if (percentage >= 85) return '#F04E30'; // Safety Orange
    if (percentage >= 70) return '#f59e0b'; // Amber-500
    return '#10b981'; // Emerald-500
  };

  const getStatusText = () => {
    if (crew.restRequired) return 'MANDATORY REST';
    if (percentage >= 85) return 'APPROACHING LIMIT';
    if (percentage >= 70) return 'MONITOR CLOSELY';
    return 'AVAILABLE';
  };

  const getStatusColorClass = () => {
    if (crew.restRequired) return 'text-[#F04E30]';
    if (percentage >= 85) return 'text-[#F04E30]';
    if (percentage >= 70) return 'text-amber-500';
    return 'text-emerald-500';
  };

  const hoursRemaining = crew.maxDutyHours - crew.currentDutyHours;

  return (
    <div className="space-y-3">
      {/* Crew Info Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-200">{crew.name}</div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono uppercase tracking-wider">{crew.role}</div>
        </div>
        <div className={cn("text-[10px] font-mono font-bold uppercase tracking-widest", getStatusColorClass())}>
          {getStatusText()}
        </div>
      </div>

      {/* Timeline Bar - Avion Groove Style */}
      <div 
        className="relative h-8 bg-[#e4e4e7] dark:bg-[#1A1A1A] border border-zinc-300 dark:border-[#333] rounded-sm overflow-hidden"
        style={{
          boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.1), inset -1px -1px 3px rgba(255,255,255,0.05)',
        }}
      >
        {/* Filled portion */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute inset-y-0 left-0"
          style={{ backgroundColor: getBarColor() }}
        />
        
        {/* Time display overlay - JetBrains Mono */}
        <div className="relative h-full flex items-center justify-between px-3">
             <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-600 mix-blend-plus-lighter z-10">DUTY TIME</span>
            <span className="text-xs font-mono font-bold tabular-nums text-zinc-800 dark:text-zinc-200 mix-blend-difference z-10">
                {crew.currentDutyHours.toFixed(1)} / {crew.maxDutyHours.toFixed(1)} hrs
            </span>
        </div>

        {/* Warning threshold markers */}
        <div 
          className="absolute inset-y-0 border-l border-dashed border-amber-500/50 z-0"
          style={{ left: '70%' }}
        />
        <div 
          className="absolute inset-y-0 border-l border-dashed border-[#F04E30]/50 z-0"
          style={{ left: '85%' }}
        />
      </div>

      {/* Additional Info */}
      <div className="flex items-center justify-between text-xs font-mono text-zinc-500 dark:text-zinc-400">
        {crew.restRequired && crew.restUntil ? (
          <span>
            REST UNTIL{' '}
            <span className="tabular-nums text-zinc-700 dark:text-zinc-300">
              {new Date(crew.restUntil).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              })}
            </span>
          </span>
        ) : (
          <span>
            <span className="tabular-nums font-semibold text-zinc-700 dark:text-zinc-300">
              {Math.max(0, hoursRemaining).toFixed(1)}
            </span>{' '}
            HRS REMAINING
          </span>
        )}
        
        {crew.upcomingFlights.length > 0 && (
          <span>
            {crew.upcomingFlights.length} FLIGHT{crew.upcomingFlights.length !== 1 ? 'S' : ''}
          </span>
        )}
      </div>
    </div>
  );
}
