import type { StyleSpecification } from 'maplibre-gl';

export type MapStyleType = 'dark' | 'light' | 'satellite' | 'terrain' | 'streets';

export interface MapStyleOption {
  id: MapStyleType;
  name: string;
  description: string;
  style: StyleSpecification;
}

/**
 * Avion Design Language - Tungsten (Dark) Map Style
 * Uses dark background with muted basemap for minimal distraction
 */
export const AVION_DARK_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    'carto-basemap': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors © CARTO',
    },
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#1A1A1A', // Tungsten
      },
    },
    {
      id: 'carto-basemap-layer',
      type: 'raster',
      source: 'carto-basemap',
      paint: {
        'raster-opacity': 0.6,
      },
    },
  ],
};

/**
 * Avion Design Language - Ceramic (Light) Map Style
 * Uses light background with subtle basemap
 */
export const AVION_LIGHT_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    'carto-basemap': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors © CARTO',
    },
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#F4F4F4', // Ceramic
      },
    },
    {
      id: 'carto-basemap-layer',
      type: 'raster',
      source: 'carto-basemap',
      paint: {
        'raster-opacity': 0.7,
      },
    },
  ],
};

/**
 * Satellite Imagery Style
 * High-resolution satellite imagery from ESRI
 */
export const SATELLITE_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    'esri-satellite': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: '© Esri, Maxar, Earthstar Geographics',
    },
  },
  layers: [
    {
      id: 'satellite-layer',
      type: 'raster',
      source: 'esri-satellite',
    },
  ],
};

/**
 * Terrain Style
 * Topographic map with terrain shading
 */
export const TERRAIN_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    'terrain-basemap': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: '© Esri, HERE, Garmin',
    },
  },
  layers: [
    {
      id: 'terrain-layer',
      type: 'raster',
      source: 'terrain-basemap',
      paint: {
        'raster-opacity': 0.9,
      },
    },
  ],
};

/**
 * Streets Style
 * Detailed street map
 */
export const STREETS_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    'osm-streets': {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'streets-layer',
      type: 'raster',
      source: 'osm-streets',
    },
  ],
};

/**
 * All available map styles
 */
export const MAP_STYLES: MapStyleOption[] = [
  {
    id: 'dark',
    name: 'Dark',
    description: 'Tungsten - Low distraction dark theme',
    style: AVION_DARK_STYLE,
  },
  {
    id: 'light',
    name: 'Light',
    description: 'Ceramic - Bright and clear',
    style: AVION_LIGHT_STYLE,
  },
  {
    id: 'satellite',
    name: 'Satellite',
    description: 'High-resolution imagery',
    style: SATELLITE_STYLE,
  },
  {
    id: 'terrain',
    name: 'Terrain',
    description: 'Topographic with elevation',
    style: TERRAIN_STYLE,
  },
  {
    id: 'streets',
    name: 'Streets',
    description: 'Detailed street network',
    style: STREETS_STYLE,
  },
];
