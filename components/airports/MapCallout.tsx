"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, MapPin, Plane } from "lucide-react";
import type { AirportLite } from "@/types/airport-lite";

type MapCalloutProps = {
  airport: AirportLite;
  position: { x: number; y: number };
  onAction: (icao: string) => void;
  onClose: () => void;
};

export function MapCallout({ airport, position, onAction, onClose }: MapCalloutProps) {
  const calloutRef = useRef<HTMLDivElement>(null);

  // Handle Escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Intelligent positioning to avoid viewport edges
  useEffect(() => {
    if (!calloutRef.current) return;
    const rect = calloutRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let adjustedX = position.x;
    let adjustedY = position.y;
    
    // Offset from marker
    adjustedX += 12;
    adjustedY -= rect.height / 2;
    
    // Check right edge
    if (adjustedX + rect.width > viewportWidth - 20) {
      adjustedX = position.x - rect.width - 12;
    }
    
    // Check bottom edge
    if (adjustedY + rect.height > viewportHeight - 20) {
      adjustedY = viewportHeight - rect.height - 20;
    }
    
    // Check top edge
    if (adjustedY < 20) {
      adjustedY = 20;
    }
    
    calloutRef.current.style.transform = `translate(${adjustedX}px, ${adjustedY}px)`;
  }, [position]);

  // Get type color for LED indicator
  const getTypeColor = () => {
    if (airport.type?.includes('large')) return 'bg-blue-500';
    if (airport.type?.includes('medium')) return 'bg-amber-500';
    if (airport.type?.includes('heli')) return 'bg-orange-500';
    return 'bg-emerald-500';
  };

  return (
    <div
      ref={calloutRef}
      className="pointer-events-auto absolute z-20 animate-in fade-in slide-in-from-bottom-2 duration-200"
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
    >
      <div className="relative w-72 rounded-sm border border-[#333] bg-[#2A2A2A] p-5 shadow-[inset_0_0_20px_rgba(0,0,0,0.5),0_10px_30px_rgba(0,0,0,0.5)]">
        <button
          type="button"
          className="absolute right-3 top-3 text-lg leading-none text-zinc-400 hover:text-white transition-colors"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        
        {/* Header with ICAO code */}
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400">
          <MapPin size={12} strokeWidth={1.5} />
          <span className="tabular-nums">{airport.icao}{airport.iata ? ` / ${airport.iata}` : ''}</span>
          <div className={`ml-auto h-2 w-2 rounded-full ${getTypeColor()} shadow-[0_0_6px_currentColor]`} />
        </div>
        
        {/* Airport name */}
        <h3 className="mt-3 text-base font-semibold text-white leading-tight">{airport.name}</h3>
        
        {/* Location */}
        <p className="mt-1 text-sm text-zinc-400">
          {airport.municipality ?? 'Unknown'}, {airport.country ?? '—'}
        </p>
        
        {/* Elevation */}
        {airport.elevation_ft !== undefined && airport.elevation_ft !== null && (
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">Elevation</span>
            <span className="font-mono text-sm tabular-nums text-white">{airport.elevation_ft.toLocaleString()} ft</span>
          </div>
        )}
        
        {/* Data grid */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">Type</div>
            <div className="mt-1 text-xs font-medium text-white">
              {airport.type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) ?? 'Unknown'}
            </div>
          </div>
          
          {airport.longest_runway_ft > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">Runway</div>
              <div className="mt-1 font-mono text-xs tabular-nums text-white">
                {airport.longest_runway_ft.toLocaleString()} ft
              </div>
            </div>
          )}
        </div>
        
        {/* Capabilities with LED indicators */}
        <div className="mt-4 flex flex-wrap gap-2">
          {airport.ils_equipped && (
            <div className="inline-flex items-center gap-1.5 rounded-sm border border-emerald-500/30 bg-emerald-500/10 px-2 py-1">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_currentColor]" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-400">ILS</span>
            </div>
          )}
          
          {airport.all_lighted && (
            <div className="inline-flex items-center gap-1.5 rounded-sm border border-amber-500/30 bg-amber-500/10 px-2 py-1">
              <div className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_4px_currentColor]" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-400">Lighting</span>
            </div>
          )}
          
          {airport.scheduled_service && (
            <div className="inline-flex items-center gap-1.5 rounded-sm border border-blue-500/30 bg-blue-500/10 px-2 py-1">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_4px_currentColor]" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-blue-400">Scheduled</span>
            </div>
          )}
        </div>
        
        {/* View details button */}
        <button
          type="button"
          onClick={() => onAction(airport.icao)}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-[#F04E30] px-4 py-2.5 text-xs font-mono uppercase tracking-[0.2em] text-white transition-all hover:bg-[#F04E30]/90 hover:shadow-[0_0_12px_rgba(240,78,48,0.4)]"
        >
          <Plane size={14} strokeWidth={1.5} />
          View Full Details
          <ArrowRight size={12} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
