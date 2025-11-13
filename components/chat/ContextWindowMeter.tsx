'use client';

import { useMemo } from 'react';
import { Layers, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContextItem {
  type: 'system' | 'user' | 'assistant' | 'tool';
  tokens: number;
  label: string;
}

interface ContextWindowMeterProps {
  items: ContextItem[];
  maxTokens?: number;
  showBreakdown?: boolean;
}

export function ContextWindowMeter({
  items,
  maxTokens = 32768,
  showBreakdown = true,
}: ContextWindowMeterProps) {
  const stats = useMemo(() => {
    const byType = items.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + item.tokens;
      return acc;
    }, {} as Record<string, number>);

    const total = items.reduce((sum, item) => sum + item.tokens, 0);
    const percentage = (total / maxTokens) * 100;

    return { byType, total, percentage };
  }, [items, maxTokens]);

  const { byType, total, percentage } = stats;

  // Calculate SVG circle
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 90) return '#ef4444'; // red
    if (percentage >= 70) return '#f59e0b'; // amber
    return '#3b82f6'; // blue
  };

  const typeColors: Record<string, string> = {
    system: '#8b5cf6', // purple
    user: '#3b82f6', // blue
    assistant: '#10b981', // green
    tool: '#f59e0b', // amber
  };

  const typeLabels: Record<string, string> = {
    system: 'System',
    user: 'User',
    assistant: 'Assistant',
    tool: 'Tools',
  };

  return (
    <div className="border border-border rounded-lg bg-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Layers className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Context Window</span>
      </div>

      <div className="flex items-center gap-6">
        {/* Circular Progress */}
        <div className="relative flex-shrink-0">
          <svg width="140" height="140" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              className="text-muted/30"
            />
            {/* Progress circle */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke={getColor()}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500 ease-out"
            />
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-2xl font-bold text-foreground tabular-nums">
              {percentage.toFixed(0)}%
            </div>
            <div className="text-xs text-muted-foreground">
              {total.toLocaleString()} / {maxTokens.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Breakdown */}
        {showBreakdown && (
          <div className="flex-1 space-y-3">
            {Object.entries(byType).map(([type, tokens]) => {
              const typePercentage = (tokens / total) * 100;
              return (
                <div key={type} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: typeColors[type] }}
                      />
                      <span className="text-muted-foreground">{typeLabels[type]}</span>
                    </div>
                    <span className="text-foreground font-medium tabular-nums">
                      {tokens.toLocaleString()} ({typePercentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${typePercentage}%`,
                        backgroundColor: typeColors[type],
                      }}
                    />
                  </div>
                </div>
              );
            })}

            {/* Warning */}
            {percentage >= 80 && (
              <div className="flex items-start gap-2 pt-2 mt-2 border-t border-border">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Context window is {percentage >= 90 ? 'nearly full' : 'filling up'}. 
                  Older messages may be truncated.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Compact version for sidebar/header
export function ContextWindowMeterCompact({
  used,
  max = 32768,
}: {
  used: number;
  max?: number;
}) {
  const percentage = (used / max) * 100;
  
  const getColor = () => {
    if (percentage >= 90) return 'text-red-600 dark:text-red-400';
    if (percentage >= 70) return 'text-amber-600 dark:text-amber-400';
    return 'text-muted-foreground';
  };

  return (
    <div className="flex items-center gap-2">
      <Layers className={cn('h-3.5 w-3.5', getColor())} />
      <div className="flex items-center gap-1 text-xs">
        <span className={cn('font-medium tabular-nums', getColor())}>
          {percentage.toFixed(0)}%
        </span>
        <span className="text-muted-foreground">
          ({used.toLocaleString()})
        </span>
      </div>
    </div>
  );
}
