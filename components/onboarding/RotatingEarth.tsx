"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

interface RotatingEarthProps {
  width?: number;
  height?: number;
  className?: string;
}

// Rotating orthographic Earth used on onboarding. Visual only – no data binding.
export default function RotatingEarth({
  width = 800,
  height = 480,
  className = "",
}: RotatingEarthProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const containerWidth = Math.min(width, window.innerWidth - 64);
    const containerHeight = Math.min(height, Math.max(340, window.innerHeight * 0.5));
    const radius = Math.min(containerWidth, containerHeight) / 2.1;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = containerWidth * dpr;
    canvas.height = containerHeight * dpr;
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.scale(dpr, dpr);

    const projection = d3
      .geoOrthographic()
      .scale(radius)
      .translate([containerWidth / 2, containerHeight / 2])
      .clipAngle(90);

    const path = d3.geoPath().projection(projection).context(context as any);

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

    const pointInFeature = (point: [number, number], feature: any): boolean => {
      const geometry = feature.geometry;
      if (!geometry) return false;

      if (geometry.type === "Polygon") {
        const coordinates = geometry.coordinates as number[][][];
        if (!pointInPolygon(point, coordinates[0])) return false;
        for (let i = 1; i < coordinates.length; i++) {
          if (pointInPolygon(point, coordinates[i])) return false;
        }
        return true;
      }

      if (geometry.type === "MultiPolygon") {
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
            if (!inHole) return true;
          }
        }
      }

      return false;
    };

    const generateDotsInPolygon = (feature: any, dotSpacing = 13) => {
      const dots: [number, number][] = [];
      const bounds = d3.geoBounds(feature);
      const [[minLng, minLat], [maxLng, maxLat]] = bounds;

      const stepSize = dotSpacing * 0.08;

      for (let lng = minLng; lng <= maxLng; lng += stepSize) {
        for (let lat = minLat; lat <= maxLat; lat += stepSize) {
          const point: [number, number] = [lng, lat];
          if (pointInFeature(point, feature)) {
            dots.push(point);
          }
        }
      }

      return dots;
    };

    interface DotData {
      lng: number;
      lat: number;
    }

    const allDots: DotData[] = [];
    let landFeatures: any;

    const render = () => {
      context.clearRect(0, 0, containerWidth, containerHeight);

      const currentScale = projection.scale();
      const scaleFactor = currentScale / radius;

      // Tungsten panel background
      context.fillStyle = "#020617";
      context.fillRect(0, 0, containerWidth, containerHeight);

      // Ocean disc
      context.beginPath();
      context.arc(containerWidth / 2, containerHeight / 2, currentScale, 0, 2 * Math.PI);
      context.fillStyle = "#000000";
      context.fill();
      context.strokeStyle = "rgba(255,255,255,0.6)";
      context.lineWidth = 2 * scaleFactor;
      context.stroke();

      if (landFeatures) {
        const graticule = d3.geoGraticule();
        context.beginPath();
        path(graticule());
        context.strokeStyle = "rgba(37,99,235,0.18)";
        context.lineWidth = 0.6 * scaleFactor;
        context.stroke();

        // Land outlines
        context.beginPath();
        landFeatures.features.forEach((feature: any) => {
          path(feature);
        });
        context.strokeStyle = "rgba(148,163,184,0.6)";
        context.lineWidth = 0.7 * scaleFactor;
        context.stroke();

        // Halftone dots
        allDots.forEach((dot) => {
          const projected = projection([dot.lng, dot.lat]);
          if (!projected) return;
          const [x, y] = projected;
          if (x < 0 || x > containerWidth || y < 0 || y > containerHeight) return;

          context.beginPath();
          context.arc(x, y, 1.1 * scaleFactor, 0, 2 * Math.PI);
          context.fillStyle = "rgba(226,232,240,0.9)";
          context.fill();
        });
      }
    };

    const loadWorldData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_land.json",
        );
        if (!response.ok) throw new Error("Failed to load land data");

        landFeatures = await response.json();

        let totalDots = 0;
        landFeatures.features.forEach((feature: any) => {
          const dots = generateDotsInPolygon(feature, 13);
          dots.forEach(([lng, lat]) => {
            allDots.push({ lng, lat });
            totalDots += 1;
          });
        });

        if (totalDots === 0) {
          throw new Error("No land dots generated");
        }

        render();
        setIsLoading(false);
      } catch (err) {
        console.error("RotatingEarth: error loading map", err);
        setError("Failed to load Earth map data");
        setIsLoading(false);
      }
    };

    const rotation: [number, number] = [0, 0];
    let autoRotate = true;
    const rotationSpeed = 0.35;

    const rotate = () => {
      if (autoRotate) {
        rotation[0] += rotationSpeed;
        projection.rotate(rotation);
        render();
      }
    };

    const rotationTimer = d3.timer(rotate);

    const handleMouseDown = (event: MouseEvent) => {
      autoRotate = false;
      const startX = event.clientX;
      const startY = event.clientY;
      const startRotation = [...rotation] as [number, number];

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const sensitivity = 0.5;
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;

        rotation[0] = startRotation[0] + dx * sensitivity;
        rotation[1] = startRotation[1] - dy * sensitivity;
        rotation[1] = Math.max(-90, Math.min(90, rotation[1]));

        projection.rotate(rotation);
        render();
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);

        setTimeout(() => {
          autoRotate = true;
        }, 50);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const scaleFactor = event.deltaY > 0 ? 0.9 : 1.1;
      const minScale = radius * 0.65;
      const maxScale = radius * 2.5;
      const newRadius = Math.max(minScale, Math.min(maxScale, projection.scale() * scaleFactor));
      projection.scale(newRadius);
      render();
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("wheel", handleWheel, { passive: false });

    loadWorldData();

    return () => {
      rotationTimer.stop();
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [width, height]);

  if (error) {
    return (
      <div
        className={`relative overflow-hidden bg-[#1A1A1A] border border-zinc-700 rounded-sm groove p-6 flex items-center justify-center ${className}`}
        style={{
          boxShadow: "inset 1px 1px 3px rgba(0,0,0,0.1), inset -1px -1px 3px rgba(255,255,255,0.2)",
        }}
      >
        <div className="text-center">
          <p className="text-sm font-semibold text-red-400">Error loading Earth visualization</p>
          <p className="text-xs text-zinc-400 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden bg-[#1A1A1A] border border-zinc-700 rounded-sm groove ${className}`}
      style={{
        boxShadow: "inset 1px 1px 3px rgba(0,0,0,0.1), inset -1px -1px 3px rgba(255,255,255,0.2)",
      }}
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-auto bg-transparent"
        style={{ maxWidth: "100%", height: "auto" }}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/75">
          <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Loading earth...</p>
        </div>
      )}
      <div className="absolute bottom-3 left-4 text-[10px] font-mono uppercase tracking-widest text-zinc-400 bg-zinc-950/80 px-2 py-1 rounded-sm">
        Drag to rotate · Scroll to zoom
      </div>
    </div>
  );
}
