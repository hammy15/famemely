import { View, Text } from 'react-native';
import type { ChatMessage } from '@/types';
import { formatRelativeTime, getInitials } from '@/lib/utils';

interface ChatBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
}

export default function ChatBubble({ message, isOwnMessage }: ChatBubbleProps) {
  return (
    <View
      className={`flex-row mb-3 ${
        isOwnMessage ? 'justify-end' : 'justify-start'
      }`}
    >
      {!isOwnMessage && (
        <View className="w-8 h-8 rounded-full bg-gray-700 items-center justify-center mr-2">
          <Text className="text-white text-xs font-bold">
            {getInitials(message.senderName)}
          </Text>
        </View>
      )}

      <View className={`max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        {!isOwnMessage && (
          <Text className="text-gray-400 text-xs mb-1">
            {message.senderName}
          </Text>
        )}
        <View
          className={`px-4 py-2 rounded-2xl ${
            isOwnMessage
              ? 'bg-primary-500 rounded-br-sm'
              : 'bg-gray-700 rounded-bl-sm'
          }`}
        >
          <Text className={isOwnMessage ? 'text-white' : 'text-gray-200'}>
            {message.message}
          </Text>
        </View>
        <Text className="text-gray-500 text-xs mt-1">
          {message.timestamp ? formatRelativeTime(message.timestamp) : 'Just now'}
        </Text>
      </View>

      {isOwnMessage && (
        <View className="w-8 h-8 rounded-full bg-primary-500 items-center justify-center ml-2">
          <Text className="text-white text-xs font-bold">
            {getInitials(message.senderName)}
          </Text>
        </View>
      )}
    </View>
  );
}
