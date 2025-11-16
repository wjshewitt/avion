'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Layers } from 'lucide-react';
import { useMapTheme } from '@/hooks/useMapTheme';
import { createRouteArc, getMockAirportCoordinates, calculateBounds } from './routeUtils';
import { MAP_STYLES, type MapStyleType } from './mapStyles';
import { MapStyleModal } from './MapStyleModal';
import type { Flight } from '@/lib/supabase/types';

interface RouteMapProps {
  flights?: Flight[];
  selectedFlightId?: string;
  onFlightSelect?: (flightId: string) => void;
  className?: string;
}

const STORAGE_KEY = 'avion:map-style';

export function RouteMap({
  flights = [],
  selectedFlightId,
  onFlightSelect,
  className = '',
}: RouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  const { mapStyle: themeMapStyle, primaryColor, textColor, isDark } = useMapTheme();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);
  const [selectedMapStyle, setSelectedMapStyle] = useState<MapStyleType>('dark');
  
  // Prevent hydration mismatch by only rendering theme-dependent styles after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load saved map style preference
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as MapStyleType | null;
    if (saved && MAP_STYLES.some((s) => s.id === saved)) {
      setSelectedMapStyle(saved);
    } else {
      setSelectedMapStyle(isDark ? 'dark' : 'light');
    }
  }, [isDark]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const currentStyle = MAP_STYLES.find((s) => s.id === selectedMapStyle)?.style || themeMapStyle;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: currentStyle,
      center: [0, 20], // Centered on Atlantic
      zoom: 2,
      attributionControl: false, // Disable default, we'll add custom one
    });

    // Add compact attribution control (single instance)
    map.current.addControl(
      new maplibregl.AttributionControl({
        compact: true,
        customAttribution: '© OpenStreetMap contributors',
      }),
      'bottom-right'
    );

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update map style when selection changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const newStyle = MAP_STYLES.find((s) => s.id === selectedMapStyle)?.style || themeMapStyle;
    map.current.setStyle(newStyle);
    map.current.once('styledata', () => {
      // Re-add routes and markers after style change
      updateRoutes();
    });
  }, [selectedMapStyle, mapLoaded]);

  // Handle map style change
  const handleStyleChange = (styleId: MapStyleType) => {
    setSelectedMapStyle(styleId);
    localStorage.setItem(STORAGE_KEY, styleId);
  };

  // Update routes when flights change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    updateRoutes();
  }, [flights, selectedFlightId, mapLoaded, primaryColor]);

  const updateRoutes = () => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    // Remove existing route layers and sources
    if (map.current.getLayer('route-lines')) {
      map.current.removeLayer('route-lines');
    }
    if (map.current.getSource('routes')) {
      map.current.removeSource('routes');
    }

    if (flights.length === 0) return;

    // Collect all coordinates for bounds calculation
    const allCoords: [number, number][] = [];

    // Create GeoJSON for routes
    const routeFeatures = flights
      .map((flight) => {
        const originCoords = getMockAirportCoordinates(flight.origin);
        const destCoords = getMockAirportCoordinates(flight.destination);

        if (!originCoords || !destCoords) return null;

        allCoords.push(originCoords, destCoords);

        // Create route arc
        const routeArc = createRouteArc(originCoords, destCoords, 100);

        // Add markers for origin and destination
        const isSelected = flight.id === selectedFlightId;

        // Origin marker
        const originEl = createMarkerElement(false, isSelected);
        const originMarker = new maplibregl.Marker({ element: originEl })
          .setLngLat(originCoords)
          .setPopup(
            new maplibregl.Popup({ offset: 25 }).setHTML(`
              <div style="font-family: monospace; font-size: 11px;">
                <div style="font-weight: bold; margin-bottom: 4px;">${flight.origin}</div>
                <div style="opacity: 0.7;">Origin</div>
              </div>
            `)
          )
          .addTo(map.current!);

        markers.current.push(originMarker);

        // Destination marker
        const destEl = createMarkerElement(true, isSelected);
        const destMarker = new maplibregl.Marker({ element: destEl })
          .setLngLat(destCoords)
          .setPopup(
            new maplibregl.Popup({ offset: 25 }).setHTML(`
              <div style="font-family: monospace; font-size: 11px;">
                <div style="font-weight: bold; margin-bottom: 4px;">${flight.destination}</div>
                <div style="opacity: 0.7;">Destination</div>
              </div>
            `)
          )
          .addTo(map.current!);

        markers.current.push(destMarker);

        // Add click handlers
        if (onFlightSelect) {
          originEl.addEventListener('click', () => onFlightSelect(flight.id));
          destEl.addEventListener('click', () => onFlightSelect(flight.id));
        }

        return {
          type: 'Feature' as const,
          properties: {
            flightId: flight.id,
            selected: isSelected,
          },
          geometry: {
            type: 'LineString' as const,
            coordinates: routeArc,
          },
        };
      })
      .filter(Boolean);

    if (routeFeatures.length === 0) return;

    // Add route source
    map.current.addSource('routes', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: routeFeatures as any,
      },
    });

    // Add route lines layer
    map.current.addLayer({
      id: 'route-lines',
      type: 'line',
      source: 'routes',
      paint: {
        'line-color': [
          'case',
          ['==', ['get', 'selected'], true],
          primaryColor,
          isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
        ],
        'line-width': ['case', ['==', ['get', 'selected'], true], 3, 2],
        'line-opacity': 0.8,
      },
    });

    // Fit map to show all routes
    if (allCoords.length > 0) {
      const bounds = calculateBounds(allCoords);
      map.current.fitBounds(bounds as any, {
        padding: 80,
        duration: 1000,
      });
    }
  };

  const createMarkerElement = (isDestination: boolean, isSelected: boolean) => {
    const el = document.createElement('div');
    el.className = 'avion-airport-marker';
    
    const color = isSelected ? primaryColor : isDark ? '#E5E5E5' : '#525252';
    const size = isDestination ? 14 : 10;
    
    // Neumorphic LED-style marker
    el.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border: 2px solid ${isDark ? '#1A1A1A' : '#FFFFFF'};
      border-radius: 50%;
      box-shadow: 0 0 ${isSelected ? '8' : '4'}px ${color}, 0 0 0 2px ${isDark ? '#2A2A2A' : '#F4F4F4'};
      cursor: pointer;
      transition: all 0.2s ease;
    `;

    el.addEventListener('mouseenter', () => {
      el.style.transform = 'scale(1.3)';
      el.style.boxShadow = `0 0 12px ${color}, 0 0 0 3px ${isDark ? '#2A2A2A' : '#F4F4F4'}`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'scale(1)';
      el.style.boxShadow = `0 0 ${isSelected ? '8' : '4'}px ${color}, 0 0 0 2px ${isDark ? '#2A2A2A' : '#F4F4F4'}`;
    });

    return el;
  };

  const selectedFlight = flights.find((f) => f.id === selectedFlightId);

  return (
    <div className={`relative ${className}`}>
      <div
        ref={mapContainer}
        className="avion-route-map"
        style={{
          width: '100%',
          height: '100%',
          minHeight: '400px',
        }}
      />

      {/* Map Style Selector Button - Neumorphic Control */}
      {mapLoaded && (
        <button
          onClick={() => setIsStyleModalOpen(true)}
          className="absolute top-4 left-4 z-10 w-10 h-10 bg-[#2A2A2A] border border-[#333] hover:border-[#F04E30] transition-all flex items-center justify-center group"
          style={{ 
            borderRadius: '2px',
            boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.2), inset -1px -1px 2px rgba(255,255,255,0.08), 0 2px 4px rgba(0,0,0,0.3)'
          }}
          title="Change map style"
        >
          <Layers size={18} strokeWidth={1.5} className="text-zinc-400 group-hover:text-[#F04E30] transition-colors" />
        </button>
      )}

      {/* Map Style Modal */}
      <MapStyleModal
        isOpen={isStyleModalOpen}
        onClose={() => setIsStyleModalOpen(false)}
        currentStyle={selectedMapStyle}
        onStyleChange={handleStyleChange}
      />

      {/* Flight Info Overlay - Instrument Panel */}
      {selectedFlight && (
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none border-t border-[#333]"
          style={{
            background: `linear-gradient(to top, ${
              isDark ? 'rgba(42, 42, 42, 0.98)' : 'rgba(244, 244, 244, 0.98)'
            }, rgba(42, 42, 42, 0.85))`,
            padding: '20px 24px',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)'
          }}
        >
          <div className="flex justify-between items-end" style={{ color: textColor }}>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-400 mb-1.5">
                Origin
              </div>
              <div className="text-sm font-mono tabular-nums font-semibold text-[#E5E5E5]">
                {selectedFlight.origin}
              </div>
            </div>
            <div className="text-center">
              <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-400 mb-1.5">
                Flight
              </div>
              <div className="text-lg font-mono tabular-nums font-semibold tracking-wide" style={{ color: primaryColor }}>
                {selectedFlight.code}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-400 mb-1.5">
                Destination
              </div>
              <div className="text-sm font-mono tabular-nums font-semibold text-[#E5E5E5]">
                {selectedFlight.destination}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {!mapLoaded && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={mounted
            ? {
                background: isDark ? '#1A1A1A' : '#F4F4F4',
                color: textColor,
              }
            : { background: '#1A1A1A' }}
        >
          <div className="text-center space-y-2">
            <div className="text-sm font-mono text-zinc-400 tracking-[0.2em] uppercase">
              Loading map
            </div>
            <div
              className="w-8 h-8 mx-auto border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: `${primaryColor} transparent transparent transparent` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
