/**
 * General Weather Chat Client
 * Handles AI conversations for airport weather queries (no specific flight required)
 */

import { GoogleGenAI } from '@google/genai';
import { GENERAL_CHAT_TOOLS } from './tools';
import { getAirfieldWeatherSnapshot } from '@/lib/weather/riskEngine';
import { executeFlightTool } from './tool-executor';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const MODEL = 'gemini-2.5-flash';

/**
 * Determine thinking budget based on query complexity
 */
function getThinkingBudget(query: string): number {
  const lowerQuery = query.toLowerCase();
  
  // Complex analysis requiring reasoning (high budget)
  if (
    lowerQuery.includes('should i') ||
    lowerQuery.includes('analyze') ||
    lowerQuery.includes('compare') ||
    lowerQuery.includes('recommend') ||
    lowerQuery.includes('risk') ||
    lowerQuery.includes('assess') ||
    lowerQuery.includes('evaluate')
  ) {
    return 8192; // High budget for complex reasoning
  }
  
  // Simple fact retrieval (no thinking needed)
  if (
    lowerQuery.startsWith('what is') ||
    lowerQuery.startsWith('show me') ||
    lowerQuery.startsWith('list') ||
    lowerQuery.startsWith('get')
  ) {
    return 0; // No thinking for simple queries
  }
  
  // Default: dynamic thinking (model decides)
  return -1;
}

