/**
 * Gemini Tool Definitions for Flight Operations
 * 
 * Defines available function calls (tools) that Gemini AI can invoke
 * to fetch fresh data or perform actions during conversation.
 */

import { Type } from '@google/genai';
import { FLIGHT_DATA_TOOLS } from './flight-tools';

// Tools for flight-specific chats
export const WEATHER_TOOLS = [
  {
    name: 'refresh_weather_data',
    description: `Fetch fresh weather data from CheckWX API when:
- User explicitly asks for "updated", "current", "fresh", or "latest" weather
- User asks "what's the forecast now?" for a flight that's entered TAF window (was >24h, now <24h)
- Existing weather data is stale (METAR >90min old, TAF >6h old)
- User asks for conditions and you notice TAFs have expired

DO NOT call for:
- Flights still >24 hours out (TAFs don't exist yet)
- When discussing seasonal patterns or planning
- When existing data is fresh (<1 hour old)
- When user is asking about flight details, not weather`,
    
    parameters: {
      type: Type.OBJECT,
      properties: {
        reason: {
          type: Type.STRING,
          description: 'Brief explanation of why fresh data is needed (for logging)'
        },
        force_refresh: {
          type: Type.BOOLEAN,
          description: 'Whether to bypass cache and fetch from API directly'
        }
      },
      required: ['reason']
    }
  }
];

// Tools for general weather chat (no specific flight)
export const GENERAL_WEATHER_TOOLS = [
  {
    name: 'get_airport_weather',
    description: `Fetch current weather (METAR) and forecast (TAF) for any airport worldwide.

Use this tool when:
- User asks for weather at a specific airport (e.g., "weather at EGKK", "What's KJFK conditions?")
- User provides an ICAO code and wants current data
- User asks about specific conditions (temperature, wind, visibility, ceiling) at an airport
- User wants to compare weather at multiple airports

The tool accepts 4-letter ICAO airport codes (e.g., EGKK, KJFK, LFPG, YSSY).

DO NOT call for:
- When user just wants to chat about general aviation weather concepts
- When discussing historical weather patterns without needing current data`,
    
    parameters: {
      type: Type.OBJECT,
      properties: {
        icao: {
          type: Type.STRING,
          description: 'Four-letter ICAO airport code (e.g., EGKK, KJFK, LFPG). Must be uppercase. Required.'
        },
        reason: {
          type: Type.STRING,
          description: 'Brief explanation of why weather is needed (for logging)'
        }
      },
      required: ['icao']
    }
  }
];

// Combined tools for general chat with flight data access
export const GENERAL_CHAT_TOOLS = [
  ...GENERAL_WEATHER_TOOLS,
  ...FLIGHT_DATA_TOOLS
];

// Export all tool sets
export { FLIGHT_DATA_TOOLS };
