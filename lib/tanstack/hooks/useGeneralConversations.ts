/**
 * React Query hook for managing general chat conversations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ConversationListItem {
  id: string;
  title: string;
  chat_type: 'general' | 'flight';
  message_count: number;
  last_message_preview: string;
  created_at: string;
  updated_at: string;
  pinned?: boolean;
}

/**
 * Fetch all general conversations for the current user
 * Aggressively cached with localStorage persistence - only invalidates on new message/conversation
 */
export function useGeneralConversations() {
  return useQuery({
    queryKey: ['general-conversations'],
    queryFn: async () => {
      const response = await fetch('/api/chat/conversations?type=general');
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      const data = await response.json();
      return data.conversations as ConversationListItem[];
    },
    staleTime: Infinity, // Never mark as stale - only invalidate manually
    gcTime: 1000 * 60 * 60 * 24, // 24 hours in memory
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    // Show cached data immediately, refetch in background only if older than 5 min
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Create a new general conversation
 */
export function useCreateConversation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (title?: string) => {
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chat_type: 'general',
          title: title || 'New Conversation'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate conversations list to refetch
      queryClient.invalidateQueries({ queryKey: ['general-conversations'] });
    },
  });
}

/**
 * Update conversation title
 */
export function useUpdateConversationTitle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const response = await fetch(`/api/chat/conversations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update conversation');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['general-conversations'] });
    },
  });
}

/**
 * Delete a conversation
 */
export function useDeleteConversation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/chat/conversations/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete conversation');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['general-conversations'] });
    },
  });
}

/**
 * Pin/unpin a conversation
 */
export function usePinConversation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, pinned }: { id: string; pinned: boolean }) => {
      const response = await fetch(`/api/chat/conversations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinned }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to pin conversation');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['general-conversations'] });
    },
  });
}
