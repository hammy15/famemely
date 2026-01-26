import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
  ActivityIndicator,
  Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { useAuthStore } from '@/stores/authStore';
import { useGameStore } from '@/stores/gameStore';
import { getInitials } from '@/lib/utils';
import { colors } from '@/constants/theme';
import GameButton from '@/components/game/GameButton';
import PlayerPuck from '@/components/game/PlayerPuck';

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

  const [isReady, setIsReady] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  // Animations
  const codeScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);

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

  useEffect(() => {
    // Pulsing glow for game code
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1500 }),
        withTiming(0.3, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const isHost = currentGame?.hostId === user?.id;
  const gameCode = currentGame?.settings?.code || id || '';
  const canStart = players.length >= 3 && isHost;

  const handleCopyCode = () => {
    Clipboard.setString(gameCode);
    setCodeCopied(true);
    codeScale.value = withSequence(
      withSpring(1.05),
      withSpring(1)
    );
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my FaMEMEly game!\n\nGame Code: ${gameCode}\n\nDownload the app and join the fun!`,
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

  const codeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: codeScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowOpacity.value,
  }));

  if (!currentGame) {
    return (
      <SafeAreaView className="flex-1 bg-background-primary items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-gray-400 mt-4 text-lg">Loading game...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-2">
        <TouchableOpacity
          onPress={handleLeave}
          className="w-12 h-12 items-center justify-center"
        >
          <Ionicons name="close" size={28} color={colors.text.primary} />
        </TouchableOpacity>

        <Text className="text-white text-xl font-black">MEME BATTLE</Text>

        <TouchableOpacity
          onPress={handleShare}
          className="w-12 h-12 items-center justify-center"
        >
          <Ionicons name="share-outline" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View className="flex-1 px-4">
        {/* Game Code - HUGE Display */}
        <TouchableOpacity onPress={handleCopyCode} activeOpacity={0.8}>
          <Animated.View
            style={[
              codeStyle,
              glowStyle,
              {
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 0 },
                shadowRadius: 30,
              },
            ]}
            className="bg-background-secondary rounded-xl py-8 items-center mb-6"
          >
            <Text className="text-gray-400 text-sm font-bold tracking-wider mb-2">
              GAME CODE
            </Text>
            <View className="flex-row">
              {gameCode.split('').map((char, index) => (
                <View
                  key={index}
                  className="bg-background-tertiary mx-1 px-4 py-3 rounded-lg"
                >
                  <Text
                    className="text-primary-500 font-black"
                    style={{ fontSize: 40 }}
                  >
                    {char}
                  </Text>
                </View>
              ))}
            </View>
            <View className="flex-row items-center mt-4">
              <Ionicons
                name={codeCopied ? 'checkmark-circle' : 'copy-outline'}
                size={18}
                color={codeCopied ? colors.accent.lime : colors.text.secondary}
              />
              <Text
                className={`ml-2 font-medium ${
                  codeCopied ? 'text-accent-lime' : 'text-gray-400'
                }`}
              >
                {codeCopied ? 'Copied!' : 'Tap to copy'}
              </Text>
            </View>
          </Animated.View>
        </TouchableOpacity>

        {/* Players Section */}
        <View className="flex-1">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white font-black text-xl">
              PLAYERS
            </Text>
            <View className="flex-row items-center">
              <Text
                className={`text-2xl font-black ${
                  players.length >= 3 ? 'text-accent-lime' : 'text-gray-500'
                }`}
              >
                {players.length}
              </Text>
              <Text className="text-gray-500 text-2xl font-black">
                /{currentGame.maxPlayers}
              </Text>
            </View>
          </View>

          {/* Player Requirement Notice */}
          {players.length < 3 && (
            <View className="bg-accent-gold/10 border border-accent-gold/30 rounded-xl p-3 mb-4">
              <Text className="text-accent-gold text-center font-semibold">
                Need at least 3 players to start
              </Text>
            </View>
          )}

          {/* Players List */}
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {players.map((player, index) => (
              <View
                key={player.id}
                className="flex-row items-center bg-background-secondary rounded-xl p-4 mb-3"
              >
                {/* Avatar */}
                <View
                  className="w-14 h-14 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: colors.players[index % colors.players.length],
                  }}
                >
                  <Text className="text-background-primary font-black text-lg">
                    {getInitials(player.displayName)}
                  </Text>
                </View>

                {/* Info */}
                <View className="flex-1 ml-4">
                  <View className="flex-row items-center">
                    <Text className="text-white font-bold text-lg">
                      {player.displayName}
                    </Text>
                    {player.id === user?.id && (
                      <Text className="text-gray-500 ml-2">(You)</Text>
                    )}
                  </View>
                  {player.id === currentGame.hostId && (
                    <View className="flex-row items-center mt-1">
                      <MaterialCommunityIcons
                        name="crown"
                        size={14}
                        color={colors.accent.gold}
                      />
                      <Text className="text-accent-gold text-sm font-medium ml-1">
                        Host
                      </Text>
                    </View>
                  )}
                </View>

                {/* Ready Badge */}
                <View className="bg-accent-lime/20 px-4 py-2 rounded-full">
                  <Text className="text-accent-lime font-bold text-sm">
                    READY
                  </Text>
                </View>
              </View>
            ))}

            {/* Empty Slots */}
            {Array.from({ length: Math.max(0, 3 - players.length) }).map((_, i) => (
              <View
                key={`empty-${i}`}
                className="flex-row items-center bg-background-secondary/50 rounded-xl p-4 mb-3 border border-dashed border-gray-700"
              >
                <View className="w-14 h-14 rounded-full bg-gray-700/50 items-center justify-center">
                  <Ionicons name="person-add" size={24} color={colors.text.muted} />
                </View>
                <Text className="text-gray-500 ml-4">Waiting for player...</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Game Settings */}
        <View className="bg-background-secondary rounded-xl p-4 mb-4">
          <View className="flex-row justify-around">
            <View className="items-center">
              <Text className="text-primary-500 text-2xl font-black">
                {currentGame.totalRounds}
              </Text>
              <Text className="text-gray-400 text-sm">Rounds</Text>
            </View>
            <View className="w-px bg-gray-700 h-full" />
            <View className="items-center">
              <Text className="text-secondary-500 text-2xl font-black">
                {currentGame.settings?.timePerRound || 60}s
              </Text>
              <Text className="text-gray-400 text-sm">Per Round</Text>
            </View>
            <View className="w-px bg-gray-700 h-full" />
            <View className="items-center">
              <Text className="text-accent-gold text-2xl font-black">
                {currentGame.maxPlayers}
              </Text>
              <Text className="text-gray-400 text-sm">Max</Text>
            </View>
          </View>
        </View>

        {/* Action Button */}
        {isHost ? (
          <GameButton
            label={isLoading ? 'STARTING...' : 'START GAME'}
            variant="primary"
            size="xl"
            glow={canStart}
            onPress={handleStartGame}
            disabled={!canStart}
            loading={isLoading}
          />
        ) : (
          <View className="bg-background-secondary rounded-xl py-5 mb-4">
            <Text className="text-gray-400 text-center text-lg font-semibold">
              Waiting for host to start...
            </Text>
          </View>
        )}

        <View className="h-4" />
      </View>
    </SafeAreaView>
  );
}
