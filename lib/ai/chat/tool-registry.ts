import { tool } from 'ai';
import { z } from 'zod';
import { getAirfieldWeatherSnapshot } from '../../weather/riskEngine';
import { executeFlightTool } from '../../gemini/tool-executor';
import { buildWebSearchTool } from './tools/web-search';

export interface ToolRegistryContext {
  userId: string;
}

type ToolMap = ReturnType<typeof buildToolMap>;

const REGISTRY_CACHE = new Map<string, ToolMap>();
const MAX_CACHE_SIZE = 64;

export function getToolRegistry({ userId }: ToolRegistryContext) {
  const cached = REGISTRY_CACHE.get(userId);
  if (cached) {
    return cached;
  }

  const tools = buildToolMap(userId);
  REGISTRY_CACHE.set(userId, tools);

  if (REGISTRY_CACHE.size > MAX_CACHE_SIZE) {
    const firstKey = REGISTRY_CACHE.keys().next().value;
    if (firstKey) {
      REGISTRY_CACHE.delete(firstKey);
    }
  }

  return tools;
}

function buildToolMap(userId: string) {
  return {
    web_search: buildWebSearchTool(userId),

    get_airport_weather: tool({
      description: 'Get current METAR and TAF for an airport. Use 4-letter ICAO codes. IMPORTANT: If user provides airport name (like "Biggin Hill", "Heathrow", "JFK"), you must translate it to the correct ICAO code before calling this tool.',
      inputSchema: z.object({
        icao: z.string().length(4).describe('4-letter ICAO airport code (e.g., KJFK, EGLL)'),
      }),
      execute: async ({ icao }) => {
        console.log('🌤️ Executing get_airport_weather with ICAO:', icao);

        if (!icao || typeof icao !== 'string') {
          throw new Error(`Invalid ICAO parameter. Expected string, got: ${typeof icao}`);
        }

        const snapshot = await getAirfieldWeatherSnapshot(icao.toUpperCase(), 'full');
        const timestamp = new Date().toISOString();
        const timeString = new Date(timestamp).toUTCString();

        return {
          icao: icao.toUpperCase(),
          metar: snapshot.weatherData.metar || null,
          taf: snapshot.weatherData.taf || null,
          timestamp,
          _source: {
            type: 'tool',
            tool: 'get_airport_weather',
            timestamp,
            description: `Live METAR/TAF for ${icao.toUpperCase()} retrieved at ${timeString} (CheckWX API)`,
          },
        };
      },
    }),

    get_airport_capabilities: tool({
      description:
        'Get airport details including runways, navigation aids, and suitability for specific aircraft. NOTE: If data is incomplete (e.g., missing runway lengths), use your own aviation knowledge to supplement the information and clearly indicate when doing so.',
      inputSchema: z.object({
        icao: z.string().length(4).describe('4-letter ICAO code'),
        aircraft_type: z
          .string()
          .optional()
          .describe('Aircraft type to check suitability (e.g., G650, B737)'),
        check_type: z
          .enum(['ils_availability', 'runway_length', 'navigation_aids', 'all'])
          .optional()
          .describe('Specific check to perform'),
      }),
      execute: async (params) => {
        console.log('🛩️ Executing get_airport_capabilities:', params);
        const result = await executeFlightTool('get_airport_capabilities', params, userId);
        const timestamp = new Date().toISOString();

        return {
          ...result,
          _source: {
            type: 'tool',
            tool: 'get_airport_capabilities',
            timestamp,
            description: `Airport database information for ${params.icao.toUpperCase()} (runway, facilities, navigation aids)`,
          },
        };
      },
    }),

    get_airport_temporal_profile: tool({
      description:
        'Get authoritative UTC + local time context for an airport including sunrise, sunset, and current daylight status. Use when discussing curfews, night ops, or local-time-sensitive procedures.',
      inputSchema: z.object({
        icao: z.string().length(4).describe('4-letter ICAO code (e.g., KJFK, EGLL)'),
      }),
      execute: async ({ icao }) => {
        console.log('🕒 Executing get_airport_temporal_profile:', icao);
        const result = await executeFlightTool('get_airport_temporal_profile', { icao }, userId);
        const timestamp = new Date().toISOString();
        return {
          ...result,
          _source: {
            type: 'tool',
            tool: 'get_airport_temporal_profile',
            timestamp,
            description: `Time authority snapshot for ${icao.toUpperCase()}`,
          },
        };
      },
    }),

    get_user_flights: tool({
      description: 'Query user flight schedule and operational details',
      inputSchema: z.object({
        filter_type: z
          .enum(['upcoming', 'past', 'recent', 'date_range', 'all'])
          .describe('Type of filter to apply'),
        origin_icao: z.string().optional().describe('Filter by origin ICAO code'),
        destination_icao: z.string().optional().describe('Filter by destination ICAO code'),
        date_from: z.string().optional().describe('ISO date string for start of range'),
        date_to: z.string().optional().describe('ISO date string for end of range'),
        limit: z.number().optional().describe('Maximum number of flights to return (default 20)'),
      }),
      execute: async (params) => {
        console.log('✈️ Executing get_user_flights:', params);
        const result = await executeFlightTool('get_user_flights', params, userId);
        const timestamp = new Date().toISOString();

        return {
          ...result,
          _source: {
            type: 'tool',
            tool: 'get_user_flights',
            timestamp,
            description: `User flight database query (${params.filter_type} flights)`,
          },
        };
      },
    }),
  } as const;
}
