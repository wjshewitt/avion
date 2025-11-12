/**
 * Tool Execution Engine for Gemini Function Calls
 * Handles execution of flight and airport capability tools
 */

import { createClient } from '@/lib/supabase/server';
import { AirportService } from '@/lib/airports/airport-service';
import { analyzeRunways } from '@/lib/airports/runway-analyzer';
import { AIRCRAFT_REQUIREMENTS } from '@/lib/airports/runway-analyzer';
import type { Flight } from '@/lib/supabase/types';

interface ToolCallArgs {
  [key: string]: any;
}

interface ToolResponse {
  name: string;
  response: {
    success: boolean;
    data?: any;
    error?: string;
  };
}

/**
 * Execute get_user_flights tool
 */
async function executeGetUserFlights(userId: string, args: ToolCallArgs) {
  const supabase = await createClient();
  
  const {
    filter_type = 'all',
    date_from,
    date_to,
    origin_icao,
    destination_icao,
    limit = 20
  } = args;
  
  // Build query
  let query = supabase
    .from('user_flights')
    .select('id, code, origin, destination, origin_icao, destination_icao, scheduled_at, arrival_at, aircraft, passenger_count, crew_count, status, weather_risk_score, weather_alert_level')
    .eq('user_id', userId)
    .order('scheduled_at', { ascending: true })
    .limit(Math.min(limit, 50));
  
  // Apply filters
  const now = new Date();
  
  switch (filter_type) {
    case 'upcoming':
      query = query.gte('scheduled_at', now.toISOString());
      break;
    case 'recent':
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      query = query.gte('scheduled_at', sevenDaysAgo.toISOString()).lte('scheduled_at', now.toISOString());
      break;
    case 'date_range':
      if (date_from) query = query.gte('scheduled_at', date_from);
      if (date_to) query = query.lte('scheduled_at', date_to);
      break;
  }
  
  if (origin_icao) {
    query = query.eq('origin_icao', origin_icao.toUpperCase());
  }
  
  if (destination_icao) {
    query = query.eq('destination_icao', destination_icao.toUpperCase());
  }
  
  const { data: flights, error } = await query as { data: any[] | null; error: any };
  
  if (error) {
    throw new Error(`Failed to fetch flights: ${error.message}`);
  }
  
  if (!flights) {
    return { flights: [], count: 0, filter_applied: filter_type };
  }
  
  // Format condensed response
  const condensedFlights = flights.map(f => ({
    id: f.id,
    code: f.code,
    route: `${f.origin_icao || f.origin} → ${f.destination_icao || f.destination}`,
    origin_icao: f.origin_icao,
    destination_icao: f.destination_icao,
    scheduled_at: f.scheduled_at,
    arrival_at: f.arrival_at,
    aircraft: f.aircraft,
    passenger_count: f.passenger_count,
    crew_count: f.crew_count,
    status: f.status,
    weather_risk_score: f.weather_risk_score,
    weather_alert_level: f.weather_alert_level
  }));
  
  return {
    flights: condensedFlights,
    count: condensedFlights.length,
    filter_applied: filter_type
  };
}

/**
 * Execute get_flight_details tool
 */
async function executeGetFlightDetails(userId: string, args: ToolCallArgs) {
  const supabase = await createClient();
  const { flight_id } = args;
  
  if (!flight_id) {
    throw new Error('flight_id is required');
  }
  
  const { data: flight, error } = await supabase
    .from('user_flights')
    .select('*')
    .eq('id', flight_id)
    .eq('user_id', userId) // Security: ensure user owns this flight
    .single() as { data: Flight | null; error: any };
  
  if (error || !flight) {
    throw new Error(`Flight not found or access denied`);
  }
  
  // Return full flight details
  return {
    flight: {
      id: flight.id,
      code: flight.code,
      origin: flight.origin,
      destination: flight.destination,
      origin_icao: flight.origin_icao,
      destination_icao: flight.destination_icao,
      scheduled_at: flight.scheduled_at,
      arrival_at: flight.arrival_at,
      aircraft: flight.aircraft,
      operator: flight.operator,
      passenger_count: flight.passenger_count,
      crew_count: flight.crew_count,
      notes: flight.notes,
      status: flight.status,
      weather_risk_score: flight.weather_risk_score,
      weather_alert_level: flight.weather_alert_level,
      weather_focus: flight.weather_focus,
      weather_updated_at: flight.weather_updated_at
    }
  };
}

