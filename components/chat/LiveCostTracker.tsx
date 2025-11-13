'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { DollarSign, TrendingUp, Zap } from 'lucide-react';

interface CostBreakdown {
  inputTokens: number;
  outputTokens: number;
  cachedTokens?: number;
  toolCalls?: number;
}

interface LiveCostTrackerProps {
  breakdown: CostBreakdown;
  model?: string;
  showProjection?: boolean;
  compact?: boolean;
}

// Pricing per 1M tokens (example rates)
const MODEL_PRICING: Record<string, { input: number; output: number; cached?: number }> = {
  'gemini-2.5-flash': { input: 0.075, output: 0.30, cached: 0.01875 },
  'gemini-2.5-pro': { input: 1.25, output: 5.00, cached: 0.3125 },
  'gemini-1.5-pro': { input: 1.25, output: 5.00, cached: 0.3125 },
  'gemini-1.5-flash': { input: 0.075, output: 0.30, cached: 0.01875 },
};

export function LiveCostTracker({
  breakdown,
  model = 'gemini-2.5-flash',
  showProjection = true,
  compact = false,
}: LiveCostTrackerProps) {
  const [animatedCost, setAnimatedCost] = useState(0);
  const animatedCostRef = useRef(animatedCost);

  const pricing = MODEL_PRICING[model] || MODEL_PRICING['gemini-2.5-flash'];

  const costs = useMemo(() => {
    const inputCost = (breakdown.inputTokens / 1_000_000) * pricing.input;
    const outputCost = (breakdown.outputTokens / 1_000_000) * pricing.output;
    const cachedCost = breakdown.cachedTokens && pricing.cached
      ? (breakdown.cachedTokens / 1_000_000) * pricing.cached
      : 0;
    const toolCost = (breakdown.toolCalls || 0) * 0.001; // $0.001 per tool call

    const total = inputCost + outputCost + cachedCost + toolCost;

    return {
      input: inputCost,
      output: outputCost,
      cached: cachedCost,
      tools: toolCost,
      total,
    };
  }, [breakdown, pricing]);

  useEffect(() => {
    animatedCostRef.current = animatedCost;
  }, [animatedCost]);

  // Animate cost changes
  useEffect(() => {
    const duration = 300;
    const steps = 20;
    const start = animatedCostRef.current;
    const increment = (costs.total - start) / steps;
    let step = 0;

    const interval = setInterval(() => {
      if (step < steps) {
        setAnimatedCost(prev => prev + increment);
        step++;
      } else {
        setAnimatedCost(costs.total);
        clearInterval(interval);
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [costs.total]);

  // Monthly projection based on current usage
  const monthlyProjection = costs.total * 30 * 24; // Assuming current rate per hour

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <DollarSign className="h-3 w-3 text-green-600 dark:text-green-400" />
        <span className="font-medium tabular-nums text-foreground">
          ${animatedCost.toFixed(4)}
        </span>
        <span className="text-muted-foreground">
          {breakdown.inputTokens + breakdown.outputTokens} tokens
        </span>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      {/* Header */}
      <div className="bg-muted px-3 py-2 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-foreground">Cost Tracker</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {model}
          </div>
        </div>
      </div>

      {/* Total Cost */}
      <div className="px-3 py-4 border-b border-border">
        <div className="text-center">
          <div className="text-3xl font-bold text-foreground tabular-nums">
            ${animatedCost.toFixed(4)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Current session
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Input tokens</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground tabular-nums">
              {breakdown.inputTokens.toLocaleString()}
            </span>
            <span className="font-medium text-foreground tabular-nums">
              ${costs.input.toFixed(4)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Output tokens</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground tabular-nums">
              {breakdown.outputTokens.toLocaleString()}
            </span>
            <span className="font-medium text-foreground tabular-nums">
              ${costs.output.toFixed(4)}
            </span>
          </div>
        </div>

        {breakdown.cachedTokens !== undefined && breakdown.cachedTokens > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              Cached tokens
              <Zap className="h-3 w-3 text-amber-500" />
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground tabular-nums">
                {breakdown.cachedTokens.toLocaleString()}
              </span>
              <span className="font-medium text-foreground tabular-nums">
                ${costs.cached.toFixed(4)}
              </span>
            </div>
          </div>
        )}

        {breakdown.toolCalls !== undefined && breakdown.toolCalls > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tool calls</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground tabular-nums">
                {breakdown.toolCalls}
              </span>
              <span className="font-medium text-foreground tabular-nums">
                ${costs.tools.toFixed(4)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Projections */}
      {showProjection && (
        <div className="border-t border-border bg-muted/30 p-3 space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <TrendingUp className="h-3 w-3" />
            <span>Projections (at current rate)</span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Per day</span>
              <span className="font-medium text-foreground tabular-nums">
                ${(costs.total * 24).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Per month</span>
              <span className="font-medium text-foreground tabular-nums">
                ${monthlyProjection.toFixed(2)}
              </span>
            </div>
          </div>

          {monthlyProjection > 100 && (
            <div className="mt-2 pt-2 border-t border-border">
              <p className="text-xs text-amber-600 dark:text-amber-400">
                ⚠️ High usage detected. Consider optimizing prompts or using caching.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Savings from caching */}
      {breakdown.cachedTokens !== undefined && breakdown.cachedTokens > 0 && (
        <div className="border-t border-border bg-green-50 dark:bg-green-950/20 px-3 py-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-green-700 dark:text-green-400 flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Savings from caching
            </span>
            <span className="font-medium text-green-700 dark:text-green-400 tabular-nums">
              ${((breakdown.cachedTokens / 1_000_000) * (pricing.input - (pricing.cached || 0))).toFixed(4)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Hook for tracking costs
export function useCostTracker() {
  const [breakdown, setBreakdown] = useState<CostBreakdown>({
    inputTokens: 0,
    outputTokens: 0,
    cachedTokens: 0,
    toolCalls: 0,
  });

  const addInput = (tokens: number) => {
    setBreakdown(prev => ({ ...prev, inputTokens: prev.inputTokens + tokens }));
  };

  const addOutput = (tokens: number) => {
    setBreakdown(prev => ({ ...prev, outputTokens: prev.outputTokens + tokens }));
  };

  const addCached = (tokens: number) => {
    setBreakdown(prev => ({
      ...prev,
      cachedTokens: (prev.cachedTokens || 0) + tokens,
    }));
  };

  const addToolCall = () => {
    setBreakdown(prev => ({
      ...prev,
      toolCalls: (prev.toolCalls || 0) + 1,
    }));
  };

  const reset = () => {
    setBreakdown({
      inputTokens: 0,
      outputTokens: 0,
      cachedTokens: 0,
      toolCalls: 0,
    });
  };

  return { breakdown, addInput, addOutput, addCached, addToolCall, reset };
}
