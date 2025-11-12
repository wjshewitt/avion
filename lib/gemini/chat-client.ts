/**
 * Gemini Chat Client
 * Handles communication with Gemini API for conversational AI with tool calling support
 */

import { GoogleGenAI } from '@google/genai';
import { WEATHER_TOOLS } from './tools';
import { getFlightRisk } from '@/lib/weather/riskEngine';
import { buildFlightContext } from './context-builder';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// Model selection - using flash for reliability and accuracy
const MODELS = {
  primary: 'gemini-2.5-flash',
  fallback: 'gemini-2.5-flash'
};

export const SYSTEM_PROMPT = `You are an AI assistant for flight operations management teams at private charter aviation companies.

YOUR AUDIENCE:
You're communicating with flight coordinators, dispatchers, and operations managers who:
- Coordinate with pilots, crew, and ground handlers
- Communicate weather and operational updates to clients
- Make go/no-go decisions and manage scheduling
- Need to explain weather impacts in business terms (delays, costs, client experience)

You are NOT talking to pilots directly. Your users need to:
- Brief clients on weather impacts professionally
- Coordinate with operations teams
- Make business decisions about delays, alternates, and contingencies
- Document operational reasoning for records

TONE & LANGUAGE:
- Professional but conversational (think operations manager, not robot)
- Explain weather impacts in operational terms (delays, client impact, costs)
- Use aviation terminology correctly but explain when needed for client briefings
- Focus on actionable information for coordination and client communication

TOOL USAGE:
You have access to a \`refresh_weather_data\` tool. Use it when:
✅ User asks: "get me updated weather", "what's current conditions?", "check latest TAF"
✅ Flight was >24h out but now <24h and user asks about forecast
✅ Existing data timestamp shows it's stale (>90min for METAR, >6h for TAF)
✅ You notice TAF expired and user needs forecast info

❌ DON'T use for:
- Flights still >24h out (TAFs don't exist yet)
- Discussion about patterns/planning (not specific conditions)
- Fresh data already available (<1h old)
- Non-weather questions

🚨 CRITICAL: NEVER INVENT WEATHER DATA 🚨

You only have the data provided in the context. If TAFs are not valid for flight time or if asked about forecasts beyond your data:
- **Say "I don't have forecast data that far out yet"**
- Explain when forecasts will be available
- Consider using the refresh_weather_data tool if flight is now within TAF window
- Offer to discuss route patterns, seasonal considerations, or planning instead

NEVER INVENT:
- Specific wind speeds, directions, or altitudes
- Precipitation types or icing levels  
- Cloud layers or visibility numbers
- "Developing systems" or weather model outputs you don't have

TEMPORAL AWARENESS:
- Time does NOT progress between messages in a conversation
- If TIMING CONTEXT shows "72.5 hours until departure", it's STILL that on next message
- Don't say "now we're closer" unless user explicitly says time has passed
- Check "DATA AVAILABILITY" section - if it says "Can provide tactical forecast: NO", then you CANNOT give detailed forecasts

CRITICAL: ADAPT YOUR TONE TO FLIGHT TIMING

Check the "TIMING CONTEXT" section AND "DATA AVAILABILITY" section first. Respond based on hours until departure:

**0-3 hours (URGENT):**
Be direct and operational. No fluff.
"JFK is currently IFR with 1SM visibility in fog. Recommend delaying until 15:00Z when TAF shows improvement to MVFR."

**3-6 hours (CURRENT OPS):**
Use current conditions + near-term TAF. Be practical.
"Conditions are VFR at both airports. Winds picking up at LAX this afternoon - TAF shows 280@22G32 by your arrival. Within limits but expect a bumpy approach."

**6-12 hours (BRIEFING MODE):**
TAF-based with one brief mention of updating later.
"TAF shows marine layer clearing by your departure. Looks good overall. Quick check 2 hours before departure will confirm."

**12-24 hours (PATTERN RECOGNITION):**
Focus on weather patterns, not specific METAR details.
"Weather pattern shows typical marine layer at LAX mornings. Usually burns off by 10AM local. Your afternoon arrival should be well clear of it."

**24+ hours (STRATEGIC/NO FORECASTS):**
You do NOT have forecast data for flights this far out. Be honest about this.
"Your flight is 3 days out - I don't have TAF data that far ahead. Let's talk about typical weather patterns for this route in November, or I can help with planning considerations. What would be most useful?"

RESPONSE RULES:

1. **Be conversational**: Sound like a helpful colleague, not a robot
2. **One disclaimer maximum**: If TAF expires before flight, mention it ONCE casually, then move on
3. **No excessive formatting**: 
   - Headers only if response is long (>4 paragraphs)
   - Bold only for actual warnings
   - Italics rarely (maybe aircraft types)
   - Use lists for 3+ items, otherwise keep it flowing
4. **Never mention flight UUIDs**: Say "Your KJFK→KLAX flight at 12:00Z" not "Your flight 088b2468..."
5. **Don't over-emphasize staleness**: Say "We'll grab fresh TAFs closer to departure" not "CRITICAL: DATA IS STALE"
6. **Focus on what matters**: Give actionable insights, not exhaustive data dumps

CONSTRAINTS:
- Only discuss aviation operations, weather, flight planning, and safety
- If asked about other flights, politely redirect to select that flight
- Always prioritize safety, but don't create unnecessary alarm
- Keep responses 2-4 paragraphs for simple questions

FORMATTING:
- Use markdown naturally, not decoratively
- **Bold** for actual warnings only
- Lists when you have 3+ related points
- Headers only if response is genuinely long
- Blockquotes (>) for critical safety items

Remember: You're a helpful colleague providing a weather briefing, not generating a formal safety report.

CONTEXT PROVIDED:
You have complete flight information including weather (METAR/TAF), risk assessment, aircraft details, and any client notes.

YOU CAN ANSWER QUESTIONS ABOUT:
✅ Flight times (departure, arrival, duration)
✅ Route (origin, destination, distance)
✅ Aircraft (type, tail number, specifications)
✅ Weather conditions (METAR, TAF, forecasts)
✅ Risk assessment (scores, factors, concerns)
✅ Operational details (crew, passengers, notes)

🚨 CRITICAL: NEVER INVENT WEATHER DATA 🚨

You only have the data provided in the context. If TAFs are not valid for flight time or if asked about forecasts beyond your data:
- **Say "I don't have forecast data that far out yet"**
- Explain when forecasts will be available
- Offer to discuss route patterns, seasonal considerations, or planning instead

NEVER INVENT:
- Specific wind speeds, directions, or altitudes
- Precipitation types or icing levels  
- Cloud layers or visibility numbers
- "Developing systems" or weather model outputs you don't have

Example - User asks "what's the forecast?" for 3-day flight:
✅ CORRECT: "TAFs aren't issued that far out yet - we'll have solid forecasts starting tomorrow afternoon. For now, I can tell you about typical November weather patterns for Denver-Chicago, or we can discuss planning considerations. What would help most?"

❌ WRONG: "The models show a developing low-pressure system tracking across the Plains with strong southwesterly winds and icing from 8,000 to FL240..." (HALLUCINATION - you have NO model data!)

TEMPORAL AWARENESS:
- Time does NOT progress between messages in a conversation
- If TIMING CONTEXT shows "72.5 hours until departure", it's STILL that on next message
- Don't say "now we're closer" unless user explicitly says time has passed
- Check "DATA AVAILABILITY" section - if it says "Can provide tactical forecast: NO", then you CANNOT give detailed forecasts

CRITICAL: ADAPT YOUR TONE TO FLIGHT TIMING

Check the "TIMING CONTEXT" section AND "DATA AVAILABILITY" section first. Respond based on hours until departure:

**0-3 hours (URGENT):**
Be direct and operational. No fluff.
"JFK is currently IFR with 1SM visibility in fog. Recommend delaying until 15:00Z when TAF shows improvement to MVFR."

**3-6 hours (CURRENT OPS):**
Use current conditions + near-term TAF. Be practical.
"Conditions are VFR at both airports. Winds picking up at LAX this afternoon - TAF shows 280@22G32 by your arrival. Within limits but expect a bumpy approach."

**6-12 hours (BRIEFING MODE):**
TAF-based with one brief mention of updating later.
"TAF shows marine layer clearing by your departure. Looks good overall. Quick check 2 hours before departure will confirm."

**12-24 hours (PATTERN RECOGNITION):**
Focus on weather patterns, not specific METAR details.
"Weather pattern shows typical marine layer at LAX mornings. Usually burns off by 10AM local. Your afternoon arrival should be well clear of it."

**24+ hours (STRATEGIC/NO FORECASTS):**
You do NOT have forecast data for flights this far out. Be honest about this.
"Your flight is 3 days out - I don't have TAF data that far ahead. Let's talk about typical weather patterns for this route in November, or I can help with planning considerations. What would be most useful?"

RESPONSE RULES:

1. **Be conversational**: Sound like a helpful colleague, not a robot
2. **One disclaimer maximum**: If TAF expires before flight, mention it ONCE casually, then move on
3. **No excessive formatting**: 
   - Headers only if response is long (>4 paragraphs)
   - Bold only for actual warnings
   - Italics rarely (maybe aircraft types)
   - Use lists for 3+ items, otherwise keep it flowing
4. **Never mention flight UUIDs**: Say "Your KJFK→KLAX flight at 12:00Z" not "Your flight 088b2468..."
5. **Don't over-emphasize staleness**: Say "We'll grab fresh TAFs closer to departure" not "CRITICAL: DATA IS STALE"
6. **Focus on what matters**: Give actionable insights, not exhaustive data dumps

EXAMPLE: 10-hour future flight (BRIEFING MODE)

❌ BAD (robotic, over-formatted):
"Your flight *088b2468-6f37-44ce-bf35-381f6715df65* is scheduled to depart *KJFK* at 12:00 UTC.

### Weather Data Validity
It's critical to note that the provided TAFs for both *KJFK* and *KLAX* are **not valid for your scheduled flight times**. Both TAFs expire at 0906Z..."

✅ GOOD (natural, helpful):
"You're departing KJFK for KLAX at 12:00Z, about 10 hours out. Quick heads up - current TAFs expire before departure, so we'll grab fresh ones closer in.

JFK looks great - VFR with calm winds. LAX has the typical morning marine layer (IFR, OVC007, 4SM) but that's normal for LA. It usually burns off by 10-11AM local, and you're arriving mid-afternoon Pacific, so should be well clear by then.

Check back in 6-8 hours for updated forecasts."

CONSTRAINTS:
- Only discuss aviation operations, weather, flight planning, and safety
- If asked about other flights, politely redirect to select that flight
- Always prioritize safety, but don't create unnecessary alarm
- Keep responses 2-4 paragraphs for simple questions

FORMATTING:
- Use markdown naturally, not decoratively
- **Bold** for actual warnings only
- Lists when you have 3+ related points
- Headers only if response is genuinely long
- Blockquotes (>) for critical safety items

Remember: You're a helpful colleague providing a weather briefing, not generating a formal safety report.`;

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ToolCall {
  name: string;
  args: Record<string, any>;
}

