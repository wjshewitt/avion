"use client";

import React, { useState, useEffect, useMemo } from 'react';
import DeckGL from '@deck.gl/react';
import { MapViewState } from '@deck.gl/core';
import { IconLayer } from '@deck.gl/layers';
import Map, { MapRef } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useLiveTraffic } from '@/hooks/useLiveTraffic';
import { TrackedAircraft, AdsbDbAircraft } from '@/lib/adsb/types';
import { SelectedAircraftCard } from './SelectedAircraftCard';

// Aircraft icon mapping (could be sprite sheet in production)
// For now using a simple SVGs or Deck.gl's default icon support
const AIRPLANE_ICON_ATLAS = 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png';
const AIRPLANE_ICON_MAPPING = {
  marker: {x: 0, y: 0, width: 128, height: 128, mask: true}
};

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: -0.1278,
  latitude: 51.5074,
  zoom: 6,
  pitch: 45,
  bearing: 0
};

export default function FlightTrackerMap() {
  const [mounted, setMounted] = useState(false);
  const [viewState, setViewState] = useState<MapViewState>(INITIAL_VIEW_STATE);
  const [bounds, setBounds] = useState<{ north: number, south: number, east: number, west: number } | null>(null);
  const [selectedAircraft, setSelectedAircraft] = useState<TrackedAircraft | null>(null);
  const [aircraftDetails, setAircraftDetails] = useState<AdsbDbAircraft | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch metadata when an aircraft is selected
  useEffect(() => {
    if (!selectedAircraft) {
      setAircraftDetails(null);
      return;
    }

    async function fetchDetails() {
      if (!selectedAircraft) return;
      setLoadingDetails(true);
      try {
        const res = await fetch(`/api/aircraft/${selectedAircraft.icao24}`);
        if (res.ok) {
          const data = await res.json();
          setAircraftDetails(data);
        } else {
          setAircraftDetails(null);
        }
      } catch (error) {
        console.error('Failed to fetch aircraft details:', error);
      } finally {
        setLoadingDetails(false);
      }
    }

    fetchDetails();
  }, [selectedAircraft?.icao24]);

  // Update bounds when view state changes
  const onViewStateChange = ({ viewState }: { viewState: any }) => {
    const vs = viewState as MapViewState;
    setViewState(vs);
    
    // Simple bounds estimation based on zoom and center
    // In a real app, use WebMercatorViewport to get exact bounds
    const latDelta = 20 / Math.pow(2, vs.zoom);
    const lonDelta = 20 / Math.pow(2, vs.zoom);
    
    if (vs.latitude && vs.longitude) {
      setBounds({
        north: vs.latitude + latDelta,
        south: vs.latitude - latDelta,
        east: vs.longitude + lonDelta,
        west: vs.longitude - lonDelta
      });
    }
  };

  const { traffic } = useLiveTraffic(bounds);

  const layers = [
    new IconLayer<TrackedAircraft>({
      id: 'aircraft-layer',
      data: traffic,
      pickable: true,
      iconAtlas: AIRPLANE_ICON_ATLAS,
      iconMapping: AIRPLANE_ICON_MAPPING,
      getIcon: d => 'marker',
      sizeScale: 15,
      getPosition: d => [d.lon, d.lat, d.altitude],
      getAngle: d => 360 - d.heading, // Deck.gl rotates counter-clockwise
      getColor: d => [255, 140, 0], // Safety Orange
      getSize: d => 3,
      transitions: {
        getPosition: 1000, // Smooth transition over 1 second
        getAngle: 1000
      },
      onClick: ({ object }) => {
        if (object) {
          setSelectedAircraft(object);
        } else {
          setSelectedAircraft(null);
        }
      }
    })
  ];

  if (!mounted) return null;

  return (
    <div className="relative w-full h-full bg-gray-900">
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={layers}
        onViewStateChange={onViewStateChange}
        viewState={viewState}
        glOptions={{ preserveDrawingBuffer: true }}
      >
        <Map
          mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
          mapLib={maplibregl}
          reuseMaps
          attributionControl={false}
          terrain={{ source: 'terrain', exaggeration: 1.5 }}
        />
      </DeckGL>
      
      {/* Selected Aircraft Card */}
      {selectedAircraft && (
        <SelectedAircraftCard
          aircraft={selectedAircraft}
          details={aircraftDetails}
          loadingDetails={loadingDetails}
          onClose={() => setSelectedAircraft(null)}
        />
      )}
      
      {/* Status Overlay */}
      <div className="absolute top-4 left-4 bg-black/80 text-white p-4 rounded-lg backdrop-blur z-10">
        <h3 className="font-bold text-sm uppercase tracking-wider text-orange-500">Live Traffic</h3>
        <div className="text-xs mt-1">
          <p>Aircraft Visible: {traffic.length}</p>
          <p className="text-gray-400 mt-1">Source: Airplanes.live (1Hz)</p>
        </div>
      </div>
    </div>
  );
}
