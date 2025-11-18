import { AirplanesLiveResponse, TrackedAircraft } from './types';

const BASE_URL = 'https://api.airplanes.live/v2';

export class AirplanesLiveClient {
  /**
   * Fetch aircraft within a bounding box
   */
  static async getTrafficInBounds(
    north: number,
    south: number,
    east: number,
    west: number
  ): Promise<TrackedAircraft[]> {
    // Ensure coordinates are valid
    const n = Math.min(90, Math.max(-90, north));
    const s = Math.min(90, Math.max(-90, south));
    const e = Math.min(180, Math.max(-180, east));
    const w = Math.min(180, Math.max(-180, west));

    try {
      const url = `${BASE_URL}/point/${n}/${w}/${s}/${e}`; // Note: API might use different path structure, checking docs...
      // Docs say: /point/lat/lon/radius OR we can use the generic /mil /all etc if bounds are large.
      // Wait, typical ADS-B Exchange / Airplanes.live style is often just a global JSON or keyed.
      // Let's use the documented "point" or regional endpoints if available.
      // Actually, Airplanes.live documentation mentions:
      // GET /v2/point/{lat}/{lon}/{dist}
      // GET /v2/hex/{hex}
      // GET /v2/callsign/{callsign}
      // GET /v2/reg/{reg}
      
      // For a map view, we usually want a center + radius.
      // Let's simulate bounds by finding center and max radius.
      
      const centerLat = (n + s) / 2;
      const centerLon = (e + w) / 2;
      
      // Rough approximation of radius in NM
      const latDiff = Math.abs(n - s) * 60;
      const lonDiff = Math.abs(e - w) * 60 * Math.cos(centerLat * Math.PI / 180);
      const radius = Math.max(latDiff, lonDiff) / 2;
      const radiusInt = Math.min(250, Math.ceil(radius)); // Cap at 250nm for performance

      const response = await fetch(
        `${BASE_URL}/point/${centerLat}/${centerLon}/${radiusInt}`, 
        { next: { revalidate: 0 } } // No cache for live data
      );

      if (!response.ok) {
        throw new Error(`Airplanes.live API error: ${response.statusText}`);
      }

      const data: AirplanesLiveResponse = await response.json();

      return this.transformResponse(data);

    } catch (error) {
      console.error('Failed to fetch live traffic:', error);
      return [];
    }
  }

  /**
   * Fetch specific aircraft by Hex ID
   */
  static async getAircraftByHex(hex: string): Promise<TrackedAircraft | null> {
    try {
      const response = await fetch(`${BASE_URL}/hex/${hex}`, {
        next: { revalidate: 0 }
      });

      if (!response.ok) return null;

      const data: AirplanesLiveResponse = await response.json();
      const aircraft = this.transformResponse(data);
      
      return aircraft.length > 0 ? aircraft[0] : null;
    } catch (error) {
      console.error(`Failed to fetch aircraft ${hex}:`, error);
      return null;
    }
  }

  private static transformResponse(data: AirplanesLiveResponse): TrackedAircraft[] {
    if (!data.aircraft) return [];

    return data.aircraft.map(a => ({
      icao24: a.hex,
      callsign: a.flight?.trim() || '',
      registration: a.r,
      type: a.t,
      lat: a.lat,
      lon: a.lon,
      altitude: typeof a.alt_baro === 'number' ? a.alt_baro : 0,
      speed: a.gs,
      heading: a.track,
      verticalRate: a.baro_rate,
      onGround: a.alt_baro === 'ground',
      squawk: a.squawk,
      lastContact: data.now
    })).filter(a => a.lat && a.lon); // Filter out positionless aircraft
  }
}
