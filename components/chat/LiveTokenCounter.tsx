'use client';

import { useEffect, useState } from 'react';
import { Zap, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveTokenCounterProps {
  inputTokens: number;
  outputTokens: number;
  isStreaming?: boolean;
  showBreakdown?: boolean;
  maxTokens?: number;
}

export function LiveTokenCounter({
  inputTokens,
  outputTokens,
  isStreaming = false,
  showBreakdown = true,
  maxTokens = 32768,
}: LiveTokenCounterProps) {
  const [prevTotal, setPrevTotal] = useState(0);
  const [delta, setDelta] = useState(0);
  const [animate, setAnimate] = useState(false);

  const total = inputTokens + outputTokens;
  const percentage = (total / maxTokens) * 100;

  useEffect(() => {
    if (total !== prevTotal) {
      setDelta(total - prevTotal);
      setAnimate(true);
      setTimeout(() => setAnimate(false), 500);
      setPrevTotal(total);
    }
  }, [total, prevTotal]);

  const getStatusColor = () => {
    if (percentage >= 90) return 'text-red-600 dark:text-red-400';
    if (percentage >= 70) return 'text-amber-600 dark:text-amber-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getBarColor = () => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-amber-500';
    return 'bg-primary';
  };

  return (
    <div className="border border-border rounded-lg bg-card p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className={cn('h-4 w-4', isStreaming && 'animate-pulse', getStatusColor())} />
          <span className="text-sm font-medium text-foreground">Token Usage</span>
          {isStreaming && (
            <span className="text-xs text-muted-foreground animate-pulse">
              (streaming...)
            </span>
          )}
        </div>
        <div className={cn('text-lg font-bold tabular-nums', animate && 'scale-110 transition-transform', getStatusColor())}>
          {total.toLocaleString()}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-300 ease-out',
              getBarColor(),
              isStreaming && 'animate-pulse'
            )}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{percentage.toFixed(1)}% of limit</span>
          <span>{(maxTokens - total).toLocaleString()} remaining</span>
        </div>
      </div>

      {/* Breakdown */}
      {showBreakdown && (
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Input</div>
            <div className="text-sm font-semibold text-foreground tabular-nums">
              {inputTokens.toLocaleString()}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Output</div>
            <div className="text-sm font-semibold text-foreground tabular-nums">
              {outputTokens.toLocaleString()}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Delta</div>
            <div className={cn(
              'text-sm font-semibold tabular-nums flex items-center gap-1',
              delta > 0 ? 'text-green-600' : delta < 0 ? 'text-red-600' : 'text-muted-foreground',
              animate && 'scale-110 transition-transform'
            )}>
              {delta > 0 && <TrendingUp className="h-3 w-3" />}
              {delta < 0 && <TrendingDown className="h-3 w-3" />}
              {delta === 0 && <Minus className="h-3 w-3" />}
              {delta !== 0 && (delta > 0 ? '+' : '')}{delta.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Warning */}
      {percentage >= 90 && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded p-2 text-xs text-red-700 dark:text-red-400">
          ⚠️ Approaching token limit. Consider summarizing or starting a new conversation.
        </div>
      )}
    </div>
  );
}

// Hook for tracking tokens
export function useTokenCounter() {
  const [inputTokens, setInputTokens] = useState(0);
  const [outputTokens, setOutputTokens] = useState(0);

  const addInput = (tokens: number) => setInputTokens(prev => prev + tokens);
  const addOutput = (tokens: number) => setOutputTokens(prev => prev + tokens);
  const reset = () => {
    setInputTokens(0);
    setOutputTokens(0);
  };

  return { inputTokens, outputTokens, addInput, addOutput, reset };
}
