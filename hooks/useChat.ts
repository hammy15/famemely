import { useEffect, useCallback } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';

export function useChat(gameId: string | undefined) {
  const user = useAuthStore((state) => state.user);
  const {
    messages,
    isLoading,
    error,
    subscribeToGameChat,
    sendChatMessage,
    unsubscribeFromChat,
  } = useChatStore();

  useEffect(() => {
    if (gameId) {
      subscribeToGameChat(gameId);
    }
    return () => unsubscribeFromChat();
  }, [gameId]);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!user || !gameId) return;
      await sendChatMessage(gameId, user.id, user.displayName, message);
    },
    [user, gameId, sendChatMessage]
  );

  return {
    messages,
    isLoading,
    error,
    sendMessage,
  };
}
