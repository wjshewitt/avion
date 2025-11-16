"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import {
  MAP_WIDTH,
  MAP_HEIGHT,
  generateLandCells,
  type LandCell,
} from "@/lib/utils/dotworld-data";
import {
  resolveTimezoneFromCoords,
  type TimezoneRegion,
} from "@/lib/utils/timezone-regions";

interface DotMatrixWorldMapProps {
  width?: number;
  height?: number;
  className?: string;
  selectedRegion?: TimezoneRegion | null;
  onTimezoneSelect?: (region: TimezoneRegion) => void;
}

interface MapLayout {
  mapWidth: number;
  mapHeight: number;
  offsetX: number;
  offsetY: number;
}

export default function DotMatrixWorldMap({
  width = 960,
  height = 480,
  className = "",
  selectedRegion,
  onTimezoneSelect,
}: DotMatrixWorldMapProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const layoutRef = useRef<MapLayout | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<TimezoneRegion | null>(null);

  // Memoize land cells - only generate once
  const landCells = useMemo(() => generateLandCells(), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const maxWidth = Math.min(width, window.innerWidth - 64);
    const maxHeight = Math.min(height, Math.max(260, window.innerHeight * 0.45));

    const aspect = 2.4; // 2.4:1, width:height
    let mapWidth = Math.min(maxWidth, maxHeight * aspect);
    let mapHeight = mapWidth / aspect;

    canvas.width = mapWidth * dpr;
    canvas.height = mapHeight * dpr;
    canvas.style.width = `${mapWidth}px`;
    canvas.style.height = `${mapHeight}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const offsetX = 0;
    const offsetY = 0;
    layoutRef.current = { mapWidth, mapHeight, offsetX, offsetY };

    const cellW = mapWidth / MAP_WIDTH;
    const cellH = mapHeight / MAP_HEIGHT;
    const dotRadius = Math.min(cellW, cellH) * 0.55;

    const render = () => {
      ctx.clearRect(0, 0, mapWidth, mapHeight);

      // Simplified solid background
      ctx.fillStyle = "hsl(222, 84%, 6%)";
      ctx.fillRect(0, 0, mapWidth, mapHeight);

      const hasSelected = Boolean(selectedRegion);
      const hasHovered = Boolean(hoveredRegion);

      for (const cell of landCells) {
        const cx = cell.x * cellW + cellW * 0.5 + offsetX;
        const cy = cell.y * cellH + cellH * 0.5 + offsetY;

        let fill = "rgba(148, 163, 184, 0.9)"; // Brighter default
        let isInSelectedRegion = false;
        let isInHoveredRegion = false;

        // Check if in selected region
        if (hasSelected && selectedRegion) {
          const b = selectedRegion.bounds;
          if (
            cell.lon >= b.minLon &&
            cell.lon <= b.maxLon &&
            cell.lat >= b.minLat &&
            cell.lat <= b.maxLat
          ) {
            isInSelectedRegion = true;
          }
        }

        // Check if in hovered region
        if (hasHovered && hoveredRegion) {
          const b = hoveredRegion.bounds;
          if (
            cell.lon >= b.minLon &&
            cell.lon <= b.maxLon &&
            cell.lat >= b.minLat &&
            cell.lat <= b.maxLat
          ) {
            isInHoveredRegion = true;
          }
        }

        // Determine fill color
        if (isInSelectedRegion) {
          fill = "rgba(0, 255, 170, 0.85)"; // Softer neon green
        } else if (isInHoveredRegion) {
          fill = "rgba(148, 163, 184, 1.0)"; // Brightened on hover
        } else if (hasSelected || hasHovered) {
          fill = "rgba(148, 163, 184, 0.35)"; // Dimmed when something is selected/hovered
        }

        ctx.beginPath();
        ctx.fillStyle = fill;
        ctx.arc(cx, cy, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Frame
      ctx.strokeStyle = "rgba(15,23,42,0.9)";
      ctx.lineWidth = 1.2;
      ctx.strokeRect(0.5, 0.5, mapWidth - 1, mapHeight - 1);
    };

    render();
  }, [width, height, selectedRegion, hoveredRegion, landCells]);

  const handleMouseMove: React.MouseEventHandler<HTMLCanvasElement> = (event) => {
    const canvas = canvasRef.current;
    const layout = layoutRef.current;
    if (!canvas || !layout) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (
      x < layout.offsetX ||
      x > layout.offsetX + layout.mapWidth ||
      y < layout.offsetY ||
      y > layout.offsetY + layout.mapHeight
    ) {
      setHoveredRegion(null);
      canvas.style.cursor = "default";
      return;
    }

    const nx = (x - layout.offsetX) / layout.mapWidth; // 0..1
    const ny = (y - layout.offsetY) / layout.mapHeight; // 0..1

    const lon = nx * 360 - 180;
    const lat = 90 - ny * 180;

    const region = resolveTimezoneFromCoords(lon, lat);
    if (region) {
      setHoveredRegion(region);
      canvas.style.cursor = "pointer";
    } else {
      setHoveredRegion(null);
      canvas.style.cursor = "default";
    }
  };

  const handleMouseLeave = () => {
    setHoveredRegion(null);
  };

  const handleClick: React.MouseEventHandler<HTMLCanvasElement> = (event) => {
    if (!onTimezoneSelect) return;
    const canvas = canvasRef.current;
    const layout = layoutRef.current;
    if (!canvas || !layout) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (
      x < layout.offsetX ||
      x > layout.offsetX + layout.mapWidth ||
      y < layout.offsetY ||
      y > layout.offsetY + layout.mapHeight
    ) {
      return;
    }

    const nx = (x - layout.offsetX) / layout.mapWidth; // 0..1
    const ny = (y - layout.offsetY) / layout.mapHeight; // 0..1

    const lon = nx * 360 - 180;
    const lat = 90 - ny * 180;

    const region = resolveTimezoneFromCoords(lon, lat);
    if (region) {
      onTimezoneSelect(region);
    }
  };

  return (
    <div
      className={`relative overflow-hidden bg-black/40 backdrop-blur-[2px] ring-1 ring-border/40 shadow-[0_25px_80px_rgba(12,15,25,0.55)] ${className}`}
      role="button"
      aria-label="Dot matrix world map timezone selector"
    >
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="block w-full h-auto bg-transparent"
      />
      {hoveredRegion && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 bg-zinc-900/95 backdrop-blur-sm border border-zinc-700/60 rounded-sm shadow-lg">
          <div className="text-[11px] font-mono text-zinc-50">
            {hoveredRegion.label}
          </div>
          <div className="text-[10px] font-mono text-zinc-400">
            UTC{hoveredRegion.offset.startsWith("-") ? "" : "+"}
            {hoveredRegion.offset}
          </div>
        </div>
      )}
    </div>
  );
}