/**
 * Execute get_airport_capabilities tool
 */
async function executeGetAirportCapabilities(args: ToolCallArgs) {
  const { icao, aircraft_type, check_type = 'all' } = args;
  
  console.log('🛫 Executing get_airport_capabilities:', { icao, aircraft_type, check_type });
  
  if (!icao) {
    throw new Error('icao is required');
  }
  
  const normalizedIcao = icao.toUpperCase().trim();
  
  // Use AirportService for cache-first lookup
  const airportService = new AirportService();
  const airportResult = await airportService.getAirport(normalizedIcao);
  
  console.log('✈️ Airport lookup result:', {
    found: !!airportResult.data,
    source: airportResult.source,
    icao: normalizedIcao
  });
  
  if (!airportResult.data) {
    throw new Error(`Airport ${normalizedIcao} not found`);
  }
  
  const airport = airportResult.data;
  
  // Build response based on check_type
  const response: any = {
    airport: {
      icao: airport.icao,
      iata: airport.iata,
      name: airport.name,
      location: {
        city: airport.location?.municipality || 'Unknown',
        country: airport.location?.country || 'Unknown',
        elevation_ft: airport.coordinates?.elevation_ft
      }
    }
  };
  
  // Runway analysis
  if (check_type === 'all' || check_type === 'runway_analysis') {
    // Calculate widest runway from details
    const widest_ft = airport.runways?.details?.reduce((max, r) => 
      Math.max(max, r.width_ft || 0), 0) || 0;
    
    response.runways = {
      count: airport.runways?.count || 0,
      longest_ft: airport.runways?.longest_ft || 0,
      widest_ft,
      surface_types: airport.runways?.surface_types || [],
      all_lighted: airport.runways?.all_lighted || false,
      ils_equipped: airport.runways?.ils_equipped || false,
      details: airport.runways?.details?.map(r => ({
        designation: r.runway_designation,
        length_ft: r.length_ft,
        width_ft: r.width_ft,
        surface: r.surface,
        lighted: r.lighted,
        le_ils: r.le_ils,
        he_ils: r.he_ils
      })) || []
    };
  }
  
  // ILS availability
  if (check_type === 'all' || check_type === 'ils_availability') {
    response.navigation = {
      has_ils: airport.navigation?.has_ils || false,
      has_vor: airport.navigation?.has_vor || false,
      has_ndb: airport.navigation?.has_ndb || false,
      approach_types: airport.navigation?.approach_types || []
    };
  }
  
  // Communications
  if (check_type === 'all') {
    response.communications = {
      has_tower: airport.communications?.has_tower || false,
      has_atis: airport.communications?.has_atis || false,
      primary_frequencies: airport.communications?.primary_frequencies || {}
    };
  }
  
  // Aircraft suitability analysis
  if (aircraft_type && (check_type === 'all' || check_type === 'aircraft_suitability')) {
    const suitability = assessAircraftSuitability(
      airport,
      aircraft_type
    );
    response.aircraft_suitability = suitability;
  }
  
  response.data_source = airportResult.source;
  response.cached = airportResult.cached;
  
  console.log('📊 Airport capabilities response:', {
    icao: response.airport.icao,
    hasRunways: !!response.runways,
    runwayCount: response.runways?.count,
    hasSuitability: !!response.aircraft_suitability,
    suitability: response.aircraft_suitability?.suitable
  });
  
  return response;
}

/**
 * Assess if an aircraft can operate at an airport
 */
