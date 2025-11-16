"use client";

import { useEffect } from "react";
import { Layers, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";

type MapHUDProps = {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetBearing: () => void;
  onChangeStyle?: () => void;
  onFitResults: () => void;
};

export function MapHUD({ onZoomIn, onZoomOut, onResetBearing, onChangeStyle, onFitResults }: MapHUDProps) {
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const style = document.createElement("style");
    style.textContent = `
      .map-hud-btn {
        border: 1px solid rgba(255,255,255,0.2);
        background: rgba(12,12,12,0.6);
        color: #F5F5F5;
        padding: 0.35rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 2px;
        transition: background 0.2s ease, border-color 0.2s ease;
      }
      .map-hud-btn:hover {
        background: rgba(240,78,48,0.2);
        border-color: rgba(240,78,48,0.6);
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4">
      <div className="ml-auto flex flex-col gap-2 pointer-events-auto">
        <button
          type="button"
          onClick={onZoomIn}
          className="map-hud-btn"
          aria-label="Zoom in"
        >
          <ZoomIn size={14} strokeWidth={1.5} />
        </button>
        <button
          type="button"
          onClick={onZoomOut}
          className="map-hud-btn"
          aria-label="Zoom out"
        >
          <ZoomOut size={14} strokeWidth={1.5} />
        </button>
        <button
          type="button"
          onClick={onResetBearing}
          className="map-hud-btn"
          aria-label="Reset bearing"
        >
          <RotateCcw size={14} strokeWidth={1.5} />
        </button>
        {onChangeStyle && (
          <button
            type="button"
            onClick={onChangeStyle}
            className="map-hud-btn"
            aria-label="Change basemap"
          >
            <Layers size={14} strokeWidth={1.5} />
          </button>
        )}
      </div>

      <div className="pointer-events-auto">
        <button
          type="button"
          onClick={onFitResults}
          className="inline-flex items-center gap-2 rounded-sm border border-border bg-background/80 px-4 py-2 text-[11px] font-mono uppercase tracking-[0.2em] text-foreground shadow-lg"
        >
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-border bg-background/60 text-[10px]">Q</span>
          Fit Results
        </button>
      </div>
    </div>
  );
}
