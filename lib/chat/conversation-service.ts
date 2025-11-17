import { performance } from 'node:perf_hooks';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { UIMessage } from 'ai';
import { getMessageText } from './messages';
import type { AiProvider } from '../config/ai';
import type { ChatSurface } from '../ai/router-types';
import {
  calculateCost,
  cloneUiMessageForStorage,
  readUsageNumber,
  type ChatTimings,
} from '../ai/chat/request-utils';

export interface ConversationLookupParams {
  supabase: SupabaseClient;
  userId: string;
  bodyConversationId?: string | null;
  messageConversationId?: string | null;
  titleSource?: string;
}

export interface ConversationLookupResult {
  conversationId: string | null;
  wasNewConversation: boolean;
}

export async function getOrCreateConversation({
  supabase,
  userId,
  bodyConversationId,
  messageConversationId,
  titleSource,
}: ConversationLookupParams): Promise<ConversationLookupResult> {
  let conversationId = bodyConversationId ?? messageConversationId ?? null;
  let wasNewConversation = false;

  if (!conversationId) {
    const title = buildConversationTitle(titleSource ?? 'New Chat');

    const { data: newConversation, error } = await supabase
      .from('chat_conversations')
      // @ts-ignore - Supabase generated types not wired for this file yet
      .insert({
        user_id: userId,
        title,
        chat_type: 'general',
        flight_id: null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create conversation: ${error.message}`);
    }

    // @ts-ignore - Supabase type inference issue
    conversationId = newConversation.id;
    wasNewConversation = true;
  }

  return { conversationId, wasNewConversation };
}

export function buildConversationTitle(query: string): string {
  const trimmed = query.trim();
  const base = trimmed.length > 0 ? trimmed : 'New Chat';
  const truncated = base.slice(0, 50);
  return truncated + (base.length > 50 ? '...' : '');
}

export interface PersistChatExchangeParams {
  supabase: SupabaseClient;
  conversationId: string;
  lastUserMessage?: UIMessage;
  responseMessage: UIMessage;
  usageSnapshot: unknown;
  weatherToolPayloads: unknown[];
  airportToolPayloads: unknown[];
  researchToolPayloads: unknown[];
  reasoningSnapshot: string | null;
  provider: AiProvider;
  modelId: string;
  supportsThinking: boolean;
  timings: ChatTimings;
  surface: ChatSurface;
}

export async function persistChatExchange({
  supabase,
  conversationId,
  lastUserMessage,
  responseMessage,
  usageSnapshot,
  weatherToolPayloads,
  airportToolPayloads,
  researchToolPayloads,
  reasoningSnapshot,
  provider,
  modelId,
  supportsThinking,
  timings,
  surface,
}: PersistChatExchangeParams): Promise<void> {
  try {
    const normalizedAssistant = cloneUiMessageForStorage(responseMessage, conversationId);
    const assistantText = getMessageText(normalizedAssistant);

    const userMessageForStorage = lastUserMessage
      ? cloneUiMessageForStorage(lastUserMessage, conversationId)
      : null;
    const userText = userMessageForStorage ? getMessageText(userMessageForStorage) : '';

    const inputTokens =
      readUsageNumber(usageSnapshot, 'inputTokens') ??
      readUsageNumber(usageSnapshot, 'promptTokens') ??
      0;
    const outputTokens =
      readUsageNumber(usageSnapshot, 'outputTokens') ??
      readUsageNumber(usageSnapshot, 'completionTokens') ??
      0;
    const reasoningTokens =
      readUsageNumber(usageSnapshot, 'reasoningTokens') ??
      readUsageNumber(usageSnapshot, 'thinkingTokens') ??
      0;

    const payloads: Array<Record<string, unknown>> = [];

    if (userMessageForStorage) {
      payloads.push({
        conversation_id: conversationId,
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

    const assistantMetadata = {
      ...(normalizedAssistant.metadata ?? {}),
      ...(researchToolPayloads.length > 0
        ? { research_tool_data: researchToolPayloads }
        : {}),
    };

    payloads.push({
      conversation_id: conversationId,
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
      metadata: Object.keys(assistantMetadata).length > 0 ? assistantMetadata : null,
    });

    timings.persistStart = performance.now();

    await supabase
      .from('chat_messages')
      // @ts-ignore - Supabase generated types
      .insert(payloads);

    const costUsd = calculateCost({
      promptTokens: inputTokens,
      completionTokens: outputTokens,
    });

    await supabase
      .from('gemini_usage_logs')
      // @ts-ignore - Supabase generated types
      .insert({
        conversation_id: conversationId,
        flight_id: null,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        cost_usd: costUsd,
        model: modelId,
        diagnostics: {
          provider,
          supportsThinking,
          thinkingTokens: reasoningTokens,
        },
      });

    await supabase
      .from('chat_conversations')
      // @ts-ignore - Supabase generated types
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);
  } catch (error) {
    console.error('❌ Error persisting chat messages:', error);
  } finally {
    timings.persistEnd = performance.now();
    console.log('📊 Chat timings', {
      conversationId,
      surface,
      durations: {
        totalMs: Number((performance.now() - timings.start).toFixed(2)),
        authMs: Number((timings.authEnd - timings.authStart).toFixed(2)),
        conversationMs: Number((timings.conversationEnd - timings.conversationStart).toFixed(2)),
        persistMs: Number((timings.persistEnd - timings.persistStart).toFixed(2)),
      },
    });
  }
}

export function extractConversationIdFromMessages(messages: UIMessage[]): string | null {
  return (
    messages.find((msg) => msg.metadata?.conversationId)?.metadata?.conversationId ?? null
  );
}
