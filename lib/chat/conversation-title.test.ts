import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateText } from 'ai';

import { generateConversationTitle, normalizeGeneratedTitle } from './conversation-title';

vi.mock('ai', () => ({
  generateText: vi.fn(),
}));

const baseConversation = {
  id: 'conv-1',
  flight_id: null,
  user_id: 'user-1',
  title: null,
  chat_type: 'general' as const,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const baseMessages = [
  {
    id: 'msg-1',
    conversation_id: 'conv-1',
    role: 'user' as const,
    content: 'Need the latest weather at EGLL',
    text_content: 'Need the latest weather at EGLL',
    tokens_used: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'msg-2',
    conversation_id: 'conv-1',
    role: 'assistant' as const,
    content: 'Here is the METAR and TAF.',
    text_content: 'Here is the METAR and TAF.',
    tokens_used: null,
    created_at: new Date().toISOString(),
  },
];

function createMockSupabase({ conversation = baseConversation, messages = baseMessages }: any) {
  let storedConversation = { ...conversation };
  return {
    from(table: string) {
      if (table === 'chat_conversations') {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({ data: storedConversation, error: null }),
            }),
          }),
          update: (payload: any) => ({
            eq: async () => {
              storedConversation = { ...storedConversation, ...payload };
              return { data: storedConversation, error: null };
            },
          }),
        };
      }

      if (table === 'chat_messages') {
        return {
          select: () => ({
            eq: () => ({
              order: () => ({
                limit: async () => ({ data: [...messages], error: null }),
              }),
            }),
          }),
        };
      }

      throw new Error(`Unexpected table ${table}`);
    },
  } as any;
}

beforeEach(() => {
  vi.mocked(generateText).mockReset();
});

describe('normalizeGeneratedTitle', () => {
  it('capitalizes and trims the generated text', () => {
    expect(normalizeGeneratedTitle('  weather briefing for egll  ')).toBe('Weather briefing for egll.');
  });

  it('limits to 12 words', () => {
    const title = normalizeGeneratedTitle('one two three four five six seven eight nine ten eleven twelve thirteen fourteen');
    expect(title?.split(' ').length).toBeLessThanOrEqual(12);
  });
});

describe('generateConversationTitle', () => {
  it('updates the conversation title when eligible', async () => {
    vi.mocked(generateText).mockResolvedValue({ text: 'Weather briefing for EGLL mission' });
    const supabase = createMockSupabase({});

    const result = await generateConversationTitle({
      supabase,
      conversationId: 'conv-1',
      userId: 'user-1',
    });

    expect(result.updated).toBe(true);
    expect(result.title).toBe('Weather briefing for EGLL mission.');
  });

  it('skips when conversation already has custom title', async () => {
    const supabase = createMockSupabase({
      conversation: { ...baseConversation, title: 'Custom Title' },
    });

    const result = await generateConversationTitle({
      supabase,
      conversationId: 'conv-1',
      userId: 'user-1',
    });

    expect(result.updated).toBe(false);
    expect(result.reason).toBe('custom_title');
  });

  it('skips when insufficient messages exist', async () => {
    const supabase = createMockSupabase({ messages: baseMessages.slice(0, 1) });

    const result = await generateConversationTitle({
      supabase,
      conversationId: 'conv-1',
      userId: 'user-1',
    });

    expect(result.updated).toBe(false);
    expect(result.reason).toBe('insufficient_messages');
  });
});
