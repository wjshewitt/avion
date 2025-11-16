'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useMapTheme } from '@/hooks/useMapTheme';
import { MapPin, X } from 'lucide-react';

interface AirportLocationMapProps {
  latitude: number;
  longitude: number;
  icao: string;
  name: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AirportLocationMap({ 
  latitude, 
  longitude, 
  icao, 
  name,
  isOpen,
  onClose
}: AirportLocationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const { mapStyle, isDark } = useMapTheme();

  // Initialize map when opened
  useEffect(() => {
    if (!isOpen || !mapContainer.current || map.current) return;

    // Initialize map with interactive controls
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: [longitude, latitude],
      zoom: 12,
      attributionControl: false,
    });

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Add compact attribution
    map.current.addControl(
      new maplibregl.AttributionControl({ 
        compact: true,
        customAttribution: '© OpenStreetMap'
      }),
      'bottom-right'
    );

    // Create LED-style marker
    const markerEl = createLEDMarker(isDark);
    new maplibregl.Marker({ element: markerEl })
      .setLngLat([longitude, latitude])
      .addTo(map.current);

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
      setMapLoaded(false);
    };
  }, [isOpen, latitude, longitude, mapStyle, isDark]);

  // Handle dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      setPosition({ x: position.x + deltaX, y: position.y + deltaY });
      setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (dragRef.current?.contains(e.target as Node)) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const createLEDMarker = (isDark: boolean) => {
    const el = document.createElement('div');
    const color = '#2563EB'; // Info Blue
    const bgColor = isDark ? '#1A1A1A' : '#FFFFFF';
    const shadowColor = isDark ? '#2A2A2A' : '#F4F4F4';
    
    el.style.cssText = `
      width: 14px;
      height: 14px;
      background: ${color};
      border: 2px solid ${bgColor};
      border-radius: 50%;
      box-shadow: 0 0 10px ${color}, 0 0 0 2px ${shadowColor};
    `;
    
    el.setAttribute('aria-label', `${icao} airport location marker`);
    return el;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Draggable Modal */}
      <div
        ref={modalRef}
        className="fixed z-50 bg-card border border-border rounded-sm shadow-2xl"
        style={{
          left: '50%',
          top: '50%',
          transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
          width: '600px',
          maxWidth: '90vw',
          cursor: isDragging ? 'grabbing' : 'default',
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Draggable Header */}
        <div 
          ref={dragRef}
          className="flex items-center justify-between p-4 border-b border-border cursor-grab active:cursor-grabbing"
        >
          <div className="flex items-center gap-2">
            <MapPin size={16} strokeWidth={1.5} className="text-blue" />
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-blue/70">
                {icao}
              </div>
              <div className="text-sm font-medium text-foreground">
                {name}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-muted rounded-sm transition-colors"
            aria-label="Close map"
          >
            <X size={18} strokeWidth={1.5} className="text-muted-foreground" />
          </button>
        </div>

        {/* Map Container */}
        <div className="relative" style={{ height: '450px' }}>
          <div ref={mapContainer} className="w-full h-full" />
          
          {/* Loading state */}
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 backdrop-blur-sm">
              <div className="text-center space-y-2">
                <div className="w-6 h-6 mx-auto border-2 border-blue/50 border-t-blue rounded-full animate-spin" />
                <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                  Loading Map
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="p-3 border-t border-border bg-muted/20">
          <div className="text-xs text-muted-foreground font-mono">
            {latitude.toFixed(4)}°, {longitude.toFixed(4)}° • Drag header to move • Scroll to zoom
          </div>
        </div>
      </div>
    </>
  );
}
