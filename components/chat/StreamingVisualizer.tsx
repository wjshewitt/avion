'use client';

import { useEffect, useState, useRef } from 'react';
import { Activity, Gauge, Clock, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreamChunk {
  timestamp: number;
  content: string;
  tokens: number;
}

interface StreamingVisualizerProps {
  isStreaming: boolean;
  chunks?: StreamChunk[];
  currentContent?: string;
  compact?: boolean;
}

export function StreamingVisualizer({
  isStreaming,
  chunks = [],
  currentContent = '',
  compact = false,
}: StreamingVisualizerProps) {
  const [speed, setSpeed] = useState(0); // tokens per second
  const [duration, setDuration] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [waveform, setWaveform] = useState<number[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (isStreaming) {
      const startTime = Date.now();
      intervalRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isStreaming]);

  useEffect(() => {
    if (chunks.length > 0) {
      const total = chunks.reduce((sum, chunk) => sum + chunk.tokens, 0);
      setTotalTokens(total);

      // Calculate speed from last 5 chunks
      const recentChunks = chunks.slice(-5);
      if (recentChunks.length >= 2) {
        const timeSpan = (recentChunks[recentChunks.length - 1].timestamp - recentChunks[0].timestamp) / 1000;
        const tokenCount = recentChunks.reduce((sum, chunk) => sum + chunk.tokens, 0);
        setSpeed(timeSpan > 0 ? Math.round(tokenCount / timeSpan) : 0);
      }

      // Update waveform (last 20 chunks)
      const waveData = chunks.slice(-20).map(chunk => chunk.tokens);
      setWaveform(waveData);
    }
  }, [chunks]);

  if (compact) {
    return (
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1">
          <Activity className={cn('h-3 w-3', isStreaming && 'animate-pulse text-primary')} />
          <span className="text-muted-foreground">
            {isStreaming ? `${speed} tok/s` : 'Ready'}
          </span>
        </div>
        {totalTokens > 0 && (
          <div className="text-muted-foreground">
            {totalTokens} tokens · {duration}s
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      {/* Header */}
      <div className="bg-muted px-3 py-2 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className={cn('h-4 w-4', isStreaming && 'animate-pulse text-primary')} />
            <span className="text-sm font-medium text-foreground">
              {isStreaming ? 'Streaming Active' : 'Stream Complete'}
            </span>
          </div>
          {isStreaming && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-muted-foreground">Live</span>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-3 p-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Gauge className="h-3 w-3" />
            <span>Speed</span>
          </div>
          <div className={cn(
            'text-lg font-bold tabular-nums',
            isStreaming && 'text-primary'
          )}>
            {speed}
          </div>
          <div className="text-xs text-muted-foreground">tokens/sec</div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Hash className="h-3 w-3" />
            <span>Tokens</span>
          </div>
          <div className="text-lg font-bold tabular-nums text-foreground">
            {totalTokens}
          </div>
          <div className="text-xs text-muted-foreground">
            {chunks.length} chunks
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Duration</span>
          </div>
          <div className="text-lg font-bold tabular-nums text-foreground">
            {duration}s
          </div>
          <div className="text-xs text-muted-foreground">
            {duration > 0 && totalTokens > 0 ? `${Math.round(totalTokens / duration)} avg` : '—'}
          </div>
        </div>
      </div>

      {/* Waveform */}
      {waveform.length > 0 && (
        <div className="px-3 pb-3">
          <div className="text-xs text-muted-foreground mb-2">Throughput Pattern</div>
          <div className="h-16 flex items-end gap-0.5">
            {waveform.map((value, index) => {
              const maxValue = Math.max(...waveform);
              const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
              const isRecent = index >= waveform.length - 3;
              
              return (
                <div
                  key={index}
                  className={cn(
                    'flex-1 rounded-t transition-all duration-300',
                    isRecent && isStreaming ? 'bg-primary' : 'bg-muted-foreground/40'
                  )}
                  style={{ height: `${height}%`, minHeight: '2px' }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Current Content Preview */}
      {isStreaming && currentContent && (
        <div className="border-t border-border bg-muted/30 px-3 py-2">
          <div className="text-xs text-muted-foreground mb-1">Streaming Preview</div>
          <div className="text-xs text-foreground font-mono line-clamp-2">
            {currentContent.slice(-120)}
            <span className="animate-pulse">▊</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Hook for managing streaming state
export function useStreamingTracker() {
  const [chunks, setChunks] = useState<StreamChunk[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const addChunk = (content: string, tokens: number) => {
    setChunks(prev => [
      ...prev,
      { timestamp: Date.now(), content, tokens }
    ]);
  };

  const start = () => {
    setIsStreaming(true);
    setChunks([]);
  };

  const stop = () => {
    setIsStreaming(false);
  };

  const reset = () => {
    setChunks([]);
    setIsStreaming(false);
  };

  return { chunks, isStreaming, addChunk, start, stop, reset };
}
