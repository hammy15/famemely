import { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Share,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { useGameStore } from '@/stores/gameStore';
import { getInitials } from '@/lib/utils';

export default function GameLobbyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const {
    currentGame,
    players,
    isLoading,
    subscribeToCurrentGame,
    startGame,
    leaveGame,
  } = useGameStore();

  useEffect(() => {
    if (id) {
      subscribeToCurrentGame(id);
    }
    return () => leaveGame();
  }, [id]);

  useEffect(() => {
    // Navigate to game when it starts
    if (currentGame?.status === 'playing') {
      router.replace(`/game/${id}`);
    }
  }, [currentGame?.status]);

  const isHost = currentGame?.hostId === user?.id;
  const gameCode = currentGame?.settings?.code || id;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my FaMEMEly game! Code: ${gameCode}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleStartGame = async () => {
    if (players.length < 3) {
      Alert.alert('Not enough players', 'You need at least 3 players to start');
      return;
    }
    try {
      await startGame();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start game');
    }
  };

  const handleLeave = () => {
    Alert.alert(
      'Leave Game',
      'Are you sure you want to leave?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            leaveGame();
            router.back();
          },
        },
      ]
    );
  };

  if (!currentGame) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#22c55e" />
        <Text className="text-gray-400 mt-4">Loading game...</Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: 'Game Lobby',
          headerStyle: { backgroundColor: '#111827' },
          headerTintColor: '#fff',
          headerLeft: () => (
            <TouchableOpacity onPress={handleLeave} className="mr-4">
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView className="flex-1 bg-gray-900" edges={['bottom']}>
        <View className="flex-1 px-4">
          {/* Game Code */}
          <View className="bg-gray-800 rounded-2xl p-6 items-center mb-6">
            <Text className="text-gray-400 text-sm mb-2">GAME CODE</Text>
            <Text className="text-white text-4xl font-bold tracking-widest">
              {gameCode}
            </Text>
            <TouchableOpacity
              className="flex-row items-center mt-4 bg-gray-700 px-4 py-2 rounded-lg"
              onPress={handleShare}
            >
              <Ionicons name="share-outline" size={20} color="#22c55e" />
              <Text className="text-primary-500 ml-2 font-medium">
                Share Invite
              </Text>
            </TouchableOpacity>
          </View>

          {/* Players List */}
          <View className="flex-1">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-white font-bold text-lg">
                Players ({players.length}/{currentGame.maxPlayers})
              </Text>
              <Text className="text-gray-400 text-sm">
                Need at least 3 to start
              </Text>
            </View>

            <FlatList
              data={players}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <View className="flex-row items-center bg-gray-800 rounded-xl p-3 mb-2">
                  {/* Avatar */}
                  <View className="w-12 h-12 rounded-full bg-primary-500 items-center justify-center">
                    <Text className="text-white font-bold">
                      {getInitials(item.displayName)}
                    </Text>
                  </View>

                  {/* Name */}
                  <View className="flex-1 ml-3">
                    <Text className="text-white font-medium">
                      {item.displayName}
                    </Text>
                    {item.id === currentGame.hostId && (
                      <View className="flex-row items-center">
                        <MaterialCommunityIcons
                          name="crown"
                          size={12}
                          color="#fbbf24"
                        />
                        <Text className="text-yellow-500 text-xs ml-1">
                          Host
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Ready Status */}
                  <View className="bg-green-500/20 px-3 py-1 rounded-full">
                    <Text className="text-green-500 text-xs font-medium">
                      Ready
                    </Text>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <View className="items-center py-8">
                  <Text className="text-gray-500">Waiting for players...</Text>
                </View>
              }
            />
          </View>

          {/* Game Settings */}
          <View className="bg-gray-800 rounded-xl p-4 mb-4">
            <Text className="text-gray-400 text-sm mb-2">GAME SETTINGS</Text>
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-white font-bold">
                  {currentGame.totalRounds}
                </Text>
                <Text className="text-gray-400 text-xs">Rounds</Text>
              </View>
              <View className="items-center">
                <Text className="text-white font-bold">
                  {currentGame.settings.timePerRound}s
                </Text>
                <Text className="text-gray-400 text-xs">Per Round</Text>
              </View>
              <View className="items-center">
                <Text className="text-white font-bold">
                  {currentGame.maxPlayers}
                </Text>
                <Text className="text-gray-400 text-xs">Max Players</Text>
              </View>
            </View>
          </View>

          {/* Start Button (Host Only) */}
          {isHost ? (
            <TouchableOpacity
              className={`bg-primary-500 py-4 rounded-xl mb-4 ${
                players.length < 3 || isLoading ? 'opacity-50' : ''
              }`}
              onPress={handleStartGame}
              disabled={players.length < 3 || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-center font-bold text-lg">
                  Start Game
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <View className="bg-gray-800 py-4 rounded-xl mb-4">
              <Text className="text-gray-400 text-center">
                Waiting for host to start...
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </>
  );
}
