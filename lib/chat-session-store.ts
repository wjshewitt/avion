import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ChatSessionState {
  activeConversationId: string | null;
  lastConversationId: string | null;
  setActiveConversationId: (conversationId: string | null) => void;
  setLastConversationId: (conversationId: string | null) => void;
}

export const useChatSessionStore = create<ChatSessionState>()(
  persist(
    (set, get) => ({
      activeConversationId: null,
      lastConversationId: null,
      setActiveConversationId: (conversationId) => {
        const current = get().activeConversationId;
        if (conversationId !== current) {
          set({ activeConversationId: conversationId, lastConversationId: current });
        }
      },
      setLastConversationId: (conversationId) => {
        set({ lastConversationId: conversationId });
      },
    }),
    {
      name: 'chat-session-state',
      partialize: (state) => ({
        activeConversationId: state.activeConversationId,
        lastConversationId: state.lastConversationId,
      }),
    }
  )
);