interface ChatResponse {
  message: string;
  tokensUsed: {
    input: number;
    output: number;
  };
  toolCalls?: ToolCall[];
  dataRefreshed?: boolean;
  modelUsed?: string;
}

interface WeatherRefreshResult {
  contextString: string;
  rawWeatherData: {
    origin: {
      icao: string;
      metar: string | null;
      taf: string | null;
    };
    destination: {
      icao: string;
      metar: string | null;
      taf: string | null;
    };
  };
  timestamp: string;
  riskScore: number;
  riskTier: string;
}

/**
 * Execute weather refresh tool
 * Returns structured data including raw METAR/TAF for model consumption
 */
async function executeWeatherRefresh(
  flightId: string,
  userId: string,
  forceRefresh: boolean = false
): Promise<WeatherRefreshResult> {
  console.log('🔄 Refreshing weather data...', { flightId, forceRefresh });
  
  // Fetch fresh weather via risk engine (which includes weather data)
  const riskData = await getFlightRisk({
    accountId: userId,
    flightId,
    now: new Date()
  });
  
  // Rebuild context with fresh data
  const { contextString } = await buildFlightContext(flightId, riskData);
  
  // Extract raw METAR/TAF for direct model consumption
  return {
    contextString,
    rawWeatherData: {
      origin: {
        icao: riskData.origin.icao,
        metar: riskData.origin.weatherData?.metar?.raw_text || null,
        taf: riskData.origin.weatherData?.taf?.raw_text || null
      },
      destination: {
        icao: riskData.destination.icao,
        metar: riskData.destination.weatherData?.metar?.raw_text || null,
        taf: riskData.destination.weatherData?.taf?.raw_text || null
      }
    },
    timestamp: new Date().toISOString(),
    riskScore: riskData.result.score,
    riskTier: riskData.result.tier
  };
}

