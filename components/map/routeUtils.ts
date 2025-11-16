/**
 * Calculate great circle distance between two points (Haversine formula)
 */
export function calculateDistance(
  lon1: number,
  lat1: number,
  lon2: number,
  lat2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function toDeg(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Calculate a point along a great circle route
 * @param start [longitude, latitude]
 * @param end [longitude, latitude]
 * @param fraction 0-1, where 0 is start and 1 is end
 */
export function greatCirclePoint(
  start: [number, number],
  end: [number, number],
  fraction: number
): [number, number] {
  const [lon1, lat1] = start;
  const [lon2, lat2] = end;

  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const lambda1 = toRad(lon1);
  const lambda2 = toRad(lon2);

  const deltaPhi = phi2 - phi1;
  const deltaLambda = lambda2 - lambda1;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const delta = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const A = Math.sin((1 - fraction) * delta) / Math.sin(delta);
  const B = Math.sin(fraction * delta) / Math.sin(delta);

  const x = A * Math.cos(phi1) * Math.cos(lambda1) + B * Math.cos(phi2) * Math.cos(lambda2);
  const y = A * Math.cos(phi1) * Math.sin(lambda1) + B * Math.cos(phi2) * Math.sin(lambda2);
  const z = A * Math.sin(phi1) + B * Math.sin(phi2);

  const phi = Math.atan2(z, Math.sqrt(x * x + y * y));
  const lambda = Math.atan2(y, x);

  return [toDeg(lambda), toDeg(phi)];
}

/**
 * Create a curved arc between two points for flight route visualization
 * Uses great circle interpolation with elevation curve
 */
export function createRouteArc(
  origin: [number, number],
  destination: [number, number],
  numPoints = 100
): [number, number][] {
  const arc: [number, number][] = [];

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const point = greatCirclePoint(origin, destination, t);
    arc.push(point);
  }

  return arc;
}

/**
 * Calculate bounds for a set of coordinates
 */
export function calculateBounds(
  coordinates: [number, number][]
): [[number, number], [number, number]] {
  if (coordinates.length === 0) {
    return [
      [-180, -90],
      [180, 90],
    ];
  }

  let minLng = coordinates[0][0];
  let maxLng = coordinates[0][0];
  let minLat = coordinates[0][1];
  let maxLat = coordinates[0][1];

  for (const [lng, lat] of coordinates) {
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }

  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}

/**
 * Get mock airport coordinates (fallback until real airport data is integrated)
 */
export function getMockAirportCoordinates(icao: string): [number, number] | null {
  const airports: Record<string, [number, number]> = {
    KJFK: [-73.7781, 40.6413], // New York JFK
    KLAX: [-118.4085, 33.9416], // Los Angeles
    EGLL: [-0.4543, 51.4700], // London Heathrow
    LFPG: [2.5479, 49.0097], // Paris CDG
    EDDF: [8.5622, 50.0379], // Frankfurt
    RJTT: [139.7810, 35.5494], // Tokyo Haneda
    YSSY: [151.1772, -33.9399], // Sydney
    OMDB: [55.3644, 25.2532], // Dubai
    VHHH: [113.9148, 22.3080], // Hong Kong
    KSFO: [-122.3789, 37.6213], // San Francisco
    KORD: [-87.9048, 41.9742], // Chicago O'Hare
    KATL: [-84.4281, 33.6407], // Atlanta
    ZBAA: [116.5974, 40.0801], // Beijing Capital
    WSSS: [103.9894, 1.3644], // Singapore Changi
    EHAM: [4.7639, 52.3086], // Amsterdam Schiphol
    LFMN: [7.2159, 43.6584], // Nice
    KTEB: [-74.0608, 40.8501], // Teterboro
    EGLF: [-0.7763, 51.3389], // Farnborough
    KVNY: [-118.4900, 34.2098], // Van Nuys
  };

  return airports[icao] || null;
}
