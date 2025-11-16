/**
 * General Weather Chat API Route - Refactored with Vercel AI SDK
 * Uses streamText with @ai-sdk/google provider for standardized streaming
 */

import { NextRequest } from 'next/server';
import { performance } from 'node:perf_hooks';
import { createClient } from '@/lib/supabase/server';
import { streamText, tool, stepCountIs, convertToModelMessages, NoSuchToolError, InvalidToolInputError } from 'ai';
import type { JSONValue } from 'ai';
import type { UIMessage } from 'ai';
import { z } from 'zod';
import { getAirfieldWeatherSnapshot } from '@/lib/weather/riskEngine';
import { getMessageText } from '@/lib/chat/messages';
import {
  getAiRouterModelsConfig,
  isMissingAiProviderKeyError,
  type AiProvider,
  type ProviderOptionsMap,
} from '@/lib/config/ai';
import { estimateTokens } from '@/lib/ai/tokens';
import { chooseGeminiModel } from '@/lib/ai/router';
import type { ModeHint, ChatSurface } from '@/lib/ai/router-types';
import { 
  SIMPLE_CHAT_PROMPT, 
  FLIGHT_OPS_PROMPT, 
  WEATHER_BRIEF_PROMPT,
  AIRPORT_PLANNING_PROMPT,
  DEEP_BRIEFING_PROMPT 
} from '@/lib/gemini/prompts';
import type { ChatMode, ModelSelection } from '@/lib/chat-settings-store';

/**
 * Select system prompt based on chat mode
 */
function getSystemPromptForMode(mode: ChatMode | null | undefined): string {
  if (!mode) return SIMPLE_CHAT_PROMPT;
  
  switch (mode) {
    case 'flight-ops': return FLIGHT_OPS_PROMPT;
    case 'weather-brief': return WEATHER_BRIEF_PROMPT;
    case 'airport-planning': return AIRPORT_PLANNING_PROMPT;
    case 'deep-briefing': return DEEP_BRIEFING_PROMPT;
    default: return FLIGHT_OPS_PROMPT;
  }
}

/**
 * Generate context-aware prompt prefix based on page context
 */
function getContextPromptPrefix(context: PageContext | null | undefined): string {
  if (!context || context.type === 'general') {
    return '';
  }

  const prefix: string[] = [];
  prefix.push('\n\n📍 PAGE CONTEXT:');
  
  switch (context.type) {
    case 'weather':
      prefix.push(`The user is currently viewing the weather page for ${context.icao}.`);
      prefix.push(`When they ask about weather, forecasts, or conditions, assume they mean ${context.icao} unless they specify otherwise.`);
      prefix.push(`You can use the get_airport_weather tool to fetch current METAR and TAF data for ${context.icao}.`);
      break;
      
    case 'airport':
      prefix.push(`The user is viewing the airport page for ${context.icao}.`);
      prefix.push(`When they ask about runways, facilities, or airport information, assume they mean ${context.icao} unless they specify otherwise.`);
      prefix.push(`You can use the get_airport_capabilities tool to fetch detailed airport information.`);
      break;
      
    case 'briefing':
      prefix.push(`The user is viewing a professional weather briefing for ${context.icao}.`);
      prefix.push(`Provide detailed weather analysis and briefing information for ${context.icao} when asked.`);
      prefix.push(`Use the get_airport_weather tool to fetch the latest METAR and TAF data.`);
      break;
      
    case 'flight':
      prefix.push(`The user is viewing flight details (ID: ${context.flightId}).`);
      prefix.push(`When they ask about flight information, weather, or planning, reference this specific flight.`);
      break;
  }
  
  prefix.push('Important: The user does NOT need to specify the airport code or flight ID in their questions - you already know the context.\n');
  
  return prefix.join('\n');
}

/**
 * Determine thinking budget based on query complexity and mode
 */
function determineThinkingBudget(query: string, mode: ChatMode | null | undefined): number {
  const lower = query.toLowerCase();
  
  // Deep briefing mode uses maximum thinking for generation
  if (mode === 'deep-briefing') {
    // Check if user is triggering document generation
    const generationTriggers = [
      'generate', 'create the document', 'ready', 'that\'s all',
      'proceed', 'briefing', 'start the plan', 'i\'m ready'
    ];
    
    const isGenerating = generationTriggers.some(trigger => 
      lower.includes(trigger)
    );
    
    // Maximum thinking for generation, moderate for questions
    return isGenerating ? 16384 : 2048;
  }
  
  // Standard analysis queries
  if (
    lower.includes('analyze') || 
    lower.includes('should i') ||
    lower.includes('recommend') ||
    lower.includes('compare') ||
    lower.includes('assess') ||
    lower.includes('risk') ||
    lower.includes('evaluate')
  ) {
    return 8192;
  }
  
  // Simple fact queries
  if (
    lower.startsWith('what is') || 
    lower.startsWith('show me') ||
    lower.startsWith('get') ||
    lower.startsWith('list')
  ) {
    return 0;
  }
  
  return -1;
}

