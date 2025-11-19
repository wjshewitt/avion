import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface DeleteConversationParams {
  conversationId: string;
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, DeleteConversationParams>({
    mutationFn: async ({ conversationId }: DeleteConversationParams) => {
      const response = await fetch(`/api/chat/conversations/${conversationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete conversation');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate conversation list to trigger refetch
      queryClient.invalidateQueries({
        queryKey: ['general-conversations'],
      });

      // Remove the specific conversation from cache
      queryClient.invalidateQueries({
        queryKey: ['conversation-messages', variables.conversationId],
      });

      toast.success('Conversation deleted');
    },
    onError: (error) => {
      console.error('Failed to delete conversation:', error);
      toast.error('Failed to delete conversation', {
        description: error.message,
      });
    },
  });
}