export const GENERAL_WEATHER_SYSTEM_PROMPT = `You are an aviation operations assistant with access to real-time weather data, airport information, and flight operations data.

YOUR ROLE:
Provide accurate, actionable information for pilots, dispatchers, and aviation professionals. You can query weather, analyze airport capabilities, access flight schedules, and assess operational suitability.

ENHANCED CAPABILITIES:
✅ Fetch current METAR (observations) and TAF (forecasts) for any airport
✅ Query user's flight operations (upcoming flights, schedules, routes)
✅ Analyze airport capabilities (runways, ILS, suitability for specific aircraft)
✅ Access flight details (aircraft, passengers, crew, notes, weather risk)
✅ Explain weather conditions and decode aviation abbreviations
✅ Provide flight category assessments (VFR/MVFR/IFR/LIFR)
✅ Compare weather and capabilities across multiple airports

TOOL USAGE:
You have access to multiple tools. Use them intelligently based on user queries:

**Weather Tool Examples:**
✅ "What's the weather at EGKK?" → get_airport_weather(icao="EGKK")
✅ "Show me KJFK conditions" → get_airport_weather(icao="KJFK")
✅ "Temperature at London Heathrow?" → get_airport_weather(icao="EGLL")
✅ "Compare EGKK and LFPG" → Call both in parallel

**Flight Data Tool Examples:**
✅ "Show me my upcoming flights" → get_user_flights(filter_type="upcoming")
✅ "Flights to Miami this week" → get_user_flights(destination_icao="KMIA", filter_type="date_range")
✅ "Tell me about my flights" → get_user_flights(filter_type="upcoming")
✅ "How many passengers on flight XYZ?" → get_flight_details(flight_id="xyz")

**Airport Capabilities Tool Examples:**
✅ "Can a G650 land at TNCM?" → get_airport_capabilities(icao="TNCM", aircraft_type="G650")
✅ "How long is the runway at EGKK?" → get_airport_capabilities(icao="EGKK")
✅ "Does KJFK have ILS?" → get_airport_capabilities(icao="KJFK", check_type="ils_availability")

**Parallel Tool Calls (Use When Beneficial):**
✅ "Weather and runway info for KASE" → Call get_airport_weather AND get_airport_capabilities
✅ "Compare weather at EGKK and LFPG" → Call get_airport_weather twice in parallel

AIRPORT NAME NORMALIZATION:

Users often don't know ICAO codes. If a user provides an airport name, city, or IATA code instead of an ICAO code, use your knowledge to normalize it to the proper 4-letter ICAO code BEFORE calling the get_airport_weather tool.

**Your Knowledge Includes:**
- Airport names: Gatwick, Heathrow, JFK, LAX, O'Hare, Charles de Gaulle, etc.
- IATA codes: LHR, LGW, JFK, LAX, ORD, ATL, DFW, CDG, etc.
- Cities: London, New York, Los Angeles, Chicago, Paris, etc.
- Alternative names: Kennedy (JFK), Reagan (DCA), Dulles (IAD)

**Common Conversion Examples:**
- "Gatwick" → EGKK
- "JFK" or "Kennedy" → KJFK
- "Heathrow" or "LHR" → EGLL
- "LAX" or "Los Angeles" → KLAX
- "O'Hare" or "ORD" → KORD
- "Charles de Gaulle" or "CDG" → LFPG
- "Stansted" → EGSS
- "Newark" or "EWR" → KEWR
- "Atlanta" or "ATL" → KATL
- "Dubai" → OMDB
- "Singapore" or "Changi" → WSSS
- "Hong Kong" → VHHH
- "Sydney" → YSSY

**When User Says City Name:**
For cities with multiple airports, use the primary/largest airport or ask:
- "London" → Ask which airport (Heathrow-EGLL, Gatwick-EGKK, Stansted-EGSS, Luton-EGGW, City-EGLC)
- "New York" → Default to KJFK (JFK), but mention KLGA (LaGuardia) and KEWR (Newark) exist
- "Chicago" → Default to KORD (O'Hare), mention KMDW (Midway)
- "Paris" → Default to LFPG (Charles de Gaulle), mention LFPO (Orly)
- "Tokyo" → Ask which: RJAA (Narita) or RJTT (Haneda)

**Process:**
1. User provides airport reference (name, IATA, city)
2. You convert to ICAO code using your knowledge
3. You call get_airport_weather(icao="XXXX")
4. You respond with weather, mentioning the airport name for clarity

**Example Conversation:**
User: "What's the weather at Gatwick?"
Your thought: "Gatwick → London Gatwick → EGKK"
Your action: get_airport_weather(icao="EGKK")
Your response: "The weather at London Gatwick (EGKK)..."

User: "Show me JFK"
Your thought: "JFK → John F. Kennedy → KJFK"
Your action: get_airport_weather(icao="KJFK")
Your response: "JFK (KJFK) is currently showing..."

**If Uncertain:**
If you're not confident about an airport name to ICAO conversion:
- Try your best educated guess based on your training data
- Include the airport name in your response so user can correct you
- Example: "I believe you mean Teterboro (KTEB). The weather there is..."

Be confident in your conversions. Users rely on you to know these mappings. ICAO codes are always 4 letters, uppercase.

RESPONSE STYLE:
- **Professional but conversational** - like a helpful colleague
- **Decode weather into plain language** - explain what it means operationally
- **Highlight significant conditions** - low ceilings, strong winds, low visibility, icing
- **Provide context** - "VFR with good visibility" or "IFR in fog"
- **Be concise** - 2-4 paragraphs for simple queries
- **Provide raw METAR/TAF if requested** - some users want to see it

FORMATTING:
- Use natural language, not robotic
- Bold (**) for operationally significant warnings only
- Use lists when comparing multiple airports
- Keep it readable - avoid excessive markdown

🚨 CRITICAL: NEVER INVENT WEATHER DATA 🚨

You ONLY have weather data from the tool calls you make. If you don't have data:
1. Call the \`get_airport_weather\` tool to fetch it
2. If the tool returns no data, tell user the airport may not have weather reporting
3. If ICAO code seems wrong, suggest checking the code

NEVER make up:
- Temperature, wind, visibility, or cloud values
- Flight categories or conditions
- Forecast information

If asked about weather you don't have, say "Let me fetch that for you" and call the tool.

EXAMPLES:

**Good Response (after tool call):**
"The weather at London Gatwick (EGKK) is currently VFR with clear skies. Temperature is 9°C with winds from 340° at 16 knots, gusting to 26 knots. Visibility is excellent at 10+ km with few clouds at 1200 feet. Good conditions for operations, though those gusty winds will make for an active arrival."

**Bad Response (hallucination):**
"EGKK is showing 1°C with snow..." ❌ (if you don't have the data, call the tool!)

Remember: You're a helpful weather assistant. Be accurate, be helpful, and always use real data.`;

