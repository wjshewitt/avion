'use client';

import { useState } from 'react';
import { ChevronRight, Brain, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThoughtStep {
  id: string;
  title: string;
  content: string;
  status: 'pending' | 'active' | 'completed';
  timestamp?: Date;
}

interface ChainOfThoughtProps {
  steps: ThoughtStep[];
  compact?: boolean;
  showTimeline?: boolean;
}

export function ChainOfThought({ steps, compact = false, showTimeline = true }: ChainOfThoughtProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const toggleStep = (id: string) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Brain className="h-3.5 w-3.5" />
        <span>
          {steps.filter(s => s.status === 'completed').length} / {steps.length} steps
        </span>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      {/* Header */}
      <div className="bg-muted px-3 py-2 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Reasoning Process</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {steps.filter(s => s.status === 'completed').length} / {steps.length} complete
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="p-3">
        {showTimeline ? (
          <div className="space-y-0">
            {steps.map((step, index) => {
              const isExpanded = expandedSteps.has(step.id);
              const isLast = index === steps.length - 1;

              return (
                <div key={step.id} className="flex gap-3">
                  {/* Timeline */}
                  <div className="flex flex-col items-center">
                    {/* Icon */}
                    <div className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center border-2',
                      step.status === 'completed' && 'bg-green-500 border-green-500',
                      step.status === 'active' && 'bg-primary border-primary',
                      step.status === 'pending' && 'bg-muted border-muted-foreground'
                    )}>
                      {step.status === 'completed' && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                      )}
                      {step.status === 'active' && (
                        <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />
                      )}
                      {step.status === 'pending' && (
                        <Circle className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </div>
                    
                    {/* Line */}
                    {!isLast && (
                      <div className={cn(
                        'w-0.5 flex-1 min-h-8',
                        step.status === 'completed' ? 'bg-green-500' : 'bg-border'
                      )} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <button
                      onClick={() => toggleStep(step.id)}
                      className="w-full text-left group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                            {step.title}
                          </div>
                          {step.timestamp && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {step.timestamp.toLocaleTimeString()}
                            </div>
                          )}
                        </div>
                        <ChevronRight
                          className={cn(
                            'h-4 w-4 text-muted-foreground transition-transform',
                            isExpanded && 'rotate-90'
                          )}
                        />
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="mt-2 text-sm text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded border border-border">
                        {step.content}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // List view without timeline
          <div className="space-y-2">
            {steps.map((step) => {
              const isExpanded = expandedSteps.has(step.id);

              return (
                <div
                  key={step.id}
                  className="border border-border rounded overflow-hidden"
                >
                  <button
                    onClick={() => toggleStep(step.id)}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {step.status === 'completed' && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                      {step.status === 'active' && (
                        <Loader2 className="h-4 w-4 text-primary animate-spin" />
                      )}
                      {step.status === 'pending' && (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm font-medium">{step.title}</span>
                    </div>
                    <ChevronRight
                      className={cn(
                        'h-4 w-4 text-muted-foreground transition-transform',
                        isExpanded && 'rotate-90'
                      )}
                    />
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border px-3 py-2 bg-muted/30 text-sm text-muted-foreground">
                      {step.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Example usage with streaming
export function useChainOfThought() {
  const [steps, setSteps] = useState<ThoughtStep[]>([]);

  const addStep = (title: string, content: string) => {
    const id = `step-${Date.now()}`;
    setSteps(prev => [
      ...prev.map(s => ({ ...s, status: 'completed' as const })),
      { id, title, content, status: 'active' as const, timestamp: new Date() }
    ]);
    return id;
  };

  const completeStep = (id: string) => {
    setSteps(prev =>
      prev.map(s => s.id === id ? { ...s, status: 'completed' as const } : s)
    );
  };

  const clear = () => setSteps([]);

  return { steps, addStep, completeStep, clear };
}
