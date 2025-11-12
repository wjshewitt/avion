/**
 * Flight Data Tools for Gemini AI
 * Provides tools for querying user flights, flight details, and airport capabilities
 */

import { Type } from '@google/genai';

export const FLIGHT_DATA_TOOLS = [
  {
    name: 'get_user_flights',
    description: `Fetch user's flight list with optional filters. Use this when user asks about their flights, schedule, or operations.

Examples:
- "Show me my upcoming flights" → filter_type="upcoming"
- "Flights to Miami" → destination_icao="KMIA"
- "My schedule this week" → filter_type="date_range" with dates
- "Flights from Teterboro" → origin_icao="KTEB"

Returns condensed flight data including route, times, aircraft, passengers, crew, and risk score.`,
    
    parameters: {
      type: Type.OBJECT,
      properties: {
        filter_type: {
          type: Type.STRING,
          description: 'Filter type: "upcoming" (future flights), "recent" (past 7 days), "date_range" (custom range), "route" (specific origin/dest), "all" (all flights)'
        },
        date_from: {
          type: Type.STRING,
          description: 'Start date in ISO format (YYYY-MM-DD). Required if filter_type="date_range"'
        },
        date_to: {
          type: Type.STRING,
          description: 'End date in ISO format (YYYY-MM-DD). Required if filter_type="date_range"'
        },
        origin_icao: {
          type: Type.STRING,
          description: 'Filter by origin airport ICAO code (4-letter, uppercase)'
        },
        destination_icao: {
          type: Type.STRING,
          description: 'Filter by destination airport ICAO code (4-letter, uppercase)'
        },
        limit: {
          type: Type.NUMBER,
          description: 'Maximum number of results to return (default: 20, max: 50)'
        }
      },
      required: ['filter_type']
    }
  },
  
  {
    name: 'get_flight_details',
    description: `Get comprehensive details for a specific flight. Use this when you have a flight_id from get_user_flights and need full information.

Returns complete flight record including:
- Full route details with ICAO codes and airport names
- Aircraft type and operator
- Passenger count and crew count
- Flight notes and requirements
- Weather risk score and alert level
- Scheduled and arrival times
- Current status`,
    
    parameters: {
      type: Type.OBJECT,
      properties: {
        flight_id: {
          type: Type.STRING,
          description: 'UUID of the flight (obtained from get_user_flights)'
        },
        reason: {
          type: Type.STRING,
          description: 'Brief explanation of why flight details are needed (for logging)'
        }
      },
      required: ['flight_id']
    }
  },
  
  {
    name: 'get_airport_capabilities',
    description: `Analyze airport operational capabilities including runways, ILS, and aircraft suitability.

Use cases:
- "Can a [aircraft] land at [airport]?" → aircraft_type specified
- "How long is the runway at [airport]?" → runway analysis
- "Does [airport] have ILS?" → navigation capabilities
- General airport operational assessment

Returns:
- Runway data (lengths, widths, surface types, lighting)
- ILS/precision approach availability
- Communication frequencies
- Navigation aids
- Aircraft suitability assessment (if aircraft_type provided)`,
    
    parameters: {
      type: Type.OBJECT,
      properties: {
        icao: {
          type: Type.STRING,
          description: 'Airport ICAO code (4-letter, uppercase). Required.'
        },
        aircraft_type: {
          type: Type.STRING,
          description: 'Aircraft type for suitability analysis (e.g., "Gulfstream G650", "Global 7500", "Citation X"). Optional. If provided, will assess if this aircraft can safely operate at the airport.'
        },
        check_type: {
          type: Type.STRING,
          description: 'Type of check: "runway_analysis", "ils_availability", "aircraft_suitability", "all". Default: "all"'
        }
      },
      required: ['icao']
    }
  }
];