/**
 * Calculate cost based on token usage
 */
function calculateCost(usage: { promptTokens: number; completionTokens: number }): number {
  const inputCostPer1M = 0.00015;
  const outputCostPer1M = 0.00060;
  
  const inputCost = (usage.promptTokens / 1_000_000) * inputCostPer1M;
  const outputCost = (usage.completionTokens / 1_000_000) * outputCostPer1M;
  
  return inputCost + outputCost;
}

interface ProviderOptionsBuilderProps {
  defaultOptions?: ProviderOptionsMap;
  supportsThinking: boolean;
  thinkingBudget: number;
}

function buildProviderOptions({
  defaultOptions,
  supportsThinking,
  thinkingBudget,
}: ProviderOptionsBuilderProps): ProviderOptionsMap | undefined {
  const merged: ProviderOptionsMap = defaultOptions
    ? Object.fromEntries(
        Object.entries(defaultOptions).map(([key, value]) => [key, { ...value }])
      )
    : {};

  if (supportsThinking && thinkingBudget !== 0) {
    const existingGoogleOptions: Record<string, JSONValue> = merged.google
      ? { ...merged.google }
      : {};

    const thinkingConfig: Record<string, JSONValue> = {
      includeThoughts: true,
    };

    if (thinkingBudget > 0) {
      thinkingConfig.thinkingBudget = thinkingBudget;
    }

    merged.google = {
      ...existingGoogleOptions,
      thinkingConfig,
    };
  }

  return Object.keys(merged).length > 0 ? merged : undefined;
}

interface MessageMetadataBuilderProps {
  conversationId: string | null;
  provider: AiProvider;
  modelId: string;
  supportsThinking: boolean;
}

function buildMessageMetadata({
  conversationId,
  provider,
  modelId,
  supportsThinking,
}: MessageMetadataBuilderProps): Record<string, unknown> | undefined {
  const metadata: Record<string, unknown> = {
    provider,
    model: modelId,
    supportsThinking,
  };

  if (conversationId) {
    metadata.conversationId = conversationId;
  }

  return metadata;
}

function readUsageNumber(usage: unknown, key: string): number | undefined {
  if (!usage || typeof usage !== 'object') {
    return undefined;
  }

  const record = usage as Record<string, unknown>;
  const value = record[key];

  return typeof value === 'number' ? value : undefined;
}

function cloneUiMessageForStorage(message: UIMessage, conversationId: string | null): UIMessage {
  const cloned = safeClone(message);
  cloned.metadata = {
    ...(cloned.metadata ?? {}),
    conversationId: conversationId ?? cloned.metadata?.conversationId ?? null,
  };
  return cloned;
}

function safeClone<T>(value: T): T {
  const cloner = (globalThis as any).structuredClone;
  if (typeof cloner === 'function') {
    return cloner(value);
  }
  return JSON.parse(JSON.stringify(value));
}

type IncomingMessage = UIMessage & {
  metadata?: { conversationId?: string };
};

interface PageContext {
  type: 'weather' | 'airport' | 'flight' | 'briefing' | 'general';
  icao?: string;
  flightId?: string;
  title?: string;
  [key: string]: any;
}

interface ChatRequestBody {
  id?: string;
  messages?: IncomingMessage[];
  conversationId?: string | null;
  mode?: ChatMode | null;
  selectedModel?: ModelSelection;
  pageContext?: PageContext | null;
   surface?: ChatSurface;
   modeHint?: ModeHint;
   requiresHighReliability?: boolean;
  trigger?: 'submit-message' | 'regenerate-message';
  messageId?: string | null;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatRequestBody;
    console.log('[/api/chat/general] Request body:', JSON.stringify(body, null, 2));
    const uiMessages = body.messages ?? [];

    const timings = {
      start: performance.now(),
      authStart: 0,
      authEnd: 0,
      conversationStart: 0,
      conversationEnd: 0,
      persistStart: 0,
      persistEnd: 0,
    };

