"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';

import {
  cloneMessageWithTimestamp,
  mapConversationMessageToFlightChatMessage,
  withMetadata,
  type FlightChatMessage,
  type FlightChatMetadata,
} from '@/lib/chat/messages';
import { useConversationMessages } from '@/lib/tanstack/hooks/useConversationMessages';
import { useChatSettings } from '@/lib/chat-settings-store';
import { usePageContextStore } from '@/lib/context/page-context-store';
import type { ChatSurface } from '@/lib/ai/router-types';

export interface UsePremiumChatOptions {
  conversationId: string | null;
  onConversationCreated?: (conversationId: string) => void;
  onError?: (error: Error) => void;
  surface?: ChatSurface;
}

export function usePremiumChat(options: UsePremiumChatOptions) {
  const { conversationId, onConversationCreated, onError, surface = 'main' } = options;

  const queryClient = useQueryClient();
  const conversationIdRef = useRef<string | null>(conversationId ?? null);
  
  // Client-side ID generation for new chats
  const [generatedConversationId, setGeneratedConversationId] = useState<string | null>(null);

  useEffect(() => {
    conversationIdRef.current = conversationId ?? null;
    // If conversationId becomes null (new chat), generate a new UUID immediately
    if (!conversationId) {
      const newId = uuidv4();
      setGeneratedConversationId(newId);
      conversationIdRef.current = newId;
    } else {
      setGeneratedConversationId(null);
    }
  }, [conversationId]);

  // ✅ Get chat mode from settings
  const { currentMode, useSimpleChat, selectedModel } = useChatSettings();
  const effectiveMode = useSimpleChat ? null : currentMode;
  
  // ✅ Get page context for context-aware chat
  const { context: pageContext, contextEnabled } = usePageContextStore();

  const transport = useMemo(() => {
    return new DefaultChatTransport<FlightChatMessage>({
      api: '/api/chat/general',
      body: () => ({ 
        conversationId: conversationIdRef.current, // Use the ref which might have the generated ID
        mode: effectiveMode,
        selectedModel,
        pageContext: contextEnabled ? pageContext : null,
        surface,
      }),
    });
  }, [effectiveMode, selectedModel, pageContext, contextEnabled, surface]);

  const [input, setInput] = useState('');
  const [missingCredentials, setMissingCredentials] = useState<MissingCredentialsType>(null);
  const [providerInfo, setProviderInfo] = useState<ProviderInfo | null>(null);
  
  const { data: conversationData, isLoading: isLoadingMessages } = useConversationMessages(conversationId);
  const dbMessages = useMemo(() => conversationData?.messages ?? [], [conversationData?.messages]);

  const initialMessages = useMemo(() => {
    if (!conversationId) return [];
    return dbMessages.map(mapConversationMessageToFlightChatMessage);
  }, [conversationId, dbMessages]);

  const {
    messages,
    setMessages,
    sendMessage: sendChatMessage,
    stop,
    status,
    error,
    clearError,
  } = useChat<FlightChatMessage>({
    id: conversationId ?? generatedConversationId ?? undefined,
    // @ts-expect-error - initialMessages property exists in UseChatOptions but TS is confused
    initialMessages: conversationId ? initialMessages : [],
    transport,
    onError: (err) => {
      const message = err?.message ?? '';

      const missingType = detectMissingCredentials(message);
      if (missingType) {
        setMissingCredentials(missingType);
        return;
      }

      console.error('❌ Chat error:', err);
      onError?.(err);
    },
    onFinish: (event) => {
      setMissingCredentials(null);
      
      // Determine the final conversation ID
      const currentId = conversationIdRef.current;
      
      // If we just created a new chat with a generated ID, notify parent
      if (generatedConversationId && currentId === generatedConversationId) {
        onConversationCreated?.(generatedConversationId);
        setGeneratedConversationId(null); // Clear it as it's now "real"
      }

      const metadataInfo = extractProviderInfo(event.message.metadata as FlightChatMetadata | undefined);
      if (metadataInfo) {
        setProviderInfo(metadataInfo);
      }

      // 🔧 FIX: Invalidate queries after database save completes
      if (currentId) {
        // Use setTimeout to ensure database write completes first
        setTimeout(() => {
          console.log('🔄 Invalidating queries for conversation:', currentId);
          
          queryClient.invalidateQueries({
            queryKey: ['conversation-messages', currentId]
          });
          
          queryClient.invalidateQueries({
            queryKey: ['general-conversations']
          });
        }, 500);  // 500ms delay for database write
      }
    },
  });

  // Reset messages when switching conversations to prevent "ghosting"
  useEffect(() => {
    if (conversationId && !isLoadingMessages && initialMessages.length > 0) {
        // Only force update if we are not streaming/submitting
        if (status !== 'streaming' && status !== 'submitted') {
             setMessages(initialMessages);
        }
    } else if (!conversationId) {
        // New chat
        if (status !== 'streaming' && status !== 'submitted') {
            setMessages([]);
        }
    }
  }, [conversationId, initialMessages, isLoadingMessages, setMessages, status]);

  const isResponseStreaming = status === 'streaming';
  const isThinkingState = status === 'submitted';
  const isStreaming = isResponseStreaming || isThinkingState;

  useEffect(() => {
    const latestAssistant = [...messages]
      .reverse()
      .find((msg) => msg.role === 'assistant' && msg.metadata);

    if (latestAssistant?.metadata) {
      const metadataInfo = extractProviderInfo(latestAssistant.metadata);
      if (metadataInfo && !providerInfoEquals(providerInfo, metadataInfo)) {
        setProviderInfo(metadataInfo);
      }
      return;
    }

    if (providerInfo !== null) {
      setProviderInfo(null);
    }
  }, [messages, providerInfo]);

  const handleInputChange = useCallback((value: string) => {
    setInput(value);
  }, []);

  const submitMessage = useCallback(
    async (content?: string) => {
      const text = (content ?? input ?? '').trim();
      if (!text || isStreaming || missingCredentials) {
        return;
      }

      setInput('');

      await sendChatMessage({
        parts: [{ type: 'text', text }],
        metadata: conversationIdRef.current
          ? { conversationId: conversationIdRef.current }
          : undefined,
      });
    },
    [input, isStreaming, missingCredentials, sendChatMessage]
  );

  const handleSubmit = useCallback(
    async (event?: { preventDefault?: () => void }) => {
      event?.preventDefault?.();
      await submitMessage();
    },
    [submitMessage]
  );

  const append = useCallback(
    async ({ content }: { role: 'user'; content: string }) => {
      await submitMessage(content);
    },
    [submitMessage]
  );

  return {
    messages,
    input,
    setInput: handleInputChange,
    handleInputChange: (event: ChangeEvent<HTMLTextAreaElement>) => {
      handleInputChange(event.target.value);
    },
    handleSubmit,
    sendMessage: submitMessage,
    append,
    stopStreaming: () => {
      void stop();
    },
    isStreaming,
    isThinking: isThinkingState,
    isResponseStreaming,
    error: error?.message ?? null,
    clearError: () => {
      clearError();
    },
    setMessages,
    missingApiKey: missingCredentials !== null,
    missingCredentials,
    providerInfo,
  };
}

