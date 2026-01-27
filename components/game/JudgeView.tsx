import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useGameStore } from '@/stores/gameStore';
import type { PlayerInfo, Submission } from '@/types';

interface JudgeViewProps {
  submissions: Record<string, Submission>;
  players: PlayerInfo[];
}

export default function JudgeView({ submissions, players }: JudgeViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { selectWinner, isLoading } = useGameStore();

  const submissionEntries = Object.entries(submissions);

  const handleSelectWinner = async () => {
    if (!selectedId) {
      Alert.alert('Select a winner', 'Please tap on the winning meme');
      return;
    }

    try {
      await selectWinner(selectedId);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to select winner');
    }
  };

  if (submissionEntries.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <MaterialCommunityIcons name="image-off" size={64} color="#6b7280" />
        <Text className="text-gray-400 mt-4">No submissions yet</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <Text className="text-white font-bold text-lg mb-4 text-center">
        Pick the Winning Meme!
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {submissionEntries.map(([playerId, submission]) => (
          <TouchableOpacity
            key={playerId}
            className={`mr-4 rounded-2xl overflow-hidden ${
              selectedId === playerId
                ? 'border-4 border-primary-500'
                : 'border-4 border-transparent'
            }`}
            onPress={() => setSelectedId(playerId)}
            style={{ width: 280, height: 320 }}
          >
            <Image
              source={{ uri: submission.finalImageUrl }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
            {selectedId === playerId && (
              <View className="absolute top-2 right-2 bg-primary-500 rounded-full p-2">
                <MaterialCommunityIcons name="check" size={20} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text className="text-gray-400 text-center text-sm mt-4 mb-4">
        Swipe to see all submissions ({submissionEntries.length} total)
      </Text>

      <TouchableOpacity
        className={`bg-primary-500 py-4 rounded-xl mx-4 ${
          !selectedId || isLoading ? 'opacity-50' : ''
        }`}
        onPress={handleSelectWinner}
        disabled={!selectedId || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-center font-bold text-lg">
            Select as Winner
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
