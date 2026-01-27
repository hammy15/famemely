import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Href } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
  SlideInUp,
} from 'react-native-reanimated';
import { useAuthStore } from '@/stores/authStore';
import { useGameStore } from '@/stores/gameStore';
import { useChatStore } from '@/stores/chatStore';
import { formatTimer, getInitials } from '@/lib/utils';
import { DEMO_MODE, MOCK_MEME_URLS } from '@/lib/mock';
import { colors } from '@/constants/theme';

// Only import Firebase if not in demo mode
let firebaseFunctions: any = null;
if (!DEMO_MODE) {
  firebaseFunctions = require('@/lib/firebase');
}

// Components
import GameChat from '@/components/chat/GameChat';
import JudgeView from '@/components/game/JudgeView';
import PlayerSubmission from '@/components/game/PlayerSubmission';
import GameButton from '@/components/game/GameButton';
import CountdownTimer from '@/components/game/CountdownTimer';
import PlayerPuck from '@/components/game/PlayerPuck';
import PhaseTransition from '@/components/game/PhaseTransition';
import CelebrationOverlay from '@/components/game/CelebrationOverlay';
import ScorePop from '@/components/game/ScorePop';
import ConfettiExplosion from '@/components/game/ConfettiExplosion';
import PhotoUploader from '@/components/game/PhotoUploader';
import PhotoPicker from '@/components/game/PhotoPicker';
import TimeExtensionButton from '@/components/game/TimeExtensionButton';
import CaptionEditor from '@/components/game/CaptionEditor';
import VotingCard from '@/components/game/VotingCard';
import VoteResults from '@/components/game/VoteResults';
import { useCaptionStore } from '@/stores/captionStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function GameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const {
    currentGame,
    players,
    timeRemaining,
    voteCounts,
    subscribeToCurrentGame,
    leaveGame,
    submitPlayerMeme,
    selectWinner,
    nextRound,
    finishPhotoUpload,
    submitCaption,
    submitAudienceVote,
    calculateResults,
  } = useGameStore();
  const { subscribeToGameChat, unsubscribeFromChat } = useChatStore();
  const { setPhoto, clearAll: clearCaptions } = useCaptionStore();

  const [showChat, setShowChat] = useState(false);
  const [memeUri, setMemeUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Phase transition states
  const [showPhaseTransition, setShowPhaseTransition] = useState(false);
  const [phaseType, setPhaseType] = useState<'selecting' | 'judging' | 'revealing' | 'winner'>('selecting');
  const [showCelebration, setShowCelebration] = useState(false);
  const [showScorePop, setShowScorePop] = useState(false);
  const [lastStatus, setLastStatus] = useState<string | null>(null);

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

  // Handle status changes for phase transitions
  useEffect(() => {
    if (currentGame?.status && currentGame.status !== lastStatus) {
      if (lastStatus !== null) {
        // Trigger phase transition animation
        if (currentGame.status === 'captioning') {
          setPhaseType('selecting');
          setShowPhaseTransition(true);
        } else if (currentGame.status === 'judging') {
          setPhaseType('judging');
          setShowPhaseTransition(true);
        } else if (currentGame.status === 'results') {
          // Show celebration instead of phase transition for results
          setShowCelebration(true);
        }
      }
      setLastStatus(currentGame.status);
    }
  }, [currentGame?.status, lastStatus]);

  useEffect(() => {
    if (currentGame?.status === 'finished') {
      router.replace('/(main)' as Href);
    }
  }, [currentGame?.status]);

  const isHost = currentGame?.hostId === user?.id;

  const isJudge = !!(currentGame && currentGame.currentJudgeId === user?.id);

  const hasSubmitted = currentGame?.submissions?.[user?.id || ''];
  const currentJudge = currentGame ? players.find(p => p.id === currentGame.currentJudgeId) : null;
  const totalTime = currentGame?.settings?.timePerRound || 90;

  // Find winner info for celebration (judge's pick takes priority for display)
  const roundWinner = currentGame?.judgeWinnerId
    ? players.find((p) => p.id === currentGame.judgeWinnerId)
    : null;
  const winningSubmission = currentGame?.judgeWinnerId && currentGame.submissions
    ? currentGame.submissions[currentGame.judgeWinnerId]
    : null;

  // Get current photo for display
  const currentPhoto = currentGame?.currentPhotoId && currentGame.photos
    ? currentGame.photos[currentGame.currentPhotoId]
    : null;

  // Set photo in caption store when entering captioning phase
  useEffect(() => {
    if (currentGame?.status === 'captioning' && currentPhoto) {
      setPhoto(currentPhoto.photoUrl);
    }
    if (currentGame?.status !== 'captioning') {
      clearCaptions();
    }
  }, [currentGame?.status, currentPhoto?.photoUrl]);

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

  const handleCaptionSubmit = async (captions: any[]) => {
    if (!user || !currentPhoto) return;

    setIsSubmitting(true);
    try {
      // For now, use the photo URL as the final image
      // In production, you'd capture the canvas with captions baked in
      await submitCaption(user.id, captions, currentPhoto.photoUrl);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitMeme = async () => {
    if (!memeUri || !user || !currentGame) return;

    setIsSubmitting(true);
    try {
      let memeUrl: string;

      if (DEMO_MODE) {
        // In demo mode, use the local URI or a random mock URL
        memeUrl = memeUri || MOCK_MEME_URLS[Math.floor(Math.random() * MOCK_MEME_URLS.length)];
      } else {
        const response = await fetch(memeUri);
        const blob = await response.blob();
        memeUrl = await firebaseFunctions.uploadMeme(user.id, blob);
      }

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
          router.replace('/(main)' as Href);
        },
      },
    ]);
  };

  const handleContinue = async () => {
    setShowCelebration(false);
    try {
      await nextRound();
    } catch (error) {
      console.error('Error advancing round:', error);
    }
  };

  if (!currentGame) {
    return (
      <SafeAreaView className="flex-1 bg-background-primary items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      {/* Phase Transition Overlay */}
      <PhaseTransition
        phase={phaseType}
        playerName={roundWinner?.displayName}
        visible={showPhaseTransition}
        onComplete={() => setShowPhaseTransition(false)}
      />

      {/* Celebration Overlay */}
      <CelebrationOverlay
        visible={showCelebration}
        winnerName={roundWinner?.displayName || 'Unknown'}
        memeUrl={winningSubmission?.finalImageUrl || currentPhoto?.photoUrl}
        prompt="Judge's Pick!"
        onContinue={handleContinue}
      />

      {/* Score Pop */}
      <ScorePop
        visible={showScorePop}
        text="+1 CARD!"
        color={colors.accent.gold}
        onComplete={() => setShowScorePop(false)}
      />

      {showChat ? (
        <GameChat gameId={id!} onClose={() => setShowChat(false)} />
      ) : (
        <View className="flex-1">
          {/* Header Bar */}
          <View className="flex-row items-center justify-between px-4 py-2">
            <TouchableOpacity onPress={handleLeave} className="p-2">
              <Ionicons name="close" size={28} color={colors.text.primary} />
            </TouchableOpacity>

            <View className="items-center">
              <Text className="text-gray-400 text-sm">Round</Text>
              <Text className="text-white text-xl font-black">
                {currentGame.currentRound}/{currentGame.totalRounds}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setShowChat(!showChat)}
              className="p-2"
            >
              <Ionicons name="chatbubbles-outline" size={28} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Timer */}
          {(currentGame.status === 'captioning' || currentGame.status === 'voting') && (
            <Animated.View entering={SlideInUp.delay(300)} className="px-4 mb-4">
              <View className="flex-row items-center justify-between">
                <CountdownTimer
                  timeRemaining={timeRemaining}
                  totalTime={totalTime}
                  size="large"
                />
                {isJudge && currentGame.status === 'captioning' && (
                  <TimeExtensionButton isJudge={isJudge} timeRemaining={timeRemaining} />
                )}
              </View>
            </Animated.View>
          )}

          {/* Player Pucks */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12 }}
            className="mb-4"
          >
            {players.map((player, index) => (
              <PlayerPuck
                key={player.id}
                name={player.displayName}
                score={currentGame.scores?.[player.id] || 0}
                isJudge={player.id === currentGame.currentJudgeId}
                hasSubmitted={!!currentGame.submissions?.[player.id]}
                isWinner={player.id === currentGame.judgeWinnerId && currentGame.status === 'results'}
                avatarColor={colors.players[index % colors.players.length]}
                compact
              />
            ))}
          </ScrollView>

          {/* Current Photo Display (when captioning) */}
          {currentPhoto && (currentGame.status === 'captioning' || currentGame.status === 'judging') && (
            <View className="mx-4 mb-4 bg-background-secondary rounded-xl overflow-hidden">
              <Text className="text-gray-400 text-sm text-center py-2">CAPTION THIS PHOTO</Text>
              <Image
                source={{ uri: currentPhoto.photoUrl }}
                className="w-full aspect-square"
                resizeMode="cover"
              />
            </View>
          )}

          {/* Main Content Area */}
          <View className="flex-1 px-4">
            {/* PHOTO UPLOAD PHASE */}
            {currentGame.status === 'photo_upload' && (
              <PhotoUploader
                photos={currentGame.photos || {}}
                onFinish={finishPhotoUpload}
                isHost={isHost}
              />
            )}

            {/* PICKING PHASE */}
            {currentGame.status === 'picking' && (
              <PhotoPicker
                photos={currentGame.photos || {}}
                isJudge={isJudge}
              />
            )}

            {/* CAPTIONING PHASE */}
            {currentGame.status === 'captioning' && (
              isJudge ? (
                // Judge View - Waiting for submissions
                <Animated.View
                  entering={FadeIn.delay(500)}
                  className="flex-1 items-center justify-center"
                >
                  <View
                    className="w-32 h-32 rounded-full items-center justify-center mb-6"
                    style={{
                      backgroundColor: `${colors.accent.gold}20`,
                      shadowColor: colors.accent.gold,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.5,
                      shadowRadius: 30,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="gavel"
                      size={64}
                      color={colors.accent.gold}
                    />
                  </View>

                  <Text className="text-white text-3xl font-black mb-2">
                    You're the Judge!
                  </Text>
                  <Text className="text-gray-400 text-lg text-center mb-8">
                    Wait for players to submit their memes
                  </Text>

                  {/* Submission Progress */}
                  <View className="w-full bg-background-secondary rounded-xl p-4">
                    <View className="flex-row justify-between mb-3">
                      <Text className="text-gray-400">Submissions</Text>
                      <Text className="text-white font-bold">
                        {Object.keys(currentGame.submissions || {}).length}/{players.length - 1}
                      </Text>
                    </View>
                    <View className="h-3 bg-background-tertiary rounded-full overflow-hidden">
                      <View
                        className="h-full bg-primary-500 rounded-full"
                        style={{
                          width: `${
                            (Object.keys(currentGame.submissions || {}).length /
                              (players.length - 1)) *
                            100
                          }%`,
                        }}
                      />
                    </View>
                  </View>
                </Animated.View>
              ) : hasSubmitted ? (
                // Player - Already Submitted
                <Animated.View
                  entering={FadeIn}
                  className="flex-1 items-center justify-center"
                >
                  <View
                    className="w-32 h-32 rounded-full items-center justify-center mb-6"
                    style={{
                      backgroundColor: `${colors.accent.lime}20`,
                      shadowColor: colors.accent.lime,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.5,
                      shadowRadius: 30,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={64}
                      color={colors.accent.lime}
                    />
                  </View>

                  <Text className="text-white text-3xl font-black mb-2">
                    Meme Submitted!
                  </Text>
                  <Text className="text-gray-400 text-lg text-center">
                    Waiting for other players...
                  </Text>
                </Animated.View>
              ) : currentPhoto ? (
                // Player - Caption Editor
                <CaptionEditor
                  photoUrl={currentPhoto.photoUrl}
                  onSubmit={handleCaptionSubmit}
                  isSubmitting={isSubmitting}
                />
              ) : null
            )}

            {/* JUDGING PHASE */}
            {currentGame.status === 'judging' && (
              isJudge ? (
                <JudgeView
                  submissions={currentGame.submissions || {}}
                  players={players}
                />
              ) : (
                <Animated.View
                  entering={FadeIn}
                  className="flex-1 items-center justify-center"
                >
                  <View
                    className="w-32 h-32 rounded-full items-center justify-center mb-6"
                    style={{
                      backgroundColor: `${colors.accent.gold}20`,
                      shadowColor: colors.accent.gold,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.5,
                      shadowRadius: 30,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="gavel"
                      size={64}
                      color={colors.accent.gold}
                    />
                  </View>

                  <Text className="text-white text-3xl font-black mb-2">
                    Judging Time!
                  </Text>
                  <Text className="text-gray-400 text-lg text-center">
                    {currentJudge?.displayName} is picking a winner...
                  </Text>
                </Animated.View>
              )
            )}

            {/* VOTING PHASE - People's Choice */}
            {currentGame.status === 'voting' && (
              <VotingCard
                submissions={currentGame.submissions || {}}
                players={players}
                judgeWinnerId={currentGame.judgeWinnerId}
              />
            )}

            {/* RESULTS PHASE */}
            {currentGame.status === 'results' && !showCelebration && (
              <VoteResults
                judgeWinnerId={currentGame.judgeWinnerId}
                audienceWinnerId={currentGame.audienceWinnerId}
                submissions={currentGame.submissions || {}}
                players={players}
                voteCounts={voteCounts}
                onContinue={handleContinue}
                isHost={isHost}
              />
            )}
          </View>

          {/* Bottom Scoreboard */}
          <View className="bg-background-secondary border-t border-gray-800 py-3 px-4">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[...players]
                .sort((a, b) => (currentGame.scores?.[b.id] || 0) - (currentGame.scores?.[a.id] || 0))
                .map((player, index) => (
                  <View key={player.id} className="items-center mx-3">
                    {index === 0 && (currentGame.scores?.[player.id] || 0) > 0 && (
                      <MaterialCommunityIcons
                        name="crown"
                        size={16}
                        color={colors.accent.gold}
                      />
                    )}
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center"
                      style={{
                        backgroundColor: colors.players[players.indexOf(player) % colors.players.length],
                      }}
                    >
                      <Text className="text-background-primary font-black text-sm">
                        {getInitials(player.displayName)}
                      </Text>
                    </View>
                    <Text className="text-white font-black mt-1">
                      {currentGame.scores?.[player.id] || 0}
                    </Text>
                  </View>
                ))}
            </ScrollView>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
