import { View, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';
import { getInitials } from '@/lib/utils';

interface PlayerPuckProps {
  name: string;
  score: number;
  isJudge?: boolean;
  isReady?: boolean;
  hasSubmitted?: boolean;
  isWinner?: boolean;
  avatarColor?: string;
  compact?: boolean;
}

export default function PlayerPuck({
  name,
  score,
  isJudge = false,
  isReady = false,
  hasSubmitted = false,
  isWinner = false,
  avatarColor,
  compact = false,
}: PlayerPuckProps) {
  const glowOpacity = useSharedValue(0);
  const winnerScale = useSharedValue(1);

  const bgColor = avatarColor || colors.players[Math.abs(name.charCodeAt(0)) % colors.players.length];

  useEffect(() => {
    if (isWinner) {
      winnerScale.value = withRepeat(
        withSequence(
          withSpring(1.1, { damping: 3, stiffness: 200 }),
          withSpring(1, { damping: 3, stiffness: 200 })
        ),
        3,
        false
      );
      glowOpacity.value = withTiming(1, { duration: 300 });
    } else if (isJudge) {
      glowOpacity.value = withTiming(0.6, { duration: 300 });
    } else {
      glowOpacity.value = withTiming(0, { duration: 300 });
      winnerScale.value = 1;
    }
  }, [isWinner, isJudge]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: winnerScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowOpacity.value,
  }));

  const firstName = name.split(' ')[0];
  const displayName = compact ? firstName.slice(0, 6) : firstName;

  return (
    <Animated.View
      style={[
        containerStyle,
        glowStyle,
        {
          shadowColor: isWinner ? colors.accent.gold : isJudge ? colors.accent.gold : 'transparent',
          shadowOffset: { width: 0, height: 0 },
          shadowRadius: 15,
          elevation: isWinner || isJudge ? 8 : 0,
        },
      ]}
      className="items-center mx-2"
    >
      {/* Crown for Winner */}
      {isWinner && (
        <MaterialCommunityIcons
          name="crown"
          size={20}
          color={colors.accent.gold}
          style={{ position: 'absolute', top: -18, zIndex: 10 }}
        />
      )}

      {/* Avatar */}
      <View
        className="rounded-full items-center justify-center"
        style={{
          width: compact ? 40 : 48,
          height: compact ? 40 : 48,
          backgroundColor: isJudge ? colors.accent.gold : bgColor,
          borderWidth: hasSubmitted ? 3 : 0,
          borderColor: colors.accent.lime,
        }}
      >
        {isJudge ? (
          <MaterialCommunityIcons
            name="gavel"
            size={compact ? 20 : 24}
            color={colors.background.primary}
          />
        ) : (
          <Text
            className="font-black"
            style={{
              fontSize: compact ? 14 : 16,
              color: colors.background.primary,
            }}
          >
            {getInitials(name)}
          </Text>
        )}
      </View>

      {/* Score Badge */}
      <View
        className="absolute -bottom-1 -right-1 rounded-full items-center justify-center"
        style={{
          width: compact ? 18 : 22,
          height: compact ? 18 : 22,
          backgroundColor: colors.background.secondary,
          borderWidth: 2,
          borderColor: colors.background.primary,
        }}
      >
        <Text
          className="font-black"
          style={{
            fontSize: compact ? 10 : 12,
            color: colors.text.primary,
          }}
        >
          {score}
        </Text>
      </View>

      {/* Name */}
      <Text
        className="text-center font-semibold mt-1"
        style={{
          fontSize: compact ? 10 : 12,
          color: isJudge ? colors.accent.gold : colors.text.secondary,
        }}
        numberOfLines={1}
      >
        {displayName}
      </Text>

      {/* Ready/Submitted Indicator */}
      {(isReady || hasSubmitted) && !isJudge && (
        <View
          className="flex-row items-center mt-1 px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: hasSubmitted
              ? `${colors.accent.lime}30`
              : `${colors.primary}30`,
          }}
        >
          <MaterialCommunityIcons
            name={hasSubmitted ? 'check' : 'clock-outline'}
            size={10}
            color={hasSubmitted ? colors.accent.lime : colors.primary}
          />
        </View>
      )}
    </Animated.View>
  );
}
