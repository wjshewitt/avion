'use client';

import { useEffect, useRef } from 'react';
import { ArrowRight, Wrench, Map, Plane, CloudSun } from 'lucide-react';
import { useArtifactStore, ArtifactData, ArtifactType } from '@/lib/artifact-store';
import { cn } from '@/lib/utils';

interface ArtifactTriggerProps {
  toolCallId: string;
  toolName: string;
  data: any;
  state: 'input-streaming' | 'input-available' | 'output-available' | 'output-error';
}

export function ArtifactTrigger({ toolCallId, toolName, data, state }: ArtifactTriggerProps) {
  const { openArtifact, activeArtifactId } = useArtifactStore();
  const hasOpenedRef = useRef(false);

  // Determine artifact type and title
  const getArtifactInfo = (name: string, toolData: any): { type: ArtifactType; title: string } => {
    if (name === 'get_airport_weather') return { type: 'weather', title: `Weather: ${toolData?.airport || 'Airport'}` };
    if (name === 'get_weather') return { type: 'weather', title: 'Weather Report' };
    if (name === 'get_airport_capabilities' || name === 'get_airport_details') return { type: 'airport', title: `Airport: ${toolData?.airport || 'Info'}` };
    if (name === 'get_user_flights') return { type: 'flights', title: 'My Flights' };
    return { type: 'generic', title: name.replace(/_/g, ' ').toUpperCase() };
  };

  const { type, title } = getArtifactInfo(toolName, data);

  // Auto-open on first success
  useEffect(() => {
    if (state === 'output-available' && !hasOpenedRef.current) {
      // Small delay to ensure UI is stable
      const timer = setTimeout(() => {
        openArtifact({
          id: toolCallId,
          type,
          title,
          data,
          toolName
        });
        hasOpenedRef.current = true;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [state, toolCallId, type, title, data, toolName, openArtifact]);

  const handleClick = () => {
    if (state === 'output-available') {
      openArtifact({
        id: toolCallId,
        type,
        title,
        data,
        toolName
      });
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'weather': return <CloudSun className="w-4 h-4" />;
      case 'airport': return <Map className="w-4 h-4" />;
      case 'flights': return <Plane className="w-4 h-4" />;
      default: return <Wrench className="w-4 h-4" />;
    }
  };

  if (state === 'input-streaming' || state === 'input-available') {
    return (
      <div className="border border-border bg-muted/30 px-3 py-2 text-[11px] font-mono uppercase tracking-widest text-muted-foreground rounded-sm flex items-center gap-2 max-w-fit">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span>Executing {toolName.replace(/_/g, ' ')}...</span>
      </div>
    );
  }

  if (state === 'output-error') {
    return (
      <div className="border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs font-mono uppercase tracking-widest text-destructive/80 rounded-sm max-w-fit">
        Error: {toolName}
      </div>
    );
  }

  const isActive = activeArtifactId === toolCallId;

  return (
    <button
      onClick={handleClick}
      className={cn(
        "group flex items-center gap-3 px-4 py-3 rounded-sm border transition-all duration-200 text-left w-full sm:w-auto max-w-md",
        isActive 
          ? "bg-primary/5 border-primary" 
          : "bg-card border-border hover:bg-muted/50 hover:border-muted-foreground/50"
      )}
    >
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center border transition-colors",
        isActive 
          ? "bg-primary text-primary-foreground border-primary" 
          : "bg-muted text-muted-foreground border-border group-hover:bg-muted/80"
      )}>
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-0.5">
          Artifact Generated
        </div>
        <div className="text-sm font-medium text-foreground truncate">
          {title}
        </div>
      </div>

      <ArrowRight 
        className={cn(
          "w-4 h-4 text-muted-foreground transition-transform duration-200",
          isActive ? "translate-x-1 text-primary" : "group-hover:translate-x-1"
        )} 
      />
    </button>
  );
}
