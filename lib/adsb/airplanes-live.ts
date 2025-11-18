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
      // For a map view, we usually want a center + radius.
      // Let's simulate bounds by finding center and max radius.
      
      const centerLat = (n + s) / 2;
      const centerLon = (e + w) / 2;
      
      // Rough approximation of radius in NM
      // 1 degree lat ~= 60 NM
      const latDiff = Math.abs(n - s) * 60;
      // Longitude degrees shrink by cos(lat)
      const lonDiff = Math.abs(e - w) * 60 * Math.cos(centerLat * Math.PI / 180);
      
      // Use the larger dimension to ensure coverage, but cap strictly to avoid API errors
      // Airplanes.live usually limits radius to 250nm
      const radius = Math.max(latDiff, lonDiff) / 2;
      const radiusInt = Math.min(250, Math.max(10, Math.ceil(radius))); 

      const url = `${BASE_URL}/point/${centerLat.toFixed(4)}/${centerLon.toFixed(4)}/${radiusInt}`;
      console.log(`[AirplanesLive] Fetching: ${url}`);

      const response = await fetch(
        url, 
        { next: { revalidate: 0 } } // No cache for live data
      );

      if (!response.ok) {
        throw new Error(`Airplanes.live API error: ${response.status} ${response.statusText}`);
      }

      const data: AirplanesLiveResponse = await response.json();
      
      // Log count for debugging
      // console.log(`[AirplanesLive] Found ${data.aircraft?.length || 0} aircraft`);

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