type MissingCredentialsType = 'gemini' | 'vertex' | null;

type ProviderInfo = {
  provider: 'gemini' | 'vertex';
  model?: string;
  supportsThinking?: boolean;
};

function detectMissingCredentials(message: string): MissingCredentialsType {
  if (!message) return null;

  const normalized = message.toLowerCase();
  if (normalized.includes('missing_vertex_credentials')) {
    return 'vertex';
  }
  if (normalized.includes('missing_gemini_api_key') || normalized.includes('missing_api_key')) {
    return 'gemini';
  }

  try {
    const parsed = JSON.parse(message);
    if (parsed?.error === 'missing_vertex_credentials') {
      return 'vertex';
    }
    if (parsed?.error === 'missing_gemini_api_key' || parsed?.error === 'missing_api_key') {
      return 'gemini';
    }
  } catch {
    // ignore JSON parse errors
  }

  return null;
}

function extractProviderInfo(metadata?: FlightChatMetadata | null): ProviderInfo | null {
  if (!metadata || !metadata.provider) {
    return null;
  }

  if (metadata.provider !== 'gemini' && metadata.provider !== 'vertex') {
    return null;
  }

  return {
    provider: metadata.provider,
    model: metadata.model,
    supportsThinking: metadata.supportsThinking,
  };
}

function providerInfoEquals(a: ProviderInfo | null, b: ProviderInfo | null): boolean {
  if (a === b) {
    return true;
  }

  if (!a || !b) {
    return false;
  }

  return (
    a.provider === b.provider &&
    a.model === b.model &&
    a.supportsThinking === b.supportsThinking
  );
}
