'use client';

import { useEffect, useMemo, useRef, useState, useCallback, useReducer } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { TriangleAlert } from 'lucide-react';
import { useMapTheme } from '@/hooks/useMapTheme';
import type { AirportLite, AirportFilterContext } from '@/types/airport-lite';
import type { AirportLiteDeckDataset } from '@/lib/airports/airport-lite-utils';
import { airportMatchesFilter, buildMatchingIcaoSet, createAirportLiteDeckDataset } from '@/lib/airports/airport-lite-utils';
import type { FilteredAirport } from '@/lib/tanstack/hooks/useAirportFilter';
import { useAirportClusterer } from '@/lib/airports/useAirportClusterer';
import type { MapClusterResult, ClusterFeature } from '@/lib/airports/useAirportClusterer';
import { MapHUD } from './MapHUD';
import { MapCallout } from './MapCallout';
import { mapCalloutReducer } from '@/lib/airports/mapCalloutReducer';

import type { MapboxOverlay as DeckMapboxOverlay } from '@deck.gl/mapbox';
import type { ScatterplotLayer as DeckScatterplotLayer } from '@deck.gl/layers';

const FALLBACK_RADIUS = 4;

type DeckModules = {
  MapboxOverlay: typeof DeckMapboxOverlay;
  ScatterplotLayer: typeof DeckScatterplotLayer;
};

type AirportFilterMapProps = {
  dataset?: AirportLiteDeckDataset;
  filteredAirports: FilteredAirport[];
  filterContext: AirportFilterContext;
  selectedIcao: string | null;
  onSelect: (icao: string) => void;
  isDatasetLoading?: boolean;
};

const hexToRgb = (value?: string): [number, number, number] => {
  if (!value) return [255, 255, 255];
  const hex = value.replace('#', '');
  const normalized = hex.length === 3 ? hex.split('').map((ch) => ch + ch).join('') : hex;
  const bigint = Number.parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
};

