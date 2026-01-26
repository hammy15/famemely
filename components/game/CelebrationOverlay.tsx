import { useEffect, useState } from 'react';
import { View, Text, Image, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ConfettiExplosion from './ConfettiExplosion';
import GameButton from './GameButton';
import { colors, animation } from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CelebrationOverlayProps {
  visible: boolean;
  winnerName: string;
  memeUrl?: string;
  prompt?: string;
  onContinue: () => void;
}

export default function CelebrationOverlay({
  visible,
  winnerName,
  memeUrl,
  prompt,
  onContinue,
}: CelebrationOverlayProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const backdropOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0);
  const cardRotation = useSharedValue(-10);
  const glowOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(-50);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setShowConfetti(true);

      // Backdrop fade in
      backdropOpacity.value = withTiming(1, { duration: 300 });

      // Card entrance with bounce
      cardScale.value = withDelay(
        200,
        withSpring(1, { damping: 8, stiffness: 100 })
      );
      cardRotation.value = withDelay(
        200,
        withSequence(
          withTiming(5, { duration: 200 }),
          withTiming(-3, { duration: 150 }),
          withTiming(0, { duration: 100 })
        )
      );

      // Gold glow pulse
      glowOpacity.value = withDelay(
        500,
        withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0.6, { duration: 300 })
        )
      );

      // Title slide in
      titleTranslateY.value = withDelay(
        400,
        withSpring(0, { damping: 12, stiffness: 100 })
      );

      // Button fade in
      buttonOpacity.value = withDelay(800, withTiming(1, { duration: 300 }));

      // Stop confetti after animation
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, animation.celebration);

      return () => clearTimeout(timer);
    } else {
      // Reset values
      backdropOpacity.value = 0;
      cardScale.value = 0;
      cardRotation.value = -10;
      glowOpacity.value = 0;
      titleTranslateY.value = -50;
      buttonOpacity.value = 0;
      setShowConfetti(false);
    }
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: cardScale.value },
      { rotate: `${cardRotation.value}deg` },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  if (!visible) return null;

  return (
    <View className="absolute inset-0 z-50">
      {/* Backdrop */}
      <Animated.View
        style={[backdropStyle, { flex: 1, backgroundColor: colors.background.overlay }]}
        className="absolute inset-0"
      />

      {/* Confetti */}
      <ConfettiExplosion active={showConfetti} intensity="explosion" />

      {/* Content */}
      <View className="flex-1 items-center justify-center px-6">
        {/* Title */}
        <Animated.View style={titleStyle} className="items-center mb-8">
          <MaterialCommunityIcons
            name="trophy"
            size={48}
            color={colors.accent.gold}
          />
          <Text
            className="font-black text-center mt-2"
            style={{
              fontSize: 48,
              color: colors.accent.gold,
              textShadowColor: colors.accent.gold,
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 20,
            }}
          >
            CHAMPION!
          </Text>
        </Animated.View>

        {/* Winning Card */}
        <Animated.View style={cardStyle} className="items-center">
          {/* Gold Glow Behind Card */}
          <Animated.View
            style={[
              glowStyle,
              {
                position: 'absolute',
                width: SCREEN_WIDTH * 0.8,
                height: SCREEN_WIDTH * 0.8,
                borderRadius: 20,
                backgroundColor: colors.accent.gold,
                shadowColor: colors.accent.gold,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 1,
                shadowRadius: 50,
              },
            ]}
          />

          {/* Card Frame */}
          <View
            style={{
              width: SCREEN_WIDTH * 0.75,
              borderRadius: 16,
              borderWidth: 4,
              borderColor: colors.accent.gold,
              backgroundColor: colors.background.secondary,
              overflow: 'hidden',
            }}
          >
            {/* Meme Image */}
            {memeUrl ? (
              <Image
                source={{ uri: memeUrl }}
                style={{ width: '100%', aspectRatio: 1 }}
                resizeMode="cover"
              />
            ) : (
              <View
                style={{
                  width: '100%',
                  aspectRatio: 1,
                  backgroundColor: colors.background.tertiary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MaterialCommunityIcons
                  name="image"
                  size={64}
                  color={colors.text.muted}
                />
              </View>
            )}

            {/* Caption */}
            {prompt && (
              <View className="p-4 bg-background-secondary">
                <Text className="text-white text-center text-lg font-bold">
                  "{prompt}"
                </Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Winner Name */}
        <Text className="text-white text-2xl font-black mt-6">
          {winnerName} <Text className="text-accent-gold">WINS!</Text>
        </Text>

        {/* Continue Button */}
        <Animated.View style={buttonStyle} className="mt-8 w-full">
          <GameButton
            label="NEXT ROUND"
            variant="primary"
            size="xl"
            glow
            onPress={onContinue}
          />
        </Animated.View>
      </View>
    </View>
  );
}
