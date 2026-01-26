import { create } from 'zustand';
import type { ChatMessage } from '@/types';
import { sendMessage, subscribeToChat } from '@/lib/firebase';

interface ChatState {
  // State
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  unsubscribe: (() => void) | null;

  // Actions
  subscribeToGameChat: (gameId: string) => void;
  sendChatMessage: (gameId: string, senderId: string, senderName: string, message: string) => Promise<void>;
  unsubscribeFromChat: () => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,
  unsubscribe: null,

  subscribeToGameChat: (gameId) => {
    const { unsubscribe: currentUnsubscribe } = get();
    if (currentUnsubscribe) {
      currentUnsubscribe();
    }

    const unsubscribe = subscribeToChat(gameId, (messages) => {
      set({ messages });
    });

    set({ unsubscribe });
  },

  sendChatMessage: async (gameId, senderId, senderName, message) => {
    if (!message.trim()) return;

    set({ isLoading: true, error: null });
    try {
      await sendMessage(gameId, senderId, senderName, message);
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to send message',
        isLoading: false,
      });
      throw error;
    }
  },

  unsubscribeFromChat: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
    }
    set({ unsubscribe: null, messages: [] });
  },

  clearMessages: () => set({ messages: [] }),
}));
