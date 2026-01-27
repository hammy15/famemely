import { create } from 'zustand';
import type { ChatMessage } from '@/types';
import { DEMO_MODE, MOCK_CHAT_MESSAGES, mockDelay } from '@/lib/mock';
import { Timestamp } from 'firebase/firestore';

// Only import Firebase if not in demo mode
let firebaseFunctions: any = null;
if (!DEMO_MODE) {
  firebaseFunctions = require('@/lib/firebase');
}

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

    if (DEMO_MODE) {
      // Use mock chat messages in demo mode
      setTimeout(() => {
        set({ messages: MOCK_CHAT_MESSAGES });
      }, 500);
      set({ unsubscribe: () => {} });
      return;
    }

    const unsubscribe = firebaseFunctions.subscribeToChat(gameId, (messages: ChatMessage[]) => {
      set({ messages });
    });

    set({ unsubscribe });
  },

  sendChatMessage: async (gameId, senderId, senderName, message) => {
    if (!message.trim()) return;

    set({ isLoading: true, error: null });

    if (DEMO_MODE) {
      await mockDelay(200);
      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        senderId,
        senderName,
        message,
        timestamp: Timestamp.now(),
      };
      set((state) => ({
        messages: [...state.messages, newMessage],
        isLoading: false,
      }));
      return;
    }

    try {
      await firebaseFunctions.sendMessage(gameId, senderId, senderName, message);
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
