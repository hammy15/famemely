import { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ChatInputProps {
  onSend: (message: string) => Promise<void>;
  isLoading?: boolean;
}

export default function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const text = message.trim();
    setMessage('');
    await onSend(text);
  };

  return (
    <View className="flex-row items-center px-4 py-2 bg-gray-800 border-t border-gray-700">
      <View className="flex-1 flex-row items-center bg-gray-700 rounded-full px-4 py-2">
        <TextInput
          className="flex-1 text-white"
          placeholder="Type a message..."
          placeholderTextColor="#6b7280"
          value={message}
          onChangeText={setMessage}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          blurOnSubmit={false}
        />
      </View>

      <TouchableOpacity
        className={`ml-2 w-10 h-10 rounded-full items-center justify-center ${
          message.trim() ? 'bg-primary-500' : 'bg-gray-700'
        }`}
        onPress={handleSend}
        disabled={!message.trim() || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Ionicons
            name="send"
            size={18}
            color={message.trim() ? '#fff' : '#6b7280'}
          />
        )}
      </TouchableOpacity>
    </View>
  );
}
