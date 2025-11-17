import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  streamText,
  stepCountIs,
  convertToModelMessages,
  NoSuchToolError,
  InvalidToolInputError,
} from 'ai';
import type { UIMessage } from 'ai';
import { getMessageText } from '@/lib/chat/messages';
import { estimateTokens } from '@/lib/ai/tokens';
import { isMissingAiProviderKeyError } from '@/lib/config/ai';
import type { ModeHint, ChatSurface } from '@/lib/ai/router-types';
import {
  buildSystemPrompt,
  determineThinkingBudget,
  buildProviderOptions,
  buildMessageMetadata,
  resolveModelDecision,
} from '@/lib/ai/chat/prompt-resolver';
import { formatZulu } from '@/lib/time/format';
import { getToolRegistry } from '@/lib/ai/chat/tool-registry';
import { createChatTimings, markTiming, parseChatRequest } from '@/lib/ai/chat/request-utils';
import {
  extractConversationIdFromMessages,
  getOrCreateConversation,
  persistChatExchange,
} from '@/lib/chat/conversation-service';

export async function POST(req: NextRequest) {
  try {
    const timings = createChatTimings();
    const body = await parseChatRequest(req);
    console.log('[/api/chat/general] Request body:', JSON.stringify(body, null, 2));
    const uiMessages = body.messages ?? [];

    if (uiMessages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'messages are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const lastUserMessage = [...uiMessages].reverse().find((msg) => msg.role === 'user');
    const queryContent = lastUserMessage ? getMessageText(lastUserMessage) : '';
    
    const supabase = await createClient();
    markTiming(timings, 'authStart');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    markTiming(timings, 'authEnd');
    
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 });
    }

    markTiming(timings, 'conversationStart');
    const metadataConversationId = extractConversationIdFromMessages(uiMessages);
    const { conversationId: convId, wasNewConversation } = await getOrCreateConversation({
      supabase,
      userId: user.id,
      bodyConversationId: body.conversationId,
      messageConversationId: metadataConversationId,
      titleSource: queryContent,
    });
    markTiming(timings, 'conversationEnd');

    const tools = getToolRegistry({ userId: user.id });

    // Determine thinking budget based on query complexity and mode
    const thinkingBudget = determineThinkingBudget(queryContent, body.mode);

    const modelMessages = convertToModelMessages(uiMessages, { tools });

    const systemPrompt = buildSystemPrompt({ mode: body.mode, pageContext: body.pageContext });
    const currentZulu = formatZulu();
    if (body.pageContext && body.pageContext.type !== 'general') {
      console.log(
        '📍 Page context detected:',
        body.pageContext.type,
        '- ',
        body.pageContext.icao || body.pageContext.flightId,
      );
    }

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
    const {
      routerConfig,
      decision,
      provider,
      supportsThinkingForModel,
    } = await resolveModelDecision({
      selectedModel: body.selectedModel,
      surface,
      queryContent,
      totalTokensEstimate,
      hasTools: true,
      requiresHighReliability: body.requiresHighReliability,
      modeHint,
      pageContextType: body.pageContext?.type,
    });
    const modelId = decision.modelName;

    const weatherToolPayloads: any[] = [];
    const airportToolPayloads: any[] = [];
    const researchToolPayloads: any[] = [];
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
      defaultOptions: routerConfig.defaultProviderOptions,
      supportsThinking: supportsThinkingForModel,
      thinkingBudget,
    });

    const result = streamText({
      model: decision.model,
      system: `${systemPrompt}\n\nCurrent Zulu time: ${currentZulu}`,
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
            } else if (
              result.toolName === 'get_airport_capabilities' ||
              result.toolName === 'get_user_flights'
            ) {
              airportToolPayloads.push(result.output);
            } else if (result.toolName === 'web_search') {
              researchToolPayloads.push(result.output);
            }
          }
        }
      }
    });

    // ✅ CRITICAL FIX: Pass new conversation ID to client via metadata & header
    const response = result.toUIMessageStreamResponse({
      originalMessages: uiMessages,
      messageMetadata: () => buildMessageMetadata({
        conversationId: convId,
        provider,
        modelId,
        supportsThinking: supportsThinkingForModel,
      }),
      onFinish: (event) => {
        if (!convId) return;
        void persistChatExchange({
          supabase,
          conversationId: convId,
          lastUserMessage: lastUserMessage ?? undefined,
          responseMessage: event.responseMessage,
          usageSnapshot,
          weatherToolPayloads,
          airportToolPayloads,
          researchToolPayloads,
          reasoningSnapshot,
          provider,
          modelId,
          supportsThinking: supportsThinkingForModel,
          timings,
          surface,
        });
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
