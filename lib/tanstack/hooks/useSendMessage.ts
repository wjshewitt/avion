/**
 * Production-grade message sending with optimistic updates
 * Supports streaming when showThinkingProcess is enabled
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useChatSettings } from '@/lib/chat-settings-store';
import { useRef, useEffect } from 'react';
import type { ConversationMessage } from './useConversationMessages';

interface SendMessageVariables {
  conversationId: string;
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
  abortController: AbortController;
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { showThinkingProcess } = useChatSettings();
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return useMutation<SendMessageResponse, Error, SendMessageVariables, OptimisticContext>({
    mutationFn: async ({ conversationId, content }) => {
      if (!conversationId) {
        throw new Error('Conversation ID is required');
      }

      const streaming = showThinkingProcess;
      
      // Use abort controller from ref for cancellation
      const signal = abortControllerRef.current?.signal;
      
      const response = await fetch('/api/chat/general', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          conversationId,
          streaming,
        }),
        signal, // Pass abort signal to enable cancellation
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to send message');
      }

      // Handle streaming response
      if (streaming && response.body) {
        let accumulatedContent = '';
        let accumulatedThinking = '';
        let thinkingTokens = 0;
        let finalResponse: SendMessageResponse | null = null;
        let toolCalls: any[] = [];
        let weatherData: any[] = [];
        let airportData: any[] = [];
        let lastUpdateTime = 0;
        const UPDATE_THROTTLE_MS = 100; // Throttle UI updates to every 100ms
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        // Check for abort signal
        if (signal?.aborted) {
          reader.cancel();
          throw new Error('Request aborted');
        }
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          // Check for abort during streaming
          if (signal?.aborted) {
            reader.cancel();
            throw new Error('Request aborted');
          }
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              
              if (data === '[DONE]') {
                // Stream finished
                break;
              }
              
              try {
                const parsed = JSON.parse(data);
                
                if (parsed.type === 'thinking') {
                  // Update accumulated thinking
                  accumulatedThinking = parsed.content || '';
                  thinkingTokens = parsed.tokens || 0;
                  
                  // Throttle UI updates - only update every 100ms
                  const now = Date.now();
                  if (now - lastUpdateTime >= UPDATE_THROTTLE_MS) {
                    lastUpdateTime = now;
                    
                    // Update optimistic AI message with thinking
                    queryClient.setQueryData<{ messages: ConversationMessage[]; notFound: boolean }>(
                      ['conversation-messages', conversationId],
                      (old) => {
                        if (!old) return old;
                        
                        const messages = [...old.messages];
                        const lastMsg = messages[messages.length - 1];
                        
                        if (lastMsg && lastMsg.role === 'assistant') {
                          lastMsg.thinking_content = accumulatedThinking;
                          lastMsg.thinking_tokens = thinkingTokens;
                        } else {
                          // Create streaming AI message with thinking
                          messages.push({
                            id: `temp-ai-${Date.now()}`,
                            conversation_id: conversationId,
                            role: 'assistant',
                            content: '',
                            thinking_content: accumulatedThinking,
                            thinking_tokens: thinkingTokens,
                            tokens_used: null,
                            created_at: new Date().toISOString(),
                          });
                        }
                        
                        return { messages, notFound: false };
                      }
                    );
                  }
                } else if (parsed.type === 'content') {
                  // Update accumulated content
                  accumulatedContent = parsed.content || '';
                  
                  // Throttle UI updates - only update every 100ms
                  const now = Date.now();
                  if (now - lastUpdateTime >= UPDATE_THROTTLE_MS) {
                    lastUpdateTime = now;
                    
                    // Update optimistic AI message in cache with streaming content
                    queryClient.setQueryData<{ messages: ConversationMessage[]; notFound: boolean }>(
                      ['conversation-messages', conversationId],
                      (old) => {
                        if (!old) return old;
                        
                        const messages = [...old.messages];
                        const lastMsg = messages[messages.length - 1];
                        
                        // Update last AI message if it exists, otherwise create it
                        if (lastMsg && lastMsg.role === 'assistant') {
                          lastMsg.content = accumulatedContent;
                        } else {
                          // Create streaming AI message
                          messages.push({
                            id: `temp-ai-${Date.now()}`,
                            conversation_id: conversationId,
                            role: 'assistant',
                            content: accumulatedContent,
                            tokens_used: null,
                            created_at: new Date().toISOString(),
                          });
                        }
                        
                        return { messages, notFound: false };
                      }
                    );
                  }
                } else if (parsed.type === 'tool_call') {
                  // Store tool calls
                  toolCalls = parsed.toolCalls || [];
                } else if (parsed.type === 'done') {
                  // Final response with all metadata
                  weatherData = parsed.weatherData || [];
                  airportData = parsed.airportData || [];
                  
                  // Force final update with complete content
                  queryClient.setQueryData<{ messages: ConversationMessage[]; notFound: boolean }>(
                    ['conversation-messages', conversationId],
                    (old) => {
                      if (!old) return old;
                      
                      const messages = [...old.messages];
                      const lastMsg = messages[messages.length - 1];
                      
                      if (lastMsg && lastMsg.role === 'assistant') {
                        lastMsg.content = accumulatedContent;
                        lastMsg.thinking_content = accumulatedThinking || undefined;
                        lastMsg.thinking_tokens = thinkingTokens;
                      }
                      
                      return { messages, notFound: false };
                    }
                  );
                } else if (parsed.type === 'complete') {
                  // Complete metadata
                  finalResponse = {
                    conversationId: parsed.conversationId,
                    message: accumulatedContent,
                    tokensUsed: { input: 0, output: 0 }, // Will be ignored
                    cost: parsed.cost || 0,
                    toolCalls,
                    modelUsed: 'gemini-2.5-flash',
                    weatherData: weatherData.length > 0 ? weatherData : undefined,
                    airportData: airportData.length > 0 ? airportData : undefined,
                  };
                } else if (parsed.type === 'error') {
                  throw new Error(parsed.error || 'Streaming error');
                }
              } catch (e) {
                console.warn('Failed to parse SSE data:', data, e);
              }
            }
          }
        }
        
        if (!finalResponse) {
          throw new Error('Streaming completed without final response');
        }
        
        return finalResponse;
      }

      // Non-streaming response
      return response.json();
    },

    // OPTIMISTIC UPDATE: Add user message immediately (not AI message - it has tool data)
    onMutate: async ({ conversationId, content }) => {
      // Create abort controller for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      
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
        conversation_id: conversationId,
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
      return { previousMessages, optimisticUserMessage, abortController };
    },

    // ON SUCCESS: Refetch with complete tool data from server
    onSuccess: async (data) => {
      const { conversationId, weatherData, airportData } = data;

      // Only refetch if there's tool data (weather/airport cards need proper formatting)
      // For simple text responses, streaming already has everything
      const hasToolData = (weatherData && weatherData.length > 0) || (airportData && airportData.length > 0);
      
      if (hasToolData) {
        // Small delay to ensure DB write completes for tool data
        await new Promise(resolve => setTimeout(resolve, 150));
        
        // Invalidate to fetch real messages from server with tool data
        queryClient.invalidateQueries({
          queryKey: ['conversation-messages', conversationId],
          refetchType: 'active',
        });
      }

      // Always update conversations list (last message preview, timestamp)
      queryClient.invalidateQueries({
        queryKey: ['general-conversations'],
      });
    },

    // ON ERROR: Rollback optimistic user message
    onError: (error, variables, context) => {
      // Cleanup abort controller
      abortControllerRef.current = null;
      
      if (context?.previousMessages) {
        queryClient.setQueryData(
          ['conversation-messages', variables.conversationId],
          context.previousMessages
        );
      }
    },
    
    // ON SETTLE: Cleanup
    onSettled: () => {
      abortControllerRef.current = null;
    },

    // ON ERROR: Already handled in onError callback above
    // No need for onSettled - onSuccess handles the success case
    // and we don't want to invalidate on errors (rollback handles that)
  });
}
