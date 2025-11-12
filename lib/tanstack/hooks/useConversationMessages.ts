/**
 * React Query hook for managing conversation messages
 */

import { useQuery } from '@tanstack/react-query';

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokens_used: Record<string, any> | null;
  created_at: string;
  thinking_content?: string;
  thinking_tokens?: number;
  weather_tool_data?: Array<{
    icao: string;
    metar: any;
    taf: any;
  }> | null;
  airport_tool_data?: Array<{
    icao: string;
    airport: any;
    runways?: any;
    navigation?: any;
    communications?: any;
    suitability?: any;
  }> | null;
}

export interface ConversationMessagesResult {
  messages: ConversationMessage[];
  notFound: boolean;
}

/**
 * Fetch all messages for a specific conversation
 * Immutable caching - messages never change unless user sends new message
 */
export function useConversationMessages(conversationId: string | null) {
  return useQuery<ConversationMessagesResult>({
    queryKey: ['conversation-messages', conversationId],
    queryFn: async () => {
      if (!conversationId) {
        return { messages: [], notFound: false };
      }

      const response = await fetch(`/api/chat/conversations/${conversationId}/messages`);

      if (response.status === 404) {
        return { messages: [], notFound: true };
      }

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const data = await response.json();
      return {
        messages: data.messages as ConversationMessage[],
        notFound: false
      };
    },
    enabled: !!conversationId,
    staleTime: Infinity, // Never stale - messages are immutable
    gcTime: 1000 * 60 * 60 * 24, // 24 hours in memory
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    // Always show cached data immediately
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Fetch full conversation details
 */
export function useConversation(conversationId: string | null) {
  return useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      if (!conversationId) return null;
      
      const response = await fetch(`/api/chat/conversations/${conversationId}`);
      
      if (response.status === 404) {
        return null;
      }
      if (!response.ok) {
        throw new Error('Failed to fetch conversation');
      }
      
      return response.json();
    },
    enabled: !!conversationId,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    placeholderData: (previousData) => previousData,
  });
}
