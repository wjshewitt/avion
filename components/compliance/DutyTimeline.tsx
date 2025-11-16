'use client';

import { motion } from 'framer-motion';
import type { CrewDutyStatus } from '@/types/compliance';

interface DutyTimelineProps {
  crew: CrewDutyStatus;
}

export function DutyTimeline({ crew }: DutyTimelineProps) {
  const percentage = (crew.currentDutyHours / crew.maxDutyHours) * 100;
  
  const getBarColor = () => {
    if (percentage >= 85) return '#F04E30'; // Safety Orange
    if (percentage >= 70) return '#f59e0b'; // Amber
    return '#10b981'; // Emerald
  };

  const getStatusText = () => {
    if (crew.restRequired) return 'MANDATORY REST';
    if (percentage >= 85) return 'APPROACHING LIMIT';
    if (percentage >= 70) return 'MONITOR CLOSELY';
    return 'AVAILABLE';
  };

  const getStatusColor = () => {
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
          <div className="text-sm font-semibold text-foreground">{crew.name}</div>
          <div className="text-xs text-muted-foreground">{crew.role}</div>
        </div>
        <div className={`text-xs font-mono font-bold uppercase tracking-wider ${getStatusColor()}`}>
          {getStatusText()}
        </div>
      </div>

      {/* Timeline Bar */}
      <div 
        className="relative h-8 bg-muted/30 border border-border rounded-sm overflow-hidden"
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
        
        {/* Time display overlay */}
        <div className="relative h-full flex items-center justify-center">
          <span className="text-xs font-mono font-bold tabular-nums text-foreground mix-blend-difference">
            {crew.currentDutyHours.toFixed(1)} / {crew.maxDutyHours.toFixed(1)} hrs
          </span>
        </div>

        {/* Warning threshold markers */}
        <div 
          className="absolute inset-y-0 border-l border-dashed border-amber-500/50"
          style={{ left: '70%' }}
        />
        <div 
          className="absolute inset-y-0 border-l border-dashed border-[#F04E30]/50"
          style={{ left: '85%' }}
        />
      </div>

      {/* Additional Info */}
      <div className="flex items-center justify-between text-xs">
        {crew.restRequired && crew.restUntil ? (
          <span className="text-muted-foreground">
            Rest until{' '}
            <span className="font-mono tabular-nums">
              {new Date(crew.restUntil).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </span>
        ) : (
          <span className="text-muted-foreground">
            <span className="font-mono tabular-nums font-semibold text-foreground">
              {hoursRemaining.toFixed(1)}
            </span>{' '}
            hrs remaining
          </span>
        )}
        
        {crew.upcomingFlights.length > 0 && (
          <span className="text-muted-foreground">
            {crew.upcomingFlights.length} upcoming flight{crew.upcomingFlights.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
}
