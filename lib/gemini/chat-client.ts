/**
 * Gemini Chat Client
 * Handles communication with AI API using Vercel AI SDK for conversational AI with tool calling support
 * Supports both Gemini (API Key) and Vertex AI (Service Account) automatically via config
 */

import { generateText, tool } from 'ai';
import { z } from 'zod';
import { getAiProviderConfig } from '@/lib/config/ai';
import { getFlightRisk } from '@/lib/weather/riskEngine';
import { buildFlightContext } from './context-builder';

// System prompt
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

TEMPORAL AWARENESS:
- Time does NOT progress between messages in a conversation
- If TIMING CONTEXT shows "72.5 hours until departure", it's STILL that on next message
- Don't say "now we're closer" unless user explicitly says time has passed

RESPONSE RULES:
1. **Be conversational**: Sound like a helpful colleague, not a robot
2. **One disclaimer maximum**: If TAF expires before flight, mention it ONCE casually, then move on
3. **No excessive formatting**: 
   - Headers only if response is long (>4 paragraphs)
   - Bold only for actual warnings
   - Italics rarely (maybe aircraft types)
   - Use lists for 3+ items, otherwise keep it flowing
4. **Never mention flight UUIDs**: Say "Your KJFK→KLAX flight at 12:00Z" not "Your flight 088b2468..."
5. **Focus on what matters**: Give actionable insights, not exhaustive data dumps
`;

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

/**
 * Sends a chat message to AI using Vercel AI SDK
 * Automatically handles Vertex/Gemini provider switching based on environment
 */
export async function sendChatMessage(
  flightId: string,
  userId: string,
  flightContext: string,
  conversationHistory: ChatMessage[],
  userMessage: string
): Promise<ChatResponse> {
  // Get configured provider (Gemini or Vertex)
  const aiConfig = getAiProviderConfig();
  
  // Convert history to Vercel AI SDK format
  const messages = [
    {
      role: 'system' as const,
      content: `${SYSTEM_PROMPT}\n\n=== FLIGHT CONTEXT ===\n${flightContext}`
    },
    ...conversationHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' as const : 'user' as const,
      content: msg.content
    })),
    {
      role: 'user' as const,
      content: userMessage
    }
  ];

  // Define tools using Vercel AI SDK format
  const weatherParameters = z.object({
    force_refresh: z.boolean().optional().describe('Force refresh even if cache is valid'),
  });

  const tools = {
    refresh_weather_data: tool({
      description: 'Refresh weather data (METAR/TAF) for the flight. Use this when data is stale or user asks for update.',
      parameters: weatherParameters,
      execute: async (args: any) => {
        const { force_refresh } = args || {};
        console.log('🔄 Refreshing weather data...', { flightId, force_refresh });
        
        const riskData = await getFlightRisk({
          accountId: userId,
          flightId,
          now: new Date()
        });
        
        const { contextString } = await buildFlightContext(flightId, riskData);
        
        return {
          contextString,
          origin: {
             icao: riskData.origin.icao,
             metar: riskData.origin.weatherData?.metar?.raw_text || 'NOT AVAILABLE',
             taf: riskData.origin.weatherData?.taf?.raw_text || 'NOT AVAILABLE'
          },
          destination: {
             icao: riskData.destination.icao,
             metar: riskData.destination.weatherData?.metar?.raw_text || 'NOT AVAILABLE',
             taf: riskData.destination.weatherData?.taf?.raw_text || 'NOT AVAILABLE'
          },
          timestamp: new Date().toISOString(),
          risk: `${riskData.result.score}/100 (${riskData.result.tier})`
        };
      },
    } as any),
  };

  try {
    // Call model with automatic tool execution loop
    const result = await generateText({
      model: aiConfig.model,
      messages,
      tools,
      maxSteps: 2, // Allow 1 round of tool execution (call + response)
      onStepFinish: ({ toolCalls }: any) => {
          if (toolCalls && toolCalls.length > 0) {
             console.log('🔧 AI Tool executed:', toolCalls.map((t: any) => t.toolName));
          }
      }
    } as any);

    return {
      message: result.text,
      tokensUsed: {
        input: (result.usage as any).promptTokens || (result.usage as any).inputTokens || 0,
        output: (result.usage as any).completionTokens || (result.usage as any).outputTokens || 0
      },
      // We detect if tools were used by checking usage or steps, but for simple response:
      toolCalls: result.toolCalls.map(tc => ({
        name: tc.toolName,
        args: (tc as any).args || (tc as any).parameters || {}
      })),
      dataRefreshed: result.toolCalls.some(tc => tc.toolName === 'refresh_weather_data'),
      modelUsed: aiConfig.modelId
    };
  } catch (error) {
    console.error('AI Chat Error:', error);
    throw error;
  }
}

/**
 * Calculates cost in USD for a Gemini/Vertex API call
 * Estimates based on flash pricing
 */
export function calculateCost(
  inputTokens: number, 
  outputTokens: number,
  model: string = 'gemini-2.5-flash'
): number {
  // Flash: $0.075/$0.30 per 1M tokens
  return inputTokens * 0.000000075 + outputTokens * 0.0000003;
}
