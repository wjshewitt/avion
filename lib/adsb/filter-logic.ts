import { TrackedAircraft } from '@/lib/adsb/types';
import { TrafficFilters } from './filter-store';
import { CORPORATE_AIRCRAFT_TYPES, STATIC_CORPORATE_OPERATORS } from './corporate-data';

export function filterTraffic(aircraft: TrackedAircraft[], filters: TrafficFilters): TrackedAircraft[] {
  return aircraft.filter(ac => {
    // 1. Altitude Filter
    if (ac.altitude < filters.altitudeMin || ac.altitude > filters.altitudeMax) {
      return false;
    }

    // 2. Speed Filter
    if (ac.speed < filters.speedMin || ac.speed > filters.speedMax) {
      return false;
    }

    // 3. Ground Status Filter
    if (filters.onGround !== 'both') {
      if (filters.onGround === true && !ac.onGround) return false;
      if (filters.onGround === false && ac.onGround) return false;
    }

    // 4. Source / Category Filter
    if (filters.source === 'corporate') {
      const type = ac.type || '';
      const callsign = ac.callsign || '';
      
      const isCorporateType = CORPORATE_AIRCRAFT_TYPES.includes(type);
      const isCorporateOperator = STATIC_CORPORATE_OPERATORS.some(op => callsign.startsWith(op));
      
      if (!isCorporateType && !isCorporateOperator) {
        return false;
      }
    } else if (filters.source === 'airline') {
      const type = ac.type || '';
      const callsign = ac.callsign || '';
      
      const isCorporateType = CORPORATE_AIRCRAFT_TYPES.includes(type);
      const isCorporateOperator = STATIC_CORPORATE_OPERATORS.some(op => callsign.startsWith(op));
      
      // Simple heuristic: if it's NOT corporate, it's likely general/airline
      // In a real app, we'd have an AIRLINE_OPERATORS list to be precise
      if (isCorporateType || isCorporateOperator) {
        return false;
      }
    }

    // 5. Search Query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toUpperCase();
      const matchesCallsign = ac.callsign?.toUpperCase().includes(query);
      const matchesReg = ac.registration?.toUpperCase().includes(query);
      const matchesHex = ac.icao24.toUpperCase().includes(query);
      
      if (!matchesCallsign && !matchesReg && !matchesHex) {
        return false;
      }
    }

    return true;
  });
}