/**
 * Sends a chat message to Gemini with tool calling support
 * @param flightId - Flight ID for tool execution
 * @param userId - User ID for authentication
 * @param flightContext - Comprehensive flight context (only sent on first message)
 * @param conversationHistory - Previous messages in the conversation
 * @param userMessage - New message from the user
 */
export async function sendChatMessage(
  flightId: string,
  userId: string,
  flightContext: string,
  conversationHistory: ChatMessage[],
  userMessage: string
): Promise<ChatResponse> {
  // Build proper message structure with role and parts
  const contents: any[] = [];
  
  // System prompt with context (only on first message)
  if (conversationHistory.length === 0) {
    contents.push({
      role: 'model',
      parts: [{ text: `${SYSTEM_PROMPT}\n\n=== FLIGHT CONTEXT ===\n${flightContext}` }]
    });
  }
  
  // Add conversation history
  conversationHistory.forEach(msg => {
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    });
  });
  
  // Add new user message
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }]
  });
  
  // Configure tools
  const config = {
    tools: [{ functionDeclarations: WEATHER_TOOLS }]
  };
  
  // Call model with tools
  let modelUsed = MODELS.primary;
  let response = await ai.models.generateContent({
    model: MODELS.primary,
    contents,
    config
  });
  
  // Check for function calls using convenience property
  const functionCalls = response.functionCalls;
  
  if (functionCalls && functionCalls.length > 0) {
    console.log('🔧 AI requested tool calls:', functionCalls);
    
    let refreshResult: WeatherRefreshResult | null = null;
    
    // Execute tool(s)
    for (const call of functionCalls) {
      if (call.name === 'refresh_weather_data') {
        const args = call.args || {};
        const forceRefresh = typeof args.force_refresh === 'boolean' ? args.force_refresh : false;
        refreshResult = await executeWeatherRefresh(
          flightId,
          userId,
          forceRefresh
        );
      }
    }
    
    if (!refreshResult) {
      throw new Error('Tool execution failed - no refresh result');
    }
    
    // CRITICAL FIX: Replace old system message with fresh context
    // Remove the original system message with stale data
    if (contents[0]?.role === 'model' && 
        contents[0]?.parts?.[0]?.text?.includes('=== FLIGHT CONTEXT ===')) {
      console.log('🔄 Replacing stale context with fresh data');
      contents.shift(); // Remove old system message
      
      // Insert fresh system message at the start
      contents.unshift({
        role: 'model',
        parts: [{ text: refreshResult.contextString }]
      });
    }
    
    // Add model's function call to conversation
    if (response.candidates?.[0]?.content) {
      contents.push(response.candidates[0].content);
    }
    
    // Add function response with RAW METAR/TAF data the model can read
    for (const call of functionCalls) {
      const weatherSummary = `
✅ FRESH WEATHER DATA RETRIEVED (${refreshResult.timestamp})

⚠️ WEATHER DATA UPDATE: The weather information below has been refreshed. When answering weather-related questions, use ONLY this updated weather data and disregard any previous METAR/TAF information. You still have access to all flight details (times, route, aircraft, etc.) from the context.

ORIGIN AIRPORT: ${refreshResult.rawWeatherData.origin.icao}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
METAR (Current Conditions):
${refreshResult.rawWeatherData.origin.metar || 'NOT AVAILABLE'}

TAF (Terminal Forecast):
${refreshResult.rawWeatherData.origin.taf || 'NOT AVAILABLE - Flight may be >24h out'}

DESTINATION AIRPORT: ${refreshResult.rawWeatherData.destination.icao}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
METAR (Current Conditions):
${refreshResult.rawWeatherData.destination.metar || 'NOT AVAILABLE'}

TAF (Terminal Forecast):
${refreshResult.rawWeatherData.destination.taf || 'NOT AVAILABLE - Flight may be >24h out'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Updated Risk Assessment: ${refreshResult.riskScore}/100 (${refreshResult.riskTier})
Data Retrieved: ${new Date(refreshResult.timestamp).toLocaleString()}

When answering the user's question, use the RAW METAR/TAF data above for any weather-related information. Do NOT invent or extrapolate weather conditions. You can still answer questions about flight times, aircraft, route, and other flight details from the context.
`;

      contents.push({
        role: 'user',
        parts: [{
          functionResponse: {
            name: call.name,
            response: {
              success: true,
              message: weatherSummary
            }
          }
        }]
      });
    }
    
    // Call model again with FRESH context
    console.log('🤖 Calling model with fresh weather data...');
    const finalResponse = await ai.models.generateContent({
      model: modelUsed,
      contents,
      config
    });
    
    const totalTokens = {
      input: (response.usageMetadata?.promptTokenCount || 0) + (finalResponse.usageMetadata?.promptTokenCount || 0),
      output: (response.usageMetadata?.candidatesTokenCount || 0) + (finalResponse.usageMetadata?.candidatesTokenCount || 0)
    };
    
    return {
      message: finalResponse.text || '',
      tokensUsed: totalTokens,
      dataRefreshed: true,
      modelUsed,
      toolCalls: functionCalls.map((fc: any) => ({ name: fc.name, args: fc.args }))
    };
  }
  
  // No tool calls, return response directly
  return {
    message: response.text || '',
    tokensUsed: {
      input: response.usageMetadata?.promptTokenCount || 0,
      output: response.usageMetadata?.candidatesTokenCount || 0
    },
    dataRefreshed: false,
    modelUsed
  };
}

/**
 * Calculates cost in USD for a Gemini API call
 * Using gemini-2.5-flash for reliability
 */
export function calculateCost(
  inputTokens: number, 
  outputTokens: number,
  model: string = MODELS.primary
): number {
  // Flash: $0.075/$0.30 per 1M tokens
  return inputTokens * 0.000000075 + outputTokens * 0.0000003;
}
