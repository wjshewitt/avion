import { AdsbDbResponse, AdsbDbAircraft } from './types';
import { createClient } from '@/lib/supabase/server';

const BASE_URL = 'https://api.adsbdb.com/v0';

export class AdsbDbClient {
  /**
   * Get aircraft metadata by Mode S Hex
   * Checks Supabase cache first, then API
   */
  static async getAircraftMetadata(icao24: string): Promise<AdsbDbAircraft | null> {
    const supabase = await createClient();

    // 1. Check Cache
    // Define local type for cache query
    interface AircraftCache {
      icao24: string;
      registration: string;
      type_code: string;
      manufacturer: string;
      owner: string;
      image_url: string | null;
    }

    const { data: cached } = await supabase
      .from('aircraft')
      .select('*')
      .eq('icao24', icao24)
      .single() as { data: AircraftCache | null };

    if (cached) {
      return {
        mode_s: cached.icao24,
        registration: cached.registration,
        icao_type: cached.type_code,
        manufacturer: cached.manufacturer,
        registered_owner: cached.owner,
        url_photo: cached.image_url,
        // Map other fields as needed or leave partial
        type: '', 
        registered_owner_country_iso_name: '',
        registered_owner_country_name: '',
        registered_owner_operator_flag_code: null,
        url_photo_thumbnail: null
      };
    }

    // 2. Fetch from API
    try {
      const response = await fetch(`${BASE_URL}/aircraft/${icao24}`, {
        // Cache for 24 hours at edge
        next: { revalidate: 86400 }
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`ADS-B DB Error: ${response.status}`);
      }

      const data: AdsbDbResponse = await response.json();
      const aircraft = data.response.aircraft;

      // 3. Update Cache (Fire and forget)
      // We use a separate async context or just await it here since it's fast
      // Note: createClient() is for server components/actions. 
      // In a pure library function called from client-side via API route, 
      // we might need the service role if RLS restricts insertion.
      // For now, we assume this runs in a secure server context.
      
      // Cast to any to bypass missing type definition
      await (supabase.from('aircraft') as any).upsert({
        icao24: aircraft.mode_s,
        registration: aircraft.registration,
        type_code: aircraft.icao_type,
        manufacturer: aircraft.manufacturer,
        // model: aircraft.type, // Map 'type' to 'model' if desired
        owner: aircraft.registered_owner,
        image_url: aircraft.url_photo,
        source: 'adsbdb',
        updated_at: new Date().toISOString()
      });

      return aircraft;

    } catch (error) {
      console.error(`Failed to fetch metadata for ${icao24}:`, error);
      return null;
    }
  }
}