    if (uiMessages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'messages are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const lastUserMessage = [...uiMessages].reverse().find((msg) => msg.role === 'user');
    const queryContent = lastUserMessage ? getMessageText(lastUserMessage) : '';
    
    const supabase = await createClient();
    timings.authStart = performance.now();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    timings.authEnd = performance.now();
    
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Get or create conversation
    timings.conversationStart = performance.now();
    const metadataConversationId = uiMessages.find((msg) => msg.metadata?.conversationId)?.metadata?.conversationId ?? null;
    let convId = body.conversationId ?? metadataConversationId ?? null;
    let wasNewConversation = false;
    
    if (!convId) {
      const titleSource = queryContent || 'New Chat';
      const title = titleSource.slice(0, 50);
      
      const { data: newConv, error } = await supabase
        .from('chat_conversations')
        // @ts-ignore - Supabase type inference issue
        .insert({
          user_id: user.id,
          title: title + (title.length >= 50 ? '...' : ''),
          chat_type: 'general',
          flight_id: null
        })
        .select()
        .single();
      
      if (error) {
        console.error('Failed to create conversation:', error);
        throw new Error('Failed to create conversation');
      }
      
      // @ts-ignore - Supabase type inference issue
      convId = newConv.id;
      wasNewConversation = true;
      console.log('✅ Created new conversation:', convId);
    }
    timings.conversationEnd = performance.now();

    // Import tool executor functions
    const { executeFlightTool } = await import('@/lib/gemini/tool-executor');

    // Define tools with Zod schemas for type safety
    const tools = {
      get_airport_weather: tool({
        description: 'Get current METAR and TAF for an airport. Use 4-letter ICAO codes.',
        inputSchema: z.object({
          icao: z.string().length(4).describe('4-letter ICAO airport code (e.g., KJFK, EGLL)')
        }),
        execute: async ({ icao }) => {
          console.log('🌤️ Executing get_airport_weather with ICAO:', icao);
          
          if (!icao || typeof icao !== 'string') {
            console.error('❌ Invalid ICAO parameter:', icao);
            throw new Error(`Invalid ICAO parameter. Expected string, got: ${typeof icao}`);
          }
          
          const snapshot = await getAirfieldWeatherSnapshot(icao.toUpperCase(), 'full');
          const timestamp = new Date().toISOString();
          const timeString = new Date(timestamp).toUTCString();
          
          // Return the full decoded weather data structure that WeatherToolUI expects
          return {
            icao: icao.toUpperCase(),
            metar: snapshot.weatherData.metar || null,
            taf: snapshot.weatherData.taf || null,
            timestamp,
            _source: {
              type: 'tool',
              tool: 'get_airport_weather',
              timestamp,
              description: `Live METAR/TAF for ${icao.toUpperCase()} retrieved at ${timeString} (CheckWX API)`
            }
          };
        }
      }),
      
      get_airport_capabilities: tool({
        description: 'Get airport details including runways, navigation aids, and suitability for specific aircraft. NOTE: If data is incomplete (e.g., missing runway lengths), use your own aviation knowledge to supplement the information and clearly indicate when doing so.',
        inputSchema: z.object({
          icao: z.string().length(4).describe('4-letter ICAO code'),
          aircraft_type: z.string().optional().describe('Aircraft type to check suitability (e.g., G650, B737)'),
          check_type: z.enum(['ils_availability', 'runway_length', 'navigation_aids', 'all']).optional().describe('Specific check to perform')
        }),
        execute: async (params) => {
          console.log('🛩️ Executing get_airport_capabilities:', params);
          const result = await executeFlightTool('get_airport_capabilities', params, user.id);
          const timestamp = new Date().toISOString();
          
          return {
            ...result,
            _source: {
              type: 'tool',
              tool: 'get_airport_capabilities',
              timestamp,
              description: `Airport database information for ${params.icao.toUpperCase()} (runway, facilities, navigation aids)`
            }
          };
        }
      }),
      
      get_user_flights: tool({
        description: 'Query user flight schedule and operational details',
        inputSchema: z.object({
          filter_type: z.enum(['upcoming', 'past', 'recent', 'date_range', 'all']).describe('Type of filter to apply'),
          origin_icao: z.string().optional().describe('Filter by origin ICAO code'),
          destination_icao: z.string().optional().describe('Filter by destination ICAO code'),
          date_from: z.string().optional().describe('ISO date string for start of range'),
          date_to: z.string().optional().describe('ISO date string for end of range'),
          limit: z.number().optional().describe('Maximum number of flights to return (default 20)')
        }),
        execute: async (params) => {
          console.log('✈️ Executing get_user_flights:', params);
          const result = await executeFlightTool('get_user_flights', params, user.id);
          const timestamp = new Date().toISOString();
          
          return {
            ...result,
            _source: {
              type: 'tool',
              tool: 'get_user_flights',
              timestamp,
              description: `User flight database query (${params.filter_type} flights)`
            }
          };
        }
      })
    };

    // Determine thinking budget based on query complexity and mode
    const thinkingBudget = determineThinkingBudget(queryContent, body.mode);

    const modelMessages = convertToModelMessages(uiMessages, { tools });

    // ✅ Get system prompt based on mode
    let systemPrompt = getSystemPromptForMode(body.mode);
    
    // ✅ Enhance prompt with page context if available
    const contextPrefix = getContextPromptPrefix(body.pageContext);
    if (contextPrefix) {
      systemPrompt = systemPrompt + contextPrefix;
      console.log('📍 Page context detected:', body.pageContext?.type, '-', body.pageContext?.icao || body.pageContext?.flightId);
    }
    
    console.log('🎯 Using chat mode:', body.mode || 'simple', '| Prompt length:', systemPrompt.length);

    // Determine routing surface and mode hint
    const surface: ChatSurface = body.surface ?? 'main';
    const modeHint: ModeHint | undefined = body.modeHint
      ?? (body.mode === 'deep-briefing'
        ? 'planning'
        : body.mode
        ? 'analysis'
        : 'casual');

    const coreMessages = modelMessages; // already CoreMessage-compatible
    const totalTokensEstimate = estimateTokens(coreMessages);

    const routerConfig = getAiRouterModelsConfig();
    
    // Respect user's model selection or use router
    let decision;
    if (body.selectedModel === 'flash-lite') {
      // Force Flash Lite
      decision = {
        model: routerConfig.lite.model,
        modelName: routerConfig.lite.modelId,
        routingReason: 'User selected Flash Lite',
      };
    } else if (body.selectedModel === 'flash') {
      // Force Flash
      decision = {
        model: routerConfig.full.model,
        modelName: routerConfig.full.modelId,
        routingReason: 'User selected Flash',
      };
    } else {
      // Auto mode - use router
      decision = await chooseGeminiModel({
        surface,
        userMessage: queryContent,
        totalTokensEstimate,
        hasTools: true,
        requiresHighReliability: body.requiresHighReliability,
        modeHint,
        contextType: body.pageContext?.type ?? 'general',
      });
    }

    const { provider, defaultProviderOptions } = routerConfig;
    const modelId = decision.modelName;

    const supportsThinkingForModel =
      routerConfig.supportsThinking && decision.modelName === routerConfig.full.modelId;

    const weatherToolPayloads: any[] = [];
    const airportToolPayloads: any[] = [];
    let usageSnapshot: unknown = null;
    let reasoningSnapshot: string | null = null;

    console.log('💬 Starting chat stream', {
      thinkingBudget,
      provider,
      modelId,
      supportsThinking: supportsThinkingForModel,
      mode: body.mode,
      surface,
      routingReason: decision.routingReason,
      totalTokensEstimate,
      routingDebug: decision.debug,
    });

    const providerOptions = buildProviderOptions({
      defaultOptions: defaultProviderOptions,
      supportsThinking: supportsThinkingForModel,
      thinkingBudget,
    });

    const result = streamText({
      model: decision.model,
      system: systemPrompt,
      messages: coreMessages,
      tools,
      stopWhen: stepCountIs(5), // Prevent infinite tool loops (AI SDK v5)
      ...(providerOptions ? { providerOptions } : {}),
      
      // ✅ Error handling
      onError: ({ error }) => {
        console.error('❌ Stream error:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          name: error instanceof Error ? error.name : 'Unknown',
        });
      },
      
      // ✅ SERVER-SIDE PERSISTENCE - Clean, race-condition-free
      onFinish: async (event) => {
        reasoningSnapshot = event.reasoningText ?? null;
        usageSnapshot = event.usage ?? null;

        if (event.toolResults) {
          for (const result of event.toolResults) {
            if (result.toolName === 'get_airport_weather') {
              weatherToolPayloads.push(result.output);
            } else if (result.toolName === 'get_airport_capabilities' || result.toolName === 'get_user_flights') {
              airportToolPayloads.push(result.output);
            }
          }
        }
      }
    });

