import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { ChatSurface } from '@/lib/ai/router-types';

type SetConversationOptions = {
  markAsLinked?: boolean;
};

interface ChatSessionState {
  mainConversationId: string | null;
  sidebarConversationId: string | null;
  lastLinkedConversationId: string | null;
  setConversationId: (surface: ChatSurface, conversationId: string | null, options?: SetConversationOptions) => void;
  linkSurfaces: (conversationId: string) => void;
  rememberLinkedConversation: (conversationId: string | null) => void;
}

export const useChatSessionStore = create<ChatSessionState>()(
  persist(
    (set, get) => ({
      mainConversationId: null,
      sidebarConversationId: null,
      lastLinkedConversationId: null,
      setConversationId: (surface, conversationId, options) => {
        const key = surface === 'main' ? 'mainConversationId' : 'sidebarConversationId';
        const nextState: Partial<ChatSessionState> = {
          [key]: conversationId,
        };

        if (options?.markAsLinked) {
          nextState.lastLinkedConversationId = conversationId;
        }

        set(nextState as Partial<ChatSessionState>);
      },
      linkSurfaces: (conversationId) => {
        set({
          mainConversationId: conversationId,
          sidebarConversationId: conversationId,
          lastLinkedConversationId: conversationId,
        });
      },
      rememberLinkedConversation: (conversationId) => {
        if (!conversationId) return;
        if (get().lastLinkedConversationId === conversationId) {
          return;
        }
        set({ lastLinkedConversationId: conversationId });
      },
    }),
    {
      name: 'chat-session-state',
      partialize: (state) => ({
        mainConversationId: state.mainConversationId,
        sidebarConversationId: state.sidebarConversationId,
        lastLinkedConversationId: state.lastLinkedConversationId,
      }),
    }
  )
);