function assessAircraftSuitability(airport: any, aircraftType: string): any {
  // Map common aircraft types to requirements
  const aircraftLower = aircraftType.toLowerCase();
  let requirements = AIRCRAFT_REQUIREMENTS.business_jets; // default
  
  if (aircraftLower.includes('global') || aircraftLower.includes('g650') || aircraftLower.includes('g7')) {
    requirements = AIRCRAFT_REQUIREMENTS.wide_body;
  } else if (aircraftLower.includes('gulfstream') || aircraftLower.includes('falcon') || aircraftLower.includes('challenger')) {
    requirements = AIRCRAFT_REQUIREMENTS.business_jets;
  } else if (aircraftLower.includes('citation') || aircraftLower.includes('learjet') || aircraftLower.includes('phenom')) {
    requirements = AIRCRAFT_REQUIREMENTS.light_aircraft;
  }
  
  const longestRunway = airport.runways?.longest_ft || 0;
  const widestRunway = airport.runways?.widest_ft || 0;
  const hasPavedRunway = airport.runways?.surface_types?.some((s: string) => 
    s === 'ASP' || s === 'CON'
  ) || false;
  const hasILS = airport.runways?.ils_equipped || false;
  const hasLighting = airport.runways?.all_lighted || false;
  
  const reasons: string[] = [];
  const warnings: string[] = [];
  let suitable = true;
  let confidence: 'high' | 'medium' | 'low' = 'high';
  
  // Check runway length
  if (longestRunway >= requirements.min_runway_length_ft) {
    reasons.push(`Runway length (${longestRunway} ft) exceeds minimum requirement (${requirements.min_runway_length_ft} ft)`);
  } else {
    suitable = false;
    reasons.push(`Runway length (${longestRunway} ft) is insufficient (requires ${requirements.min_runway_length_ft} ft)`);
  }
  
  // Check runway width
  if (widestRunway >= requirements.min_runway_width_ft) {
    reasons.push(`Runway width (${widestRunway} ft) is adequate (requires ${requirements.min_runway_width_ft} ft)`);
  } else {
    warnings.push(`Runway width (${widestRunway} ft) is below recommended (${requirements.min_runway_width_ft} ft) - tight margins`);
    confidence = 'medium';
  }
  
  // Check surface
  if (requirements.requires_paved && !hasPavedRunway) {
    suitable = false;
    reasons.push('Paved runway required but not available');
  } else if (hasPavedRunway) {
    reasons.push('Paved surface available (asphalt or concrete)');
  }
  
  // Check lighting
  if (requirements.requires_lighting && !hasLighting) {
    warnings.push('Runway lighting may not be available on all runways');
    confidence = 'medium';
  } else if (hasLighting) {
    reasons.push('Runway lighting available');
  }
  
  // Check ILS
  if (requirements.requires_ils && !hasILS) {
    warnings.push('ILS precision approach not available at this airport');
    confidence = 'medium';
  } else if (hasILS) {
    reasons.push('ILS precision approach available');
  }
  
  return {
    suitable,
    confidence,
    aircraft_type: aircraftType,
    reasons,
    warnings: warnings.length > 0 ? warnings : undefined,
    requirements_used: {
      min_runway_length_ft: requirements.min_runway_length_ft,
      min_runway_width_ft: requirements.min_runway_width_ft,
      requires_paved: requirements.requires_paved
    }
  };
}

/**
 * Main tool executor - routes to appropriate handler
 */
export async function executeFlightTool(
  toolName: string,
  args: ToolCallArgs,
  userId: string
): Promise<any> {
  console.log(`🔧 Executing tool: ${toolName}`, args);
  
  try {
    switch (toolName) {
      case 'get_user_flights':
        return await executeGetUserFlights(userId, args);
      
      case 'get_flight_details':
        return await executeGetFlightDetails(userId, args);
      
      case 'get_airport_capabilities':
        return await executeGetAirportCapabilities(args);
      
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  } catch (error) {
    console.error(`❌ Tool execution failed for ${toolName}:`, error);
    throw error;
  }
}

/**
 * Execute multiple tools in parallel
 */
export async function executeFlightTools(
  toolCalls: Array<{ name: string; args: ToolCallArgs }>,
  userId: string
): Promise<ToolResponse[]> {
  const results = await Promise.all(
    toolCalls.map(async (call) => {
      try {
        const data = await executeFlightTool(call.name, call.args, userId);
        return {
          name: call.name,
          response: {
            success: true,
            data
          }
        };
      } catch (error) {
        return {
          name: call.name,
          response: {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        };
      }
    })
  );
  
  return results;
}
