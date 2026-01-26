import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useAuthStore } from '@/stores/authStore';
import { useGameStore } from '@/stores/gameStore';
import { colors } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function GameLauncherScreen() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const { createNewGame, joinGameById, isLoading } = useGameStore();

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [gameCode, setGameCode] = useState('');

  // Animated glow for PLAY button
  const glowOpacity = useSharedValue(0.4);

  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowOpacity.value,
  }));

  const handlePlayNow = async () => {
    try {
      const gameId = await createNewGame(user!.id);
      router.push(`/game/lobby/${gameId}`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create game');
    }
  };

  const handleJoinGame = async () => {
    if (gameCode.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter a 6-character game code');
      return;
    }

    try {
      await joinGameById(gameCode.toUpperCase(), user!.id);
      setShowJoinModal(false);
      setGameCode('');
      router.push(`/game/lobby/${gameCode.toUpperCase()}`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to join game');
    }
  };

  const handleInvite = async () => {
    // Create game first, then share code
    try {
      const gameId = await createNewGame(user!.id);
      router.push(`/game/lobby/${gameId}`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create game');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-2">
        <TouchableOpacity
          className="w-12 h-12 items-center justify-center rounded-xl bg-background-secondary"
          onPress={() => router.push('/settings' as Href)}
        >
          <Ionicons name="menu" size={24} color={colors.text.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center px-4 py-2 rounded-xl bg-background-secondary"
          onPress={() => router.push('/profile' as Href)}
        >
          <View className="w-8 h-8 rounded-full bg-primary-500 items-center justify-center mr-2">
            <Text className="text-background-primary font-bold text-sm">
              {user?.displayName?.charAt(0) || '?'}
            </Text>
          </View>
          <Text className="text-white font-semibold">
            {user?.displayName?.split(' ')[0] || 'Player'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View className="flex-1 px-4 justify-center">
        {/* Logo/Title */}
        <View className="items-center mb-8">
          <Text className="text-primary-500 text-5xl font-black tracking-tight">
            FaMEMEly
          </Text>
          <Text className="text-gray-400 text-lg mt-1">
            The Meme Battle Game
          </Text>
        </View>

        {/* PLAY NOW - Hero Button */}
        <Animated.View
          style={[
            glowStyle,
            {
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 0 },
              shadowRadius: 30,
              elevation: 15,
            },
          ]}
          className="mb-6"
        >
          <TouchableOpacity
            className="bg-primary-500 rounded-xl py-8 items-center justify-center"
            style={{ height: 120 }}
            onPress={handlePlayNow}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <FontAwesome5 name="play" size={32} color={colors.background.primary} />
            <Text className="text-background-primary text-3xl font-black mt-2">
              PLAY NOW
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Secondary Buttons Row */}
        <View className="flex-row gap-3 mb-8">
          <TouchableOpacity
            className="flex-1 bg-background-secondary rounded-xl py-5 items-center justify-center border border-gray-700"
            onPress={() => setShowJoinModal(true)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="account-group" size={28} color={colors.text.primary} />
            <Text className="text-white font-bold text-lg mt-1">JOIN GAME</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-secondary-500 rounded-xl py-5 items-center justify-center"
            onPress={handleInvite}
            activeOpacity={0.7}
          >
            <Ionicons name="share-social" size={28} color="#fff" />
            <Text className="text-white font-bold text-lg mt-1">INVITE</Text>
          </TouchableOpacity>
        </View>

        {/* Daily Challenge Preview */}
        <TouchableOpacity
          className="bg-accent-gold/10 border border-accent-gold/30 rounded-xl p-4 mb-6"
          activeOpacity={0.7}
        >
          <View className="flex-row items-center">
            <MaterialCommunityIcons name="star-circle" size={24} color={colors.accent.gold} />
            <Text className="text-accent-gold font-bold ml-2">DAILY CHALLENGE</Text>
          </View>
          <Text className="text-white text-lg font-semibold mt-2">
            "Caption This!"
          </Text>
          <Text className="text-gray-400 text-sm mt-1">
            Play to earn bonus Champion Cards
          </Text>
        </TouchableOpacity>

        {/* Quick Stats */}
        <View className="flex-row justify-around bg-background-secondary rounded-xl py-4">
          <View className="items-center">
            <Text className="text-primary-500 text-2xl font-black">
              {user?.stats?.gamesWon || 0}
            </Text>
            <Text className="text-gray-400 text-sm">Wins</Text>
          </View>
          <View className="w-px bg-gray-700 h-full" />
          <View className="items-center">
            <Text className="text-secondary-500 text-2xl font-black">
              {user?.stats?.roundsWon || 0}
            </Text>
            <Text className="text-gray-400 text-sm">Cards</Text>
          </View>
          <View className="w-px bg-gray-700 h-full" />
          <View className="items-center">
            <Text className="text-accent-gold text-2xl font-black">
              {user?.stats?.gamesPlayed || 0}
            </Text>
            <Text className="text-gray-400 text-sm">Played</Text>
          </View>
        </View>
      </View>

      {/* Bottom Nav Icons - Quick Access */}
      <View className="flex-row justify-around py-4 border-t border-gray-800">
        <TouchableOpacity
          className="items-center"
          onPress={() => router.push('/champions' as Href)}
        >
          <MaterialCommunityIcons name="cards" size={28} color={colors.text.secondary} />
          <Text className="text-gray-400 text-xs mt-1">Cards</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="items-center"
          onPress={() => router.push('/create' as Href)}
        >
          <MaterialCommunityIcons name="image-plus" size={28} color={colors.text.secondary} />
          <Text className="text-gray-400 text-xs mt-1">Create</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="items-center"
          onPress={() => router.push('/social' as Href)}
        >
          <Ionicons name="people" size={28} color={colors.text.secondary} />
          <Text className="text-gray-400 text-xs mt-1">Social</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="items-center"
          onPress={() => router.push('/profile' as Href)}
        >
          <Ionicons name="person" size={28} color={colors.text.secondary} />
          <Text className="text-gray-400 text-xs mt-1">Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Join Game Modal */}
      <Modal
        visible={showJoinModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowJoinModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <View className="flex-1 bg-black/80 items-center justify-center px-6">
            <View className="bg-background-secondary rounded-xl p-6 w-full max-w-sm">
              <Text className="text-white text-2xl font-black text-center mb-6">
                JOIN GAME
              </Text>

              <Text className="text-gray-400 text-center mb-4">
                Enter the 6-character game code
              </Text>

              <TextInput
                className="bg-background-tertiary text-white text-center text-3xl font-black tracking-widest py-4 rounded-xl mb-6"
                value={gameCode}
                onChangeText={(text) => setGameCode(text.toUpperCase().slice(0, 6))}
                placeholder="ABC123"
                placeholderTextColor={colors.text.muted}
                autoCapitalize="characters"
                maxLength={6}
                autoFocus
              />

              <TouchableOpacity
                className={`bg-primary-500 py-4 rounded-xl mb-3 ${
                  gameCode.length !== 6 || isLoading ? 'opacity-50' : ''
                }`}
                onPress={handleJoinGame}
                disabled={gameCode.length !== 6 || isLoading}
              >
                <Text className="text-background-primary text-center font-black text-lg">
                  {isLoading ? 'JOINING...' : 'JOIN'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="py-3"
                onPress={() => {
                  setShowJoinModal(false);
                  setGameCode('');
                }}
              >
                <Text className="text-gray-400 text-center font-semibold">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
