import { useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';

interface GameChatProps {
  gameId: string;
  onClose: () => void;
}

export default function GameChat({ gameId, onClose }: GameChatProps) {
  const user = useAuthStore((state) => state.user);
  const { messages, sendChatMessage, isLoading } = useChatStore();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = async (message: string) => {
    if (!user) return;
    await sendChatMessage(gameId, user.id, user.displayName, message);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-900"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
        <Text className="text-white font-bold text-lg">Game Chat</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        className="flex-1 px-4 pt-4"
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatBubble
            message={item}
            isOwnMessage={item.senderId === user?.id}
          />
        )}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="chatbubbles-outline" size={48} color="#4b5563" />
            <Text className="text-gray-500 mt-4">No messages yet</Text>
            <Text className="text-gray-600 text-sm">
              Be the first to say something!
            </Text>
          </View>
        }
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: false })
        }
      />

      {/* Input */}
      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </KeyboardAvoidingView>
  );
}
