'use client';

import { useEffect } from 'react';
import { X, Cloud, MapPin, Plane, Terminal, LayoutGrid } from 'lucide-react';
import { useArtifactStore, ArtifactData } from '@/lib/artifact-store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { WeatherArtifact } from './artifacts/WeatherArtifact';
import { AirportArtifact } from './artifacts/AirportArtifact';
import { FlightsArtifact } from './artifacts/FlightsArtifact';
import { GenericArtifact } from './artifacts/GenericArtifact';

export function ArtifactPanel() {
  const { isOpen, artifacts, activeArtifactId, closePanel, closeArtifact, setActiveArtifact } = useArtifactStore();

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closePanel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closePanel]);

  if (!isOpen || artifacts.length === 0 || !activeArtifactId) return null;

  const currentArtifact = artifacts.find(a => a.id === activeArtifactId) || artifacts[0];

  const renderContent = (artifact: ArtifactData) => {
    const { type, data, toolName } = artifact;

    switch (type) {
      case 'weather':
        return <WeatherArtifact data={data} />;
      case 'airport':
        return <AirportArtifact data={data} />;
      case 'flights':
        return <FlightsArtifact data={data} />;
      default:
        return <GenericArtifact toolName={toolName} data={data} />;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'weather': return <Cloud size={14} />;
      case 'airport': return <MapPin size={14} />;
      case 'flights': return <Plane size={14} />;
      default: return <Terminal size={14} />;
    }
  };

  return (
    <div className="flex-1 min-w-[400px] max-w-[600px] border-l border-border bg-background h-full flex flex-col animate-in slide-in-from-right duration-300 ease-in-out shadow-xl z-10">
      {/* Tab Strip */}
      <div className="flex items-center border-b border-border bg-muted/30 px-2 gap-1 h-10 overflow-x-auto scrollbar-hide">
        {artifacts.map((artifact) => (
          <div
            key={artifact.id}
            className={cn(
              "group flex items-center gap-2 px-3 py-1.5 rounded-t-sm border-b-2 text-xs font-medium cursor-pointer transition-all shrink-0 max-w-[160px]",
              activeArtifactId === artifact.id
                ? "border-primary bg-background text-foreground shadow-sm"
                : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
            onClick={() => setActiveArtifact(artifact.id)}
          >
            <span className={cn(
              "opacity-70 group-hover:opacity-100", 
              activeArtifactId === artifact.id && "text-primary"
            )}>
              {getIcon(artifact.type)}
            </span>
            <span className="truncate truncate-fade">{artifact.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeArtifact(artifact.id);
              }}
              className="ml-1 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive rounded-sm p-0.5 transition-all"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* Global Close Button */}
      <div className="absolute top-2 right-2 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={closePanel}
          className="h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          title="Close All"
        >
          <X size={14} />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        {renderContent(currentArtifact)}
      </div>
    </div>
  );
}