export function AirportFilterMap({
  dataset,
  filteredAirports,
  filterContext,
  selectedIcao,
  onSelect,
  isDatasetLoading,
}: AirportFilterMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const overlayRef = useRef<DeckMapboxOverlay | null>(null);
  const deckModulesRef = useRef<DeckModules | null>(null);
  const fallbackMarkersRef = useRef<maplibregl.Marker[]>([]);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [deckReady, setDeckReady] = useState(false);
  const [deckSupported, setDeckSupported] = useState(true);
  const [callout, dispatchCallout] = useReducer(mapCalloutReducer, null);
  const [clusterResult, setClusterResult] = useState<MapClusterResult>({ clusters: [], airports: [] });
  const [hoveredIcao, setHoveredIcao] = useState<string | null>(null);

  const { mapStyle, isDark, primaryColor, secondaryColor } = useMapTheme();
  const deckDataset = dataset;
  const { hasClusters, getClusters, getExpansionZoom } = useAirportClusterer(deckDataset);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setDeckSupported(Boolean(window.WebGL2RenderingContext));
  }, []);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: [-30, 25],
      zoom: 2.3,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true, customAttribution: '© OpenStreetMap contributors' }), 'bottom-right');

    map.on('load', () => setMapLoaded(true));
    mapRef.current = map;

    return () => {
      fallbackMarkersRef.current.forEach((marker) => marker.remove());
      fallbackMarkersRef.current = [];
      overlayRef.current?.setProps({ layers: [] });
      overlayRef.current = null;
      deckModulesRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, [mapStyle]);

  useEffect(() => {
    if (!mapLoaded || !deckSupported || deckModulesRef.current || !mapRef.current) return;

    let cancelled = false;
    (async () => {
      try {
        const [{ MapboxOverlay }, { ScatterplotLayer }] = await Promise.all([
          import('@deck.gl/mapbox'),
          import('@deck.gl/layers'),
        ]);

        if (cancelled || !mapRef.current) return;

        deckModulesRef.current = { MapboxOverlay, ScatterplotLayer };
        const overlay = new MapboxOverlay({ interleaved: true, layers: [] });
        overlayRef.current = overlay;
        mapRef.current.addControl(overlay);
        setDeckReady(true);
      } catch (error) {
        console.error('[AirportFilterMap] Failed to load deck.gl overlay', error);
        setDeckSupported(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mapLoaded, deckSupported]);

  const fallbackLiteAirports = useMemo<AirportLite[]>(() => (
    filteredAirports.map((airport) => ({
      icao: airport.icao,
      iata: airport.iata,
      name: airport.name,
      municipality: airport.city,
      country: airport.country,
      region: airport.state,
      latitude: airport.latitude,
      longitude: airport.longitude,
      elevation_ft: airport.elevation_ft,
      type: airport.classification?.type ?? 'small_airport',
      scheduled_service: Boolean(airport.classification?.scheduled_service),
      longest_runway_ft: airport.longest_runway_ft,
      surface_types: airport.runways?.surface_types ?? [],
      ils_equipped: Boolean(airport.runways?.ils_equipped),
      all_lighted: Boolean(airport.runways?.all_lighted),
      popularity_score: airport.popularity_score ?? 0,
    }))
  ), [filteredAirports]);

  const fallbackDataset = useMemo(() => (
    fallbackLiteAirports.length ? createAirportLiteDeckDataset(fallbackLiteAirports) : undefined
  ), [fallbackLiteAirports]);

  const activeDataset = dataset ?? fallbackDataset;

  const matchingSet = useMemo(() => {
    if (dataset) {
      return buildMatchingIcaoSet(dataset.airports, filterContext);
    }
    return fallbackLiteAirports.reduce((acc, airport) => {
      if (airportMatchesFilter(airport, filterContext)) {
        acc.add(airport.icao);
      }
      return acc;
    }, new Set<string>());
  }, [dataset, filterContext, fallbackLiteAirports]);

  const selectedAirport = useMemo(() => {
    if (!activeDataset || !selectedIcao) return null;
    return activeDataset.airports.find((airport) => airport.icao === selectedIcao) ?? null;
  }, [activeDataset, selectedIcao]);

  const colorForType = useCallback((type: string): [number, number, number] => {
    if (type.includes('large')) return isDark ? [59, 130, 246] : [37, 99, 235];
    if (type.includes('medium')) return isDark ? [251, 191, 36] : [217, 119, 6];
    if (type.includes('heli')) return isDark ? [249, 115, 22] : [194, 65, 12];
    return isDark ? [34, 197, 94] : [16, 185, 129];
  }, [isDark]);

  const { clusters: clusterPoints, airports: unclusteredAirports } = useMemo(() => {
    if (!hasClusters) {
      return { clusters: [], airports: activeDataset?.airports ?? [] };
    }
    return clusterResult;
  }, [clusterResult, hasClusters, activeDataset]);

  const handleClusterZoom = useCallback((clusterId: number, coordinates: [number, number]) => {
    const map = mapRef.current;
    if (!map) return;
    const targetZoom = getExpansionZoom(clusterId);
    if (targetZoom == null) return;
    map.easeTo({ center: coordinates, zoom: targetZoom + 0.5, duration: 650 });
  }, [getExpansionZoom]);

  const handleAirportSelect = useCallback((airport: AirportLite) => {
    onSelect(airport.icao);
    if (!mapRef.current) return;
    const { x, y } = mapRef.current.project([airport.longitude, airport.latitude]);
    dispatchCallout({ type: 'open', airport, position: { x, y } });
  }, [onSelect]);

  const closeCallout = useCallback(() => dispatchCallout({ type: 'close' }), []);

  const deckLayers = useMemo(() => {
    if (!deckReady || !deckModulesRef.current) return [];
    const { ScatterplotLayer } = deckModulesRef.current;
    const primaryRgb = hexToRgb(primaryColor);
    const secondaryRgb = hexToRgb(secondaryColor);

    const clusterLayer = new ScatterplotLayer<ClusterFeature>({
      id: 'airport-clusters',
      data: clusterPoints,
      pickable: true,
      stroked: true,
      filled: true,
      radiusUnits: 'pixels',
      radiusMinPixels: 14,
      radiusMaxPixels: 42,
      lineWidthUnits: 'pixels',
      getPosition: (cluster) => cluster.geometry.coordinates as [number, number],
      getRadius: (cluster) => Math.min(40, 10 + Math.sqrt(cluster.properties?.point_count ?? 0)),
      getFillColor: (cluster) => {
        const count = cluster.properties?.point_count ?? 0;
        // Minimal fill for ring effect
        if (count > 500) return [129, 140, 248, 30];
        if (count > 200) return [251, 191, 36, 30];
        return [37, 99, 235, 30];
      },
      getLineColor: (cluster) => {
        const count = cluster.properties?.point_count ?? 0;
        // Ring color
        if (count > 500) return [129, 140, 248, 255];
        if (count > 200) return [251, 191, 36, 255];
        return [37, 99, 235, 255];
      },
      getLineWidth: 2.5,
      onClick: ({ object }) => {
        if (!object) return;
        handleClusterZoom(object.properties?.cluster_id ?? 0, object.geometry.coordinates as [number, number]);
      },
    });

    const highlightKey = `${matchingSet.size}-${filterContext.query ?? ''}-${filterContext.country ?? ''}-${filterContext.region ?? ''}-${filterContext.type ?? ''}-${filterContext.surfaceType ?? ''}-${filterContext.requiresILS}-${filterContext.requiresLighting}-${hoveredIcao ?? ''}`;

    const airportLayer = new ScatterplotLayer<AirportLite>({
      id: 'airport-points',
      data: unclusteredAirports,
      pickable: true,
      stroked: true,
      filled: true,
      radiusUnits: 'pixels',
      radiusMinPixels: 5,
      radiusMaxPixels: 18,
      lineWidthUnits: 'pixels',
      getPosition: (airport) => [airport.longitude, airport.latitude],
      getRadius: (airport) => {
        const isHovered = hoveredIcao === airport.icao;
        const isMatched = matchingSet.has(airport.icao);
        
        // Size based on airport type
        let baseSize = 6;
        if (airport.type?.includes('large')) baseSize = 10;
        else if (airport.type?.includes('medium')) baseSize = 8;
        
        // Enhance size for matched airports
        const size = isMatched ? baseSize * 1.15 : baseSize * 0.8;
        
        // Scale up on hover
        return isHovered ? size * 1.2 : size;
      },
      getFillColor: (airport) => {
        const isMatched = matchingSet.has(airport.icao);
        // Ring markers: transparent center for better LED effect
        return isMatched ? [0, 0, 0, 30] : [0, 0, 0, 10];
      },
      getLineColor: (airport) => {
        const isHovered = hoveredIcao === airport.icao;
        const isMatched = matchingSet.has(airport.icao);
        const base = colorForType(airport.type ?? 'small_airport');
        
        if (!isMatched) {
          // Unmatched: muted zinc
          return isDark ? [161, 161, 170, 100] : [113, 113, 122, 120];
        }
        
        // Matched: full color with hover intensity
        const alpha = isHovered ? 255 : 230;
        return [...base, alpha];
      },
      getLineWidth: (airport) => {
        const isHovered = hoveredIcao === airport.icao;
        const isMatched = matchingSet.has(airport.icao);
        
        if (!isMatched) return 1.5;
        return isHovered ? 2.5 : 2;
      },
      onClick: ({ object }) => object && handleAirportSelect(object),
      onHover: ({ object }) => setHoveredIcao(object?.icao ?? null),
      updateTriggers: {
        getFillColor: [highlightKey, isDark],
        getLineColor: [highlightKey, isDark],
        getRadius: [highlightKey],
        getLineWidth: [highlightKey],
      },
    });

    const selectionLayer = selectedAirport
      ? new ScatterplotLayer<AirportLite>({
          id: 'airport-selection',
          data: [selectedAirport],
          stroked: true,
          filled: true,
          radiusUnits: 'pixels',
          radiusMinPixels: 12,
          radiusMaxPixels: 32,
          lineWidthUnits: 'pixels',
          getPosition: () => [selectedAirport.longitude, selectedAirport.latitude],
          getRadius: () => 12,
          getFillColor: [240, 78, 48, 20], // Safety Orange with minimal fill
          getLineColor: [240, 78, 48, 255], // Safety Orange ring
          getLineWidth: 3,
        })
      : null;

    return selectionLayer ? [clusterLayer, airportLayer, selectionLayer] : [clusterLayer, airportLayer];
  }, [deckReady, clusterPoints, unclusteredAirports, matchingSet, filterContext, isDark, primaryColor, secondaryColor, colorForType, handleClusterZoom, handleAirportSelect, selectedAirport]);

  useEffect(() => {
    if (!deckReady || !overlayRef.current) return;
    overlayRef.current.setProps({ layers: deckLayers });
  }, [deckReady, deckLayers]);

  useEffect(() => {
    if (!mapLoaded || deckReady || !mapRef.current) return;

    fallbackMarkersRef.current.forEach((marker) => marker.remove());
    fallbackMarkersRef.current = [];

    // Fallback: only show if Deck.gl fails to load
    // Note: These will be basic dots since MapLibre doesn't support ring styling easily
    filteredAirports.forEach((airport) => {
      if (!Number.isFinite(airport.longitude) || !Number.isFinite(airport.latitude)) return;
      
      // Create custom HTML element for ring marker
      const el = document.createElement('div');
      el.className = 'fallback-ring-marker';
      el.style.width = '12px';
      el.style.height = '12px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid #3B82F6';
      el.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => onSelect(airport.icao));
      
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([airport.longitude, airport.latitude])
        .addTo(mapRef.current!);
      fallbackMarkersRef.current.push(marker);
    });
  }, [mapLoaded, deckReady, filteredAirports, onSelect]);

  const hasResults = Boolean(activeDataset?.airports.length);

  const updateClusters = useCallback(() => {
    if (!mapRef.current || !hasClusters) return;
    const bounds = mapRef.current.getBounds();
    const bbox: [number, number, number, number] = [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()];
    const result = getClusters({ bbox, zoom: mapRef.current.getZoom() });
    setClusterResult(result);
  }, [getClusters, hasClusters]);

  useEffect(() => {
    if (!mapLoaded || !hasClusters) return;
    updateClusters();
    const map = mapRef.current;
    if (!map) return;
    const handleMove = () => {
      updateClusters();
      if (callout) {
        const next = map.project([callout.airport.longitude, callout.airport.latitude]);
        dispatchCallout({ type: 'move', position: { x: next.x, y: next.y } });
      }
    };
    map.on('moveend', handleMove);
    return () => {
      map.off('moveend', handleMove);
    };
  }, [mapLoaded, hasClusters, updateClusters, callout]);

  const handleFitToResults = () => {
    const map = mapRef.current;
    if (!map || !activeDataset || !activeDataset.airports.length) return;

    const targets = activeDataset.airports.filter((airport) => matchingSet.size === 0 || matchingSet.has(airport.icao));
    if (!targets.length) return;

    const bounds = targets.reduce((acc, airport) => acc.extend([airport.longitude, airport.latitude]), new maplibregl.LngLatBounds(
      [targets[0].longitude, targets[0].latitude],
      [targets[0].longitude, targets[0].latitude]
    ));

    map.fitBounds(bounds, { padding: 60, duration: 850 });
  };

  const statusLabel = dataset
    ? `${matchingSet.size.toLocaleString()} airports match filters`
    : `${filteredAirports.length.toLocaleString()} airports loaded`;

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-sm border border-border bg-card">
      <div className="relative flex-1">
        <div 
          ref={mapContainer} 
          className="h-full w-full"
          style={{ cursor: hoveredIcao ? 'pointer' : 'grab' }}
        />
        {(!hasResults || isDatasetLoading) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-transparent" />
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
              {isDatasetLoading ? 'Loading airport dataset' : 'No airports available'}
            </p>
          </div>
        )}
        {!deckSupported && (
          <div className="absolute inset-x-4 top-4 flex items-center gap-2 rounded-sm border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-amber-300">
            <TriangleAlert size={14} />
            <span className="text-xs font-mono uppercase tracking-[0.2em]">Enhanced map requires WebGL2; showing limited markers</span>
          </div>
        )}
        {hasResults && deckReady && deckSupported && (
          <MapHUD
            onZoomIn={() => mapRef.current?.zoomIn()}
            onZoomOut={() => mapRef.current?.zoomOut()}
            onResetBearing={() => mapRef.current?.resetNorth({ duration: 300 })}
            onFitResults={handleFitToResults}
          />
        )}
        {callout && (
          <MapCallout
            airport={callout.airport}
            position={callout.position}
            onAction={(icao) => {
              onSelect(icao);
              closeCallout();
            }}
            onClose={closeCallout}
          />
        )}
      </div>
      <div className="border-t border-border bg-muted/20 px-4 py-3 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
        {statusLabel}
      </div>
    </div>
  );
}
