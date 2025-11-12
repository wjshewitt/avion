/**
 * Premium Chat - UI State Management Hook
 * Uses TanStack Query mutations for server state
 */

"use client";

import { useState, useCallback, useRef } from "react";
import { useSendMessage } from "@/lib/tanstack/hooks/useSendMessage";

export interface UsePremiumChatOptions {
  conversationId: string | null;
  onError?: (error: Error) => void;
  onConversationCreated?: (conversationId: string) => void;
}

export function usePremiumChat(options: UsePremiumChatOptions) {
  const { conversationId, onError, onConversationCreated } = options;
  
  // UI state only (not message state - that's in TanStack Query)
  const [input, setInput] = useState("");
  
  // Server mutation with optimistic updates
  const sendMessageMutation = useSendMessage();
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (content?: string) => {
    const messageContent = content || input.trim();
    
    if (!messageContent || sendMessageMutation.isPending) return;
    
    // Clear input immediately for better UX
    setInput("");
    
    // Cancel previous request if still pending
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    
    try {
      const result = await sendMessageMutation.mutateAsync({
        conversationId,
        content: messageContent,
      });
      
      // If new conversation was created, notify parent
      if (!conversationId && result.conversationId && onConversationCreated) {
        onConversationCreated(result.conversationId);
      }
      
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      
      const error = err instanceof Error ? err : new Error("Unknown error");
      
      // Restore input so user can retry
      setInput(messageContent);
      
      // Notify error handler
      onError?.(error);
    }
  }, [input, conversationId, sendMessageMutation, onError, onConversationCreated]);

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
    sendMessageMutation.reset();
  }, [sendMessageMutation]);

  const clearError = useCallback(() => {
    sendMessageMutation.reset();
  }, [sendMessageMutation]);

  return {
    input,
    setInput,
    sendMessage,
    stopStreaming,
    clearError,
    
    // Derived state from mutation
    isStreaming: sendMessageMutation.isPending,
    isThinking: sendMessageMutation.isPending,
    error: sendMessageMutation.error?.message || null,
  };
}