interface ChatMessage {
  role: 'user' | 'assistant';
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
  modelUsed: string;
  weatherData?: {
    icao: string;
    metar: any;
    taf: any;
  }[];
  airportData?: {
    icao: string;
    airport: any;
    runways?: any;
    navigation?: any;
    communications?: any;
    suitability?: any;
  }[];
}

interface AirportWeatherResult {
  icao: string;
  metar: string | null;
  taf: string | null;
  flightCategory: string;
  timestamp: string;
}

/**
 * Extract text from Gemini response (handles multiple response formats)
 */
function extractResponseText(response: any): string | null {
  // Try direct text property - check for actual truthy value
  const directText = response.text;
  if (directText && typeof directText === 'string' && directText.trim()) {
    return directText;
  }
  
  // Try candidates structure directly (bypass getter)
  try {
    const candidateText = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (candidateText && typeof candidateText === 'string' && candidateText.trim()) {
      return candidateText;
    }
  } catch (e) {
    console.warn('⚠️ Failed to extract from candidates:', e);
  }
  
  // Try content.parts structure
  try {
    const contentText = response.content?.parts?.[0]?.text;
    if (contentText && typeof contentText === 'string' && contentText.trim()) {
      return contentText;
    }
  } catch (e) {
    console.warn('⚠️ Failed to extract from content:', e);
  }
  
  // Try alternative structures - maybe content.text directly
  try {
    const contentDirectText = response.candidates?.[0]?.content?.text;
    if (contentDirectText && typeof contentDirectText === 'string' && contentDirectText.trim()) {
      console.log('✅ Found text in candidates[0].content.text');
      return contentDirectText;
    }
  } catch (e) {
    console.warn('⚠️ Failed to extract from content.text:', e);
  }
  
  // Try candidate.text directly
  try {
    const candidateDirectText = response.candidates?.[0]?.text;
    if (candidateDirectText && typeof candidateDirectText === 'string' && candidateDirectText.trim()) {
      console.log('✅ Found text in candidates[0].text');
      return candidateDirectText;
    }
  } catch (e) {
    console.warn('⚠️ Failed to extract from candidate.text:', e);
  }
  
  // Try content as string directly
  try {
    const content = response.candidates?.[0]?.content;
    if (content && typeof content === 'string' && content.trim()) {
      console.log('✅ Found text - content IS a string');
      return content;
    }
    // Try toString() on content
    if (content && content.toString && typeof content.toString === 'function') {
      const contentStr = content.toString();
      if (contentStr && contentStr !== '[object Object]' && contentStr.trim()) {
        console.log('✅ Found text via content.toString()');
        return contentStr;
      }
    }
  } catch (e) {
    console.warn('⚠️ Failed to extract content as string:', e);
  }
  
  // Enhanced debugging - show actual structure
  console.error('❌ Could not extract text from response. Full structure:', {
    textValue: response.text,
    textType: typeof response.text,
    hasText: 'text' in response,
    hasCandidates: 'candidates' in response,
    candidatesLength: response.candidates?.length,
    firstCandidate: response.candidates?.[0] ? {
      keys: Object.keys(response.candidates[0]),
      hasContent: !!response.candidates[0].content,
      contentKeys: response.candidates[0].content ? Object.keys(response.candidates[0].content) : null,
      contentType: typeof response.candidates[0].content,
      hasParts: !!response.candidates[0].content?.parts,
      partsLength: response.candidates[0].content?.parts?.length,
      hasText: 'text' in (response.candidates[0].content || {}),
      contentText: response.candidates[0].content?.text,
      fullContent: JSON.stringify(response.candidates[0].content, null, 2)
    } : null
  });
  
  return null;
}

/**
 * Fetch weather for a specific airport
 */
async function executeAirportWeatherLookup(
  icao: string
): Promise<AirportWeatherResult> {
  console.log('🌤️ Fetching weather for airport:', icao);
  
  // Use the existing weather snapshot function directly
  const snapshot = await getAirfieldWeatherSnapshot(icao.toUpperCase(), 'full');
  
  return {
    icao: icao.toUpperCase(),
    metar: snapshot.weatherData.metar?.raw_text || null,
    taf: snapshot.weatherData.taf?.raw_text || null,
    flightCategory: snapshot.weatherData.metar?.flight_category || 'UNKNOWN',
    timestamp: new Date().toISOString()
  };
}

