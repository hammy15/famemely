import { useEffect } from 'react';
import { View, Text, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, animation } from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export type GamePhase = 'selecting' | 'judging' | 'revealing' | 'winner';

interface PhaseTransitionProps {
  phase: GamePhase;
  playerName?: string;
  onComplete?: () => void;
  visible: boolean;
}

const phaseConfig = {
  selecting: {
    title: 'SELECTING!',
    subtitle: 'Pick your best meme',
    icon: 'cards-outline',
    color: colors.primary,
  },
  judging: {
    title: 'JUDGING TIME!',
    subtitle: 'The judge is deciding...',
    icon: 'gavel',
    color: colors.accent.gold,
  },
  revealing: {
    title: 'REVEAL!',
    subtitle: 'See the submissions',
    icon: 'eye',
    color: colors.secondary,
  },
  winner: {
    title: 'CHAMPION!',
    subtitle: '',
    icon: 'trophy',
    color: colors.accent.gold,
  },
};

export default function PhaseTransition({
  phase,
  playerName,
  onComplete,
  visible,
}: PhaseTransitionProps) {
  const config = phaseConfig[phase];
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const textTranslateY = useSharedValue(50);
  const iconRotation = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Entry animation
      scale.value = withSequence(
        withTiming(1.2, { duration: 300, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 200 })
      );
      opacity.value = withTiming(1, { duration: 200 });
      textTranslateY.value = withDelay(
        200,
        withTiming(0, { duration: 300, easing: Easing.out(Easing.ease) })
      );
      iconRotation.value = withSequence(
        withTiming(-10, { duration: 100 }),
        withTiming(10, { duration: 200 }),
        withTiming(0, { duration: 100 })
      );

      // Exit animation after delay
      const timer = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 300 });
        scale.value = withTiming(0.8, { duration: 300 });

        if (onComplete) {
          setTimeout(() => runOnJS(onComplete)(), 300);
        }
      }, animation.phaseTransition - 300);

      return () => clearTimeout(timer);
    }
  }, [visible, phase]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: textTranslateY.value }],
    opacity: interpolate(textTranslateY.value, [50, 0], [0, 1]),
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${iconRotation.value}deg` }],
  }));

  if (!visible) return null;

  return (
    <View
      className="absolute inset-0 items-center justify-center z-50"
      style={{ backgroundColor: colors.background.overlay }}
      pointerEvents="none"
    >
      <Animated.View style={containerStyle} className="items-center">
        {/* Glow Background */}
        <View
          className="absolute w-64 h-64 rounded-full"
          style={{
            backgroundColor: config.color,
            opacity: 0.2,
            shadowColor: config.color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: 80,
          }}
        />

        {/* Icon */}
        <Animated.View style={iconStyle}>
          <MaterialCommunityIcons
            name={config.icon as any}
            size={80}
            color={config.color}
          />
        </Animated.View>

        {/* Title */}
        <Animated.View style={textStyle}>
          <Text
            className="font-black text-center mt-4"
            style={{
              fontSize: 64,
              color: config.color,
              textShadowColor: config.color,
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 20,
            }}
          >
            {config.title}
          </Text>

          {/* Subtitle or Player Name */}
          <Text className="text-gray-300 text-2xl text-center mt-2">
            {phase === 'winner' && playerName ? `${playerName} WINS!` : config.subtitle}
          </Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}
