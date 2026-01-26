import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { useGameStore } from '@/stores/gameStore';

export default function PlayScreen() {
  const [joinCode, setJoinCode] = useState('');
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const { createNewGame, joinGameById, isLoading } = useGameStore();

  const handleCreateGame = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a game');
      return;
    }

    try {
      const gameId = await createNewGame(user.id);
      router.push(`/game/lobby/${gameId}`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create game');
    }
  };

  const handleJoinGame = async () => {
    if (!joinCode.trim()) {
      Alert.alert('Error', 'Please enter a game code');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to join a game');
      return;
    }

    try {
      // For now, use the code as the game ID
      // In production, you'd look up the game by code
      await joinGameById(joinCode.toUpperCase(), user.id);
      router.push(`/game/lobby/${joinCode.toUpperCase()}`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to join game');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1 px-4 py-6">
        {/* Header */}
        <View className="items-center mb-8">
          <MaterialCommunityIcons name="sword-cross" size={64} color="#22c55e" />
          <Text className="text-white text-3xl font-bold mt-4">
            Meme Battle
          </Text>
          <Text className="text-gray-400 text-center mt-2">
            Create or join a game to start the fun!
          </Text>
        </View>

        {/* Tab Selector */}
        <View className="flex-row bg-gray-800 rounded-xl p-1 mb-6">
          <TouchableOpacity
            className={`flex-1 py-3 rounded-lg ${
              activeTab === 'create' ? 'bg-primary-500' : ''
            }`}
            onPress={() => setActiveTab('create')}
          >
            <Text
              className={`text-center font-bold ${
                activeTab === 'create' ? 'text-white' : 'text-gray-400'
              }`}
            >
              Create Game
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 rounded-lg ${
              activeTab === 'join' ? 'bg-primary-500' : ''
            }`}
            onPress={() => setActiveTab('join')}
          >
            <Text
              className={`text-center font-bold ${
                activeTab === 'join' ? 'text-white' : 'text-gray-400'
              }`}
            >
              Join Game
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'create' ? (
          <View className="flex-1">
            {/* Create Game Options */}
            <View className="bg-gray-800 rounded-2xl p-4 mb-4">
              <Text className="text-white font-bold text-lg mb-4">
                Game Settings
              </Text>

              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-gray-300">Rounds</Text>
                <View className="flex-row items-center bg-gray-700 rounded-lg">
                  <TouchableOpacity className="px-4 py-2">
                    <Text className="text-white">-</Text>
                  </TouchableOpacity>
                  <Text className="text-white font-bold px-4">5</Text>
                  <TouchableOpacity className="px-4 py-2">
                    <Text className="text-white">+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-gray-300">Time per Round</Text>
                <View className="flex-row items-center bg-gray-700 rounded-lg">
                  <TouchableOpacity className="px-4 py-2">
                    <Text className="text-white">-</Text>
                  </TouchableOpacity>
                  <Text className="text-white font-bold px-4">60s</Text>
                  <TouchableOpacity className="px-4 py-2">
                    <Text className="text-white">+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-gray-300">Max Players</Text>
                <View className="flex-row items-center bg-gray-700 rounded-lg">
                  <TouchableOpacity className="px-4 py-2">
                    <Text className="text-white">-</Text>
                  </TouchableOpacity>
                  <Text className="text-white font-bold px-4">8</Text>
                  <TouchableOpacity className="px-4 py-2">
                    <Text className="text-white">+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity
              className={`bg-primary-500 py-4 rounded-xl flex-row items-center justify-center ${
                isLoading ? 'opacity-50' : ''
              }`}
              onPress={handleCreateGame}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="add-circle" size={24} color="#fff" />
                  <Text className="text-white font-bold text-lg ml-2">
                    Create Game
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-1">
            {/* Join Game */}
            <View className="bg-gray-800 rounded-2xl p-4 mb-4">
              <Text className="text-white font-bold text-lg mb-4">
                Enter Game Code
              </Text>
              <TextInput
                className="bg-gray-700 text-white text-2xl text-center py-4 rounded-xl tracking-widest"
                placeholder="XXXXXX"
                placeholderTextColor="#6b7280"
                value={joinCode}
                onChangeText={(text) => setJoinCode(text.toUpperCase())}
                maxLength={6}
                autoCapitalize="characters"
              />
            </View>

            <TouchableOpacity
              className={`bg-primary-500 py-4 rounded-xl flex-row items-center justify-center ${
                isLoading ? 'opacity-50' : ''
              }`}
              onPress={handleJoinGame}
              disabled={isLoading || !joinCode.trim()}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="enter" size={24} color="#fff" />
                  <Text className="text-white font-bold text-lg ml-2">
                    Join Game
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Recent Games */}
            <View className="mt-6">
              <Text className="text-gray-400 text-sm mb-3">Recent Games</Text>
              <View className="bg-gray-800 rounded-xl p-4 items-center">
                <Ionicons name="time-outline" size={32} color="#6b7280" />
                <Text className="text-gray-500 mt-2">No recent games</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
