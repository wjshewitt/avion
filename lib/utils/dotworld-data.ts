export const MAP_WIDTH = 360;
export const MAP_HEIGHT = 180;

interface Patch {
  minLon: number;
  maxLon: number;
  minLat: number;
  maxLat: number;
}

// Refined continent patches for better recognition at higher resolution.
// Increased detail for major landmasses while maintaining performance.
const CONTINENT_PATCHES: Patch[] = [
  // North America - West Coast
  { minLon: -170, maxLon: -100, minLat: 15, maxLat: 72 },
  // North America - East Coast & Central
  { minLon: -100, maxLon: -50, minLat: 25, maxLat: 70 },
  // Central America & Caribbean
  { minLon: -115, maxLon: -60, minLat: 5, maxLat: 32 },
  // South America - North
  { minLon: -82, maxLon: -35, minLat: -5, maxLat: 15 },
  // South America - South
  { minLon: -75, maxLon: -35, minLat: -56, maxLat: -5 },
  // Greenland
  { minLon: -75, maxLon: -10, minLat: 59, maxLat: 84 },
  // Iceland
  { minLon: -25, maxLon: -13, minLat: 63, maxLat: 67 },
  // British Isles
  { minLon: -11, maxLon: 2, minLat: 49, maxLat: 61 },
  // Western Europe
  { minLon: -10, maxLon: 16, minLat: 36, maxLat: 55 },
  // Eastern Europe & Scandinavia
  { minLon: 10, maxLon: 40, minLat: 42, maxLat: 72 },
  // North Africa
  { minLon: -18, maxLon: 52, minLat: 10, maxLat: 38 },
  // Sub-Saharan Africa
  { minLon: -18, maxLon: 52, minLat: -35, maxLat: 18 },
  // Madagascar
  { minLon: 43, maxLon: 51, minLat: -26, maxLat: -12 },
  // Middle East
  { minLon: 34, maxLon: 60, minLat: 12, maxLat: 42 },
  // Central Asia
  { minLon: 46, maxLon: 88, minLat: 35, maxLat: 55 },
  // Russia & Siberia
  { minLon: 27, maxLon: 180, minLat: 50, maxLat: 78 },
  // Indian Subcontinent
  { minLon: 68, maxLon: 97, minLat: 6, maxLat: 37 },
  // East Asia - China
  { minLon: 73, maxLon: 135, minLat: 18, maxLat: 54 },
  // Japan
  { minLon: 129, maxLon: 146, minLat: 30, maxLat: 46 },
  // Korea
  { minLon: 124, maxLon: 131, minLat: 33, maxLat: 43 },
  // Southeast Asia - Mainland
  { minLon: 92, maxLon: 109, minLat: -11, maxLat: 28 },
  // Southeast Asia - Maritime (Indonesia, Philippines)
  { minLon: 95, maxLon: 141, minLat: -11, maxLat: 21 },
  // Australia - West
  { minLon: 112, maxLon: 130, minLat: -35, maxLat: -10 },
  // Australia - East
  { minLon: 130, maxLon: 154, minLat: -44, maxLat: -10 },
  // New Zealand - North Island
  { minLon: 166, maxLon: 179, minLat: -42, maxLat: -34 },
  // New Zealand - South Island
  { minLon: 166, maxLon: 175, minLat: -47, maxLat: -40 },
  // Papua New Guinea
  { minLon: 140, maxLon: 156, minLat: -12, maxLat: -1 },
];

export const lonForColumn = (x: number): number => (x / MAP_WIDTH) * 360 - 180;

export const latForRow = (y: number): number => 90 - (y / MAP_HEIGHT) * 180;

export const isLandCoordinate = (lon: number, lat: number): boolean => {
  for (const patch of CONTINENT_PATCHES) {
    if (
      lon >= patch.minLon &&
      lon <= patch.maxLon &&
      lat >= patch.minLat &&
      lat <= patch.maxLat
    ) {
      return true;
    }
  }
  return false;
};

export interface LandCell {
  x: number;
  y: number;
  lon: number;
  lat: number;
}

export const generateLandCells = (): LandCell[] => {
  const cells: LandCell[] = [];
  for (let y = 0; y < MAP_HEIGHT; y += 1) {
    const lat = latForRow(y + 0.5);
    for (let x = 0; x < MAP_WIDTH; x += 1) {
      const lon = lonForColumn(x + 0.5);
      if (isLandCoordinate(lon, lat)) {
        cells.push({ x, y, lon, lat });
      }
    }
  }
  return cells;
};
