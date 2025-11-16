'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { Feature, FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';
import { HIGHLIGHTABLE_COUNTRIES } from '@/lib/utils/country-regions';
import { resolveCityCoordinates } from '@/lib/utils/city-coordinates';
import { resolveTimezoneFromCoords, TIMEZONE_REGIONS, type TimezoneRegion } from '@/lib/utils/timezone-regions';

interface WireframeWorldMapProps {
  width?: number;
  height?: number;
  className?: string;
  highlightedCountries?: string[];
  officeMarkers?: OfficeMarker[];
  selectedTimezone?: TimezoneRegion | null;
  onTimezoneSelect?: (region: TimezoneRegion) => void;
}

type OfficeMarker = {
  city: string;
  label?: string;
};

const DEFAULT_WIDTH = 960;
const DEFAULT_HEIGHT = 420;

export default function WireframeWorldMap({
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  className = '',
  highlightedCountries = [],
  officeMarkers = [],
  selectedTimezone,
  onTimezoneSelect,
}: WireframeWorldMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredTimezone, setHoveredTimezone] = useState<TimezoneRegion | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const highlightedCountriesRef = useRef<string[]>(highlightedCountries);
  const requestRenderRef = useRef<(() => void) | null>(null);
  const officeMarkersRef = useRef<OfficeMarker[]>(officeMarkers);
  const officePositionsRef = useRef<Array<{ x: number; y: number; label?: string }>>([]);
  const mapConstantsRef = useRef({
    baseScale: DEFAULT_WIDTH / (2 * Math.PI),
    baseTranslateX: DEFAULT_WIDTH / 2,
    baseTranslateY: DEFAULT_HEIGHT / 2,
  });
  const recalcOfficePositionsRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    highlightedCountriesRef.current = highlightedCountries;
    requestRenderRef.current?.();
  }, [highlightedCountries]);

  useEffect(() => {
    officeMarkersRef.current = officeMarkers ?? [];
    recalcOfficePositionsRef.current?.();
    requestRenderRef.current?.();
  }, [officeMarkers]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    const containerWidth = Math.min(width, window.innerWidth - 64);
    const containerHeight = Math.min(height, Math.max(280, window.innerHeight * 0.42));

    const dpr = window.devicePixelRatio || 1;
    canvas.width = containerWidth * dpr;
    canvas.height = containerHeight * dpr;
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;
    canvas.style.touchAction = 'none';
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.scale(dpr, dpr);

    const DOT_RADIUS = 1.05;
    const HIGHLIGHT_RADIUS = 1.4;
    const DEG2RAD = Math.PI / 180;
    const baseScale = containerWidth / (2 * Math.PI);
    const baseTranslateX = containerWidth / 2;
    const baseTranslateY = containerHeight / 2;
    const MIN_ZOOM = 1;
    const MAX_ZOOM = 3;

    mapConstantsRef.current = { baseScale, baseTranslateX, baseTranslateY };

    let zoom = 1;
    let panX = 0;
    let panY = 0;
    let isPointerDown = false;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let pointerDownScreenX = 0;
    let pointerDownScreenY = 0;
    let hasDraggedBeyondThreshold = false;

    const highlightCountryPaths = new Map<string, { normal: Path2D; highlight: Path2D }>();
    let backgroundPath: Path2D | null = null;
    let graticulePath: Path2D | null = null;
    let mapBounds: { minX: number; maxX: number; minY: number; maxY: number } | null = null;

    let animationFrame: number | null = null;
    let isCancelled = false;

    const recalcOfficePositions = () => {
      const markers = officeMarkersRef.current;
      if (!markers || markers.length === 0) {
        officePositionsRef.current = [];
        return;
      }

      const positions: Array<{ x: number; y: number; label?: string }> = [];
      markers.forEach((marker) => {
        const coords = resolveCityCoordinates(marker.city);
        if (!coords) {
          console.warn(`WireframeWorldMap: missing coordinates for city '${marker.city}'.`);
          return;
        }

        const lonRad = coords.lng * DEG2RAD;
        const latRad = coords.lat * DEG2RAD;
        const x = baseScale * lonRad + baseTranslateX;
        const y = baseTranslateY - baseScale * latRad;
        positions.push({ x, y, label: marker.label });
      });

      officePositionsRef.current = positions;
    };

    recalcOfficePositionsRef.current = recalcOfficePositions;
    recalcOfficePositions();

    const clampPan = () => {
      if (!mapBounds) return;
      const { minX, maxX, minY, maxY } = mapBounds;

      const leftLimit = -((minX - baseTranslateX) * zoom + baseTranslateX);
      const rightLimit = containerWidth - ((maxX - baseTranslateX) * zoom + baseTranslateX);
      const minPanX = Math.min(leftLimit, rightLimit);
      const maxPanX = Math.max(leftLimit, rightLimit);
      panX = Math.min(Math.max(panX, minPanX), maxPanX);

      const topLimit = -((minY - baseTranslateY) * zoom + baseTranslateY);
      const bottomLimit = containerHeight - ((maxY - baseTranslateY) * zoom + baseTranslateY);
      const minPanY = Math.min(topLimit, bottomLimit);
      const maxPanY = Math.max(topLimit, bottomLimit);
      panY = Math.min(Math.max(panY, minPanY), maxPanY);
    };

    const pointInPolygon = (point: [number, number], polygon: number[][]): boolean => {
      const [x, y] = point;
      let inside = false;

      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i];
        const [xj, yj] = polygon[j];

        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
          inside = !inside;
        }
      }

      return inside;
    };

    const pointInFeature = (point: [number, number], feature: Feature<Geometry>): boolean => {
      const geometry = feature.geometry;
      if (!geometry) return false;

      if (geometry.type === 'Polygon') {
        const coordinates = geometry.coordinates as number[][][];
        if (!pointInPolygon(point, coordinates[0])) {
          return false;
        }
        for (let i = 1; i < coordinates.length; i++) {
          if (pointInPolygon(point, coordinates[i])) {
            return false;
          }
        }
        return true;
      }

      if (geometry.type === 'MultiPolygon') {
        const polygons = geometry.coordinates as number[][][][];
        for (const polygon of polygons) {
          if (pointInPolygon(point, polygon[0])) {
            let inHole = false;
            for (let i = 1; i < polygon.length; i++) {
              if (pointInPolygon(point, polygon[i])) {
                inHole = true;
                break;
              }
            }
            if (!inHole) {
              return true;
            }
          }
        }
        return false;
      }

      return false;
    };

    const generateDotsInPolygon = (feature: Feature<Geometry>, dotSpacing = 13) => {
      const dots: Array<{ lng: number; lat: number }> = [];
      const bounds = d3.geoBounds(feature);
      const [[minLng, minLat], [maxLng, maxLat]] = bounds;

      const stepSize = dotSpacing * 0.08;

      for (let lng = minLng; lng <= maxLng; lng += stepSize) {
        for (let lat = minLat; lat <= maxLat; lat += stepSize) {
          const point: [number, number] = [lng, lat];
          if (pointInFeature(point, feature)) {
            dots.push({ lng, lat });
          }
        }
      }

      return dots;
    };

    const buildDotPath = (positions: Array<{ x: number; y: number }>, radius: number) => {
      const path = new Path2D();
      const r = radius;
      positions.forEach(({ x, y }) => {
        path.moveTo(x + r, y);
        path.arc(x, y, r, 0, Math.PI * 2);
      });
      return path;
    };

    function render() {
      if (isCancelled || !context) return;

      context.save();
      context.resetTransform();
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.restore();

      // Avion tungsten background - solid, no gradient
      context.fillStyle = 'hsl(222, 84%, 6%)';
      context.fillRect(0, 0, containerWidth, containerHeight);

      if (!backgroundPath || !graticulePath) {
        return;
      }

      context.save();
      context.translate(baseTranslateX + panX, baseTranslateY + panY);
      context.scale(zoom, zoom);
      context.translate(-baseTranslateX, -baseTranslateY);

      // Graticule with Avion subtle blue
      context.strokeStyle = 'rgba(30, 64, 175, 0.15)';
      context.lineWidth = 0.6;
      context.stroke(graticulePath);

      // Determine if we should dim background dots
      const hasSelection = Boolean(selectedTimezone || hoveredTimezone);
      
      // Background dots - dimmed if timezone selected/hovered
      context.fillStyle = hasSelection ? 'rgba(148, 163, 184, 0.25)' : 'rgba(148, 163, 184, 0.85)';
      context.fill(backgroundPath);

      // Country highlighting (for non-timezone mode)
      const highlightedSet = new Set(highlightedCountriesRef.current);
      highlightCountryPaths.forEach((paths, country) => {
        const isHighlighted = highlightedSet.has(country);
        context.fillStyle = hasSelection
          ? 'rgba(148, 163, 184, 0.25)'
          : isHighlighted
          ? 'rgba(0, 255, 170, 0.85)'
          : 'rgba(148, 163, 184, 0.85)';
        context.fill(isHighlighted ? paths.highlight : paths.normal);
      });

      // Timezone region overlays (for timezone selection mode)
      if (onTimezoneSelect) {
        TIMEZONE_REGIONS.forEach((region) => {
          const isSelected = selectedTimezone?.id === region.id;
          const isHovered = hoveredTimezone?.id === region.id;
          
          if (!isSelected && !isHovered) return;

          const { minLon, maxLon, minLat, maxLat } = region.bounds;
          
          // Convert bounds to screen coordinates
          const x1 = baseScale * (minLon * DEG2RAD) + baseTranslateX;
          const y1 = baseTranslateY - baseScale * (maxLat * DEG2RAD);
          const x2 = baseScale * (maxLon * DEG2RAD) + baseTranslateX;
          const y2 = baseTranslateY - baseScale * (minLat * DEG2RAD);
          
          context.fillStyle = isSelected
            ? 'rgba(240, 78, 48, 0.12)'
            : 'rgba(148, 163, 184, 0.18)';
          
          context.fillRect(x1, y1, x2 - x1, y2 - y1);
          
          // Border for selected
          if (isSelected) {
            context.strokeStyle = 'rgba(240, 78, 48, 0.5)';
            context.lineWidth = 1.5 / zoom;
            context.strokeRect(x1, y1, x2 - x1, y2 - y1);
          }
        });
      }

      const officePositions = officePositionsRef.current;
      if (officePositions.length > 0) {
        const radius = 4.2 / zoom;
        const strokeWidth = 1.6 / zoom;
        context.lineWidth = strokeWidth;
        context.strokeStyle = 'rgba(12, 18, 31, 0.95)';
        context.fillStyle = '#ef4444';
        context.shadowColor = 'rgba(239, 68, 68, 0.35)';
        context.shadowBlur = 12 / zoom;

        officePositions.forEach(({ x, y }) => {
          context.beginPath();
          context.arc(x, y, radius, 0, Math.PI * 2);
          context.fill();
          context.stroke();
        });

        context.shadowBlur = 0;
        context.shadowColor = 'transparent';
      }

      context.restore();
    }

    const scheduleRender = () => {
      if (animationFrame !== null) return;
      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = null;
        render();
      });
    };

    requestRenderRef.current = scheduleRender;

    const handlePointerDown = (event: PointerEvent) => {
      isPointerDown = true;
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      pointerDownScreenX = event.clientX;
      pointerDownScreenY = event.clientY;
      hasDraggedBeyondThreshold = false;
      canvas.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (isPointerDown) {
        const dx = event.clientX - lastPointerX;
        const dy = event.clientY - lastPointerY;
        panX += dx;
        panY += dy;
        lastPointerX = event.clientX;
        lastPointerY = event.clientY;
         if (!hasDraggedBeyondThreshold) {
           const totalDx = event.clientX - pointerDownScreenX;
           const totalDy = event.clientY - pointerDownScreenY;
           if (Math.hypot(totalDx, totalDy) > 5) {
             hasDraggedBeyondThreshold = true;
           }
         }
        clampPan();
        scheduleRender();
      } else if (onTimezoneSelect) {
        // Detect timezone on hover for timezone mode
        const rect = canvas.getBoundingClientRect();
        const screenX = event.clientX - rect.left;
        const screenY = event.clientY - rect.top;

        const mapX = baseTranslateX + (screenX - baseTranslateX - panX) / zoom;
        const mapY = baseTranslateY + (screenY - baseTranslateY - panY) / zoom;

        const lonRad = (mapX - baseTranslateX) / baseScale;
        const latRad = (baseTranslateY - mapY) / baseScale;
        const lon = (lonRad / DEG2RAD) as number;
        const lat = (latRad / DEG2RAD) as number;

        const region = resolveTimezoneFromCoords(lon, lat);
        setHoveredTimezone(region);
        setTooltipPos(region ? { x: event.clientX, y: event.clientY } : null);
        
        if (region) {
          canvas.style.cursor = 'pointer';
          scheduleRender();
        } else {
          canvas.style.cursor = 'grab';
        }
      }
    };

    const endPointerInteraction = (event: PointerEvent) => {
      const wasPointerDown = isPointerDown;
      if (isPointerDown) {
        isPointerDown = false;
        if (typeof canvas.releasePointerCapture === 'function' && canvas.hasPointerCapture(event.pointerId)) {
          canvas.releasePointerCapture(event.pointerId);
        }
      }

      if (!wasPointerDown || hasDraggedBeyondThreshold || !onTimezoneSelect) return;

      const rect = canvas.getBoundingClientRect();
      const screenX = event.clientX - rect.left;
      const screenY = event.clientY - rect.top;

      const mapX = baseTranslateX + (screenX - baseTranslateX - panX) / zoom;
      const mapY = baseTranslateY + (screenY - baseTranslateY - panY) / zoom;

      const lonRad = (mapX - baseTranslateX) / baseScale;
      const latRad = (baseTranslateY - mapY) / baseScale;
      const lon = (lonRad / DEG2RAD) as number;
      const lat = (latRad / DEG2RAD) as number;

      const region = resolveTimezoneFromCoords(lon, lat);
      if (region) {
        onTimezoneSelect(region);
      }
    };

    const handlePointerLeave = () => {
      isPointerDown = false;
      setHoveredTimezone(null);
      setTooltipPos(null);
      canvas.style.cursor = 'default';
      scheduleRender();
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const zoomDelta = event.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.min(Math.max(zoom * zoomDelta, MIN_ZOOM), MAX_ZOOM);
      if (newZoom === zoom) return;

      const rect = canvas.getBoundingClientRect();
      const pointerOffsetX = event.clientX - rect.left - baseTranslateX;
      const pointerOffsetY = event.clientY - rect.top - baseTranslateY;

      const zoomRatio = newZoom / zoom;
      panX = pointerOffsetX - zoomRatio * (pointerOffsetX - panX);
      panY = pointerOffsetY - zoomRatio * (pointerOffsetY - panY);
      zoom = newZoom;
      clampPan();
      scheduleRender();
    };

    const loadWorldData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const landResponse = await fetch(
          'https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_land.json'
        );
        if (!landResponse.ok) throw new Error('Failed to load land data');
        const landFeatures = (await landResponse.json()) as FeatureCollection<Geometry, GeoJsonProperties>;

        const countryResponse = await fetch(
          'https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/cultural/ne_110m_admin_0_countries.json'
        );
        if (!countryResponse.ok) throw new Error('Failed to load country data');
        const countryFeatures = (await countryResponse.json()) as FeatureCollection<Geometry, GeoJsonProperties>;

        if (isCancelled) return;

        const highlightableCountryFeatures = countryFeatures.features
          .map((country) => {
            const props = country.properties as Record<string, unknown> | null | undefined;
            const nameValue = props?.NAME || props?.name || props?.admin;
            if (typeof nameValue !== 'string' || !HIGHLIGHTABLE_COUNTRIES.has(nameValue)) {
              return null;
            }

            const bounds = d3.geoBounds(country);
            return { feature: country, name: nameValue, bounds } as const;
          })
          .filter(
            (entry): entry is {
              feature: Feature<Geometry, GeoJsonProperties>;
              name: string;
              bounds: [[number, number], [number, number]];
            } => entry !== null
          );

        const backgroundPositions: Array<{ x: number; y: number }> = [];
        const highlightPositionsByCountry = new Map<string, Array<{ x: number; y: number }>>();
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;

        const updateBounds = (x: number, y: number) => {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        };

        landFeatures.features.forEach((feature) => {
          const dots = generateDotsInPolygon(feature, 13);

          dots.forEach((dot) => {
            let dotCountry: string | undefined;

            for (const countryEntry of highlightableCountryFeatures) {
              const [[minLng, minLat], [maxLng, maxLat]] = countryEntry.bounds;

              if (dot.lng >= minLng && dot.lng <= maxLng && dot.lat >= minLat && dot.lat <= maxLat) {
                if (pointInFeature([dot.lng, dot.lat], countryEntry.feature)) {
                  dotCountry = countryEntry.name;
                  break;
                }
              }
            }

            const lonRad = dot.lng * DEG2RAD;
            const latRad = dot.lat * DEG2RAD;
            const x = baseScale * lonRad + baseTranslateX;
            const y = baseTranslateY - baseScale * latRad;

            updateBounds(x, y);

            if (dotCountry && HIGHLIGHTABLE_COUNTRIES.has(dotCountry)) {
              const list = highlightPositionsByCountry.get(dotCountry) ?? [];
              list.push({ x, y });
              if (!highlightPositionsByCountry.has(dotCountry)) {
                highlightPositionsByCountry.set(dotCountry, list);
              }
            } else {
              backgroundPositions.push({ x, y });
            }
          });
        });

        if (isCancelled) return;

        backgroundPath = backgroundPositions.length > 0 ? buildDotPath(backgroundPositions, DOT_RADIUS) : null;

        highlightCountryPaths.clear();
        highlightPositionsByCountry.forEach((positions, country) => {
          if (positions.length === 0) return;
          highlightCountryPaths.set(country, {
            normal: buildDotPath(positions, DOT_RADIUS),
            highlight: buildDotPath(positions, HIGHLIGHT_RADIUS),
          });
        });

        if (Number.isFinite(minX) && Number.isFinite(maxX) && Number.isFinite(minY) && Number.isFinite(maxY)) {
          mapBounds = { minX, maxX, minY, maxY };
          clampPan();
        }

        const projectionForPaths = d3
          .geoEquirectangular()
          .scale(baseScale)
          .translate([baseTranslateX, baseTranslateY]);

        const graticule = d3.geoGraticule();
        const pathGenerator = d3.geoPath(projectionForPaths);
        const graticuleString = pathGenerator(graticule());
        graticulePath = graticuleString ? new Path2D(graticuleString) : null;

        scheduleRender();
        setIsLoading(false);
      } catch (err) {
        console.error('Map loading error:', err);
        console.error('Error details:', {
          message: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : undefined,
        });
        if (!isCancelled) {
          setError('Failed to load map data');
          setIsLoading(false);
        }
      }
    };

    loadWorldData();

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', endPointerInteraction);
    canvas.addEventListener('pointerleave', handlePointerLeave);
    canvas.addEventListener('pointercancel', endPointerInteraction);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        scheduleRender();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    scheduleRender();

    return () => {
      isCancelled = true;
      requestRenderRef.current = null;
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
      }
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', endPointerInteraction);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
      canvas.removeEventListener('pointercancel', endPointerInteraction);
      canvas.removeEventListener('wheel', handleWheel);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [width, height]);

  if (error) {
    return (
      <div className={`border border-border bg-muted/20 p-6 text-center ${className}`}>
        <p className="text-sm font-semibold text-destructive">Error loading map visualization</p>
        <p className="text-xs text-muted-foreground mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden bg-[rgba(42,42,42,0.9)] groove ${className}`}
      style={{
        boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.1), inset -1px -1px 3px rgba(255,255,255,0.2)',
        border: '1px solid #333',
      }}
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-auto bg-transparent"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/75">
          <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Loading map...</p>
        </div>
      )}
      {hoveredTimezone && tooltipPos && (
        <div
          className="fixed pointer-events-none z-50 px-3 py-2 bg-zinc-900/95 backdrop-blur-sm border border-zinc-700/60 rounded-sm shadow-lg"
          style={{
            left: `${tooltipPos.x + 12}px`,
            top: `${tooltipPos.y + 12}px`,
          }}
        >
          <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
            TIMEZONE
          </div>
          <div className="text-xs font-mono text-zinc-50 mt-0.5">
            {hoveredTimezone.label}
          </div>
          <div className="text-[10px] font-mono text-zinc-400 mt-0.5">
            UTC{hoveredTimezone.offset.startsWith('-') ? '' : '+'}
            {hoveredTimezone.offset}
          </div>
        </div>
      )}
    </div>
  );
}
