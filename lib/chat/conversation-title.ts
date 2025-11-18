import type { SupabaseClient } from '@supabase/supabase-js';
import { generateText } from 'ai';

import type { Database } from '../supabase/types';
import { getAiRouterModelsConfig } from '../config/ai';
import { buildConversationTitle } from './conversation-service';

const MAX_MESSAGES = 12;
const MIN_MESSAGES_FOR_TITLE = 2;

type ChatMessageRow = Database['public']['Tables']['chat_messages']['Row'] & {
  text_content?: string | null;
};

type ChatConversationRow = Database['public']['Tables']['chat_conversations']['Row'];
type ChatConversationUpdate = Database['public']['Tables']['chat_conversations']['Update'];

const CHAT_CONVERSATIONS_TABLE: keyof Database['public']['Tables'] = 'chat_conversations';
const CHAT_MESSAGES_TABLE: keyof Database['public']['Tables'] = 'chat_messages';

export interface GenerateConversationTitleParams {
  supabase: SupabaseClient<Database>;
  conversationId: string;
  userId: string;
}

export interface ConversationTitleResult {
  updated: boolean;
  title?: string;
  reason?: 'not_found' | 'not_owner' | 'insufficient_messages' | 'custom_title' | 'model_error' | 'unchanged';
}

export async function generateConversationTitle({
  supabase,
  conversationId,
  userId,
}: GenerateConversationTitleParams): Promise<ConversationTitleResult> {
  const conversation = await fetchConversation(supabase, conversationId);

  if (!conversation) {
    return { updated: false, reason: 'not_found' };
  }

  if (conversation.user_id !== userId) {
    return { updated: false, reason: 'not_owner' };
  }

  const transcript = await fetchConversationTranscript(supabase, conversationId);

  if (transcript.length < MIN_MESSAGES_FOR_TITLE) {
    return { updated: false, reason: 'insufficient_messages' };
  }

  const firstUserLine = transcript.find((line) => line.role === 'user');
  const defaultTitle = firstUserLine ? buildConversationTitle(firstUserLine.text) : 'New Chat';

  const currentTitle = conversation.title?.trim() ?? '';
  const hasCustomTitle = currentTitle.length > 0 && currentTitle !== defaultTitle;

  if (hasCustomTitle) {
    return { updated: false, reason: 'custom_title', title: currentTitle };
  }

  let generated: string | null = null;
  try {
    generated = await requestTitleFromModel(transcript);
  } catch (error) {
    console.error('❌ Conversation title model call failed', error);
    return { updated: false, reason: 'model_error' };
  }

  const normalized = normalizeGeneratedTitle(generated);

  if (!normalized) {
    return { updated: false, reason: 'model_error' };
  }

  if (normalized === currentTitle) {
    return { updated: false, reason: 'unchanged', title: normalized };
  }

  const conversationTable = supabase.from(CHAT_CONVERSATIONS_TABLE) as any;

  const { error: updateError } = await conversationTable
    .update({ title: normalized } as ChatConversationUpdate)
    .eq('id', conversationId);

  if (updateError) {
    console.error('❌ Failed to persist conversation title', updateError);
    return { updated: false, reason: 'model_error' };
  }

  return { updated: true, title: normalized };
}

async function fetchConversation(
  supabase: SupabaseClient<Database>,
  conversationId: string,
): Promise<ChatConversationRow | null> {
  const { data, error } = await supabase
    .from(CHAT_CONVERSATIONS_TABLE)
    .select('id, user_id, title')
    .eq('id', conversationId)
    .single();

  if (error) {
    console.error('❌ Failed to load conversation for title generation', error);
    return null;
  }

  return data as ChatConversationRow;
}

async function fetchConversationTranscript(
  supabase: SupabaseClient<Database>,
  conversationId: string,
) {
  const { data, error } = await supabase
    .from(CHAT_MESSAGES_TABLE)
    .select('id, role, content, text_content, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(MAX_MESSAGES);

  if (error) {
    console.error('❌ Failed to load messages for title generation', error);
    return [] as Array<{ role: 'user' | 'assistant'; text: string }>;
  }

  const typedMessages = (data ?? []) as ChatMessageRow[];
  return normalizeTranscript(typedMessages.reverse());
}

function normalizeTranscript(messages: ChatMessageRow[]) {
  return messages
    .filter((message) => message.role === 'user' || message.role === 'assistant')
    .map((message) => ({
      role: message.role as 'user' | 'assistant',
      text: extractPlainText(message).slice(0, 280),
    }))
    .filter((message) => message.text.length > 0);
}

function extractPlainText(message: ChatMessageRow): string {
  const candidate = (message.text_content ?? message.content ?? '').trim();
  if (candidate.length > 0) {
    return candidate;
  }

  return '';
}

async function requestTitleFromModel(transcript: Array<{ role: 'user' | 'assistant'; text: string }>) {
  const config = getAiRouterModelsConfig();
  const liteModel = config.lite.model;

  const conversationText = transcript
    .map((entry) => `${entry.role === 'user' ? 'User' : 'AI'}: ${entry.text}`)
    .join('\n');

  const result = await generateText({
    model: liteModel,
    system:
      'You create short, descriptive chat conversation titles. Respond with a single sentence (max 12 words). Do not include quotation marks.',
    prompt: `Conversation transcript:\n${conversationText}\n\nProvide only the title.`,
  });

  const directText = result.text?.trim();
  if (directText) {
    return directText;
  }

  const contentText = result.content
    ?.map((part) => ('text' in part && typeof part.text === 'string' ? part.text : ''))
    .join('')
    .trim();

  return contentText ?? null;
}

export function normalizeGeneratedTitle(raw: string | null | undefined): string | null {
  if (!raw) return null;

  let title = raw.trim();

  if (!title) {
    return null;
  }

  title = title.replace(/^['"`]+|['"`]+$/g, '');
  title = title.replace(/\s+/g, ' ');

  const words = title.split(' ').filter(Boolean).slice(0, 12);
  title = words.join(' ');

  if (!title) {
    return null;
  }

  title = title.charAt(0).toUpperCase() + title.slice(1);

  if (!/[.!?]$/.test(title)) {
    title = `${title}.`;
  }

  if (title.length > 96) {
    title = `${title.slice(0, 93).trimEnd()}...`;
  }

  return title;
}

export const __internal = {
  normalizeTranscript,
  extractPlainText,
};
