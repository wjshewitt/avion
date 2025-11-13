'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Loader2, XCircle, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
  startTime?: number;
  error?: string;
}

interface ToolExecutionProgressProps {
  toolName: string;
  steps: ToolStep[];
  compact?: boolean;
}

export function ToolExecutionProgress({
  toolName,
  steps,
  compact = false,
}: ToolExecutionProgressProps) {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const totalSteps = steps.length;
  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const failedSteps = steps.filter(s => s.status === 'failed').length;
  const currentStep = steps.find(s => s.status === 'running');
  const progress = (completedSteps / totalSteps) * 100;

  const totalDuration = steps.reduce((sum, step) => sum + (step.duration || 0), 0);

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs">
        {currentStep ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin text-primary" />
            <span className="text-foreground">{currentStep.name}...</span>
          </>
        ) : failedSteps > 0 ? (
          <>
            <XCircle className="h-3 w-3 text-destructive" />
            <span className="text-destructive">Failed</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="h-3 w-3 text-green-600" />
            <span className="text-muted-foreground">Complete</span>
          </>
        )}
        <span className="text-muted-foreground">
          {completedSteps}/{totalSteps}
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
            <Zap className={cn(
              'h-4 w-4',
              currentStep && 'animate-pulse text-primary'
            )} />
            <span className="text-sm font-medium text-foreground">
              {toolName}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            {completedSteps}/{totalSteps} steps
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-3 pt-3">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-300',
              failedSteps > 0 ? 'bg-destructive' : 'bg-primary'
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="p-3 space-y-2">
        {steps.map((step) => {
          const elapsed = step.startTime 
            ? Math.floor((currentTime - step.startTime) / 1000)
            : 0;

          return (
            <div key={step.id} className="flex items-start gap-3">
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {step.status === 'completed' && (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                )}
                {step.status === 'running' && (
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                )}
                {step.status === 'failed' && (
                  <XCircle className="h-4 w-4 text-destructive" />
                )}
                {step.status === 'pending' && (
                  <Circle className="h-4 w-4 text-muted-foreground/40" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={cn(
                    'text-sm',
                    step.status === 'completed' && 'text-foreground',
                    step.status === 'running' && 'text-foreground font-medium',
                    step.status === 'failed' && 'text-destructive',
                    step.status === 'pending' && 'text-muted-foreground'
                  )}>
                    {step.name}
                  </span>

                  {/* Duration/Timer */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {step.status === 'running' && (
                      <span className="tabular-nums">{elapsed}s</span>
                    )}
                    {step.status === 'completed' && step.duration && (
                      <span className="tabular-nums">{(step.duration / 1000).toFixed(1)}s</span>
                    )}
                  </div>
                </div>

                {/* Error message */}
                {step.status === 'failed' && step.error && (
                  <div className="mt-1 text-xs text-destructive">
                    {step.error}
                  </div>
                )}

                {/* Running indicator */}
                {step.status === 'running' && (
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary animate-pulse w-2/3" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Stats */}
      {completedSteps === totalSteps && (
        <div className="border-t border-border bg-muted/30 px-3 py-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Total duration</span>
            <span className="font-medium text-foreground tabular-nums">
              {(totalDuration / 1000).toFixed(2)}s
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Hook for managing tool execution steps
export function useToolExecutionTracker() {
  const [steps, setSteps] = useState<ToolStep[]>([]);

  const addStep = (name: string) => {
    const id = `step-${Date.now()}`;
    setSteps(prev => [...prev, { id, name, status: 'pending' }]);
    return id;
  };

  const startStep = (id: string) => {
    setSteps(prev => prev.map(step =>
      step.id === id
        ? { ...step, status: 'running' as const, startTime: Date.now() }
        : step
    ));
  };

  const completeStep = (id: string) => {
    setSteps(prev => prev.map(step => {
      if (step.id === id) {
        const duration = step.startTime ? Date.now() - step.startTime : 0;
        return { ...step, status: 'completed' as const, duration };
      }
      return step;
    }));
  };

  const failStep = (id: string, error: string) => {
    setSteps(prev => prev.map(step =>
      step.id === id
        ? { ...step, status: 'failed' as const, error }
        : step
    ));
  };

  const reset = () => setSteps([]);

  return { steps, addStep, startStep, completeStep, failStep, reset };
}
