"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useQueryClient } from '@tanstack/react-query';

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
  useEffect(() => {
    conversationIdRef.current = conversationId ?? null;
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
        conversationId: conversationIdRef.current,
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
  
  // 🔧 FIX: Track hydration state to prevent race conditions
  const [lastHydratedConvId, setLastHydratedConvId] = useState<string | null>(null);
  const [isHydrating, setIsHydrating] = useState(false);

  const {
    messages,
    setMessages,
    sendMessage: sendChatMessage,
    stop,
    status,
    error,
    clearError,
  } = useChat<FlightChatMessage>({
    id: conversationId ?? undefined,
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
      const metaConversationId = event.message.metadata?.conversationId;
      if (metaConversationId && metaConversationId !== conversationIdRef.current) {
        conversationIdRef.current = metaConversationId;
        onConversationCreated?.(metaConversationId);
      }

      const metadataInfo = extractProviderInfo(event.message.metadata as FlightChatMetadata | undefined);
      if (metadataInfo) {
        setProviderInfo(metadataInfo);
      }

      setMessages((current) =>
        current.map((msg) =>
          msg.id === event.message.id
            ? cloneMessageWithTimestamp(
                withMetadata(msg, { conversationId: conversationIdRef.current ?? metaConversationId ?? '' }),
                new Date()
              )
            : msg
        )
      );
      
      // 🔧 FIX: Invalidate queries after database save completes
      const finalConvId = conversationIdRef.current ?? metaConversationId;
      if (finalConvId) {
        // Use setTimeout to ensure database write completes first
        setTimeout(() => {
          console.log('🔄 Invalidating queries for conversation:', finalConvId);
          
          queryClient.invalidateQueries({
            queryKey: ['conversation-messages', finalConvId]
          });
          
          queryClient.invalidateQueries({
            queryKey: ['general-conversations']
          });
        }, 500);  // 500ms delay for database write
      }
    },
  });

  const { data: conversationData } = useConversationMessages(conversationId);
  const dbMessages = useMemo(() => conversationData?.messages ?? [], [conversationData?.messages]);

  const mergeHydratedMessages = useCallback((hydratedMessages: FlightChatMessage[]) => {
    setMessages((current) => {
      const incoming = new Map(hydratedMessages.map((msg) => [msg.id, msg]));
      const next = current.map((msg) => {
        if (!msg.id) return msg;
        const replacement = incoming.get(msg.id);
        if (!replacement) return msg;
        incoming.delete(msg.id);
        return replacement;
      });

      incoming.forEach((msg) => next.push(msg));

      next.sort((a, b) => {
        const aTime = a.createdAt ? a.createdAt.getTime() : 0;
        const bTime = b.createdAt ? b.createdAt.getTime() : 0;
        return aTime - bTime;
      });

      return next;
    });
  }, [setMessages]);

  // 🔧 FIX: Smarter hydration logic to prevent race conditions
  useEffect(() => {
    // Clear messages when no conversation
    if (!conversationId) {
      if (messages.length > 0 || lastHydratedConvId !== null) {
        setMessages([]);
        setLastHydratedConvId(null);
      }
      return;
    }

    // 🔧 FIX: Never hydrate while streaming
    if (status === 'streaming' || status === 'submitted') {
      return;
    }

    // 🔧 FIX: Only hydrate once per conversation or when conversation changes
    if (conversationId === lastHydratedConvId && !isHydrating) {
      return;  // Already hydrated this conversation, trust useChat state
    }

    // 🔧 FIX: Only hydrate if we have database messages
    if (dbMessages.length === 0) {
      if (conversationId !== lastHydratedConvId) {
        setLastHydratedConvId(conversationId);
      }
      return;
    }

    // Perform hydration
    const hydratedMessages = dbMessages.map(mapConversationMessageToFlightChatMessage);
    
    console.log('🔄 Hydrating messages:', {
      conversationId,
      dbCount: dbMessages.length,
      uiCount: messages.length,
      lastHydrated: lastHydratedConvId,
    });

    mergeHydratedMessages(hydratedMessages);
    setLastHydratedConvId(conversationId);
    setIsHydrating(false);
    
  }, [dbMessages, conversationId, status, lastHydratedConvId, isHydrating, mergeHydratedMessages]);
  // 🔧 FIX: Removed 'messages' and 'setMessages' from deps to prevent loops

  const isResponseStreaming = status === 'streaming';
  const isThinkingState = status === 'submitted';
  const isStreaming = isResponseStreaming || isThinkingState;

  // 🔧 FIX: Handle conversation switching
  useEffect(() => {
    // When conversation ID changes, mark for re-hydration
    if (conversationId !== conversationIdRef.current) {
      console.log('🔄 Conversation switched:', {
        from: conversationIdRef.current,
        to: conversationId,
      });
      
      // Mark that we need to hydrate this new conversation
      setIsHydrating(true);
      setLastHydratedConvId(null);
    }
  }, [conversationId]);

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
