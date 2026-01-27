import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { useAuthStore } from '@/stores/authStore';
import { useGameStore } from '@/stores/gameStore';
import { colors } from '@/constants/theme';
import type { Submission, PlayerInfo } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.75;

interface VotingCardProps {
  submissions: Record<string, Submission>;
  players: PlayerInfo[];
  judgeWinnerId?: string;
}

export default function VotingCard({ submissions, players, judgeWinnerId }: VotingCardProps) {
  const user = useAuthStore((state) => state.user);
  const { submitAudienceVote, voteCounts, currentGame } = useGameStore();
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Check if user already voted
  const userVote = currentGame?.votes?.find(v => v.voterId === user?.id);
  const isJudge = currentGame?.currentJudgeId === user?.id;

  const submissionEntries = Object.entries(submissions).filter(
    ([playerId]) => playerId !== user?.id // Can't vote for yourself
  );

  const handleVote = async (playerId: string) => {
    if (hasVoted || userVote || !user) return;

    setSelectedId(playerId);
    try {
      await submitAudienceVote(user.id, playerId);
      setHasVoted(true);
    } catch (error) {
      console.error('Failed to vote:', error);
      setSelectedId(null);
    }
  };

  // If user is the judge, they watch
  if (isJudge) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Animated.View
          entering={FadeIn}
          className="w-24 h-24 rounded-full items-center justify-center mb-6"
          style={{
            backgroundColor: `${colors.accent.gold}20`,
            shadowColor: colors.accent.gold,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 30,
          }}
        >
          <MaterialCommunityIcons name="gavel" size={48} color={colors.accent.gold} />
        </Animated.View>

        <Text className="text-white text-2xl font-black text-center mb-2">
          You Already Picked!
        </Text>
        <Text className="text-gray-400 text-center">
          Now the audience is voting for People's Choice
        </Text>

        {/* Live Vote Counts */}
        <Animated.View entering={FadeInUp.delay(300)} className="mt-8 w-full">
          <Text className="text-gray-400 text-sm text-center mb-4">LIVE VOTES</Text>
          {submissionEntries.map(([playerId], index) => (
            <View key={playerId} className="flex-row items-center justify-between bg-background-secondary rounded-lg p-3 mb-2">
              <Text className="text-white">Player {index + 1}</Text>
              <View className="flex-row items-center">
                <Ionicons name="heart" size={16} color={colors.secondary} />
                <Text className="text-secondary-500 ml-2 font-bold">
                  {voteCounts[playerId] || 0}
                </Text>
              </View>
            </View>
          ))}
        </Animated.View>
      </View>
    );
  }

  // If already voted, show confirmation
  if (hasVoted || userVote) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Animated.View
          entering={ZoomIn}
          className="w-24 h-24 rounded-full items-center justify-center mb-6"
          style={{
            backgroundColor: `${colors.accent.lime}20`,
            shadowColor: colors.accent.lime,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 30,
          }}
        >
          <Ionicons name="checkmark-circle" size={56} color={colors.accent.lime} />
        </Animated.View>

        <Text className="text-white text-2xl font-black text-center mb-2">
          Vote Cast!
        </Text>
        <Text className="text-gray-400 text-center">
          Waiting for other players to vote...
        </Text>

        {/* Live Vote Counts */}
        <Animated.View entering={FadeInUp.delay(300)} className="mt-8 w-full">
          <Text className="text-gray-400 text-sm text-center mb-4">LIVE VOTES</Text>
          {submissionEntries.map(([playerId], index) => (
            <View key={playerId} className="flex-row items-center justify-between bg-background-secondary rounded-lg p-3 mb-2">
              <View className="flex-row items-center">
                <Text className="text-white">Player {index + 1}</Text>
                {(selectedId === playerId || userVote?.submissionPlayerId === playerId) && (
                  <Text className="text-primary-500 ml-2 text-sm">(Your vote)</Text>
                )}
              </View>
              <View className="flex-row items-center">
                <Ionicons name="heart" size={16} color={colors.secondary} />
                <Text className="text-secondary-500 ml-2 font-bold">
                  {voteCounts[playerId] || 0}
                </Text>
              </View>
            </View>
          ))}
        </Animated.View>
      </View>
    );
  }

  const renderSubmission = ({ item, index }: { item: [string, Submission]; index: number }) => {
    const [playerId, submission] = item;
    const isJudgeWinner = playerId === judgeWinnerId;

    return (
      <Animated.View entering={FadeIn.delay(index * 100)}>
        <TouchableOpacity
          onPress={() => handleVote(playerId)}
          activeOpacity={0.8}
          className="mr-4"
          style={{ width: CARD_WIDTH }}
        >
          <View
            className={`rounded-2xl overflow-hidden border-4 ${
              selectedId === playerId
                ? 'border-secondary-500'
                : 'border-transparent'
            }`}
            style={{
              shadowColor: selectedId === playerId ? colors.secondary : 'transparent',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: selectedId === playerId ? 0.5 : 0,
              shadowRadius: 20,
            }}
          >
            <Image
              source={{ uri: submission.finalImageUrl }}
              style={{ width: CARD_WIDTH - 8, height: CARD_WIDTH - 8 }}
              resizeMode="cover"
            />

            {/* Judge's Pick Badge */}
            {isJudgeWinner && (
              <View className="absolute top-3 left-3 bg-accent-gold rounded-full px-3 py-1 flex-row items-center">
                <MaterialCommunityIcons name="gavel" size={14} color="#000" />
                <Text className="text-background-primary font-bold ml-1 text-xs">Judge's Pick</Text>
              </View>
            )}

            {/* Vote Count */}
            <View className="absolute bottom-3 right-3 bg-black/70 rounded-full px-3 py-1 flex-row items-center">
              <Ionicons name="heart" size={14} color={colors.secondary} />
              <Text className="text-white font-bold ml-1">{voteCounts[playerId] || 0}</Text>
            </View>
          </View>

          {/* Vote Button */}
          <View className="mt-3">
            <View
              className={`py-3 rounded-xl items-center ${
                selectedId === playerId ? 'bg-secondary-500' : 'bg-background-secondary'
              }`}
            >
              <Text
                className={`font-bold ${
                  selectedId === playerId ? 'text-background-primary' : 'text-gray-400'
                }`}
              >
                {selectedId === playerId ? 'VOTING...' : 'VOTE FOR THIS'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View className="flex-1">
      <Animated.View entering={FadeInUp} className="items-center mb-6">
        <Text className="text-white text-2xl font-black">People's Choice</Text>
        <Text className="text-gray-400">Vote for your favorite!</Text>
      </Animated.View>

      <FlatList
        data={submissionEntries}
        renderItem={renderSubmission}
        keyExtractor={([playerId]) => playerId}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2 }}
        snapToInterval={CARD_WIDTH + 16}
        decelerationRate="fast"
      />

      <Text className="text-gray-500 text-center text-sm mt-4">
        Swipe to see all submissions
      </Text>
    </View>
  );
}
