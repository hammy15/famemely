import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { useGameStore } from '@/stores/gameStore';
import { useChatStore } from '@/stores/chatStore';
import { formatTimer, getInitials } from '@/lib/utils';
import { uploadMeme } from '@/lib/firebase';
import GameChat from '@/components/chat/GameChat';
import Scoreboard from '@/components/game/Scoreboard';
import JudgeView from '@/components/game/JudgeView';
import PlayerSubmission from '@/components/game/PlayerSubmission';

export default function GameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const {
    currentGame,
    players,
    timeRemaining,
    subscribeToCurrentGame,
    leaveGame,
    submitPlayerMeme,
  } = useGameStore();
  const { subscribeToGameChat, unsubscribeFromChat } = useChatStore();

  const [showChat, setShowChat] = useState(false);
  const [memeUri, setMemeUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      subscribeToCurrentGame(id);
      subscribeToGameChat(id);
    }
    return () => {
      leaveGame();
      unsubscribeFromChat();
    };
  }, [id]);

  useEffect(() => {
    if (currentGame?.status === 'finished') {
      router.replace('/(tabs)/play');
    }
  }, [currentGame?.status]);

  const isJudge =
    currentGame &&
    players[currentGame.currentJudgeIndex]?.id === user?.id;

  const hasSubmitted = currentGame?.submissions?.[user?.id || ''];

  const handlePickMeme = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setMemeUri(result.assets[0].uri);
    }
  };

  const handleSubmitMeme = async () => {
    if (!memeUri || !user || !currentGame) return;

    setIsSubmitting(true);
    try {
      // Convert URI to blob and upload
      const response = await fetch(memeUri);
      const blob = await response.blob();
      const memeUrl = await uploadMeme(user.id, blob);

      await submitPlayerMeme(user.id, memeUrl);
      setMemeUri(null);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit meme');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLeave = () => {
    Alert.alert('Leave Game', 'Are you sure you want to leave?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: () => {
          leaveGame();
          router.replace('/(tabs)/play');
        },
      },
    ]);
  };

  if (!currentGame) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#22c55e" />
      </SafeAreaView>
    );
  }

  const currentJudge = players[currentGame.currentJudgeIndex];

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: `Round ${currentGame.currentRound}/${currentGame.totalRounds}`,
          headerStyle: { backgroundColor: '#111827' },
          headerTintColor: '#fff',
          headerLeft: () => (
            <TouchableOpacity onPress={handleLeave} className="mr-4">
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setShowChat(!showChat)}
              className="mr-2"
            >
              <Ionicons
                name={showChat ? 'chatbubbles' : 'chatbubbles-outline'}
                size={24}
                color="#22c55e"
              />
            </TouchableOpacity>
          ),
        }}
      />

      <SafeAreaView className="flex-1 bg-gray-900" edges={['bottom']}>
        {showChat ? (
          <GameChat gameId={id!} onClose={() => setShowChat(false)} />
        ) : (
          <View className="flex-1">
            {/* Game Status Bar */}
            <View className="flex-row items-center justify-between px-4 py-2 bg-gray-800">
              <View className="flex-row items-center">
                <MaterialCommunityIcons
                  name="gavel"
                  size={20}
                  color="#fbbf24"
                />
                <Text className="text-yellow-500 ml-2 font-medium">
                  Judge: {currentJudge?.displayName || 'Unknown'}
                </Text>
              </View>
              {currentGame.status === 'playing' && (
                <View className="flex-row items-center bg-gray-700 px-3 py-1 rounded-full">
                  <Ionicons name="time" size={16} color="#22c55e" />
                  <Text className="text-primary-500 ml-1 font-bold">
                    {formatTimer(timeRemaining)}
                  </Text>
                </View>
              )}
            </View>

            {/* Prompt */}
            <View className="px-4 py-6 bg-gray-800/50">
              <Text className="text-gray-400 text-sm text-center mb-2">
                PROMPT
              </Text>
              <Text className="text-white text-xl font-bold text-center">
                "{currentGame.currentPrompt}"
              </Text>
            </View>

            {/* Main Content */}
            <View className="flex-1 px-4 py-4">
              {currentGame.status === 'playing' && (
                isJudge ? (
                  <View className="flex-1 items-center justify-center">
                    <MaterialCommunityIcons
                      name="gavel"
                      size={80}
                      color="#fbbf24"
                    />
                    <Text className="text-white text-xl font-bold mt-4">
                      You're the Judge!
                    </Text>
                    <Text className="text-gray-400 text-center mt-2">
                      Wait for players to submit their memes
                    </Text>

                    {/* Submission Progress */}
                    <View className="mt-6 bg-gray-800 rounded-xl p-4 w-full">
                      <Text className="text-gray-400 text-sm mb-2">
                        Submissions: {Object.keys(currentGame.submissions).length}/
                        {players.length - 1}
                      </Text>
                      <View className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <View
                          className="h-full bg-primary-500 rounded-full"
                          style={{
                            width: `${
                              (Object.keys(currentGame.submissions).length /
                                (players.length - 1)) *
                              100
                            }%`,
                          }}
                        />
                      </View>
                    </View>
                  </View>
                ) : hasSubmitted ? (
                  <View className="flex-1 items-center justify-center">
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={80}
                      color="#22c55e"
                    />
                    <Text className="text-white text-xl font-bold mt-4">
                      Meme Submitted!
                    </Text>
                    <Text className="text-gray-400 text-center mt-2">
                      Waiting for other players...
                    </Text>
                  </View>
                ) : (
                  <PlayerSubmission
                    memeUri={memeUri}
                    onPickMeme={handlePickMeme}
                    onSubmit={handleSubmitMeme}
                    isSubmitting={isSubmitting}
                  />
                )
              )}

              {currentGame.status === 'judging' && (
                isJudge ? (
                  <JudgeView
                    submissions={currentGame.submissions}
                    players={players}
                  />
                ) : (
                  <View className="flex-1 items-center justify-center">
                    <MaterialCommunityIcons
                      name="gavel"
                      size={64}
                      color="#fbbf24"
                    />
                    <Text className="text-white text-xl font-bold mt-4">
                      Judging in Progress
                    </Text>
                    <Text className="text-gray-400 text-center mt-2">
                      {currentJudge?.displayName} is picking a winner...
                    </Text>
                  </View>
                )
              )}

              {currentGame.status === 'results' && (
                <View className="flex-1 items-center justify-center">
                  <MaterialCommunityIcons
                    name="trophy"
                    size={80}
                    color="#fbbf24"
                  />
                  <Text className="text-white text-2xl font-bold mt-4">
                    Round Winner!
                  </Text>
                  <Text className="text-primary-500 text-xl mt-2">
                    {players.find((p) => p.id === currentGame.roundWinner)
                      ?.displayName || 'Unknown'}
                  </Text>
                </View>
              )}
            </View>

            {/* Scoreboard */}
            <Scoreboard players={players} />
          </View>
        )}
      </SafeAreaView>
    </>
  );
}