/**
 * Send a general weather chat message to Gemini
 * Now supports flight data and airport capability tools
 */
export async function sendGeneralChatMessage(
  conversationHistory: ChatMessage[],
  userMessage: string,
  userId?: string // Required for flight data tools
): Promise<ChatResponse> {
  // Build message structure
  const contents: any[] = [];
  
  // System prompt (only on first message)
  if (conversationHistory.length === 0) {
    contents.push({
      role: 'model',
      parts: [{ text: GENERAL_WEATHER_SYSTEM_PROMPT }]
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
  
  // Configure tools - include all tools (weather + flight data)
  // Configure thinking based on query complexity
  const thinkingBudget = getThinkingBudget(userMessage);
  
  const config = {
    tools: [{ functionDeclarations: GENERAL_CHAT_TOOLS }],
    thinkingConfig: {
      thinkingBudget,
      includeThoughts: true
    }
  } as any;
  
  // Call model
  const response = await ai.models.generateContent({
    model: MODEL,
    contents,
    config
  });
  
  // Check for function calls
  const functionCalls = response.functionCalls;
  
  if (functionCalls && functionCalls.length > 0) {
    console.log('🔧 AI requested tool calls:', functionCalls);
    
    // Track weather data and airport data for UI display
    const weatherDataCollection: any[] = [];
    const airportDataCollection: any[] = [];
    
    // Execute all tool calls in parallel
    const toolResults = await Promise.all(
      functionCalls.map(async (call: any) => {
        try {
          let data;
          
          if (call.name === 'get_airport_weather') {
            const icao = call.args?.icao?.toUpperCase();
            if (!icao) throw new Error('ICAO required');
            
            // Get full weather snapshot with decoded METAR/TAF
            const snapshot = await getAirfieldWeatherSnapshot(icao, 'full');
            
            // Store for UI display
            weatherDataCollection.push({
              icao,
              metar: snapshot.weatherData.metar || null,
              taf: snapshot.weatherData.taf || null
            });
            
            // Return simplified data for AI
            data = {
              icao,
              metar: snapshot.weatherData.metar?.raw_text || null,
              taf: snapshot.weatherData.taf?.raw_text || null,
              flightCategory: snapshot.weatherData.metar?.flight_category || 'UNKNOWN',
              timestamp: new Date().toISOString()
            };
          } else if (call.name === 'get_airport_capabilities') {
            // Airport capabilities don't require userId
            data = await executeFlightTool(call.name, call.args, userId || 'anonymous');
            
            // Store full airport data for UI display
            airportDataCollection.push({
              icao: call.args.icao?.toUpperCase() || 'UNKNOWN',
              airport: data.airport,
              runways: data.runways,
              navigation: data.navigation,
              communications: data.communications,
              suitability: data.aircraft_suitability
            });
          } else if (userId) {
            // Flight data tools require userId
            data = await executeFlightTool(call.name, call.args, userId);
          } else {
            throw new Error('User authentication required for this tool');
          }
          
          return {
            name: call.name,
            success: true,
            data
          };
        } catch (error) {
          console.error(`Failed to execute ${call.name}:`, error);
          return {
            name: call.name,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );
    
    // Add model's function call to conversation
    if (response.candidates?.[0]?.content) {
      contents.push(response.candidates[0].content);
    }
    
    // Format tool results for model
    for (let i = 0; i < functionCalls.length; i++) {
      const call = functionCalls[i];
      const result = toolResults[i];
      
      let formattedData: string;
      
      if (result.success) {
        if (call.name === 'get_airport_weather') {
          const w = result.data as AirportWeatherResult;
          formattedData = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AIRPORT WEATHER: ${w.icao}
Flight Category: ${w.flightCategory}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${w.metar ? `METAR: ${w.metar}` : 'METAR: Not available'}
${w.taf ? `TAF: ${w.taf}` : 'TAF: Not available'}
Data Retrieved: ${new Date(w.timestamp).toLocaleString()}
`;
        } else {
          // Format other tool results as JSON
          formattedData = JSON.stringify(result.data, null, 2);
        }
      } else {
        formattedData = `ERROR: ${result.error}`;
      }
      
      contents.push({
        role: 'user',
        parts: [{
          functionResponse: {
            name: call.name,
            response: {
              success: result.success,
              data: formattedData
            }
          }
        }]
      });
    }
    
    // Call model again with tool results - KEEP TOOLS in config
    // Model will decide whether to call more functions or generate final text response
    // This enables multi-turn function calling and compositional workflows
    console.log('🤖 Calling model with tool results (with tools still available)...', {
      toolCallCount: functionCalls.length,
      toolNames: functionCalls.map((fc: any) => fc.name)
    });
    
    const finalResponse = await ai.models.generateContent({
      model: MODEL,
      contents,
      config  // Keep tools available - model decides when to respond with text vs more function calls
    });
    
    // COMPREHENSIVE LOGGING - Log the ENTIRE response structure
    console.log('🔍 ========== COMPLETE FINAL RESPONSE ==========');
    try {
      console.log('📦 Full response JSON:', JSON.stringify(finalResponse, null, 2));
    } catch (e) {
      console.log('⚠️ Could not stringify response:', e);
      console.log('📦 Full response object:', finalResponse);
    }
    console.log('🔍 Response keys:', Object.keys(finalResponse));
    console.log('🔍 Candidates:', finalResponse.candidates);
    console.log('🔍 First candidate:', finalResponse.candidates?.[0]);
    console.log('🔍 Content object:', finalResponse.candidates?.[0]?.content);
    console.log('🔍 Content type:', typeof finalResponse.candidates?.[0]?.content);
    console.log('🔍 Content keys:', finalResponse.candidates?.[0]?.content ? Object.keys(finalResponse.candidates[0].content) : null);
    console.log('🔍 ===============================================');
    
    // Extract text using helper function
    const messageText = extractResponseText(finalResponse);
    
    console.log('✅ Final response received:', {
      hasText: !!messageText,
      textLength: messageText?.length,
      textPreview: messageText?.substring(0, 100)
    });
    
    const totalTokens = {
      input: (response.usageMetadata?.promptTokenCount || 0) + (finalResponse.usageMetadata?.promptTokenCount || 0),
      output: (response.usageMetadata?.candidatesTokenCount || 0) + (finalResponse.usageMetadata?.candidatesTokenCount || 0),
      thinking: (response.usageMetadata?.thoughtsTokenCount || 0) + (finalResponse.usageMetadata?.thoughtsTokenCount || 0)
    };
    
    if (!messageText) {
      console.error('⚠️ Empty response from model after tool execution');
      
      // If we have weather data, still provide a useful message
      if (weatherDataCollection.length > 0) {
        const airports = weatherDataCollection.map(w => w.icao).join(', ');
        return {
          message: `I fetched the weather data for ${airports}. The conditions are displayed in the weather card${weatherDataCollection.length > 1 ? 's' : ''} above.`,
          tokensUsed: totalTokens,
          toolCalls: functionCalls.map((fc: any) => ({ name: fc.name, args: fc.args })),
          modelUsed: MODEL,
          weatherData: weatherDataCollection
        };
      }
      
      return {
        message: 'I received the data but had trouble formulating a response. Please try asking again.',
        tokensUsed: totalTokens,
        toolCalls: functionCalls.map((fc: any) => ({ name: fc.name, args: fc.args })),
        modelUsed: MODEL
      };
    }
    
    return {
      message: messageText,
      tokensUsed: totalTokens,
      toolCalls: functionCalls.map((fc: any) => ({ name: fc.name, args: fc.args })),
      modelUsed: MODEL,
      weatherData: weatherDataCollection.length > 0 ? weatherDataCollection : undefined,
      airportData: airportDataCollection.length > 0 ? airportDataCollection : undefined
    };
  }
  
  // No tool calls, return response directly
  const messageText = extractResponseText(response);
  
  if (!messageText) {
    console.error('⚠️ Empty response from model (no tool calls)');
    return {
      message: 'I received your message but had trouble formulating a response. Please try asking again.',
      tokensUsed: {
        input: response.usageMetadata?.promptTokenCount || 0,
        output: response.usageMetadata?.candidatesTokenCount || 0
      },
      modelUsed: MODEL
    };
  }
  
  return {
    message: messageText,
    tokensUsed: {
      input: response.usageMetadata?.promptTokenCount || 0,
      output: response.usageMetadata?.candidatesTokenCount || 0
    },
    modelUsed: MODEL
  };
}

/**
 * Stream chat messages with real-time token generation
 * Yields chunks as they arrive for progressive UI updates
 */
export async function* sendGeneralChatMessageStream(
  conversationHistory: ChatMessage[],
  userMessage: string,
  userId?: string
): AsyncGenerator<{
  type: 'content' | 'tool_call' | 'done' | 'thinking';
  content?: string;
  thinking?: string;
  tokens?: number;
  toolCalls?: ToolCall[];
  weatherData?: any[];
  airportData?: any[];
  tokensUsed?: { input: number; output: number; thinking?: number };
  modelUsed?: string;
}> {
  // Build message structure (same as non-streaming)
  const contents: any[] = [];
  
  if (conversationHistory.length === 0) {
    contents.push({
      role: 'model',
      parts: [{ text: GENERAL_WEATHER_SYSTEM_PROMPT }]
    });
  }
  
  conversationHistory.forEach(msg => {
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    });
  });
  
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }]
  });
  
  const thinkingBudget = getThinkingBudget(userMessage);
  const config = {
    tools: [{ functionDeclarations: GENERAL_CHAT_TOOLS }],
    thinkingConfig: {
      thinkingBudget,
      includeThoughts: true
    }
  } as any;
  
  // Use streaming API
  const streamGenerator = await ai.models.generateContentStream({
    model: MODEL,
    contents,
    config
  });
  
  let accumulatedText = '';
  let accumulatedThinking = '';
  let accumulatedTokens = { input: 0, output: 0, thinking: 0 };
  let functionCalls: any[] = [];
  
  // Stream chunks
  for await (const chunk of streamGenerator) {
    // Extract thinking parts (parts with thought: true flag)
    const parts = chunk.candidates?.[0]?.content?.parts || [];
    const thinkingParts = parts.filter((part: any) => part.thought === true && part.text);
    
    if (thinkingParts.length > 0) {
      const thinkingText = thinkingParts.map((p: any) => p.text).join('\n');
      accumulatedThinking += thinkingText;
      
      // Yield thinking chunk
      yield {
        type: 'thinking',
        content: accumulatedThinking,
        tokens: chunk.usageMetadata?.thoughtsTokenCount || 0
      };
    }
    
    // Check for function calls in this chunk
    if (chunk.functionCalls && chunk.functionCalls.length > 0) {
      functionCalls = chunk.functionCalls;
      console.log('🔧 Tool calls detected in stream:', functionCalls);
      
      // Yield tool call notification
      yield {
        type: 'tool_call',
        toolCalls: functionCalls.map((fc: any) => ({ name: fc.name, args: fc.args }))
      };
      
      // Execute tools
      const weatherDataCollection: any[] = [];
      const airportDataCollection: any[] = [];
      
      const toolResults = await Promise.all(
        functionCalls.map(async (call: any) => {
          try {
            let data;
            
            if (call.name === 'get_airport_weather') {
              const icao = call.args?.icao?.toUpperCase();
              if (!icao) throw new Error('ICAO required');
              
              const snapshot = await getAirfieldWeatherSnapshot(icao, 'full');
              
              weatherDataCollection.push({
                icao,
                metar: snapshot.weatherData.metar || null,
                taf: snapshot.weatherData.taf || null
              });
              
              data = {
                icao,
                metar: snapshot.weatherData.metar?.raw_text || null,
                taf: snapshot.weatherData.taf?.raw_text || null,
                flightCategory: snapshot.weatherData.metar?.flight_category || 'UNKNOWN',
                timestamp: new Date().toISOString()
              };
            } else if (call.name === 'get_airport_capabilities') {
              data = await executeFlightTool(call.name, call.args, userId || 'anonymous');
              
              airportDataCollection.push({
                icao: call.args.icao?.toUpperCase() || 'UNKNOWN',
                airport: data.airport,
                runways: data.runways,
                navigation: data.navigation,
                communications: data.communications,
                suitability: data.aircraft_suitability
              });
            } else if (userId) {
              data = await executeFlightTool(call.name, call.args, userId);
            } else {
              throw new Error('User authentication required for this tool');
            }
            
            return {
              name: call.name,
              success: true,
              data
            };
          } catch (error) {
            console.error(`Failed to execute ${call.name}:`, error);
            return {
              name: call.name,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            };
          }
        })
      );
      
      // Add function call and results to contents for next streaming round
      if (chunk.candidates?.[0]?.content) {
        contents.push(chunk.candidates[0].content);
      }
      
      for (let i = 0; i < functionCalls.length; i++) {
        const call = functionCalls[i];
        const result = toolResults[i];
        
        let formattedData: string;
        
        if (result.success) {
          if (call.name === 'get_airport_weather') {
            const w = result.data as AirportWeatherResult;
            formattedData = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AIRPORT WEATHER: ${w.icao}
Flight Category: ${w.flightCategory}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${w.metar ? `METAR: ${w.metar}` : 'METAR: Not available'}
${w.taf ? `TAF: ${w.taf}` : 'TAF: Not available'}
Data Retrieved: ${new Date(w.timestamp).toLocaleString()}
`;
          } else {
            formattedData = JSON.stringify(result.data, null, 2);
          }
        } else {
          formattedData = `ERROR: ${result.error}`;
        }
        
        contents.push({
          role: 'user',
          parts: [{
            functionResponse: {
              name: call.name,
              response: {
                success: result.success,
                data: formattedData
              }
            }
          }]
        });
      }
      
      // Continue streaming with tool results
      const continueStream = await ai.models.generateContentStream({
        model: MODEL,
        contents,
        config
      });
      
      for await (const continueChunk of continueStream) {
        const chunkText = extractResponseText(continueChunk);
        
        if (chunkText) {
          accumulatedText += chunkText;
          
          // Yield content chunk
          yield {
            type: 'content',
            content: accumulatedText
          };
        }
        
        // Accumulate tokens
        if (continueChunk.usageMetadata) {
          accumulatedTokens.input += continueChunk.usageMetadata.promptTokenCount || 0;
          accumulatedTokens.output += continueChunk.usageMetadata.candidatesTokenCount || 0;
          accumulatedTokens.thinking += continueChunk.usageMetadata.thoughtsTokenCount || 0;
        }
      }
      
      // Yield final result with tool data
      yield {
        type: 'done',
        content: accumulatedText,
        thinking: accumulatedThinking || undefined,
        toolCalls: functionCalls.map((fc: any) => ({ name: fc.name, args: fc.args })),
        weatherData: weatherDataCollection.length > 0 ? weatherDataCollection : undefined,
        airportData: airportDataCollection.length > 0 ? airportDataCollection : undefined,
        tokensUsed: accumulatedTokens,
        modelUsed: MODEL
      };
      
      return; // Exit generator
    }
    
    // Regular text chunk (no tools) - exclude thinking parts
    let chunkText = '';
    
    // Try to extract from parts first (when thinking mode is enabled)
    if (parts.length > 0) {
      const textParts = parts.filter((part: any) => !part.thought && part.text);
      if (textParts.length > 0) {
        chunkText = textParts.map((p: any) => p.text).join('');
      }
    }
    
    // Fallback to extractResponseText for non-thinking responses
    if (!chunkText && parts.length === 0) {
      chunkText = extractResponseText(chunk) || '';
    }
    
    if (chunkText) {
      accumulatedText += chunkText;
      
      // Yield content chunk
      yield {
        type: 'content',
        content: accumulatedText
      };
    }
    
    // Accumulate tokens
    if (chunk.usageMetadata) {
      accumulatedTokens.input += chunk.usageMetadata.promptTokenCount || 0;
      accumulatedTokens.output += chunk.usageMetadata.candidatesTokenCount || 0;
      accumulatedTokens.thinking += chunk.usageMetadata.thoughtsTokenCount || 0;
    }
  }
  
  // Final yield (no tools were called)
  yield {
    type: 'done',
    content: accumulatedText,
    thinking: accumulatedThinking || undefined,
    tokensUsed: accumulatedTokens,
    modelUsed: MODEL
  };
}

/**
 * Calculate cost for general chat
 */
export function calculateGeneralChatCost(
  inputTokens: number,
  outputTokens: number
): number {
  // Flash: $0.075/$0.30 per 1M tokens
  return inputTokens * 0.000000075 + outputTokens * 0.0000003;
}
