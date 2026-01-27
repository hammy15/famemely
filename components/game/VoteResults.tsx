import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp, ZoomIn, SlideInLeft, SlideInRight } from 'react-native-reanimated';
import { colors } from '@/constants/theme';
import type { PlayerInfo, Submission } from '@/types';
import GameButton from './GameButton';

interface VoteResultsProps {
  judgeWinnerId?: string;
  audienceWinnerId?: string;
  submissions: Record<string, Submission>;
  players: PlayerInfo[];
  voteCounts: Record<string, number>;
  onContinue: () => void;
  isHost: boolean;
}

export default function VoteResults({
  judgeWinnerId,
  audienceWinnerId,
  submissions,
  players,
  voteCounts,
  onContinue,
  isHost,
}: VoteResultsProps) {
  const judgeWinner = players.find(p => p.id === judgeWinnerId);
  const audienceWinner = players.find(p => p.id === audienceWinnerId);

  const judgeSubmission = judgeWinnerId ? submissions[judgeWinnerId] : null;
  const audienceSubmission = audienceWinnerId ? submissions[audienceWinnerId] : null;

  const bothSameWinner = judgeWinnerId === audienceWinnerId && judgeWinnerId;

  // If same winner for both
  if (bothSameWinner) {
    return (
      <View className="flex-1 items-center justify-center px-4">
        <Animated.View entering={ZoomIn} className="items-center">
          {/* Double Crown */}
          <View className="flex-row items-center mb-4">
            <MaterialCommunityIcons name="gavel" size={32} color={colors.accent.gold} />
            <Text className="text-accent-gold text-4xl font-black mx-4">+</Text>
            <Ionicons name="heart" size={32} color={colors.secondary} />
          </View>

          <Text className="text-white text-3xl font-black text-center mb-2">
            DOUBLE WINNER!
          </Text>
          <Text className="text-accent-gold text-2xl font-bold mb-6">
            {judgeWinner?.displayName}
          </Text>

          {/* Winning Image */}
          {judgeSubmission?.finalImageUrl && (
            <View
              className="rounded-2xl overflow-hidden mb-6"
              style={{
                shadowColor: colors.accent.gold,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.6,
                shadowRadius: 30,
              }}
            >
              <Image
                source={{ uri: judgeSubmission.finalImageUrl }}
                style={{ width: 250, height: 250 }}
                resizeMode="cover"
              />
              <View className="absolute top-2 right-2 bg-accent-gold rounded-full px-3 py-1">
                <Text className="text-background-primary font-black text-xs">+2 CARDS</Text>
              </View>
            </View>
          )}

          <View className="flex-row items-center mb-8">
            <View className="items-center mx-4">
              <MaterialCommunityIcons name="gavel" size={24} color={colors.accent.gold} />
              <Text className="text-gray-400 text-xs mt-1">Judge's Pick</Text>
            </View>
            <View className="items-center mx-4">
              <View className="flex-row items-center">
                <Ionicons name="heart" size={24} color={colors.secondary} />
                <Text className="text-secondary-500 font-bold ml-1">
                  {voteCounts[judgeWinnerId] || 0}
                </Text>
              </View>
              <Text className="text-gray-400 text-xs mt-1">People's Choice</Text>
            </View>
          </View>
        </Animated.View>

        {isHost && (
          <GameButton
            label="NEXT ROUND"
            variant="primary"
            size="xl"
            glow
            onPress={onContinue}
          />
        )}
      </View>
    );
  }

  // Different winners
  return (
    <View className="flex-1 px-4">
      {/* Header */}
      <Animated.View entering={FadeInUp} className="items-center mb-6">
        <Text className="text-white text-2xl font-black">Round Results</Text>
      </Animated.View>

      <View className="flex-1 flex-row">
        {/* Judge's Pick */}
        <Animated.View entering={SlideInLeft.delay(200)} className="flex-1 mr-2">
          <View
            className="flex-1 bg-background-secondary rounded-2xl p-3"
            style={{
              shadowColor: colors.accent.gold,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
            }}
          >
            <View className="flex-row items-center justify-center mb-2">
              <MaterialCommunityIcons name="gavel" size={20} color={colors.accent.gold} />
              <Text className="text-accent-gold font-bold ml-2 text-sm">JUDGE'S PICK</Text>
            </View>

            {judgeSubmission?.finalImageUrl && (
              <Image
                source={{ uri: judgeSubmission.finalImageUrl }}
                className="w-full aspect-square rounded-xl mb-2"
                resizeMode="cover"
              />
            )}

            <Text className="text-white font-bold text-center" numberOfLines={1}>
              {judgeWinner?.displayName || 'Unknown'}
            </Text>
            <Text className="text-accent-gold text-center text-sm font-bold">+1 CARD</Text>
          </View>
        </Animated.View>

        {/* Audience Winner */}
        <Animated.View entering={SlideInRight.delay(400)} className="flex-1 ml-2">
          <View
            className="flex-1 bg-background-secondary rounded-2xl p-3"
            style={{
              shadowColor: colors.secondary,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
            }}
          >
            <View className="flex-row items-center justify-center mb-2">
              <Ionicons name="heart" size={20} color={colors.secondary} />
              <Text className="text-secondary-500 font-bold ml-2 text-sm">PEOPLE'S CHOICE</Text>
            </View>

            {audienceSubmission?.finalImageUrl ? (
              <Image
                source={{ uri: audienceSubmission.finalImageUrl }}
                className="w-full aspect-square rounded-xl mb-2"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full aspect-square rounded-xl mb-2 bg-background-tertiary items-center justify-center">
                <Text className="text-gray-500 text-center">No votes</Text>
              </View>
            )}

            <Text className="text-white font-bold text-center" numberOfLines={1}>
              {audienceWinner?.displayName || 'No winner'}
            </Text>
            {audienceWinner && (
              <View className="flex-row items-center justify-center">
                <Ionicons name="heart" size={14} color={colors.secondary} />
                <Text className="text-secondary-500 text-sm font-bold ml-1">
                  {voteCounts[audienceWinnerId!] || 0} votes
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      </View>

      {/* Continue Button */}
      <Animated.View entering={FadeIn.delay(600)} className="mt-4">
        {isHost ? (
          <GameButton
            label="NEXT ROUND"
            variant="primary"
            size="xl"
            glow
            onPress={onContinue}
          />
        ) : (
          <View className="bg-background-secondary rounded-xl py-4">
            <Text className="text-gray-400 text-center">Waiting for host...</Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
}