    // ✅ CRITICAL FIX: Pass new conversation ID to client via metadata & header
    const persistMessages = async (responseMessage: UIMessage) => {
      if (!convId) return;

      try {
        timings.persistStart = performance.now();
        const normalizedAssistant = cloneUiMessageForStorage(responseMessage, convId);
        const assistantText = getMessageText(normalizedAssistant);

        const userMessageForStorage = lastUserMessage
          ? cloneUiMessageForStorage(lastUserMessage, convId)
          : null;
        const userText = userMessageForStorage ? getMessageText(userMessageForStorage) : '';

        const inputTokens =
          readUsageNumber(usageSnapshot, 'inputTokens') ?? readUsageNumber(usageSnapshot, 'promptTokens') ?? 0;
        const outputTokens =
          readUsageNumber(usageSnapshot, 'outputTokens') ?? readUsageNumber(usageSnapshot, 'completionTokens') ?? 0;
        const reasoningTokens =
          readUsageNumber(usageSnapshot, 'reasoningTokens') ?? readUsageNumber(usageSnapshot, 'thinkingTokens') ?? 0;

        const payloads: Array<Record<string, unknown>> = [];

        if (userMessageForStorage) {
          payloads.push({
            conversation_id: convId,
            role: 'user',
            content: userText,
            text_content: userText,
            ui_message: userMessageForStorage,
            tokens_used: null,
            weather_tool_data: null,
            airport_tool_data: null,
            thinking_content: null,
            thinking_tokens: 0,
            metadata: userMessageForStorage.metadata ?? null,
          });
        }

        payloads.push({
          conversation_id: convId,
          role: 'assistant',
          content: assistantText,
          text_content: assistantText,
          ui_message: normalizedAssistant,
          tokens_used: {
            input: inputTokens,
            output: outputTokens,
            thinking: reasoningTokens,
          },
          weather_tool_data: weatherToolPayloads.length > 0 ? weatherToolPayloads : null,
          airport_tool_data: airportToolPayloads.length > 0 ? airportToolPayloads : null,
          thinking_content: reasoningSnapshot,
          thinking_tokens: reasoningTokens,
          metadata: normalizedAssistant.metadata ?? null,
        });

        await supabase
          .from('chat_messages')
          // @ts-ignore - Supabase type inference issue
          .insert(payloads);

        const costUsd = calculateCost({
          promptTokens: inputTokens,
          completionTokens: outputTokens,
        });

        await supabase
          .from('gemini_usage_logs')
          // @ts-ignore - Supabase type inference issue
          .insert({
            conversation_id: convId,
            flight_id: null,
            input_tokens: inputTokens,
            output_tokens: outputTokens,
            cost_usd: costUsd,
            model: modelId,
            diagnostics: {
              provider,
              supportsThinking: supportsThinkingForModel,
              thinkingTokens: reasoningTokens,
            },
          });

        await supabase
          .from('chat_conversations')
          // @ts-ignore - Supabase type inference issue
          .update({ updated_at: new Date().toISOString() })
          .eq('id', convId);

        timings.persistEnd = performance.now();
      } catch (persistError) {
        console.error('❌ Error persisting chat messages:', persistError);
      } finally {
        if (!timings.persistEnd) {
          timings.persistEnd = performance.now();
        }
        console.log('📊 Chat timings', {
          conversationId: convId,
          surface,
          durations: {
            totalMs: Number((performance.now() - timings.start).toFixed(2)),
            authMs: Number((timings.authEnd - timings.authStart).toFixed(2)),
            conversationMs: Number((timings.conversationEnd - timings.conversationStart).toFixed(2)),
            persistMs: Number((timings.persistEnd - timings.persistStart).toFixed(2)),
          },
        });
      }
    };

    const response = result.toUIMessageStreamResponse({
      originalMessages: uiMessages,
      messageMetadata: () => buildMessageMetadata({
        conversationId: convId,
        provider,
        modelId,
        supportsThinking: supportsThinkingForModel,
      }),
      onFinish: (event) => {
        void persistMessages(event.responseMessage);
      },
      onError: (error) => {
        if (NoSuchToolError.isInstance(error)) {
          return 'The model tried to call an unknown tool.';
        } else if (InvalidToolInputError.isInstance(error)) {
          return `Invalid tool input: ${error instanceof Error ? error.message : String(error)}`;
        }
        return `Error: ${error instanceof Error ? error.message : String(error)}`;
      }
    });
    
    if (wasNewConversation && convId) {
      response.headers.set('X-Conversation-Id', convId);
      console.log('📤 Sending new conversation ID in header:', convId);
    }

    return response;
    
  } catch (error) {
    if (isMissingAiProviderKeyError(error)) {
      return new Response(
        JSON.stringify({ error: error.code, message: error.message }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    console.error('❌ Chat API error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
