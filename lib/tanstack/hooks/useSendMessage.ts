/**
 * Production-grade message sending with optimistic updates
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ConversationMessage } from './useConversationMessages';

interface SendMessageVariables {
  conversationId: string | null;
  content: string;
}

interface SendMessageResponse {
  conversationId: string;
  message: string;
  tokensUsed: {
    input: number;
    output: number;
    thinking?: number;
  };
  cost: number;
  toolCalls?: Array<{ name: string; args: any }>;
  modelUsed: string;
  weatherData?: any;
  airportData?: any;
}

interface OptimisticContext {
  previousMessages?: { messages: ConversationMessage[]; notFound: boolean };
  optimisticUserMessage: ConversationMessage;
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation<SendMessageResponse, Error, SendMessageVariables, OptimisticContext>({
    mutationFn: async ({ conversationId, content }) => {
      const response = await fetch('/api/chat/general', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          conversationId,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to send message');
      }

      return response.json();
    },

    // OPTIMISTIC UPDATE: Add user message immediately (not AI message - it has tool data)
    onMutate: async ({ conversationId, content }) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({
        queryKey: ['conversation-messages', conversationId],
      });

      // Snapshot previous messages for rollback
      const previousMessages = queryClient.getQueryData<{ messages: ConversationMessage[]; notFound: boolean }>(
        ['conversation-messages', conversationId]
      );

      // Create optimistic user message ONLY
      // Don't create AI message - it needs tool data from backend
      const optimisticUserMessage: ConversationMessage = {
        id: `temp-user-${Date.now()}`,
        conversation_id: conversationId || 'temp',
        role: 'user',
        content,
        tokens_used: null,
        created_at: new Date().toISOString(),
      };

      // Optimistically update cache with user message only
      queryClient.setQueryData<{ messages: ConversationMessage[]; notFound: boolean }>(
        ['conversation-messages', conversationId],
        (old) => ({
          messages: [
            ...(old?.messages || []),
            optimisticUserMessage,
          ],
          notFound: false,
        })
      );

      // Return context for rollback
      return { previousMessages, optimisticUserMessage };
    },

    // ON SUCCESS: Wait for DB write, then refetch with complete tool data
    onSuccess: async (data, variables, context) => {
      const { conversationId } = data;

      // Wait 500ms for database write to complete (includes tool data)
      await new Promise(resolve => setTimeout(resolve, 500));

      // Invalidate to fetch real messages from server with tool data
      queryClient.invalidateQueries({
        queryKey: ['conversation-messages', conversationId],
        refetchType: 'active', // Refetch immediately
      });

      // Update conversations list (last message preview, timestamp)
      queryClient.invalidateQueries({
        queryKey: ['general-conversations'],
      });
    },

    // ON ERROR: Rollback optimistic user message
    onError: (error, variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          ['conversation-messages', variables.conversationId],
          context.previousMessages
        );
      }
    },

    // ALWAYS: Ensure cache consistency
    onSettled: (data, error, variables) => {
      // Final refetch to ensure consistency
      const finalConversationId = data?.conversationId || variables.conversationId;
      if (finalConversationId) {
        queryClient.invalidateQueries({
          queryKey: ['conversation-messages', finalConversationId],
        });
      }
    },
  });
}
